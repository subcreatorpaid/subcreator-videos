#!/usr/bin/env python3
"""Build the Control Room dashboard from the brain files.

  python3 dashboard/build.py   -> dashboard/out/index.html  (the secretary publishes it as the Control Room artifact)

Only real data from brain/*.json and site/data/links.json. Missing numbers show as "no data yet", never invented.
"""
import datetime as dt
import html
import json
import pathlib
from zoneinfo import ZoneInfo

ROOT = pathlib.Path(__file__).resolve().parent.parent
B = ROOT / "brain"
OUT = ROOT / "dashboard/out"
LDN = ZoneInfo("Europe/London")
NOW = dt.datetime.now(LDN)
E = lambda s: html.escape(str(s if s is not None else ""), quote=True)  # noqa: E731


def J(p, default=None):
    try:
        return json.loads((ROOT / p).read_text(encoding="utf-8"))
    except Exception:  # noqa: BLE001
        return default if default is not None else {}


def day(d):
    try:
        x = dt.date.fromisoformat(str(d)[:10])
        return x.strftime("%a ") + str(x.day) + x.strftime(" %b")
    except ValueError:
        return str(d)


status, goals, week = J("brain/status.json"), J("brain/goals.json"), J("brain/week-plan.json")
links = {p["id"]: p for p in J("site/data/links.json", {"programs": []}).get("programs", [])}
log_lines = [l for l in (B / "log.md").read_text(encoding="utf-8").splitlines() if l[:2] == "20"][-6:][::-1] if (B / "log.md").exists() else []

STATUS_CHIP = {"drafted": "wait", "approved": "info", "rendered": "info", "checked": "info", "scheduled": "ok", "posted": "ok", "skipped": "mute",
               "live": "ok", "in review": "wait", "waiting owner": "wait", "later": "mute", "ok": "ok", "fail": "bad"}
chip = lambda text, kind=None: f'<span class="chip {kind or STATUS_CHIP.get(str(text).lower(), "mute")}">{E(text)}</span>'  # noqa: E731

today_items = status.get("today", [])[:3]
mins = sum(int(t.get("mins") or 0) for t in today_items)
approvals = status.get("approvals", [])
alerts = status.get("alerts", [])
posts = week.get("posts", [])
today_iso = NOW.date().isoformat()
going = [p for p in posts if p.get("day") == today_iso]
counts = {}
for p in posts:
    counts[p.get("status")] = counts.get(p.get("status"), 0) + 1
latest = goals.get("latest", {})
followers = sum(int(latest.get(k) or 0) for k in ("instagram", "tiktok"))
goal_n = 10000
pct = min(100, followers / goal_n * 100)
posted = counts.get("posted", 0)

if approvals:
    head = f'{E(approvals[0]["what"])} <span class="hl">waiting for your OK</span>'
    top = chip(f"{len(approvals)} waiting for you", "wait")
elif alerts:
    head = f'{len(alerts)} thing{"s" if len(alerts) > 1 else ""} to <span class="hl">look at</span>'
    top = chip("Check alerts", "bad")
else:
    head = f'Week of {E(day(week.get("week_of", "")))}: <span class="hl">{posted} of {len(posts)} posted</span>'
    top = chip("All running", "ok")

todo_html = "".join(
    f'<li><input type="checkbox" id="todo{i}" aria-label="Done: {E(t["task"])}"><label class="n" for="todo{i}"><b>{E(t["task"])}</b>'
    + (f'<a href="{E(t["link"])}" target="_blank" rel="noopener">Open</a>' if t.get("link") else "") + f'</label><span class="mins">{E(t.get("mins") or "?")} min</span></li>'
    for i, t in enumerate(today_items)) or '<li class="empty">Nothing needs you today. The team is working.</li>'

going_html = "".join(f'<p>{E(p.get("slot") or "")} {E(p["title"])} {chip(p["status"])}</p>' for p in going) or "<p>Nothing scheduled today</p>"
alert_html = "".join(f'<p>{E(a if isinstance(a, str) else a.get("text", ""))}</p>' for a in alerts) or "<p>No alerts</p>"

appr_html = "".join(
    f'<div class="appr"><div class="n"><b>{E(a["what"])}</b><span>Waiting since {E(day(a.get("since", "")))}. Say in Claude: <code id="say{i}">{E(a.get("say", "approve"))}</code></span></div>'
    f'<div class="acts"><button type="button" class="copy" data-t="say{i}">Copy</button>' + (f'<a class="btn" href="{E(a["link"])}" target="_blank" rel="noopener">Review</a>' if a.get("link") else "") + "</div></div>"
    for i, a in enumerate(approvals)) or '<p class="muted">Nothing waiting for approval.</p>'

TYPE = {"value": "Value", "tool": "Tool", "proof": "Proof"}
rows = "".join(
    f'<tr><td class="d">{E(day(p["day"]))}</td><td>{chip(TYPE.get(p.get("type"), p.get("type")), "type-" + str(p.get("type")))}</td><td class="t">{E(p["title"])}'
    + (f'<span class="aff">/go/{E(p["affiliate"])}</span>' if p.get("affiliate") else "") + f'</td><td>{chip(p.get("status", ""))}</td></tr>'
    for p in posts)
pipeline = " · ".join(f'{n} {s}' for s, n in counts.items())

aff_html = "".join(
    f'<div class="row"><div class="n"><b>{E(links.get(a["id"], {}).get("name", a["id"]))}</b><span>{E(a.get("earns", ""))}</span></div>{chip(a["status"])}</div>'
    for a in status.get("affiliates", []))
web = status.get("website", {})
money = status.get("money", {})
lw = status.get("last_week")
lw_html = (f'<p>{E(lw.get("summary", ""))}</p>' + "".join(f"<li>{E(s)}</li>" for s in lw.get("suggestions", []))) if isinstance(lw, dict) else \
    '<p class="muted">The first weekly review arrives on Sunday after the first posts go out. It will show followers gained, the best and weakest post, money, and 3 suggestions.</p>'
num = lambda v, pre="": (f"{pre}{v:,}" if isinstance(v, (int, float)) else '<span class="muted">no data yet</span>')  # noqa: E731
log_html = "".join(f'<li><span class="when">{E(l.split("|")[0].strip())}</span>{E(" · ".join(x.strip() for x in l.split("|")[1:3]))}</li>' for l in log_lines)

page = f"""<title>Sub-Creator Paid Control Room</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@500;700;800;900&display=swap">
<style>
/* Layout: summary first (today, approvals), then the week's posts; side panel with affiliates, website and money */
:root{{--bg:#F6F5F1;--card:#FFFFFF;--ink:#151515;--muted:#6B6A63;--line:#E4E1DA;--soft:#EEECE6;--acc:#2E7D4F;--acc-ink:#FFFFFF;
--ok:#2E7D4F;--ok-bg:#E2F0E7;--wait:#8A5A00;--wait-bg:#FBEFD5;--bad:#A83A2C;--bad-bg:#F8E1DC;--info:#2D5B8A;--info-bg:#E2ECF6;--grid:#DCD8CF;
--font:"Inter",system-ui,-apple-system,"Segoe UI",sans-serif}}
@media (prefers-color-scheme:dark){{:root:not([data-theme="light"]){{--bg:#141513;--card:#1C1E1B;--ink:#EDEBE5;--muted:#A3A198;--line:#2E302C;--soft:#242622;--acc:#5DB585;--acc-ink:#0F1A13;
--ok:#7CCB9C;--ok-bg:#1E3427;--wait:#E7BE6A;--wait-bg:#3A2F17;--bad:#EE8F80;--bad-bg:#3D211C;--info:#8DB8E4;--info-bg:#1C2A3A;--grid:#262825;color-scheme:dark}}}}
:root[data-theme="dark"]{{--bg:#141513;--card:#1C1E1B;--ink:#EDEBE5;--muted:#A3A198;--line:#2E302C;--soft:#242622;--acc:#5DB585;--acc-ink:#0F1A13;
--ok:#7CCB9C;--ok-bg:#1E3427;--wait:#E7BE6A;--wait-bg:#3A2F17;--bad:#EE8F80;--bad-bg:#3D211C;--info:#8DB8E4;--info-bg:#1C2A3A;--grid:#262825;color-scheme:dark}}
*{{box-sizing:border-box}}
body{{background-color:var(--bg);color:var(--ink);font:500 15px/1.55 var(--font);
background-image:linear-gradient(var(--grid) 1px,transparent 1px),linear-gradient(90deg,var(--grid) 1px,transparent 1px);background-size:48px 48px}}
.wrap{{max-width:1120px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:18px 48px}}
header{{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:16px}}
.brand{{display:flex;align-items:center;gap:10px;font-weight:900;font-size:17px;margin-right:auto}}
.dot{{width:34px;height:34px;border-radius:50%;background:var(--acc);color:var(--acc-ink);display:grid;place-items:center;font-weight:900}}
h1{{font-weight:900;font-size:clamp(24px,4.6vw,36px);line-height:1.12;margin:0 0 6px;letter-spacing:-.02em;text-wrap:balance}}
.hl{{display:inline-block;background:var(--ink);color:var(--bg);padding:2px 12px 4px;border-radius:3px;font-size:.62em;vertical-align:middle}}
h2{{font-weight:800;font-size:17px;margin:0}}
.sub,.muted{{color:var(--muted)}}.sub{{margin:0 0 18px}}
.card{{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:16px;box-shadow:0 14px 34px rgba(0,0,0,.06)}}
.stack{{display:flex;flex-direction:column;gap:16px}}
.grid{{display:grid;grid-template-columns:minmax(0,1fr);gap:16px}}
@media (min-width:900px){{.grid{{grid-template-columns:minmax(0,1.65fr) minmax(0,1fr)}}}}
.top{{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin-bottom:10px}}.top .r{{margin-left:auto}}
.chip{{font-size:12px;font-weight:700;padding:4px 10px;border-radius:999px;white-space:nowrap;display:inline-block}}
.ok{{background:var(--ok-bg);color:var(--ok)}}.wait{{background:var(--wait-bg);color:var(--wait)}}.bad{{background:var(--bad-bg);color:var(--bad)}}
.info{{background:var(--info-bg);color:var(--info)}}.mute{{background:var(--soft);color:var(--muted)}}
.type-value{{background:var(--soft);color:var(--ink)}}.type-tool{{background:var(--ok-bg);color:var(--ok)}}.type-proof{{background:var(--info-bg);color:var(--info)}}
.todo{{list-style:none;margin:0;padding:0}}
.todo li{{display:flex;align-items:center;gap:12px;padding:10px 0;border-top:1px solid var(--line)}}.todo li:first-child{{border-top:0}}
.todo input{{width:22px;height:22px;accent-color:var(--acc);flex:none;margin:0}}
.todo .n{{flex:1;min-width:0;cursor:pointer}}.todo .n b{{display:block;font-weight:700}}.todo .n a{{font-size:13px;color:var(--acc);font-weight:700}}
.todo li.done .n b{{text-decoration:line-through;color:var(--muted)}}.todo .empty{{color:var(--muted)}}
.mins{{font-size:12px;font-weight:800;background:var(--ink);color:var(--bg);padding:3px 8px;border-radius:3px;flex:none}}
.brief{{display:grid;grid-template-columns:minmax(0,1fr);gap:10px;margin-top:12px}}
@media (min-width:700px){{.brief{{grid-template-columns:repeat(3,minmax(0,1fr))}}}}
.bx{{background:var(--bg);border:1px solid var(--line);border-radius:14px;padding:12px;font-size:14px;min-width:0}}
.bx h3{{font-size:12px;text-transform:uppercase;letter-spacing:.06em;margin:0 0 6px;color:var(--muted)}}.bx p{{margin:0 0 4px}}
.bx.warn{{border-color:var(--wait);background:var(--wait-bg)}}
.prog{{height:8px;border-radius:99px;background:var(--line);overflow:hidden;margin:6px 0 4px}}.prog i{{display:block;height:100%;background:var(--acc)}}
.big{{font-size:22px;font-weight:900;font-variant-numeric:tabular-nums}}
.appr{{display:flex;gap:12px;align-items:center;flex-wrap:wrap;padding:12px 0;border-top:1px solid var(--line)}}.appr:first-of-type{{border-top:0}}
.appr .n{{flex:1 1 260px;min-width:0}}.appr .n b{{display:block}}.appr .n span{{font-size:13px;color:var(--muted)}}
code{{font:700 13px/1.3 ui-monospace,Menlo,monospace;background:var(--soft);color:var(--ink);padding:2px 6px;border-radius:4px}}
.acts{{display:flex;gap:8px}}
button,.btn{{font:800 14px/1 var(--font);border-radius:12px;padding:11px 14px;cursor:pointer;border:1px solid var(--line);background:var(--card);color:var(--ink);text-decoration:none;display:inline-block}}
.btn{{background:var(--ink);color:var(--bg);border-color:var(--ink)}}
button:focus-visible,.btn:focus-visible,a:focus-visible,input:focus-visible{{outline:3px solid var(--acc);outline-offset:2px}}
.tbl{{overflow-x:auto}}
table{{width:100%;border-collapse:collapse;font-size:14px}}
td{{padding:9px 6px;border-top:1px solid var(--line);vertical-align:top}}tr:first-child td{{border-top:0}}
td.d{{white-space:nowrap;color:var(--muted);font-variant-numeric:tabular-nums}}td.t{{font-weight:600;width:100%}}a{{color:var(--acc)}}
@media (max-width:520px){{td{{padding:8px 3px}}td.d{{font-size:12px;white-space:normal;width:44px}}table .chip{{font-size:11px;padding:3px 7px}}}}
.aff{{display:block;font-size:12px;font-weight:500;color:var(--acc)}}
.row{{display:flex;align-items:center;gap:10px;padding:9px 0;border-top:1px solid var(--line)}}.row:first-of-type{{border-top:0}}
.row .n{{flex:1;min-width:0}}.row .n b{{display:block;font-weight:700}}.row .n span{{font-size:13px;color:var(--muted)}}
.kv{{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}}
.kv div{{background:var(--bg);border:1px solid var(--line);border-radius:12px;padding:10px}}.kv p{{margin:0}}.kv .l{{font-size:12px;color:var(--muted)}}
.log{{list-style:none;margin:0;padding:0;font-size:13px}}.log li{{padding:6px 0;border-top:1px solid var(--line)}}.log li:first-child{{border-top:0}}
.when{{color:var(--muted);font-variant-numeric:tabular-nums;margin-right:8px}}
ul.sg{{margin:6px 0 0;padding-left:18px}}
footer{{margin-top:22px;font-size:12px;color:var(--muted);text-align:center}}
@media (prefers-reduced-motion:no-preference){{button,.btn{{transition:transform .1s}}button:active{{transform:scale(.98)}}}}
</style>
<div class="wrap">
<header><div class="brand"><span class="dot">$</span>Sub-Creator Paid</div>{top}</header>
<h1>{head}</h1>
<p class="sub">Updated {E(NOW.strftime("%a ") + str(NOW.day) + NOW.strftime(" %b, %H:%M"))} London. Nothing goes live until you approve.</p>

<div class="stack">
<section class="card" aria-labelledby="h-today">
  <div class="top"><h2 id="h-today">Today, from your secretary</h2><span class="chip ok r" id="mins">{"About " + str(mins) + " min needed" if mins else "Nothing needed"}</span></div>
  <ul class="todo" id="todo">{todo_html}</ul>
  <div class="brief">
    <div class="bx"><h3>Going out today</h3>{going_html}</div>
    <div class="bx"><h3>Goal: 10k on Instagram + TikTok</h3><p class="big">{followers:,}</p><div class="prog" role="img" aria-label="{followers} of 10,000 followers"><i style="width:{pct:.1f}%"></i></div><p class="muted">Pace needed: {goals.get("weekly_pace", 780)} a week, ends {E(day(goals.get("deadline", "")))}</p></div>
    <div class="bx{" warn" if alerts else ""}"><h3>Alerts</h3>{alert_html}</div>
  </div>
</section>

<section class="card" aria-labelledby="h-appr">
  <div class="top"><h2 id="h-appr">Waiting for your OK</h2><span class="r muted" style="font-size:13px">Reply in your Claude chat with the words shown</span></div>
  {appr_html}
</section>

<div class="grid">
<main class="stack">
  <section class="card" aria-labelledby="h-week">
    <div class="top"><h2 id="h-week">Week of {E(day(week.get("week_of", "")))}</h2><span class="r muted" style="font-size:13px">{E(pipeline)}</span></div>
    <div class="tbl"><table>{rows}</table></div>
    {f'<p style="margin:10px 0 0"><a href="{E(week.get("review_doc"))}" target="_blank" rel="noopener">Open the scripts and captions</a></p>' if week.get("review_doc") else ""}
  </section>
  <section class="card" aria-labelledby="h-review">
    <div class="top"><h2 id="h-review">Last week's review</h2><span class="chip info r">From your CFO</span></div>
    {lw_html}
  </section>
  <section class="card" aria-labelledby="h-log">
    <h2 id="h-log" style="margin-bottom:8px">What the team did</h2>
    <ul class="log">{log_html}</ul>
  </section>
</main>
<aside class="stack">
  <section class="card" aria-labelledby="h-money">
    <h2 id="h-money" style="margin-bottom:10px">Money this month</h2>
    <div class="kv">
      <div><p class="l">Earned</p><p class="big">${money.get("earned_month_usd", 0):,.2f}</p></div>
      <div><p class="l">Pending payouts</p><p class="big">${money.get("pending_usd", 0):,.2f}</p></div>
      <div><p class="l">Email list</p><p class="big">{num(latest.get("email_subscribers"))}</p></div>
      <div><p class="l">Costs</p><p class="big">${money.get("costs_month_usd", 0):,.2f}</p></div>
    </div>
    <p class="muted" style="font-size:13px;margin:8px 0 0">{E(money.get("note", ""))}</p>
  </section>
  <section class="card" aria-labelledby="h-aff">
    <h2 id="h-aff" style="margin-bottom:6px">Affiliate links</h2>
    {aff_html}
  </section>
  <section class="card" aria-labelledby="h-web">
    <h2 id="h-web" style="margin-bottom:6px">Website</h2>
    <div class="row"><div class="n"><b><a href="{E(web.get("url", "https://subcreatorpaid.com"))}" target="_blank" rel="noopener">subcreatorpaid.com</a></b><span>Checked {E(day(web.get("checked", "")))}</span></div>{chip(web.get("health", "unknown"))}</div>
    <div class="row"><div class="n"><b>Comments waiting</b><span>Approved by the publisher under your weekly OK</span></div><span class="big">{web.get("pending_comments", 0)}</span></div>
  </section>
</aside>
</div>
</div>
<footer>Built from the team's brain files. Real numbers only: "no data yet" means nothing has been measured.</footer>
</div>
<script>
const todo=document.getElementById('todo'),mins=document.getElementById('mins'),K='scp-todo-{E(NOW.date().isoformat())}';
let done={{}};try{{done=JSON.parse(localStorage.getItem(K)||'{{}}')}}catch(e){{}}
function upd(){{let left=0;todo.querySelectorAll('li').forEach(li=>{{const c=li.querySelector('input');if(!c)return;li.classList.toggle('done',c.checked);if(!c.checked)left+=parseInt(li.querySelector('.mins').textContent)||0}});
if(todo.querySelector('input'))mins.textContent=left?'About '+left+' min left':'All done for today'}}
todo.querySelectorAll('input').forEach(c=>{{c.checked=!!done[c.id];c.addEventListener('change',()=>{{done[c.id]=c.checked;try{{localStorage.setItem(K,JSON.stringify(done))}}catch(e){{}};upd()}})}});upd();
document.querySelectorAll('.copy').forEach(b=>b.addEventListener('click',()=>{{const el=document.getElementById(b.dataset.t),t=el.textContent;
const ok=()=>{{b.textContent='Copied';setTimeout(()=>b.textContent='Copy',1500)}};
const sel=()=>{{const r=document.createRange();r.selectNodeContents(el);const s=getSelection();s.removeAllRanges();s.addRange(r);b.textContent='Selected'}};
try{{navigator.clipboard.writeText(t).then(ok,sel)}}catch(e){{sel()}}}}));
</script>
"""
OUT.mkdir(parents=True, exist_ok=True)
(OUT / "index.html").write_text(page, encoding="utf-8")
print(f"built {OUT / 'index.html'} ({len(page) // 1024} KB)")
