#!/usr/bin/env python3
"""Prepare a video spec for the Remotion animator.  Usage: python animator/prep.py videos/<slug>/spec.json

- Kokoro voice per beat; every spoken word timed with faster-whisper (renderer/render_sync.align), so the lower
  captions land on the exact frame a word starts.  "[$50|fifty]" in "say" = show "$50", say "fifty".
- Music bed + sound effects (whoosh on beat changes, pop on element reveals, thud on "punch" words) mixed into
  public/voice.wav, so Remotion only plays one track.
- Assets copied into public/; everything written to props.json.
"""
import json, os, pathlib, re, shutil, sys
import numpy as np, soundfile as sf
HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "renderer"))
from tts import kokoro_lines, SR  # noqa: E402

FPS, LEAD, TAIL = 30, 0.25, 0.15
GAP = 0.4  # pause between beats; a beat can add "hold": seconds of extra pause after it (lets a point sink in)
TOK = re.compile(r"\[([^|\]]+)\|([^\]]+)\]|(\S+)")


def tokens(say):
    """-> [(display, [spoken words])]"""
    out = []
    for m in TOK.finditer(say):
        if m.group(1): out.append((m.group(1), m.group(2).split()))
        else: out.append((m.group(3), [m.group(3)]))
    return out


spec_p = pathlib.Path(sys.argv[1]); spec = json.loads(spec_p.read_text())
pub = HERE / "public"; pub.mkdir(exist_ok=True)
a = spec.get("audio", {})
toks = [tokens(b["say"]) for b in spec["beats"]]
spoken = [" ".join(w for _, ws in tk for w in ws) for tk in toks]
clips = kokoro_lines(spoken, voice=a.get("kokoro_voice", "af_heart"), speed=a.get("speed", 1.0))

try:
    from render_sync import align, whisper_model
    model = whisper_model()
except Exception as e:  # noqa: BLE001
    print("word timing unavailable:", e); model = None
    def align(_m, clip, words):  # noqa: E306
        dur = len(clip) / SR; return [i * (dur - 0.1) / max(1, len(words)) for i in range(len(words))], "estimated"

parts, beats, t, methods = [np.zeros(int(LEAD * SR), np.float32)], [], LEAD, []
for b, c, tk in zip(spec["beats"], clips, toks):
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
    words = [w for _, ws in tk for w in ws]
    wt, how = align(model, c, words) if words else ([], "none"); methods.append(how)
    caps, i = [], 0
    punch = {p.lower() for p in b.get("punch", [])}
    for disp, ws in tk:
        clean = re.sub(r"[^\w$%'-]", "", disp).lower()
        caps.append({"w": disp, "f": round((t + wt[i]) * FPS), "p": clean in punch}); i += len(ws)
    beats.append({"say": b["say"], "show": show, "from": round((t - (LEAD if not beats else 0.12)) * FPS),
                  "speakFrom": round(t * FPS), "speakFrames": round(dur * FPS), "words": caps})
    g = spec.get("gap", GAP) + b.get("hold", 0)
    parts += [c.astype(np.float32), np.zeros(int(g * SR), np.float32)]
    t += dur + g
parts.append(np.zeros(int(TAIL * SR), np.float32))
voice = np.concatenate(parts); N = len(voice)
total = round(N / SR * FPS)
for i, b in enumerate(beats):
    end = beats[i + 1]["from"] if i + 1 < len(beats) else total
    b["frames"] = end - b["from"]

# ---- music + sound effects
try:
    from render_reel import synth_bed
    bounds = [b["from"] / FPS for b in beats] + [N / SR]
    reveals = [(b["speakFrom"] / FPS + 0.2, "blip") for b in beats[1:]]
    music, sfx = synth_bed(N, bounds, reveals)
    rng = np.random.default_rng(3)
    def thud():
        lt = np.arange(int(0.3 * SR)) / SR
        return (np.sin(2 * np.pi * (60 + 120 * np.exp(-lt * 25)) * lt) * np.exp(-lt * 12) + 0.15 * rng.normal(0, 1, len(lt)) * np.exp(-lt * 40)).astype(np.float32)
    for b in beats:
        for w in b["words"]:
            if w["p"]:
                s0 = int(w["f"] / FPS * SR); seg = thud()[: max(0, N - s0)]; sfx[s0:s0 + len(seg)] += 0.55 * seg
    mix = voice * 0.95 + music * 0.5 + sfx * 0.9
    mix = (mix / max(1.0, np.abs(mix).max() / 0.97)).astype(np.float32)
except Exception as e:  # noqa: BLE001
    print("music/sfx skipped:", e); mix = voice
sf.write(pub / "voice.wav", mix, SR)

for f in ("Inter-Black.otf", "Inter-ExtraBold.otf", "Inter-Bold.otf", "Inter-Medium.otf"):
    p = HERE.parent / "fonts" / f
    if p.exists(): shutil.copy(p, pub / f)
props = {"slug": spec["slug"], "handle": spec.get("handle", "@subcreatorpaid"), "fps": FPS, "total": total, "beats": beats,
         "captions": spec.get("captions", True)}
(HERE / "props.json").write_text(json.dumps(props, indent=1))
print(f"prep: {len(beats)} beats, {total / FPS:.1f} s, timing: {methods}")
