"""Synthesised UI sound effects for the list renderer (no samples, no licences).

Kinds: key (typewriter key), thud (big accent word), pop (badge/pill/icon), swipe (highlight box wipe),
zip (a line drawing itself), card (card landing), count (number ticking up), glass (shatter), page (page turn),
whip (fast slide), whoosh (zoom), swoosh (soft blur), click (mouse click), drop (object landing), ding (reveal),
bell (typewriter carriage bell).
"""
import numpy as np
from scipy.signal import butter, lfilter

SR = 44100
_rng = np.random.default_rng(3)

def _env(n, a=0.002, d=0.05):
    t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)

def _bp(x, lo, hi):
    b, a = butter(2, [lo / (SR / 2), min(hi, SR / 2 - 100) / (SR / 2)], "band"); return lfilter(b, a, x)

def _lp(x, f):
    b, a = butter(2, f / (SR / 2), "low"); return lfilter(b, a, x)

def _hp(x, f):
    b, a = butter(2, f / (SR / 2), "high"); return lfilter(b, a, x)

def _norm(x, g=1.0):
    return (x / (np.abs(x).max() + 1e-9) * g).astype(np.float32)

def key(seed=0):
    r = np.random.default_rng(seed); n = int(0.07 * SR); t = np.arange(n) / SR
    click = _bp(r.normal(0, 1, n), 1800 + seed * 150, 7000) * _env(n, 0.0005, 0.008)
    body = np.sin(2 * np.pi * (900 + 120 * seed) * t) * _env(n, 0.0005, 0.012) * 0.5
    thock = np.sin(2 * np.pi * 180 * t) * _env(n, 0.001, 0.02) * 0.6
    return _norm(click + body + thock)

def thud():
    n = int(0.25 * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * (60 + 90 * np.exp(-t * 25)) * t) * _env(n, 0.001, 0.07)
    return _norm(s + 0.3 * _bp(_rng.normal(0, 1, n), 200, 2000) * _env(n, 0.001, 0.01))

def pop():
    n = int(0.12 * SR); t = np.arange(n) / SR
    return _norm(np.sin(2 * np.pi * (300 + 600 * np.exp(-t * 40)) * t) * _env(n, 0.001, 0.035))

def swipe():
    n = int(0.32 * SR); t = np.arange(n) / SR; x = _rng.normal(0, 1, n)
    out = np.zeros(n)
    for i, f in enumerate(np.linspace(900, 4500, 8)):
        seg = slice(i * n // 8, (i + 1) * n // 8); out[seg] = _bp(x, f, f * 1.6)[seg]
    return _norm(out * np.sin(np.linspace(0, np.pi, n)) ** 1.5)

def zip_(dur=0.45):
    n = int(dur * SR); t = np.arange(n) / SR
    tone = np.sin(2 * np.pi * np.cumsum(600 + 1400 * t / dur) / SR) * 0.25
    hiss = _bp(_rng.normal(0, 1, n), 3000, 9000) * 0.6
    tick = (np.sin(2 * np.pi * 45 * t) > 0.6) * 0.3
    return _norm((tone + hiss * (0.6 + tick)) * np.sin(np.linspace(0, np.pi, n)) ** 0.8)

def card():
    n = int(0.18 * SR)
    slap = _lp(_rng.normal(0, 1, n), 1800) * _env(n, 0.001, 0.025)
    t = np.arange(n) / SR; thump = np.sin(2 * np.pi * 110 * t) * _env(n, 0.001, 0.04)
    return _norm(slap + 0.7 * thump)

def count(dur=0.9):
    n = int(dur * SR); out = np.zeros(n); step = 0.055; i = 0
    while i * step < dur - 0.05:
        k = key(i % 5) * (0.35 + 0.65 * (i * step / dur)); s = int(i * step * SR); e = min(n, s + len(k)); out[s:e] += k[:e - s] * 0.6
        i += 1
    return _norm(out)

def glass():
    n = int(1.1 * SR); t = np.arange(n) / SR; out = _hp(_rng.normal(0, 1, n), 2500) * _env(n, 0.001, 0.08) * 0.8
    for _ in range(18):
        f = _rng.uniform(2200, 7500); st = int(_rng.uniform(0, 0.25) * SR); m = n - st
        out[st:] += np.sin(2 * np.pi * f * t[:m]) * _env(m, 0.0005, _rng.uniform(0.05, 0.25)) * _rng.uniform(0.15, 0.4)
    low = np.sin(2 * np.pi * 70 * t) * _env(n, 0.001, 0.06) * 0.6
    return _norm(out + low)

def page():
    n = int(0.45 * SR); t = np.arange(n) / SR; x = _rng.normal(0, 1, n); out = np.zeros(n)
    for i, f in enumerate(np.linspace(600, 3500, 10)):
        seg = slice(i * n // 10, (i + 1) * n // 10); out[seg] = _bp(x, f, f * 2.2)[seg]
    envl = np.sin(np.linspace(0, np.pi, n)) ** 2 * (1 + 0.6 * np.sin(2 * np.pi * 9 * t))
    return _norm(out * envl)

def whip():
    n = int(0.28 * SR); x = _rng.normal(0, 1, n); out = np.zeros(n)
    for i, f in enumerate(np.linspace(4000, 700, 8)):
        seg = slice(i * n // 8, (i + 1) * n // 8); out[seg] = _bp(x, f, f * 1.8)[seg]
    return _norm(out * np.sin(np.linspace(0, np.pi, n)) ** 0.7)

def whoosh():
    n = int(0.45 * SR); return _norm(_bp(_rng.normal(0, 1, n), 500, 3500) * np.sin(np.linspace(0, np.pi, n)) ** 2)

def swoosh():
    n = int(0.5 * SR); return _norm(_lp(_rng.normal(0, 1, n), 1200) * np.sin(np.linspace(0, np.pi, n)) ** 3)

def click():
    n = int(0.09 * SR); out = np.zeros(n)
    for st in (0, int(0.045 * SR)):
        m = n - st; out[st:] += _bp(_rng.normal(0, 1, m), 2000, 8000) * _env(m, 0.0003, 0.004)
    return _norm(out)

def drop():
    n = int(0.35 * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * (55 + 70 * np.exp(-t * 18)) * t) * _env(n, 0.001, 0.09); c = card(); s[:len(c)] += 0.4 * c
    return _norm(s)

def ding():
    n = int(0.7 * SR); t = np.arange(n) / SR
    return _norm((np.sin(2 * np.pi * 1568 * t) + 0.5 * np.sin(2 * np.pi * 1568 * 2.76 * t)) * np.exp(-t * 6))

def bell():
    n = int(0.9 * SR); t = np.arange(n) / SR
    return _norm((np.sin(2 * np.pi * 2093 * t) + 0.4 * np.sin(2 * np.pi * 2093 * 2.4 * t)) * np.exp(-t * 5))

def stamp():
    # rubber stamp slam: low body hit, paper slap, short rattle (case-file style, 31 Oct 2026)
    n = int(0.32 * SR); t = np.arange(n) / SR
    body = np.sin(2 * np.pi * (70 + 120 * np.exp(-t * 30)) * t) * _env(n, 0.0005, 0.05)
    slap = _bp(_rng.normal(0, 1, n), 400, 3500) * _env(n, 0.0005, 0.018)
    rattle = _bp(_rng.normal(0, 1, n), 1500, 5000) * _env(n, 0.03, 0.04) * 0.25
    return _norm(body + 0.8 * slap + rattle)

def scan():
    # x-ray scanner sweep: rising filtered hum with a bright shimmer, ~0.7 s
    n = int(0.7 * SR); t = np.arange(n) / SR
    hum = np.sin(2 * np.pi * np.cumsum(120 + 260 * t / 0.7) / SR) * 0.5
    sh = _bp(_rng.normal(0, 1, n), 3000, 8000) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 14 * t))) * 0.35
    return _norm((hum + sh) * np.sin(np.linspace(0, np.pi, n)) ** 1.2)

def tick():
    # soft UI tick for chips and labels
    n = int(0.05 * SR); t = np.arange(n) / SR
    return _norm(np.sin(2 * np.pi * 2400 * t) * _env(n, 0.0003, 0.006) + 0.4 * _bp(_rng.normal(0, 1, n), 3000, 9000) * _env(n, 0.0002, 0.003))

BANK = None
GAIN = {"key": 0.11, "thud": 0.32, "pop": 0.26, "swipe": 0.24, "zip": 0.16, "card": 0.34, "count": 0.20, "glass": 0.42,
        "page": 0.34, "whip": 0.30, "whoosh": 0.26, "swoosh": 0.18, "click": 0.36, "drop": 0.36, "ding": 0.26, "bell": 0.16,
        "stamp": 0.40, "scan": 0.22, "tick": 0.22}

def bank():
    global BANK
    if BANK is None:
        BANK = {"thud": thud(), "pop": pop(), "swipe": swipe(), "zip": zip_(), "card": card(), "count": count(), "glass": glass(),
                "page": page(), "whip": whip(), "whoosh": whoosh(), "swoosh": swoosh(), "click": click(), "drop": drop(),
                "ding": ding(), "bell": bell(), "stamp": stamp(), "scan": scan(), "tick": tick()}
        BANK["keys"] = [key(i) for i in range(6)]
    return BANK

def render(events, N):
    """events = [(time_s, kind)] -> float32 mono track of length N. Typewriter keys are rate-limited."""
    b = bank(); out = np.zeros(N, np.float32); last_key = -1.0; ki = 0
    for t, kind in sorted(events):
        if kind == "key":
            if t - last_key < 0.05: continue
            last_key = t; sig = b["keys"][ki % 6]; ki += 1; g = GAIN["key"] * (0.8 + 0.4 * _rng.random())
        elif kind in b: sig = b[kind]; g = GAIN[kind]
        else: continue
        i = int(t * SR)
        if i < 0 or i >= N: continue
        j = min(N, i + len(sig)); out[i:j] += g * sig[:j - i]
    return out
