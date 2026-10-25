---
name: opportunity-check
description: Researches and verifies a creator income stream or tool program (UGC, affiliate and referral programmes, AI tool creator programs, creator funds, platform payouts, brand programmes, digital products) before Sub-Creator Paid makes content about it, and records it in the Opportunity Sheet. Triggers - "verify [stream]", "opportunity check", "is this real", "check this programme", "research income stream", "find new income streams", "new AI tools that pay", "does X have an affiliate program", "what changed for creator payouts".
---

> **Repo note:** where this file disagrees with `brain/` (Drive vs repo files, website hosting, AI host, palette), `brain/` and CLAUDE.md win. Facts library = `site/data/streams/`, links = `site/data/links.json`, learnings = `brain/learnings.md`.


# Opportunity check

Nothing gets scripted until it passes this check. Accuracy is the channel's edge.

## Input
A stream name ("TikTok Shop affiliate"), a link, a pasted announcement, or "find N new streams".

## Steps
1. **Search** the web for the stream. Prefer the official programme page, help centre or terms first; then reputable reporting from the last 12 months. Open (fetch) every page you take a fact from - a search snippet is not a source.
2. **Extract** these fields, each tied to a source:
   - what it is (one plain sentence)
   - followers needed (number, "none", or "not published")
   - typical pay in USD as a range, or one clearly labelled worked example
   - requirements (age, country, account type, approval, minimum sales)
   - the catch (the real downside or hurdle)
   - countries where it is available, if limited
   - great for (2-3 creator niches)
   - recent changes (rate cuts, new rules) in the last 12 months
   - referral program for the owner: does the tool pay when a creator signs up through a link? rate, duration, payout threshold, who it pays for (sign-ups, buyers or brands), restrictions (no paid ads, no email/PDF links). Source it like any other fact.
3. **Grade** confidence: High (official source, current) / Medium (reputable secondary, recent) / Low (old, single or unclear source).
4. **Record** the row in the Opportunity Sheet in the owner's Drive folder "Sub-Creator Paid" (Google Drive connector) with today's date. If the connector is unavailable, output the row as CSV for the owner to paste.

## AI tools and new programs - extra checks (all must pass, or READY TO SCRIPT: No)
- A real company: named team or company page, terms of service, and a working product the owner could try.
- Evidence it has actually paid creators (official payout docs, partner platform such as PartnerStack/Impact/Rewardful/FirstPromoter, or reputable reports). Brand-new programs = Medium at best.
- No upfront fee to join, no crypto-only payouts, no "get paid to chat/watch/click", no recruitment-based (MLM) earnings.
- Data or voice licensing: say exactly what rights the creator gives away.

## For "find N new streams"
Search for new or changed creator payout programmes, brand programmes, affiliate/referral programmes and AI tool creator programs from the last 30 days. Return a ranked shortlist (newest and most send-able first), each run through steps 1-3.

## Output
```
STREAM: <name>       CONFIDENCE: High/Medium/Low       VERIFIED: <YYYY-MM-DD>
What it is:        ...
Followers needed:  ...
Typical pay (USD): ...
Requirements:      ...
The catch:         ...
Available in:      ...
Great for:         ...
Recent changes:    ...
Referral program:  <rate, duration, who it pays for> or None
Sources: [title](url) · [title](url)
READY TO SCRIPT: Yes / No - <reason>
```

## Rules
- Low confidence = READY TO SCRIPT: No. Say what is missing.
- Never present an estimate as a fact. Label examples as examples.
- Pay figures in USD; convert and say "approximately" if the source uses another currency.
- Do not cover trading, crypto, investment or loan products.
- If programme rules differ by country, say which country the facts are for.
