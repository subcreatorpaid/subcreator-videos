#!/usr/bin/env python3
"""Guard checks for Sub-Creator Paid.

  python3 scripts/guard.py            # repo checks, prints errors + warnings
  python3 scripts/guard.py --strict   # exit 1 on any error (use before every commit/release)
  python3 scripts/guard.py --live     # also check the live website (pages, /go links, headers, finder)

Errors block a release. Warnings are nudges (e.g. a fact checked 31-45 days ago).
"""
import datetime as dt
import json
import pathlib
import re
import subprocess
import sys
import urllib.error
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = "https://subcreatorpaid.com"
TODAY = dt.date.today()
NEVER = ["hack", "quit your job", "bro", "guaranteed", "get rich", "passive income guaranteed", "crypto", "forex", "trading signals"]
EMOJI = re.compile("[\U0001F300-\U0001FAFF\U00002600-\U000027BF\U0001F1E6-\U0001F1FF]")
SECRET = re.compile(r"(sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----|xox[bap]-[A-Za-z0-9-]{10,})")
errors, warnings = [], []


def err(m): errors.append(m)
def warn(m): warnings.append(m)


def load(p):
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except Exception as e:  # noqa: BLE001
        err(f"{p.relative_to(ROOT)}: invalid JSON ({e})")
        return None


def strings(o):
    if isinstance(o, str):
        yield o
    elif isinstance(o, dict):
        for v in o.values():
            yield from strings(v)
    elif isinstance(o, list):
        for v in o:
            yield from strings(v)


def age(d):
    try:
        return (TODAY - dt.date.fromisoformat(str(d)[:10])).days
    except ValueError:
        return None


def check_brain():
    for p in sorted((ROOT / "brain").glob("*.json")):
        load(p)
    st = load(ROOT / "brain/status.json") or {}
    if len(st.get("today", [])) > 3:
        err("brain/status.json: more than 3 to-dos in 'today'")
    wp = load(ROOT / "brain/week-plan.json") or {}
    flow = ["drafted", "approved", "rendered", "checked", "scheduled", "posted", "skipped", "cancelled"]
    posts = wp.get("posts", [])
    for x in posts:
        if x.get("status") not in flow:
            err(f"week-plan post {x.get('n')}: unknown status {x.get('status')!r}")
    tools = [x for x in posts if x.get("type") == "tool"]
    if len(tools) > 3:
        err(f"week-plan: {len(tools)} tool videos (max 3)")


def check_links():
    data = load(ROOT / "site/data/links.json") or {}
    ids = set()
    for p in data.get("programs", []):
        pid = p.get("id", "?")
        ids.add(pid)
        for k in ("id", "name", "official_url", "checked"):
            if not p.get(k):
                err(f"links.json {pid}: missing {k}")
        ref = p.get("referral_url", "")
        if ref and not ref.startswith("https://"):
            err(f"links.json {pid}: referral_url must be https")
        if p.get("pays_you") and not p.get("earns"):
            warn(f"links.json {pid}: pays_you but 'earns' is empty")
        a = age(p.get("checked"))
        if a is not None and a > 90:
            warn(f"links.json {pid}: terms checked {a} days ago")
    return data


def check_streams():
    for p in sorted((ROOT / "site/data/streams").glob("*.json")):
        s = load(p) or {}
        name = p.name
        if not s.get("sources"):
            err(f"{name}: no sources")
        a = age(s.get("checked"))
        if a is None:
            err(f"{name}: missing/invalid checked date")
        elif a > 45:
            err(f"{name}: facts checked {a} days ago (re-verify)")
        elif a > 30:
            warn(f"{name}: facts checked {a} days ago")
        if s.get("needs_recheck"):
            warn(f"{name}: marked needs_recheck")


def check_videos(links):
    raw_refs = [p.get("referral_url") for p in links.get("programs", []) if p.get("referral_url")]
    for spec in sorted((ROOT / "videos").glob("*/spec.json")):
        if spec.parent.name.startswith("_"):
            continue
        s = load(spec)
        if s is None:
            continue
        text = " ".join(strings(s))
        low = text.lower()
        rel = spec.parent.name
        for w in NEVER:
            if re.search(r"\b" + re.escape(w) + r"\b", low):
                err(f"videos/{rel}: never-list word {w!r}")
        if EMOJI.search(text):
            err(f"videos/{rel}: emoji in on-screen/spoken text")
        for r in raw_refs:
            if r and r in text:
                err(f"videos/{rel}: raw affiliate URL; use subcreatorpaid.com/go/<id>")
        if "/go/" in low and "affiliate" not in low:
            err(f"videos/{rel}: affiliate CTA without an 'affiliate' disclosure")
        if s.get("renderer") == "animator":
            check_animator_rules(s, rel)
        cap = spec.parent / "captions.md"
        if cap.exists():
            ct = cap.read_text()
            for r in raw_refs:
                if r and r in ct:
                    err(f"videos/{rel}/captions.md: raw affiliate URL; use subcreatorpaid.com/go/<id>")
            secs = re.split(r"^## ", ct, flags=re.M)
            for sec in secs:
                name = sec.split("\n", 1)[0].strip()
                if name in ("Instagram", "TikTok", "YouTube Shorts") and "Tools I use (affiliate links" not in sec:
                    warn(f"videos/{rel}/captions.md: {name} has no 'Tools I use' block (python3 scripts/tools_block.py --apply)")
                if "/go/" in sec and "commission" not in sec.lower():
                    err(f"videos/{rel}/captions.md: {name} has a /go/ link without a disclosure")


def check_animator_rules(s, rel):
    """docs/animator-rules.md: the parts of rules v4 a spec can break."""
    beats = s.get("beats", [])
    punches = sum(len(b.get("punch", [])) for b in beats)
    if punches > 4:
        warn(f"videos/{rel}: {punches} punch words (M4: 3-4 per video)")
    holds = sum(1 for b in beats if b.get("hold"))
    if holds > 3:
        warn(f"videos/{rel}: {holds} beats with a hold (P2: only the 2-3 key lines)")
    if sum(1 for b in beats if b.get("riser")) > 1:
        warn(f"videos/{rel}: more than one riser (A4)")
    cap = 1.12 if s.get("style") == "story" else 1.05
    if (s.get("audio") or {}).get("speed", 0.95) > cap:
        warn(f"videos/{rel}: voice speed above {cap} (P5)")
    if len(s.get("hooks", [])) < 3:
        warn(f"videos/{rel}: fewer than 3 hook variants in 'hooks' (H3)")


def check_virality():
    import importlib.util
    spec = importlib.util.spec_from_file_location("virality", ROOT / "scripts/virality.py"); v = importlib.util.module_from_spec(spec); spec.loader.exec_module(v)
    for p in sorted((ROOT / "videos").glob("*/spec.json")):
        if p.parent.name.startswith("_"):
            continue
        sp = json.loads(p.read_text())
        if sp.get("style") == "story":  # the scorer reads the old view types; story scenes time several items per line
            continue
        s, notes, _ = v.score(sp)
        if s < 60:
            err(f"videos/{p.parent.name}: virality score {s}/100 (min 60): " + "; ".join(notes[:3]))
        elif s < 75:
            warn(f"videos/{p.parent.name}: virality score {s}/100: " + "; ".join(notes[:2]))


def check_secrets():
    skip = {".git", "models", "_site", "node_modules", "out"}
    for p in ROOT.rglob("*"):
        if p.is_dir() or any(part in skip for part in p.parts) or p.suffix.lower() in {".png", ".jpg", ".mp4", ".mp3", ".ttf", ".otf", ".woff2", ".onnx", ".bin", ".zip"}:
            continue
        try:
            t = p.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        if SECRET.search(t):
            err(f"possible secret in {p.relative_to(ROOT)}")


def check_build():
    r = subprocess.run([sys.executable, str(ROOT / "site/build.py")], capture_output=True, text=True)
    if r.returncode:
        err("site/build.py failed: " + (r.stderr or r.stdout)[-400:])


def fetch(url, method="GET", body=None, follow=True):
    req = urllib.request.Request(url, method=method, data=body, headers={"user-agent": "scp-guard/1.0", "content-type": "application/json"})
    opener = urllib.request.build_opener() if follow else urllib.request.build_opener(NoRedirect)
    try:
        return opener.open(req, timeout=20)
    except urllib.error.HTTPError as e:
        return e


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):
        return None


def check_live(links):
    for path in ["/", "/streams/", "/tools/", "/tracker/", "/blog/", "/about/", "/disclosure/", "/privacy/", "/terms/", "/sitemap.xml", "/robots.txt"]:
        r = fetch(SITE + path)
        if r.status != 200:
            err(f"live {path}: HTTP {r.status}")
        if path == "/":
            for h in ["content-security-policy", "strict-transport-security", "x-frame-options", "x-content-type-options", "referrer-policy"]:
                if not r.headers.get(h):
                    err(f"live: missing header {h}")
    for p in links.get("programs", []):
        want = p.get("referral_url") or p.get("official_url")
        r = fetch(f"{SITE}/go/{p['id']}", follow=False)
        loc = r.headers.get("location", "")
        if r.status not in (301, 302, 307, 308) or loc.rstrip("/") != want.rstrip("/"):
            err(f"live /go/{p['id']}: {r.status} -> {loc or 'no redirect'} (want {want})")
    r = fetch(SITE + "/api/finder", "POST", json.dumps({"text": "I post cooking reels", "followers": "0", "platform": "ig", "enjoy": "film"}).encode())
    if r.status != 200:
        err(f"live /api/finder: HTTP {r.status}")
    else:
        j = json.loads(r.read() or b"{}")
        if len(j.get("matches", [])) < 1:
            err("live /api/finder: no matches")
        elif not j.get("ai"):
            warn(f"live /api/finder: AI not used (engine={j.get('engine')}); rules fallback served")
    r = fetch(SITE + "/api/comments?page=ugc")
    if r.status != 200:
        err(f"live /api/comments: HTTP {r.status}")


def main():
    live = "--live" in sys.argv
    check_brain()
    links = check_links()
    check_streams()
    check_videos(links)
    check_virality()
    check_secrets()
    check_build()
    if live:
        check_live(links)
    for w in warnings:
        print("WARN ", w)
    for e in errors:
        print("ERROR", e)
    print(f"guard: {len(errors)} error(s), {len(warnings)} warning(s){' (live checked)' if live else ''}")
    if errors and "--strict" in sys.argv:
        sys.exit(1)


if __name__ == "__main__":
    main()
