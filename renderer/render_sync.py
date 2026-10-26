#!/usr/bin/env python3
"""Word-synced "text-sync loop" video: every 1-2 word caption burst appears on the frame its first word is spoken.

  python3 renderer/render_sync.py videos/<slug>/sync.json out/<slug>            # MP4 + cover + timings
  python3 renderer/render_sync.py videos/<slug>/sync.json out/<slug> --stills   # preview frames, fake timings (no voice)

sync.json:
  {"slug": "...", "handle": "@subcreatorpaid", "voice": "af_heart", "speed": 1.05,
   "lines": [{"say": "You're / *reading* / each word / ...", "card": {...} | null, "gap": 0.12}, ...]}
  " / " splits bursts (1-2 words each). *word* = accent (green). [$50|fifty] = show "$50", say "fifty".
  card types: {"type": "stat", "label", "big", "sub", "tone": "catch"?}   {"type": "hidden", "title", "rows": [...]}
  A line without "card" keeps the previous card; "card": null clears it (use null on the last line so the loop
  ends on the same clean frame it starts on).

Timing: Kokoro voices each line; faster-whisper (tiny.en, word timestamps) times each word inside that line's clip, and
spoken words are matched to it (difflib). Words it misses are interpolated between matched neighbours. If faster-whisper
is not installed, words are spread by syllable estimate (marked "estimated" in the timings file).
"""
import difflib, json, os, re, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from render_reel import F, W, H, FPS, SR, synth_bed  # noqa: E402

BG, INK, MUTED, LINE, ACC, ACC_SOFT, WHITE = (246, 245, 241), (21, 21, 21), (95, 94, 88), (226, 223, 215), (46, 125, 79), (227, 240, 231), (255, 255, 255)
LEAD = 0.03   # show a burst 1 frame early: text that lands with (not after) the sound reads as perfectly in sync
TOK = re.compile(r"\[([^|\]]+)\|([^\]]+)\]|(\S+)")


def parse(say):
    """-> bursts [{"disp": "...", "words": [spoken words], "acc": [bool per display word]}]"""
    out = []
    for b in [x.strip() for x in say.split(" / ") if x.strip()]:
        disp, spoken, acc = [], [], []
        for m in TOK.finditer(b):
            if m.group(1): d, s = m.group(1), m.group(2)
            else: d = s = m.group(3)
            a = d.startswith("*") or d.rstrip(".,:;!?").endswith("*")
            d = d.replace("*", ""); s = s.replace("*", "")
            disp.append(d); acc.append(a); spoken += s.split()
        out.append({"disp": " ".join(disp), "dw": disp, "acc": acc, "words": spoken})
    return out


def norm(w): return re.sub(r"[^a-z0-9']", "", w.lower().replace("’", "'"))


def syll(w): return max(1, len(re.findall(r"[aeiouy]+", w.lower())))


def estimate(words, dur):
    wts = [syll(w) + 0.6 for w in words]; tot = sum(wts); t, out = 0.04, []
    for x in wts: out.append(t); t += (dur - 0.1) * x / tot
    return out


def whisper_model():
    try:
        from faster_whisper import WhisperModel
        return WhisperModel("tiny.en", device="cpu", compute_type="int8")
    except Exception as e:  # noqa: BLE001
        print("faster-whisper not available, estimating word times:", e); return None


def align(model, clip, words):
    """Start time (s, inside the clip) of every spoken word."""
    dur = len(clip) / SR
    if model is None: return estimate(words, dur), "estimated"
    from scipy.signal import resample_poly
    x16 = resample_poly(clip, 16000, SR).astype(np.float32)
    segs, _ = model.transcribe(x16, language="en", word_timestamps=True, beam_size=1, vad_filter=False,
                               initial_prompt=" ".join(words))
    ww = [(norm(w.word), w.start) for s in segs for w in (s.words or []) if norm(w.word)]
    a, b = [norm(w) for w in words], [w for w, _ in ww]
    times = [None] * len(words)
    for blk in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks():
        for k in range(blk.size): times[blk.a + k] = ww[blk.b + k][1]
    # fill gaps (e.g. "U G C" heard as "UGC") by interpolating between matched neighbours
    known = [(i, t) for i, t in enumerate(times) if t is not None]
    if not known: return estimate(words, dur), "estimated"
    for i in range(len(times)):
        if times[i] is None:
            lo = max([k for k in known if k[0] < i], default=(-1, 0.0), key=lambda k: k[0])
            hi = min([k for k in known if k[0] > i], default=(len(words), dur - 0.15), key=lambda k: k[0])
            times[i] = lo[1] + (hi[1] - lo[1]) * (i - lo[0]) / (hi[0] - lo[0])
    for i in range(1, len(times)): times[i] = max(times[i], times[i - 1] + 0.05)
    return times, f"whisper ({sum(t is not None for t in times)}/{len(words)} words)"


# ------------------------------------------------------------------ drawing
def grid_bg():
    im = Image.new("RGB", (W, H), BG); d = ImageDraw.Draw(im)
    for x in range(0, W, 72): d.line([x, 0, x, H], fill=(236, 234, 228))
    for y in range(0, H, 72): d.line([0, y, W, y], fill=(236, 234, 228))
    fade = Image.new("L", (W, H)); fd = ImageDraw.Draw(fade)
    for y in range(H): fd.line([0, y, W, y], fill=int(255 * min(1, abs(y - H * 0.55) / (H * 0.55)) ** 1.6))
    return Image.composite(Image.new("RGB", (W, H), BG), im, fade.point(lambda v: 255 - v)).filter(ImageFilter.GaussianBlur(0.4))


def ease(x): x = max(0.0, min(1.0, x)); return 1 - (1 - x) ** 3


def burst_layer(b, k):
    """Big burst text, accent words green. k = 0..1 pop progress."""
    size = 168 if len(b["disp"]) <= 9 else 140 if len(b["disp"]) <= 13 else 118
    while True:
        fb = F("Black", size); tmp = ImageDraw.Draw(Image.new("RGB", (8, 8)))
        widths = [tmp.textlength(w, font=fb) for w in b["dw"]]; sp = tmp.textlength(" ", font=fb)
        tw = sum(widths) + sp * (len(widths) - 1) + 36 * sum(b["acc"])
        if tw <= W - 140 or size <= 80: break
        size -= 8
    lay = Image.new("RGBA", (W, 320), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    x = (W - tw) / 2
    for w, wd, a in zip(b["dw"], widths, b["acc"]):
        if a:
            x += 18
            d.rounded_rectangle([x - 18, 160 - size * 0.62, x + wd + 18, 160 + size * 0.5], 22, fill=ACC)
            d.text((x, 160), w, font=fb, fill=WHITE, anchor="lm"); x += 18
        else:
            d.text((x, 160), w, font=fb, fill=INK, anchor="lm")
        x += wd + sp
    s = 0.86 + 0.14 * ease(k)
    if s < 0.999:
        lay = lay.resize((int(W * s), int(320 * s)), Image.LANCZOS)
        out = Image.new("RGBA", (W, 320), (0, 0, 0, 0)); out.paste(lay, ((W - lay.width) // 2, (320 - lay.height) // 2)); lay = out
    if k < 1: lay.putalpha(lay.getchannel("A").point(lambda v: int(v * min(1, 0.35 + k))))
    return lay


def card_layer(c, k):
    lay = Image.new("RGBA", (W, 760), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    x0, x1, y0 = 90, W - 90, 40
    if c["type"] == "stat":
        catch = c.get("tone") == "catch"; y1 = 600
        d.rounded_rectangle([x0 + 14, y0 + 16, x1 + 14, y1 + 16], 40, fill=INK)
        d.rounded_rectangle([x0, y0, x1, y1], 40, fill=ACC_SOFT if catch else WHITE, outline=INK, width=5)
        d.text((W / 2, y0 + 95), c["label"].upper(), font=F("ExtraBold", 46), fill=ACC, anchor="mm")
        big = c["big"]; sz = 200
        while ImageDraw.Draw(Image.new("RGB", (8, 8))).textlength(big, font=F("Black", sz)) > x1 - x0 - 100: sz -= 8
        d.text((W / 2, y0 + 290), big, font=F("Black", sz), fill=INK, anchor="mm")
        sub = c.get("sub", ""); fs = F("Bold", 46)
        lines, cur = [], ""
        for w in sub.split():
            t = (cur + " " + w).strip()
            if d.textlength(t, font=fs) <= x1 - x0 - 120: cur = t
            else: lines.append(cur); cur = w
        if cur: lines.append(cur)
        for i, l in enumerate(lines[:2]): d.text((W / 2, y0 + 450 + i * 60), l, font=fs, fill=MUTED, anchor="mm")
    elif c["type"] == "hidden":
        rows = c["rows"]; y1 = y0 + 190 + 150 * len(rows)
        d.rounded_rectangle([x0 + 14, y0 + 16, x1 + 14, y1 + 16], 40, fill=INK)
        d.rounded_rectangle([x0, y0, x1, y1], 40, fill=WHITE, outline=INK, width=5)
        d.text((W / 2, y0 + 90), c["title"].upper(), font=F("ExtraBold", 48), fill=ACC, anchor="mm")
        for i, r in enumerate(rows):
            y = y0 + 210 + i * 150
            d.ellipse([x0 + 60, y - 30, x0 + 120, y + 30], fill=INK); d.text((x0 + 90, y), str(i + 1), font=F("Black", 38), fill=WHITE, anchor="mm")
            d.text((x0 + 150, y - 22), r, font=F("Bold", 40), fill=INK, anchor="lm")
            blur = Image.new("RGBA", (x1 - x0 - 230, 40), (0, 0, 0, 0)); bd = ImageDraw.Draw(blur)
            bd.text((0, 20), "xxxxxx xxxx xxxxxxx xxxx xxxxxx", font=F("Bold", 34), fill=(150, 148, 140), anchor="lm")
            lay.alpha_composite(blur.filter(ImageFilter.GaussianBlur(7)), (x0 + 150, y + 8))
    if k < 1:
        e = ease(k); lay = lay.transform(lay.size, Image.AFFINE, (1, 0, 0, 0, 1, -int(90 * (1 - e))))
        lay.putalpha(lay.getchannel("A").point(lambda v: int(v * e)))
    return lay


def frame(bg, t, bursts, cards, total, caret):
    im = bg.copy().convert("RGBA"); d = ImageDraw.Draw(im)
    d.rectangle([0, 0, int(W * t / total), 12], fill=ACC)                       # loop progress bar
    c = next((c for c in reversed(cards) if c["t"] <= t), None)
    if c and c["card"]: im.alpha_composite(card_layer(c["card"], (t - c["t"]) / 0.28), (0, 250))
    b = next((b for b in reversed(bursts) if b["t"] <= t), None)
    if b and t < b["end"]:
        k = (t - b["t"]) / 0.09
        y = 1160 if (c and c["card"]) else 860
        im.alpha_composite(burst_layer(b, k), (0, y - 160))
        if caret:  # "reading" underline under the burst being spoken
            wdt = 120 + 40 * len(b["disp"]); d.rounded_rectangle([W / 2 - wdt / 2, y + 120, W / 2 + wdt / 2, y + 134], 7, fill=ACC)
    d.text((W / 2, 1745), "@subcreatorpaid", font=F("Bold", 40), fill=MUTED, anchor="mm")
    return im.convert("RGB")


def main():
    spec_path, outdir = sys.argv[1], sys.argv[2]; stills = "--stills" in sys.argv
    spec = json.load(open(spec_path)); os.makedirs(outdir, exist_ok=True); slug = spec["slug"]
    lines = spec["lines"]
    for ln in lines: ln["bursts"] = parse(ln["say"])
    spoken = [" ".join(w for b in ln["bursts"] for w in b["words"]) for ln in lines]
    if stills:
        clips = [np.zeros(int(SR * (0.32 * len(s.split()) + 0.1)), np.float32) for s in spoken]; model = None
    else:
        from tts import kokoro_lines
        clips = kokoro_lines(spoken, voice=spec.get("voice", "af_heart"), speed=spec.get("speed", 1.05)); model = whisper_model()
    bursts, cards, voice, t, methods = [], [], [], 0.0, []
    card = None
    for ln, clip in zip(lines, clips):
        words = [w for b in ln["bursts"] for w in b["words"]]
        wt, how = align(model, clip, words); methods.append(how)
        if "card" in ln: card = ln["card"]; cards.append({"t": t, "card": card})
        i = 0
        for b in ln["bursts"]:
            bursts.append({**b, "t": max(0.0, t + wt[i] - LEAD), "line": lines.index(ln)}); i += len(b["words"])
        voice.append(clip); t += len(clip) / SR
        gap = ln.get("gap", 0.12); voice.append(np.zeros(int(SR * gap), np.float32)); t += gap
    total = t
    for i, b in enumerate(bursts): b["end"] = bursts[i + 1]["t"] if i + 1 < len(bursts) else total + 1
    bg = grid_bg()
    hook_end = next((b["t"] for b in bursts if b["line"] == 1), 3.0)
    timings = {"slug": slug, "duration": round(total, 2), "alignment": methods,
               "bursts": [{"t": round(b["t"] + LEAD, 3), "text": b["disp"], "line": b["line"]} for b in bursts]}
    json.dump(timings, open(os.path.join(outdir, f"{slug}_timings.json"), "w"), indent=1)
    if stills:
        for i, tt in enumerate([0.4, hook_end + 0.4, total * 0.45, total * 0.62, total - 2.5]):
            frame(bg, tt, bursts, cards, total, tt < hook_end).save(os.path.join(outdir, f"still_{i}.png"))
        print("stills ->", outdir); return
    N = int(total * SR); vo = np.concatenate(voice)[:N]; vo = np.pad(vo, (0, N - len(vo)))
    music, _ = synth_bed(N, [0, total], [])
    mix = vo * 0.95 + music * 0.55; mix /= max(1.0, np.abs(mix).max() / 0.97)
    import soundfile as sf
    wav = os.path.join(outdir, f"{slug}_mix.wav"); sf.write(wav, mix, SR)
    vid = os.path.join(outdir, f"{slug}_silent.mp4")
    p = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
                          "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", vid], stdin=subprocess.PIPE)
    for f in range(int(total * FPS)):
        tt = f / FPS; p.stdin.write(frame(bg, tt, bursts, cards, total, tt < hook_end).tobytes())
    p.stdin.close(); p.wait()
    out = os.path.join(outdir, f"{slug}.mp4")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", vid, "-i", wav, "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", out], check=True)
    frame(bg, 0.6, bursts, cards, total, True).save(os.path.join(outdir, f"{slug}_cover.png"))
    os.remove(vid); os.remove(wav)
    json.dump({"duration": total, "fallback_voice": False, "alignment": methods}, open(os.path.join(outdir, f"{slug}_render.json"), "w"))
    print("video:", out, f"{total:.1f}s", methods)


if __name__ == "__main__":
    main()
