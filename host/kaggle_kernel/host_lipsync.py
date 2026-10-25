# Runs on Kaggle's free GPU. Started automatically by .github/workflows/host.yml.
# Input dataset (subcreatorpaid/host-inputs): host.png + one .wav per line. Output: one lip-synced .mp4 per .wav.
# Model: Ditto talking head (Apache-2.0, antgroup/ditto-talkinghead), PyTorch checkpoints.
import glob, os, subprocess, sys, time, json, shutil
OUT = "/kaggle/working/out"; os.makedirs(OUT, exist_ok=True)
log = open("/kaggle/working/log.txt", "w")
def sh(c, check=True):
    t = time.time(); print("$", c, flush=True)
    r = subprocess.run(c, shell=True, capture_output=True, text=True)
    log.write(f"$ {c}\n{r.stdout[-3000:]}\n{r.stderr[-3000:]}\n[{time.time()-t:.0f}s rc={r.returncode}]\n"); log.flush()
    print(r.stdout[-2000:], r.stderr[-2000:], flush=True)
    if check and r.returncode: raise SystemExit(f"failed: {c}")
    return r
sh("nvidia-smi", check=False)
ins = sorted(glob.glob("/kaggle/input/**/host.png", recursive=True))
if not ins: raise SystemExit("host.png not found in inputs")
IN = os.path.dirname(ins[0]); wavs = sorted(glob.glob(os.path.join(IN, "*.wav")))
log.write(f"inputs: {IN} {wavs}\n")
sh("pip install -q librosa tqdm filetype imageio opencv_python_headless scikit-image cython imageio-ffmpeg colored polygraphy huggingface_hub", check=False)
sh("pip install -q onnxruntime-gpu || pip install -q onnxruntime", check=False)
sh("pip install -q mediapipe", check=False)
sh("python -c 'import onnxruntime as o; print(o.__version__, o.get_available_providers())'", check=False)
sh("cd /kaggle/working && rm -rf ditto && git clone -q --depth 1 https://github.com/antgroup/ditto-talkinghead ditto")
from huggingface_hub import snapshot_download
snapshot_download("digital-avatar/ditto-talkinghead", local_dir="/kaggle/working/ditto/checkpoints",
                  allow_patterns=["ditto_pytorch/*", "ditto_pytorch/**", "ditto_cfg/*"])
sh("ls -R /kaggle/working/ditto/checkpoints | head -60", check=False)
cfg = glob.glob("/kaggle/working/ditto/checkpoints/ditto_cfg/*pytorch*.pkl")
res = {}
for w in wavs:
    name = os.path.splitext(os.path.basename(w))[0]; t = time.time()
    r = sh(f"cd /kaggle/working/ditto && python inference.py --data_root ./checkpoints/ditto_pytorch --cfg_pkl {cfg[0]} "
           f"--audio_path '{w}' --source_path '{ins[0]}' --output_path '{OUT}/{name}.mp4'", check=False)
    res[name] = {"ok": os.path.exists(f"{OUT}/{name}.mp4"), "seconds": round(time.time() - t)}
json.dump(res, open("/kaggle/working/result.json", "w"), indent=1); log.write(json.dumps(res) + "\n"); log.close()
shutil.rmtree("/kaggle/working/ditto", ignore_errors=True)  # keep the output small
print(res)
