#!/usr/bin/env python3
"""Prepare a video spec for the Remotion animator: Kokoro voice per beat -> public/voice.wav, beat timings,
assets copied into public/, everything written to props.json.  Usage: python animator/prep.py videos/<slug>/spec.json
"""
import json, os, pathlib, shutil, sys
import numpy as np, soundfile as sf
HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "renderer"))
from tts import kokoro_lines, SR  # noqa: E402

FPS, LEAD, GAP, TAIL = 30, 0.35, 0.28, 1.2

spec_p = pathlib.Path(sys.argv[1]); spec = json.loads(spec_p.read_text())
pub = HERE / "public"; pub.mkdir(exist_ok=True)
a = spec.get("audio", {})
clips = kokoro_lines([b["say"] for b in spec["beats"]], voice=a.get("kokoro_voice", "af_heart"), speed=a.get("speed", 1.0))
parts, beats, t = [np.zeros(int(LEAD * SR), np.float32)], [], LEAD
for b, c in zip(spec["beats"], clips):
    dur = len(c) / SR
    show = dict(b["show"])
    for k in ("image",):
        if show.get(k):
            src = spec_p.parent / show[k]; dst = pub / ("a_" + src.name)
            if src.exists(): shutil.copy(src, dst); show[k] = dst.name
            else: show.pop(k)
    if show.get("images"):
        imgs = []
        for i in show["images"]:
            src = spec_p.parent / i
            if src.exists(): shutil.copy(src, pub / ("a_" + src.name)); imgs.append("a_" + src.name)
        show["images"] = imgs
    beats.append({"say": b["say"], "show": show, "from": round((t - (LEAD if not beats else GAP / 2)) * FPS),
                  "speakFrom": round(t * FPS), "speakFrames": round(dur * FPS)})
    parts += [c.astype(np.float32), np.zeros(int(GAP * SR), np.float32)]
    t += dur + GAP
parts.append(np.zeros(int(TAIL * SR), np.float32))
voice = np.concatenate(parts)
sf.write(pub / "voice.wav", voice, SR)
total = round(len(voice) / SR * FPS)
for i, b in enumerate(beats):
    end = beats[i + 1]["from"] if i + 1 < len(beats) else total
    b["frames"] = end - b["from"]
for f in ("Inter-Black.otf", "Inter-ExtraBold.otf", "Inter-Bold.otf", "Inter-Medium.otf"):
    p = HERE.parent / "fonts" / f
    if p.exists(): shutil.copy(p, pub / f)
props = {"slug": spec["slug"], "handle": spec.get("handle", "@subcreatorpaid"), "fps": FPS, "total": total, "beats": beats}
(HERE / "props.json").write_text(json.dumps(props, indent=1))
print(f"prep: {len(beats)} beats, {total / FPS:.1f} s")
