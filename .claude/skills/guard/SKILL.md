---
name: guard
description: Sub-Creator Paid Guard role - release checks before anything ships (facts, disclosures, brand never-list, spelling), website tester, security watch and affiliate-link checks. A GitHub Action checks the live site daily; this role reads it and runs the full checklist before every release. Triggers - "check before posting", "guard", "is this compliant", "test the website", "check links", "security check".
---

# Guard

Code does the checks; Claude judges what code can't. Nothing ships with an open error.

## Automatic (no Claude needed)
- `.github/workflows/guard.yml` runs daily 06:30 UTC and on every push: builds the site, runs `python3 scripts/guard.py --strict --live`, and fails (GitHub emails the owner) on any error.
- `scripts/guard.py` checks: brain JSON files parse; week-plan/status fields; every `links.json` program has official_url + earns + checked, referral URLs are https and not raw-pasted into videos/captions; streams have sources + checked within 30 days; specs in `videos/` have no never-list words, no emojis in `say`/on-screen text, tool videos carry an "affiliate" disclosure; site builds; virality score per video (`scripts/virality.py`: under 60 = error, 60-74 = warning); with `--live`: key pages 200, `/go/<id>` redirects to the right target, security headers present, `/api/finder` answers.

## Daily (inside the daily run)
Read the latest guard run: `gh api "repos/subcreatorpaid/subcreator-videos/actions/workflows/guard.yml/runs?per_page=1" --jq '.workflow_runs[]|[.status,.conclusion,.created_at,.html_url]|@tsv'`. If it failed, open the log (`gh api repos/subcreatorpaid/subcreator-videos/actions/runs/<id>/jobs` then the job's `logs` URL), fix what's safe (typos, broken fallback links), else add an alert to `brain/status.json`.

## Before every release (creator stage B, publisher)
1. `python3 scripts/guard.py --strict` passes.
2. Read each script/caption against `brain/brand.md` "Before anything ships" + `brain/rules.md` compliance: facts match the source (open it if checked > 30 days), pay is a range/example, catch stated, disclosure present on tool videos, no promised earnings, no real people, no other brands' logos beyond fair-use screenshots of their public pages.
3. Check 3 frames per MP4 (hook, middle, end): readable, nothing cut off, spelling.
4. Set posts to status "checked" in `brain/week-plan.json` or list the blockers in `status.json -> alerts`.

## Security watch
- No secrets in the repo (`guard.py` scans for key-like strings). Site headers (CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy) present.
- Functions: inputs validated, honeypots + rate limits on subscribe/comments; AI output never shows $ figures except from verified data.
- Dependencies: only the site build runs on Cloudflare; renderer deps stay in GitHub Actions.
- Flag (don't change) anything needing account/DNS/security settings; the owner does those.
