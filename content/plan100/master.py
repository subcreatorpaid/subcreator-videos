"""Master video folder: one numbered subfolder per video with everything needed to review and render it.

  python3 content/plan100/master.py [OUT]     (default OUT = /mnt/project-files/02-videos)

Writes content/plan100/registry.json (number -> slug, used by the Render Room page too) and, per video,
OUT/NNN_slug/: spec.json, script.md, captions.md, guide.json, guide.pdf, affiliate.md, RENDER.md, thumbnail.png
(+ the MP4 and 3 hook clips once that video is rendered).
"""
import json, pathlib, re, shutil, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "/mnt/project-files/02-videos")
THUMBS = pathlib.Path(__file__).parent / "thumbs"  # local stills of not-yet-rendered videos (not committed)
REPO = "subcreatorpaid/subcreator-videos"
ROOM = "https://claude.ai/artifact/5RpYRzaySkv1cMp3xQtcok"
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from common import AFF

EARLIER = [  # videos made before the plan, numbered first (their facts are in each spec's sources)
    ("001", "20261027_ugc_brands_pay"), ("002", "20261027_views_wont_pay"), ("003", "20261027_no_10k_needed"),
    ("004", "20261028_ugc_samples_phone"), ("005", "20261028_price_first_ugc"), ("006", "20261029_find_ugc_jobs"),
    ("007", "20261029_spot_fake_deals"), ("008", "20261030_disclose_right"),
]


def registry():
    reg = [{"n": n, "slug": s, "group": "earlier"} for n, s in EARLIER]
    plan = json.loads((ROOT / "content/plan100/plan.json").read_text())
    reg += [{"n": f"{r['n']:03d}", "slug": r["slug"], "group": "plan"} for r in plan]
    extra = pathlib.Path(__file__).parent / "extras.json"  # bio videos + finder tutorial
    if extra.exists(): reg += json.loads(extra.read_text())
    for r in reg:
        s = json.loads((ROOT / "videos" / r["slug"] / "spec.json").read_text())
        words = sum(len(re.sub(r"\[([^|\]]+)\|[^\]]+\]", r"\1", b["say"]).split()) for b in s["beats"])
        r.update(title=s.get("title") or s.get("thumb", {}).get("headline", r["slug"]).replace("\n", " ").replace("*", "").replace("~", "").replace("^", ""),
                 type=s.get("type", "value"), seconds=round(words / 3), tool=next((k for k, v in AFF.items() if v[0] == s["beats"][-1]["show"].get("tool")), None))
    (ROOT / "content/plan100/registry.json").write_text(json.dumps(reg, indent=1, ensure_ascii=False))
    return reg


def release_assets(slug):
    r = subprocess.run(["gh", "api", f"repos/{REPO}/releases/tags/video-{slug}-animated", "--jq", '.assets[]|"\\(.id) \\(.name)"'], capture_output=True, text=True)
    return [l.split(" ", 1) for l in r.stdout.split("\n") if l.strip()] if r.returncode == 0 else []


def fetch(aid, dest):
    tok = subprocess.run(["gh", "auth", "token"], capture_output=True, text=True).stdout.strip()
    subprocess.run(["curl", "-sL", "-o", str(dest), "-H", f"Authorization: token {tok}", "-H", "Accept: application/octet-stream",
                    f"https://api.github.com/repos/{REPO}/releases/assets/{aid}"], check=True)


def script_md(r, s):
    out = [f"# {r['n']} · {r['title']}", "", f"Type: {r['type']} · about {r['seconds']} s · voice Michael+Puck at {s['audio'].get('speed', 1)}", "", "## Hooks (pick one; each is also rendered as a 4 s clip)"]
    out += [f"- **{h.get('label', '')}**: {h['say']}" for h in s.get("hooks", [])]
    out += ["", "## Script (beat · what is said · what is on screen)"]
    for i, b in enumerate(s["beats"], 1):
        out.append(f"{i}. {b['say']}  \n   _Screen: {b['show'].get('type')}{(' · ' + b['show']['title']) if b['show'].get('title') else ''}_")
    out += ["", "## Sources"] + [f"- {x['title']}: {x['url']}" for x in s.get("sources", [])]
    return "\n".join(out) + "\n"


def main():
    reg = registry(); OUT.mkdir(parents=True, exist_ok=True)
    for r in reg:
        src = ROOT / "videos" / r["slug"]; d = OUT / f"{r['n']}_{re.sub(r'^v\d{3}_', '', r['slug'])}"; d.mkdir(exist_ok=True)
        s = json.loads((src / "spec.json").read_text())
        for f in ("spec.json", "captions.md", "guide.json", "guide.pdf"):
            if (src / f).exists(): shutil.copy(src / f, d / f)
        (d / "script.md").write_text(script_md(r, s))
        t = r.get("tool")
        aff = (f"# Affiliate for this video\n\nProgram: {AFF[t][0]}\nYou earn: {AFF[t][1]}\nSign up: {AFF[t][2]}\nOur status: {AFF[t][3]}\n"
               f"Short link used in captions: subcreatorpaid.com/go/{t}\n\nAfter joining, put the referral link in site/data/links.json so /go/{t} points to it.\n") if t else \
              "# Affiliate for this video\n\nNo single tool; the ending points to the tools page (subcreatorpaid.com/links).\n"
        (d / "affiliate.md").write_text(aff)
        (d / "RENDER.md").write_text(f"# Render {r['n']}\n\nEasiest: open the Render Room and press **Render** on video {r['n']}: {ROOM}\n\n"
                                     f"Or on GitHub: https://github.com/{REPO}/actions/workflows/animate.yml > Run workflow > video = `{r['slug']}`, mode = `full`.\n"
                                     f"About 8 minutes. The finished files appear at https://github.com/{REPO}/releases/tag/video-{r['slug']}-animated\n")
        have = {n: aid for aid, n in release_assets(r["slug"])}
        for n, aid in have.items():
            if n.endswith((".mp4", "_thumbnail.png")):
                dest = d / ("thumbnail.png" if n.endswith("_thumbnail.png") else n.replace(r["slug"] + "_", "").replace("animated", "video"))
                if not dest.exists(): fetch(aid, dest)
        if not (d / "thumbnail.png").exists() and (THUMBS / f"{r['slug']}.png").exists():
            shutil.copy(THUMBS / f"{r['slug']}.png", d / "thumbnail.png")
    lines = ["# Sub-Creator Paid: master video folder", "", f"Render any video from the Render Room (one button per video): {ROOM}", "",
             "Each folder: spec.json (what gets rendered), script.md, captions.md, guide.pdf (the free guide for the comment keyword), affiliate.md, thumbnail.png, RENDER.md. Rendered videos also have video.mp4 + hook_1-3.mp4.", "",
             "| # | Video | Type | Length | Tool |", "|---|---|---|---|---|"]
    lines += [f"| {r['n']} | {r['title']} | {r['type']} | ~{r['seconds']} s | {AFF[r['tool']][0] if r.get('tool') else '-'} |" for r in reg]
    (OUT / "README.md").write_text("\n".join(lines) + "\n")
    used = {}
    for r in reg:
        if r.get("tool"): used.setdefault(r["tool"], []).append(r["n"])
    order = sorted(AFF, key=lambda k: (AFF[k][3] == "joined", -len(used.get(k, []))))  # still to join first, most-used first
    aff = ["# Affiliate sign-up list (all 105 videos)", "",
           "Join each program yourself (it means accepting their terms, so it is your step). Then send me the referral link,",
           "or put it in site/data/links.json, and subcreatorpaid.com/go/<id> starts pointing to it.", "",
           "| Program | Status | You earn | Videos that use it | Sign up |", "|---|---|---|---|---|"]
    aff += [f"| {AFF[k][0]} | {AFF[k][3]} | {AFF[k][1]} | {len(used.get(k, []))} ({', '.join(used.get(k, [])[:8])}{'…' if len(used.get(k, [])) > 8 else ''}) | {AFF[k][2]} |" for k in order]
    (OUT / "AFFILIATE_SIGNUPS.md").write_text("\n".join(aff) + "\n")
    print(len(reg), "folders in", OUT)


if __name__ == "__main__":
    main()
