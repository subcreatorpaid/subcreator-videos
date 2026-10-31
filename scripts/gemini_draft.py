"""Cheap daily trend scan with the Gemini API, so Claude runs only review and fact-check the results.

  python3 scripts/gemini_draft.py scan   daily trend scan with Google Search -> brain/research/<date>_gemini_scan.md

Scripts, hooks, titles, captions and storytelling are written by Claude Opus in Claude threads (owner decision 30 Oct 2026),
not here. Images are made by Hammad in Google Flow (the image API has no free tier on our key).

Needs GEMINI_API_KEY (AI Studio key; a GitHub secret in Actions, never in the repo). Standard library only.
Everything it writes is a DRAFT: nothing is posted, and every figure must still pass opportunity-check / guard
(official source within 30 days) before it goes into a script or caption.
"""
import argparse, datetime as dt, json, os, pathlib, sys, time, urllib.error, urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
API = "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent"
# Google retires model names over time, so try an override first, then current ones in order.
MODELS = [m for m in [os.environ.get("GEMINI_MODEL"), "gemini-flash-latest", "gemini-2.5-flash", "gemini-2.5-flash-lite"] if m]
TODAY = dt.date.today().isoformat()


def ask(prompt, system, search=False, as_json=False):
    key = os.environ.get("GEMINI_API_KEY")
    if not key: sys.exit("GEMINI_API_KEY is not set (add it as a GitHub secret; see brain/accounts.md)")
    body = {"systemInstruction": {"parts": [{"text": system}]}, "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.7}}
    if search: body["tools"] = [{"google_search": {}}]
    if as_json: body["generationConfig"]["responseMimeType"] = "application/json"
    last = None
    for model in MODELS:
        for attempt in range(3):
            req = urllib.request.Request(API.format(model), json.dumps(body).encode(), method="POST",
                                         headers={"Content-Type": "application/json", "x-goog-api-key": key})
            try:
                with urllib.request.urlopen(req, timeout=120) as r: data = json.load(r)
                cand = data["candidates"][0]
                text = "".join(p.get("text", "") for p in cand["content"]["parts"])
                sources = [c["web"] for c in cand.get("groundingMetadata", {}).get("groundingChunks", []) if "web" in c]
                print(f"model {model}")
                return text, sources
            except urllib.error.HTTPError as e:
                last = f"{model}: HTTP {e.code} {e.read()[:200]!r}"
                if e.code == 429 or e.code >= 500: time.sleep(5 * (attempt + 1)); continue
                break  # 400/403/404: wrong model name or key; try the next model
            except (KeyError, IndexError) as e:
                last = f"{model}: empty answer ({e})"; break
    sys.exit(f"Gemini failed: {last}")


def house_rules():
    return ("You research for Sub-Creator Paid, which teaches creators under 10k followers which income streams really pay, "
            "with verified USD figures and the catch. Follow this brand book and these rules exactly.\n\n"
            + (ROOT / "brain/brand.md").read_text() + "\n\n" + (ROOT / "brain/rules.md").read_text())


def scan():
    learn = (ROOT / "brain/learnings.md").read_text()[:3000]
    prompt = (f"Today is {TODAY}. Search the web for news from the last 7 days that matters to small creators (0-10k followers) "
              "earning money: new or changed monetisation programs and their thresholds, payout changes, affiliate programs for "
              "creator tools, and short-form formats getting traction on Instagram Reels and TikTok in the creator-income niche.\n"
              "Return Markdown with sections: '## Program changes', '## New programs', '## Formats working now', '## 3 video ideas'. "
              "For every figure give the USD amount, the date and the official source page. Mark anything not from an official page "
              "as 'confirm on joining'. Skip anything you can't date.\n\nWhat we already learned:\n" + learn)
    text, sources = ask(prompt, house_rules(), search=True)
    out = ROOT / f"brain/research/{TODAY}_gemini_scan.md"
    src = "\n".join(f"- [{s.get('title', 'source')}]({s.get('uri')})" for s in sources) or "- (no search sources returned)"
    out.write_text(f"# Gemini trend scan {TODAY} (DRAFT: researcher checks every figure before use)\n\n{text.strip()}\n\n## Search sources\n{src}\n")
    return out


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("job", choices=["scan"])
    ap.parse_args()
    print(f"wrote {scan().relative_to(ROOT)}")
