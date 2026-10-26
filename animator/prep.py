#!/usr/bin/env python3
"""Prepare a video spec for the Remotion animator.
Usage: python animator/prep.py videos/<slug>/spec.json [--hook N]
       --hook N  = build only hook variant N from spec["hooks"] as a 4 s clip (rule H3)

Follows the animator rules v4 in docs/animator-rules.md (P = pacing, M4 = punches, A = audio, W6 = cue sheet).

- Kokoro voice per beat; every spoken word timed with faster-whisper (renderer/render_sync.align), so the lower
  captions land on the exact frame a word starts.  "[$50|fifty]" in "say" = show "$50", say "fifty".
- Music bed 20 dB under the voice and ducked 4 dB while it speaks; SFX on about half the beat changes, a low hit
  only on the main punch word, an optional riser into the biggest reveal; mixed to -14 LUFS, true peak -1 dB,
  into public/voice.wav, so Remotion only plays one track.
- Assets copied into public/; everything written to props.json, plus cue.md (cue sheet) and stills.txt
  (one frame per beat at its answer moment, for the stills review).
"""
import json, os, pathlib, re, shutil, sys
import numpy as np, soundfile as sf
HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "renderer"))
from tts import kokoro_lines, SR  # noqa: E402

FPS, LEAD = 30, 0.25
GAP = 0.4        # P2: pause between beats, kept within 0.25-0.45 s
HOLD = (0.8, 1.4)  # P2: a beat's "hold" (extra pause after a key line) is 0 or 0.8-1.4 s, on at most 3 beats
END_PAD = 0.3    # P4: the video ends 0.3 s after the last word
MAX_PUNCH = 4    # M4: punch-ins on at most 4 words per video
FADE = int(0.01 * SR)  # A1: 10 ms fades on every voice clip edge
TOK = re.compile(r"\[([^|\]]+)\|([^\]]+)\]|(\S+)")


def tokens(say):
    """-> [(display, [spoken words])]"""
    out = []
    for m in TOK.finditer(say):
        if m.group(1): out.append((m.group(1), m.group(2).split()))
        else: out.append((m.group(3), [m.group(3)]))
    return out


def warn(m): print("rules:", m)


spec_p = pathlib.Path(sys.argv[1]); spec = json.loads(spec_p.read_text())
hook_n = int(sys.argv[sys.argv.index("--hook") + 1]) if "--hook" in sys.argv else None
if hook_n is not None:  # H3: one hook variant as a 4 s clip
    spec["beats"] = [spec["hooks"][hook_n]]
pub = HERE / "public"; pub.mkdir(exist_ok=True)
a = spec.get("audio", {})
speed = a.get("speed", 0.95)
cap = 1.12 if spec.get("style") == "story" else 1.05  # owner asked for an energetic voice (26 Oct 2026): story style allows up to 1.12
if speed > cap: warn(f"voice speed {speed} above {cap} (P5); using {cap}"); speed = cap
gap = min(0.45, max(0.25, spec.get("gap", GAP)))
holds = []
for b in spec["beats"]:
    h = b.get("hold", 0)
    if h: h = min(HOLD[1], max(HOLD[0], h))
    holds.append(h)
if sum(1 for h in holds if h) > 3: warn(f"{sum(1 for h in holds if h)} beats have a hold; P2 allows 2-3")
toks = [tokens(b["say"]) for b in spec["beats"]]
spoken = [" ".join(w for _, ws in tk for w in ws) for tk in toks]
clips = kokoro_lines(spoken, voice=a.get("kokoro_voice", "af_heart"), speed=speed)
ramp = np.linspace(0, 1, FADE, dtype=np.float32)
for c in clips:
    if len(c) > 2 * FADE: c[:FADE] *= ramp; c[-FADE:] *= ramp[::-1]

# M4: keep the first 4 punch words; A3: the low hit goes on the main punch only ("main_punch", else the first)
punch_left = MAX_PUNCH
main_punch = (spec.get("main_punch") or "").lower()

try:
    from render_sync import align, whisper_model
    model = whisper_model()
except Exception as e:  # noqa: BLE001
    print("word timing unavailable:", e); model = None
    def align(_m, clip, words):  # noqa: E306
        dur = len(clip) / SR; return [i * (dur - 0.1) / max(1, len(words)) for i in range(len(words))], "estimated"

parts, beats, t, methods = [np.zeros(int(LEAD * SR), np.float32)], [], LEAD, []
speech = []  # (start, end) seconds where the voice speaks, for ducking
for bi, (b, c, tk) in enumerate(zip(spec["beats"], clips, toks)):
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
    punch = {re.sub(r"[^\w$%'-]", "", p).lower() for p in b.get("punch", [])}
    keys = {re.sub(r"[^\w$%'-]", "", k).lower() for k in b.get("key", [])}
    for disp, ws in tk:
        clean = re.sub(r"[^\w$%'-]", "", disp).lower()
        p = clean in punch and punch_left > 0
        if clean in punch and not p: warn(f"punch word {disp!r} dropped: max {MAX_PUNCH} per video (M4)")
        punch_left -= p
        # T1: only key words turn green in the captions: punch words, numbers and prices, or the beat's "key" list
        k = p or clean in keys or bool(re.search(r"\d", disp))
        caps.append({"w": disp, "f": round((t + wt[i]) * FPS), "p": p, "k": k}); i += len(ws)
    beats.append({"say": b["say"], "show": show, "from": round((t - (LEAD if not beats else 0.12)) * FPS),
                  "speakFrom": round(t * FPS), "speakFrames": round(dur * FPS), "words": caps})
    beats[-1]["riser"] = bool(b.get("riser"))
    speech.append((t, t + dur))
    g = END_PAD if bi == len(spec["beats"]) - 1 else gap + holds[bi]
    parts += [c.astype(np.float32), np.zeros(int(g * SR), np.float32)]
    t += dur + g
voice = np.concatenate(parts)
if hook_n is not None:  # H3: hook clips are exactly 4 s
    voice = np.pad(voice, (0, max(0, 4 * SR - len(voice))))[: 4 * SR]
N = len(voice)
total = round(N / SR * FPS)
if sum(1 for b in beats if b["riser"]) > 1: warn("more than one riser; A4 allows one, into the biggest reveal")
for i, b in enumerate(beats):
    end = beats[i + 1]["from"] if i + 1 < len(beats) else total
    b["frames"] = end - b["from"]

# ---- music + sound effects
try:
    from render_reel import synth_bed
    # A3: a swoosh on every other beat change and a tick on every other reveal, about half the old count
    bounds = [beats[0]["from"] / FPS] + [b["from"] / FPS for b in beats[1::2]] + [N / SR]
    reveals = [(b["speakFrom"] / FPS + 0.2, "blip") for b in beats[2::2]]
    if spec.get("style") == "story": bounds, reveals = [0.0, N / SR], []  # story: effects come from each beat's "sfx" list
    music, sfx = synth_bed(N, bounds, reveals)
    # beat "sfx": [[word or seconds-from-line-start, kind], ...] (kinds in renderer/sfx.py)
    ev = []
    for sb, b in zip(spec["beats"], beats):
        for at, kind in sb.get("sfx", []):
            if isinstance(at, str):
                w = next((x for x in b["words"] if re.sub(r"[^\w$%'-]", "", x["w"]).lower().startswith(at.lower())), None)
                if w: ev.append((w["f"] / FPS - 0.03, kind))
            else: ev.append((b["speakFrom"] / FPS + at, kind))
    if ev:
        import sfx as fxlib
        sfx += fxlib.render(ev, N)
    rng = np.random.default_rng(3)
    def thud():
        lt = np.arange(int(0.3 * SR)) / SR
        return (np.sin(2 * np.pi * (60 + 120 * np.exp(-lt * 25)) * lt) * np.exp(-lt * 12) + 0.15 * rng.normal(0, 1, len(lt)) * np.exp(-lt * 40)).astype(np.float32)
    def riser():  # A4: 0.8 s rising noise sweep that ends on the word
        n = int(0.8 * SR); lt = np.arange(n) / SR
        return (rng.normal(0, 1, n) * np.sin(2 * np.pi * (200 + 1800 * lt / 0.8) * lt) * (lt / 0.8) ** 2).astype(np.float32)
    pw = [w for b in beats for w in b["words"] if w["p"]]
    hit = next((w for w in pw if re.sub(r"[^\w$%'-]", "", w["w"]).lower() == main_punch), pw[0] if pw else None)
    if hit:
        s0 = int(hit["f"] / FPS * SR); seg = thud()[: max(0, N - s0)]; sfx[s0:s0 + len(seg)] += 0.55 * seg
    for b in beats:
        if b["riser"]:
            w = next((w for w in b["words"] if w["p"]), b["words"][0] if b["words"] else None)
            if w:
                e = int(w["f"] / FPS * SR); r = riser(); s0 = max(0, e - len(r)); sfx[s0:e] += 0.25 * r[len(r) - (e - s0):]
    # A2: music bed 20 dB under the voice, ducked a further 4 dB while the voice speaks
    rms = lambda x: float(np.sqrt(np.mean(np.square(x)))) + 1e-9  # noqa: E731
    sp_mask = np.zeros(N, np.float32)
    for s0, s1 in speech: sp_mask[int(s0 * SR):int(s1 * SR)] = 1
    v_rms = rms(voice[sp_mask > 0]) if sp_mask.any() else rms(voice)
    music *= (v_rms * 10 ** (-20 / 20)) / rms(music)
    k = int(0.05 * SR); duck = np.convolve(sp_mask, np.ones(k) / k, mode="same")
    music *= (1 - duck * (1 - 10 ** (-4 / 20))).astype(np.float32)
    # A3: SFX peak at least 12 dB under the voice peak
    if np.abs(sfx).max() > 0: sfx *= min(1.0, np.abs(voice).max() * 10 ** (-12 / 20) / np.abs(sfx).max())
    mix = voice + music + sfx
except Exception as e:  # noqa: BLE001
    print("music/sfx skipped:", e); mix = voice


def loudness(x):
    """A1: integrated loudness (LUFS) with pyloudnorm; falls back to an RMS estimate."""
    try:
        import pyloudnorm
        return pyloudnorm.Meter(SR).integrated_loudness(x.astype(np.float64))
    except Exception:  # noqa: BLE001
        return 20 * np.log10(np.sqrt(np.mean(np.square(x))) + 1e-9) - 0.7


def limit(x, ceil=10 ** (-1 / 20), blk=128):
    """A1: true peak -1 dB: block gain with a short release instead of hard clipping."""
    n = -(-len(x) // blk); pk = np.pad(np.abs(x), (0, n * blk - len(x))).reshape(n, blk).max(1)
    g = np.minimum(1.0, ceil / (pk + 1e-9))
    for i in range(1, n): g[i] = min(g[i], g[i - 1] + 0.02)  # release
    for i in range(n - 2, -1, -1): g[i] = min(g[i], g[i + 1] + 0.02)  # attack, looks one block ahead
    return x * np.repeat(g, blk)[: len(x)]


mix = limit(mix * 10 ** ((-14 - loudness(mix)) / 20)).astype(np.float32)
sf.write(pub / "voice.wav", mix, SR)

for f in ("Inter-Black.otf", "Inter-ExtraBold.otf", "Inter-Bold.otf", "Inter-Medium.otf"):
    p = HERE.parent / "fonts" / f
    if p.exists(): shutil.copy(p, pub / f)
props = {"slug": spec["slug"], "handle": spec.get("handle", "@subcreatorpaid"), "fps": FPS, "total": total, "beats": beats,
         "captions": spec.get("captions", True), "thumb": spec.get("thumb", {}), "style": spec.get("style", "")}
(HERE / "props.json").write_text(json.dumps(props, indent=1))

# W2: one still per beat at its answer moment (18 frames before the beat ends, when everything is still)
(HERE / "stills.txt").write_text("\n".join(str(max(0, b["from"] + b["frames"] - 18)) for b in beats) + "\n")
# W6: cue sheet
cue = ["| Time | Beat | On screen | Caption / voice |", "|---|---|---|---|"]
for i, b in enumerate(beats):
    cue.append(f"| {b['from'] / FPS:.1f}-{(b['from'] + b['frames']) / FPS:.1f} s | {i + 1} | {b['show'].get('type', 'statement')} |"
               f" {b['say'].replace('|', '/')} |")
(HERE / "cue.md").write_text(f"# Cue sheet: {spec['slug']}\n\n" + "\n".join(cue) + "\n")
print(f"prep: {len(beats)} beats, {total / FPS:.1f} s, {loudness(mix):.1f} LUFS, timing: {methods}")
