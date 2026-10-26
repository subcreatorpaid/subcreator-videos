#!/usr/bin/env python3
"""Build the free "Small Creator Income Guide" PDF from the verified facts library.

  python3 scripts/make_guide.py   -> site/files/small-creator-income-guide.pdf  (+ .html preview next to it)

Content comes only from site/data/streams/*.json and site/data/links.json, so the guide is always in step with the
website and videos. Rebuild after any fact changes (the monthly run does this). Needs Chromium via Playwright.
"""
import datetime as dt, html, json, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUTDIR = ROOT / "site/files"; OUTDIR.mkdir(parents=True, exist_ok=True)
E = lambda s: html.escape(str(s or ""))  # noqa: E731
streams = [json.loads(p.read_text()) for p in sorted((ROOT / "site/data/streams").glob("*.json"))]
order = ["ugc", "amazon-associates", "etsy-templates", "youtube-fan-funding", "spotify-memberships"]
streams.sort(key=lambda s: order.index(s["slug"]) if s["slug"] in order else 99)
links = json.loads((ROOT / "site/data/links.json").read_text())["programs"]
progs = {p["id"]: p for p in links}
checked = max(s["checked"] for s in streams)
cd = dt.date.fromisoformat(checked); checked_h = f"{cd.day} {cd.strftime('%b %Y')}"
edition = cd.strftime("%B %Y")
F = (ROOT / "fonts").as_uri()

css = f"""
@font-face{{font-family:I;font-weight:500;src:url({F}/Inter-Medium.otf)}}
@font-face{{font-family:I;font-weight:700;src:url({F}/Inter-Bold.otf)}}
@font-face{{font-family:I;font-weight:800;src:url({F}/Inter-ExtraBold.otf)}}
@font-face{{font-family:I;font-weight:900;src:url({F}/Inter-Black.otf)}}
@page{{size:A4;margin:16mm 16mm 18mm}}
*{{box-sizing:border-box}}
body{{font:500 10.5pt/1.55 I,Arial,sans-serif;color:#151515;margin:0}}
h1,h2,h3{{margin:0;letter-spacing:-.02em}}
h2{{font-weight:900;font-size:24pt;line-height:1.1;margin-bottom:8pt}}
h3{{font-weight:800;font-size:12pt;margin:14pt 0 4pt}}
p{{margin:0 0 7pt}}
.page{{page-break-after:always}}
.eyebrow{{font:800 8pt I;letter-spacing:.14em;text-transform:uppercase;color:#2E7D4F;margin-bottom:6pt}}
.cover{{height:255mm;display:flex;flex-direction:column;justify-content:space-between;padding:14mm 12mm;border:2.2pt solid #151515;border-radius:10pt;
  background:#F6F5F1;background-image:linear-gradient(#E2DFD7 1px,transparent 1px),linear-gradient(90deg,#E2DFD7 1px,transparent 1px);background-size:9mm 9mm}}
.cover h1{{font-weight:900;font-size:44pt;line-height:1.02}} .cover h1 em{{font-style:normal;color:#2E7D4F}}
.box{{display:inline-block;background:#151515;color:#fff;font-weight:800;font-size:13pt;padding:5pt 12pt;border-radius:3pt;margin-top:12pt}}
.brand{{display:flex;align-items:center;gap:8pt;font-weight:900;font-size:13pt}}
.dot{{width:24pt;height:24pt;border-radius:50%;background:#2E7D4F;color:#fff;display:grid;place-items:center;font-weight:900}}
table{{width:100%;border-collapse:collapse;font-size:9.5pt;margin-top:6pt}}
th{{text-align:left;font-weight:800;border-bottom:1.5pt solid #151515;padding:6pt 5pt}}
td{{border-bottom:.6pt solid #E2DFD7;padding:7pt 5pt;vertical-align:top}}
.facts{{display:grid;grid-template-columns:1fr 1fr;gap:8pt;margin:10pt 0}}
.fact{{border:1.4pt solid #151515;border-radius:8pt;padding:8pt 10pt;box-shadow:3pt 3pt 0 #151515;background:#fff}}
.fact b{{display:block;font-size:7.5pt;letter-spacing:.12em;text-transform:uppercase;color:#5F5E58;margin-bottom:2pt}}
.catch{{background:#E3F0E7;border-left:4pt solid #2E7D4F;padding:8pt 10pt;border-radius:4pt;margin:10pt 0}}
ol,ul{{margin:4pt 0 8pt 16pt;padding:0}} li{{margin:3pt 0}}
.src{{font-size:8.5pt;color:#5F5E58;word-break:break-all}}
.tag{{font-size:7.5pt;font-weight:800;background:#E3F0E7;color:#2E7D4F;padding:1pt 5pt;border-radius:6pt;margin-left:4pt}}
.note{{font-size:8.5pt;color:#5F5E58}}
"""

def stream_page(s, n):
    tools = [progs[t] for t in s.get("tools", []) if t in progs]
    tool_html = "".join(f'<li><b>{E(t["name"])}</b>: {E(t["for"])} <span class="src">subcreatorpaid.com/go/{E(t["id"])}</span>'
                        + ('<span class="tag">affiliate</span>' if t.get("pays_you") and t.get("referral_url") else "") + "</li>" for t in tools)
    return f"""<section class="page">
<p class="eyebrow">Income stream {n}</p><h2>{E(s["title"])}</h2><p style="font-size:12pt">{E(s["one_liner"])}</p>
<div class="facts"><div class="fact"><b>Followers needed</b>{E(s["followers"])}</div><div class="fact"><b>What it pays</b>{E(s["pay"])}</div></div>
<h3>How to start</h3><ol>{"".join(f"<li>{E(x)}</li>" for x in s["steps"])}</ol>
<div class="catch"><b>The catch:</b> {E(s["catch"])}</div>
<h3>Great for</h3><p>{E(", ".join(s.get("great_for", [])))}</p>
{f"<h3>Tools that help</h3><ul>{tool_html}</ul>" if tool_html else ""}
<h3>Sources</h3>{"".join(f'<p class="src">{E(t)}: {E(u)}</p>' for t, u in s["sources"])}
<p class="note">Checked {E(s["checked"])}. Rules and pay change: check the official page before you rely on a number.</p>
<p class="note">Full page: subcreatorpaid.com/streams/{E(s["slug"])}/</p></section>"""

glance = "".join(f'<tr><td><b>{E(s["title"])}</b></td><td>{E(s.get("start") or s["followers"])}</td><td>{E(s.get("pay_short",""))} {E(s.get("pay_unit",""))}</td><td>{E(s["match"]["first_step"])}</td></tr>' for s in streams)
tool_rows = "".join(f'<tr><td><b>{E(p["name"])}</b>{"<span class=tag>affiliate</span>" if p.get("referral_url") else ""}</td><td>{E(p["for"])}</td>'
                    f'<td>{"Yes" if p.get("free_plan") else "No"}</td><td class="src">subcreatorpaid.com/go/{E(p["id"])}</td></tr>' for p in links)

doc = f"""<!doctype html><html><head><meta charset="utf-8"><title>The Small Creator Income Guide</title><style>{css}</style></head><body>
<section class="page"><div class="cover">
 <div class="brand"><span class="dot">$</span>Sub-Creator Paid</div>
 <div><p class="eyebrow">Free guide · {E(edition)} edition</p><h1>The Small Creator<br><em>Income Guide</em></h1>
 <div class="box">Every way to get paid under 10k followers</div>
 <p style="margin-top:14pt;font-size:12pt;max-width:120mm">{len(streams)} verified income streams: what each one pays, what it needs, the catch, and your first steps. Facts checked {E(checked_h)}.</p></div>
 <p class="note">subcreatorpaid.com · @subcreatorpaid on Instagram, TikTok and YouTube</p></div></section>

<section class="page"><p class="eyebrow">Start here</p><h2>You don't need 10,000 followers to get paid.</h2>
<p>Most income advice assumes a big audience. This guide covers the streams that pay small creators: some need no followers at all, some need a few hundred.
Every number comes from the official page or a named source, with the date we checked it.</p>
<h3>How to use it</h3><ol><li>Read the table below and pick <b>one</b> stream that fits what you already make.</li>
<li>Do its first step this week. One stream done well beats five started.</li><li>Check the official page before you rely on any number. Programs change their rules.</li></ol>
<h3>At a glance</h3><table><tr><th>Stream</th><th>To start</th><th>Pays</th><th>First step</th></tr>{glance}</table>
<p class="note" style="margin-top:10pt">Pay figures are typical ranges or labelled examples, never promises. Nothing here is financial, legal or tax advice.</p></section>

{"".join(stream_page(s, i + 1) for i, s in enumerate(streams))}

<section class="page"><p class="eyebrow">Tools</p><h2>Tools that help small creators</h2>
<p>Free plans first. Links marked <span class="tag">affiliate</span> are referral links: if you sign up, we may earn a commission at no extra cost to you. It never changes what we recommend.</p>
<table><tr><th>Tool</th><th>Use it for</th><th>Free plan</th><th>Link</th></tr>{tool_rows}</table>
<h3>Disclose your own links</h3><p>When you earn from a link, say so where people will see it (FTC, Disclosures 101 for Social Media Influencers):</p>
<ul><li>Put the disclosure in the post itself, not only in your bio or behind "more".</li><li>In videos, say it and show it on screen.</li>
<li>Use clear words like "ad" or "sponsored". Skip "sp", "spon" and "collab".</li></ul><p class="note">General information, not legal advice.</p></section>

<section><p class="eyebrow">Your first week</p><h2>A 7-day starter plan</h2>
<table><tr><th>Day</th><th>Do this</th></tr>
<tr><td>1</td><td>Pick one stream from the table. Open its official page and read the rules yourself.</td></tr>
<tr><td>2</td><td>Do the stream's first step (a sample, an application, a first listing or episode).</td></tr>
<tr><td>3</td><td>Set up a simple link-in-bio and a free email sign-up, so new followers can stay in touch.</td></tr>
<tr><td>4</td><td>Make one short video about what you are trying, and what you learned.</td></tr>
<tr><td>5</td><td>Reply to every comment. Note the questions: they are your next videos.</td></tr>
<tr><td>6</td><td>Do the second step of your stream (pitch one brand, add three links, list a second item).</td></tr>
<tr><td>7</td><td>Write down what worked and what didn't. Keep the one stream for another week before adding a second.</td></tr></table>
<h3>Keep going</h3><p>We publish one verified income stream every week, with the catch included. Website: <b>subcreatorpaid.com</b> · Instagram, TikTok and YouTube: <b>@subcreatorpaid</b> · Telegram: t.me/subcreatorpaid</p>
<p class="note" style="margin-top:14pt">© {cd.year} Sub-Creator Paid. Free to share unchanged. Contact: hello@subcreatorpaid.com. Not financial, legal or tax advice. Programs, rules and pay change: always check the official page.</p></section>
</body></html>"""

hp = OUTDIR / "small-creator-income-guide.html"; hp.write_text(doc)
from playwright.sync_api import sync_playwright  # noqa: E402
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(); pg.goto(hp.as_uri()); pg.wait_for_timeout(800)
    pg.pdf(path=str(OUTDIR / "small-creator-income-guide.pdf"), format="A4", print_background=True, prefer_css_page_size=True)
    b.close()
hp.unlink()
print("guide:", OUTDIR / "small-creator-income-guide.pdf", f"({len(streams)} streams, checked {checked})")
