#!/usr/bin/env python3
"""Builds the Sub-Creator Paid website into site/_site/ (static HTML, no dependencies). Design: v3 media-hub layout.

Data in site/data/:
  config.json        site name, links, newsletter settings, comments app id
  links.json         every program: official page, YOUR referral link (paste it in when you join), verified terms
  streams/*.json     one file per income stream -> one page each (also feeds the AI finder)
  posts/*.json       blog posts (optional)
Run:  python3 site/build.py      Cloudflare Pages runs this on every push (build output: site/_site).
The AI finder and newsletter sign-up are Cloudflare Pages Functions in /functions (repo root).
"""
import glob, hashlib, html, json, os, shutil, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.environ.get("SITE_OUT") or os.path.join(HERE, "_site")
D = lambda *p: os.path.join(HERE, "data", *p)
cfg = json.load(open(D("config.json")))
progs = {p["id"]: p for p in json.load(open(D("links.json")))["programs"]}
streams = [json.load(open(f)) for f in sorted(glob.glob(D("streams", "*.json")))]
videos = json.load(open(D("videos.json"))) if os.path.exists(D("videos.json")) else []  # finished videos (MP4 + poster in static/v)
featured = {v["n"]: v for v in videos if v.get("featured")}  # "Start here" videos: B1 who we are, T1 finder tutorial
videos = [v for v in videos if not v.get("featured")]
posts = sorted([json.load(open(f)) for f in glob.glob(D("posts", "*.json"))], key=lambda p: p["date"], reverse=True)
e = html.escape
SITE = cfg.get("site_url", "").rstrip("/")
SOC = cfg.get("social", {})
TODAY = datetime.date.today().isoformat()

CSS = r"""
@font-face{font-family:Inter;src:url(/static/Inter-Medium.otf);font-weight:400 500;font-display:swap}
@font-face{font-family:Inter;src:url(/static/Inter-SemiBold.otf);font-weight:600;font-display:swap}
@font-face{font-family:Inter;src:url(/static/Inter-Bold.otf);font-weight:700;font-display:swap}
@font-face{font-family:Inter;src:url(/static/Inter-ExtraBold.otf);font-weight:800;font-display:swap}
@font-face{font-family:Inter;src:url(/static/Inter-Black.otf);font-weight:900;font-display:swap}
:root{--bg:#F6F5F1;--paper:#FFFFFF;--ink:#151515;--muted:#5F5E58;--line:#E2DFD7;--acc:#151515;--acc-soft:#F1FBD0;--money:#CDF24F;--money-soft:#F1FBD0;--lime:#CDF24F;--loss:#D93A3A;--loss-soft:#FBE9E9;--gold:#E9C46A;
 --sans:"Inter",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;--serif:"Instrument Serif",Georgia,"Times New Roman",serif;--mono:"JetBrains Mono",ui-monospace,Consolas,monospace;
 --glow:0 14px 34px rgba(21,21,21,.16),0 3px 10px rgba(21,21,21,.07);--glow-sm:0 8px 20px rgba(21,21,21,.20),0 2px 6px rgba(21,21,21,.08);--glow-lg:0 18px 44px rgba(21,21,21,.26),0 4px 12px rgba(21,21,21,.08);color-scheme:light}
*{box-sizing:border-box}[hidden]{display:none!important}
html{overflow-x:clip;scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{margin:0;overflow-x:clip;background:var(--bg);color:var(--ink);font:400 16px/1.6 var(--sans);
 background-image:radial-gradient(900px 520px at 6% -6%,rgba(46,125,79,.10),transparent 70%),radial-gradient(900px 520px at 96% 4%,rgba(217,58,58,.08),transparent 70%);background-repeat:no-repeat}
body::before{content:"";position:fixed;inset:0 0 auto;height:env(safe-area-inset-top,0px);z-index:40;background:var(--bg)}
a{color:inherit}img{max-width:100%}
.wrap{max-width:1180px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
h1,h2,h3{margin:0;line-height:1.02;letter-spacing:-.03em;text-wrap:balance}p{margin:0}
em.s{font-style:normal;color:#fff;background:var(--ink);border-radius:.16em;padding:0 .2em;margin:0 .02em;-webkit-box-decoration-break:clone;box-decoration-break:clone;box-shadow:0 10px 26px rgba(21,21,21,.18)}em.s.m{background:var(--lime);color:var(--ink);box-shadow:0 10px 30px rgba(205,242,79,.55)}em.s.l{background:var(--loss);color:#fff;box-shadow:0 10px 30px rgba(217,58,58,.35)}.m{color:var(--ink);background:linear-gradient(transparent 58%,var(--lime) 58%);padding:0 .08em}.l,dl dt.l{color:var(--loss)}
.eyebrow{font:700 12px/1 var(--mono);letter-spacing:.12em;text-transform:uppercase;color:var(--acc)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;font:800 15px/1 var(--sans);padding:15px 22px;border-radius:999px;border:1.5px solid var(--ink);background:var(--paper);color:var(--ink);text-decoration:none;cursor:pointer;box-shadow:var(--glow-sm);transition:transform .12s,box-shadow .12s}
.btn:hover{transform:translateY(-2px);box-shadow:var(--glow-lg)}.btn:active{transform:translateY(1px)}.btn[disabled]{opacity:.6;cursor:wait}
.btn.primary{background:var(--acc);border-color:var(--acc);color:#fff;box-shadow:0 10px 26px rgba(21,21,21,.35)}.btn.dark{background:var(--ink);color:#fff}.btn.sm{padding:11px 16px;font-size:14px}
:focus-visible{outline:3px solid var(--acc);outline-offset:3px}
.link{font-weight:800;text-decoration:none;border-bottom:2px solid var(--acc);padding-bottom:2px}
.num{font-variant-numeric:tabular-nums}
.tag{display:inline-block;font:700 11px/1 var(--mono);letter-spacing:.06em;text-transform:uppercase;padding:6px 8px;border-radius:6px;background:var(--acc-soft);color:var(--acc)}
.tag.warn{background:var(--loss-soft);color:var(--loss)}
.card{background:var(--paper);border:1.5px solid rgba(21,21,21,.85);border-radius:20px;box-shadow:var(--glow)}
.skip{position:absolute;left:-9999px}.skip:focus{left:16px;top:16px;z-index:60;background:var(--paper);padding:10px 14px;border-radius:10px}
/* header */
header.top{position:sticky;top:env(safe-area-inset-top,0px);z-index:30;background:rgba(246,245,241,.92);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
.nav{display:flex;align-items:center;gap:26px;padding-block:14px}
.mark{display:flex;align-items:center;gap:10px;font-weight:900;font-size:19px;letter-spacing:-.03em;text-decoration:none;margin-right:auto;text-transform:lowercase}
.mark{white-space:nowrap}.mark i{flex:none;width:34px;height:34px;border-radius:10px;background:var(--ink);color:var(--lime);display:grid;place-items:center;font-style:normal;font-weight:900;box-shadow:var(--glow-sm);text-transform:none}
.nav>a.l,.dd>button{font:600 15px var(--sans);color:var(--muted);text-decoration:none;background:none;border:0;cursor:pointer;padding:0}
.nav>a.l:hover,.dd>button:hover,.nav>a.l[aria-current]{color:var(--ink)}
.dd{position:relative}
.dd .menu{position:absolute;top:calc(100% + 12px);left:-14px;min-width:240px;background:var(--paper);border:1px solid var(--line);border-radius:14px;box-shadow:var(--glow);padding:8px;display:grid}
.dd .menu a{padding:10px 12px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px}.dd .menu a:hover{background:var(--acc-soft)}
.dd .menu small{display:block;color:var(--muted);font-weight:500}
.mnav{display:none;background:none;border:1.5px solid var(--ink);border-radius:10px;padding:8px 10px;font:700 14px var(--sans)}
.mmenu{border-top:1px solid var(--line);padding-block:10px 16px;display:grid}
.mmenu a{padding:10px 0;font-weight:700;text-decoration:none;border-bottom:1px solid var(--line)}
@media(max-width:900px){.nav>a.l,.dd{display:none}.mnav{display:inline-block}}
.nav .btn{white-space:nowrap}@media(max-width:520px){.nav{gap:8px}.mark{font-size:15px;gap:7px}.mark i{width:30px;height:30px}.nav .btn.sm{padding:9px 11px;font-size:12.5px}.mnav{padding:7px 9px;font-size:13px}}
/* hero */
.hero{padding-block:72px 28px;text-align:center;position:relative}
.man{position:absolute;top:255px;width:185px;aspect-ratio:1;pointer-events:none;z-index:0}.man.l{left:10px}.man.r{right:10px}.man.r .tag2.t1{left:auto;right:30%}.man.l .tag2.t1{left:-14%;top:-6%}.man.r .tag2.t2{left:auto;right:-4%}
.man .wg{position:absolute;inset:16% 4% 14%;background:#fff;color:var(--ink);border:1.5px solid var(--ink);border-radius:18px;padding:12px 14px;text-align:left;box-shadow:0 18px 40px rgba(21,21,21,.14);animation:bob 3.2s ease-in-out infinite;display:flex;flex-direction:column;gap:4px}
.man.l .wg{animation-delay:-1.6s;transform:rotate(-4deg)}.man.r .wg{transform:rotate(3deg)}
.wg small{font:700 10px var(--mono);letter-spacing:.1em;color:var(--muted)}.wg .kv{display:flex;justify-content:space-between;align-items:baseline;font-size:13px;font-weight:700}.wg .kv b{font-size:18px;font-weight:900}.wg .kv b.l{color:var(--loss)}
.wg .pay{font:900 40px/1 var(--sans);color:var(--ink);background:var(--lime);border-radius:8px;padding:2px 6px;align-self:flex-start;letter-spacing:-.03em}.wg .sub{font-size:11px;font-weight:700;color:var(--muted);line-height:1.3}
.spark{width:100%;height:34px;margin-top:auto}.spark path{stroke-dasharray:1;stroke-dashoffset:1;animation:draw 3.2s ease-in-out infinite}
@keyframes draw{0%{stroke-dashoffset:1}45%,85%{stroke-dashoffset:0}100%{stroke-dashoffset:0;opacity:0}}
.man .ring{position:absolute;inset:4%;border-radius:50%;background:repeating-conic-gradient(from 0deg,var(--c) 0 6deg,transparent 6deg 18deg);opacity:.16;animation:spin 26s linear infinite;-webkit-mask:radial-gradient(circle,transparent 38%,#000 40%,#000 68%,transparent 70%);mask:radial-gradient(circle,transparent 38%,#000 40%,#000 68%,transparent 70%)}
.man .halo{position:absolute;inset:18%;border-radius:50%;background:var(--c);opacity:.12;filter:blur(18px);animation:pulse2 3.2s ease-in-out infinite}
.man .tag2{position:absolute;font:900 17px/1 var(--sans);color:#fff;padding:9px 13px;border-radius:12px;white-space:nowrap;animation:float 4s ease-in-out infinite}
.man.r .tag2{background:var(--lime);color:var(--ink);box-shadow:0 0 34px rgba(205,242,79,.6)}.man.l .tag2{background:var(--loss);box-shadow:0 0 34px rgba(217,58,58,.45)}
.man .tag2.t1{top:2%;left:52%;transform:rotate(8deg)}.man .tag2.t2{bottom:-2%;left:-6%;transform:rotate(-7deg);animation-delay:-2s;background:var(--ink)!important;box-shadow:0 12px 30px rgba(21,21,21,.25)!important}
.man .coin{position:absolute;width:26px;height:26px;border-radius:50%;display:grid;place-items:center;color:#fff;font:900 14px var(--sans);background:var(--c);animation:rise 5s linear infinite;opacity:0}
.man .coin:nth-of-type(2){left:18%;animation-delay:-1.7s}.man .coin:nth-of-type(3){left:70%;animation-delay:-3.4s}.man .coin:nth-of-type(1){left:44%}
@keyframes bob{50%{transform:translateY(-10px)}}@keyframes pulse2{50%{transform:scale(1.15);opacity:.2}}@keyframes float{50%{translate:0 -8px}}
@keyframes rise{0%{bottom:20%;opacity:0}15%{opacity:.9}80%{opacity:.7}100%{bottom:100%;opacity:0}}
.hero>*:not(.man){position:relative;z-index:1}
@media(max-width:1100px){.hero{padding-top:56px}.man{width:150px;top:10px}.man.l{left:8%}.man.r{right:8%}.man .tag2{font-size:13px;padding:6px 9px}}
@media(max-width:760px){.hero{padding-top:40px;overflow-x:clip}.man{width:158px;top:18px}.man .wg{padding:9px 10px;inset:20% 2% 10%}.wg small{font-size:8px}.wg .kv{font-size:11px}.wg .kv b{font-size:14px}.wg .pay{font-size:28px}.wg .sub{font-size:9px}.spark{height:22px}.man .coin{display:none}.man.l{left:0}.man.r{right:0}.man .tag2.t2{display:none}.man.r .tag2.t1{left:auto;right:0}.man.l .tag2.t1{left:30%}}
@media(prefers-reduced-motion:reduce){.man *,.sman *,.belt .tr{animation:none!important}.dslide img{opacity:0!important}.dslide img:first-child{opacity:1!important}}
.hero h1{font-weight:900;font-size:clamp(46px,9vw,118px);letter-spacing:-.045em;line-height:.95}
.hero h1 em.s{display:inline-block;margin-top:.08em}
.hero .bio{max-width:58ch;margin:24px auto 0;font-size:clamp(17px,1.9vw,20px);color:var(--muted)}
.hero .ctas{display:flex;flex-wrap:wrap;gap:14px;justify-content:center;margin-top:30px}
.cred{display:flex;flex-wrap:wrap;justify-content:center;gap:10px 26px;margin-top:26px;font-size:14px;color:var(--muted)}.cred b{color:var(--ink)}
.heroimg{margin-top:44px;position:relative;border-radius:26px;overflow:hidden;aspect-ratio:21/9;max-width:100%;box-shadow:var(--glow-lg);border:1.5px solid rgba(21,21,21,.85);background:var(--paper)}
.heroimg .in{position:relative;height:100%;display:flex;flex-direction:column;justify-content:center;gap:14px;padding:clamp(18px,4vw,48px);max-width:56%;text-align:left}
.heroimg .in h2{font-size:clamp(24px,3.4vw,44px);font-weight:900}.heroimg .in p{color:var(--muted);font-size:clamp(14px,1.4vw,17px)}
.vframe{position:absolute;right:6%;top:50%;transform:translateY(-50%) rotate(2deg);height:86%;aspect-ratio:9/16;border-radius:20px;border:1.5px solid rgba(21,21,21,.85);box-shadow:var(--glow-lg);background:#F6F5F1 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='26' height='26'%3E%3Cpath d='M0 .5H26M.5 0V26' stroke='%23E4E1DA'/%3E%3C/svg%3E");display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;padding:16px;text-decoration:none}
.vframe .a{font:600 clamp(12px,1.3vw,16px) var(--sans)}.vframe .b{font:900 clamp(26px,3.6vw,48px)/.95 var(--sans);letter-spacing:-.04em;text-transform:uppercase}
.vframe .c{background:var(--ink);color:#fff;font:800 clamp(11px,1.1vw,14px) var(--sans);padding:6px 10px}
.vframe .sun{width:22%;aspect-ratio:1;border-radius:50%;background:var(--acc);box-shadow:var(--glow-sm);display:grid;place-items:center;color:#fff;font:900 clamp(16px,2vw,26px) var(--sans)}
.playbig{position:absolute;right:-22px;bottom:12%;width:76px;height:76px;border-radius:50%;background:var(--paper);border:1.5px solid var(--ink);box-shadow:var(--glow-lg);display:grid;place-items:center}
.playbig::after{content:"";border-left:22px solid var(--ink);border-top:13px solid transparent;border-bottom:13px solid transparent;margin-left:6px}
@media(max-width:760px){.heroimg{aspect-ratio:auto;padding-bottom:118%}.heroimg .in{max-width:100%}.vframe{top:auto;bottom:4%;right:50%;transform:translateX(50%) rotate(2deg);height:auto;width:52%}}
.live{display:inline-flex;align-items:center;gap:8px;font:700 12px var(--mono);color:var(--acc)}
.live::before{content:"";width:9px;height:9px;border-radius:50%;background:var(--acc);box-shadow:0 0 0 4px rgba(21,21,21,.2);animation:pulse 1.6s ease-in-out infinite}
@keyframes pulse{50%{box-shadow:0 0 0 8px rgba(21,21,21,0)}}
/* marquee */
.strip{padding-block:46px 10px}
.strip p.k{text-align:center;font:700 12px var(--mono);letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:16px}
.mq{overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 10%,#000 90%,transparent);mask-image:linear-gradient(90deg,transparent,#000 10%,#000 90%,transparent)}
.mq .tr{display:flex;gap:14px;width:max-content;animation:mq 44s linear infinite}.mq.rev .tr{animation-direction:reverse;animation-duration:52s}
.mq span{font:800 17px/1 var(--sans);letter-spacing:-.01em;padding:13px 18px;border-radius:999px;background:var(--paper);border:1px solid var(--line);white-space:nowrap}
@keyframes mq{to{transform:translateX(-50%)}}
@media(prefers-reduced-motion:reduce){.mq .tr,.live::before{animation:none}*{scroll-behavior:auto!important}}
/* sections */
section.s{padding-block:84px 10px}
.shead{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:end;gap:18px;margin-bottom:34px}
.shead h2{font-size:clamp(34px,5vw,62px);font-weight:900}.shead p{color:var(--muted);max-width:46ch;margin-top:12px;font-size:18px}
/* AI finder */
.ai{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);gap:36px;align-items:start;padding:clamp(22px,4vw,44px);border-radius:28px;background:var(--paper);border:1.5px solid rgba(21,21,21,.85);box-shadow:var(--glow-lg)}
@media(max-width:900px){.ai{grid-template-columns:minmax(0,1fr)}}
.ai h2{font-size:clamp(32px,4.6vw,56px);font-weight:900}.ai .intro p{color:var(--muted);margin-top:14px;font-size:17px}
.badge{display:inline-flex;align-items:center;gap:8px;font:700 12px var(--mono);letter-spacing:.08em;color:#fff;background:var(--ink);padding:7px 11px;border-radius:999px}
.badge i{width:8px;height:8px;border-radius:50%;background:var(--lime)}
.ai form{display:grid;gap:14px}.ai label.f{font-weight:700;font-size:14px;display:block;margin-bottom:7px}
.inp{width:100%;min-width:0;font:500 16px var(--sans);padding:14px 15px;border-radius:14px;border:1.5px solid var(--line);background:var(--bg);color:var(--ink)}
.inp:focus{border-color:var(--acc);outline:none;box-shadow:0 0 0 4px rgba(21,21,21,.15)}
.pills{display:flex;flex-wrap:wrap;gap:8px}
.pills button{font:600 14px/1 var(--sans);padding:10px 13px;border-radius:999px;border:1.5px solid var(--line);background:var(--paper);color:var(--ink);cursor:pointer}
.pills button[aria-pressed="true"]{background:var(--ink);border-color:var(--ink);color:#fff}
.or{font-size:12px;color:var(--muted);font-family:var(--mono);letter-spacing:.06em}
.err{color:#A83A2C;font-weight:700;font-size:14px}
.think{display:grid;gap:8px}.think div{display:flex;gap:10px;align-items:center;font-size:14px;font-weight:600;color:var(--muted)}
.think div::before{content:"";width:14px;height:14px;border-radius:50%;border:2px solid var(--line);flex:none}
.think div.done{color:var(--ink)}.think div.done::before{background:var(--acc);border-color:var(--acc)}
.think div.run::before{border-color:var(--acc);border-top-color:transparent;animation:spin .7s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.res{display:grid;gap:12px;margin-top:14px}
.rc{border:1px solid var(--line);border-radius:18px;padding:16px 18px;background:var(--bg);display:grid;gap:8px;text-decoration:none}
.rc .top{display:flex;align-items:center;gap:12px}.rc .top b{font-size:18px;flex:1;min-width:0}
.rc .pc{font:800 13px var(--mono);color:#fff;background:var(--acc);padding:6px 9px;border-radius:999px}
.rc .bar{height:6px;border-radius:9px;background:var(--line);overflow:hidden}.rc .bar i{display:block;height:100%;background:var(--acc)}
.rc p{font-size:14px;color:var(--muted)}.rc .first{font-weight:700;color:var(--ink)}
.hint{font-size:12px;color:var(--muted)}
.ai{background:var(--ink);color:#F2F1EC;border-color:var(--ink);box-shadow:0 30px 70px rgba(21,21,21,.28)}
.ai .intro p,.ai .hint,.ai .or{color:#A9A79F}.ai h2 em.s{background:#fff;color:var(--ink)}.ai .badge{background:#2A2A2A}.ai .badge i{background:var(--money)}.ai .link{border-color:#fff}
.ai .inp{background:#202020;border-color:#3A3A3A;color:#fff}.ai .inp::placeholder{color:#7D7B74}.ai .inp:focus{border-color:#fff;box-shadow:0 0 0 4px rgba(255,255,255,.12)}
.ai .pills button{background:#202020;border-color:#3A3A3A;color:#F2F1EC}.ai .pills button[aria-pressed="true"]{background:#fff;border-color:#fff;color:var(--ink)}
.ai .btn.primary{background:#fff;border-color:#fff;color:var(--ink)}.ai .err{color:#FF7A7A}
.ai .think div{color:#A9A79F}.ai .think div.done{color:#fff}.ai .think div.done::before{background:var(--money);border-color:var(--money)}.ai .think div.run::before{border-color:#fff;border-top-color:transparent}
.ai .rc{background:#1E1E1E;border-color:#333;color:#F2F1EC}.ai .rc p{color:#A9A79F}.ai .rc .first{color:#fff}.ai .rc .pc{background:var(--money);color:var(--ink)}.ai .rc .bar{background:#333}.ai .rc .bar i{background:var(--money)}
/* series */
.series{padding-block:26px;border-top:1px solid var(--line);display:grid;grid-template-columns:minmax(0,300px) minmax(0,1fr);gap:28px;align-items:start}
@media(max-width:860px){.series{grid-template-columns:minmax(0,1fr)}}
.series h3{font-size:28px;font-weight:900}
.sman{position:relative;width:170px;aspect-ratio:1;margin-top:22px}
.gbox{position:absolute;inset:13%;background:#fff;border:1.5px solid var(--ink);border-radius:20px;box-shadow:0 16px 36px rgba(21,21,21,.12);display:grid;place-items:center;overflow:hidden;animation:bob 3.4s ease-in-out infinite}
.bars{display:flex;align-items:flex-end;gap:6%;width:72%;height:62%}.bars i{flex:1;height:var(--h);background:var(--money);border-radius:4px 4px 0 0;transform-origin:bottom;animation:grow 2.8s ease-in-out infinite}
@keyframes grow{0%{transform:scaleY(.1)}40%,80%{transform:scaleY(1)}100%{transform:scaleY(.1)}}
.cyc{position:relative;width:70%;height:70%}.cyc span{position:absolute;inset:0;display:grid;place-items:center;opacity:0;animation:cyc 12s infinite}.cyc img{max-width:100%;max-height:70%;object-fit:contain}
@keyframes cyc{0%{opacity:0;transform:translateY(30%)}3%,14%{opacity:1;transform:none}17%,100%{opacity:0;transform:translateY(-30%)}}
.flip{position:relative;width:100%;height:100%}.flip span{position:absolute;inset:0;display:grid;place-items:center;font:900 30px var(--sans);letter-spacing:-.03em;animation:flip 4s infinite}
.flip .a{color:var(--loss)}.flip .b{color:var(--ink);background:var(--lime);border-radius:.12em;padding:0 .15em;animation-delay:-2s}@keyframes flip{0%,40%{opacity:1;transform:none}50%,90%{opacity:0;transform:rotateX(90deg)}100%{opacity:1;transform:none}}
.sman::before{content:"";position:absolute;inset:8%;border-radius:50%;background:repeating-conic-gradient(var(--c) 0 6deg,transparent 6deg 18deg);opacity:.15;animation:spin 30s linear infinite;-webkit-mask:radial-gradient(circle,transparent 40%,#000 42%,#000 68%,transparent 70%);mask:radial-gradient(circle,transparent 40%,#000 42%,#000 68%,transparent 70%)}
.sman b{position:absolute;right:-6px;top:6%;font:900 14px/1 var(--sans);color:#fff;background:var(--c);padding:7px 10px;border-radius:10px;transform:rotate(7deg);animation:float 4s ease-in-out infinite}
@media(max-width:860px){.series>div:first-child{display:grid;grid-template-columns:1fr 110px;column-gap:14px}.series>div:first-child>*:not(.sman){grid-column:1}.sman{grid-column:2;grid-row:1/5;width:110px;margin:0;align-self:center}.sman b{font-size:11px}}
.row.belt{overflow:hidden;scroll-snap-type:none;-webkit-mask-image:linear-gradient(90deg,transparent,#000 4%,#000 92%,transparent);mask-image:linear-gradient(90deg,transparent,#000 4%,#000 92%,transparent)}
.belt .tr{display:flex;gap:16px;width:max-content;animation:belt var(--sp,60s) linear infinite}.belt:hover .tr,.belt:active .tr{animation-play-state:paused}
@keyframes belt{to{transform:translateX(calc(-50% - 8px))}}.series p{color:var(--muted);margin:10px 0 16px}
.row{display:flex;gap:16px;overflow-x:auto;scroll-snap-type:x mandatory;padding:6px 4px 22px}
.ep{flex:0 0 186px;scroll-snap-align:start;text-decoration:none}
.ep .th{aspect-ratio:9/16;border-radius:16px;border:1.5px solid rgba(21,21,21,.85);background:#F6F5F1 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22'%3E%3Cpath d='M0 .5H22M.5 0V22' stroke='%23E4E1DA'/%3E%3C/svg%3E");box-shadow:var(--glow);display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:14px;gap:8px;transition:transform .15s,box-shadow .15s}
.ep:hover .th{transform:translateY(-4px);box-shadow:var(--glow-lg)}
.ep .t1{font-size:11px;font-weight:700;color:var(--muted)}.ep .t2{font:900 21px/1 var(--sans);letter-spacing:-.03em;text-transform:uppercase}
.ep .t3{background:var(--ink);color:#fff;font:800 11px var(--sans);padding:5px 9px}
.ep .cap{font-size:14px;font-weight:700;margin-top:10px;line-height:1.3}.ep .cap span{display:block;font-weight:500;color:var(--muted);font-size:12px;margin-top:2px}
.ep.soon .th{opacity:.6}
.ep .th.img{padding:0;overflow:hidden;background:#F6F5F1}.ep .th.img img{width:100%;height:100%;object-fit:cover;display:block}
.ep .th.logo{background:#fff;gap:18px}.ep .th.logo img{width:auto;height:auto;max-width:70%;max-height:110px;object-fit:contain}
.vframe.img{padding:0}
.dslide{overflow:visible}.dslide img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit;opacity:0;animation:dsl 12s infinite;background:#F6F5F1}
@keyframes dsl{0%{opacity:0;transform:translateX(24%)}4%{opacity:1;transform:none}25%{opacity:1;transform:none}29%{opacity:0;transform:translateX(-24%)}100%{opacity:0}}.vframe.img img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:inherit}
/* metrics */
.metrics{margin-top:80px;background:var(--ink);color:#fff}
.metrics .wrap{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));padding-block:44px;gap:20px}
.metrics b{display:block;font:900 clamp(30px,4vw,48px)/1 var(--sans);letter-spacing:-.04em}.metrics span{font-size:14px;color:#C9C8C2}
@media(max-width:860px){.metrics .wrap{grid-template-columns:repeat(2,minmax(0,1fr))}}
/* feature */
.feature{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:48px;align-items:center}
@media(max-width:860px){.feature{grid-template-columns:minmax(0,1fr)}}
.feature h2{font-size:clamp(36px,5.2vw,64px);font-weight:900}.feature p{color:var(--muted);font-size:18px;margin:16px 0 22px;max-width:44ch}
.book{aspect-ratio:4/3;border-radius:24px;background:var(--acc-soft);border:1.5px solid rgba(21,21,21,.85);box-shadow:var(--glow);display:grid;place-items:center;position:relative;overflow:hidden;max-width:100%}
.book .cover{width:46%;aspect-ratio:3/4;background:var(--acc);border-radius:6px 12px 12px 6px;box-shadow:0 22px 40px rgba(21,21,21,.25),inset 10px 0 0 rgba(0,0,0,.18);transform:rotate(-6deg);color:#fff;padding:8% 8% 8% 13%;display:flex;flex-direction:column;justify-content:space-between}
.book .cover b{font:900 clamp(16px,2.2vw,26px)/1.05 var(--sans);letter-spacing:-.02em}.book .cover small{font:700 10px var(--mono);letter-spacing:.1em}
.book .pg{position:absolute;right:12%;bottom:14%;transform:rotate(7deg);background:var(--paper);border:1px solid var(--line);border-radius:10px;padding:12px 14px;box-shadow:var(--glow-sm);font-size:13px;font-weight:700}
.book .pg span{display:block;color:var(--acc);font:800 22px var(--sans)}
/* cards grid */
.cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px}
@media(max-width:900px){.cards{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:600px){.cards{grid-template-columns:minmax(0,1fr)}}
.essay{display:flex;flex-direction:column;gap:10px;padding:24px;border-radius:20px;background:var(--paper);border:1px solid var(--line);box-shadow:var(--glow);text-decoration:none;transition:transform .15s,box-shadow .15s}
.vgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr));gap:20px;padding-bottom:40px}
.vcard{display:flex;flex-direction:column;overflow:hidden;padding:0}.vcard video{width:100%;aspect-ratio:9/16;max-height:70vh;background:#111;display:block;object-fit:cover}
.vbody{display:flex;flex-direction:column;gap:10px;padding:18px;min-width:0}.vbody h3{font-size:22px;font-weight:800;letter-spacing:-.02em}.vbody p{color:var(--muted)}.vbody details{font-size:14px;color:var(--muted)}.vbody details a{overflow-wrap:anywhere}
.essay:hover{transform:translateY(-3px);box-shadow:var(--glow-lg)}.essay h3{font-size:24px;font-weight:800;letter-spacing:-.02em}.essay p{color:var(--muted)}
.essay small{margin-top:auto;font:700 12px var(--mono);color:var(--acc)}
.stream{padding:20px;display:flex;flex-direction:column;gap:12px;text-decoration:none;transition:transform .12s}
.stream:hover{transform:translateY(-3px);box-shadow:var(--glow-lg)}
.stream .r1{display:flex;align-items:center;gap:10px}.stream .ic{width:44px;height:44px;border-radius:12px;background:var(--ink);color:#fff;display:grid;place-items:center;font:900 20px var(--sans);flex:none}
.stream h3{font-size:20px;font-weight:800;letter-spacing:-.01em}
.stream .facts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.stream .facts div{background:var(--bg);border-radius:10px;padding:9px 10px}
.stream .facts small{display:block;font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;font-weight:700}
.stream .foot{display:flex;justify-content:space-between;font-size:12px;color:var(--muted);margin-top:auto}
.filters{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:22px}
.chip{font:700 13px/1 var(--sans);padding:9px 13px;border-radius:999px;border:1.5px solid var(--ink);background:var(--paper);cursor:pointer}.chip.on{background:var(--ink);color:#fff}
/* how it runs */
.bts{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:40px;align-items:center;padding:clamp(22px,4vw,44px);border-radius:28px;background:var(--paper);border:1.5px solid rgba(21,21,21,.85);box-shadow:var(--glow-lg)}
@media(max-width:860px){.bts{grid-template-columns:minmax(0,1fr)}}
.bts h2{font-size:clamp(30px,4.2vw,52px);font-weight:900}.bts p{color:var(--muted);margin:14px 0 20px;font-size:17px}
.flow{display:grid;gap:10px}.flow div{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:14px;background:var(--bg);border:1px solid var(--line);font-weight:700;font-size:15px}
.flow div i{font-style:normal;width:30px;height:30px;border-radius:9px;background:var(--ink);color:#fff;display:grid;place-items:center;font:800 13px var(--mono);flex:none}
.flow div.you{background:var(--acc-soft);border-color:var(--acc)}.flow div.you i{background:var(--acc)}
/* join */
.join{margin-top:84px;border-radius:28px;background:var(--ink);color:#fff;overflow:hidden;display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);box-shadow:0 22px 50px rgba(21,21,21,.25)}
@media(max-width:860px){.join{grid-template-columns:minmax(0,1fr)}}
.join .in{padding:clamp(24px,5vw,56px);display:flex;flex-direction:column;gap:16px;justify-content:center}
.join h2{font-size:clamp(34px,5vw,60px);font-weight:900}.join h2 em.s{background:#fff;color:var(--ink)}.join p{color:#C9C8C2;font-size:18px;max-width:42ch}
.join .img{min-height:280px;background:#1F2A23;display:grid;place-items:center;padding:28px}
.join .stack{display:grid;gap:10px;width:min(320px,100%)}
.join .stack div{background:#fff;color:var(--ink);border-radius:14px;padding:12px 14px;font-weight:700;box-shadow:0 10px 26px rgba(0,0,0,.25);display:flex;justify-content:space-between;gap:10px}
.join .stack div span{color:var(--acc);font-family:var(--mono);font-size:13px}.join .stack div:nth-child(2){transform:translateX(18px)}
/* inner pages */
.page{padding-block:40px 20px}.page h1{font-size:clamp(38px,6vw,68px);font-weight:900;letter-spacing:-.04em}
.page .lead{font-size:19px;color:var(--muted);margin-top:16px;max-width:58ch}
.crumb{font-size:14px;color:var(--muted);padding-top:28px}.crumb a{text-decoration:none}
.phead{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:40px;padding-block:20px 36px;align-items:start}
@media(max-width:900px){.phead{grid-template-columns:minmax(0,1fr)}}
.meta{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px}
.facts-card{padding:6px 20px}.facts-card dl{margin:0}
.facts-card div{display:grid;grid-template-columns:150px minmax(0,1fr);gap:12px;padding:14px 0;border-top:1px solid var(--line)}.facts-card div:first-child{border-top:0}
.facts-card dt{font-size:13px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.05em}.facts-card dd{margin:0;font-weight:600}
@media(max-width:500px){.facts-card div{grid-template-columns:minmax(0,1fr);gap:4px}}
.body2{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:40px}@media(max-width:900px){.body2{grid-template-columns:minmax(0,1fr)}}
.article h2{font-size:30px;margin:34px 0 12px;font-weight:900}.article p,.article li{color:#2B2B28;max-width:65ch}
.callout{padding:18px 20px;border-radius:16px;background:var(--acc-soft);border:1.5px solid var(--acc);margin:22px 0}.callout.l{background:var(--loss-soft);border-color:var(--loss);color:var(--ink);box-shadow:0 10px 30px rgba(217,58,58,.14)}.callout.l b{color:var(--loss)}
.rail{display:grid;grid-template-columns:repeat(var(--n,3),minmax(0,1fr));gap:10px;margin:8px 0 18px}
.rail div{border:1.5px solid var(--ink);border-radius:12px;padding:10px 12px;background:var(--paper);font-weight:700;font-size:14px;transition:background .2s,color .2s}
.rail div small{display:block;font:700 11px var(--mono);color:var(--muted)}.rail div.on{background:var(--acc);color:#fff;border-color:var(--acc)}.rail div.on small{color:#D8D6CF}
.stepcard{padding:20px;margin:16px 0;display:grid;grid-template-columns:56px minmax(0,1fr);gap:16px;align-items:start}
.stepcard .n{width:56px;height:56px;border-radius:14px;background:var(--ink);color:#fff;display:grid;place-items:center;font:900 22px var(--mono)}.stepcard.on .n{background:var(--acc)}
.side{display:flex;flex-direction:column;gap:18px;align-self:start;position:sticky;top:calc(84px + env(safe-area-inset-top,0px))}.side .card{padding:18px}
.toolli{list-style:none;padding:0;margin:10px 0 0;display:grid;gap:10px}.toolli a{font-weight:800}
.tablewrap{overflow-x:auto}table{width:100%;border-collapse:collapse;font-size:15px}th,td{text-align:left;padding:12px 10px;border-bottom:1px solid var(--line);vertical-align:top}th{font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)}
.lbw{max-width:560px;margin:0 auto}.lbhead{text-align:center;margin-bottom:22px}.lbhead .dot{width:56px;height:56px;font-size:28px;margin:0 auto 12px;display:grid;place-items:center;border-radius:50%;background:var(--acc);color:#fff;font-weight:900}.lbbig{width:100%;padding:18px}.card.lb{display:block;padding:16px 18px;margin-top:10px;text-decoration:none;color:var(--ink)}.card.lb b{display:block;font-size:17px}.card.lb span{font-size:14px;color:var(--muted)}.prose{max-width:70ch}.prose p,.prose li{margin:12px 0;color:#2B2B28}.prose h2{font-size:28px;margin:30px 0 8px;font-weight:900}
.trow{display:grid;grid-template-columns:2fr 1.2fr 1fr auto;gap:8px;align-items:center;margin:6px 0}@media(max-width:600px){.trow{grid-template-columns:1fr 1fr}}
.cm-box{padding:20px;margin-top:30px}.cm-list{margin:14px 0 6px}.cm-item{border-top:1px solid var(--line);padding:14px 0}.cm-item b{font-size:15px}.cm-item time{color:var(--muted);font-size:13px;margin-left:8px}.cm-item p{margin-top:6px;white-space:pre-wrap}.cm-reply{margin:10px 0 0 14px;padding-left:12px;border-left:3px solid var(--acc)}.cm-form{display:grid;gap:8px;margin-top:10px}.cm-form textarea{resize:vertical;font:500 16px var(--sans)}.lbl{font-weight:700;font-size:14px}.hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}
footer{margin-top:90px;border-top:1px solid var(--line);background:var(--paper)}
footer .wrap{padding-block:40px;display:grid;grid-template-columns:minmax(0,1.4fr) repeat(3,minmax(0,1fr));gap:26px;font-size:14px}
footer h4{font-size:12px;text-transform:uppercase;letter-spacing:.1em;margin:0 0 10px;font-family:var(--mono)}
footer a{display:block;color:var(--muted);text-decoration:none;padding:3px 0}
footer .fine{grid-column:1/-1;color:var(--muted);font-size:12px;border-top:1px solid var(--line);padding-top:16px;display:flex;flex-wrap:wrap;gap:8px 20px;justify-content:space-between}
@media(max-width:800px){footer .wrap{grid-template-columns:repeat(2,minmax(0,1fr))}footer .wrap>div:first-child{grid-column:1/-1}}
.modal{position:fixed;inset:0;z-index:50;background:rgba(21,21,21,.5);display:grid;place-items:center;padding:16px}
.modal .box{width:min(460px,100%);background:var(--paper);border-radius:24px;padding:28px;position:relative;box-shadow:var(--glow-lg)}
.modal h3{font-size:30px;font-weight:900}.modal p{color:var(--muted);margin-top:8px}
.modal form{display:grid;gap:10px;margin-top:18px}.modal .two{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.modal .x{position:absolute;top:14px;right:14px;width:38px;height:38px;border-radius:50%;border:1px solid var(--line);background:var(--paper);font-size:20px;cursor:pointer}
.modal .done{text-align:center;padding-block:20px}.modal .done b{display:block;font:900 40px var(--sans);letter-spacing:-.03em}
.hp{position:absolute;left:-9999px}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
"""

# cache-busting version for site.css + site.js: changes whenever either file changes (static files are cached for a day)
if os.environ.get("SITE_THEME"):  # look options for the owner to compare (site/themes.py)
    import sys; sys.path.insert(0, HERE); from themes import THEMES; CSS += THEMES[os.environ["SITE_THEME"]]
ASSET_V = hashlib.sha1((CSS + open(os.path.join(HERE, "site.js")).read()).encode()).hexdigest()[:10]

def head(title, desc, path, extra=""):
    url = SITE + path
    fav = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect x='2' y='2' width='60' height='60' rx='16' fill='%23151515'/%3E%3Ctext x='32' y='44' font-family='Arial' font-weight='900' font-size='36' text-anchor='middle' fill='%23CDF24F'%3E$%3C/text%3E%3C/svg%3E"
    return (f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
            f'<title>{e(title)}</title><meta name="description" content="{e(desc)}"><link rel="canonical" href="{e(url)}">'
            f'<meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(desc)}"><meta property="og:url" content="{e(url)}"><meta property="og:type" content="website">'
            f'<meta name="twitter:card" content="summary"><link rel="icon" href="{fav}">'
            f'<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
            f'<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@500;700&display=swap">'
            f'<link rel="stylesheet" href="/static/site.css?v={ASSET_V}">{extra}</head><body><a class="skip" href="#main">Skip to content</a>')

def header(cur=""):
    items = "".join(f'<a href="/streams/{s["slug"]}/">{e(s["title"].split(" (")[0])}<small>{e(s["category"])} · <span class="{money(s["pay_short"]).strip()}">{e(s["pay_short"])}</span></small></a>' for s in streams)
    def l(href, label, key):
        return f'<a class="l" href="{href}"{" aria-current=page" if cur == key else ""}>{label}</a>'
    return (f'<header class="top"><div class="wrap nav"><a class="mark" href="/"><i>$</i>sub-creator paid</a>'
            f'{l("/videos/", "Watch", "watch")}'
            f'<div class="dd"><button type="button" id="ddb" aria-expanded="false" aria-controls="ddm">Income streams ▾</button>'
            f'<div class="menu" id="ddm" hidden>{items}<a href="/streams/">All income streams<small>Filter by followers and type</small></a></div></div>'
            f'{l("/#finder", "AI finder", "finder")}{l("/tools/", "Tools", "tools")}{l("/blog/", "Blog", "blog")}'
            f'<button class="btn primary sm js-join" type="button">Join the free list</button>'
            f'<button class="mnav" type="button" id="mnb" aria-expanded="false" aria-controls="mnm">Menu</button></div>'
            f'<div class="wrap mmenu" id="mnm" hidden><a href="/streams/">Income streams</a><a href="/#finder">AI finder</a><a href="/videos/">Watch</a>'
            f'<a href="/tools/">Tools</a><a href="/blog/">Blog</a><a href="/tracker/">Income tracker</a><a href="/about/">How it works</a></div></header>')

def footer():
    s = lambda k, n: f'<a href="{e(SOC[k])}" rel="me noopener">{n}</a>' if SOC.get(k) else ""
    return (f'<footer><div class="wrap"><div><a class="mark" href="/" style="display:flex"><i>$</i>sub-creator paid</a>'
            f'<p style="color:var(--muted);margin-top:10px;max-width:36ch">Verified income streams for creators under 10k followers. Pay figures in USD.</p></div>'
            f'<div><h4>Explore</h4><a href="/streams/">Income streams</a><a href="/#finder">AI finder</a><a href="/tools/">Tools</a><a href="/tracker/">Income tracker</a><a href="/blog/">Blog</a></div>'
            f'<div><h4>Follow</h4>{s("instagram","Instagram")}{s("tiktok","TikTok")}{s("youtube","YouTube")}{s("telegram","Telegram")}</div>'
            f'<div><h4>About</h4><a href="/about/">How it works</a><a href="/work-with-us/">Work with us</a><a href="/disclosure/">Disclosure</a><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a></div>'
            f'<div class="fine"><span>Not financial advice. Affiliate links are marked and disclosed.</span><span>© {datetime.date.today().year} Sub-Creator Paid</span></div></div></footer>'
            + MODAL + f'<script>window.SCP={json.dumps({"news": bool(cfg.get("beehiiv_publication_id") or cfg.get("newsletter_form_url")), "tg": cfg.get("telegram", "")})}</script>'
            + '<script src="/static/site.js?v=' + ASSET_V + '" defer></script></body></html>')

MODAL = ('<div class="modal" id="modal" hidden role="dialog" aria-modal="true" aria-labelledby="mt"><div class="box"><button class="x" type="button" id="mx" aria-label="Close">×</button>'
         '<div id="mform"><h3 id="mt">Join the free list</h3><p>Get the Small Creator Income Guide and one verified income stream every Tuesday.</p>'
         '<form id="jf" novalidate><input class="hp" tabindex="-1" autocomplete="off" aria-hidden="true" id="hp" name="company">'
         '<div class="two"><label class="sr" for="fn">First name</label><input class="inp" id="fn" placeholder="First name" autocomplete="given-name">'
         '<label class="sr" for="ln">Last name</label><input class="inp" id="ln" placeholder="Last name" autocomplete="family-name"></div>'
         '<label class="sr" for="em">Email</label><input class="inp" id="em" type="email" placeholder="you@example.com" autocomplete="email">'
         '<p class="err" id="jerr" aria-live="polite"></p><button class="btn primary" type="submit" id="jgo">Send me the guide</button>'
         '<p class="hint">By joining you agree to get our emails. Unsubscribe in one click. See <a href="/privacy/">Privacy</a>.</p></form></div>'
         '<div class="done" id="mdone" hidden><b>You\'re in.</b><p id="mdmsg">You\'re on the list.</p><p style="margin-top:14px"><a class="btn primary" id="mdl" href="/files/small-creator-income-guide.pdf" target="_blank" rel="noopener">Download the free guide (PDF)</a></p></div></div></div>')

def write(rel, s):
    p = os.path.join(OUT, rel); os.makedirs(os.path.dirname(p), exist_ok=True); open(p, "w").write(s)

def page(path, title, desc, body, cur="", extra=""):
    return head(title, desc, path, extra) + header(cur) + f'<main id="main">{body}</main>' + footer()

def stream_card(s):
    return (f'<a class="card stream" href="/streams/{s["slug"]}/" data-cat="{s["cat"]}" data-zero="{1 if s["match"]["min_followers"] == 0 else 0}">'
            f'<div class="r1"><div class="ic">{e(s["letter"])}</div><div style="min-width:0"><h3>{e(s["title"].split(" (")[0])}</h3><span class="tag">{e(s["category"])}</span></div></div>'
            f'<div class="facts"><div><small>Pay</small><b class="num{money(s["pay_short"])}">{e(s["pay_short"])}</b><span class="hint" style="display:block">{e(s["pay_unit"])}</span></div>'
            f'<div><small>To start</small><b>{e(s["start"])}</b></div></div>'
            f'<div class="foot"><span>{"No follower minimum" if s["match"]["min_followers"] == 0 else "Needs an audience"}</span><span>Read the steps →</span></div></a>')

def money(x):  # green only for money amounts (new colour scheme)
    return " m" if any(c in str(x) for c in "$%") else ""

def ep(label, big, box, href, cap, sub, soon=False, img=None, logo=False):
    # img: a real picture (video thumbnail, or the tool's logo when logo=True) instead of the text card
    if img and logo:
        th = f'<div class="th logo"><img src="{img}" alt="{e(big)} logo" loading="lazy"><span class="t3">{e(box)}</span></div>'
    elif img:
        th = f'<div class="th img"><img src="{img}" alt="{e(cap)}" loading="lazy"></div>'
    else:
        th = f'<div class="th"><span class="t1">{e(label)}</span><span class="t2">{e(big)}</span><span class="t3">{e(box)}</span></div>'
    return (f'<a class="ep{" soon" if soon else ""}" href="{href}">{th}'
            f'<p class="cap">{e(cap)}<span>{e(sub)}</span></p></a>')

def finder_html():
    pills = lambda k, opts: f'<div class="pills" data-k="{k}">' + "".join(
        f'<button type="button" data-v="{v}" aria-pressed="{"true" if i == 0 else "false"}">{e(t)}</button>' for i, (v, t) in enumerate(opts)) + '</div>'
    return (f'<div class="ai"><div class="intro"><span class="badge"><i></i>AI INCOME FINDER</span><h2 style="margin-top:16px">Which income streams <em class="s">fit you?</em></h2>'
            f'<p>Paste your profile link or describe your account. The AI looks at your niche, platform and audience size, then matches you with verified income streams and the first step for each.</p>'
            f'<p class="hint" style="margin-top:14px">Free. We only use what you type here, we never log in to or post on your account, and we only quote pay figures we have checked.</p>'
            + (f'<p style="margin-top:14px"><a class="link" href="/videos/#vT1">Watch how it works (about {round(featured["T1"]["seconds"] / 60)} min) →</a></p>' if "T1" in featured else "") + '</div>'
            f'<div><form id="aif" novalidate><input class="hp" tabindex="-1" autocomplete="off" aria-hidden="true" id="aihp" name="website">'
            f'<div><label class="f" for="prof">Your profile link or a short description</label><input class="inp" type="text" id="prof" maxlength="300" placeholder="instagram.com/yourname  or  \'home cooking videos, 800 followers\'"></div>'
            f'<p class="or">AND PICK WHAT FITS</p>'
            f'<div><span class="f" style="font-weight:700;font-size:14px;display:block;margin-bottom:7px">Followers today</span>{pills("f", [("0","0 to 1k"),("1","1k to 5k"),("2","5k to 10k"),("3","10k+")])}</div>'
            f'<div><span style="font-weight:700;font-size:14px;display:block;margin-bottom:7px">Main platform</span>{pills("p", [("ig","Instagram"),("tt","TikTok"),("yt","YouTube")])}</div>'
            f'<div><span style="font-weight:700;font-size:14px;display:block;margin-bottom:7px">What do you enjoy?</span>{pills("e", [("film","Filming products"),("rec","Recommending things"),("make","Making templates"),("write","Writing")])}</div>'
            f'<p class="err" id="aierr" aria-live="polite"></p><div><button class="btn primary" type="submit" id="aigo">Find my income streams</button></div></form>'
            f'<div id="aiout" aria-live="polite" style="margin-top:18px"></div></div></div>')

def build():
    shutil.rmtree(OUT, ignore_errors=True); os.makedirs(OUT)
    shutil.copytree(os.path.join(HERE, "static"), os.path.join(OUT, "static"))
    write("static/site.css", CSS)
    shutil.copy(os.path.join(HERE, "site.js"), os.path.join(OUT, "static", "site.js"))
    finder_data = [{"slug": s["slug"], "name": s["title"].split(" (")[0], "pay": s["pay"], "why": s["one_liner"], "catch": s["catch"],
                    "enjoy": s["match"]["enjoy"], "plat": s["match"].get("platform_bonus", []), "min": (lambda m: 0 if m < 1000 else 1 if m < 5000 else 2 if m < 10000 else 3)(s["match"]["min_followers"]),
                    "first": s["match"]["first_step"]} for s in streams]
    write("static/finder.json", json.dumps(finder_data))
    pay_progs = [p for p in progs.values()]
    latest = streams[-1] if streams else None
    # ---------- home
    mq = "".join(f"<span>{e(p['name'])}</span>" for p in pay_progs)
    mq2 = "".join(f"<span>{e(p['name'])}</span>" for p in reversed(pay_progs))
    thumb = lambda slug: f"/static/th/{slug}.jpg" if os.path.exists(os.path.join(HERE, "static", "th", f"{slug}.jpg")) else None  # video thumbnail for a stream
    logo = lambda pid: next((f"/static/logos/{pid}.{x}" for x in ("svg", "png", "webp", "jpg") if os.path.exists(os.path.join(HERE, "static", "logos", f"{pid}.{x}"))), None)
    s_eps = "".join(ep(s["category"], s["pay_short"], s["pay_unit"][:24], f'/streams/{s["slug"]}/', s["title"].split(" (")[0], s["category"], img=thumb(s["slug"])) for s in streams)
    t_eps = "".join(ep("Tool", p["name"], "affiliate" if p["pays_you"] else "free tool", "/tools/", p["name"], p["category"], img=logo(p["id"]), logo=True) for p in pay_progs[:6])
    w_eps = "".join(ep(f'Video {v["n"]}', v["title"][:22], f'{v["seconds"]} s', f'/videos/#v{v["n"]}', v["title"], "Watch + free guide", img=v.get("poster")) for v in videos[:6]) or \
        ep("Coming soon", "Your question", "answered", "/#finder", "First episode soon", "Ask in the comments", True)
    # motion graphics (no character, owner 27 Oct): payout card, $0 dashboard, growing bars, cycling tool logos, $0 -> $50 counter
    spark = lambda d, c: f'<svg class="spark" viewBox="0 0 120 40" preserveAspectRatio="none"><path d="{d}" stroke="{c}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round" pathLength="1"/></svg>'
    GFX = {
        "loss": '<div class="wg"><small>YOUR DASHBOARD</small><div class="kv"><span>Views</span><b>2.4M</b></div><div class="kv"><span>Earned</span><b class="l">$0.00</b></div>' + spark("M2 30 L20 31 L38 29 L56 32 L74 30 L92 31 L118 30", "var(--loss)") + '</div>',
        "hero": '<div class="wg"><small>PAYOUT</small><div class="pay">+$50</div><span class="sub">UGC video · 0 followers needed</span>' + spark("M2 36 L20 33 L38 34 L56 24 L74 26 L92 12 L118 4", "var(--money)") + '</div>',
        "stream": '<div class="bars">' + "".join(f'<i style="--h:{h}%;animation-delay:{k * .18}s"></i>' for k, h in enumerate((28, 46, 38, 64, 58, 86))) + '</div>',
        "tools": '<div class="cyc">' + "".join(f'<span style="animation-delay:{k * 2}s"><img src="/static/logos/{pid}.png" alt=""></span>' for k, pid in enumerate(("beehiiv", "kit", "stan", "skool", "elevenlabs", "opusclip"))) + '</div>',
        "wins": '<div class="flip"><span class="a">$0</span><span class="b">+$50</span></div>',
    }
    sman = lambda img, c, t: f'<div class="sman" style="--c:{c}" aria-hidden="true"><div class="gbox">{GFX[img]}</div><b>{t}</b></div>'
    belt = lambda eps, n: f'<div class="row belt" style="--sp:{max(30, n * 7)}s"><div class="tr">{eps}<div style="display:contents" aria-hidden="true">{eps}</div></div></div>'
    slides = [v for v in videos if v.get("poster")]  # video covers for the phone slideshow (the hook clips open on near-empty frames)
    hero_card = ""
    if latest:
        words = latest["title"].split(" (")[0]
        hero_card = (f'<div class="heroimg"><div class="in"><span class="live">NEW INCOME STREAM</span><h2>{e(words)}: <em class="s{money(latest["pay_short"])}">{e(latest["pay_short"])}</em></h2>'
                     f'<p>{e(latest["one_liner"])} Followers needed: {e(latest["followers"].split(".")[0])}.</p><div><a class="link" href="/streams/{latest["slug"]}/">Read the steps →</a></div></div>'
                     + (f'<a class="vframe img dslide" href="/videos/" aria-label="Watch the latest videos">'
                        + "".join(f'<img src="{v["poster"]}" alt="" style="animation-delay:{i * 3}s">' for i, v in enumerate(slides[:4]))
                        + '<span class="playbig" aria-hidden="true"></span></a></div>' if len(slides) >= 4 else
                        f'<a class="vframe img" href="/streams/{latest["slug"]}/" aria-label="{e(words)}"><img src="{thumb(latest["slug"])}" alt=""><span class="playbig" aria-hidden="true"></span></a></div>' if thumb(latest["slug"]) else
                     f'<a class="vframe" href="/streams/{latest["slug"]}/" aria-label="{e(words)}"><span class="sun" aria-hidden="true">$</span><span class="a">{e(latest["category"])}</span>'
                     f'<span class="b">{e(latest["pay_short"])}</span><span class="c">{e(latest["pay_unit"])}</span><span class="playbig" aria-hidden="true"></span></a></div>'))
    posts_html = "".join(f'<a class="essay" href="/blog/{p["slug"]}/"><p class="eyebrow">{e(p["tag"])}</p><h3>{e(p["title"])}</h3><p>{e(p["dek"])}</p><small>{e(str(p["minutes"]))} MIN READ</small></a>' for p in posts[:3])
    if not posts_html:
        posts_html = "".join(f'<a class="essay" href="/streams/{s["slug"]}/"><p class="eyebrow">{e(s["category"])}</p><h3>{e(s["title"].split(" (")[0])}: the full guide</h3><p>{e(s["one_liner"])}</p><small>CHECKED {e(s["checked"])}</small></a>' for s in streams[:3])
    stack = "".join(f'<div>{e(s["title"].split(" (")[0])} <span>{e(s["pay_short"])}</span></div>' for s in streams[:4])
    man = lambda side, img, c, t1, t2, coin: (f'<div class="man {side}" style="--c:{c}" aria-hidden="true"><span class="ring"></span><span class="halo"></span>'
                                             + "".join(f'<span class="coin">{coin}</span>' for _ in range(3)) + f'{GFX[img]}<span class="tag2 t1">{t1}</span><span class="tag2 t2">{t2}</span></div>')
    home = (f'<section class="wrap hero">' + f'<p class="eyebrow">For creators under 10k followers</p><h1 style="margin-top:18px">Small account.<br><em class="s m">Real income.</em></h1>'
            f'<p class="bio">Sub-Creator Paid finds the ways small creators actually get paid, checks every number on the official page, and turns it into a short video and a step-by-step guide.</p>'
            f'<div class="ctas"><a class="btn primary" href="#finder">Find my income streams</a><a class="btn" href="#watch">Watch the latest videos</a></div>'
            f'<div class="cred"><span><b>{len(streams)}</b> income streams verified</span><span><b>USD</b> pay figures</span><span><b>Every</b> affiliate link disclosed</span></div>{hero_card}</section>'
            f'<section class="s wrap" id="finder" style="padding-top:70px">{finder_html()}</section>'
            f'<section class="strip" aria-label="Programs and tools we have checked"><p class="k">Programs and tools we\'ve checked</p>'
            f'<div class="mq"><div class="tr">{mq}{mq}</div></div><div class="mq rev" style="margin-top:12px"><div class="tr">{mq2}{mq2}</div></div></section>'
            f'<section class="s wrap" id="watch"><div class="shead"><div><h2>Three series, <em class="s">one goal.</em></h2><p>Get your first income before your account is big. Each series answers a different question.</p></div></div>'
            f'<div class="series"><div><p class="eyebrow">Daily · 60 seconds</p><h3 style="margin-top:8px">Stream of the Day</h3><p>One verified way to get paid: the pay, the catch and the first steps.</p><a class="link" href="/streams/">All income streams →</a>{sman("stream", "var(--money)", "Get paid")}</div>{belt(s_eps, len(streams))}</div>'
            f'<div class="series"><div><p class="eyebrow">Weekly</p><h3 style="margin-top:8px">Tools That Pay</h3><p>Creator tools with fair referral programs, checked before we mention them.</p><a class="link" href="/tools/">All tools →</a>{sman("tools", "var(--ink)", "Checked")}</div>{belt(t_eps, 6)}</div>'
            f'<div class="series"><div><p class="eyebrow">Fridays</p><h3 style="margin-top:8px">Small Account Wins</h3><p>Your questions answered, and real numbers from creators under 10k.</p><a class="link" href="/videos/">All videos →</a>{sman("wins", "var(--loss)", "No fake payouts")}</div>{belt(w_eps, 6)}</div></section>'
            f'<section class="metrics" aria-label="Site numbers"><div class="wrap"><div><b class="num">100%</b><span>of pay figures linked to the official page</span></div>'
            f'<div><b class="num">{len(streams)}</b><span>income stream guides, each with sources</span></div><div><b class="num">{len(progs)}</b><span>creator tools listed, free plans marked</span></div>'
            f'<div><b class="num">$0</b><span>to use the finder, tracker and guides</span></div></div></section>'
            f'<section class="s wrap" id="guide"><div class="feature"><div><p class="eyebrow">Free guide</p><h2 style="margin-top:12px">Get paid before you go <em class="s">viral.</em></h2>'
            f'<p>The Small Creator Income Guide: every income stream that works under 10k followers, with pay ranges, requirements and the first week of steps for each.</p><button class="btn primary js-join" type="button">Send me the guide</button></div>'
            f'<div class="book" role="img" aria-label="The Small Creator Income Guide cover"><div class="cover"><small>SUB-CREATOR PAID</small><b>The Small Creator Income Guide</b><small>FREE · PDF</small></div><div class="pg"><span>{len(streams)}+</span>income streams<br>under 10k</div></div></div></section>'
            f'<section class="s wrap"><div class="shead"><div><h2>Guides <em class="s">in the open.</em></h2><p>Deeper than a 60-second video. Facts dated and sourced.</p></div><a class="link" href="/blog/">All posts →</a></div><div class="cards">{posts_html}</div></section>'
            f'<section class="s wrap" id="how"><div class="bts"><div><span class="live">HOW THIS SITE WORKS</span><h2 style="margin-top:12px">One person. <em class="s">An AI team.</em></h2>'
            f'<p>Research, scripts, editing and fact checks are done with AI tools, and nothing goes out until a person approves it. Every pay figure links to its source.</p><a class="link" href="/about/">See how it works →</a></div>'
            f'<div class="flow"><div><i>01</i>Research: new programs and rate changes</div><div><i>02</i>Fact check against official pages</div><div><i>03</i>Script, video and captions</div>'
            f'<div class="you"><i>OK</i>A person reviews and approves</div><div><i>05</i>Published to TikTok, Instagram and YouTube</div></div></div></section>'
            f'<section class="wrap"><div class="join"><div class="in"><p class="eyebrow" style="color:var(--lime)">Free weekly email</p><h2>Join the <em class="s">free list.</em></h2>'
            f'<p>One verified income stream every Tuesday, plus the free guide when you join. No spam, unsubscribe in one click.</p><div><button class="btn primary js-join" type="button">Join the free list</button></div></div>'
            f'<div class="img" aria-hidden="true"><div class="stack">{stack}</div></div></div></section>')
    ld = {"@context": "https://schema.org", "@type": "WebSite", "name": cfg["site_name"], "url": SITE + "/", "sameAs": [v for v in SOC.values() if v]}
    write("index.html", page("/", f'{cfg["site_name"]}: verified income streams for small creators', "Verified ways to earn with under 10k followers: pay, catch and first steps for each, plus a free AI income finder.",
                             home, "", f'<script type="application/ld+json">{json.dumps(ld)}</script>'))
    # ---------- streams index
    chips = '<div class="filters" role="group" aria-label="Filter income streams"><button type="button" class="chip on" data-f="all">All</button><button type="button" class="chip" data-f="zero">No follower minimum</button>' + "".join(
        f'<button type="button" class="chip" data-f="{c}">{e(n)}</button>' for c, n in sorted({(s["cat"], s["category"]) for s in streams})) + '</div>'
    write("streams/index.html", page("/streams/", "Income streams for small creators", "Every verified income stream for creators under 10k followers, with pay, requirements and first steps.",
          f'<section class="wrap page"><p class="eyebrow">Income stream library</p><h1 style="margin-top:12px">Pick a way to <em class="s m">get paid.</em></h1>'
          f'<p class="lead">Each page shows the pay, the catch, the first steps and the sources. Not sure where to start? Try the <a href="/#finder">AI finder</a>.</p></section>'
          f'<section class="wrap">{chips}<div class="cards" id="scards">{"".join(stream_card(s) for s in streams)}</div><p class="hint" id="noneleft" hidden style="margin-top:14px">No streams match this filter yet.</p></section>'))
    # ---------- stream pages
    for i, s in enumerate(streams):
        nm = s["title"].split(" (")[0]; nxt = streams[(i + 1) % len(streams)]
        labels = s.get("step_labels") or [" ".join(x.split()[:2]) for x in s["steps"]]
        rail = "".join(f'<div class="{"on" if j == 0 else ""}"><small>STEP {j + 1}</small>{e(labels[j] if j < len(labels) else "")}</div>' for j, x in enumerate(s["steps"]))
        steps = "".join(f'<div class="card stepcard{" on" if j == 0 else ""}" data-i="{j}"><div class="n">{j + 1}</div><div><p style="font-size:17px">{e(x)}</p></div></div>' for j, x in enumerate(s["steps"]))
        tools = "".join(f'<li><a href="/go/{t}/" rel="sponsored noopener" target="_blank">{e(progs[t]["name"])}</a>{" <span class=tag>affiliate</span>" if progs[t]["pays_you"] else ""}<br><span class="hint">{e(progs[t]["for"])}</span></li>' for t in s["tools"] if t in progs)
        src = "".join(f'<p style="margin-top:8px"><a href="{e(u)}" rel="noopener" target="_blank">{e(t)}</a></p>' for t, u in s["sources"])
        comments = (f'<div class="card cm-box" id="comments" data-page="{s["slug"]}"><h3>Questions from creators</h3>'
                    f'<p class="hint" style="margin-top:6px">Ask anything about {e(nm)}. Comments appear after a quick review.</p>'
                    f'<div class="cm-list" aria-live="polite"></div>'
                    f'<form class="cm-form" novalidate><label class="lbl" for="cmn">Name</label><input class="inp" id="cmn" maxlength="40" autocomplete="nickname" placeholder="Your name or nickname">'
                    f'<label class="lbl" for="cmb">Your question or comment</label><textarea class="inp" id="cmb" rows="4" maxlength="1000" placeholder="e.g. Do I need a business account for this?"></textarea>'
                    f'<input type="text" name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">'
                    f'<p class="cm-msg hint" role="status"></p><button class="btn primary" type="submit">Post comment</button>'
                    f'<p class="hint">Please don\'t share personal details. See <a href="/privacy/">Privacy</a>.</p></form></div>')
        cus = ""
        art = {"@context": "https://schema.org", "@type": "Article", "headline": f"{nm}: how small creators earn", "dateModified": s["checked"], "author": {"@type": "Organization", "name": cfg["site_name"]}}
        body = (f'<div class="wrap"><p class="crumb"><a href="/streams/">Income streams</a> / {e(s["category"])} / {e(nm)}</p><div class="phead"><div><p class="eyebrow">{e(s["category"])}</p>'
                f'<h1 style="margin-top:12px;font-size:clamp(38px,6vw,68px);font-weight:900;letter-spacing:-.04em">{e(nm)}</h1><p class="lead" style="font-size:19px;color:var(--muted);margin-top:16px;max-width:48ch">{e(s["one_liner"])}</p>'
                f'<div class="meta"><span class="tag">{"No follower minimum" if s["match"]["min_followers"] == 0 else "Needs an audience"}</span><span class="tag">Last checked {e(s["checked"])}</span><span class="tag warn">Rules can change</span></div></div>'
                f'<div class="card facts-card"><dl><div><dt>Followers needed</dt><dd>{e(s["followers"])}</dd></div><div><dt>What it pays</dt><dd class="num">{e(s["pay"])}</dd></div>'
                f'<div><dt class="l">The catch</dt><dd>{e(s["catch"])}</dd></div><div><dt>Great for</dt><dd>{e(", ".join(s["great_for"]))}</dd></div></dl></div></div>'
                f'<div class="body2"><article class="article"><h2>How to start</h2><div class="rail" id="rail" style="--n:{len(s["steps"])}">{rail}</div>{steps}'
                f'<div class="callout l"><b>The catch:</b> {e(s["catch"])}</div>{comments}</article>'
                f'<aside class="side"><div class="card"><p class="eyebrow">Tools for this stream</p><ul class="toolli">{tools}</ul><p class="hint" style="margin-top:10px">Links marked affiliate may earn us a commission at no cost to you. <a href="/disclosure/">Disclosure</a></p></div>'
                f'<div class="card"><p class="eyebrow">Sources</p>{src}<p class="hint" style="margin-top:8px">Check the official page before you rely on any number.</p></div>'
                f'<div class="card"><p class="eyebrow">Next stream</p><a href="/streams/{nxt["slug"]}/" style="text-decoration:none"><b style="display:block;margin-top:8px;font-size:18px">{e(nxt["title"].split(" (")[0])}</b><span class="hint">{e(nxt["pay_short"])} {e(nxt["pay_unit"])}</span></a></div>'
                f'<button class="btn primary js-join" type="button">Get the free guide</button></aside></div></div>')
        write(f"streams/{s['slug']}/index.html", page(f"/streams/{s['slug']}/", f"{nm}: how small creators earn (checked {s['checked']})", s["one_liner"], body, "",
                                                         f'<script type="application/ld+json">{json.dumps(art)}</script>{cus}'))
    # ---------- tools
    rows = "".join(f'<tr><td><a href="/go/{p["id"]}/" rel="sponsored noopener" target="_blank"><b>{e(p["name"])}</b></a></td><td>{e(p["category"])}</td><td>{e(p["for"])}</td>'
                   f'<td>{"Yes" if p["free_plan"] else "No"}</td><td>{"Affiliate" if p["pays_you"] else "No"}</td></tr>' for p in sorted(progs.values(), key=lambda p: (p["category"], p["name"])))
    write("tools/index.html", page("/tools/", "Tools for small creators", "Creator tools for small accounts: what each is for and whether there is a free plan.",
          f'<section class="wrap page"><p class="eyebrow">Tools that pay</p><h1 style="margin-top:12px">Tools for <em class="s">small creators.</em></h1><p class="lead">What each tool is for and whether there\'s a free plan. Links marked Affiliate may earn us a commission if you sign up; free options are listed too.</p></section>'
          f'<section class="wrap"><div class="card tablewrap" style="padding:8px 18px"><table><thead><tr><th>Tool</th><th>Type</th><th>Use it for</th><th>Free plan</th><th>Our link</th></tr></thead><tbody>{rows}</tbody></table></div>'
          f'<p class="hint" style="margin-top:12px">Checked {e(cfg["updated"])}. Plans and terms change, so check the tool\'s own page.</p></section>', "tools"))
    # ---------- tracker
    opts = "".join(f'<option>{e(p["name"])}</option>' for p in sorted(progs.values(), key=lambda p: p["name"]))
    write("tracker/index.html", page("/tracker/", "Free income tracker for creators", "Track every creator program you join and what it pays you. Free, saved on your device only.",
          f'<section class="wrap page"><p class="eyebrow">Free tool</p><h1 style="margin-top:12px">Income <em class="s">tracker.</em></h1><p class="lead">Add each program you join and what it paid you this month. It saves on this device only: nothing is sent anywhere.</p></section>'
          f'<section class="wrap"><div class="card" style="padding:20px"><div class="trow"><label class="sr" for="tprog">Program</label><select class="inp" id="tprog"><option value="">Choose a program…</option>{opts}<option>Other</option></select>'
          f'<label class="sr" for="tstat">Status</label><select class="inp" id="tstat"><option>Applied</option><option>Joined</option><option>First payout</option></select>'
          f'<label class="sr" for="tamt">Amount this month</label><input class="inp" id="tamt" type="number" min="0" step="0.01" placeholder="$ this month"><button class="btn primary sm" id="tadd" type="button">Add</button></div><p class="err" id="terr"></p></div>'
          f'<div class="card tablewrap" style="padding:8px 18px;margin-top:18px"><table id="tt"><thead><tr><th>Program</th><th>Status</th><th>This month ($)</th><th></th></tr></thead><tbody></tbody></table>'
          f'<p style="padding:10px"><b>Total this month: $<span id="ttot" class="num">0.00</span></b></p></div></section>'))
    # ---------- blog
    blist = "".join(f'<a class="essay" href="/blog/{p["slug"]}/"><p class="eyebrow">{e(p["tag"])}</p><h3>{e(p["title"])}</h3><p>{e(p["dek"])}</p><small>{e(p["date"])} · {p["minutes"]} MIN READ</small></a>' for p in posts)
    write("blog/index.html", page("/blog/", "Blog: income guides for small creators", "Long-form guides on earning with a small account. Every fact dated and sourced.",
          f'<section class="wrap page"><p class="eyebrow">Blog</p><h1 style="margin-top:12px">Guides <em class="s">in the open.</em></h1><p class="lead">Deeper than a 60-second video. Every fact dated and sourced.</p></section>'
          f'<section class="wrap"><div class="cards">{blist or posts_html}</div>{"" if blist else "<p class=hint style=margin-top:14px>The first long-form posts are on the way. Until then, each income stream page is a full guide.</p>"}</section>', "blog"))
    for p in posts:
        bl = {"@context": "https://schema.org", "@type": "BlogPosting", "headline": p["title"], "datePublished": p["date"], "author": {"@type": "Organization", "name": cfg["site_name"]}}
        write(f"blog/{p['slug']}/index.html", page(f"/blog/{p['slug']}/", p["title"], p["dek"],
              f'<article class="wrap page prose"><p class="crumb"><a href="/blog/">Blog</a></p><p class="eyebrow" style="margin-top:20px">{e(p["tag"])} · {e(p["date"])}</p><h1 style="margin-top:12px">{e(p["title"])}</h1><p class="lead">{e(p["dek"])}</p>{p["html"]}</article>',
              "blog", f'<script type="application/ld+json">{json.dumps(bl)}</script>'))
    # ---------- simple pages
    simple = {
        "about": ("How Sub-Creator Paid works", "How the site and videos are made, checked and approved.",
                  '<h1>How it <em class="s">works.</em></h1><p class="lead">One person runs Sub-Creator Paid with a team of AI tools. Here is exactly how a video or page is made.</p>',
                  (f'<article class="card vcard" style="max-width:380px;margin-bottom:36px"><video controls preload="none" playsinline poster="{featured["B1"]["poster"]}" src="{featured["B1"]["video"]}"></video>'
                   f'<div class="vbody"><p class="eyebrow">Who we are · {featured["B1"]["seconds"]} s</p></div></article>' if "B1" in featured else "")
                  + '<div class="prose"><h2>1. Research</h2><p>AI tools watch for new creator programs, rate changes and questions from small creators.</p><h2>2. Fact check</h2><p>Every pay figure, requirement and rule is checked on the official page and dated. If we cannot confirm it, we do not publish it.</p>'
                  '<h2>3. Make</h2><p>Scripts, videos, captions and pages are drafted with AI tools in our own style.</p><h2>4. Approve</h2><p>A person reviews everything. Nothing goes live without that approval.</p>'
                  '<h2>5. Publish and keep it fresh</h2><p>Content goes out on TikTok, Instagram, YouTube and this site. Pages show a "last checked" date and are rechecked regularly.</p></div>'),
        "work-with-us": ("Work with Sub-Creator Paid", "Sponsorships and partnerships with Sub-Creator Paid.",
                         '<h1>Work <em class="s">with us.</em></h1><p class="lead">We work with tools and programs that genuinely help small creators earn.</p>',
                         f'<div class="prose"><p>Our audience is creators under 10k followers looking for real ways to earn. Sponsored videos and pages are always labelled "Sponsored" or "Ad", and we only partner with products we would recommend anyway.</p>'
                         f'<p>To get in touch, message us on <a href="{e(cfg.get("telegram", "/"))}">Telegram</a> or Instagram <a href="{e(SOC.get("instagram", "/"))}">{e(cfg["handle"])}</a>. A media kit with current numbers is available on request.</p></div>'),
        "disclosure": ("How this site makes money", "Affiliate and sponsorship disclosure for Sub-Creator Paid.",
                       '<h1>How this site <em class="s m">makes money.</em></h1><p class="lead">Straight answer: affiliate links, our own guides, and clearly labelled sponsors.</p>',
                       '<div class="prose"><p>Some tool links are affiliate links (marked "affiliate"). If you sign up through them, the company may pay us a commission. It costs you nothing extra.</p>'
                       '<p>We list free options even when they pay us nothing, and every income stream page shows the catch and its sources. Commissions never change what we say about a program.</p>'
                       '<p>Sponsored videos or pages always say "Sponsored" or "Ad". As an Amazon Associate we earn from qualifying purchases where Amazon links are used.</p><p>Nothing on this site is financial advice.</p></div>'),
        "privacy": ("Privacy", "How Sub-Creator Paid handles your data.",
                    '<h1>Privacy</h1><p class="lead">Short version: we collect as little as possible.</p>',
                    f'<div class="prose"><p><b>Email list.</b> If you join, your name and email are stored in our own database (hosted by Cloudflare) and, once our newsletter starts, by our newsletter provider (beehiiv). We use them only to send the guide and our emails, never sell them, and you can unsubscribe at any time with one click or by emailing us.</p>'
                    f'<p><b>AI finder.</b> What you type is sent to our server and an AI model to create your matches. We do not store it with your identity, and we never log in to or post on your accounts.</p>'
                    f'<p><b>Income tracker.</b> Saved only in your own browser. It never leaves your device.</p><p><b>Comments.</b> If you comment, your name and comment are stored in our own database (hosted by Cloudflare) and shown after approval. We do not store your IP address; we keep a one-way scrambled code for a day to block spam.</p>'
                    f'<p><b>Analytics and fonts.</b> We use privacy-friendly, cookie-free analytics from Cloudflare. Some fonts load from Google Fonts. We do not use advertising cookies.</p>'
                    f'<p>Contact: {e(cfg.get("owner_contact_email") or cfg["handle"])}. Last updated {e(cfg["updated"])}.</p></div>'),
        "terms": ("Terms", "Terms of use for Sub-Creator Paid.",
                  '<h1>Terms</h1><p class="lead">Using this site means you agree to these simple terms.</p>',
                  '<div class="prose"><p>Content is for general information only and is not financial, legal or tax advice. Programs change their rules and pay; always check the official page before you rely on a number.</p>'
                  '<p>We are not responsible for third-party sites or programs we link to. Do not misuse the AI finder or comments (no spam, abuse or automated requests).</p><p>Content © Sub-Creator Paid. You may share links freely.</p></div>'),
    }
    for slug, (t, d, top, body) in simple.items():
        write(f"{slug}/index.html", page(f"/{slug}/", t, d, f'<section class="wrap page">{top}</section><section class="wrap">{body}</section>'))
    write("guide/index.html", page("/guide/", "Free Small Creator Income Guide", "Every way to get paid with under 10k followers.",
          f'<section class="wrap page"><h1>The Small Creator <em class="s">Income Guide.</em></h1><p class="lead">Every way to get paid with under 10k followers: what each stream pays, what it needs, the catch, and the tools to start. Free PDF, {len(streams)} verified streams, facts checked {e(max(x["checked"] for x in streams))}.</p>'
          f'<p style="margin-top:24px"><button class="btn primary js-join" type="button">Send me the guide</button></p>'
          f'<p class="hint" style="margin-top:14px">Join the free list and the download opens straight away. Already joined? <a href="/files/small-creator-income-guide.pdf">Download the PDF</a>.</p></section>'))
    # ---------- link-in-bio page (used in Instagram, TikTok and YouTube bios)
    latest = sorted(streams, key=lambda x: x["checked"], reverse=True)[:5]
    lnk = lambda href, title, sub, extra="": f'<a class="card lb" href="{href}"{extra}><b>{title}</b><span>{sub}</span></a>'
    tools_live = [p for p in progs.values() if p.get("referral_url")]
    write("links/index.html", page("/links/", "Sub-Creator Paid links", "The free guide, this week's income streams and the tools from the videos.",
          '<section class="wrap page lbw"><div class="lbhead"><span class="dot">$</span><h1 style="font-size:34px">Sub-Creator Paid</h1><p class="lead" style="font-size:17px">Verified income streams for creators under 10k.</p></div>'
          '<button class="btn primary js-join lbbig" type="button">Get the free Small Creator Income Guide</button>'
          '<p class="eyebrow" style="margin-top:28px">From the videos</p>'
          + "".join(lnk(f"/streams/{x['slug']}/", e(x["title"]), e(x["one_liner"])) for x in latest)
          + '<p class="eyebrow" style="margin-top:28px">Tools from the videos</p>'
          + "".join(lnk(f"/go/{p['id']}/", e(p["name"]) + ' <span class="tag">affiliate</span>', e(p["for"]), ' rel="sponsored noopener"') for p in tools_live)
          + '<p class="hint" style="margin-top:8px">Links marked affiliate may earn us a commission at no cost to you. <a href="/disclosure/">Disclosure</a></p>'
          + '<p class="eyebrow" style="margin-top:28px">More</p>' + lnk("/", "Website", "All income streams, the AI income finder and the tracker") + lnk(e(cfg.get("telegram", "/")), "Telegram", "One income stream a day")
          + '</section>'))
    write("404.html", page("/404", "Page not found", "Page not found.", '<section class="wrap page"><h1>Page not <em class="s">found.</em></h1><p class="lead"><a href="/">Go to the home page</a> or <a href="/streams/">browse income streams</a>.</p></section>'))
    # ---------- downloadable files (free guide)
    if os.path.isdir(os.path.join(HERE, "files")): shutil.copytree(os.path.join(HERE, "files"), os.path.join(OUT, "files"), dirs_exist_ok=True)
    # ---------- videos
    if videos or featured:
        def vcard(v):
            src = "".join(f'<li><a href="{e(x["url"])}" rel="noopener" target="_blank">{e(x["title"])}</a></li>' for x in v["sources"])
            return (f'<article class="card vcard" id="v{v["n"]}"><video controls preload="none" playsinline poster="{v["poster"]}" src="{v["video"]}"></video>'
                    f'<div class="vbody"><p class="eyebrow">{"Start here" if v.get("featured") else "Video " + e(v["n"])} · {v["seconds"]} s</p><h3>{e(v["title"])}</h3><p style="white-space:pre-line">{e(v["about"])}</p>'
                    f'<p style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn primary" href="{v["guide"]}" target="_blank" rel="noopener">Free guide (PDF)</a><a class="btn" href="/#finder">Try the AI finder</a></p>'
                    + (f'<details><summary>Sources</summary><ul>{src}</ul></details>' if src else "") + '</div></article>')
        write("videos/index.html", page("/videos/", f'Videos: {cfg["site_name"]}', "Short videos on income streams that pay small creators, with the free guide and the sources for each.",
              f'<section class="wrap page"><p class="eyebrow">Watch</p><h1>Short videos, <em class="s">real numbers.</em></h1>'
              f'<p class="lead" style="max-width:56ch;color:var(--muted);margin-top:14px">Every video shows the number, the source and the catch. Grab the free guide under each one, or try the <a href="/#finder">AI finder</a>.</p></section>'
              + (f'<section class="wrap"><p class="eyebrow">Start here</p><div class="vgrid" style="margin-top:14px">{"".join(vcard(v) for v in featured.values())}</div></section>' if featured else "")
              + f'<section class="wrap" style="margin-top:40px"><p class="eyebrow">Latest videos</p><div class="vgrid" style="margin-top:14px">{"".join(vcard(v) for v in videos)}</div></section>', "watch"))
    # ---------- redirects, headers, sitemap, robots
    redir = "".join(f"/go/{p['id']}/ {p['referral_url'] or p['official_url']} 302\n/go/{p['id']} {p['referral_url'] or p['official_url']} 302\n" for p in progs.values())
    write("_redirects", redir)
    write("_headers", "/*\n  X-Content-Type-Options: nosniff\n  X-Frame-Options: DENY\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n"
          "  Strict-Transport-Security: max-age=31536000; includeSubDomains\n"
          "  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cusdis.com https://static.cloudflareinsights.com https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cusdis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; frame-src https://cusdis.com https://challenges.cloudflare.com; connect-src 'self' https://cusdis.com https://cloudflareinsights.com; base-uri 'self'; form-action 'self'\n"
          "/static/*\n  Cache-Control: public, max-age=86400\n")
    urls = ["/", "/streams/", "/tools/", "/tracker/", "/blog/", "/guide/", "/links/", "/about/", "/work-with-us/", "/disclosure/", "/privacy/", "/terms/"] + [f"/streams/{s['slug']}/" for s in streams] + [f"/blog/{p['slug']}/" for p in posts] + (["/videos/"] if videos or featured else [])
    write("sitemap.xml", '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + "".join(f"<url><loc>{SITE}{u}</loc><lastmod>{TODAY}</lastmod></url>" for u in urls) + "</urlset>")
    if cfg.get("indexnow_key"): write(f"{cfg['indexnow_key']}.txt", cfg["indexnow_key"])
    write("robots.txt", f"User-agent: *\nAllow: /\nDisallow: /go/\nSitemap: {SITE}/sitemap.xml\n")
    write("llms.txt", f"# {cfg['site_name']}\n\n> Verified income streams for creators under 10k followers. Pay figures in USD, every fact dated and sourced.\n\n" + "".join(f"- [{s['title']}]({SITE}/streams/{s['slug']}/): {s['one_liner']}\n" for s in streams))
    n = sum(len(f) for _, _, f in os.walk(OUT)); print(f"built {n} files into {OUT}")

if __name__ == "__main__":
    build()
