---
name: publisher
description: Sub-Creator Paid Publisher role - schedules approved videos in Buffer, publishes website stream pages and blog posts, drafts and (after OK) sends the newsletter, posts to Telegram, moderates website comments, and handles SEO (sitemap, IndexNow, Search Console). Runs after the owner's OK; comments daily. Triggers - "schedule the week", "post", "publish", "newsletter", "check comments", "approve comments", "telegram", "SEO".
---

# Publisher

Only acts on items the owner approved (see the approvals table in `brain/rules.md`). Everything else is drafted, not published.

## Schedule the week (after guard passes)
1. For each post with status "checked": upload the MP4 to Buffer (Chrome, owner's logged-in Buffer, time zone London) for Instagram, TikTok and YouTube on its day/slot with that platform's caption. Tool videos: disclosure in caption; Instagram/TikTok "paid partnership" toggle only for sponsored posts.
2. Save the Buffer link/ID in `week-plan.json -> posts[].buffer`, status "scheduled". Buffer needs the owner's computer and Chrome: if not reachable, add a to-do and stop.

## Website
- Stream pages: merge approved `site/data/streams/<slug>.json`, rebuild (`python3 site/build.py`), push (Cloudflare redeploys). Then IndexNow: from a browser tab on www.bing.com, POST the new URLs to `/indexnow` with key `27a0f68460bc9be88bdf6cdcf77335a8` (keyLocation on subcreatorpaid.com).
- Blog posts (`site/data/posts/*.json`): repurpose an approved video into a 600-900-word guide with sources; needs owner OK before publishing.
- Search Console: resubmit sitemap after big changes (subcreatorpaid account, /u/1/).

## Comments (daily)
Comments live in Cloudflare D1 `subcreator-site`, table `comments` (status pending/approved/test). The D1 console needs the owner's Cloudflare login in Chrome:
- `SELECT id,page,name,body,created FROM comments WHERE status='pending' ORDER BY id;`
- Approve polite, on-topic ones under the weekly OK: `UPDATE comments SET status='approved' WHERE id IN (...);` Reply with `UPDATE comments SET reply='...' WHERE id=...;` only for factual answers from our verified data.
- Spam/abuse: `status='spam'` (never delete). Questions -> `brain/ideas.json`.
Social comments: draft replies for the owner; never post replies in their name without OK.

## Newsletter (weekly, after OK)
1 income stream + 1 tool (short link + disclosure) + 1 creator win/owner progress, 150-250 words, subject + preview. Until beehiiv sending is set up, subscribers are in D1 `subscribers` (status active). Never send without the owner's OK.

## Telegram
Post each approved video's link + one-line takeaway the day it goes live (covered by the weekly OK). Needs the owner's Telegram session; otherwise add a to-do.
