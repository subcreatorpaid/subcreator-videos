---
name: affiliate-hub
description: Runs the Sub-Creator Paid money system - affiliate and referral links, the short-link registry, disclosures, tool videos, the website's tools page, the income tracker, ebooks and sponsor readiness. Triggers - "add my referral link", "I joined [program]", "affiliate links", "tool video", "update the website links", "sign-up answers", "media kit", "sponsor pitch", "how much did links earn".
---

> **Repo note:** where this file disagrees with `brain/` (Drive vs repo files, website hosting, AI host, palette), `brain/` and CLAUDE.md win. Facts library = `site/data/streams/`, links = `site/data/links.json`, learnings = `brain/learnings.md`.


# Affiliate hub

The business: free videos and website pages teach small creators income streams; where a tool genuinely helps, it is linked with the owner's referral link; the free guide grows the email list; paid ebooks and (later) sponsors follow. Trust is the asset: every rule below protects it.

## Where things live
- **Link registry:** `site/data/links.json` in the owner's GitHub repo `subcreator-videos` (if the repo is not connected this session, give the owner the exact JSON edit to paste). One entry per program: `id, name, category, for, official_url, referral_url, earns, source, checked, free_plan, pays_you`.
- **Short links:** `<site>/go/<id>/` redirects to `referral_url`, or to `official_url` until the owner has joined. Always say and write short links, never raw affiliate URLs, so one edit updates every video, caption and ebook.
- **Website:** `site/` (build.py) publishes on GitHub Pages. Stream pages = `site/data/streams/<slug>.json`.
- **Tracker:** the owner's Google Sheet "Affiliate tracker" in Drive folder "Sub-Creator Paid" (columns: Program, Joined, Short link, Clicks, Sign-ups, Earned this month (USD), Paid out, Notes). Create it with the Google Drive connector if missing.

## Tasks
**"I joined X" / "add my link":** set `referral_url` and `checked` in links.json, rebuild/commit, add the row to the tracker, confirm the short link.

**New program:** run opportunity-check on the program's own affiliate/referral page (rate, duration, payout threshold, who it pays for: sign-ups, buyers or brands). Add it only if it is a tool the owner would use and genuinely helps small creators. Mark third-party-sourced terms "confirm on joining".

**Sign-up answer sheet:** for each program the owner will join, write copy-paste answers: channel links, website, audience ("small creators under 10k followers learning income streams"), promotion methods (short-form videos, website guide pages, newsletter; no paid search ads on brand terms, no self-referrals, no coupon sites). The owner creates accounts and passwords; Claude may then open pages in Chrome, fill text fields with permission, and collect the referral links.

**Tool video (30% of the weekly mix):** stream-scriptor format, with: what the tool does for a small creator, one real limitation, a free alternative, CTA "link: <site>/go/<id>". Captions carry the disclosure. Never script a tool the owner hasn't tried or can't show working.

**Ebooks:** free "Small Creator Income Guide" (email capture) -> "UGC Starter Kit" ($9-19) -> "Income Stream Playbook" ($29-49). Inside, link tools with short links and a disclosure line on the first page.

**Sponsor readiness:** monthly snapshot (followers per platform, average views, saves/shares, email subscribers, site visitors, short-link clicks, sign-ups). Media kit from ~5k followers or ~1,000 subscribers. First pitches go to tools the owner already refers sign-ups to ("I've sent you N sign-ups; let's do a paid feature").

## Disclosure (always)
- Video: say "link below is an affiliate link" or show "Affiliate link" on screen when a referral link is the CTA. Sponsored: "Ad"/"Sponsored" label + platform paid-partnership toggle.
- Caption: first line or before the link: "Affiliate link - I may earn a commission at no cost to you."
- Amazon: "As an Amazon Associate I earn from qualifying purchases." Follow each program's own rules on where links may appear (some ban links in emails or PDFs).
- Website footer + "How this site makes money" page (already built).

## Rules
- Recommend free options next to paid ones, even when they pay nothing.
- No tools the owner hasn't used; no crypto, trading, loans, "get paid to watch/chat" schemes, or programs that charge creators upfront.
- Re-check terms every 90 days (update `checked`); programs change rates often.
- Money in USD; label examples as examples; never promise earnings.
