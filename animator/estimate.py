"""Props without a voice, for storyboard stills (docs/animator-rules.md 3: "stills with estimated word times").
Usage: python animator/estimate.py animator/previews/<slug>.json
Writes animator/props.json, stills.txt (one frame per beat, 18 frames before it ends), a silent public/voice.wav and the fonts.
Then: cd animator && for f in $(cat stills.txt); do npx remotion still src/index.jsx Short out/s_$f.png --props=props.json --frame=$f; done
"""
import json, pathlib, re, shutil, sys, wave

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE))
FPS, LEAD, END_PAD = 30, 0.25, 0.3


def tokens(say):
    out = []
    for m in re.finditer(r"\[([^|\]]+)\|([^\]]+)\]|(\S+)", say):
        out.append((m.group(1), m.group(2).split()) if m.group(1) else (m.group(3), [m.group(3)]))
    return out


spec_p = pathlib.Path(sys.argv[1]); spec = json.loads(spec_p.read_text())
speed = spec.get("audio", {}).get("speed", 1.0); gap = spec.get("gap", 0.4)
pub = HERE / "public"; pub.mkdir(exist_ok=True)
beats, t = [], LEAD
for bi, b in enumerate(spec["beats"]):
    show = dict(b["show"])
    if show.get("images"):
        for i in show["images"]: shutil.copy(spec_p.parent / i, pub / ("a_" + pathlib.Path(i).name))
        show["images"] = ["a_" + pathlib.Path(i).name for i in show["images"]]
    caps, wt = [], t
    for disp, ws in tokens(b["say"]):
        caps.append({"w": disp, "f": round(wt * FPS), "p": False, "k": bool(re.search(r"\d", disp))})
        wt += sum(0.055 * len(w) + 0.13 for w in ws) / speed + (0.12 if disp[-1] in ".,?!" else 0)
    beats.append({"say": b["say"], "show": show, "from": round((t - (LEAD if not beats else 0.12)) * FPS),
                  "speakFrom": round(t * FPS), "speakFrames": round((wt - t) * FPS), "words": caps, "riser": False})
    t = wt + (END_PAD if bi == len(spec["beats"]) - 1 else gap)
total = round(t * FPS)
for i, b in enumerate(beats):
    b["frames"] = (beats[i + 1]["from"] if i + 1 < len(beats) else total) - b["from"]
with wave.open(str(pub / "voice.wav"), "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000); w.writeframes(b"\0\0" * int(24000 * t))
for f in ("Inter-Black.otf", "Inter-ExtraBold.otf", "Inter-Bold.otf", "Inter-Medium.otf", "Inter-SemiBold.otf", "JetBrainsMono-Bold.ttf"):
    p = HERE.parent / "fonts" / f
    if p.exists(): shutil.copy(p, pub / f)
props = {"slug": spec["slug"], "handle": spec.get("handle", "@subcreatorpaid"), "fps": FPS, "total": total, "beats": beats,
         "captions": spec.get("captions", True), "style": spec.get("style", ""), "title": spec.get("title", ""), "case": spec.get("case", {})}
(HERE / "props.json").write_text(json.dumps(props, indent=1))
(HERE / "stills.txt").write_text("\n".join(str(max(0, b["from"] + b["frames"] - 18)) for b in beats) + "\n")
print(f"estimate: {len(beats)} beats, {total / FPS:.1f} s")
