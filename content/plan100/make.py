"""Build every video folder from the batch files: python3 content/plan100/make.py"""
import json, sys, pathlib, importlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from common import build, ROOT
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

# every timing word used by a scene or a sound must be spoken in that beat, or the animation fires at the wrong time
import re
def spoken(say):
    say = re.sub(r"\[([^|\]]+)\|[^\]]+\]", r"\1", say)
    return [re.sub(r"[^\w$.%'-]", "", x).lower().strip(".") for x in say.split()]
def keys(o, out):
    if isinstance(o, list):
        if o and isinstance(o[0], str) and len(o) > 1: out.append(o[0])
        for x in o: keys(x, out)
    elif isinstance(o, dict):
        if "cols" in o:  # compare table: only each row's first item is a timing word
            out += [r[0] for r in o.get("rows", [])]; out += [o[k] for k in ("best_word",) if o.get(k)]; return
        for k, x in o.items():
            if k.endswith("_word") and isinstance(x, str): out.append(x)
            elif k not in ("cols", "chips_text"): keys(x, out)
bad = []
for r in rows:
    for i, b in enumerate(json.load(open(ROOT / "videos" / r["slug"] / "spec.json"))["beats"]):
        ws = spoken(b["say"]); ks = []; keys(b["show"], ks); ks += [s[0] for s in b["sfx"] if isinstance(s[0], str)]
        for k in ks:
            if k.startswith("_"): continue  # shown from the start of the beat on purpose
            k2 = k.lower().strip(".")
            if not any(w == k2 or w.startswith(k2) for w in ws): bad.append((r["slug"], i + 1, k))
for x in bad: print("timing word not spoken:", x)
