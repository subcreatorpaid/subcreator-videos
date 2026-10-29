"""Download the faster-whisper word-timing model (tiny.en) with retries; never fails the job.

Runs in GitHub Actions, where Hugging Face is reachable (the model is cached between runs).
If it cannot be loaded, renders fall back to estimated word times (renderer/render_sync.py).
"""
import sys, time

for attempt in range(1, 5):
    try:
        from faster_whisper import WhisperModel
        WhisperModel("tiny.en", device="cpu", compute_type="int8")
        print("word-timing model ready (faster-whisper tiny.en)"); sys.exit(0)
    except Exception as e:  # noqa: BLE001
        print(f"::warning::word-timing model attempt {attempt} failed: {e}")
        time.sleep(2 ** attempt)
print("::warning::faster-whisper unavailable: word times will be ESTIMATED for this run")
