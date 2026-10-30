"""Scene posters from our Flow image prompts with the Gemini image API (Nano Banana), so Hammad doesn't have to paste them into Flow.

  python3 scripts/gemini_image.py <dir>/image_prompts.json [--only 1,4] [--compare]

image_prompts.json: {"header": "...", "style": "...", "compare": false, "scenes": [{"n": 1, "name": "hook", "prompt": "..."}]}
Each scene prompt is "[header] [style] <prompt>" (same blocks as the FLOW_IMAGE_PROMPTS_*.md files). Writes <dir>/posters/NN_<name>[_<model>].png
plus <dir>/posters/report.md (model, tokens, estimated USD per image). --compare (or "compare": true) runs every model in MODELS
on the same scenes instead of stopping at the first that works. Needs GEMINI_API_KEY. Standard library only.
"""
import argparse, base64, json, os, pathlib, sys, time, urllib.error, urllib.request

API = "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent"
MODELS = [m for m in [os.environ.get("GEMINI_IMAGE_MODEL"), "gemini-2.5-flash-image", "gemini-3-pro-image-preview"] if m]
# USD per 1M output tokens (Google list price, paid tier); an image is about 1,290 (2.5 flash) or 1,120 (3 pro, 1K/2K) tokens.
PRICE_OUT = {"gemini-2.5-flash-image": 30.0, "gemini-3-pro-image-preview": 120.0}


def gen(model, prompt, key):
    body = {"contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": "9:16"}}}
    for attempt in range(3):
        req = urllib.request.Request(API.format(model), json.dumps(body).encode(), method="POST",
                                     headers={"Content-Type": "application/json", "x-goog-api-key": key})
        try:
            with urllib.request.urlopen(req, timeout=180) as r: data = json.load(r)
        except urllib.error.HTTPError as e:
            msg = e.read().decode(errors="replace")[:400]
            if e.code >= 500 or (e.code == 429 and "limit: 0" not in msg): time.sleep(10 * (attempt + 1)); continue
            return None, f"HTTP {e.code}: {msg}"
        parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [])
        img = next((p["inlineData"]["data"] for p in parts if "inlineData" in p), None)
        if not img: return None, f"no image returned: {json.dumps(data)[:300]}"
        return (base64.b64decode(img), data.get("usageMetadata", {})), None
    return None, "gave up after 3 tries (rate limit or server error)"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("file")
    ap.add_argument("--only", default="", help="scene numbers, e.g. 1,4")
    ap.add_argument("--compare", action="store_true")
    a = ap.parse_args()
    key = os.environ.get("GEMINI_API_KEY") or sys.exit("GEMINI_API_KEY is not set (GitHub secret; see brain/accounts.md)")
    src = pathlib.Path(a.file); cfg = json.loads(src.read_text())
    only = {int(x) for x in a.only.split(",") if x.strip()}
    scenes = [s for s in cfg["scenes"] if not only or s["n"] in only]
    compare = a.compare or cfg.get("compare", False)
    out = src.parent / "posters"; out.mkdir(exist_ok=True)
    rows, made = [], 0
    for s in scenes:
        prompt = " ".join(x for x in [cfg.get("header", ""), cfg.get("style", ""), s["prompt"]] if x)
        for model in MODELS:
            res, err = gen(model, prompt, key)
            if err:
                rows.append(f"| {s['n']} | {model} | FAILED: {err.replace('|', '/')[:250]} | | |"); print(f"scene {s['n']} {model}: {err}"); continue
            png, usage = res
            name = f"{s['n']:02d}_{s.get('name', 'scene')}" + (f"_{model}" if compare else "") + ".png"
            (out / name).write_bytes(png); made += 1
            toks = usage.get("candidatesTokenCount", 0)
            usd = toks * PRICE_OUT.get(model, 0) / 1e6
            rows.append(f"| {s['n']} | {model} | {name} | {toks} | ${usd:.3f} |"); print(f"scene {s['n']} {model}: {name} ({toks} tokens, ~${usd:.3f})")
            if not compare: break
    (out / "report.md").write_text("# Gemini poster run\n\nCost is an estimate at Google's paid list price; a free-tier key is not billed.\n\n"
                                   "| Scene | Model | File / result | Output tokens | Est. USD |\n|---|---|---|---|---|\n" + "\n".join(rows) + "\n")
    print((out / "report.md").read_text())
    if not made: sys.exit("no image was made (see report)")


if __name__ == "__main__":
    main()
