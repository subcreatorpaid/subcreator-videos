#!/usr/bin/env python3
"""The standard "Tools I use" affiliate block for every video's caption/description.

  python3 scripts/tools_block.py            -> print the block
  python3 scripts/tools_block.py --apply    -> add/refresh it in every videos/*/captions.md (Instagram, TikTok, YouTube Shorts)

Built from site/data/links.json: every program with a referral_url (live affiliate) is listed, short /go/ links only,
disclosure first. A tool video's own featured tool is left out of "More tools" (its link + disclosure is already there).
"""
import json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
MARK = "Tools I use (affiliate links"
ORDER = ["opusclip", "elevenlabs", "beehiiv", "skool", "kit", "fiverr", "stan"]


def live():
    progs = [p for p in json.loads((ROOT / "site/data/links.json").read_text())["programs"] if p.get("referral_url")]
    return sorted(progs, key=lambda p: ORDER.index(p["id"]) if p["id"] in ORDER else 99)


def block(skip=None):
    items = " · ".join(f'{p["name"]} subcreatorpaid.com/go/{p["id"]}' for p in live() if p["id"] != skip)
    return (f"{MARK}, I may earn a commission at no cost to you): {items}. "
            "All tools + free guide: subcreatorpaid.com/links")


def apply_to(path):
    t = path.read_text()
    m = re.search(r"subcreatorpaid\.com/go/([a-z0-9-]+)", t) if "_tool_" in path.parent.name else None
    b = block(m.group(1) if m else None)
    lines = [re.sub(r"\s*" + re.escape(MARK) + r".*?subcreatorpaid\.com/links", "", l) for l in t.splitlines()]  # strip old block
    secs, sec = {}, None
    for i, line in enumerate(lines):  # last non-empty line of each target section gets the block (once)
        if line.startswith("## "): sec = line[3:].strip()
        elif sec in ("Instagram", "TikTok", "YouTube Shorts") and line.strip(): secs[sec] = i
    for i in secs.values():
        line = lines[i]; tags = re.search(r"(\s+#\w+)+\s*$", line)
        lines[i] = (line[:tags.start()] + " " + b + line[tags.start():]) if tags else (line.rstrip() + " " + b)
    path.write_text("\n".join(lines) + "\n")


if __name__ == "__main__":
    if "--apply" in sys.argv:
        files = sorted(ROOT.glob("videos/*/captions.md"))
        for f in files: apply_to(f)
        print(f"tools block applied to {len(files)} captions files")
    else:
        print(block())
