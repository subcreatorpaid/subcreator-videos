#!/usr/bin/env python3
"""Daily health check of the live website (run by .github/workflows/site-health.yml, no Claude tokens).

  python3 scripts/site_health.py [--site https://subcreatorpaid.com] [--shots health-out]

Checks: every sitemap page loads, internal + external links, images/logos, /go/ affiliate links,
AI finder, sign-up form (test path: honeypot field, so nothing is written to the list), comments API,
SSL certificate, security headers, speed, mobile layout (iPhone size, screenshots of failing pages).
Writes health-out/report.md. Exit 1 if any ERROR.
"""
import json
import pathlib
import re
import socket
import ssl
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from html.parser import HTMLParser

ROOT = pathlib.Path(__file__).resolve().parent.parent
arg = lambda n, d: sys.argv[sys.argv.index(n) + 1] if n in sys.argv else d
SITE = arg("--site", "https://subcreatorpaid.com").rstrip("/")
OUT = pathlib.Path(arg("--shots", "health-out"))
HOST = urllib.parse.urlparse(SITE).hostname
UA = {"user-agent": "Mozilla/5.0 (compatible; scp-health/1.0; +https://subcreatorpaid.com)"}
errors, warnings, facts = [], [], []
err, warn = errors.append, warnings.append


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):
        return None


class Dead:
    status, headers = 0, {}

    def __init__(self, e, t):
        self.error, self.t = str(e)[:80], t

    def read(self):
        return b""


def fetch(url, method="GET", body=None, follow=True, timeout=20, headers=None):
    req = urllib.request.Request(url, method=method, data=body, headers=dict(UA, **(headers or {})))
    opener = urllib.request.build_opener() if follow else urllib.request.build_opener(NoRedirect)
    t = time.time()
    try:
        r = opener.open(req, timeout=timeout)
    except urllib.error.HTTPError as e:
        r = e
    except Exception as e:  # DNS, timeout, TLS
        return Dead(e, time.time() - t)
    r.t, r.error = time.time() - t, ""
    return r


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links, self.imgs, self.title, self._t, self.viewport = set(), set(), "", False, False

    def handle_starttag(self, tag, a):
        a = dict(a)
        if tag == "a" and a.get("href"):
            self.links.add(a["href"])
        elif tag == "img" and a.get("src"):
            self.imgs.add(a["src"])
        elif tag == "link" and a.get("href") and "icon" in (a.get("rel") or ""):
            self.imgs.add(a["href"])
        elif tag == "meta" and a.get("property") == "og:image" and a.get("content"):
            self.imgs.add(a["content"])
        elif tag == "meta" and a.get("name") == "viewport":
            self.viewport = True
        elif tag == "title":
            self._t = True

    def handle_data(self, d):
        if self._t:
            self.title += d

    def handle_endtag(self, tag):
        if tag == "title":
            self._t = False


def sitemap_pages():
    r = fetch(SITE + "/sitemap.xml")
    if r.status != 200:
        err(f"sitemap.xml: HTTP {r.status} {getattr(r, 'error', '')}")
        return [SITE + "/"]
    urls = re.findall(r"<loc>\s*([^<\s]+)\s*</loc>", r.read().decode("utf8", "replace"))
    return sorted({SITE + urllib.parse.urlparse(u).path for u in urls} | {SITE + "/"})


def many(urls, fn):
    urls = sorted(urls)
    with ThreadPoolExecutor(8) as ex:
        return dict(zip(urls, ex.map(fn, urls)))


def where(items, u):
    return ", ".join(sorted({p for x, p in items if x == u})[:3])


def check_pages(pages):
    internal, external, images = set(), set(), set()

    def one(u):
        r = fetch(u)
        return r.status, r.error, r.t, (r.read().decode("utf8", "replace") if r.status == 200 else "")

    for u, (status, e, t, html) in many(pages, one).items():
        path = u.replace(SITE, "") or "/"
        if status != 200:
            err(f"page {path}: HTTP {status} {e}")
            continue
        if t > 3:
            warn(f"page {path}: slow ({t:.1f}s)")
        p = Page()
        p.feed(html)
        if not p.title.strip():
            warn(f"page {path}: no <title>")
        if not p.viewport:
            err(f"page {path}: no mobile viewport tag")
        for l in p.links:
            if l.startswith(("#", "mailto:", "tel:", "javascript:", "data:")):
                continue
            full = urllib.parse.urljoin(u, l).split("#")[0]
            (internal if urllib.parse.urlparse(full).hostname in (HOST, "www." + HOST) else external).add((full, path))
        for i in p.imgs:
            if not i.startswith("data:"):
                images.add((urllib.parse.urljoin(u, i), path))
    facts.append(f"{len(pages)} pages, {len(internal)} internal and {len(external)} external links, {len(images)} images")
    return internal, external, images


def check_links(internal, external, images):
    for u, s in many({u for u, _ in internal}, lambda u: fetch(u)).items():
        if s.status not in (200, 301, 302, 307, 308):
            err(f"broken internal link {u.replace(SITE, '')} -> HTTP {s.status} {s.error} (on {where(internal, u)})")

    for u, s in many({u for u, _ in images}, lambda u: fetch(u)).items():
        ct = s.headers.get("content-type") or ""
        if s.status != 200 or not (ct.startswith("image") or u.endswith((".svg", ".ico"))):
            err(f"broken image {u.replace(SITE, '')} -> HTTP {s.status} {ct} {s.error} (on {where(images, u)})")

    # third-party sites often block bots: only 404/410/DNS failures are errors, the rest are warnings
    for u, s in many({u for u, _ in external}, lambda u: fetch(u, timeout=25)).items():
        if s.status in (404, 410) or (s.status == 0 and "Name or service" in s.error):
            err(f"broken external link {u} -> HTTP {s.status} {s.error} (on {where(external, u)})")
        elif s.status == 0 or s.status >= 500:
            warn(f"external link {u} not reachable now (HTTP {s.status}) (on {where(external, u)})")


def check_go():
    progs = json.loads((ROOT / "site/data/links.json").read_text()).get("programs", [])
    for p in progs:
        want = p.get("referral_url") or p.get("official_url")
        r = fetch(f"{SITE}/go/{p['id']}", follow=False)
        loc = r.headers.get("location", "")
        if r.status not in (301, 302, 307, 308) or loc.rstrip("/") != want.rstrip("/"):
            err(f"/go/{p['id']}: HTTP {r.status} -> {loc or 'no redirect'} (want {want})")
            continue
        t = fetch(loc, timeout=25)
        if t.status in (404, 410) or (t.status == 0 and "Name or service" in t.error):
            err(f"/go/{p['id']} lands on a dead page: {loc} (HTTP {t.status})")
    facts.append(f"{len(progs)} affiliate /go links")


def post(path, obj):
    return fetch(SITE + path, "POST", json.dumps(obj).encode(), headers={"content-type": "application/json"})


def check_apis():
    r = post("/api/finder", {"text": "I post cooking reels", "followers": "0", "platform": "ig", "enjoy": "film"})
    if r.status != 200:
        err(f"AI finder: HTTP {r.status}")
    else:
        j = json.loads(r.read() or b"{}")
        if not j.get("matches"):
            err("AI finder: returned no matches")
        elif not j.get("ai"):
            warn(f"AI finder: AI not used (engine={j.get('engine')}); fallback served")
    # Sign-up test path: the honeypot field "company" makes the API answer OK without saving anything.
    r = post("/api/subscribe", {"email": "health-check@example.com", "first": "", "company": "health-check"})
    if r.status != 200 or not json.loads(r.read() or b"{}").get("ok"):
        err(f"sign-up form endpoint: HTTP {r.status}")
    r = post("/api/subscribe", {"email": "not-an-email"})  # must reject bad input, saves nothing
    if r.status != 400:
        err(f"sign-up form: bad email should give HTTP 400, got {r.status}")
    r = fetch(SITE + "/api/comments?page=ugc")
    if r.status != 200:
        err(f"comments API: HTTP {r.status}")
    r = fetch(SITE + "/files/small-creator-income-guide.pdf")
    if r.status != 200 or "pdf" not in (r.headers.get("content-type") or ""):
        err(f"free guide PDF: HTTP {r.status}")
    facts.append("finder, sign-up endpoint, comments API, guide PDF")


def check_ssl():
    try:
        with socket.create_connection((HOST, 443), timeout=15) as s, ssl.create_default_context().wrap_socket(s, server_hostname=HOST) as t:
            exp = datetime.strptime(t.getpeercert()["notAfter"], "%b %d %H:%M:%S %Y %Z").replace(tzinfo=timezone.utc)
        days = (exp - datetime.now(timezone.utc)).days
        facts.append(f"SSL valid, {days} days left")
        if days < 7:
            err(f"SSL certificate expires in {days} days")
        elif days < 21:
            warn(f"SSL certificate expires in {days} days")
    except Exception as e:
        err(f"SSL check failed: {str(e)[:100]}")
    r = fetch(SITE.replace("https://", "http://") + "/", follow=False)
    if r.status not in (301, 302, 307, 308):
        warn(f"http:// does not redirect to https (HTTP {r.status})")
    h = fetch(SITE + "/").headers
    for n in ["content-security-policy", "strict-transport-security", "x-frame-options", "x-content-type-options", "referrer-policy"]:
        if not h.get(n):
            err(f"missing security header {n}")


def check_browser(pages):
    """Phone-size load of the key pages: sideways overflow, JS errors, failed requests, broken images, speed."""
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        warn("playwright not installed: mobile layout check skipped")
        return
    OUT.mkdir(exist_ok=True)
    key = ("/", "/streams/", "/tools/", "/tracker/", "/blog/", "/about/", "/links/")
    keys = [p for p in pages if urllib.parse.urlparse(p).path in key] or pages[:6]
    times = []
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        ctx = b.new_context(**pw.devices["iPhone 13"])
        for u in keys:
            path = urllib.parse.urlparse(u).path
            pg, bad, js, fail = ctx.new_page(), [], [], []
            pg.on("requestfailed", lambda rq: bad.append(rq.url))
            pg.on("response", lambda rs: bad.append(f"{rs.status} {rs.url}") if rs.status >= 400 else None)
            pg.on("pageerror", lambda e: js.append(str(e)[:120]))
            try:
                t = time.time()
                pg.goto(u, wait_until="load", timeout=45000)
                times.append((path, time.time() - t))
                pg.wait_for_timeout(800)
                over = pg.evaluate("document.documentElement.scrollWidth - window.innerWidth")
                if over > 2:
                    fail.append(f"mobile {path}: page is {over}px wider than the phone screen")
                for s in pg.evaluate("[...document.images].filter(i=>i.complete&&i.naturalWidth===0&&i.src).map(i=>i.src)"):
                    fail.append(f"mobile {path}: image did not render: {s}")
            except Exception as e:
                fail.append(f"mobile {path}: did not load ({str(e)[:100]})")
            fail += [f"mobile {path}: failed request {x}" for x in bad if HOST in x]
            fail += [f"mobile {path}: JavaScript error: {x}" for x in js]
            if fail:
                for f in fail:
                    err(f)
                try:
                    pg.screenshot(path=str(OUT / ((re.sub(r"\W+", "_", path).strip("_") or "home") + ".png")))
                except Exception:
                    pass
            pg.close()
        b.close()
    if times:
        facts.append(f"phone load avg {sum(t for _, t in times) / len(times):.1f}s over {len(times)} pages")
        for path, t in times:
            if t > 8:
                err(f"speed {path}: {t:.1f}s to load on phone")
            elif t > 4:
                warn(f"speed {path}: {t:.1f}s to load on phone")


def main():
    pages = sitemap_pages()
    internal, external, images = check_pages(pages)
    check_links(internal, external, images)
    check_go()
    check_apis()
    check_ssl()
    check_browser(pages)
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    lines = [f"# Website health {now}", "", f"**{'FAIL' if errors else 'PASS'}**: {len(errors)} error(s), {len(warnings)} warning(s)", ""]
    lines += [f"- :x: {e}" for e in errors] + [f"- :warning: {w}" for w in warnings]
    lines += ["", "Checked: " + "; ".join(facts)]
    OUT.mkdir(exist_ok=True)
    (OUT / "report.md").write_text("\n".join(lines) + "\n")
    print("\n".join(lines))
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
