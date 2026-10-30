# Accounts and tools (no passwords, ever; passwords live in the owner's Bitwarden)

| Tool | Account | Used for | Notes |
|---|---|---|---|
| Gmail | subcreatorpaid@gmail.com | all sign-ups | 2-step on |
| Email forwarding | hello@subcreatorpaid.com -> Gmail | public contact | Cloudflare Email Routing |
| Instagram / TikTok / YouTube | @subcreatorpaid | posting | via Buffer (free plan, set time zone London) |
| Telegram | t.me/subcreatorpaid | channel | |
| GitHub | subcreatorpaid/subcreator-videos (public since 27 Oct 2026, for free Actions minutes; never commit secrets) | brain, renders, website source | Actions render videos |
| Cloudflare | subcreatorpaid@gmail.com | domain, Pages, Workers AI (binding AI), D1 subcreator-site (binding DB), email routing | project name subcreator-videos |
| Google Search Console | subcreatorpaid account | sitemap submitted 25 Oct | Domain property |
| Bing / IndexNow | key file /27a0f68460bc9be88bdf6cdcf77335a8.txt | submitted 25 Oct | Bing Webmaster account optional |
| beehiiv | subcreatorpaid | newsletter later + partner program | payouts via Dub (owner to add) |
| PartnerStack | subcreatorpaid@gmail.com | Kit + ElevenLabs affiliate | payouts (owner to add) |
| OpusClip | Hammad | affiliate dashboard affiliates.opus.pro | link opus.pro/?via=hammad |
| Skool | subcreatorpaid | affiliate | payouts (owner to add) |
| Fiverr Affiliates | subcreatorpaid@gmail.com | affiliate | owner to log in |
| Kaggle | | free GPU | AI host dropped; unused |
| Gemini API (AI Studio) | | GitHub secret `GEMINI_API_KEY` (never in the repo) | trend scan (`scripts/gemini_draft.py scan`, workflow "Gemini trend scan") and posters (`scripts/gemini_image.py`, workflow "Gemini posters"). Image API may need billing on; see the test in `brain/image-tests/` |
| vidIQ | connector | research, voice | credits reset 14th monthly |
| Bitwarden | owner | passwords | |
