#!/usr/bin/env python3
"""Turn each video's guide.json into the free viewer guide PDF (the file people get when they comment the keyword).

  python3 scripts/make_video_guides.py               -> videos/<slug>/guide.pdf for every folder with a guide.json
  python3 scripts/make_video_guides.py v012_patreon_fees   -> just that one

Facts come only from the guide.json, which content/plan100 builds from the verified facts library. Needs Chromium via Playwright.
"""
import html, json, pathlib, sys
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
F = (ROOT / "fonts").as_uri()
E = lambda s: html.escape(str(s or ""))  # noqa: E731

CSS = f"""
@font-face{{font-family:I;font-weight:500;src:url({F}/Inter-Medium.otf)}}
@font-face{{font-family:I;font-weight:800;src:url({F}/Inter-ExtraBold.otf)}}
@font-face{{font-family:I;font-weight:900;src:url({F}/Inter-Black.otf)}}
@page{{size:A4;margin:16mm 16mm 18mm}}
*{{box-sizing:border-box}}
body{{font:500 10.5pt/1.55 I,Arial,sans-serif;color:#151515;margin:0}}
.cover{{border:2.2pt solid #151515;border-radius:10pt;padding:12mm;margin-bottom:8mm;background:#F6F5F1;
  background-image:linear-gradient(#E2DFD7 1px,transparent 1px),linear-gradient(90deg,#E2DFD7 1px,transparent 1px);background-size:9mm 9mm}}
.brand{{display:flex;align-items:center;gap:8pt;font-weight:900;font-size:12pt;margin-bottom:12mm}}
.dot{{width:22pt;height:22pt;border-radius:50%;background:#2E7D4F;color:#fff;display:grid;place-items:center;font-weight:900}}
.eyebrow{{font:800 8pt I;letter-spacing:.14em;text-transform:uppercase;color:#2E7D4F;margin-bottom:4pt}}
h1{{font-weight:900;font-size:34pt;line-height:1.05;margin:0 0 6pt;letter-spacing:-.02em}}
.sub{{font-size:12pt;color:#5F5E58}}
h2{{font-weight:900;font-size:15pt;margin:14pt 0 4pt;letter-spacing:-.01em}}
ul,ol{{margin:4pt 0 8pt 16pt;padding:0}} li{{margin:3pt 0}}
.steps{{background:#E3F0E7;border-left:4pt solid #2E7D4F;padding:8pt 12pt;border-radius:4pt;margin:12pt 0}}
.tool{{border:1.4pt solid #151515;border-radius:8pt;padding:8pt 12pt;box-shadow:3pt 3pt 0 #151515;margin:12pt 0}}
.finder{{background:#151515;color:#fff;border-radius:8pt;padding:10pt 12pt;margin:12pt 0}} .finder b{{color:#7BE0A0}}
.src{{font-size:8.5pt;color:#5F5E58;word-break:break-all}}
.note{{font-size:8.5pt;color:#5F5E58;margin-top:10pt}}
"""


def page(g):
    secs = "".join(f"<h2>{E(t)}</h2><ul>" + "".join(f"<li>{E(x)}</li>" for x in items) + "</ul>" for t, items in g.get("sections", []))
    steps = "".join(f"<li>{E(x)}</li>" for x in g.get("steps", []))
    t = g.get("tool")
    tool = (f'<div class="tool"><b>Tool for this: {E(t["name"])}</b><br>subcreatorpaid.com/go/{E(t["id"])} '
            f'<span class="src">(affiliate link: we may earn a commission at no cost to you)</span></div>') if t else ""
    src = "".join(f"<li>{E(a)}: {E(u)}</li>" for a, u in g.get("sources", []))
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>
<div class="cover"><div class="brand"><div class="dot">$</div>SUB-CREATOR PAID</div>
<div class="eyebrow">Free guide · keyword {E(g.get('keyword'))}</div><h1>{E(g['title'])}</h1><div class="sub">{E(g.get('subtitle'))}</div></div>
{secs}
<div class="steps"><b>Your next 3 steps</b><ol>{steps}</ol></div>
{tool}
<div class="finder"><b>Not sure which income stream fits you?</b><br>Try the free AI Income Finder: subcreatorpaid.com/#finder</div>
<h2>Sources</h2><ul class="src">{src}</ul>
<div class="note">Pay figures are ranges or labelled examples, not promises. Rules change: check each official page before you start. From the video "{E(g.get('video'))}". subcreatorpaid.com</div>
</body></html>"""


def main(only=None):
    dirs = [d for d in sorted((ROOT / "videos").iterdir()) if (d / "guide.json").exists() and (not only or d.name in only)]
    with sync_playwright() as p:
        import os; exe = os.environ.get("CHROME") or ("/opt/pw-browsers/chromium" if os.path.exists("/opt/pw-browsers/chromium") else None)
        try: b = p.chromium.launch()
        except Exception: b = p.chromium.launch(executable_path=exe)
        pg = b.new_page()
        for d in dirs:
            g = json.loads((d / "guide.json").read_text())
            tmp = d / "_guide.html"; tmp.write_text(page(g))  # a file:// page so the local fonts load
            pg.goto(tmp.as_uri(), wait_until="load"); tmp.unlink()
            pg.pdf(path=str(d / "guide.pdf"), format="A4", print_background=True)
        b.close()
    print(f"{len(dirs)} guide PDFs")


if __name__ == "__main__":
    main(sys.argv[1:] or None)
