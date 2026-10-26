"""Free, local text-to-speech for the renderer: Kokoro (open-source, Apache-2.0 model) via kokoro-onnx.

Model files (download once, ~350 MB) - the GitHub workflow does this for you and caches them:
  https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
  https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
Put them in ./models (next to renderer/) or set KOKORO_DIR.

Good voices for this channel: af_heart (warm US female, default), af_bella, af_nicole, bf_emma (British female),
am_michael (US male). Speed 0.9-1.15.
"""
import os
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
SR = 44100

def _model_dir():
    for d in (os.environ.get("KOKORO_DIR"), os.path.join(HERE, "..", "models"), os.path.join(HERE, "..", "..", "models"), "/home/claude/models"):
        if d and os.path.exists(os.path.join(d, "kokoro-v1.0.onnx")): return d
    raise FileNotFoundError("Kokoro model files not found: put kokoro-v1.0.onnx and voices-v1.0.bin in ./models or set KOKORO_DIR")

def _say(s):
    """Small fixes so numbers and acronyms are read the way we want."""
    return (s.replace("$", " dollars ").replace("%", " percent").replace("UGC", "U G C").replace("&", " and ")).strip()

def _trim(x, thr=0.008, pad_start=0.03, pad_end=0.12):
    idx = np.where(np.abs(x) > thr)[0]
    if len(idx) == 0: return x
    return x[max(0, idx[0] - int(pad_start * SR)): idx[-1] + int(pad_end * SR)]

def kokoro_lines(lines, voice="af_heart", speed=1.0, lang="en-us"):
    """One clip per line (float32, 44.1 kHz, mono), each trimmed of silence."""
    from kokoro_onnx import Kokoro
    from scipy.signal import resample_poly
    d = _model_dir(); k = Kokoro(os.path.join(d, "kokoro-v1.0.onnx"), os.path.join(d, "voices-v1.0.bin"))
    if isinstance(voice, str) and "+" in voice:  # "am_michael+am_puck": an even blend of the voices' styles
        names = voice.split("+"); voice = sum(k.get_voice_style(n) for n in names) / len(names)
    clips = []
    for s in lines:
        samples, sr = k.create(_say(s), voice=voice, speed=speed, lang=lang)
        x = np.asarray(samples, np.float32)
        if sr != SR:
            from math import gcd
            g = gcd(SR, sr); x = resample_poly(x, SR // g, sr // g).astype(np.float32)
        clips.append(_trim(x))
    return clips
