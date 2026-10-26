---
name: platform-pack
description: Writes the posting pack for one Sub-Creator Paid video across Instagram, TikTok, YouTube Shorts, Facebook and LinkedIn - captions, titles, hashtags, alt text, pinned comment and calls to action, each native to its platform. Triggers - "pack stream", "write the captions", "caption and CTA", "posting pack", "titles and hashtags", "write the LinkedIn post", "caption for all platforms".
---

> **Repo note:** where this file disagrees with `brain/` (Drive vs repo files, website hosting, AI host, palette), `brain/` and CLAUDE.md win. Facts library = `site/data/streams/`, links = `site/data/links.json`, learnings = `brain/learnings.md`.


# Platform pack

## Input
The final script (or spec.json) and the verified sources for one video.

## Output - one block per platform, ready to paste

**Instagram (Reel + carousel)**
- First line: keyword-led statement (what people search, e.g. "How small creators get paid with Amazon Associates").
- 3-5 short lines expanding the point, the catch included.
- CTA: one per video: "Comment GUIDE for the free income streams guide" (only when the ManyChat auto-DM is live), or the short link "<site>/go/<id>" for tool videos, or "Send this to a creator friend".
- 3-5 hashtags (mix of broad and niche: #smallcreator #ugccreator #creatoreconomy ...).
- Alt text for the cover (one sentence).
- Pinned comment: the source line ("Rules checked [date]: [programme page]").

**TikTok**
- One punchy line + the catch in a second line. 3-5 hashtags. CTA: "Follow for one income stream a day."
- On-screen keyword suggestion for TikTok search.

**YouTube Shorts**
- Title under 60 characters, keyword first, no clickbait the video doesn't deliver.
- 2-3 line description with the source link and #Shorts. CTA: "Subscribe for the full series."

**Facebook**
- Short plain caption, 1-2 hashtags, CTA: "Share this with a creator who needs it."

**LinkedIn**
- Professional text post, 5-8 short lines: a lesson about the creator economy, the facts, the catch, and a question to drive comments. No hashtag spam (max 3). Framing: earning from content as a skill, not a side hustle.

**Newsletter blurb** (for the weekly issue)
- 2-3 sentences + the short link. Tool items carry "(affiliate link)".

**Disclosure** (tool videos and any affiliate CTA)
- Caption line before the link: "Affiliate link - I may earn a commission at no cost to you." Amazon links: "As an Amazon Associate I earn from qualifying purchases."
- Use short links (<site>/go/<id>) from affiliate-hub, never raw affiliate URLs.

**Tools I use block** (EVERY video, owner rule 26 Oct 2026)
- Instagram caption, TikTok caption and YouTube Shorts description all end with the standard block (before hashtags):
  "Tools I use (affiliate links, I may earn a commission at no cost to you): OpusClip subcreatorpaid.com/go/opusclip · ... All tools + free guide: subcreatorpaid.com/links"
- Never type it by hand: write captions.md, then run `python3 scripts/tools_block.py --apply` (built from links.json, so newly approved programs like Kit or Fiverr appear automatically; a tool video's own tool is left out of the list because its link is already in the caption). Guard warns if a caption is missing it.
- Links in Shorts descriptions and IG/TikTok captions are not clickable, so keep them short and typable; the clickable route is subcreatorpaid.com/links in each bio and the YouTube channel links.

**Labels checklist** (state yes/no for this video)
- AI label needed (Nora appears)?  #ad / paid-partnership label needed (affiliate link, sponsor, gift)?

## Rules
- Brand voice: professional, specific, calm. Never "hack", "quit your job", "bro", emojis, promised earnings, naming other creators.
- No emojis in on-screen text. In captions, default to none (the owner can allow them).
- Use the same facts as the video - no new claims without a source.
- Money in USD.
