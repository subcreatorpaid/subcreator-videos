---
name: stream-scriptor
description: Writes a Sub-Creator Paid "Income Stream" short-form script (Reel, TikTok, Short) in the five-beat format with three hook options, audience-gap answers, a follow-up idea, and a render-ready spec.json for the render-reel skill. Use after opportunity-check has verified the stream. Triggers - "script stream", "write the reel for", "income stream script", "make the script", "write a TikTok about", "turn this into a reel".
---

> **Repo note:** where this file disagrees with `brain/` (Drive vs repo files, website hosting, AI host, palette), `brain/` and CLAUDE.md win. Facts library = `site/data/streams/`, links = `site/data/links.json`, learnings = `brain/learnings.md`.


# Stream scriptor

## Input
A verified opportunity (the opportunity-check output or an Opportunity Sheet row) and the stream number. If the stream has not been verified, run opportunity-check first or ask.

## The five beats (20-60 s total, about 75-165 spoken words; short form, 60 s maximum)
1. **Hook (0-3 s)** - the payoff stated first, tied to the core belief ("you don't need 10k"). Specific, no hype.
2. **What it is (3-9 s)** - one plain sentence + a 3-step flow (who -> what -> money).
3. **Proof (9-15 s)** - a real number: requirement, rate or a labelled example with $ maths that adds up.
4. **Who it suits + the catch (15-22 s)** - 3 niches + the honest hurdle.
5. **Share prompt (22-30 s)** - "Send this to a creator friend, and follow for one income stream every day."

Write the climax (the most surprising true fact) first, then build the hook towards it.

## Packaging first (owner rule 29 Oct 2026, full text in `brain/brand.md` "Packaging and hook strategy")
Before the script, output: **3 title options** (under 60 characters, curiosity loop, loss angle or shortcut angle, favourite marked) and the **cover**: one image prompt with conflict or contrast + 2-4 overlay words that never repeat the title.
Script rules: line 1 confirms the exact promise of the title (no intro); line 2 challenges the belief and promises a later payoff; a re-hook line every 10-15 s (one in a 25 s video, three or four in 60 s); payoff + one takeaway + the four-part ending, never "smash like". Put a `[VISUAL: ...]` cue every 2-3 sentences and `[CHECK: claim]` after any unverified figure (never invent stats). Max 60 s.

## Output
0. **Packaging** - titles + cover, as above.
1. **Three hooks** - labelled A (direct claim), B (audience call-out "Under 1,000 followers?"), C (myth-bust "You don't need 10k for this"). Recommend one.
2. **Script** - the five spoken lines.
3. **Audience gaps** - the 3 questions viewers will ask, with one-line answers (use them in the caption or pinned comment).
4. **Follow-up idea** - the deeper next video if this one performs.
5. **Nora line** - if this video is Nora-led, the exact hook line for her Google Vids clip. It must be word-for-word the same as `lines[0]`, because the captions are built from the spec.
6. **spec.json** - render-ready, following this schema exactly (example: render-reel/reference/spec_example.json):
```json
{
  "stream_no": 2, "slug": "stream02_short_name", "brand": "SUB-CREATOR PAID", "handle": "@subcreatorpaid", "series_tag": "<optional, e.g. Reply; default Stream #NN>",
  "lines": ["<5 spoken lines, numbers written as words for the voice>"],
  "captions": ["<same 5 lines with digits and $ for the screen>"],
  "scenes": {
    "hook":  {"line1": "<max 12 chars>", "line2": "<max 12 chars>", "pill": "<max 22 chars>"},
    "what":  {"title": "<name, max 18 chars>", "subtitle": "<max 30 chars>",
              "flow": [{"icon": "person|play|store|link|cart|coin|mail|people", "label": "<max 12>"}, {...}, {...}],
              "chip": "<max 30 chars>"},
    "proof": {"tag": "EXAMPLE ...|PROGRAMME RULES", "title": "<max 22>", "rows": [["label", "value"], ...max 3],
              "money": {"label": "...", "value": 80, "prefix": "$", "decimals": 0}, "chip": "<max 32>"},
    "fit":   {"title": "GREAT FOR", "chips": ["<3 niches, max 10 chars each>"], "catch_title": "THE CATCH",
              "catch_text": "<max 34 chars>", "catch_items": ["<3 short labels>"]},
    "cta":   {"big": "SEND THIS", "sub": "to a creator friend", "pill": "Follow: 1 income stream / day"}
  },
  "audio": {"voice": null}, "nora": {"clip": null, "photo": null},
  "verified_on": "YYYY-MM-DD", "sources": [{"title": "...", "url": "..."}]
}
```

## Comment-reply videos
Same five beats and template. Hook = the viewer's question (`line1`/`line2` short, e.g. "DO I NEED" / "A WEBSITE?"), pill "Viewer question", and set `"series_tag": "Reply"` in the spec. Answer it in beats 2-4 with the same sourcing rules. Never show the commenter's handle without their permission.

## Rules
- Brand voice from subcreator-brain: professional, specific, calm. Never "hack", "quit your job", "bro", emojis, promised earnings, or naming other creators.
- Every number must come from the verified opportunity. Examples say "example" on screen.
- The catch is mandatory.
- `lines` spell numbers as words (for the voice); `captions` use digits and $.
- Respect the character limits so text fits the template (long text wraps, but short reads better). Flows take 2 to 4 steps.
