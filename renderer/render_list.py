#!/usr/bin/env python3
"""Sub-Creator Paid "Top 3" list video (kinetic text, no presenter), 1080x1920, 30 fps.

Editing modelled on a 650K-view "Top 3" Short: camera opens on a close-up of the grid and pulls back,
words rise in light grey and darken as they are spoken, *accent* words get their own big uppercase line,
the hook ends on a black highlight box that wipes in, each item opens with "First / Second / Third" plus a
big uppercase name and a 3D-tilted card that slides up, bullets sit beside a phone mockup, blur-whip and
punch-zoom transitions, a tilted book for the comment CTA and a bouncing logo on the follow beat.

Usage:
  python3 render_list.py spec.json OUTDIR            # video + cover
  python3 render_list.py spec.json OUTDIR --stills   # preview frames only

spec.beats = ordered list of {"say": spoken line, "show": {...}}; one voiceover file (audio.voice) reads every
"say" in order with a pause between them (vidIQ: one paragraph per beat). *WORD* marks accent words.
Beat types:
  hook       {"lines": ["3 ways to get *PAID*", "with under 1,000 followers"]}  last line = black highlight box
  title_card {"label": "First", "title": "UGC", "sub": "User-generated content"}
  bullets    {"heading": "...", "items": ["...", "..."]}          (phone mockup on the right)
  statement  {"text": "Brands pay for the *VIDEO*, not your *FOLLOWERS*"}
  features   {"items": [["coin", "text"], ...]}  icons: coin play check clock alert tag link
  book_cta   {"keyword": "LIST", "book_title": "...", "book_sub": "..."}
  follow     {"text": "one new income stream every *DAY*"}
Optional per beat: "transition": "zoom" | "blur" | "cut" (defaults depend on the beat type).
"""
import json, math, os, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from render_reel import (Theme, F, ease, back, pop, text, fit_or_wrap, block, load_audio, split_by_pauses,
                         synth_bed, flite_voice, W, H, FPS, SR)
import sfx as SFX
SFX_LOG = None   # list while rendering the final video; sound events are collected from the frames themselves
CUR_T = 0.0
def fire_at(dt, kind):
    """Log a sound when an element starts: dt = seconds since it started (fires on the first frame only)."""
    if SFX_LOG is not None and 0 <= dt < 1.0 / FPS - 1e-9: SFX_LOG.append((CUR_T - dt, kind))
_F = F
def F(w, size): return _F(w, max(1, int(size)))  # animated sizes can round to 0 at the very start of a pop

CAM_Y = 860           # camera zoom anchor
WM_Y = 1690           # watermark (handle) position
DEFAULT_TRANS = {"hook": "zoom", "title_card": "zoom", "bullets": "cut", "statement": "blur",
                 "features": "cut", "book_cta": "shatter", "follow": "zoom", "shot": "cut", "stack": "zoom",
                 "stat": "blur", "orbit": "zoom", "fanout": "cut", "flow": "whip", "save": "whip"}

def pick_type(s, prev=None):
    """Best-fit beat type for {"type": "auto", ...} (rules from reference/editing-playbook.md)."""
    ty = s.get("type", "auto")
    if ty != "auto": return ty
    if s.get("keyword"): return "book_cta"
    if s.get("label") and (s.get("title") or s.get("badge")): return "title_card"
    if s.get("cards"): return "stack"
    if s.get("big"): return "stat"
    if s.get("steps"): return "flow"
    if s.get("to"): return "fanout"
    if s.get("image"): return "shot"
    if s.get("center") and s.get("items"): return "orbit"
    items = s.get("items") or []
    if items and isinstance(items[0], (list, tuple)): return "features"
    if items: return "features" if prev == "bullets" else "bullets"
    if s.get("bookmark"): return "save"
    return "statement"

def lerp(a, b, k): return tuple(int(a[j] + (b[j] - a[j]) * k) for j in range(3))

# ---------------------------------------------------------------- kinetic text engine
def parse(s):
    out = []
    for w in s.split():
        acc = w.startswith("*") or w.endswith("*") or w.rstrip(".,!?:").endswith("*")
        out.append((w.replace("*", ""), acc))
    return out

def _wrap(d, words, maxw):
    """words = [(text, font, acc)] -> rows of [(text, font, acc, width)]"""
    rows, cur, cw = [], [], 0
    for w, f, a in words:
        ww = d.textlength(w, font=f); sp = f.size * 0.27
        if cur and cw + sp + ww > maxw: rows.append(cur); cur, cw = [], 0
        cw += (sp if cur else 0) + ww; cur.append((w, f, a, ww))
    if cur: rows.append(cur)
    return rows

def build_rows(d, s, maxw, pw="Medium", ps=64, aw="Black", asz=120, upper=True, min_a=64, max_a_rows=2, inline=False):
    """Plain words wrap at (pw, ps); every run of *accent* words gets its own big rows (aw, asz, uppercase).
    A plain run of 1-2 words between two accent runs stays inline with them ("AGAIN and AGAIN")."""
    if inline:  # accent words stay in the sentence, just heavier
        return _wrap(d, [((w.upper() if upper and a else w), F(aw if a else pw, asz if a else ps), a) for w, a in parse(s)], maxw)
    runs = []
    for w, a in parse(s):
        if runs and runs[-1][0] == a: runs[-1][1].append(w)
        else: runs.append([a, [w]])
    groups = []  # [is_accent_group, [(word, acc)]]
    for i, (a, ws) in enumerate(runs):
        sandwiched = (not a) and len(ws) <= 1 and 0 < i < len(runs) - 1
        if (a or sandwiched) and groups and groups[-1][0]: groups[-1][1] += [(w, a) for w in ws]
        elif a: groups.append([True, [(w, a) for w in ws]])
        else: groups.append([False, [(w, a) for w in ws]])
    rows = []
    for is_acc, ws in groups:
        if not is_acc:
            f = F(pw, ps); rows += _wrap(d, [(w, f, False) for w, _ in ws], maxw); continue
        size = asz
        while True:
            fa = F(aw, size); fp = F(pw, max(ps, int(size * 0.55)))
            words = [((w.upper() if upper else w), fa, True) if a else (w, fp, False) for w, a in ws]
            r = _wrap(d, words, maxw)
            if size <= min_a or (len(r) <= max_a_rows and max(sum(x[3] for x in row) for row in r) <= maxw): break
            size -= 4
        rows += r
    return rows

def row_h(row, lh): return max(x[1].size for x in row) * lh

def rows_height(rows, lh=1.1): return sum(row_h(r, lh) for r in rows)

def draw_rows(d, th, rows, cy, t, t0, per, align="center", x0=None, lh=1.1, col=None, acc_col=None, top=None):
    """Words rise ~0.35 em and darken from light grey as they are spoken (word i starts at t0 + i*per)."""
    col = col or th.TXT; acc_col = acc_col or th.TXT; light = lerp(th.BG, col, 0.30)
    y = (top if top is not None else cy - rows_height(rows, lh) / 2); n = 0
    for row in rows:
        rh = row_h(row, lh); tw = sum(x[3] for x in row) + sum(x[1].size * 0.27 for x in row[1:])
        x = (W - tw) / 2 if align == "center" else x0; base = y + rh * 0.5
        for i, (w, f, a, ww) in enumerate(row):
            if i: x += f.size * 0.27
            dt = t - t0 - n * per; n += 1
            fire_at(dt, "thud" if a and f.size >= 110 else "key")
            if dt > 0:
                k = ease(dt / 0.34); vis = min(1.0, dt / 0.08)
                c = lerp(th.BG, lerp(light, acc_col if a else col, k), vis)
                d.text((x, base + f.size * 0.38 * (1 - k)), w, font=f, fill=c, anchor="lm")
            x += ww
        y += rh
    return n

# ---------------------------------------------------------------- shapes, mockups, 3D tilt
def star4(d, cx, cy, r, fill):
    pts = []
    for i in range(8):
        a = math.pi / 4 * i - math.pi / 2; rr = r if i % 2 == 0 else r * 0.24
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    d.polygon(pts, fill=fill)

def sunburst(d, cx, cy, r, rot, fill, k=1.0):
    if k <= 0: return
    r *= k; wdt = max(4, int(r * 0.17))
    for i in range(12):
        a = rot + math.pi / 6 * i; rr = r * (1.0 if i % 3 else 0.82) * (0.93 if i % 2 else 1.0)
        p0 = (cx + r * 0.16 * math.cos(a), cy + r * 0.16 * math.sin(a)); p1 = (cx + rr * math.cos(a), cy + rr * math.sin(a))
        d.line([p0, p1], fill=fill, width=wdt); h = wdt / 2
        d.ellipse([p1[0] - h, p1[1] - h, p1[0] + h, p1[1] + h], fill=fill)
    d.ellipse([cx - r * 0.2, cy - r * 0.2, cx + r * 0.2, cy + r * 0.2], fill=fill)

def _persp(dst, src):
    A = []; B = []
    for (x, y), (u, v) in zip(dst, src):
        A.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); A.append([0, 0, 0, x, y, 1, -v * x, -v * y]); B += [u, v]
    return np.linalg.solve(np.array(A, float), np.array(B, float)).tolist()

def tilt(img, ry, rx, f=1700.0):
    """Rotate an RGBA image around its Y then X axis and project it (a card turned in 3D)."""
    w, h = img.size; dst = []
    for x, y in [(-w / 2, -h / 2), (w / 2, -h / 2), (w / 2, h / 2), (-w / 2, h / 2)]:
        x1 = x * math.cos(ry); z1 = -x * math.sin(ry)
        y2 = y * math.cos(rx) - z1 * math.sin(rx); z2 = y * math.sin(rx) + z1 * math.cos(rx)
        s = f / (f + z2); dst.append((x1 * s, y2 * s))
    mx = min(p[0] for p in dst); my = min(p[1] for p in dst)
    dst = [(p[0] - mx, p[1] - my) for p in dst]
    ow = int(math.ceil(max(p[0] for p in dst))) + 2; oh = int(math.ceil(max(p[1] for p in dst))) + 2
    co = _persp(dst, [(0, 0), (w, 0), (w, h), (0, h)])
    return img.transform((ow, oh), Image.PERSPECTIVE, co, Image.BICUBIC), (-mx, -my)

def place(im, img, cx, cy, ry=0.0, rx=0.0, rot=0.0, scale=1.0, shadow=0.30, sh_off=(26, 48)):
    """Paste an RGBA mockup centred at (cx, cy) with 3D tilt, in-plane rotation and a soft drop shadow."""
    if scale <= 0.01: return
    if ry or rx: img, (ox, oy) = tilt(img, ry, rx)
    else: ox, oy = img.width / 2, img.height / 2
    if rot:
        img = img.rotate(rot, Image.BICUBIC, expand=True); ox, oy = img.width / 2, img.height / 2
    if scale != 1.0:
        img = img.resize((max(1, int(img.width * scale)), max(1, int(img.height * scale))), Image.BILINEAR); ox *= scale; oy *= scale
    x0, y0 = int(cx - ox), int(cy - oy)
    if shadow:
        a = img.getchannel("A"); pad = 60
        sm = Image.new("L", (a.width + pad * 2, a.height + pad * 2), 0); sm.paste(a, (pad, pad))
        sm = sm.resize((sm.width // 4, sm.height // 4)).filter(ImageFilter.GaussianBlur(7)).resize((sm.width // 4 * 4, sm.height // 4 * 4))
        sm = sm.point(lambda v: int(v * shadow))
        im.paste((0, 0, 0), (x0 - pad + sh_off[0], y0 - pad + sh_off[1]), sm)
    im.paste(img, (x0, y0), img)

def rrect_img(w, h, r, fill):
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0)); ImageDraw.Draw(im).rounded_rectangle([0, 0, w - 1, h - 1], r, fill=fill); return im

def logo(d, th, cx, cy, r):
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=th.ACC); text(d, (cx, cy + r * 0.05), "$", F("Black", int(r * 1.25)), th.ON_ACC)

def bars(d, x, y, widths, h, col, gap):
    for i, w in enumerate(widths): d.rounded_rectangle([x, y + i * gap, x + w, y + i * gap + h], h // 2, fill=col)

def title_card_img(th, brand, title, sub):
    w, h = 780, 420; im = rrect_img(w, h, 44, th.CARD + (255,)); d = ImageDraw.Draw(im)
    logo(d, th, 92, 96, 40)
    f, ls = fit_or_wrap(d, title, "Bold", 50, 420, 34); text(d, (150, 82), ls[0] if len(ls) == 1 else title, f if len(ls) == 1 else F("Bold", 34), th.INK, anchor="lm")
    text(d, (150, 124), brand.title(), F("Medium", 26), th.MUTED_C, anchor="lm")
    block(d, 60, 210, sub, "Medium", 30, 400, th.MUTED_C, 22, anchor="lm")
    bars(d, 60, 270, [300, 360, 240], 16, th.GLOW, 36)
    pr = [560, 170, 730, 380]; d.rounded_rectangle(pr, 30, fill=th.GLOW)
    star4(d, (pr[0] + pr[2]) / 2, (pr[1] + pr[3]) / 2, 48, th.ACC)
    for i in range(3): d.ellipse([pr[0] + 24 + i * 22, pr[1] + 22, pr[0] + 36 + i * 22, pr[1] + 34], fill=th.GRID)
    return im

def phone_img(th, title):
    w, h = 420, 860; im = rrect_img(w, h, 64, (16, 16, 18, 255)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([14, 14, w - 15, h - 15], 52, fill=(255, 255, 255)); d.rounded_rectangle([w / 2 - 60, 30, w / 2 + 60, 62], 16, fill=(16, 16, 18))
    text(d, (44, 112), "9:41", F("SemiBold", 22), th.INK, anchor="lm")
    d.ellipse([44, 150, 134, 240], fill=th.GLOW); star4(d, 89, 195, 26, th.ACC)
    bars(d, 152, 168, [170, 120], 18, th.GRID, 34)
    for i in range(3):
        x = 44 + i * 112; d.rounded_rectangle([x, 270, x + 98, 340], 16, fill=th.GLOW); bars(d, x + 16, 288, [60, 40], 12, th.GRID, 24)
    f, ls = fit_or_wrap(d, title, "Bold", 30, 330, 20); text(d, (44, 384), ls[0] if len(ls) == 1 else title[:22], f, th.INK, anchor="lm")
    for r in range(3):
        for c in range(3):
            x = 44 + c * 112; y = 420 + r * 112; shade = th.GLOW if (r + c) % 2 else lerp(th.GLOW, th.ACC, 0.18)
            d.rounded_rectangle([x, y, x + 102, y + 102], 14, fill=shade)
    d.rounded_rectangle([44, 770, w - 44, 820], 25, fill=th.ACC); text(d, (w / 2, 795), "Example", F("Bold", 24), th.ON_ACC)
    return im

def site_img(th, title):
    w, h = 800, 480; im = rrect_img(w, h, 28, th.CARD + (255,)); d = ImageDraw.Draw(im)
    top = rrect_img(w, 250, 28, th.TXT + (255,)); ImageDraw.Draw(top).rectangle([0, 200, w, 250], fill=th.TXT); im.paste(top, (0, 0), top)
    d = ImageDraw.Draw(im)
    for i in range(3): d.ellipse([30 + i * 26, 26, 44 + i * 26, 40], fill=lerp(th.TXT, (255, 255, 255), 0.35))
    f, ls = fit_or_wrap(d, title.upper(), "Black", 104, 700, 40)
    for i, l in enumerate(ls): text(d, (w / 2, 140 + (i - (len(ls) - 1) / 2) * f.size * 1.02), l, f, (255, 255, 255))
    bars(d, 40, 290, [420, 340, 380], 18, th.GRID, 40); d.rounded_rectangle([560, 300, 760, 360], 30, fill=th.ACC)
    text(d, (660, 330), "Start", F("Bold", 28), th.ON_ACC); d.rounded_rectangle([560, 380, 760, 440], 30, fill=th.GLOW)
    return im

def book_img(th, title, sub, brand):
    bw, bh = 440, 590; im = Image.new("RGBA", (bw + 22, bh + 16), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([14, 10, bw + 20, bh + 14], 10, fill=(240, 236, 228, 255))
    for i in range(6): d.line([(bw + 4 + i * 2.6, 16), (bw + 4 + i * 2.6, bh + 8)], fill=(214, 208, 196, 255), width=1)
    d.rounded_rectangle([0, 0, bw, bh], 10, fill=th.ACC + (255,)); d.rectangle([0, 0, 28, bh], fill=tuple(max(0, c - 34) for c in th.ACC) + (255,))
    star4(d, bw - 70, 80, 30, th.ON_ACC); text(d, (54, 64), brand.upper(), F("Bold", 24), th.ON_ACC, anchor="lm")
    f, ls = fit_or_wrap(d, title, "Black", 56, bw - 100, 34)
    if len(ls) == 1 and len(title.split()) > 2:
        ws = title.split(); f = F("Black", 50); ls = []; cur = ""
        for w_ in ws:
            if d.textlength((cur + " " + w_).strip(), font=f) > bw - 100: ls.append(cur); cur = w_
            else: cur = (cur + " " + w_).strip()
        ls.append(cur)
    for i, l in enumerate(ls): d.text((54, 190 + i * f.size * 1.1), l, font=f, fill=th.ON_ACC, anchor="lm")
    block(d, bw / 2 + 14, bh - 80, sub, "SemiBold", 26, bw - 90, th.ON_ACC, 20)
    return im

_icons = {}
def icon_img(th, kind, r=36):
    if (kind, r) in _icons: return _icons[(kind, r)]
    s = 4; R = r * s; im = Image.new("RGBA", (2 * R + 4, 2 * R + 4), (0, 0, 0, 0)); d = ImageDraw.Draw(im); c = R + 2; fg = (255, 255, 255)
    d.ellipse([c - R, c - R, c + R, c + R], fill=th.TXT); u = R / 42.0; lw = int(8 * u)
    if kind == "check": d.line([(c - 18 * u, c + 2 * u), (c - 4 * u, c + 16 * u), (c + 20 * u, c - 14 * u)], fill=fg, width=lw, joint="curve")
    elif kind == "clock":
        d.ellipse([c - 22 * u, c - 22 * u, c + 22 * u, c + 22 * u], outline=fg, width=int(6 * u)); d.line([(c, c), (c, c - 14 * u)], fill=fg, width=int(6 * u)); d.line([(c, c), (c + 11 * u, c + 6 * u)], fill=fg, width=int(6 * u))
    elif kind == "alert": d.line([(c, c - 20 * u), (c, c + 6 * u)], fill=fg, width=lw); d.ellipse([c - 5 * u, c + 13 * u, c + 5 * u, c + 23 * u], fill=fg)
    elif kind == "tag":
        d.polygon([(c - 20 * u, c - 20 * u), (c + 4 * u, c - 20 * u), (c + 22 * u, c), (c, c + 22 * u), (c - 20 * u, c + 2 * u)], outline=fg, width=int(6 * u)); d.ellipse([c - 12 * u, c - 12 * u, c - 4 * u, c - 4 * u], fill=fg)
    elif kind == "play": d.polygon([(c - 10 * u, c - 18 * u), (c - 10 * u, c + 18 * u), (c + 18 * u, c)], fill=fg)
    elif kind == "link":
        d.rounded_rectangle([c - 26 * u, c - 10 * u, c + 2 * u, c + 10 * u], int(10 * u), outline=fg, width=int(6 * u)); d.rounded_rectangle([c - 2 * u, c - 10 * u, c + 26 * u, c + 10 * u], int(10 * u), outline=fg, width=int(6 * u))
    elif kind == "coin": text(d, (c, c + 2 * u), "$", F("Black", int(46 * u)), fg)
    elif kind in ("x", "cross"):
        d.line([(c - 15 * u, c - 15 * u), (c + 15 * u, c + 15 * u)], fill=fg, width=lw); d.line([(c - 15 * u, c + 15 * u), (c + 15 * u, c - 15 * u)], fill=fg, width=lw)
    else: star4(d, c, c, 22 * u, fg)
    im = im.resize((im.width // s, im.height // s), Image.LANCZOS); _icons[(kind, r)] = im; return im

# ---------------------------------------------------------------- v3 graphics (from the 15-Short study, see reference/editing-playbook.md)
def round_img(img, r):
    img = img.convert("RGBA"); m = Image.new("L", img.size, 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, img.width - 1, img.height - 1], r, fill=255)
    img.putalpha(m); return img

def cover(img, w, h, ax=0.5, ay=0.0):
    """Crop-to-fill (like CSS object-fit: cover), anchored top by default."""
    s = max(w / img.width, h / img.height); im = img.resize((int(img.width * s + 1), int(img.height * s + 1)), Image.LANCZOS)
    x = int((im.width - w) * ax); y = int((im.height - h) * ay); return im.crop((x, y, x + w, y + h))

def device_img(src, device="card", w=900):
    """Screenshot inside a plain rounded card, a laptop or a phone (RGBA)."""
    src = src.convert("RGB")
    if device == "phone":
        pw, ph = 430, 880; im = rrect_img(pw, ph, 66, (16, 16, 18, 255))
        im.paste(round_img(cover(src, pw - 28, ph - 28, 0.5, 0.0), 54), (14, 14), round_img(cover(src, pw - 28, ph - 28, 0.5, 0.0), 54))
        ImageDraw.Draw(im).rounded_rectangle([pw / 2 - 62, 30, pw / 2 + 62, 62], 16, fill=(16, 16, 18)); return im
    if device == "laptop":
        sw = w; sh = int(sw * 0.62); im = Image.new("RGBA", (sw + 120, sh + 70), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
        d.rounded_rectangle([60, 0, 60 + sw, sh + 20], 26, fill=(28, 28, 32, 255)); scr = round_img(cover(src, sw - 32, sh - 12), 10)
        im.paste(scr, (76, 16), scr)
        d.polygon([(0, sh + 26), (sw + 120, sh + 26), (sw + 90, sh + 62), (30, sh + 62)], fill=(176, 176, 182, 255))
        d.rounded_rectangle([0, sh + 18, sw + 120, sh + 34], 8, fill=(206, 206, 212, 255)); d.rounded_rectangle([sw / 2 - 20, sh + 18, sw / 2 + 140, sh + 28], 5, fill=(170, 170, 176, 255))
        return im
    h = int(w * src.height / src.width); h = min(h, int(w * 0.95))
    return round_img(cover(src, w, h), 28)

def badge_img(th, name, letter=None, icon_path=None):
    """Logo-badge pill: dark square icon + uppercase name (the reference's 'First is [BADGE]')."""
    f = F("ExtraBold", 54); tw = int(ImageDraw.Draw(Image.new("RGB", (4, 4))).textlength(name.upper(), font=f))
    w, h = tw + 190, 132; im = rrect_img(w, h, 30, th.CARD + (255,)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([18, 18, 114, 114], 22, fill=th.TXT)
    if icon_path and os.path.exists(icon_path):
        ic = round_img(cover(Image.open(icon_path), 96, 96, 0.5, 0.5), 22); im.paste(ic, (18, 18), ic)
    else: text(d, (66, 68), (letter or name[:1]).upper(), F("Black", 58), (255, 255, 255))
    d.text((140, h / 2), name.upper(), font=f, fill=th.INK, anchor="lm"); return im

def button3d(d, th, cx, cy, r, rot, k=1.0):
    """White 3D button with a green sunburst (floating hook decor)."""
    if k <= 0: return
    r *= k; d.ellipse([cx - r + r * 0.12, cy - r + r * 0.22, cx + r + r * 0.12, cy + r + r * 0.22], fill=lerp(th.BG, (0, 0, 0), 0.10))
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 255, 255)); d.ellipse([cx - r * 0.86, cy - r * 0.86, cx + r * 0.86, cy + r * 0.86], fill=lerp((255, 255, 255), th.BG, 0.6))
    sunburst(d, cx, cy, r * 0.62, rot, th.ACC)

def bookmark(d, th, cx, cy, s, filled):
    pts = [(cx - s * 0.5, cy - s * 0.7), (cx + s * 0.5, cy - s * 0.7), (cx + s * 0.5, cy + s * 0.7), (cx, cy + s * 0.3), (cx - s * 0.5, cy + s * 0.7)]
    if filled: d.polygon(pts, fill=th.TXT)
    else: d.line(pts + [pts[0]], fill=th.TXT, width=max(3, int(s * 0.1)), joint="curve")

def cursor(d, x, y, s, col=(16, 16, 18)):
    pts = [(x, y), (x, y + s), (x + s * 0.28, y + s * 0.74), (x + s * 0.5, y + s * 1.12), (x + s * 0.64, y + s * 1.05), (x + s * 0.44, y + s * 0.68), (x + s * 0.8, y + s * 0.68)]
    d.polygon(pts, fill=col, outline=(255, 255, 255))

def dotted(d, pts, col, k, gap=18, r=4):
    """Draw a dotted polyline, revealed up to fraction k of its length."""
    L = [0.0]
    for a, b in zip(pts, pts[1:]): L.append(L[-1] + math.dist(a, b))
    tot = L[-1] * max(0.0, min(1.0, k)); s = 0.0
    while s <= tot:
        for i in range(len(pts) - 1):
            if L[i] <= s <= L[i + 1]:
                u = (s - L[i]) / max(1e-6, L[i + 1] - L[i]); x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u; y = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u
                d.ellipse([x - r, y - r, x + r, y + r], fill=col); break
        s += gap

def bezier(p0, p1, p2, p3, n=40):
    return [((1 - t) ** 3 * p0[0] + 3 * (1 - t) ** 2 * t * p1[0] + 3 * (1 - t) * t * t * p2[0] + t ** 3 * p3[0],
             (1 - t) ** 3 * p0[1] + 3 * (1 - t) ** 2 * t * p1[1] + 3 * (1 - t) * t * t * p2[1] + t ** 3 * p3[1]) for t in [i / n for i in range(n + 1)]]

def pill(d, th, cx, cy, label, k=1.0, dark=False, size=40):
    if k <= 0: return
    f = F("Bold", int(size * min(1.1, k))); tw = d.textlength(label, font=f); w = tw / 2 + size * 0.9; h = size * 0.95
    d.rounded_rectangle([cx - w + 6, cy - h + 12, cx + w + 6, cy + h + 12], h, fill=lerp(th.BG, (0, 0, 0), 0.09))
    d.rounded_rectangle([cx - w, cy - h, cx + w, cy + h], h, fill=th.TXT if dark else th.CARD)
    d.text((cx, cy), label, font=f, fill=(255, 255, 255) if dark else th.INK, anchor="mm")

def price_card_img(th, title, big, sub, idx):
    w, h = 700, 430; im = rrect_img(w, h, 34, th.CARD + (255,)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([36, 36, 110, 110], 18, fill=th.ACC if idx == 0 else th.TXT); text(d, (73, 75), str(idx + 1), F("Black", 40), (255, 255, 255))
    d.text((134, 73), title, font=F("Bold", 38), fill=th.INK, anchor="lm")
    f = F("Black", 92)
    while d.textlength(big, font=f) > w - 80 and f.size > 40: f = F("Black", f.size - 4)
    d.text((40, 200), big, font=f, fill=th.INK, anchor="lm")
    block(d, 40, h - 110, sub, "Medium", 32, w - 80, th.MUTED_C, 24, anchor="lm")
    bars(d, 40, h - 56, [260, 180], 14, th.GLOW, 26); return im

def make_shards(seed=7, nx=6, ny=10):
    rng = np.random.default_rng(seed); pts = {}
    for j in range(ny + 1):
        for i in range(nx + 1):
            x = i * W / nx; y = j * H / ny
            if 0 < i < nx: x += rng.uniform(-0.35, 0.35) * W / nx
            if 0 < j < ny: y += rng.uniform(-0.35, 0.35) * H / ny
            pts[(i, j)] = (x, y)
    tris = []
    for j in range(ny):
        for i in range(nx):
            a, b, c, d_ = pts[(i, j)], pts[(i + 1, j)], pts[(i + 1, j + 1)], pts[(i, j + 1)]
            tris += [[a, b, c], [a, c, d_]] if rng.random() < 0.5 else [[a, b, d_], [b, c, d_]]
    out = []
    for tri in tris:
        cx = sum(p[0] for p in tri) / 3; cy = sum(p[1] for p in tri) / 3
        out.append((tri, (cx - W / 2) * rng.uniform(1.2, 2.6) + rng.uniform(-200, 200), -rng.uniform(300, 900), rng.uniform(0, 0.25)))
    return out

def soft_decor(th):
    lay = Image.new("RGBA", (W // 4, H // 4), (0, 0, 0, 0)); d = ImageDraw.Draw(lay); g = lerp(th.BG, (0, 0, 0), 0.16) + (255,)
    sunburst(d, 20, 60, 95, 0.3, g); sunburst(d, W // 4 - 10, H // 4 - 70, 110, 0.1, g)
    return lay.filter(ImageFilter.GaussianBlur(5)).resize((W, H), Image.BILINEAR)

def count_up(s, p):
    import re
    def rep(m):
        v = float(m.group(0).replace(",", "")); dec = len(m.group(0).split(".")[1]) if "." in m.group(0) else 0
        out = f"{v * p:,.{dec}f}" if "," in m.group(0) else f"{v * p:.{dec}f}"; return out
    return re.sub(r"\d[\d,]*(?:\.\d+)?", rep, s) if p < 1 else s

def spread_img(th, title, brand):
    w, h = 1000, 660; im = Image.new("RGBA", (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for x0 in (0, w // 2):
        d.rectangle([x0, 0, x0 + w // 2 - 1, h], fill=(253, 251, 247, 255))
    for i in range(30): d.line([(w // 2 - 30 + i, 0), (w // 2 - 30 + i, h)], fill=(int(253 - i * 1.2),) * 3 + (255,))
    d.text((60, 70), "CHAPTER 1", font=F("Black", 30), fill=th.ACC); f, ls = fit_or_wrap(d, title, "Black", 44, 380, 28)
    for i, l in enumerate(ls): d.text((60, 130 + i * f.size * 1.15), l, font=f, fill=th.INK)
    for i in range(9): d.rounded_rectangle([60, 270 + i * 36, 60 + [380, 340, 400, 300, 390, 360, 280, 400, 320][i], 282 + i * 36], 6, fill=(220, 216, 208))
    star4(d, w // 2 + 250, 170, 70, th.ACC); text(d, (w // 2 + 250, 290), brand.title(), F("Bold", 30), th.INK)
    for i in range(7): d.rounded_rectangle([w // 2 + 60, 360 + i * 36, w // 2 + 60 + [380, 320, 400, 360, 300, 390, 260][i], 372 + i * 36], 6, fill=(220, 216, 208))
    return im

# ---------------------------------------------------------------- background
def list_background(th):
    """Plain brand background with a dashed grid + intersection dots that fades out towards the edges."""
    im = Image.new("RGB", (W, H), th.BG); g = Image.new("L", (W, H), 0); d = ImageDraw.Draw(g); gs = 120
    xs = range(W // 2 % gs, W, gs); ys = range(CAM_Y % gs, H, gs)
    for x in xs:
        for y in range(0, H, 22): d.line([(x, y), (x, y + 10)], fill=255, width=3)
    for y in ys:
        for x in range(0, W, 22): d.line([(x, y), (x + 10, y)], fill=255, width=3)
    for x in xs:
        for y in ys: d.ellipse([x - 8, y - 8, x + 8, y + 8], fill=255)
    m = Image.new("L", (W // 8, H // 8), 0); ImageDraw.Draw(m).ellipse([W // 8 * 0.06, H // 8 * 0.2, W // 8 * 0.94, H // 8 * 0.74], fill=255)
    m = m.filter(ImageFilter.GaussianBlur(14)).resize((W, H), Image.BILINEAR)
    g = Image.fromarray((np.asarray(g, np.float32) * np.asarray(m, np.float32) / 255).astype(np.uint8))
    im.paste(lerp(th.BG, th.GRID, 1.0) if False else tuple(max(0, c - 12) for c in th.GRID), (0, 0), g)
    return im

# ---------------------------------------------------------------- the reel
class ListReel:
    def __init__(self, spec, bounds, segs):
        self.spec = spec; self.th = Theme(spec.get("palette")); self.B = bounds; self.S = segs; self.total = bounds[-1]
        self.beats = spec["beats"]; self.bg = list_background(self.th); self.brand = spec.get("brand", "SUB-CREATOR PAID")
        self.dir = spec.get("_dir", ".")
        for i, b in enumerate(self.beats): b["show"]["type"] = pick_type(b["show"], self.beats[i - 1]["show"].get("type") if i else None)
        self.trans = [b["show"].get("transition", DEFAULT_TRANS.get(b["show"]["type"], "cut")) for b in self.beats]
        self.section = []; cur = ""
        for b in self.beats:
            if b["show"]["type"] == "title_card": cur = b["show"].get("title") or b["show"].get("badge", "")
            self.section.append(cur)
        self.cache = {}; self.d0 = ImageDraw.Draw(Image.new("RGB", (8, 8))); self.shards = make_shards()

    def img(self, path):
        p = path if os.path.isabs(path) else os.path.join(self.dir, path)
        return self.asset(("img", p), lambda: Image.open(p).convert("RGB")) if os.path.exists(p) else None

    def end_frame(self, bi):
        """Last frame of beat bi (camera applied) for shatter / whip transitions."""
        def mk():
            t = self.B[bi + 1] - 0.02; lt = t - self.B[bi]; im = self.scene(bi, lt, t); s = self.camera(bi, lt)
            if s > 1.001:
                l = W / 2 - (W / 2) / s; tp = CAM_Y - CAM_Y / s; im = im.resize((W, H), Image.BILINEAR, box=(l, tp, l + W / s, tp + H / s))
            return im
        return self.asset(("end", bi), mk)

    def beat(self, t):
        for i in range(len(self.beats)):
            if t < self.B[i + 1]: return i
        return len(self.beats) - 1

    def asset(self, key, fn):
        if key not in self.cache: self.cache[key] = fn()
        return self.cache[key]

    def rows(self, key, fn):
        return self.asset(("rows",) + key, fn)

    # camera: punch-zoom in on each new beat, slow push while it plays, grid close-up pull-back at the open
    def camera(self, bi, lt):
        dur = self.B[bi + 1] - self.B[bi]; s = 1.0 + 0.035 * min(1.0, lt / max(dur, 0.1))
        tr = self.trans[bi]
        if bi == 0: s += 1.5 * (1 - ease(lt / 0.75))
        elif tr == "zoom": s += 0.13 * (1 - ease(lt / 0.5))
        elif tr == "blur": s += 0.07 * (1 - ease(lt / 0.45))
        else: s += 0.045 * (1 - ease(lt / 0.35))
        return s

    def frame(self, t):
        global CUR_T
        CUR_T = t; bi = self.beat(t); lt = t - self.B[bi]
        if bi > 0: fire_at(lt, {"shatter": "glass", "whip": "whip", "zoom": "whoosh", "blur": "swoosh"}.get(self.trans[bi], "swoosh"))
        im = self.scene(bi, lt, t)
        s = self.camera(bi, lt)
        if s > 1.001:
            l = W / 2 - (W / 2) / s; tp = CAM_Y - CAM_Y / s
            im = im.resize((W, H), Image.BILINEAR, box=(l, tp, l + W / s, tp + H / s))
        blur = 0.0
        if self.trans[bi] == "blur" and bi > 0 and lt < 0.26: blur = 1 - ease(lt / 0.26)
        if bi + 1 < len(self.beats) and self.trans[bi + 1] == "blur":
            left = self.B[bi + 1] - t
            if left < 0.2: blur = max(blur, 1 - left / 0.2)
        if blur > 0.02:
            sm = im.resize((W // 4, H // 4), Image.BILINEAR).filter(ImageFilter.GaussianBlur(9 * blur)).resize((W, H), Image.BILINEAR)
            im = Image.blend(sm, Image.new("RGB", (W, H), (255, 255, 255)), 0.35 * blur)
        tr = self.trans[bi]
        if bi > 0 and tr == "shatter" and lt < 0.75:  # previous frame cracks into glass shards that fall away
            prev = self.end_frame(bi - 1); u = lt / 0.75
            for tri, vx, vy, delay in self.shards:
                k = max(0.0, (u - delay) / (1 - delay))
                if k >= 1: continue
                dx = vx * k * 0.6; dy = vy * k * 0.6 + 2600 * k * k
                xs = [p[0] for p in tri]; ys = [p[1] for p in tri]; x0, y0, x1, y1 = int(min(xs)), int(min(ys)), int(max(xs)) + 1, int(max(ys)) + 1
                m = Image.new("L", (x1 - x0, y1 - y0), 0); ImageDraw.Draw(m).polygon([(p[0] - x0, p[1] - y0) for p in tri], fill=255)
                if k > 0.6: m = m.point(lambda v, a=(1 - k) / 0.4: int(v * a))
                im.paste(prev.crop((x0, y0, x1, y1)), (int(x0 + dx), int(y0 + dy)), m)
                if k < 0.05: ImageDraw.Draw(im).polygon([(p[0], p[1]) for p in tri], outline=(255, 255, 255))
        if bi > 0 and tr == "whip" and lt < 0.32:  # previous scene whips off left, new one in from the right, motion-blurred
            k = ease(lt / 0.32); prev = self.end_frame(bi - 1); off = int(W * k)
            comp = Image.new("RGB", (W, H), self.th.BG); comp.paste(prev, (-off, 0)); comp.paste(im, (W - off, 0))
            amt = 1 - abs(2 * k - 1)
            if amt > 0.05:
                sm = comp.resize((max(8, int(W / (1 + 30 * amt))), H // 2), Image.BILINEAR).resize((W, H), Image.BILINEAR)
                comp = Image.blend(comp, sm, min(1.0, amt * 1.4))
            im = comp
        return im

    def highlight(self, im, txt, f, by, k, cx=W / 2):
        """Black box that wipes open left-to-right with white text (the reference's payoff box)."""
        fire_at(k * 0.4, "swipe"); k = ease(k)
        if k <= 0: return
        th = self.th
        while self.d0.textlength(txt, font=f) + 64 > 960 and f.size > 36: f = F("Bold", f.size - 4)
        hw = self.d0.textlength(txt, font=f); boxh = f.size * 1.55; bw_ = hw + 64; bx = cx - bw_ / 2
        box = Image.new("RGBA", (int(bw_), int(boxh)), th.TXT + (255,)); ImageDraw.Draw(box).text((32, boxh / 2), txt, font=f, fill=(255, 255, 255), anchor="lm")
        cw = max(1, int(bw_ * k)); sh = Image.new("L", (cw + 40, int(boxh) + 40), 0)
        ImageDraw.Draw(sh).rectangle([20, 20, cw + 20, boxh + 20], fill=70)
        im.paste((0, 0, 0), (int(bx) - 8, int(by) + 4), sh.filter(ImageFilter.GaussianBlur(12)))
        im.paste(box.crop((0, 0, cw, int(boxh))), (int(bx), int(by)))

    def top_text(self, d, key, txt, t, t0, per=0.07, top=250, size=60):
        """Small line + bold key phrase above the visual (the reference's body template)."""
        rows = self.rows(key, lambda: build_rows(self.d0, txt, 940, "Medium", size, "ExtraBold", int(size * 1.4), upper=False, min_a=int(size * 0.9)))
        draw_rows(self.d0 if d is None else d, self.th, rows, 0, t, t0, per, lh=1.12, top=top)
        return top + rows_height(rows, 1.12)

    def scene(self, bi, lt, t):
        th = self.th; im = self.bg.copy(); d = ImageDraw.Draw(im); s = self.beats[bi]["show"]; ty = s["type"]
        sa, sb = self.S[bi]; ws = sa; speak = max(0.6, sb - sa); dur = self.B[bi + 1] - self.B[bi]
        if ty == "hook":
            style = s.get("style", "stack")
            if style == "sandwich" and s.get("images"):  # tilted screenshots above and below the hook text
                ims_ = [x for x in (self.img(p) for p in s["images"]) if x is not None]
                topi, boti = ims_[:2], ims_[2:4] or ims_[:1]
                for j, src in enumerate(topi):
                    k = back((lt - 0.1 - 0.12 * j) / 0.6); fire_at(lt - 0.1 - 0.12 * j, "whip")
                    if k > 0:
                        di = self.asset(("sw", bi, "t", j), lambda src=src: device_img(src, "card", 600))
                        cx = W / 2 + (j - (len(topi) - 1) / 2) * 500; place(im, di, cx, 350 - 700 * (1 - min(1, k)) + 10 * math.sin(t * 1.3 + j), ry=0.35 - 0.7 * j, rx=0.25, rot=-6 + 12 * j, scale=0.86)
                for j, src in enumerate(boti):
                    k = back((lt - 0.3 - 0.12 * j) / 0.6); fire_at(lt - 0.3 - 0.12 * j, "whip")
                    if k > 0:
                        di = self.asset(("sw", bi, "b", j), lambda src=src: device_img(src, "card", 600))
                        cx = W / 2 + (j - (len(boti) - 1) / 2) * 500; place(im, di, cx, 1380 + 700 * (1 - min(1, k)) + 10 * math.cos(t * 1.2 + j), ry=-0.3 + 0.6 * j, rx=-0.2, rot=5 - 10 * j, scale=1.0)
            elif style == "scatter":  # floating white 3D buttons with sunbursts
                for j, (bx, by, br) in enumerate([(170, 260, 95), (W - 200, 420, 120), (W - 130, 1180, 70), (160, 1300, 115), (560, 1560, 80), (W - 260, 1600, 100), (420, 180, 55)]):
                    fire_at(t - 0.1 - 0.07 * j, "pop"); button3d(d, th, bx, by + 14 * math.sin(t * 1.1 + j), br, t * 0.3 + j, pop(t, 0.1 + 0.07 * j, 0.5))
            if style == "stack":
                ka = pop(t, 0.15, 0.6); acc = th.ACC; fire_at(t - 0.15, "pop"); fire_at(t - 0.3, "pop")
                sunburst(d, 150, 300, 190, t * 0.35, acc, ka); sunburst(d, W - 170, H - 470, 200, -t * 0.3 + 0.4, acc, pop(t, 0.3, 0.6))
            kc = pop(t, 0.45, 0.5) if style == "stack" else 0
            if kc > 0:  # coin top-right, sparkle bottom-left (the reference's floating 3D objects)
                cx, cy, r = W - 190, 330 + 10 * math.sin(t * 1.4), 78 * kc
                d.ellipse([cx - r + 10, cy - r + 16, cx + r + 10, cy + r + 16], fill=lerp(th.BG, (0, 0, 0), 0.12))
                d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(214, 180, 108)); d.ellipse([cx - r * 0.78, cy - r * 0.78, cx + r * 0.78, cy + r * 0.78], fill=(232, 202, 136))
                text(d, (cx, cy + 3), "$", F("Black", max(8, int(r * 1.1))), (150, 112, 46))
            ks = pop(t, 0.6, 0.5) if style == "stack" else 0
            if ks > 0: star4(d, 190, H - 520 + 12 * math.cos(t * 1.2), 70 * ks, th.TXT)
            lines = s["lines"]; head = lines[:-1] if len(lines) > 1 else lines; hl = lines[-1] if len(lines) > 1 else None
            rows = self.rows(("hook", bi), lambda: build_rows(self.d0, " ".join(head), 940, "Bold", 118, "Black", 220, min_a=120))
            fh = F("Bold", 70); hw = self.d0.textlength(hl, font=fh) if hl else 0
            if hl and hw > 900: fh = F("Bold", int(70 * 900 / hw)); hw = self.d0.textlength(hl, font=fh)
            nw = sum(len(r) for r in rows) + (1 if hl else 0); per = speak * 0.75 / max(1, nw)
            rh = rows_height(rows, 1.04); boxh = fh.size * 1.55 if hl else 0; total = rh + (40 + boxh if hl else 0)
            top = CAM_Y - 40 - total / 2
            n = draw_rows(d, th, rows, 0, t, ws, per, lh=1.04, top=top)
            if hl: self.highlight(im, hl, fh, top + rh + 40, (t - ws - n * per) / 0.4)
        elif ty == "title_card" and (s.get("style") == "badge" or s.get("badge")):
            name = s.get("badge") or s.get("title")
            rows = self.rows(("tcb", bi), lambda: build_rows(self.d0, s.get("intro") or f"{s['label']} is", 940, "Bold", 110, "Black", 120))
            draw_rows(d, th, rows, 0, t, self.B[bi] + 0.05, 0.15, lh=1.05, top=430)
            k = back((lt - 0.3) / 0.55); fire_at(lt - 0.3, "whip"); fire_at(lt - 0.55, "pop")
            if k > 0:
                bimg = self.asset(("badge", bi), lambda: badge_img(th, name, s.get("letter"), s.get("icon") and os.path.join(self.dir, s["icon"])))
                sc = min(1.45, 960 / bimg.width); place(im, bimg, W / 2 + (W) * (1 - min(1, k)), 680, scale=sc, shadow=0.28, sh_off=(14, 26))
            src = self.img(s["image"]) if s.get("image") else None
            k2 = ease((lt - 0.55) / 0.6)
            if src is not None: fire_at(lt - 0.6, "card")
            if k2 > 0:
                if src is not None:
                    di = self.asset(("tcshot", bi), lambda: device_img(src, s.get("device", "card"), 880))
                    place(im, di, W / 2, 1170 + 900 * (1 - k2) - 8 * math.sin(t * 1.2), ry=-0.16, rx=0.10, rot=1.5, scale=0.95)
                elif s.get("sub"):
                    srows = self.rows(("tcs", bi), lambda: build_rows(self.d0, s["sub"], 900, "Medium", 60, "ExtraBold", 70, upper=False))
                    draw_rows(d, th, srows, 0, t, self.B[bi] + 0.6, 0.08, lh=1.1, top=830)
        elif ty == "title_card":
            rows = self.rows(("tc", bi), lambda: build_rows(self.d0, f"{s['label']} *{s['title']}*", 940, "Medium", 100, "ExtraBold", 132, min_a=72))
            per = max(0.12, speak * 0.6 / max(1, sum(len(r) for r in rows)))
            draw_rows(d, th, rows, 560, t, self.B[bi] + 0.05, per, lh=1.05)
            k = ease((lt - 0.1) / 0.55)
            if k > 0:
                img = self.asset(("tcimg", bi), lambda: title_card_img(th, self.brand, s["title"], s.get("sub", "")))
                place(im, img, W / 2, 1080 + 900 * (1 - k) - 12 * math.sin(t * 1.3), ry=-0.30 + 0.05 * math.sin(t * 0.9), rx=0.16, rot=2.0)
        elif ty == "bullets":
            k = back((lt - 0.0) / 0.55)
            if k > 0:
                img = self.asset(("phone", bi), lambda: phone_img(th, self.section[bi] or self.brand.title()))
                place(im, img, 820, 900 - 1100 * (1 - min(1, k)) + 10 * math.sin(t * 1.1), ry=-0.22, rx=0.06, scale=0.88)
            hrows = self.rows(("bh", bi), lambda: build_rows(self.d0, s["heading"], 560, "Bold", 64, "Black", 76))
            draw_rows(d, th, hrows, 0, t, ws, 0.07, align="left", x0=70, lh=1.1, top=470)
            items = s["items"]; gap = speak * 0.75 / max(1, len(items)); y = 470 + rows_height(hrows, 1.1) + 50
            for i, it in enumerate(items):
                irows = self.rows(("bi", bi, i), lambda: build_rows(self.d0, it, 470, "Medium", 60, "Black", 64))
                st = ws + 0.35 + i * gap; kk = ease((t - st) / 0.3)
                if kk > 0: star4(d, 100 - 30 * (1 - kk), y + 36, 22, lerp(th.BG, th.TXT, kk))
                draw_rows(d, th, irows, 0, t, st, 0.06, align="left", x0=146, lh=1.15, top=y)
                y += rows_height(irows, 1.15) + 26
        elif ty == "statement":
            if s.get("decor") == "soft":  # out-of-focus grey sunbursts (depth of field)
                lay = self.asset(("soft",), lambda: soft_decor(th)); im.paste(lay, (0, 0), lay); d = ImageDraw.Draw(im)
            rows = self.rows(("st", bi), lambda: build_rows(self.d0, s["text"], 940, "Medium", 66, "Black", 128, min_a=70))
            nw = sum(len(r) for r in rows); per = speak * 0.7 / max(1, nw + (2 if s.get("highlight") else 0))
            hf = F("Bold", 68); hh = hf.size * 1.55 + 40 if s.get("highlight") else 0
            top = CAM_Y - 60 - (rows_height(rows, 1.08) + hh) / 2
            n = draw_rows(d, th, rows, 0, t, ws, per, lh=1.08, top=top)
            if s.get("highlight"):
                self.highlight(im, s["highlight"], hf, top + rows_height(rows, 1.08) + 40, (t - ws - n * per) / 0.4); d = ImageDraw.Draw(im)
            k = pop(t, ws, 0.6)
            if k > 0 and s.get("decor") != "soft": sunburst(d, W - 150, 1430, 110, t * 0.4, th.ACC, k); star4(d, 170, 470, 40 * k, th.TXT)
        elif ty == "shot":
            y = self.top_text(d, ("shtop", bi), s["top"], t, ws, 0.07, top=250) + 30 if s.get("top") else 300
            src = self.img(s["image"]); dev = s.get("device") or ("phone" if src is not None and src.height > src.width * 1.2 else "card")
            if src is not None:
                di = self.asset(("shot", bi), lambda: device_img(src, dev, 860 if dev == "laptop" else 900))
                sc = min(1.0, 980 / di.width, 640 / di.height); k = ease((lt - 0.05) / 0.5); fire_at(lt - 0.05, "whip"); fire_at(lt - 0.5, "card")
                cy = y + di.height * sc / 2 + 10
                place(im, di, W / 2 + 1000 * (1 - k), cy + 8 * math.sin(t * 1.1), ry=-0.10 * (1 - k) - 0.04, rx=0.04, scale=sc, shadow=0.30)
                y = cy + di.height * sc / 2 + 50
            if s.get("caption"):
                y = self.top_text(d, ("shcap", bi), s["caption"], t, ws + speak * 0.25, 0.07, top=y, size=58) + 30
            items = s.get("bullets") or []; gap = speak * 0.55 / max(1, len(items))
            for i, it in enumerate(items):
                irows = self.rows(("shb", bi, i), lambda it=it: build_rows(self.d0, it, 760, "Medium", 54, "Black", 58))
                st = ws + speak * 0.4 + i * gap; kk = ease((t - st) / 0.3); fire_at(t - st, "pop")
                tw = sum(x[3] for x in irows[0]) + 60; x0 = W / 2 - tw / 2 + 60
                if kk > 0: star4(d, x0 - 46, y + 32, 20, lerp(th.BG, th.TXT, kk))
                draw_rows(d, th, irows, 0, t, st, 0.05, align="left", x0=x0, lh=1.15, top=y); y += rows_height(irows, 1.15) + 18
        elif ty == "stack":
            cards = s["cards"]; n_ = len(cards); gap = speak * 0.8 / max(1, n_)
            if s.get("nodes", True):  # node timeline at the top: circle - line - circle, one per card
                xs = [W / 2 + (i - (n_ - 1) / 2) * 290 for i in range(n_)]
                for i in range(n_):
                    k = back((t - ws - i * gap) / 0.4); fire_at(t - ws - i * gap, "pop")
                    if i: fire_at(t - ws - i * gap, "zip")
                    if i and k > 0: d.line([(xs[i - 1] + 52, 300), (xs[i - 1] + 52 + (xs[i] - xs[i - 1] - 104) * min(1, k), 300)], fill=th.TXT, width=4)
                    if k > 0:
                        r = 50 * min(1.1, k); d.ellipse([xs[i] - r + 5, 300 - r + 9, xs[i] + r + 5, 300 + r + 9], fill=lerp(th.BG, (0, 0, 0), 0.1))
                        d.ellipse([xs[i] - r, 300 - r, xs[i] + r, 300 + r], fill=th.TXT if i < n_ - 1 else th.ACC)
                        text(d, (xs[i], 302), str(i + 1), F("Black", int(44 * min(1.1, k))), (255, 255, 255))
                        lbl = cards[i].get("node", cards[i]["title"])
                        text(d, (xs[i], 392), lbl, fit_or_wrap(d, lbl, "Bold", 36, 260, 24)[0], lerp(th.BG, th.TXT, min(1, k)))
            elif s.get("top"): self.top_text(d, ("sttop", bi), s["top"], t, ws, 0.07, top=260)
            for i, c in enumerate(cards):
                k = back((t - ws - i * gap - 0.1) / 0.45); fire_at(t - ws - i * gap - 0.4, "card")
                if k <= 0: continue
                ci = self.asset(("pc", bi, i), lambda c=c, i=i: price_card_img(th, c["title"], c["big"], c.get("sub", ""), i))
                cx = W / 2 - (n_ - 1) * 22 + i * 44; cy = 860 + i * 80 + 900 * (1 - min(1, k))
                place(im, ci, cx, cy, ry=-0.08, rx=0.06, rot=-2 + 2 * i, scale=1.12, shadow=0.26, sh_off=(18, 36))
            d = ImageDraw.Draw(im)
            if s.get("text"): self.top_text(d, ("stcap", bi), s["text"], t, ws + speak * 0.6, 0.06, top=1440, size=58)
        elif ty == "stat":
            y = self.top_text(d, ("sttop", bi), s["top"], t, ws, 0.07, top=470, size=64) if s.get("top") else 520
            big = s["big"]; p = ease((t - ws - 0.15) / 0.9); fire_at(t - ws - 0.15, "count"); fire_at(t - ws - 1.05, "ding")
            f = F("Black", 230)
            while self.d0.textlength(big, font=f) > 960 and f.size > 90: f = F("Black", f.size - 8)
            if p > 0:
                col = lerp(lerp(th.BG, th.TXT, 0.3), th.TXT, p)
                d.text((W / 2, y + 60 + f.size * 0.55 + 40 * (1 - p)), count_up(big, p), font=f, fill=col, anchor="mm")
            y += 60 + f.size * 1.15
            if s.get("caption"): y = self.top_text(d, ("stcap", bi), s["caption"], t, ws + 0.5, 0.07, top=y, size=62) + 50
            rows_ = s.get("rows") or []; gap = speak * 0.4 / max(1, len(rows_))
            for i, (ic, label) in enumerate(rows_):
                st = ws + speak * 0.45 + i * gap; kk = back((t - st) / 0.35); fire_at(t - st, "pop")
                irows = self.rows(("str", bi, i), lambda label=label: build_rows(self.d0, label, 760, "Medium", 58, "ExtraBold", 58, upper=False, inline=True))
                if kk > 0:
                    ico = icon_img(th, ic, 32); s_ = max(0.05, kk); ii = ico.resize((max(1, int(ico.width * s_)), max(1, int(ico.height * s_))))
                    im.paste(ii, (int(130 - ii.width / 2), int(y + 36 - ii.height / 2)), ii); d = ImageDraw.Draw(im)
                draw_rows(d, th, irows, 0, t, st, 0.05, align="left", x0=192, lh=1.15, top=y); y += max(96, rows_height(irows, 1.15) + 30)
        elif ty == "orbit":
            cx, cy = W / 2, 780; k0 = back((lt - 0.05) / 0.5); fire_at(lt - 0.05, "drop")
            if k0 > 0:
                for rr in (300, 430): d.ellipse([cx - rr * k0, cy - rr * k0, cx + rr * k0, cy + rr * k0], outline=th.GRID, width=4)
                d.ellipse([cx - 150 * k0, cy - 150 * k0, cx + 150 * k0, cy + 150 * k0], fill=th.GLOW)
                logo(d, th, cx, cy, max(2, 100 * min(1.1, k0)))
            items = s["items"]; n_ = len(items); gap = speak * 0.6 / max(1, n_)
            for i, it in enumerate(items):
                k = back((t - ws - i * gap) / 0.4); rr = 300 if i % 2 == 0 else 430; fire_at(t - ws - i * gap, "pop")
                a = 2 * math.pi * i / n_ + t * 0.32 * (1 if i % 2 == 0 else -0.8) - math.pi / 2
                pill(d, th, cx + rr * math.cos(a), cy + rr * math.sin(a), it, k, dark=(i % 3 == 0), size=38)
            if s.get("center") and k0 > 0: text(d, (cx, cy + 190), s["center"], F("Bold", 40), lerp(th.BG, th.TXT, min(1, k0)))
            if s.get("text"):
                rows = self.rows(("ort", bi), lambda: build_rows(self.d0, s["text"], 940, "Medium", 62, "Black", 104, min_a=64))
                draw_rows(d, th, rows, 0, t, ws + speak * 0.2, speak * 0.6 / max(1, sum(len(r) for r in rows)), lh=1.08, top=1260)
        elif ty == "fanout":
            if s.get("top"): self.top_text(d, ("fot", bi), s["top"], t, ws, 0.07, top=260)
            fx, fy = 230, 860; k0 = back((lt - 0.05) / 0.45); fire_at(lt - 0.05, "pop")
            if k0 > 0:
                r = 120 * min(1.1, k0); d.ellipse([fx - r + 8, fy - r + 14, fx + r + 8, fy + r + 14], fill=lerp(th.BG, (0, 0, 0), 0.1))
                d.ellipse([fx - r, fy - r, fx + r, fy + r], fill=th.ACC); pr = r * 0.42
                d.polygon([(fx - pr * 0.6, fy - pr), (fx - pr * 0.6, fy + pr), (fx + pr, fy)], fill=(255, 255, 255))
                text(d, (fx, fy + r + 46), s.get("from", ""), F("Bold", 40), th.TXT)
            to = s["to"]; n_ = len(to); gap = speak * 0.6 / max(1, n_)
            for i, it in enumerate(to):
                ty_ = fy + (i - (n_ - 1) / 2) * 230; tx = 790; k = (t - ws - 0.2 - i * gap) / 0.5
                fire_at(t - ws - 0.2 - i * gap, "zip"); fire_at(t - ws - 0.5 - i * gap, "pop")
                dotted(d, bezier((fx + 125, fy), (fx + 330, fy), (tx - 330, ty_), (tx - 175, ty_)), th.TXT, ease(k), gap=20, r=5)
                if k > 0.6: pill(d, th, tx, ty_, it, back((k - 0.6) / 0.5), dark=False, size=42)
            if s.get("text"):
                rows = self.rows(("fox", bi), lambda: build_rows(self.d0, s["text"], 940, "Medium", 62, "Black", 108, min_a=64))
                draw_rows(d, th, rows, 0, t, ws + speak * 0.45, speak * 0.45 / max(1, sum(len(r) for r in rows)), lh=1.08, top=1300)
        elif ty == "flow":
            if s.get("top"): self.top_text(d, ("flt", bi), s["top"], t, ws, 0.07, top=260)
            steps = s["steps"]; n_ = len(steps); gap = speak * 0.8 / max(1, n_)
            pts = [(200 if i % 2 == 0 else W - 200, 560 + i * (780 / max(1, n_ - 1))) for i in range(n_)]
            for i, (px, py) in enumerate(pts):
                st = ws + i * gap; fire_at(t - st, "pop")
                if i:
                    fire_at(t - st + 0.35, "zip"); a = pts[i - 1]
                    dotted(d, bezier(a, (a[0], (a[1] + py) / 2 + 80), (px, (a[1] + py) / 2 - 80), (px, py)), th.TXT, ease((t - st + 0.35) / 0.4), gap=22, r=5)
                k = back((t - st) / 0.35)
                if k > 0:
                    r = 24 * min(1.1, k); d.ellipse([px - r, py - r, px + r, py + r], fill=th.TXT); d.ellipse([px - r * 0.45, py - r * 0.45, px + r * 0.45, py + r * 0.45], fill=th.ACC)
                srows = self.rows(("fls", bi, i), lambda i=i: build_rows(self.d0, steps[i], 600, "Bold", 54, "Black", 64, upper=False))
                tw = max(sum(x[3] for x in r_) + sum(x[1].size * 0.27 for x in r_[1:]) for r_ in srows)
                x0 = px + 50 if i % 2 == 0 else px - 50 - tw
                draw_rows(d, th, srows, 0, t, st + 0.05, 0.06, align="left", x0=max(40, x0), lh=1.12, top=py - rows_height(srows, 1.12) / 2)
            if s.get("text"): self.top_text(d, ("flx", bi), s["text"], t, ws + speak * 0.7, 0.06, top=1480, size=58)
        elif ty == "save":
            cx, cy = W / 2, 720; u = lt; click = 0.95; fire_at(u - click, "click"); fire_at(u, "pop"); fire_at(u - click - 0.05, "ding")
            pk = 1 + 0.18 * math.sin(min(1, max(0, (u - click) / 0.25)) * math.pi)
            bookmark(d, th, cx, cy, 210 * pk * min(1.0, back(u / 0.4)), u > click)
            if u < click + 0.4:
                m = ease((u - 0.25) / (click - 0.25)); cursor(d, cx + 330 * (1 - m) + 40, cy + 420 * (1 - m) + 40, 90)
            self.top_text(d, ("sv", bi), s["text"], t, ws, speak * 0.6 / max(1, len(s["text"].split())), top=1010, size=64)
        elif ty == "features":
            if s.get("heading"):  # icon list under a heading (no card): "Most creators think brands want" + x rows
                y = self.top_text(d, ("fh", bi), s["heading"], t, ws, 0.07, top=560, size=72) + 80
            else:
                k = back(lt / 0.55)
                if k > 0:
                    img = self.asset(("site", bi), lambda: site_img(th, self.section[bi] or self.brand))
                    place(im, img, W / 2, 610 - 900 * (1 - min(1, k)) + 8 * math.sin(t * 1.2), ry=0.26, rx=0.20, rot=-3.0, scale=0.92)
                y = 1000
            items = s["items"]; gap = speak * 0.75 / max(1, len(items))
            for i, (ic, label) in enumerate(items):
                irows = self.rows(("fi", bi, i), lambda label=label: build_rows(self.d0, label, 760, "Medium", 62, "ExtraBold", 62, upper=False, inline=True))
                st = ws + 0.2 + i * gap; kk = back((t - st) / 0.35); fire_at(t - st, "pop")
                if kk > 0:
                    ico = icon_img(th, ic, 34); s_ = max(0.05, kk)
                    ii = ico.resize((max(1, int(ico.width * s_)), max(1, int(ico.height * s_))))
                    im.paste(ii, (int(120 - ii.width / 2), int(y + 38 - ii.height / 2)), ii); d = ImageDraw.Draw(im)
                draw_rows(d, th, irows, 0, t, st, 0.05, align="left", x0=186, lh=1.15, top=y)
                y += max(100, rows_height(irows, 1.15) + 34)
        elif ty == "book_cta":
            rows = self.rows(("bc", bi), lambda: build_rows(self.d0, f"Comment *“{s['keyword']}”*", 940, "Medium", 84, "Black", 170, min_a=90))
            draw_rows(d, th, rows, 0, t, self.B[bi] + 0.05, 0.22, lh=1.0, top=250)
            k = back((lt - 0.25) / 0.6); fire_at(lt - 0.55, "drop")
            if k > 0:
                img = self.asset(("book", bi), lambda: book_img(th, s["book_title"], s.get("book_sub", ""), self.brand))
                place(im, img, W / 2, 960 + 8 * math.sin(t * 1.5), ry=0.42 + 0.06 * math.sin(t * 0.8), rx=0.10, rot=10, scale=0.9 * min(1.15, k), shadow=0.32)
            tp = max(1.7, speak * 0.62)
            k3 = ease((lt - tp) / 0.6); fire_at(lt - tp, "page")
            if k3 > 0:  # book opens: page spread swings in, big and tilted
                sp = self.asset(("spread", bi), lambda: spread_img(th, s["book_title"], self.brand))
                place(im, sp, W / 2 + 40, 960 + 6 * math.sin(t * 1.3), ry=0.18, rx=0.22, rot=-12 + 4 * (1 - k3), scale=0.45 + 0.5 * k3, shadow=0.3)
                d = ImageDraw.Draw(im)
            brows = self.rows(("bt", bi), lambda: build_rows(self.d0, "I'll send you the *" + s["book_title"].replace(" ", "* *") + "*", 900, "Medium", 60, "ExtraBold", 72, upper=False, min_a=52))
            draw_rows(d, th, brows, 0, t, ws + speak * 0.35, speak * 0.5 / max(1, sum(len(r) for r in brows)), lh=1.1, top=1330)
        elif ty == "follow":
            rows = self.rows(("fo", bi), lambda: build_rows(self.d0, "make sure you *Follow*", 940, "Medium", 66, "ExtraBold", 72, upper=False, inline=True))
            draw_rows(d, th, rows, 0, t, self.B[bi] + 0.05, 0.12, lh=1.1, top=330)
            nrows = self.rows(("fn", bi), lambda: build_rows(self.d0, "*" + self.brand.title().replace(" ", "* *") + "*", 940, "Medium", 66, "ExtraBold", 112, upper=False))
            draw_rows(d, th, nrows, 0, t, self.B[bi] + 0.45, 0.12, lh=1.05, top=330 + rows_height(rows, 1.1))
            k = back((lt - 0.35) / 0.6); fire_at(lt - 0.35, "pop"); fire_at(lt - 0.55, "ding")
            if k > 0:
                bob = 14 * math.sin(t * 3.2) * min(1, max(0, lt - 1.0)); r = 170 * k; cy = 900 + bob
                d.ellipse([W / 2 - r * 0.9, 1130 - 26, W / 2 + r * 0.9, 1130 + 26], fill=lerp(th.BG, (0, 0, 0), 0.10 * min(1, k)))
                logo(d, th, W / 2, cy, max(2, r))
                star4(d, W / 2 + r * 0.95, cy - r * 0.95, 34 * k, th.TXT)
            trows = self.rows(("ft", bi), lambda: build_rows(self.d0, s["text"], 940, "Medium", 62, "Black", 120, min_a=70))
            draw_rows(d, th, trows, 0, t, ws + speak * 0.35, speak * 0.5 / max(1, sum(len(r) for r in trows)), lh=1.08, top=1220)
        text(d, (W / 2, WM_Y), self.spec.get("handle", "@subcreatorpaid"), F("SemiBold", 48), lerp(th.BG, th.TXT, 0.14))
        return im

def build_voice(spec):
    """Voice sources, in order: audio.engine "kokoro" (free, local), audio.voice (a recording / vidIQ MP3 with a
    pause between lines), else the robotic flite fallback."""
    lines = [b["say"] for b in spec["beats"]]; n = len(lines); au = spec.get("audio") or {}; fallback = False; clips = None
    if au.get("engine") == "kokoro":
        try:
            from tts import kokoro_lines
            clips = kokoro_lines(lines, au.get("kokoro_voice", "af_heart"), float(au.get("speed", 1.0)))
            print(f"voice: Kokoro {au.get('kokoro_voice', 'af_heart')}")
        except Exception as e:
            print(f"Kokoro voice failed ({e}); using the fallback voice"); clips = None
    if clips is None:
        vp = au.get("voice")
        if vp:
            vp = vp if os.path.isabs(vp) else os.path.join(spec.get("_dir", "."), vp); x = load_audio(vp)
        else: x, fallback = flite_voice(lines)
        clips = [x[a:b] for a, b in split_by_pauses(x, n, lines)]
    pause = float(au.get("pause", 0.32)); segs = []; parts = []; t = 0.35
    for seg in clips:
        segs.append((t, t + len(seg) / SR)); parts.append((t, seg)); t += len(seg) / SR + pause
    total = round(t + 0.6, 2)
    bounds = [0.0] + [(segs[i][1] + segs[i + 1][0]) / 2 for i in range(n - 1)] + [total]
    N = int(total * SR); voice = np.zeros(N, np.float32)
    for at, seg in parts: i = int(at * SR); voice[i:i + len(seg)] += seg[:N - i]
    voice /= np.abs(voice).max() + 1e-9; voice *= 0.92
    return voice, bounds, segs, fallback

def mix_audio(voice, events, outdir, sfx_level=1.0):
    """Voice + lo-fi bed (ducked under the voice) + every logged UI sound."""
    N = len(voice); music, _ = synth_bed(N, [0.0, N / SR], [])
    venv = np.convolve(np.abs(voice), np.ones(4410) / 4410, "same")
    duck = 1 - 0.5 * np.clip(venv / (venv.max() + 1e-9) * 3, 0, 1)
    fx = SFX.render(events, N) * sfx_level
    fx *= 1 - 0.35 * np.clip(venv / (venv.max() + 1e-9) * 3, 0, 1)  # keep effects under the voice
    mix = voice + music * duck + fx; mix /= max(1.0, np.abs(mix).max() / 0.95)
    from scipy.io import wavfile
    path = os.path.join(outdir, "_mix.wav"); wavfile.write(path, SR, (mix * 32767).astype(np.int16))
    return path

def main():
    global SFX_LOG
    spec = json.load(open(sys.argv[1])); outdir = sys.argv[2]; os.makedirs(outdir, exist_ok=True)
    spec["_dir"] = os.path.dirname(os.path.abspath(sys.argv[1]))
    for i, b in enumerate(spec["beats"]): b["show"]["type"] = pick_type(b["show"], spec["beats"][i - 1]["show"]["type"] if i else None)
    slug = spec.get("slug", "list"); stills = "--stills" in sys.argv
    if stills:
        n = len(spec["beats"]); bounds = [i * 3.0 for i in range(n + 1)]; segs = [(b + 0.2, b + 2.4) for b in bounds[:-1]]
        r = ListReel(spec, bounds, segs); ims = [r.frame(bounds[i] + 2.7).resize((270, 480)) for i in range(n)]
        cols = 7; sh = Image.new("RGB", (cols * 280 - 10, 490 * ((n + cols - 1) // cols)), (30, 30, 34))
        for i, im in enumerate(ims): sh.paste(im, ((i % cols) * 280, (i // cols) * 490))
        sh.save(os.path.join(outdir, f"{slug}_preview.png")); print("stills done"); return
    voice, bounds, segs, fb = build_voice(spec); r = ListReel(spec, bounds, segs)
    r.frame(bounds[1] - 0.05).save(os.path.join(outdir, f"{slug}_cover.png"))
    vid = os.path.join(outdir, "_video.mp4"); out = os.path.join(outdir, f"{slug}.mp4")
    p = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
                          "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", vid], stdin=subprocess.PIPE)
    SFX_LOG = []
    for i in range(int(r.total * FPS)): p.stdin.write(r.frame(i / FPS).tobytes())
    events = SFX_LOG; SFX_LOG = None
    p.stdin.close(); p.wait()
    mix = mix_audio(voice, events, outdir, spec.get("sfx_level", 1.0))
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", vid, "-i", mix, "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
                    "-shortest", "-movflags", "+faststart", out], check=True)
    os.remove(mix); os.remove(vid)
    from collections import Counter
    json.dump({"video": out, "duration": r.total, "beat_bounds": bounds, "fallback_voice": fb, "sounds": dict(Counter(k for _, k in events))},
              open(os.path.join(outdir, f"{slug}_render.json"), "w"), indent=2)
    print(f"done: {out} ({r.total:.1f}s){' [fallback voice]' if fb else ''} sounds={dict(Counter(k for _, k in events))}")

if __name__ == "__main__":
    main()
