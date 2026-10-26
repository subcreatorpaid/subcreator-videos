# Sub-Creator Paid: the brain

This repo is the single source of truth for the Sub-Creator Paid business. Every session and every scheduled run starts here.
Read this file, then `brain/rules.md`, then the role skill you were asked to run (`.claude/skills/<role>/SKILL.md`).

## The business in one paragraph
Sub-Creator Paid (@subcreatorpaid on Instagram, TikTok, YouTube, plus Telegram t.me/subcreatorpaid and the website https://subcreatorpaid.com)
teaches creators with under 10k followers which income streams really pay, with verified USD figures and the catch.
Money comes from: affiliate links to creator tools (`/go/<id>` short links), the email list (free guide, newsletter), later ebooks and sponsors.
The owner (Hammad) only reviews and presses OK. The team below does everything else.

## Goal
10,000 followers across Instagram + TikTok in 90 days (from 25 Oct 2026, about 780/week), at 10 posts a week (6 value / 3 tool / 1 proof).
Secondary: email subscribers, affiliate sign-ups, first $ earned. Live numbers: `brain/goals.json`.

## The team (role skills in `.claude/skills/`)
| Role | Job | When it runs |
|---|---|---|
| researcher | trends, competitors, new programs, fact checks, performance numbers | daily light scan (in the daily run), full on Sunday |
| strategist | picks the week's 10 posts, hooks, monthly 4-week plan | Sunday, 1st of month |
| creator | scripts, render specs, renders on GitHub, captions, thumbnails | Sunday (drafts); renders after owner OK |
| publisher | Buffer scheduling, website pages, newsletter, Telegram, comments | after owner OK; comments daily |
| guard | release checks, compliance, website + security + affiliate-link checks | daily (GitHub Action + daily run), before every release |
| money | affiliate hub, weekly review, monthly CFO report, sponsors, products | Sunday review, 1st of month CFO |
| secretary | daily briefing (max 3 to-dos), dashboard, approvals queue, alerts | every morning |

Hand-offs always go through files in `brain/` (never "remember it"): researcher -> `brain/research/` -> strategist -> `brain/week-plan.json`
-> creator -> `videos/<slug>/` -> guard -> secretary (approvals in `brain/status.json`) -> owner OK -> publisher.

## Where everything lives
| What | Where |
|---|---|
| Brand voice, visuals, never-list | `brain/brand.md` |
| Approvals, safety, compliance rules | `brain/rules.md` |
| Goal + latest numbers | `brain/goals.json` |
| This week's plan and status of each post | `brain/week-plan.json` |
| Idea queue (from comments, research, outliers) | `brain/ideas.json` (+ Claude Docs "20 Best Video Ideas" (top 20 trending, in make order): https://claude.ai/artifact/SvJ9VwDfNZFKjpde1LyeqQ) |
| What works (learned rules) | `brain/learnings.md` |
| Dashboard data, to-dos, approvals queue | `brain/status.json` -> rendered by `dashboard/build.py` -> Control Room artifact https://claude.ai/artifact/2LBTT8WvBgQ4pf3iYLZ55v |
| Run log (one line per run) | `brain/log.md` |
| Accounts and tools (no passwords ever) | `brain/accounts.md` |
| Verified income streams (facts library) | `site/data/streams/*.json` |
| Free guide (PDF lead magnet) | `scripts/make_guide.py` -> `site/files/small-creator-income-guide.pdf` (rebuild after fact changes; monthly run) |
| Link-in-bio page (all profiles) | https://subcreatorpaid.com/links/ (built by `site/build.py`) |
| Affiliate programs + referral links | `site/data/links.json` |
| Videos (spec + assets; pushing renders them) | `videos/<slug>/spec.json`; renderer in `renderer/`; workflow `.github/workflows/render.yml` |
| New videos (animator) and its rules | `animator/` + `docs/animator-rules.md` (rules v4); workflow `.github/workflows/animate.yml` (mode stills or full) |
| Website (Cloudflare Pages, builds on every push to main) | `site/build.py`, `functions/api/*` (finder, subscribe, comments on D1) |
| Checks | `scripts/guard.py` (local) and `.github/workflows/guard.yml` (daily live check) |
| Project history | Claude Docs "Project Summary": https://claude.ai/artifact/LJVKULTZrQCh2xTWuVdfh6 |

## How every run behaves
1. Pull latest (`git pull`), read this file + `brain/rules.md` + `brain/status.json`.
2. Do only your role's job. Write results into `brain/` files, not chat.
3. Run `python3 scripts/guard.py` before committing. Commit with a clear message ending in the attribution lines from the session, push to main.
   Every push to main redeploys the website, so batch all of a run's edits into one commit.
4. Append one line to `brain/log.md`: `YYYY-MM-DD HH:MM | role | what was done | what needs the owner`.
5. If something needs the owner, add it to `status.json -> approvals` (max 3 to-dos a day in `today`), never ping for routine work.
6. Unattended runs never: post, publish videos, send email, accept terms, create accounts, enter passwords/payment/tax details,
   change DNS or security settings, spend vidIQ credits beyond the budget in `brain/rules.md`, or delete data.

## Current state (keep this short; secretary updates it)
- Website live on subcreatorpaid.com (AI finder on Workers AI, email list + comments on D1 `subcreator-site`, IndexNow done, Search Console verified).
- Affiliates live: beehiiv, OpusClip, ElevenLabs, Skool. Kit in review. Fiverr waiting for owner login/approval. Stan later.
- No AI host (owner decision 25 Oct). Videos = kinetic text, Kokoro voice, editor v4.
- Week of 26 Oct CANCELLED by owner (26 Oct): do not post, schedule or re-render those videos. Everything is remade with the animator (`animator/`, base sample `videos/20261029_ugc_animated`), following `docs/animator-rules.md` (applied 26 Oct). WAIT for the owner's next instruction before making new videos.
