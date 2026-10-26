---
name: creator
description: Sub-Creator Paid Creator role - scripts, render specs (editor v4), screenshots, renders on GitHub Actions, covers/thumbnails and platform captions for the week's posts. Drafts on Sunday; commits and renders only after the owner's "approve the week". Triggers - "write the scripts", "make the videos", "render", "approve the week", "captions", "thumbnail".
---

# Creator

Input: `brain/week-plan.json`, `brain/brand.md`, facts in `site/data/streams/` + `site/data/links.json`.
Uses: stream-scriptor (scripts), render-reel (spec format; read `.claude/skills/render-reel/reference/editing-playbook.md` before any spec), platform-pack (captions), affiliate-hub (tool-video rules).

**Every script ends with the 4-part ending in `brain/brand.md` (comment KEYWORD for the related ebook, the website, the related affiliate tool, follow).** **New videos use the animator** (`animator/`, `"renderer": "animator"` in the spec) and follow **`docs/animator-rules.md`** (rules v4, owner said "apply the rules" on 26 Oct 2026): beat table, then stills, then render; 3 hooks in `hooks`; at most 4 `punch` words; holds only on 2-3 key lines; `hook_text` for frame 0. Base sample: `videos/20261029_ugc_animated`. The old kinetic-text renderer is retired for new work.

## Stage A - Sunday drafts (unattended OK)
For each post in week-plan (status "drafted"):
1. Script: 3 hooks (from strategist) + spoken lines (`say`), 35-60 s, one idea per line, the catch stated, CTA per brand.md. Tool videos: what it does for a small creator, one real limit, a free alternative, "link in bio / subcreatorpaid.com/go/<id>", "Affiliate link" on screen.
2. Render plan (score it with `python3 scripts/virality.py videos/<slug>`; aim 75+): list-video spec (`audio: {"engine": "kokoro"}`), best-fit beat types from the playbook, v4 styles where they help. Slug `YYYYMMDD_<short-name>`.
3. Website data for income-stream posts: `site/data/streams/<slug>.json` draft (what, followers, pay, steps, catch, great_for, tools, sources, checked).
4. Captions per platform (Instagram, TikTok, YouTube Shorts title+description, LinkedIn/Facebook optional) with the disclosure line on tool videos and short links only. Every video gets the "Tools I use" affiliate block in IG, TikTok and YouTube: run `python3 scripts/tools_block.py --apply` after writing captions.md (see platform-pack).
5. Put everything into ONE Claude Docs doc "Week of <date> - review" (summary first, then the 10-post table, then each post). Save its link in `week-plan.json -> review_doc`; set status "drafted". Do NOT commit specs or render yet.

## Stage B - after the owner says "approve the week" (or approves single posts)
1. Write `videos/<slug>/spec.json` and the stream JSON files. Page images: list public pages under `"snaps"` (GitHub captures them; renderer/snap.py). Sites that block bots (Google support, Spotify newsroom, ftc.gov) get a labelled source card instead: `python3 renderer/source_card.py videos/<slug>/assets/x.png --site ... --title ... --fact ... --hl N --checked "<date>"` (committed to assets/).
2. Run `python3 scripts/virality.py` (aim for PASS 75+; under 60 blocks) and `python3 scripts/guard.py --strict`; fix every error and most FIX notes.
3. Commit + push -> `.github/workflows/render.yml` renders with Kokoro and publishes MP4s on the repo's Releases page (~8 min per batch). Watch with `gh api "repos/subcreatorpaid/subcreator-videos/actions/workflows/render.yml/runs?per_page=1" --jq '.workflow_runs[]|[.status,.conclusion,.created_at,.html_url]|@tsv'` (use `gh api` REST only; GraphQL-based gh commands are blocked in Claude sessions).
4. Download each MP4 (`gh api repos/subcreatorpaid/subcreator-videos/releases/latest` -> asset `browser_download_url`, download with `gh api` + `-H 'Accept: application/octet-stream'`), check 3 frames per video (hook, middle, end) for typos, overlaps, cut-off text, wrong facts. Re-render if needed.
5. Captions + MP4 links into `brain/week-plan.json` (status "rendered", `release_url`). Hand to guard -> publisher.

## Rules
Never script an unverified stream or a tool not in links.json. Never change palette/fonts per video. No real people's photos, no other channels' branding. Say if a fallback voice was used.
