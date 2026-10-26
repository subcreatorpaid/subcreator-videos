#!/usr/bin/env python3
"""Sound for the 5 style samples (Samples.jsx): a quiet music bed plus synthesised UI effects at the animation moments.
Usage: python animator/samples_sfx.py OUT_DIR  -> OUT_DIR/sample_<n>.wav (5 s each, -14 LUFS-ish peak-safe)."""
import pathlib, sys
import numpy as np, soundfile as sf

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / "renderer"))
import sfx  # noqa: E402
from render_reel import synth_bed  # noqa: E402

FPS, DUR = 30, 5.0
SR = sfx.SR
t = lambda f: f / FPS  # noqa: E731

# (frame, kind) per sample, matching the animation timings in Samples.jsx
EVENTS = {
    1: [(0, "whip"), (6, "whip"), (12, "whip")] + [(f, "key") for f in range(4, 52, 3)] + [(72, "whip"), (84, "thud"), (118, "swoosh")],
    2: [(14, "pop"), (22, "pop"), (44, "card"), (56, "swipe"), (86, "whoosh"), (112, "ding"), (114, "pop")],
    3: [(0, "whip"), (6, "swoosh"), (36, "click"), (42, "page"), (56, "pop"), (92, "whip"), (122, "click")],
    4: [(0, "swoosh"), (56, "thud"), (58, "drop")],
    5: [(i * 22, "whip") for i in range(5)] + [(88, "ding"), (112, "whoosh"), (124, "pop")],
}

out = pathlib.Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
N = int(DUR * SR)
for n, ev in EVENTS.items():
    music, _ = synth_bed(N, [0.0, DUR], [])
    fx = sfx.render([(t(f), k) for f, k in ev], N)
    mix = 0.35 * music / max(1e-6, np.abs(music).max()) + 0.9 * fx / max(1e-6, np.abs(fx).max())
    mix *= 0.89 / max(1e-6, np.abs(mix).max())
    fade = np.minimum(1, np.arange(N)[::-1] / (0.25 * SR))
    sf.write(out / f"sample_{n}.wav", (mix * fade).astype(np.float32), SR)
    print("wrote", out / f"sample_{n}.wav")
