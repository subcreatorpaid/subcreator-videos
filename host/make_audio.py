"""Writes one 16 kHz mono WAV per host line and voice into host_in/ (for the Kaggle lip-sync job)."""
import json, os, sys
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "renderer"))
from tts import kokoro_lines
from scipy.io import wavfile
from scipy.signal import resample_poly
cfg = json.load(open(os.path.join(os.path.dirname(__file__), "lines.json")))
os.makedirs("host_in", exist_ok=True)
for v in cfg["voices"]:
    for i, x in enumerate(kokoro_lines(cfg["lines"], v, float(cfg.get("speed", 1.0)))):
        y = resample_poly(x, 160, 441).astype(np.float32); y = np.concatenate([np.zeros(4000, np.float32), y, np.zeros(6400, np.float32)])
        wavfile.write(f"host_in/line{i + 1}_{v}.wav", 16000, (np.clip(y, -1, 1) * 32767).astype(np.int16))
print(sorted(os.listdir("host_in")))
