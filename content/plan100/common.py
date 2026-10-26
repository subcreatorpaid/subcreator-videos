"""Shared builder for the 100-video plan (26 Oct 2026, owner request).

Each batch file lists videos as dicts; build(v) writes:
  videos/<slug>/spec.json      story-style animator spec (Michael+Puck voice), 3 hooks
  videos/<slug>/captions.md    IG / TikTok / YouTube captions with disclosure + cross-platform line
  videos/<slug>/guide.json     the viewer guide (rendered to PDF by scripts/make_video_guides.py)
and returns a plan row for content/plan100/plan.json.
Facts must come from brain/research/2026-10-26_facts_100.md or site/data/streams/*.json.
"""
import json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parents[2]
TOOLS_LINE = ("Tools I use (affiliate links, I may earn a commission at no cost to you): OpusClip subcreatorpaid.com/go/opusclip · ElevenLabs subcreatorpaid.com/go/elevenlabs · "
              "beehiiv subcreatorpaid.com/go/beehiiv · Skool subcreatorpaid.com/go/skool. All tools + free guide: subcreatorpaid.com/links")
FINDER = "Not sure which stream fits you? Try the free AI Income Finder: subcreatorpaid.com/#finder"

AFF = {  # affiliate program shown in the video's tool row and the guide: name, commission, sign-up page, our status
    "beehiiv": ("beehiiv", "50-60% of what they pay for 12 months", "https://www.beehiiv.com/partners", "joined"),
    "kit": ("Kit", "50% of their first 12 months", "https://kit.com/affiliate", "to join"),
    "skool": ("Skool", "40% of their Skool fee while they stay", "https://www.skool.com/settings?t=referrals", "joined"),
    "elevenlabs": ("ElevenLabs", "22% of their payments for 12 months", "https://elevenlabs.io/affiliate", "joined"),
    "opusclip": ("OpusClip", "25% of their payments (at least year one)", "https://www.opus.pro/affiliate", "joined"),
    "vidiq": ("vidIQ", "15-25% lifetime recurring (by sales tier)", "https://support.vidiq.com/en/articles/7866006", "to join"),
    "riverside": ("Riverside", "up to 20% per subscription", "https://riverside.com/affiliate-program", "to join"),
    "kajabi": ("Kajabi", "10-20% recurring (tiered)", "https://kajabi.com/partners", "to join"),
    "printify": ("Printify", "5% of product price for 12 months", "https://help.printify.com/hc/en-us/articles/4483629612817", "to join"),
    "submagic": ("Submagic", "30% recurring", "https://www.submagic.co/affiliate", "to join"),
    "fiverr": ("Fiverr", "25% of a new buyer's first order + 10% for 12 months", "https://affiliates.fiverr.com", "waiting for owner login"),
    "stan": ("Stan Store", "20% recurring (confirm on joining)", "https://stan.store/affiliates", "to join"),
    "descript": ("Descript", "commission via PartnerStack (rate shown after approval)", "https://www.descript.com/affiliate", "to join"),
    "amazon": ("Amazon Associates", "category rates (most about 3-4.5%)", "https://affiliate-program.amazon.com", "to join"),
}


def B(say, show, sfx=None):
    return {"say": say, "show": show, "sfx": sfx or [[0, "whip"]]}


def end(keyword, guide, tool=None, spoken=None):
    sp = spoken or keyword.lower()
    tl = f"{AFF[tool][0]} is linked in my bio." if tool else "Tools I use are in my bio."
    return B(f"Comment [{keyword}|{sp}] for the free guide, or try the free AI income finder on [subcreatorpaid.com|sub creator paid dot com]. {tl} Follow for more.",
             {"type": "end_rows", "guide": guide, "keyword": keyword, "tool": AFF[tool][0] if tool else None},
             [["comment", "pop"], ["subcreatorpaid", "pop"], ["linked" if tool else "tools", "pop"], ["follow", "pop"]])


def build(v):
    slug = v["slug"]; d = ROOT / "videos" / slug; d.mkdir(parents=True, exist_ok=True)
    beats = v["beats"] + [end(v["keyword"], v["guide"]["title"], v.get("tool"), v.get("kw_spoken"))]
    hooks = []
    for i, (label, say, bi) in enumerate(v["hooks"]):
        hooks.append({"label": label, "say": say, "show": dict(beats[bi]["show"]), "sfx": [[0, "whip"], [0.6, "pop"]]})
    spec = {"renderer": "animator", "brand": "SUB-CREATOR PAID", "handle": "@subcreatorpaid", "style": "story",
            "audio": {"engine": "kokoro", "kokoro_voice": "am_michael+am_puck", "speed": 1.1}, "gap": 0.25, "slug": slug,
            "title": v["title"], "type": v["type"], "format": v.get("format", ""), "beats": beats, "hooks": hooks,
            "sources": [{"title": t, "url": u} for t, u in v["sources"]], "thumb": v["thumb"], "finder_stream": v.get("stream")}
    (d / "spec.json").write_text(json.dumps(spec, indent=1, ensure_ascii=False))
    tool = v.get("tool")
    aff = f"\n\nThe tool from this video: {AFF[tool][0]} subcreatorpaid.com/go/{tool} (affiliate link, I may earn a commission at no cost to you)." if tool else ""
    body, tags = v["caption"], v.get("tags", "#smallcreator #creatoreconomy")
    cta = f"Comment {v['keyword']} for the free guide, or get it at subcreatorpaid.com/guide. {FINDER}"
    src = "Sources: " + "; ".join(u for _, u in v["sources"])
    (d / "captions.md").write_text(f"""# {v['title']}

Story-style review render. Not scheduled; needs owner OK.

## Instagram
{body}{aff}

{cta} Also on TikTok + YouTube: @subcreatorpaid {TOOLS_LINE} {tags}

## TikTok
{body}{aff}

{cta} More on IG + YouTube: @subcreatorpaid {TOOLS_LINE} {tags}

## YouTube Shorts
Title: {v['title']}
{body}{aff}

{cta} Instagram + TikTok: @subcreatorpaid {TOOLS_LINE}

{src}
""")
    g = dict(v["guide"]); g["keyword"] = v["keyword"]; g["sources"] = v["sources"]; g["video"] = v["title"]
    g["tool"] = ({"id": tool, "name": AFF[tool][0], "earns": AFF[tool][1], "signup": AFF[tool][2], "status": AFF[tool][3]} if tool else None)
    (d / "guide.json").write_text(json.dumps(g, indent=1, ensure_ascii=False))
    return {"n": v["n"], "slug": slug, "title": v["title"], "type": v["type"], "keyword": v["keyword"], "tool": tool,
            "affiliate": g["tool"], "stream": v.get("stream"), "beats": len(beats), "words": sum(len(b["say"].split()) for b in beats)}


# every timing word used by a scene or a sound must be spoken in that beat, or the animation fires at the wrong time
def spoken(say):
    say = re.sub(r"\[([^|\]]+)\|[^\]]+\]", r"\1", say)
    return [re.sub(r"[^\w$.%'-]", "", x).lower().strip(".") for x in say.split()]
def keys(o, out):
    if isinstance(o, list):
        if o and isinstance(o[0], str) and len(o) > 1: out.append(o[0])
        for x in o: keys(x, out)
    elif isinstance(o, dict):
        if "cols" in o:  # compare table: only each row's first item is a timing word
            out += [r[0] for r in o.get("rows", [])]; out += [o[k] for k in ("best_word",) if o.get(k)]; return
        for k, x in o.items():
            if k.endswith("_word") and isinstance(x, str): out.append(x)
            elif k not in ("cols", "chips_text"): keys(x, out)
def check(rows):
    """Every timing word used by a scene or a sound must be spoken in that beat, or the animation fires at the wrong time."""
    bad = []
    for r in rows:
        for i, b in enumerate(json.load(open(ROOT / "videos" / r["slug"] / "spec.json"))["beats"]):
            ws = spoken(b["say"]); ks = []; keys(b["show"], ks); ks += [s[0] for s in b["sfx"] if isinstance(s[0], str)]
            for k in ks:
                if k.startswith("_"): continue  # shown from the start of the beat on purpose
                k2 = k.lower().strip(".")
                if not any(w == k2 or w.startswith(k2) for w in ws): bad.append((r["slug"], i + 1, k))
    return bad
