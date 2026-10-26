#!/usr/bin/env python3
"""Virality pre-check: scores every video spec against the patterns shared by top Shorts
(docs/channel-study.md + editing-playbook v4). Free, no AI needed.

  python3 scripts/virality.py                 # score all videos/*/spec.json
  python3 scripts/virality.py videos/<slug>   # one video
Used by scripts/guard.py: a score under 60 is an error (blocks release), 60-74 a warning.

What it checks (100 points):
  hook 30   first beat is a hook, short spoken line, max 3 short on-screen lines, one *ACCENT* word, payoff box
  pace 25   a new visual element every ~2-4 s (beats x items), no screen with too many words
  length 15 35-55 s is the sweet spot for this channel's Shorts
  action 20 ends with a share / save / comment / follow ask (sends are the strongest reach signal)
  loop 10   final line short enough to loop back into the hook; no dead air beats
Speaking rate for the Kokoro voice at speed 1.0 is taken as 2.6 words per second.
"""
import json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
WPS = 2.6
ELEM_KEYS = ("items", "steps", "cards", "to", "rows", "lines", "bullets")


def words(s):
    return len(re.findall(r"[A-Za-z0-9$%']+", s or ""))


def screen_text(show):
    out = []
    for k, v in show.items():
        if k in ("type", "style", "image", "images", "letter", "transition", "step", "step_labels", "marks", "icon", "device"):
            continue
        if isinstance(v, str):
            out.append(v)
        elif isinstance(v, list):
            for x in v:
                if isinstance(x, str): out.append(x)
                elif isinstance(x, list): out += [y for y in x if isinstance(y, str) and len(y) > 1]
                elif isinstance(x, dict): out += [y for y in x.values() if isinstance(y, str)]
        elif isinstance(v, dict):
            out += [y for y in v.values() if isinstance(y, str)]
    return " ".join(out)


def score(spec):
    beats = spec.get("beats", [])
    notes, pts = [], {}
    if not beats:
        return 0, ["no beats"], {}
    # hook
    h = 0; first = beats[0]; fs = first.get("show", {})
    visual_hook = fs.get("type") in ("dashboard",)   # animator v2: a moving visual hook replaces the text lines
    if fs.get("type") == "hook" or visual_hook: h += 8
    else: notes.append("hook: first beat should be a hook")
    fw = words(first.get("say"))
    h += 8 if fw <= 14 else 4 if fw <= 20 else 0
    if fw > 14: notes.append(f"hook: spoken line is {fw} words (aim for 14 or fewer)")
    lines = fs.get("lines", [])
    if visual_hook:
        h += 10 if first.get("punch") else 6
        if not first.get("punch"): notes.append("hook: add a punch word (camera hit) to the first beat")
    elif lines and len(lines) <= 3 and all(len(re.sub(r"\*", "", l)) <= 30 for l in lines): h += 6
    elif lines: notes.append("hook: keep to 3 lines of 30 characters or fewer")
    if not visual_hook:
        if any("*" in l for l in lines): h += 4
        else: notes.append("hook: mark one *ACCENT* word")
        if len(lines) >= 2: h += 4
    pts["hook"] = h
    # pace
    total_w = sum(words(b.get("say")) for b in beats); dur = total_w / WPS
    secs_per = []
    crowded = 0
    for b in beats:
        sh = b.get("show", {})
        n = 1 + sum(len(sh.get(k) or []) for k in ELEM_KEYS if isinstance(sh.get(k), list))
        n += 1 if sh.get("highlight") else 0
        n += sum(1 for k in sh if k == "word" or k.endswith("_word")) + len(b.get("punch", []))  # animator: word-triggered reveals
        secs_per.append(words(b.get("say")) / WPS / max(1, n))
        if words(screen_text(sh)) > 22: crowded += 1
    slow = [i + 1 for i, s in enumerate(secs_per) if s > 4.5]
    p = 25 - 4 * len(slow) - 3 * crowded
    if slow: notes.append(f"pace: beats {slow} hold one visual for more than 4.5 s; split them or add items")
    if crowded: notes.append(f"pace: {crowded} screen(s) with more than 22 words on screen")
    pts["pace"] = max(0, p)
    # length
    pts["length"] = 15 if 30 <= dur <= 55 else 10 if 25 <= dur <= 65 else 4
    if not 30 <= dur <= 55: notes.append(f"length: about {dur:.0f} s (sweet spot 30-55 s)")
    # action
    tail = " ".join(b.get("say", "") for b in beats[-2:]).lower()
    kinds = {b.get("show", {}).get("type") for b in beats[-2:]}
    a = 0
    if re.search(r"\b(send|share)\b", tail): a += 8
    if re.search(r"\b(save)\b", tail): a += 6
    if re.search(r"\b(comment)\b", tail): a += 6
    if re.search(r"\bfollow\b", tail) or kinds & {"follow", "save", "comment_cta", "book_cta", "caption_cta"}: a += 6
    pts["action"] = min(20, a)
    if a < 12: notes.append("action: end with a clear send/save/comment ask plus follow")
    # loop
    last_w = words(beats[-1].get("say"))
    lp = 10 if last_w <= 22 else 6 if last_w <= 30 else 2
    if any(not b.get("say", "").strip() for b in beats): lp -= 4; notes.append("loop: silent beat (dead air)")
    if last_w > 22: notes.append(f"loop: last line is {last_w} words; shorter endings loop better")
    pts["loop"] = max(0, lp)
    return sum(pts.values()), notes, {"duration_s": round(dur), **pts}


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("-")]
    paths = [pathlib.Path(a) / "spec.json" if pathlib.Path(a).is_dir() else pathlib.Path(a) for a in args] or \
        sorted(p for p in (ROOT / "videos").glob("*/spec.json") if not p.parent.name.startswith("_"))
    for p in paths:
        s, notes, parts = score(json.loads(p.read_text()))
        verdict = "PASS" if s >= 75 else "FIX" if s >= 60 else "BLOCK"
        print(f"{verdict} {s:3d}/100  {p.parent.name}  {parts}")
        for n in notes: print("       -", n)


if __name__ == "__main__":
    main()
