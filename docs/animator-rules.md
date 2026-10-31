# Video standard (owner decision, 31 Oct 2026)
The company-overview film is the standard for every video. It replaces all earlier video style rules (pacing, hook, visual, motion,
look v5, launch-film, motion style, Flow prompt workflow). They stay in git history only. Brand colours, the four-part ending, compliance
and safety are NOT video-style rules and stay in `brain/brand.md` and `brain/rules.md`.

## 1. How a video is made
1. Research: Gemini only does the trend scan (`brain/research/<date>_gemini_scan.md`); Claude reads it and fact-checks.
2. Claude Opus writes the packaging (3 titles, cover idea) and the script, one voice line per scene.
3. **Storyboard sheet** (one still per scene with its voice line, one image) -> owner marks all changes in one message.
4. **360p review render** (`.github/workflows/preview.yml`, spec in `animator/previews/<slug>.json`) -> notes -> re-render at 360p.
5. **1080p final** only after the owner says the review is done. Never 4K. Nothing is posted without his OK.
Videos are built here in the animator (Remotion + Kokoro). No Google Flow, Gemini or other AI video generators.

## 2. The look (reference: `animator/src/flow/Overview.jsx`, spec `"style": "overview"`)
- One continuous take: scenes sit on one canvas and the camera travels between them. Every scene change uses a different transition
  (whip, drop, tilt, pull-back, spin, lime iris wipe), never the same one twice in a row.
- Palette: backdrop `#E3E3DB` (darker than the panels so they never merge), white panels, ink `#0E0E10` for dark scenes, lime `#CDF24F`
  as the only accent. Money = ink text on a lime box. Red only for loss / "The catch".
- Real logos everywhere, with a lime glow and layered shadow for depth. Show the real website with captures of the live site
  (`animator/previews/overview_site/`, taken with `scripts/capture_site.js`), not drawn mock-ups.
- Always moving: springs and staggers, orbiting logos, counters, pulses, bursts, punch zooms on key words, drifting dust.
- Pointer (`Pointer` in Overview.jsx: halo, comet trail, click ripple, label) draws attention; use it to demo real screens.
- Everything centred. Vary examples; do not repeat the same stream or tool scene after scene. No "10k" claims unless the scene is about that fact.

## 3. Technical
- 1080x1920, 30 fps. Instagram safe box: scale 0.7 at x 162, y 262 (centred, clear of the right-hand buttons and the bottom caption);
  `@subcreatorpaid` with the S mark at the top centre for the whole video.
- Voice: Kokoro `am_michael+am_puck`, speed 1.12, gap 0.3. Sound effects per beat (`sfx` list, kinds in `renderer/sfx.py`), music bed ducked under the voice.
- Length: 60 s max for regular videos, 60-90 s bio videos, about 100 s for an overview or tutorial.
- Spec: `animator/previews/<slug>.json` (beats with `say`, `show`, `sfx`; `"preview_res"`); `animator/prep.py` makes the voice and word timings.
- Storyboard stills: `npx remotion still` with estimated word times (no voice needed), saved to the project folder; commit with `[skip ci]` so previews do not render early.

## 4. Always
Every fact from a verified source with the catch stated, pay as a range, affiliate links labelled, the four-part ending from `brain/brand.md`, covers with one clear contrast and 2-4 words that do not repeat the title.
