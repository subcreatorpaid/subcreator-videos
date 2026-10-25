---
name: weekly-batch
description: Runs the whole Sub-Creator Paid week in one go - picks and verifies income streams and tools, writes 10 posts' scripts and render plans, website pages, captions with disclosures and the newsletter, then sends videos to the GitHub renderer, with approval stops. Also what the Sunday scheduled task runs. Triggers - "run the week", "weekly batch", "plan this week's content", "make next week's posts", "Sunday batch", "batch 10 posts".
---

> **Repo note:** where this file disagrees with `brain/` (Drive vs repo files, website hosting, AI host, palette), `brain/` and CLAUDE.md win. Facts library = `site/data/streams/`, links = `site/data/links.json`, learnings = `brain/learnings.md`.


# Weekly batch

Produces the week's 10 posts plus the website pages and newsletter that turn views into income.
Uses: subcreator-brain, goal-lock, opportunity-check, stream-scriptor, render-reel (editing playbook), platform-pack, affiliate-hub, insights-review.

## The week's mix (10 posts, 60 / 30 / 10)
| # | Type |
|---|---|
| 6 | **Value** - income streams, myths, how-tos (grow followers). Continue the Stream #NN numbering from the Opportunity Sheet. |
| 3 | **Tool videos** - a tool small creators need, shown working, with an honest limit and a free alternative; CTA = short link `<site>/go/<id>` (affiliate-hub). Prefer programs the owner has joined (referral_url set). |
| 1 | **Proof** - the owner's own numbers, an experiment, a viewer win, or a comment reply. |
Pick from the "100 Video Ideas" doc first (its "Ideas that pay you when creators sign up" section for tool videos), then new finds.

## Stages - stop for approval after each (unless running unattended)
1. **Learn** - read the "What works" doc (insights-review) and last week's tracker numbers (affiliate-hub). Check `vidiq_balance` only if a vidIQ voice is planned.
2. **Pick** - shortlist 12-14: unused ideas + opportunity-check "find new streams" (include new AI tool creator/affiliate programs). goal-lock each. Keep 10 in the 6/3/1 mix. **Stop: show the list.**
3. **Verify** - opportunity-check every pick not verified in the last 30 days (AI tools get the scam checks). Drop Low confidence.
4. **Script** - stream-scriptor, then turn each into a list-format render plan (render-reel `render_list.py` spec: beats with `say` + `show`, best-fit beat types per reference/editing-playbook.md, `audio: {"engine": "kokoro"}` by default). **Stop: show hooks + scripts in one compact table.**
5. **Website** - for every income stream video, write `site/data/streams/<slug>.json` (what it is, followers, pay, steps, catch, great for, tool ids, sources, checked date). New tools go into `site/data/links.json` (affiliate-hub).
6. **Render** - if the GitHub repo `subcreator-videos` is connected: commit `videos/<slug>/spec.json` (+ screenshots in `assets/`, public pages only) and the site files; GitHub renders and publishes. Otherwise render here with render-reel (`--stills` first) or hand the owner the folders to upload. Check frames.
7. **Pack** - platform-pack for every post, with the disclosure line on tool videos and short links (never raw affiliate URLs).
8. **Newsletter** - draft the weekly issue: 1 income stream + 1 tool (short link + disclosure) + 1 creator win or the owner's progress, 150-250 words, subject line + preview text.
9. **Update** - Opportunity Sheet status ("Scripted"/"Posted"); affiliate tracker rows for new links.
10. **Deliver** - posting calendar (day, slot, platform, file, caption block), the newsletter draft, and what the owner must do (approve, schedule, send).

## Unattended mode (scheduled task)
Nobody can approve, so: do stages 1-5, 7 and 8 and write everything into one review document (Claude Docs, titled "Week of <date> - review"); say at the top which choices were made and why. Do not spend vidIQ credits, commit to GitHub, publish, post or email anything. The owner approves next session ("approve the week") and stage 6 runs then.

## Rules
- Never script an unverified stream or a tool the owner hasn't used.
- 10 posts maximum; quality beats volume. Keep the series numbering continuous.
- Every affiliate CTA is disclosed. No crypto, trading, loans or get-rich-quick framing.
- Say clearly if any video used the fallback voice.
