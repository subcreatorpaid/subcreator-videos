# Weekly pipeline (runs on GitHub, no Claude needed)

| Step | Workflow | Trigger | Owner action |
|---|---|---|---|
| 1 Drafts + storyboard | `weekly.yml` | Sundays 07:00 UTC or Run workflow | **Merge the PR** (= OK for 360p previews) |
| 2 360p previews + review issues | `on-merge.yml` | PR merge (branch `gemini/*-weekly-*`) | **Add label `approve-final`** to a "Review: <slug>" issue |
| 3 1080p final + Buffer 18:00 London | `approve.yml` | label by the repo owner only | none |
| 5 Stats report | `stats.yml` | Mondays 08:00 UTC | none (routine) |

Post status in `brain/week-plan.json`: `drafted` (spec ready) -> `storyboard` -> `previewed` -> `rendered` -> `scheduled` -> `posted`.
The creator thread's only weekly job: write `videos/<slug>/spec.json` + `captions.md` for each post and set it to `drafted`.
Test Buffer without posting: Actions > "Approved final" > Run workflow > slug + dry_run on (post must be `rendered`).

## Secrets (GitHub > Settings > Secrets and variables > Actions; never paste in chat)
- `BUFFER_TOKEN` (secret): Buffer API key. Variable `BUFFER_CHANNELS`: `{"instagram":"<id>","tiktok":"<id>","youtube":"<id>"}`.
- Stats, all optional (missing = "not connected"): `YT_API_KEY`, `CF_API_TOKEN` (read), `CF_ACCOUNT_ID`, `CF_D1_ID`, `CF_WA_SITE_TAG`, `IG_TOKEN`, `IG_USER_ID`, `TG_BOT_TOKEN`. TikTok: enter by hand in `brain/goals.json`.
- Settings > Actions > General: allow Actions to create pull requests (already needed for Gemini).

## Known limits
Buffer's API platform options (Instagram reel type, YouTube title/category, TikTok AI label) are not set by the script; check the first
scheduled post in Buffer. Buffer wants a direct public video URL; the release download URL redirects, so test one video first.
