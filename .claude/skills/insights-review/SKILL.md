---
name: insights-review
description: Reviews last week's Sub-Creator Paid performance from pasted Instagram/TikTok/YouTube/LinkedIn/Facebook insights or screenshots, finds what worked (hooks, topics, formats), flags follow-up opportunities, turns viewer comments into next week's ideas, and updates the "What works" notes. Triggers - "review last week", "insights review", "how did my posts do", "analyse my stats", "what should I post more of", "this video blew up", "follow-up for this".
---

> **Repo note:** where this file disagrees with `brain/` (Drive vs repo files, website hosting, AI host, palette), `brain/` and CLAUDE.md win. Facts library = `site/data/streams/`, links = `site/data/links.json`, learnings = `brain/learnings.md`.


# Insights review

## Input
Any of: pasted numbers, screenshots of insights, a CSV export, and/or a list of comments.

## Metrics that matter (in this order)
1. **Sends/shares per reach** - strongest signal for reaching non-followers.
2. **Average watch time and completion rate** (or 3-second hold).
3. **Saves.**
4. **Follows from the post** - the 90-day goal.
Likes and raw views are secondary.

## Steps
1. Build a table: post, platform, hook style (A direct / B call-out / C myth-bust), topic, reach, sends, saves, watch %, follows.
2. Compare each post with the account's average. Mark winners (well above average on sends or watch time) and losers.
3. Find patterns: which hook style, topic type, length and posting time won.
4. **Follow-ups** - for each winner, propose the deeper next video (same stream, one level deeper, or the next obvious question) to post within 48 hours.
5. **Comments to content** - group viewer questions; the most common becomes the comment-reply Reel; others become FAQ carousel slides.
6. **Goal progress** - followers gained on Instagram + TikTok vs the 10,000-in-90-days pace (about 780 a week).
7. Update the "What works" doc in the owner's Drive folder "Sub-Creator Paid" (Google Drive connector; if unavailable, output the updated text for the owner to paste): max 10 bullet rules, newest evidence first, each with its date and the posts that support it. weekly-batch reads this doc every week.

## Output
- One-line verdict on goal pace.
- The table (short).
- 3-5 "What works" rules for next week.
- Follow-up ideas and the comment-reply pick.

## Rules
- Don't over-read one week; call a pattern only when 2+ posts agree.
- Never invent numbers; if a metric is missing, say so.
