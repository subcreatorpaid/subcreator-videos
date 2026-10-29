#!/usr/bin/env python3
"""Schedule one approved, rendered video in Buffer for 18:00 London (Buffer GraphQL API, https://developers.buffer.com).

  python3 scripts/buffer_schedule.py SLUG [--dry-run]

Secrets/variables (GitHub Settings > Secrets and variables > Actions; never paste them in chat):
  BUFFER_TOKEN     Buffer API key (secret)
  BUFFER_CHANNELS  JSON {"instagram": "<channelId>", "tiktok": "<channelId>", "youtube": "<channelId>"} (variable); leave a service out to skip it
Caption per service comes from videos/<slug>/captions.md ("## Instagram", "## TikTok", "## YouTube" sections). The video is the
public release file video-<slug>-animated. Stops if the post is not 'rendered' in brain/week-plan.json or guard.py fails.
"""
import datetime as dt, json, os, pathlib, re, subprocess, sys, urllib.request
from zoneinfo import ZoneInfo

ROOT = pathlib.Path(__file__).resolve().parent.parent
REPO = os.environ.get("GITHUB_REPOSITORY", "subcreatorpaid/subcreator-videos")


def gql(query):
    req = urllib.request.Request("https://api.buffer.com", json.dumps({"query": query}).encode(), method="POST",
                                 headers={"Content-Type": "application/json", "Authorization": "Bearer " + os.environ["BUFFER_TOKEN"]})
    with urllib.request.urlopen(req, timeout=60) as r: return json.load(r)


def captions(slug):
    text = (ROOT / "videos" / slug / "captions.md").read_text()
    return {m.group(1).strip().lower(): m.group(2).strip() for m in re.finditer(r"^## ([^\n]+)\n(.*?)(?=^## |\Z)", text, re.M | re.S)}


def due(day):
    d = dt.datetime.combine(dt.date.fromisoformat(day), dt.time(18, 0), ZoneInfo("Europe/London"))
    if d <= dt.datetime.now(ZoneInfo("Europe/London")) + dt.timedelta(minutes=10):
        sys.exit(f"{day} 18:00 London has passed: change the day in brain/week-plan.json and re-run")
    return d.astimezone(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")


def main(slug, dry):
    plan = json.loads((ROOT / "brain/week-plan.json").read_text())
    post = next((p for p in plan["posts"] if p["slug"] == slug), None)
    if not post or post.get("status") != "rendered": sys.exit(f"{slug} must be 'rendered' in brain/week-plan.json (is {post and post.get('status')})")
    if subprocess.run([sys.executable, str(ROOT / "scripts/guard.py"), "--strict"]).returncode: sys.exit("guard failed: not scheduling")
    url = f"https://github.com/{REPO}/releases/download/video-{slug}-animated/{slug}_animated.mp4"
    when, caps, chans = due(post["day"]), captions(slug), json.loads(os.environ.get("BUFFER_CHANNELS") or "{}")
    if not chans: sys.exit("BUFFER_CHANNELS is empty")
    for svc, cid in chans.items():
        text = next((v for k, v in caps.items() if k.startswith(svc.lower())), None)  # "YouTube Shorts" matches youtube
        if not text: print(f"skip {svc}: no '## {svc}' section in captions.md"); continue
        q = ("mutation { createPost(input: { text: %s, channelId: %s, schedulingType: automatic, mode: customScheduled, dueAt: %s, "
             "assets: [{ video: { url: %s } }] }) { ... on PostActionSuccess { post { id dueAt } } ... on MutationError { message } } }"
             % (json.dumps(text), json.dumps(cid), json.dumps(when), json.dumps(url)))
        if dry: print(f"[dry run] {svc} at {when}: {text[:60]!r}... video {url}"); continue
        res = gql(q); print(svc, json.dumps(res)[:300])
        if res.get("errors") or "message" in (res.get("data", {}).get("createPost") or {}): sys.exit(f"Buffer refused {svc}: {res}")
    if not dry:
        post["status"] = "scheduled"; post["buffer"] = f"scheduled {when} via API"
        (ROOT / "brain/week-plan.json").write_text(json.dumps(plan, indent=2, ensure_ascii=False) + "\n")


if __name__ == "__main__":
    main(sys.argv[1], "--dry-run" in sys.argv)
