"""Website look options (owner ask, 29 Oct 2026: "change the graphics of the website, give me 5 previews to select one").
build.py appends THEMES[SITE_THEME] to the base CSS when the SITE_THEME env var is set; the live site uses no theme until
the owner picks one. All five keep the brand palette: off-white, ink, lime (#CDF24F), red only for loss."""

THEMES = {
# 1. Lime Glass: frosted white cards, no hard outlines, big soft lime light, extra-round corners.
"glass": r"""
body{background:#F5F5F2;background-image:radial-gradient(1100px 700px at 50% -10%,rgba(205,242,79,.45),transparent 70%),radial-gradient(700px 500px at 100% 40%,rgba(205,242,79,.18),transparent 70%)}
.card,.heroimg,.ai,.join,.stream,.essay,.vcard,.man .wg{border:1px solid rgba(255,255,255,.7)!important;border-radius:32px!important;box-shadow:0 30px 80px rgba(14,14,16,.10),inset 0 1px 0 #fff!important}
.heroimg,.card,.stream,.essay{background:rgba(255,255,255,.62)!important;backdrop-filter:blur(18px)}
header.top{background:rgba(245,245,242,.6);border-bottom:0}
.btn{border-radius:999px;border-color:transparent;box-shadow:0 10px 30px rgba(14,14,16,.12)}
.btn.primary{background:#0E0E10}.btn.primary:hover{box-shadow:0 14px 40px rgba(205,242,79,.8)}
.hero h1 em.s{background:#CDF24F;color:#0E0E10;box-shadow:0 20px 60px rgba(205,242,79,.7)}
.mq span{background:rgba(255,255,255,.7);border:0;box-shadow:0 8px 24px rgba(14,14,16,.06)}
.ai{background:rgba(14,14,16,.92)!important}
""",
# 2. Midnight: the whole site in ink with lime accents (like the end of the launch film).
"midnight": r"""
:root{--bg:#0E0E10;--paper:#17171A;--ink:#F4F4F0;--muted:#A3A39C;--line:#2A2A2E;--acc:#CDF24F;--acc-soft:#22261A;color-scheme:dark}
body{background:#0E0E10;background-image:radial-gradient(900px 600px at 50% -10%,rgba(205,242,79,.20),transparent 70%)}
header.top{background:rgba(14,14,16,.85);border-bottom:1px solid #222}
.card,.heroimg,.stream,.essay,.vcard,.join{border:1px solid #2A2A2E!important;box-shadow:0 30px 80px rgba(0,0,0,.5)!important}
.btn{background:#17171A;color:#F4F4F0;border-color:#3A3A3E}.btn.primary{background:#CDF24F;border-color:#CDF24F;color:#0E0E10;box-shadow:0 10px 40px rgba(205,242,79,.35)}
em.s{background:#F4F4F0;color:#0E0E10}em.s.m{background:#CDF24F;color:#0E0E10}
.mark i{background:#CDF24F;color:#0E0E10}
.m{color:#CDF24F;background:none}
.man .wg{background:#17171A;color:#F4F4F0;border-color:#333}
.mq span{background:#17171A;border-color:#2A2A2E;color:#F4F4F0}
.vframe{filter:none}
.metrics{background:#CDF24F!important;color:#0E0E10!important}.metrics *{color:#0E0E10!important}
.link{border-color:#CDF24F}.eyebrow{color:#CDF24F}
.ai{background:#17171A!important;color:#F4F4F0!important;border:1px solid #2A2A2E!important}.ai h2,.ai label,.ai .f{color:#F4F4F0!important}.ai .inp{background:#0E0E10!important;color:#F4F4F0!important;border-color:#333!important}
.ai .pills button{background:#0E0E10!important;color:#F4F4F0!important;border-color:#333!important}.ai .pills button[aria-pressed="true"]{background:#CDF24F!important;color:#0E0E10!important}.ai em.s{background:#CDF24F!important;color:#0E0E10!important}.ai .btn.primary{background:#CDF24F!important;color:#0E0E10!important;border-color:#CDF24F!important}
""",
# 3. Grid Studio: graph-paper background, thick ink outlines, hard lime offset shadows (bold and graphic).
"studio": r"""
body{background:#F5F5F2;background-image:linear-gradient(rgba(14,14,16,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(14,14,16,.06) 1px,transparent 1px);background-size:32px 32px}
.card,.heroimg,.ai,.join,.stream,.essay,.vcard,.man .wg{border:3px solid #0E0E10!important;border-radius:18px!important;box-shadow:10px 10px 0 #CDF24F,10px 10px 0 3px #0E0E10!important}
.btn{border:3px solid #0E0E10;border-radius:14px;box-shadow:5px 5px 0 #0E0E10}.btn:hover{transform:translate(-2px,-2px);box-shadow:7px 7px 0 #0E0E10}
.btn.primary{background:#CDF24F;color:#0E0E10;border-color:#0E0E10;box-shadow:5px 5px 0 #0E0E10}
.hero h1{text-transform:uppercase;letter-spacing:-.05em}
.hero h1 em.s{background:#CDF24F;color:#0E0E10;border:3px solid #0E0E10;box-shadow:8px 8px 0 #0E0E10;transform:rotate(-1.5deg)}
.mq span{border:2.5px solid #0E0E10;border-radius:10px;box-shadow:3px 3px 0 #0E0E10}
.tag,.badge{border-radius:6px}
header.top{border-bottom:3px solid #0E0E10;background:#F5F5F2}
@media(max-width:760px){.card,.heroimg,.ai,.join,.stream,.essay,.vcard{box-shadow:6px 6px 0 #CDF24F,6px 6px 0 3px #0E0E10!important;margin-right:9px}}
""",
# 4. Lime Split: a full-width lime hero band with ink type, black cards below.
"split": r"""
.hero{background:#CDF24F;border-radius:0 0 48px 48px;margin-inline:calc(50% - 50vw);padding-inline:calc(50vw - 50%);padding-bottom:60px}
.hero h1 em.s{background:#0E0E10;color:#CDF24F}.hero .bio,.cred{color:#2A2E14}.cred b{color:#0E0E10}
.hero .btn.primary{background:#0E0E10;color:#CDF24F}.hero .btn{background:transparent;border-color:#0E0E10}
.man .wg{border-color:#0E0E10;box-shadow:0 20px 50px rgba(14,14,16,.25)}
header.top{background:#CDF24F;border-bottom:0}
.stream,.essay{background:#0E0E10!important;color:#F4F4F0;border-color:#0E0E10!important}.stream *,.essay *{color:inherit}
.stream .facts small,.essay small{color:#A3A39C!important}
.heroimg{background:#0E0E10!important;color:#F4F4F0}.heroimg .in p{color:#A3A39C}.heroimg em.s{background:#CDF24F;color:#0E0E10}
section.s .shead h2 em.s{background:#CDF24F;color:#0E0E10}
.heroimg .live,.heroimg .eyebrow{color:#CDF24F}.heroimg .live::before{background:#CDF24F}
""",
# 5. Orbit: the finder ring from the video as the hero graphic (rotating dashed lime rings + dots), pill chips, dark cards.
"orbit": r"""
.hero::before,.hero::after{content:"";position:absolute;left:50%;top:330px;width:880px;height:880px;margin-left:-440px;margin-top:-440px;border-radius:50%;
 border:4px dashed rgba(14,14,16,.22);animation:spin 60s linear infinite;z-index:0;pointer-events:none}
.hero::after{width:620px;height:620px;margin-left:-310px;margin-top:-310px;border:22px solid rgba(205,242,79,.18);border-top-color:#CDF24F;border-right-color:#CDF24F;animation-duration:9s}
@media(max-width:760px){.hero::before{width:520px;height:520px;margin-left:-260px;margin-top:-260px;top:420px}.hero::after{width:360px;height:360px;margin-left:-180px;margin-top:-180px;top:420px}}
.hero h1 em.s{background:#CDF24F;color:#0E0E10;border-radius:999px;padding:0 .35em}
em.s{border-radius:999px;padding:0 .3em}
.btn{border-radius:999px}.btn.primary{background:#0E0E10;color:#fff;box-shadow:0 0 0 6px rgba(205,242,79,.6)}
.card,.stream,.essay{border:0!important;border-radius:28px!important;box-shadow:0 20px 50px rgba(14,14,16,.12)!important}
.heroimg{background:#0E0E10!important;color:#F4F4F0;border:0!important}.heroimg .in p{color:#A3A39C}
.mq span{background:#0E0E10;color:#F4F4F0;border:0}
.mark i{border-radius:50%;box-shadow:0 0 0 4px #CDF24F}
""",
}
