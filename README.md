# Sub-Creator Paid — video factory

Free, automatic video rendering for @subcreatorpaid. You (or Claude) add a video plan, and GitHub renders the
finished 1080x1920 MP4 for free, with voice, music, sound effects and the channel's editing style.

## How it works
1. Each video is a folder in `videos/` with a `spec.json` (the plan: what is said + what is shown) and an
   optional `assets/` folder for screenshots.
2. When you upload or change a video folder, GitHub Actions renders it automatically (about 5-10 minutes).
3. Download the result from **Releases** (right side of the repo page; easiest on a phone) or
   **Actions → the latest run → Artifacts**.

Cost: $0. GitHub gives free accounts over 33 hours of Actions time a month for private repos (unlimited for
public repos); one video takes about 5-10 minutes. The voice is Kokoro, a free open-source voice that runs
inside the workflow, so no vidIQ credits are needed.

## The website (free on GitHub Pages)
`site/` builds the website: one page per income stream, a best-tools page, a free income tracker, the guide
sign-up, and the disclosure and privacy pages. It republishes itself whenever `site/` changes.
- One-time: **Settings → Pages → Source: GitHub Actions**. Your site appears at `https://<username>.github.io/subcreator-videos/`.
- **Your referral links live in one file: `site/data/links.json`.** When you join a program, paste your link
  into its `referral_url`. Every short link (`/go/stan/`, `/go/beehiiv/` …) on the site, in captions and in
  ebooks then points to it. Until then they point to the program's normal page.
- New income stream page: add a file to `site/data/streams/` (copy an existing one).
- Newsletter: when beehiiv or Kit is set up, paste its sign-up page link into `site/data/config.json` →
  `newsletter_form_url`. Own domain: put it in `custom_domain` and point the domain at GitHub Pages.

## Make a new video
- Ask Claude: "write the spec for Stream #03 about <topic>" and upload the folder it gives you, **or**
- Copy `videos/_template` to a new folder (e.g. `videos/stream03_name`), edit `spec.json`, add screenshots
  to `assets/`, and commit. Folders that start with `_` are never rendered.

Re-render anything: **Actions → Render videos → Run workflow** (type folder names, or leave `all`).

## Voice options (in spec.json → "audio")
| Option | Setting | Cost |
|---|---|---|
| Free Kokoro voice (default) | `{"engine": "kokoro", "kokoro_voice": "af_heart", "speed": 1.0}` | free |
| Your own recording / vidIQ MP3 | `{"voice": "voice.mp3"}` and put the file in the video folder; read each `say` line with a short pause between | free / vidIQ credits |
Other Kokoro voices to try: `af_bella`, `af_nicole`, `bf_emma` (British), `am_michael` (male).
If the run summary says FALLBACK VOICE, the free voice failed to load and a robotic backup was used.

## What's inside
- `renderer/render_list.py` — the editor (beat types, transitions, camera, sound events)
- `renderer/sfx.py` — synthesised sound effects (typewriter, pops, swipes, zips, glass, page turn, whooshes)
- `renderer/tts.py` — free Kokoro voice
- `renderer/render_reel.py` — shared helpers (palette, fonts, music bed, voice splitting)
- `docs/editing-playbook.md` — the editing rules and which beat type fits which line
- `fonts/` — Inter (SIL Open Font License)

## Run it on your own computer instead (optional)
Install Python 3.11+ and ffmpeg, then:
```
pip install -r requirements.txt
mkdir models   # download kokoro-v1.0.onnx and voices-v1.0.bin into it (links in renderer/tts.py)
python renderer/render_list.py videos/stream01_ugc/spec.json out/stream01_ugc
```
Add `--stills` for a quick one-frame-per-beat preview.
