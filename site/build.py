#!/usr/bin/env python3
"""Builds the Sub-Creator Paid website into site/_site/ (static HTML, no dependencies).

Data lives in site/data/:
  config.json        site name, newsletter form link, guide link, custom domain
  links.json         every program: official page, YOUR referral link (paste it in when you join), verified terms
  streams/*.json     one file per income stream (one per video) -> one page each
Run:  python site/build.py      (GitHub Actions runs it on every push and publishes to GitHub Pages)
"""
import glob, html, json, os, shutil

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "_site")
D = lambda *p: os.path.join(HERE, "data", *p)
cfg = json.load(open(D("config.json")))
progs = {p["id"]: p for p in json.load(open(D("links.json")))["programs"]}
streams = [json.load(open(f)) for f in sorted(glob.glob(D("streams", "*.json")))]
e = html.escape

CSS = """
@font-face{font-family:Inter;src:url(%(r)sstatic/Inter-Medium.otf);font-weight:500}
@font-face{font-family:Inter;src:url(%(r)sstatic/Inter-SemiBold.otf);font-weight:600}
@font-face{font-family:Inter;src:url(%(r)sstatic/Inter-Bold.otf);font-weight:700}
@font-face{font-family:Inter;src:url(%(r)sstatic/Inter-ExtraBold.otf);font-weight:800}
@font-face{font-family:Inter;src:url(%(r)sstatic/Inter-Black.otf);font-weight:900}
:root{--bg:#FBF8F3;--card:#FFFFFF;--txt:#1D2B22;--muted:#6B6455;--acc:#1F7A4D;--acc-ink:#FFFFFF;--line:#E9E3D8;--glow:#F2ECE2}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]){--bg:#121613;--card:#1B211D;--txt:#ECEFE9;--muted:#A8A293;--acc:#3FA772;--acc-ink:#0D130F;--line:#2A322C;--glow:#1F2722;color-scheme:dark}}
:root[data-theme=dark]{--bg:#121613;--card:#1B211D;--txt:#ECEFE9;--muted:#A8A293;--acc:#3FA772;--acc-ink:#0D130F;--line:#2A322C;--glow:#1F2722;color-scheme:dark}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--txt);font:500 17px/1.6 Inter,system-ui,sans-serif;
 background-image:linear-gradient(var(--line) 1px,transparent 1px),linear-gradient(90deg,var(--line) 1px,transparent 1px);background-size:44px 44px;background-attachment:fixed}
a{color:var(--acc)}a:focus-visible,.btn:focus-visible,button:focus-visible,select:focus-visible,input:focus-visible{outline:3px solid var(--acc);outline-offset:2px}
.grid>*{min-width:0}main,nav,footer{padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
main{max-width:860px;margin:0 auto;padding-block:0 64px}
nav{max-width:860px;margin:0 auto;padding-block:18px;display:flex;gap:18px;align-items:center;flex-wrap:wrap}
nav .brand{font-weight:900;color:var(--txt);text-decoration:none;display:flex;gap:10px;align-items:center;margin-right:auto}
nav .dot{width:30px;height:30px;border-radius:50%%;background:var(--acc);color:var(--acc-ink);display:grid;place-items:center;font-weight:900}
nav a{font-weight:600;text-decoration:none;color:var(--txt)}
h1{font-weight:900;font-size:clamp(34px,7vw,56px);line-height:1.05;margin:28px 0 12px;letter-spacing:-.02em}
h2{font-weight:800;font-size:26px;margin:40px 0 12px}h3{font-weight:800;margin:0 0 6px}
.lead{font-size:20px;color:var(--muted);max-width:640px}
.card{background:var(--card);border:1px solid var(--line);border-radius:22px;padding:22px;margin:14px 0;box-shadow:0 10px 30px rgba(0,0,0,.05)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px}
.grid a.card{text-decoration:none;color:inherit;display:block}.grid a.card:hover{border-color:var(--acc)}
.pill{display:inline-block;background:var(--txt);color:var(--bg);font-weight:800;padding:6px 14px;border-radius:999px;font-size:14px}
.btn{display:inline-block;background:var(--acc);color:var(--acc-ink);font-weight:800;padding:13px 22px;border-radius:14px;text-decoration:none;border:0;font-size:16px;cursor:pointer}
.facts{display:grid;grid-template-columns:150px 1fr;gap:8px 16px}.facts b{font-weight:800}
@media (max-width:560px){.facts{grid-template-columns:1fr}}
ol.steps li{margin:6px 0}.catch{border-left:5px solid var(--txt)}
table{width:100%%;border-collapse:collapse;font-size:15px}th,td{text-align:left;padding:10px 8px;border-bottom:1px solid var(--line);vertical-align:top}
th{font-weight:800}.tablewrap{overflow-x:auto}
.note{font-size:14px;color:var(--muted)}footer{max-width:860px;margin:0 auto;padding-block:24px 48px;font-size:14px;color:var(--muted)}
input,select{font:inherit;padding:10px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--txt);width:100%%}
.row{display:grid;grid-template-columns:2fr 1.2fr 1fr auto;gap:8px;align-items:center;margin:6px 0}
@media (max-width:560px){.row{grid-template-columns:1fr 1fr}}
"""

def go(pid, r):
    return f"{r}go/{pid}/index.html"

def page(title, body, r, desc=""):
    nav = (f'<nav><a class="brand" href="{r}index.html"><span class="dot">$</span>{e(cfg["site_name"])}</a>'
           f'<a href="{r}streams/index.html">Income streams</a><a href="{r}tools/index.html">Tools</a>'
           f'<a href="{r}tracker/index.html">Tracker</a><a href="{r}guide/index.html">Free guide</a></nav>')
    foot = (f'<footer>Some links on this site are affiliate links: if you sign up through them I may earn a commission, '
            f'at no extra cost to you. <a href="{r}money/index.html">How this site makes money</a> · '
            f'<a href="{r}privacy/index.html">Privacy</a> · {e(cfg["handle"])}</footer>')
    return (f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            f'<title>{e(title)}</title><meta name="claude:viewport-fit-sides" content="cover"><meta name="description" content="{e(desc or cfg["tagline"])}"><style>{CSS.replace("%(r)s", r).replace("%%", "%")}</style></head>'
            f'<body>{nav}<main>{body}</main>{foot}</body></html>')

def write(rel, s):
    p = os.path.join(OUT, rel); os.makedirs(os.path.dirname(p), exist_ok=True); open(p, "w").write(s)

def guide_box(r):
    url = cfg.get("newsletter_form_url") or f"{r}guide/index.html"
    return (f'<div class="card"><h3>Free: the Small Creator Income Guide</h3><p>Every way to get paid under 10k followers, '
            f'with the tools and the catches. One new income stream in your inbox each week.</p><a class="btn" href="{e(url)}">Get the free guide</a></div>')

def tool_row(pid, r):
    p = progs[pid]; tag = " (affiliate link)" if p["pays_you"] else ""
    return f'<li><a href="{go(pid, r)}" rel="sponsored noopener">{e(p["name"])}</a>{tag}: {e(p["for"])}</li>'

def build():
    shutil.rmtree(OUT, ignore_errors=True); os.makedirs(OUT)
    shutil.copytree(os.path.join(HERE, "static"), os.path.join(OUT, "static"))
    if cfg.get("custom_domain"): open(os.path.join(OUT, "CNAME"), "w").write(cfg["custom_domain"])
    cards = "".join(f'<a class="card" href="{{r}}streams/{s["slug"]}/index.html"><h3>{e(s["title"])}</h3><p>{e(s["one_liner"])}</p>'
                    f'<span class="note">Followers needed: {e(s["followers"].split(".")[0])}</span></a>' for s in streams)
    # home
    write("index.html", page(cfg["site_name"], f'<h1>You don\'t need 10k followers to earn.</h1><p class="lead">{e(cfg["tagline"])} '
          f'Every stream is checked against official sources, with the catch included.</p><h2>Income streams</h2><div class="grid">{cards.replace("{r}", "")}</div>'
          f'{guide_box("")}<h2>Start here</h2><div class="grid"><a class="card" href="tools/index.html"><h3>Best tools for small creators</h3>'
          f'<p>What to use, what it costs, and free options.</p></a><a class="card" href="tracker/index.html"><h3>Income tracker</h3>'
          f'<p>Track every program you join and what it pays you. Free, stays on your device.</p></a></div>', ""))
    write("streams/index.html", page("Income streams", f'<h1>Income streams</h1><p class="lead">One page per stream: what it is, who it\'s for, '
          f'how to start, the catch, and sources.</p><div class="grid">{cards.replace("{r}", "../")}</div>', "../"))
    for s in streams:
        r = "../../"; tools = "".join(tool_row(t, r) for t in s["tools"] if t in progs)
        src = " · ".join(f'<a href="{e(u)}" rel="noopener">{e(t)}</a>' for t, u in s["sources"])
        body = (f'<p><a href="../index.html">← All income streams</a></p><span class="pill">Income stream</span><h1>{e(s["title"])}</h1>'
                f'<p class="lead">{e(s["one_liner"])}</p><div class="card facts"><b>Followers needed</b><span>{e(s["followers"])}</span>'
                f'<b>What it pays</b><span>{e(s["pay"])}</span><b>Great for</b><span>{e(", ".join(s["great_for"]))}</span>'
                f'<b>Last checked</b><span>{e(s["checked"])}</span></div><h2>How to start</h2><ol class="steps">'
                + "".join(f"<li>{e(x)}</li>" for x in s["steps"]) + f'</ol><div class="card catch"><h3>The catch</h3><p>{e(s["catch"])}</p></div>'
                f'<h2>Tools</h2><ul>{tools}</ul>{guide_box(r)}<p class="note">Sources: {src}. Rules change: check the official page before you rely on any number.</p>')
        write(f"streams/{s['slug']}/index.html", page(f'{s["title"]}: how small creators earn', body, r, s["one_liner"]))
    # tools
    r = "../"; rows = ""
    for p in sorted(progs.values(), key=lambda p: (p["category"], p["name"])):
        rows += (f'<tr><td><a href="{go(p["id"], r)}" rel="sponsored noopener"><b>{e(p["name"])}</b></a></td><td>{e(p["category"])}</td>'
                 f'<td>{e(p["for"])}</td><td>{"Yes" if p["free_plan"] else "No"}</td><td>{"Affiliate" if p["pays_you"] else "No"}</td></tr>')
    write("tools/index.html", page("Best tools for small creators", f'<h1>Tools for small creators</h1><p class="lead">What each tool is for and '
          f'whether there\'s a free plan. Links marked Affiliate may earn me a commission if you sign up; I only list tools I\'d use, and '
          f'free options are listed too.</p><div class="card tablewrap"><table><tr><th>Tool</th><th>Type</th><th>Use it for</th><th>Free plan</th>'
          f'<th>My link</th></tr>{rows}</table></div><p class="note">Checked {e(cfg["updated"])}. Plans and terms change, so check the tool\'s own page.</p>', r))
    # go redirects
    for p in progs.values():
        dest = p["referral_url"] or p["official_url"]
        write(f"go/{p['id']}/index.html", f'<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><title>{e(p["name"])}</title>'
              f'<meta http-equiv="refresh" content="0;url={e(dest)}"><link rel="canonical" href="{e(dest)}"><p>Going to <a href="{e(dest)}">{e(p["name"])}</a>…</p>')
    # tracker (stays in the visitor's browser)
    opts = "".join(f'<option>{e(p["name"])}</option>' for p in sorted(progs.values(), key=lambda p: p["name"]))
    tracker = (f'<h1>Income tracker</h1><p class="lead">Add each program you join and what it paid you this month. It saves on this device only: '
               f'nothing is sent anywhere.</p><div class="card"><div class="row"><select id="prog"><option value="">Choose a program…</option>{opts}'
               f'<option>Other</option></select><select id="status"><option>Applied</option><option>Joined</option><option>First payout</option></select>'
               f'<input id="amt" type="number" min="0" step="0.01" placeholder="$ this month"><button class="btn" id="add">Add</button></div></div>'
               f'<div class="card tablewrap"><table id="t"><tr><th>Program</th><th>Status</th><th>This month ($)</th><th></th></tr></table>'
               f'<p><b>Total this month: $<span id="tot">0.00</span></b></p><button class="btn" id="csv">Download as CSV</button></div>'
               """<script>
const K='scp-tracker-v1';let rows=[];try{rows=JSON.parse(localStorage.getItem(K)||'[]')}catch(e){rows=[]}
const save=()=>{try{localStorage.setItem(K,JSON.stringify(rows))}catch(e){}};
function draw(){const t=document.getElementById('t');t.querySelectorAll('tr.r').forEach(x=>x.remove());let tot=0;
rows.forEach((r,i)=>{tot+=+r.a||0;const tr=document.createElement('tr');tr.className='r';
[r.p,r.s,(+r.a||0).toFixed(2)].forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.appendChild(td)});
const td=document.createElement('td');const b=document.createElement('button');b.textContent='Remove';b.onclick=()=>{rows.splice(i,1);save();draw()};td.appendChild(b);tr.appendChild(td);t.appendChild(tr)});
document.getElementById('tot').textContent=tot.toFixed(2)}
document.getElementById('add').onclick=()=>{const p=document.getElementById('prog').value;if(!p)return;
rows.push({p,s:document.getElementById('status').value,a:document.getElementById('amt').value||0});save();draw()};
document.getElementById('csv').onclick=()=>{const c='program,status,amount\\n'+rows.map(r=>[r.p,r.s,r.a].join(',')).join('\\n');
const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([c],{type:'text/csv'}));a.download='income-tracker.csv';a.click()};draw();
</script>""")
    write("tracker/index.html", page("Income tracker for creators", tracker, "../"))
    # guide
    g = cfg.get("guide_url") or cfg.get("newsletter_form_url")
    gb = (f'<a class="btn" href="{e(g)}">Get the free guide</a>' if g else
          '<p class="card">The guide is being finished. Follow <b>' + e(cfg["handle"]) + '</b> to get it first.</p>')
    write("guide/index.html", page("Free Small Creator Income Guide", f'<h1>The Small Creator Income Guide</h1><p class="lead">Every way to get paid '
          f'with under 10k followers: what each stream pays, what it needs, the catch, and the tools to start.</p>{gb}', "../"))
    write("money/index.html", page("How this site makes money", f'<h1>How this site makes money</h1><p class="lead">Straight answer: affiliate '
          f'links, my own guides, and (later) clearly labelled sponsors.</p><div class="card"><p>Some tool links are affiliate links. If you sign up '
          f'through them, the tool may pay me a commission. It costs you nothing extra.</p><p>I only recommend tools I\'d use, I list free options '
          f'even when they pay me nothing, and every income stream page shows the catch and its sources.</p><p>Sponsored videos or pages will '
          f'always say "Sponsored" or "Ad".</p></div>', "../"))
    write("privacy/index.html", page("Privacy", f'<h1>Privacy</h1><div class="card"><p>This site has no accounts and no tracking cookies of its own. '
          f'The income tracker saves only in your own browser. If you join the email list, your email is stored by the newsletter provider and '
          f'used only to send the guide and updates; you can unsubscribe at any time.</p><p class="note">Contact: '
          f'{e(cfg.get("owner_contact_email") or cfg["handle"])}. Last updated {e(cfg["updated"])}.</p></div>', "../"))
    write("404.html", page("Not found", '<h1>Page not found</h1><p><a href="index.html">Go to the home page</a></p>', ""))
    n = sum(len(f) for _, _, f in os.walk(OUT)); print(f"built {n} files into {OUT}")

if __name__ == "__main__":
    build()
