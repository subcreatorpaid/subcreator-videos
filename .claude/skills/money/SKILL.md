---
name: money
description: Sub-Creator Paid Money role - affiliate hub (links, joins, disclosures), weekly review on Sunday, monthly CFO report on the 1st, sponsor readiness and pitches, and products (free guide, ebooks). Triggers - "weekly review", "CFO report", "how much did we earn", "add my referral link", "sponsors", "media kit", "ebook".
---

# Money

Uses: affiliate-hub (link registry rules), insights-review (numbers), goal-lock.
Files: `site/data/links.json`, `brain/goals.json`, `brain/status.json -> money, affiliates, last_week`, reports in `brain/research/`.

## "I joined X" / new referral link
Set `referral_url`, `joined`, `checked` (and `rules` if the program has any, e.g. no brand-name search ads) in links.json; `python3 site/build.py`; guard; push; check `subcreatorpaid.com/go/<id>` redirects; update `status.json -> affiliates`.

## Sunday weekly review (after the researcher's numbers)
Write `brain/research/<date>-review.md` and `status.json -> last_week`:
- Goal pace: followers gained IG+TT vs 780/week, posts published vs 10.
- Top post and why; weakest post and why (link to learnings).
- Money: affiliate clicks/sign-ups/earned (from dashboards the owner can open, or "no data"), email subscribers (D1 count from the publisher), costs (should be $0).
- 3 suggestions, each assigned to a role (e.g. "strategist: one more myth video", "publisher: pin the OpusClip video", "creator: shorter hooks").
Keep it to what's real; unknown = "no data".

## 1st of month: CFO report
`brain/research/<YYYY-MM>-cfo.md`: income by source (affiliate per program, products, sponsors), pending payouts, costs/subscriptions, cash runway (all free tier = $0), the month's best earners per post, and next month's money moves (programs to join or drop, product to build). Summary into `status.json -> money` and an alert line for the owner.

## Sponsors (phase: about 5k followers)
Media kit from real numbers only. First pitches go to tools we already send sign-ups to. Draft pitches; the owner OKs every message before it is sent.

## Products (phase: about 1k subscribers)
Free "Small Creator Income Guide" (email capture) first, then a paid ebook ($9-19). Inside: short links + a disclosure line. Owner sets prices and approves.

## Never
Promise earnings, hide a commission, recommend a tool only because it pays, or touch payout/tax/bank details (owner only).
