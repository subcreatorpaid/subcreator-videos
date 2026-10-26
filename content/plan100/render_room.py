"""Build the Render Room page (one Render button per video) from content/plan100/registry.json.

  python3 content/plan100/render_room.py   -> dashboard/render-room.html (published as the Render Room artifact)
Run master.py first so registry.json is current.
"""
import datetime as dt, json, pathlib, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from common import AFF

reg = json.loads((ROOT / "content/plan100/registry.json").read_text())
tags = subprocess.run(["gh", "api", "repos/subcreatorpaid/subcreator-videos/releases?per_page=100", "--paginate", "--jq", ".[].tag_name"], capture_output=True, text=True).stdout.split()
rows = [{"n": r["n"], "slug": r["slug"], "title": r["title"], "type": r["type"], "seconds": r["seconds"], "group": r.get("group", "plan"),
         "tool_name": AFF[r["tool"]][0] if r.get("tool") else None, "rendered": f"video-{r['slug']}-animated" in tags} for r in reg]
html = (pathlib.Path(__file__).parent / "render_room.html").read_text()
html = html.replace("/*DATA*/[]", json.dumps(rows, ensure_ascii=False)).replace("/*BUILT*/", dt.datetime.now(dt.timezone.utc).strftime("%d %b %H:%M UTC"))
out = ROOT / "dashboard/render-room.html"; out.write_text(html)
print(len(rows), "videos ->", out)
