#!/usr/bin/env python3
"""Weekly video pipeline helper, used by the workflows (no Claude needed). State lives in brain/week-plan.json.

Post status flow (owner gates in capitals):
  drafted -> storyboard (stills made, PR open) -> MERGE -> previewed (360p, review issue open) -> LABEL approve-final
  -> rendered (1080p) -> scheduled (in Buffer) -> posted

  pipeline.py pick STATUS            JSON list of slugs with that status and a videos/<slug>/spec.json (max 10)
  pipeline.py set SLUG STATUS        change one post's status
  pipeline.py storyboard             write brain/storyboards/<date>.md (stills + voice lines) for 'drafted' posts, move them to 'storyboard'
  pipeline.py review-body SLUG       text for the owner's review issue
"""
import datetime as dt, json, os, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
PLAN = ROOT / "brain/week-plan.json"
REPO = os.environ.get("GITHUB_REPOSITORY", "subcreatorpaid/subcreator-videos")


def load(): return json.loads(PLAN.read_text())
def save(d): PLAN.write_text(json.dumps(d, indent=2, ensure_ascii=False) + "\n")
def rel(tag, name): return f"https://github.com/{REPO}/releases/download/{tag}/{name}"


def pick(status):
    posts = [p for p in load()["posts"] if p.get("status") == status and (ROOT / "videos" / p["slug"] / "spec.json").exists()]
    return [p["slug"] for p in posts][:10]  # rules.md: max 12 renders a week; the plan has 10 posts


def set_status(slug, status):
    d = load()
    for p in d["posts"]:
        if p["slug"] == slug: p["status"] = status; break
    else: sys.exit(f"{slug} is not in brain/week-plan.json")
    save(d)


def storyboard():
    d = load(); slugs = pick("drafted")
    today = dt.date.today().isoformat()
    out = ROOT / f"brain/storyboards/{today}.md"; out.parent.mkdir(exist_ok=True)
    md = [f"# Storyboard {today} (review, then merge)\n",
          "One still per scene with the line the voice says. **Merging this pull request is your OK to render the 360p review copies** "
          "(nothing is posted). Send notes instead of merging to change a scene.\n"]
    for s in slugs:
        spec = json.loads((ROOT / "videos" / s / "spec.json").read_text())
        post = next(p for p in d["posts"] if p["slug"] == s)
        md += [f"## {post.get('n', '')}. {post.get('title', s)} ({post.get('day', '')}, {post.get('type', '')})", f"`{s}`\n"]
        for i, b in enumerate(spec.get("beats", []), 1):
            md += [f"**Scene {i}** — \"{b.get('say', '')}\"", "", f"![scene {i}]({rel(f'video-{s}-stills', f'{s}_still_{i:02d}.png')})", ""]
        post["status"] = "storyboard"
    if not slugs: return print("no drafted posts with a spec")
    out.write_text("\n".join(md)); save(d); print(f"wrote {out.relative_to(ROOT)} for {len(slugs)} posts")


def review_body(slug):
    p = next(p for p in load()["posts"] if p["slug"] == slug)
    return (f"<!-- slug: {slug} -->\n**{p.get('title', slug)}** — planned {p.get('day')} 18:00 London\n\n"
            f"Watch the 360p copy: {rel(f'video-{slug}-preview', f'{slug}_preview_360p.mp4')}\n"
            f"Releases page: https://github.com/{REPO}/releases/tag/video-{slug}-preview\n\n"
            "**To approve:** add the label `approve-final` to this issue. That renders the 1080p final and schedules it in Buffer "
            "for 18:00 London on the planned day. Without the label nothing is rendered or posted. For changes, comment your notes.")


if __name__ == "__main__":
    c = sys.argv[1:2]
    if c == ["pick"]: print(json.dumps(pick(sys.argv[2])))
    elif c == ["set"]: set_status(sys.argv[2], sys.argv[3])
    elif c == ["storyboard"]: storyboard()
    elif c == ["review-body"]: print(review_body(sys.argv[2]))
    else: print(__doc__)
