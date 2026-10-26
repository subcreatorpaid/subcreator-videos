"""Build every video folder from the batch files: python3 content/plan100/make.py"""
import json, sys, pathlib, importlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from common import build, check, ROOT
rows = []
for f in sorted(pathlib.Path(__file__).parent.glob("batch*.py")):
    m = importlib.import_module(f.stem)
    rows += [build(v) for v in m.V]
MAX_WORDS = 165  # owner rule 26 Oct: no video over 60 s. The Michael+Puck voice at 1.1 reads ~3 words/s, so 165 words is ~55 s
long = [(r["slug"], r["words"]) for r in rows if r["words"] > MAX_WORDS]
if long: sys.exit(f"Over 60 s (more than {MAX_WORDS} words): {long}")
rows.sort(key=lambda r: r["n"])
(ROOT / "content/plan100/plan.json").write_text(json.dumps(rows, indent=1, ensure_ascii=False))
print(len(rows), "videos;", "avg words", sum(r["words"] for r in rows)//max(1,len(rows)))

for x in check(rows): print("timing word not spoken:", x)
