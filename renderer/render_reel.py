#!/usr/bin/env python3
"""Sub-Creator Paid render engine.

Usage:
  python3 render_reel.py spec.json OUTDIR            # video + cover + carousel (PNG + PDF)
  python3 render_reel.py spec.json OUTDIR --stills   # cover + carousel + preview sheet only
  python3 render_reel.py --split-voice batch.mp3 a.json b.json ...   # one voiceover -> one voice file per spec
  python3 render_reel.py --roundup roundup.json OUTDIR               # weekly roundup carousel

The spec describes one income-stream video (see ../reference/spec_example.json).
Audio: spec.audio.voice = an mp3/wav of the 5 lines read in order (pauses between lines are
detected to time the scenes). With no voice file, a basic built-in voice is used as a fallback.
Optional Nora (Google Vids AI avatar clips):
  spec.nora.talking = one clip of Nora reading all 5 lines with a short pause between lines. She opens and
                      closes full-screen and talks in a live bubble over the cards; her audio is the voice.
  spec.nora.clip    = hook-only clip (replaces scene 1; the voice file then holds lines 2-5 only).
  spec.nora.photo   = still for a static bubble. spec.nora.face_box = [x, y, size] crop for the bubble.
"""
import json, math, os, subprocess, sys, tempfile
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
FONT_DIRS = [os.path.join(HERE, "..", "fonts"), "/usr/share/fonts/opentype/inter"]
W, H, FPS, SR = 1080, 1920, 30, 44100
_fc = {}
def F(w, s):
    k = (w, s)
    if k not in _fc:
        for d in FONT_DIRS:
            p = os.path.join(d, f"Inter-{w}.otf")
            if os.path.exists(p): _fc[k] = ImageFont.truetype(p, s); break
        else: _fc[k] = ImageFont.load_default()
    return _fc[k]

def hx(h): return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
DEFAULT_PAL = {"bg": "#FBF8F3", "txt": "#1D2B22", "acc": "#1F7A4D", "glow": "#F2ECE2", "card": "#FFFFFF",
               "muted": "#6B6455", "grid": "#E9E3D8", "ink": "#101012"}

def lum(c):
    c = [x / 255 for x in c]; c = [x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]

def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def ease(x): x = clamp(x); return 1 - (1 - x) ** 3
def back(x):
    x = clamp(x); c = 1.7; return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2
def pop(t, a, d=0.35): return back((t - a) / d) if t >= a else 0

class Theme:
    def __init__(self, pal):
        p = {k: hx(v) for k, v in {**DEFAULT_PAL, **(pal or {})}.items()}
        self.BG, self.TXT, self.ACC, self.GLOW, self.CARD = p["bg"], p["txt"], p["acc"], p["glow"], p["card"]
        self.MUTED, self.GRID, self.INK = p["muted"], p["grid"], p["ink"]
        self.ON_ACC = self.INK if lum(self.ACC) > 0.25 else (255, 255, 255)
        self.LIGHT = lum(self.BG) > 0.5
        self.MUTED_C = (110, 110, 118)
        gs = 44
        m = Image.new("L", (W, H + gs), 0); d = ImageDraw.Draw(m)
        for x in range(0, W + 1, gs): d.line([(x, 0), (x, H + gs)], fill=255, width=2)
        for y in range(0, H + gs + 1, gs): d.line([(0, y), (W, y)], fill=255, width=2)
        v = Image.new("L", m.size, 0); vd = ImageDraw.Draw(v)
        for r in range(60): vd.rectangle([r * 9, r * 16, W - r * 9, H + gs - r * 16], outline=int(255 - r * 2.2), width=18)
        self.grid_mask = Image.composite(m, Image.new("L", m.size, 0), v); self.gs = gs

    def background(self, t):
        im = Image.new("RGB", (W, H), self.BG)
        blob = Image.new("L", (W // 4, H // 4), 0); bd = ImageDraw.Draw(blob)
        for i, (bx, by, r, sp) in enumerate([(0.15, 0.12, 120, 0.4), (0.9, 0.35, 150, 0.3), (0.2, 0.8, 140, 0.35), (0.85, 0.92, 110, 0.5)]):
            x = (bx + 0.05 * math.sin(t * sp + i)) * W / 4; y = (by + 0.03 * math.cos(t * sp * 1.3 + i)) * H / 4
            bd.ellipse([x - r / 2, y - r / 2, x + r / 2, y + r / 2], fill=170)
        blob = blob.filter(ImageFilter.GaussianBlur(28)).resize((W, H), Image.BILINEAR)
        im.paste(Image.new("RGB", (W, H), self.GLOW), (0, 0), blob)
        off = int((t * 12) % self.gs)
        im.paste(Image.new("RGB", (W, H), self.GRID), (0, 0), self.grid_mask.crop((0, self.gs - off, W, self.gs - off + H)))
        return im

def text(d, xy, s, f, fill, anchor="mm"): d.text(xy, s, font=f, fill=fill, anchor=anchor)

def fit_font(d, s, weight, size, maxw):
    f = F(weight, size)
    while d.textlength(s, font=f) > maxw and size > 20: size -= 2; f = F(weight, size)
    return f

def fit_or_wrap(d, s, weight, size, maxw, min_size=34):
    """One line if it fits at a readable size; otherwise two balanced lines when that gives clearly bigger text."""
    sz = size
    while sz > 18 and d.textlength(s, font=F(weight, sz)) > maxw: sz -= 2
    one = sz
    if one == size: return F(weight, one), [s]
    words = s.split(); best = None
    for i in range(1, len(words)):
        a, b = " ".join(words[:i]), " ".join(words[i:]); z = size
        while z > 18 and max(d.textlength(a, font=F(weight, z)), d.textlength(b, font=F(weight, z))) > maxw: z -= 2
        if best is None or z > best[0] or (z == best[0] and abs(len(a) - len(b)) < abs(len(best[1]) - len(best[2]))): best = (z, a, b)
    if best and (one < min_size or best[0] >= one + 6): return F(weight, best[0]), [best[1], best[2]]
    return F(weight, one), [s]

def block(d, cx, cy, s, weight, size, maxw, fill, min_size=34, anchor="mm", lh=1.18):
    f, lines = fit_or_wrap(d, s, weight, size, maxw, min_size)
    step = f.size * lh; y0 = cy - step * (len(lines) - 1) / 2
    for i, ln in enumerate(lines): d.text((cx, y0 + i * step), ln, font=f, fill=fill, anchor=anchor)
    return len(lines), f

def words_in(d, th, x, y, s, f, fill, t0, t, per=0.07, base=None):
    base = base or th.BG; words = s.split(); gap = f.size * 0.28
    widths = [d.textlength(w, font=f) for w in words]; cx = x - (sum(widths) + gap * (len(words) - 1)) / 2
    for i, w in enumerate(words):
        k = ease((t - t0 - i * per) / 0.3)
        if k > 0:
            col = tuple(int(base[j] + (fill[j] - base[j]) * k) for j in range(3))
            d.text((cx, y + 30 * (1 - k)), w, font=f, fill=col, anchor="lm")
        cx += widths[i] + gap

def card(im, th, box, k, fill=None, radius=40):
    if k <= 0: return 0
    fill = fill or th.CARD; x0, y0, x1, y1 = box; dy = int(80 * (1 - k))
    sh = Image.new("L", (W, H), 0)
    ImageDraw.Draw(sh).rounded_rectangle([x0 + 6, y0 + 22 + dy, x1 + 6, y1 + 22 + dy], radius, fill=int(40 * k))
    im.paste(Image.new("RGB", (W, H), (0, 0, 0)), (0, 0), sh.filter(ImageFilter.GaussianBlur(24)))
    ImageDraw.Draw(im).rounded_rectangle([x0, y0 + dy, x1, y1 + dy], radius, fill=fill)
    return dy

def chip(d, th, cx, cy, s, k, fill=None, size=44):
    if k <= 0: return
    fill = fill or th.ACC
    if fill == th.ACC: fg = th.ON_ACC
    elif th.LIGHT and fill == th.CARD: fill, fg = th.TXT, th.BG
    else: fg = th.INK
    f = fit_font(d, s, "ExtraBold", size, W - 160); w = d.textlength(s, font=f) / 2 + 36
    d.rounded_rectangle([cx - w * k, cy - 42, cx + w * k, cy + 42], 42, fill=fill)
    if k > 0.95: text(d, (cx, cy), s, f, fg)

# ---------- icons for the "what it is" flow ----------
def icon(d, th, kind, cx, cy):
    ink, acc = th.INK, th.ACC
    if kind == "person":
        d.ellipse([cx - 34, cy - 70, cx + 34, cy - 2], fill=ink); d.pieslice([cx - 66, cy + 6, cx + 66, cy + 130], 180, 360, fill=ink)
    elif kind == "play":
        d.rounded_rectangle([cx - 46, cy - 80, cx + 46, cy + 80], 16, fill=ink)
        d.polygon([(cx - 14, cy - 22), (cx - 14, cy + 22), (cx + 22, cy)], fill=acc if th.ON_ACC == th.INK else (255, 255, 255))
    elif kind == "store":
        d.rounded_rectangle([cx - 70, cy - 70, cx + 70, cy + 70], 20, outline=ink, width=8); text(d, (cx, cy), "B", F("Black", 80), ink)
    elif kind == "link":
        d.rounded_rectangle([cx - 78, cy - 26, cx + 6, cy + 26], 26, outline=acc, width=14)
        d.rounded_rectangle([cx - 6, cy - 26, cx + 78, cy + 26], 26, outline=ink, width=14)
    elif kind == "cart":
        d.line([(cx - 70, cy - 50), (cx - 45, cy - 50), (cx - 25, cy + 30), (cx + 55, cy + 30), (cx + 70, cy - 30), (cx - 35, cy - 30)], fill=ink, width=12, joint="curve")
        d.ellipse([cx - 30, cy + 45, cx - 6, cy + 69], fill=ink); d.ellipse([cx + 30, cy + 45, cx + 54, cy + 69], fill=ink)
    elif kind == "coin":
        d.ellipse([cx - 66, cy - 66, cx + 66, cy + 66], outline=acc, width=12); text(d, (cx, cy + 2), "$", F("Black", 80), acc)
    elif kind == "mail":
        d.rounded_rectangle([cx - 72, cy - 50, cx + 72, cy + 50], 12, outline=ink, width=10)
        d.line([(cx - 66, cy - 42), (cx, cy + 8), (cx + 66, cy - 42)], fill=ink, width=10, joint="curve")
    elif kind == "people":
        for dx in (-34, 34):
            d.ellipse([cx + dx - 24, cy - 60, cx + dx + 24, cy - 12], fill=ink); d.pieslice([cx + dx - 46, cy - 2, cx + dx + 46, cy + 90], 180, 360, fill=ink)
    else:
        text(d, (cx, cy), kind[:2].upper(), F("Black", 70), ink)

# ---------- scenes ----------
def topbar(d, th, spec):
    d.rounded_rectangle([60, 90, 520, 160], 35, fill=th.CARD, outline=(th.TXT if th.LIGHT else th.CARD), width=3)
    d.ellipse([74, 104, 116, 146], fill=th.ACC); text(d, (95, 126), "$", F("Black", 26), th.ON_ACC)
    text(d, (132, 125), spec.get("brand", "SUB-CREATOR PAID"), F("ExtraBold", 30), th.INK, anchor="lm")
    tag = spec.get("series_tag", f"Stream #{int(spec.get('stream_no', 1)):02d}")
    f = F("ExtraBold", 32); w = d.textlength(tag, font=f) + 70
    d.rounded_rectangle([W - 60 - w, 90, W - 60, 160], 35, fill=th.ACC); text(d, (W - 60 - w / 2, 125), tag, f, th.ON_ACC)

def scene_hook(im, d, th, sc, st, t0, t):
    k = pop(t, t0); fs = int(118 * min(1.1, k)) if k > 0 else 0
    if fs > 8:
        text(d, (W / 2, 560), sc["line1"], fit_font(d, sc["line1"], "Black", fs, W - 120), th.TXT)
        text(d, (W / 2, 690), sc["line2"], fit_font(d, sc["line2"], "Black", fs, W - 120), th.TXT)
    if st > 1.0:
        k2 = pop(t, t0 + 1.0); f, lines = fit_or_wrap(d, sc["pill"], "Black", 56, 760, 44)
        hw = max(d.textlength(l, font=f) for l in lines) / 2 + 50; hh = 70 if len(lines) == 1 else 110
        d.rounded_rectangle([W / 2 - hw * k2, 890 - hh, W / 2 + hw * k2, 890 + hh], 70, fill=th.ACC)
        if k2 > 0.7: block(d, W / 2, 890, sc["pill"], "Black", 56, 760, th.ON_ACC, 44)

def scene_what(im, d, th, sc, st, t0, t):
    k = pop(t, t0); fs = int(200 * min(1.1, k)) if k > 0 else 0
    if fs > 8: text(d, (W / 2, 420), sc["title"], fit_font(d, sc["title"], "Black", fs, W - 120), th.ACC)
    sub = sc.get("subtitle", "")
    f, lines = fit_or_wrap(d, sub, "ExtraBold", 54, W - 160, 40)
    for j, ln in enumerate(lines):
        words_in(d, th, W / 2, 560 + (j - (len(lines) - 1) / 2) * f.size * 1.2, ln, f, th.TXT, t0 + 0.3 + j * 0.3, t)
    flow = sc.get("flow", [])[:4]; n = len(flow); ys = 840
    step = 320 if n <= 3 else 245; R0 = 110 if n <= 3 else 92; sc_ = R0 / 110
    for i, item in enumerate(flow):
        kk = back((st - 0.8 - i * 0.45) / 0.35)
        if kk <= 0: continue
        cx = W / 2 + (i - (n - 1) / 2) * step; r = R0 * min(1, kk)
        d.rounded_rectangle([cx - r, ys - r, cx + r, ys + r], 36, fill=th.CARD)
        if kk > 0.7:
            if sc_ < 1:
                tile = Image.new("RGBA", (240, 240), (0, 0, 0, 0)); icon(ImageDraw.Draw(tile), th, item.get("icon", "play"), 120, 120)
                tile = tile.resize((int(240 * sc_), int(240 * sc_)), Image.LANCZOS)
                im.paste(tile.convert("RGB"), (int(cx - tile.width / 2), int(ys - tile.height / 2)), tile)
            else: icon(d, th, item.get("icon", "play"), cx, ys)
            block(d, cx, ys + R0 + 52, item["label"], "ExtraBold", 34, step - 24, th.TXT, 26)
        if i > 0 and kk > 0.2:
            a0 = cx - step + R0 + 10; a1 = cx - R0 - 10
            d.line([(a0, ys), (a1 - 24, ys)], fill=th.ACC, width=10)
            d.polygon([(a1 - 24, ys - 18), (a1 - 24, ys + 18), (a1, ys)], fill=th.ACC)
    if sc.get("chip") and st > 3.0: chip(d, th, W / 2, 1150, sc["chip"], back((st - 3.0) / 0.4), fill=th.CARD)

def scene_proof(im, d, th, sc, st, t0, t, dur):
    dy = card(im, th, (110, 300, 970, 1300), ease(st / 0.45)); d = ImageDraw.Draw(im)
    if st > 0.3:
        f = F("Black", 30); tw = d.textlength(sc.get("tag", "EXAMPLE"), font=f) + 60
        d.rounded_rectangle([170, 360 + dy, 170 + tw, 420 + dy], 30, fill=th.ACC)
        text(d, (170 + tw / 2, 391 + dy), sc.get("tag", "EXAMPLE"), f, th.ON_ACC)
        text(d, (170, 500 + dy), sc["title"], fit_font(d, sc["title"], "Black", 64, 740), th.INK, anchor="lm")
    rows = list(sc.get("rows", []))
    money = sc.get("money")
    allrows = rows + ([[money["label"], None]] if money else [])
    for i, (a, b) in enumerate(allrows[:5]):
        kk = ease((st - 0.6 - i * 0.4) / 0.35)
        if kk <= 0: continue
        y = 640 + i * 120 + dy + 30 * (1 - kk)
        d.line([(170, y - 56), (910, y - 56)], fill=(232, 230, 222), width=3)
        text(d, (170, y), a, F("SemiBold", 40), th.MUTED_C, anchor="lm")
        if b is None:
            start = 0.6 + len(rows) * 0.4
            v = money["value"] * ease((st - start) / 0.9)
            dec = int(money.get("decimals", 0)); s = f"{money.get('prefix', '$')}{v:,.{dec}f}{money.get('suffix', '')}"
            text(d, (910, y), s, F("Black", 78), th.INK, anchor="rm")
        else:
            block(d, 910, y, b, "ExtraBold", 42, 430, th.INK, 32, anchor="rm")
    if sc.get("chip"):
        at = min(dur - 1.2, 0.6 + len(allrows) * 0.4 + 1.0)
        if st > at: chip(d, th, W / 2, 1220 + dy, sc["chip"], back((st - at) / 0.4), size=38)

def scene_fit(im, d, th, sc, st, t0, t, dur):
    words_in(d, th, W / 2, 380, sc.get("title", "GREAT FOR"), F("Black", 72), th.TXT, t0, t)
    chips = sc.get("chips", [])[:4]; size = 46
    while size > 30 and sum(d.textlength(c, font=F("ExtraBold", size)) + 72 for c in chips) + 24 * (len(chips) - 1) > W - 120: size -= 2
    ws = [d.textlength(c, font=F("ExtraBold", size)) + 72 for c in chips]; x = (W - sum(ws) - 24 * (len(chips) - 1)) / 2
    for i, s_ in enumerate(chips):
        chip(d, th, x + ws[i] / 2, 510, s_, back((st - 0.4 - i * 0.25) / 0.35), fill=th.CARD, size=size); x += ws[i] + 24
    cat = min(2.0, dur * 0.35)
    if st > cat:
        dy = card(im, th, (110, 640, 970, 1240), ease((st - cat) / 0.45), fill=th.ACC); d = ImageDraw.Draw(im)
        text(d, (W / 2, 730 + dy), sc.get("catch_title", "THE CATCH"), F("Black", 72), th.ON_ACC)
        ct = sc.get("catch_text", "")
        nl, _ = block(d, W / 2, 822 + dy + (24 if len(fit_or_wrap(d, ct, "ExtraBold", 46, 780, 38)[1]) > 1 else 0), ct, "ExtraBold", 46, 780, th.ON_ACC, 38)
        dy += 30 if nl > 1 else 0
        items = sc.get("catch_items", [])
        for i, s in enumerate(items[:4]):
            kk = back((st - cat - 0.7 - i * 0.35) / 0.3)
            if kk <= 0: continue
            step = 230 if len(items) <= 3 else 190
            cx = W / 2 + (i - (len(items) - 1) / 2) * step; r = 80 * min(1, kk)
            d.rounded_rectangle([cx - r * 0.85, 1010 + dy - r, cx + r * 0.85, 1010 + dy + r], 20, fill=th.ON_ACC)
            if kk > 0.8:
                bg = th.ACC if th.ON_ACC != th.INK else th.ACC
                text(d, (cx, 1010 + dy), str(i + 1), F("Black", 64), th.ACC if th.ON_ACC == (255, 255, 255) else (255, 255, 255))
                text(d, (cx, 1145 + dy), s, fit_font(d, s, "Bold", 30, step - 20), th.ON_ACC)

def scene_cta(im, d, th, sc, st, t0, t):
    k = pop(t, t0); fs = int(130 * min(1.1, k)) if k > 0 else 0
    if fs > 8: text(d, (W / 2, 520), sc.get("big", "SEND THIS"), fit_font(d, sc.get("big", "SEND THIS"), "Black", fs, W - 120), th.ACC)
    words_in(d, th, W / 2, 650, sc.get("sub", "to a creator friend"), F("ExtraBold", 64), th.TXT, t0 + 0.3, t)
    if st > 0.6:
        p = ease((st - 0.6) / 1.2); px = W / 2 - 120 + 240 * p; py = 830 - 60 * math.sin(p * math.pi)
        d.polygon([(px - 70, py), (px + 70, py - 45), (px + 10, py + 55)], fill=th.TXT)
        d.polygon([(px + 70, py - 45), (px - 5, py + 10), (px + 10, py + 55)], fill=th.MUTED)
    if st > 1.6:
        k2 = pop(t, t0 + 1.6); s = sc.get("pill", "Follow: 1 income stream / day")
        f = fit_font(d, s, "Black", 46, 820); hw = d.textlength(s, font=f) / 2 + 50
        d.rounded_rectangle([W / 2 - hw * k2, 980, W / 2 + hw * k2, 1100], 60, fill=th.ACC)
        if k2 > 0.7: text(d, (W / 2, 1040), s, f, th.ON_ACC)

ORDER = ["hook", "what", "proof", "fit", "cta"]

class Reel:
    def __init__(self, spec, bounds, segs, nora=None, nora_photo=None, mode=None):
        self.spec = spec; self.th = Theme(spec.get("palette")); self.B = bounds; self.SEGS = segs
        self.total = bounds[-1]; self.nora = nora; self.mode = mode; self.photo = None
        if nora_photo:
            p = Image.open(nora_photo).convert("RGB"); s = min(p.size)
            p = p.crop(((p.width - s) // 2, 0, (p.width + s) // 2, s)).resize((240, 240))
            m = Image.new("L", (240, 240), 0); ImageDraw.Draw(m).ellipse([0, 0, 239, 239], fill=255); self.photo = (p, m)
        caps = spec.get("captions") or spec["lines"]
        self.chunks = []
        for (a, b), s in zip(segs, caps):
            if a is None: continue
            ws = s.split(); groups = [" ".join(ws[i:i + 4]) for i in range(0, len(ws), 4)]
            tot = sum(len(g) for g in groups) or 1; x = a
            for g in groups:
                dd = (b - a) * len(g) / tot; self.chunks.append((x - 0.05, x + dd + 0.1, g)); x += dd

    def scene(self, t):
        for i in range(5):
            if t < self.B[i + 1]: return i
        return 4

    def frame(self, t, captions=True, still=False):
        th = self.th; sc = self.scene(t); t0 = self.B[sc]; st = t - t0; dur = self.B[sc + 1] - t0
        nora_full = self.nora is not None and not still and (sc == 0 or (sc == 4 and self.mode == "talking"))
        if nora_full:
            im = self.nora.get(t if self.mode == "talking" else st); d = ImageDraw.Draw(im)
            if sc == 0:  # hook words over the lower part of Nora's shot
                k = pop(t, t0 + 0.2)
                if k > 0:
                    for y, s in ((1260, self.spec["scenes"]["hook"]["line1"]), (1365, self.spec["scenes"]["hook"]["line2"])):
                        f = fit_font(d, s, "Black", int(96 * min(1.1, k)), W - 120)
                        d.text((W / 2, y), s, font=f, fill=(255, 255, 255), anchor="mm", stroke_width=8, stroke_fill=th.TXT)
            else:  # closing call to action over Nora
                c = self.spec["scenes"]["cta"]; k = pop(t, t0 + 0.2)
                if k > 0:
                    f = fit_font(d, c.get("big", "SEND THIS"), "Black", int(110 * min(1.1, k)), W - 120)
                    d.text((W / 2, 1180), c.get("big", "SEND THIS"), font=f, fill=(255, 255, 255), anchor="mm", stroke_width=8, stroke_fill=th.TXT)
                if st > 0.6:
                    k2 = pop(t, t0 + 0.6); s_ = c.get("pill", "Follow: 1 income stream / day")
                    f = fit_font(d, s_, "Black", 44, 820); hw = d.textlength(s_, font=f) / 2 + 46
                    d.rounded_rectangle([W / 2 - hw * k2, 1270, W / 2 + hw * k2, 1380], 55, fill=th.ACC)
                    if k2 > 0.7: text(d, (W / 2, 1325), s_, f, th.ON_ACC)
            d.rounded_rectangle([40, 90, 230, 140], 25, fill=(0, 0, 0)); text(d, (135, 115), "AI host", F("Bold", 28), (255, 255, 255))
        else:
            im = th.background(t); d = ImageDraw.Draw(im); topbar(d, th, self.spec)
            s = self.spec["scenes"][ORDER[sc]]
            if sc == 0: scene_hook(im, d, th, s, st, t0, t)
            elif sc == 1: scene_what(im, d, th, s, st, t0, t)
            elif sc == 2: scene_proof(im, d, th, s, st, t0, t, dur)
            elif sc == 3: scene_fit(im, d, th, s, st, t0, t, dur)
            else: scene_cta(im, d, th, s, st, t0, t)
            d = ImageDraw.Draw(im)
            live = self.mode == "talking" and self.nora is not None
            if (self.photo or live) and not still and sc in (1, 2, 3):
                sz = 260 if live else 240; x0, y0 = W - sz - 70, 1880 - sz
                face = self.nora.face(t, sz) if live else self.photo[0]
                m = Image.new("L", (sz, sz), 0); ImageDraw.Draw(m).ellipse([0, 0, sz - 1, sz - 1], fill=255)
                d.ellipse([x0 - 8, y0 - 8, x0 + sz + 8, y0 + sz + 8], fill=th.ACC); im.paste(face, (x0, y0), m)
                d.rounded_rectangle([x0 + sz / 2 - 70, y0 + sz - 22, x0 + sz / 2 + 70, y0 + sz + 20], 21, fill=(0, 0, 0))
                text(d, (x0 + sz / 2, y0 + sz - 1), "AI host", F("Bold", 22), (255, 255, 255))
        d = ImageDraw.Draw(im)
        if captions:
            ch = [c for c in self.chunks if c[0] <= t < c[1]]
            if ch:
                s = ch[-1][2]; f = F("ExtraBold", 52); ws = s.split(); gap = 16
                tw = sum(d.textlength(w_, font=f) for w_ in ws) + gap * (len(ws) - 1)
                if tw > W - 160:
                    f = F("ExtraBold", int(52 * (W - 160) / tw)); tw = sum(d.textlength(w_, font=f) for w_ in ws) + gap * (len(ws) - 1)
                x = (W - tw) / 2
                if th.LIGHT: d.rounded_rectangle([x - 34, 1490, x + tw + 34, 1590], 50, fill=th.TXT)
                for w_ in ws:
                    if th.LIGHT: d.text((x, 1540), w_, font=f, fill=th.BG, anchor="lm")
                    else: d.text((x, 1540), w_, font=f, fill=(255, 255, 255), anchor="lm", stroke_width=7, stroke_fill=th.INK)
                    x += d.textlength(w_, font=f) + gap
        if not still:
            side = (self.photo or self.mode == "talking") and self.scene(t) in (1, 2, 3)
            text(d, (W / 2 - (150 if side else 0), H - 120), self.spec.get("handle", "@subcreatorpaid"), F("SemiBold", 34), th.MUTED)
            d.rectangle([0, H - 12, W * t / self.total, H], fill=th.ACC)
        return im

# ---------- audio ----------
def run(cmd): subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
def load_audio(path):
    tmp = tempfile.mktemp(suffix=".wav"); run(["ffmpeg", "-y", "-i", path, "-ac", "1", "-ar", str(SR), tmp])
    from scipy.io import wavfile
    _, x = wavfile.read(tmp); os.remove(tmp); return x.astype(np.float32) / 32768

def flite_voice(lines):
    clips = []
    for s in lines:
        tmp = tempfile.mktemp(suffix=".wav"); t = s.replace("'", "’").replace(":", ",").replace("$", " dollars ")
        run(["ffmpeg", "-y", "-f", "lavfi", "-i", f"flite=text='{t}':voice=slt", "-af",
             f"asetrate=16000*1.07,aresample={SR},atempo={1.12 / 1.07:.4f}", "-ac", "1", "-ar", str(SR), tmp])
        x = load_audio(tmp); os.remove(tmp); idx = np.where(np.abs(x) > 0.01)[0]
        clips.append(x[max(0, idx[0] - 200): idx[-1] + 2000])
    gap = np.zeros(int(0.35 * SR), np.float32)
    return np.concatenate(sum([[c, gap] for c in clips], [])[:-1]), True

def find_gaps(x, min_ms=120):
    hop = int(0.01 * SR); env = np.array([np.abs(x[i:i + hop]).max() if i < len(x) else 0 for i in range(0, len(x), hop)])
    thr = max(0.02, env.max() * 0.06); voiced = env > thr; idx = np.where(voiced)[0]
    if len(idx) == 0: return hop, 0, 0, []
    first, last = idx[0], idx[-1]; gaps = []; i = first
    while i <= last:
        if not voiced[i]:
            j = i
            while j <= last and not voiced[j]: j += 1
            if j - i >= min_ms // 10: gaps.append((j - i, i, j))
            i = j
        else: i += 1
    return hop, first, last, gaps

def split_by_pauses(x, n, lines=None):
    """Return n (start, end) sample spans, one per line. Picks n-1 pauses (in order) so every line's length is
    close to its expected length (by characters), preferring longer pauses. Segment-based dynamic programming."""
    hop, first, last, gaps = find_gaps(x)
    if last <= first: return [(0, len(x))] * n
    if n == 1: return [(first * hop, (last + 1) * hop)]
    if len(gaps) < n - 1:
        chosen = sorted(gaps, key=lambda g: g[1])
    else:
        def est(l):  # rough spoken length: characters, with spelled-out letters and numbers counted longer
            return max(4, sum(3 if (len(t) == 1 and t.isalpha()) else len(t) + (2 if any(c.isdigit() for c in t) else 0) for t in l.split()))
        w = [est(l) for l in lines] if lines and len(lines) == n else [1] * n
        G = len(gaps); speech = (last - first) - sum(g[0] for g in gaps) * 0.5
        exp = [speech * wi / sum(w) for wi in w]
        starts = [first] + [g[2] for g in gaps]; ends = [g[1] for g in gaps] + [last]
        def seg_cost(j, si, ei):  # line j runs from starts[si] to ends[ei]
            L = ends[ei] - starts[si]
            if L <= 0: return 1e9
            r = L / exp[j]; return (math.log(r)) ** 2
        bonus = [min(g[0], 120) / 120.0 for g in gaps]
        INF = 1e18; dp = [[INF] * G for _ in range(n - 1)]; bk = [[-1] * G for _ in range(n - 1)]
        for k in range(G): dp[0][k] = seg_cost(0, 0, k) - 1.6 * bonus[k]
        for j in range(1, n - 1):
            for k in range(j, G):
                best, arg = INF, -1
                for kp in range(j - 1, k):
                    if dp[j - 1][kp] >= INF: continue
                    c = dp[j - 1][kp] + seg_cost(j, kp + 1, k)
                    if c < best: best, arg = c, kp
                if arg >= 0: dp[j][k] = best - 1.6 * bonus[k]; bk[j][k] = arg
        best, kk = INF, -1
        for k in range(n - 2, G):
            c = dp[n - 2][k] + seg_cost(n - 1, k + 1, G) if dp[n - 2][k] < INF else INF
            if c < best: best, kk = c, k
        chosen = []
        for j in range(n - 2, -1, -1): chosen.append(gaps[kk]); kk = bk[j][kk]
        chosen = chosen[::-1]
    spans = []; s0 = first
    for _, ga, gb in chosen[:n - 1]: spans.append((s0 * hop, ga * hop)); s0 = gb
    spans.append((s0 * hop, (last + 1) * hop))
    while len(spans) < n: spans.append(spans[-1])
    return spans

def split_batch_voice(audio_path, spec_paths):
    """One voiceover MP3 holding several videos' lines in order -> one WAV per spec (sets audio.voice)."""
    from scipy.io import wavfile
    x = load_audio(audio_path); specs = [json.load(open(p)) for p in spec_paths]
    per = [[] if (sp.get("nora") or {}).get("talking") else sp["lines"][1:] if (sp.get("nora") or {}).get("clip") else sp["lines"] for sp in specs]
    allines = [l for ls in per for l in ls]
    spans = split_by_pauses(x, len(allines), allines); k = 0
    for sp_path, sp, ls in zip(spec_paths, specs, per):
        if not ls: print(f"{os.path.basename(sp_path)} <- skipped (Nora speaks the whole video)"); continue
        parts = spans[k:k + len(ls)]; k += len(ls)
        gap = np.zeros(int(0.45 * SR), np.float32)
        audio = np.concatenate(sum([[x[a:b], gap] for a, b in parts], [])[:-1])
        out = os.path.splitext(sp_path)[0] + "_voice.wav"; wavfile.write(out, SR, (audio * 32767).astype(np.int16))
        sp.setdefault("audio", {})["voice"] = os.path.abspath(out); json.dump(sp, open(sp_path, "w"), indent=2)
        print(f"{os.path.basename(sp_path)} <- {len(ls)} lines, {len(audio) / SR:.1f}s")

def synth_bed(N, bounds, reveal_times):
    tt = np.arange(N) / SR; rng = np.random.default_rng(1)
    from scipy.signal import butter, lfilter
    music = np.zeros(N, np.float32); beat = 60 / 104
    def add(buf, sig, at, g):
        i = int(at * SR); j = min(N, i + len(sig))
        if 0 <= i < N: buf[i:j] += g * sig[:j - i]
    kt = np.arange(int(0.35 * SR)) / SR; kick = np.sin(2 * np.pi * (50 + 90 * np.exp(-kt * 30)) * kt) * np.exp(-kt * 9)
    sn = rng.normal(0, 1, int(0.25 * SR)) * np.exp(-np.arange(int(0.25 * SR)) / (0.06 * SR))
    b, a = butter(2, [1500 / (SR / 2), 6000 / (SR / 2)], "band"); sn = lfilter(b, a, sn)
    hat = rng.normal(0, 1, int(0.05 * SR)) * np.exp(-np.arange(int(0.05 * SR)) / (0.012 * SR))
    b, a = butter(2, 7000 / (SR / 2), "high"); hat = lfilter(b, a, hat)
    k = 0; x = 0.0
    while x < N / SR:
        if k % 4 == 0 or k % 8 == 6: add(music, kick, x, 0.9)
        if k % 4 == 2: add(music, sn, x, 0.35)
        add(music, hat, x + beat / 2, 0.12); x += beat; k += 1
    chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]; bar = beat * 4
    for ci in range(int(N / SR / bar) + 1):
        s = int(ci * bar * SR); n = min(N - s, int(bar * SR))
        if n <= 0: break
        lt = np.arange(n) / SR; pad = sum(np.sin(2 * np.pi * 440 * 2 ** ((m - 69) / 12) * lt) for m in chords[ci % 4])
        music[s:s + n] += pad * np.minimum(1, lt / 0.3) * np.minimum(1, (bar - lt) / 0.3) * 0.08
    b, a = butter(2, 2500 / (SR / 2), "low"); music = lfilter(b, a, music).astype(np.float32)
    music /= np.abs(music).max() + 1e-9; music *= 0.14
    sfx = np.zeros(N, np.float32)
    def ding(f0):
        lt = np.arange(int(0.6 * SR)) / SR; return (np.sin(2 * np.pi * f0 * lt) + 0.5 * np.sin(2 * np.pi * f0 * 2.76 * lt)) * np.exp(-lt * 6)
    def whoosh():
        n = int(0.35 * SR); w = rng.normal(0, 1, n); b, a = butter(2, [800 / (SR / 2), 5000 / (SR / 2)], "band")
        return lfilter(b, a, w) * np.sin(np.linspace(0, np.pi, n)) ** 2
    def blip():
        lt = np.arange(int(0.12 * SR)) / SR; return np.sin(2 * np.pi * 660 * lt) * np.exp(-lt * 30)
    for bt in bounds[1:-1]: add(sfx, whoosh(), bt - 0.15, 0.3)
    for rt, kind in reveal_times: add(sfx, ding(1568) if kind == "ding" else blip(), rt, 0.35 if kind == "ding" else 0.28)
    return music, sfx

def build_audio(spec, outdir, nora_audio=None, talking=False):
    lines = spec["lines"]; voice_path = (spec.get("audio") or {}).get("voice"); fallback = False
    if talking:  # Nora's clip is the whole timeline: find the 5 lines inside it, keep her audio as is
        x = nora_audio; spans = split_by_pauses(x, 5, lines)
        segs = [(a / SR, b / SR) for a, b in spans]; total = round(len(x) / SR + 0.5, 2); parts = [(0.0, x)]
        return _mix(spec, outdir, segs, parts, total, fallback)
    want = 4 if nora_audio is not None else 5
    if voice_path:
        x = load_audio(voice_path); spans = split_by_pauses(x, want, lines[5 - want:]); fallback = False
    else:
        x, fallback = flite_voice(lines[5 - want:]); spans = split_by_pauses(x, want)
    pause = 0.45; segs = []; parts = []; t = 0.15
    if nora_audio is not None:
        segs.append((0.0, len(nora_audio) / SR)); parts.append((0.0, nora_audio)); t = len(nora_audio) / SR + 0.1
    for a, b in spans:
        seg = x[a:b]; segs.append((t, t + len(seg) / SR)); parts.append((t, seg)); t += len(seg) / SR + pause
    total = round(t + 0.6, 2)
    return _mix(spec, outdir, segs, parts, total, fallback)

def _mix(spec, outdir, segs, parts, total, fallback):
    bounds = [0.0] + [(segs[i][1] + segs[i + 1][0]) / 2 for i in range(4)] + [total]
    N = int(total * SR); voice = np.zeros(N, np.float32)
    for at, seg in parts:
        i = int(at * SR); voice[i:i + len(seg)] += seg[:N - i]
    voice /= np.abs(voice).max() + 1e-9; voice *= 0.92
    reveals = [(bounds[1] + 0.8 + i * 0.45, "blip") for i in range(len(spec["scenes"]["what"].get("flow", [])))]
    nrows = len(spec["scenes"]["proof"].get("rows", [])) + 1
    reveals += [(bounds[2] + 0.6 + i * 0.4, "blip") for i in range(nrows)] + [(bounds[2] + 0.6 + nrows * 0.4 + 0.8, "ding")]
    reveals += [(bounds[4] + 1.6, "ding")]
    music, sfx = synth_bed(N, bounds, reveals)
    venv = np.convolve(np.abs(voice), np.ones(4410) / 4410, "same")
    music *= 1 - 0.5 * np.clip(venv / (venv.max() + 1e-9) * 3, 0, 1)
    mix = voice + music + sfx; mix /= max(1.0, np.abs(mix).max() / 0.95)
    from scipy.io import wavfile
    path = os.path.join(outdir, "_mix.wav"); wavfile.write(path, SR, (mix * 32767).astype(np.int16))
    return path, bounds, segs, fallback

class NoraVideo:
    """A Google Vids clip of Nora, cropped to fill 1080x1920 and read frame by frame from disk."""
    def __init__(self, path, face_box=None):
        self.dir = tempfile.mkdtemp()
        probe = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height",
                                "-of", "csv=p=0", path], capture_output=True, text=True).stdout.strip().split(",")
        vw, vh = int(probe[0]), int(probe[1]); self.landscape = vw > vh * 1.05
        if self.landscape:
            # 16:9 export: full-width video band over a soft, blurred copy of itself
            fh = int(round(W * vh / vw / 2) * 2); self.band_y = 400
            flt = (f"[0:v]split[a][b];[a]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},boxblur=40:4,"
                   f"eq=brightness=-0.06:saturation=0.8[bg];[b]scale={W}:{fh}[fg];[bg][fg]overlay=0:{self.band_y},fps={FPS}")
            run(["ffmpeg", "-y", "-i", path, "-filter_complex", flt, "-q:v", "2", os.path.join(self.dir, "f%05d.jpg")])
            default = [W // 2 - int(fh * 0.36), self.band_y + int(fh * 0.06), int(fh * 0.72)]
        else:
            run(["ffmpeg", "-y", "-i", path, "-vf", f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps={FPS}",
                 "-q:v", "2", os.path.join(self.dir, "f%05d.jpg")])
            default = [190, 250, 700]
        self.n = len([f for f in os.listdir(self.dir) if f.endswith(".jpg")])
        self.audio = load_audio(path); self.duration = len(self.audio) / SR
        self.face_box = face_box or default  # x, y, size of the square used for the bubble
        self._cache = (None, None)
    def face_check(self, out_path):
        im = self.get(min(1.0, self.duration / 2)); d = ImageDraw.Draw(im); x, y, s = self.face_box
        d.rectangle([x, y, x + s, y + s], outline=(255, 0, 0), width=8); d.text((x + 12, y + 12), "bubble crop", font=F("Bold", 40), fill=(255, 0, 0))
        im.resize((W // 2, H // 2)).save(out_path)
    def get(self, t):
        i = int(clamp(t * FPS, 0, self.n - 1)) + 1
        if self._cache[0] != i: self._cache = (i, Image.open(os.path.join(self.dir, f"f{i:05d}.jpg")).convert("RGB"))
        return self._cache[1].copy()
    def face(self, t, size):
        x, y, s = self.face_box; return self.get(t).crop((x, y, x + s, y + s)).resize((size, size), Image.LANCZOS)

# ---------- stills ----------
def stills(reel, outdir, slug):
    B = reel.B; ends = [B[i + 1] - 0.05 for i in range(5)]
    cover = reel.frame(ends[0], captions=False, still=True)
    d = ImageDraw.Draw(cover); text(d, (W / 2, H - 120), reel.spec.get("handle", "@subcreatorpaid"), F("SemiBold", 34), reel.th.MUTED)
    cover.save(os.path.join(outdir, f"{slug}_cover.png"))
    slides = []
    for i, t in enumerate(ends):
        im = reel.frame(t, captions=False, still=True).crop((0, 60, W, 1410))
        d = ImageDraw.Draw(im); th = reel.th
        if i == 4:
            d.rectangle([0, 1150, W, 1350], fill=th.BG)
            text(d, (W / 2, 1230), "Save this for later", F("ExtraBold", 48), th.TXT)
        text(d, (W - 70, 1300), f"{i + 1}/5", F("Bold", 34), th.MUTED, anchor="rm")
        text(d, (70, 1300), reel.spec.get("handle", "@subcreatorpaid"), F("SemiBold", 32), th.MUTED, anchor="lm")
        p = os.path.join(outdir, f"{slug}_carousel_{i + 1}.png"); im.save(p); slides.append(im)
    slides[0].save(os.path.join(outdir, f"{slug}_carousel.pdf"), save_all=True, append_images=slides[1:], resolution=150)
    sheet = Image.new("RGB", (5 * 380 - 20, 450), (40, 40, 40))
    for i, im in enumerate(slides): sheet.paste(im.resize((360, 450)), (i * 380, 0))
    sheet.save(os.path.join(outdir, f"{slug}_carousel_preview.png"))

def roundup(cfg_path, outdir):
    """Weekly roundup carousel (1080x1350): cover, one slide per stream, closing slide; PNGs + PDF + preview."""
    cfg = json.load(open(cfg_path)); th = Theme(cfg.get("palette")); os.makedirs(outdir, exist_ok=True)
    slug = cfg.get("slug", "roundup"); handle = cfg.get("handle", "@subcreatorpaid"); items = cfg["items"]
    n = len(items) + 2; slides = []
    def base(i):
        im = th.background(1.0).crop((0, 60, W, 1410)); d = ImageDraw.Draw(im)
        d.rounded_rectangle([60, 40, 520, 110], 35, fill=th.CARD, outline=(th.TXT if th.LIGHT else th.CARD), width=3)
        d.ellipse([74, 54, 116, 96], fill=th.ACC); text(d, (95, 76), "$", F("Black", 26), th.ON_ACC)
        text(d, (132, 75), cfg.get("brand", "SUB-CREATOR PAID"), F("ExtraBold", 30), th.INK, anchor="lm")
        text(d, (70, 1300), handle, F("SemiBold", 32), th.MUTED, anchor="lm"); text(d, (W - 70, 1300), f"{i}/{n}", F("Bold", 34), th.MUTED, anchor="rm")
        return im, d
    im, d = base(1)
    block(d, W / 2, 470, cfg.get("title", f"{len(items)} WAYS TO GET PAID UNDER 10K"), "Black", 104, W - 140, th.TXT, 70)
    if cfg.get("week"): chip(d, th, W / 2, 700, cfg["week"], 1, size=44)
    block(d, W / 2, 860, cfg.get("subtitle", "Verified this week. Swipe for the catch."), "ExtraBold", 48, W - 180, th.TXT, 36)
    slides.append(im)
    for i, it in enumerate(items):
        im, d = base(i + 2)
        card(im, th, (90, 170, 990, 1220), 1); d = ImageDraw.Draw(im)
        f = F("Black", 30); tag = it.get("tag", f"STREAM #{int(it.get('stream_no', i + 1)):02d}"); tw = d.textlength(tag, font=f) + 60
        d.rounded_rectangle([150, 230, 150 + tw, 290], 30, fill=th.ACC); text(d, (150 + tw / 2, 261), tag, f, th.ON_ACC)
        block(d, 150, 380, it["name"], "Black", 72, 780, th.INK, 48, anchor="lm")
        rows = [("Followers needed", it.get("followers", "")), ("Typical pay", it.get("pay", "")), ("Great for", it.get("great_for", ""))]
        for j, (a_, b_) in enumerate(rows):
            y = 540 + j * 130
            d.line([(150, y - 62), (930, y - 62)], fill=(232, 230, 222), width=3)
            text(d, (150, y), a_, F("SemiBold", 40), th.MUTED_C, anchor="lm"); block(d, 930, y, b_, "ExtraBold", 44, 440, th.INK, 30, anchor="rm")
        d.rounded_rectangle([150, 900, 930, 1160], 30, fill=th.ACC)
        text(d, (190, 960), "THE CATCH", F("Black", 40), th.ON_ACC, anchor="lm")
        block(d, W / 2, 1060, it.get("catch", ""), "ExtraBold", 42, 700, th.ON_ACC, 32)
        slides.append(im)
    im, d = base(n)
    block(d, W / 2, 420, "SAVE THIS", "Black", 130, W - 140, th.ACC, 80)
    block(d, W / 2, 580, "and send it to a creator friend", "ExtraBold", 56, W - 160, th.TXT, 40)
    chip(d, th, W / 2, 760, cfg.get("cta", "Comment LIST for the full guide"), 1, size=46)
    block(d, W / 2, 920, "Follow for one income stream every day", "ExtraBold", 44, W - 200, th.TXT, 34)
    slides.append(im)
    for i, im in enumerate(slides): im.save(os.path.join(outdir, f"{slug}_{i + 1}.png"))
    slides[0].save(os.path.join(outdir, f"{slug}.pdf"), save_all=True, append_images=slides[1:], resolution=150)
    cols = min(len(slides), 7); sheet = Image.new("RGB", (cols * 300 - 12, 375 * ((len(slides) + cols - 1) // cols)), (40, 40, 40))
    for i, im in enumerate(slides): sheet.paste(im.resize((288, 360)), ((i % cols) * 300, (i // cols) * 375))
    sheet.save(os.path.join(outdir, f"{slug}_preview.png")); print(f"roundup done: {len(slides)} slides")

def main():
    if sys.argv[1] == "--split-voice": split_batch_voice(sys.argv[2], sys.argv[3:]); return
    if sys.argv[1] == "--roundup": roundup(sys.argv[2], sys.argv[3]); return
    spec = json.load(open(sys.argv[1])); outdir = sys.argv[2]; os.makedirs(outdir, exist_ok=True)
    only_stills = "--stills" in sys.argv
    slug = spec.get("slug", f"stream{int(spec.get('stream_no', 1)):02d}")
    nora = spec.get("nora") or {}
    nv = None; mode = "talking" if nora.get("talking") else "hook" if nora.get("clip") else None
    if mode and not only_stills:
        nv = NoraVideo(nora.get("talking") or nora.get("clip"), nora.get("face_box"))
        nv.face_check(os.path.join(outdir, f"{slug}_nora_crop_check.png"))
    if only_stills:
        bounds = [0, 3, 9, 15.5, 21.5, 26]; segs = [(bounds[i] + 0.2, bounds[i + 1] - 0.3) for i in range(5)]; mix = None; fb = False
    else:
        mix, bounds, segs, fb = build_audio(spec, outdir, nv.audio if nv else None, talking=(mode == "talking"))
    reel = Reel(spec, bounds, segs, nv, nora.get("photo"), mode)
    stills(reel, outdir, slug)
    if only_stills: print("stills done"); return
    out = os.path.join(outdir, f"{slug}.mp4")
    p = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
                          "-i", "-", "-i", mix, "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p",
                          "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out], stdin=subprocess.PIPE)
    for i in range(int(reel.total * FPS)):
        p.stdin.write(reel.frame(i / FPS).tobytes())
    p.stdin.close(); p.wait(); os.remove(mix)
    json.dump({"video": out, "duration": reel.total, "scene_bounds": bounds, "fallback_voice": fb},
              open(os.path.join(outdir, f"{slug}_render.json"), "w"), indent=2)
    print(f"done: {out} ({reel.total:.1f}s){' [fallback voice]' if fb else ''}")

if __name__ == "__main__":
    main()
