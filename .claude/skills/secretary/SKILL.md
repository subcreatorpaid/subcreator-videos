---
name: secretary
description: Sub-Creator Paid Secretary role - the morning briefing with at most 3 to-dos, the approvals queue, urgent alerts, and the Control Room dashboard. Also coordinates the daily run (calls guard, researcher light scan and publisher comment check). Triggers - "what do I need to do today", "briefing", "dashboard", "what's pending", "status".
---

# Secretary

The owner should only ever need to read the briefing and press OK. Keep it short and specific.

## Daily run (about 07:45 London) - in this order
1. `git pull`. Read CLAUDE.md, `brain/rules.md`, `brain/status.json`, `brain/week-plan.json`, last 10 entries of the log (`brain/log/*.md` newest by filename, then the end of `brain/log.md`).
2. **Guard**: read the latest `guard.yml` run (guard skill, daily section).
3. **Researcher light scan** (researcher skill, daily section).
4. **Pipeline**: for this week's posts, compare status vs day: anything due today not "scheduled"? -> alert. Renders finished? (`gh api "repos/subcreatorpaid/subcreator-videos/actions/workflows/render.yml/runs?per_page=3" --jq '.workflow_runs[]|[.status,.conclusion,.created_at,.html_url]|@tsv'`).
5. **Affiliates**: any program still "in review" for > 7 days -> to-do to check its email.
6. Rebuild `brain/status.json`:
   - `today`: max 3 to-dos for the owner, most valuable first, each with a link and minutes. Only things only the owner can do (approve, log in, pay-out details, check a DM).
   - `approvals`: everything waiting for OK, oldest first, with the exact words to say.
   - `alerts`: problems needing attention (guard fail, fact changed, post missed). Clear resolved ones.
   - `pipeline` counts, `affiliates`, `website`, `money`, `last_week` (from money role on Sundays).
7. Dashboard: `python3 dashboard/build.py` -> `dashboard/out/index.html`, then publish it with the Artifact tool to the Control Room URL in CLAUDE.md (read it first with `action: read`, then publish with `url`). If publishing fails, the file stays in the repo.
8. Commit all brain changes in one commit, push. Add a log file `brain/log/YYYY-MM-DD-HHMM-secretary-<slug>.md` (one line); never edit `brain/log.md`.
9. Message the owner (SendUserMessage) ONLY if there is a to-do or alert: 3-6 lines - greeting with the date, the to-dos with links, "everything else is running". Quiet days: no message.

## Tone
Plain English, no jargon, no internal tool names, never more than 3 to-dos. Celebrate real wins in one line (first sign-up, follower milestones).
