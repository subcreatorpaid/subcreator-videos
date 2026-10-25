#!/usr/bin/env python3
"""Make a "source card" PNG: a clearly labelled summary of an official page (used when a site blocks screenshots).
It is never styled as a fake screenshot: it says "Summary of the official page" and the checked date.

  python3 renderer/source_card.py out.png --site "support.google.com" --title "Expanded YouTube Partner Program" \
      --fact "500 subscribers" --fact "3 public uploads in 90 days" --hl 0 --checked "25 Oct 2026"
"""
import argparse, os
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(HERE, "..", "fonts")
INK, MUTED, ACC, ACC_SOFT, LINE, BG = (21, 21, 21), (95, 94, 88), (46, 125, 79), (227, 240, 231), (226, 223, 215), (255, 255, 255)


def F(w, s): return ImageFont.truetype(os.path.join(FONTS, f"Inter-{w}.otf"), s)


def wrap(d, text, font, width):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if d.textlength(t, font=font) <= width: cur = t
        else: lines.append(cur); cur = w
    if cur: lines.append(cur)
    return lines


def make(out, site, title, facts, hl, checked, label="Summary of the official page"):
    W = 1200; pad = 70
    tmp = Image.new("RGB", (W, 10)); d = ImageDraw.Draw(tmp)
    tf, ff = F("Black", 64), F("Bold", 50)
    tl = wrap(d, title, tf, W - 2 * pad)
    fl = [wrap(d, f, ff, W - 2 * pad - 90) for f in facts]
    H = 150 + len(tl) * 76 + 50 + sum(len(x) * 64 + 40 for x in fl) + 130
    im = Image.new("RGB", (W, H), BG); d = ImageDraw.Draw(im)
    # browser-like top bar with the real domain (it is a summary card, labelled as such below)
    d.rectangle([0, 0, W, 96], fill=(244, 243, 239)); d.line([0, 96, W, 96], fill=LINE, width=2)
    for i, c in enumerate([(232, 107, 94), (240, 190, 80), (98, 190, 110)]): d.ellipse([30 + i * 34, 36, 52 + i * 34, 58], fill=c)
    d.rounded_rectangle([150, 24, W - 40, 72], radius=24, fill=BG, outline=LINE, width=2)
    d.text((176, 48), "🔒 " + site if False else site, font=F("Medium", 28), fill=MUTED, anchor="lm")
    y = 140
    for l in tl: d.text((pad, y), l, font=tf, fill=INK); y += 76
    y += 40
    for i, lines in enumerate(fl):
        h = len(lines) * 64
        if i == hl:
            d.rounded_rectangle([pad - 16, y - 12, W - pad + 16, y + h + 6], radius=14, fill=ACC_SOFT)
        d.ellipse([pad, y + 14, pad + 26, y + 40], fill=ACC if i == hl else INK)
        for j, l in enumerate(lines): d.text((pad + 60, y + j * 64), l, font=ff, fill=INK)
        y += h + 40
    d.line([pad, y + 10, W - pad, y + 10], fill=LINE, width=2)
    d.text((pad, y + 50), f"{label} · checked {checked}", font=F("Medium", 30), fill=MUTED, anchor="lm")
    im.save(out); print("source card:", out, im.size)


if __name__ == "__main__":
    a = argparse.ArgumentParser()
    a.add_argument("out"); a.add_argument("--site", required=True); a.add_argument("--title", required=True)
    a.add_argument("--fact", action="append", default=[]); a.add_argument("--hl", type=int, default=0); a.add_argument("--checked", required=True)
    x = a.parse_args(); make(x.out, x.site, x.title, x.fact, x.hl, x.checked)
