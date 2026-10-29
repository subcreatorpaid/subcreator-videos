# Animator rules v4 (applied 26 Oct 2026)

Source: the owner-approved "Editing Optimization: Reference Teardown" doc (https://claude.ai/artifact/XSYVXuCCbfTWsVeFcDuQW4).
These rules apply to every video made with the animator (`animator/`). They replace the older playbook rules where the two
differ (for example, frame 0 is now a complete, readable hook, not motion from empty). Notes from the owner point at a rule
by its number ("break M3 at 0:12"). Frames are at 30 fps. **Enforced** says where the code does it for you.

## P - Pacing
- P1. Something new appears every 2-3 s, but never 2 reveals within 0.5 s of each other.
- P2. Gap between beats 0.25-0.45 s. A "hold" (0.8-1.4 s) only after the 2-3 lines that carry the video (the flip, the money line, the answer). **Enforced:** prep.py clamps `gap` and `hold`; guard warns on more than 3 holds.
- P3. Each beat ends holding on its answer for at least 0.6 s, fully still. **Enforced:** the camera drift stops 18 frames before a beat ends.
- P4. The video ends 0.3-0.5 s after the last word (loop videos: 0.3 s). **Enforced:** prep.py ends 0.3 s after the last word.
- P5. Voice speed 0.95 for explainers. Never above 1.05. **Enforced:** default 0.95, capped at 1.05.

## H - Hook
- H1. Frame 0 shows the full hook graphic AND the hook line as on-screen text, already readable. **Enforced:** beat 1 renders complete on frame 0; its text comes from `show.hook_text` (else the spoken line). `"instant": false` turns this off.
- H2. The hook must make sense on mute in 2 s.
- H3. 3 hook variants as 4 s clips (A: the big number, B: the pain line, C: the question). The owner picks one. **Enforced:** put 3 beats in the spec's `hooks` list; a full render also makes `<slug>_hook_1..3.mp4`.

## V - Visual hierarchy
- V1. One hero element per beat, at least 40% of frame width.
- V2. Green #2E7D4F on ONE element per screen. Captions use ink with green key words, never a green pill on every word.
- V3. Nothing that matters under 22 px. Labels 26 px or more, body 36 px or more, hero 90 px or more.
- V4. Safe zones: nothing below y = 1536, nothing past x = 950, nothing above y = 140. (The top progress bar is gone.)
- V5. Background motion (feeds, grids) at 25% opacity or less, blurred 4 px, still while a hero element enters. **Enforced** in `Feed`; the grid is still.
- V6. Any number or name not from the owner or a verified source shows a small "example" label. **Enforced** on the dashboard and the channel feed (`"example": false` only for real owner numbers).

## T - Text and captions
- T1. Captions: 2-4 words, one style, one position (top edge y = 1380), ink on a soft backing. Only key words turn green: punch words, numbers and prices, plus a beat's `key` list. **Enforced.**
- T2. An element tied to a word starts entering 6-8 frames before the word. **Enforced:** 7 frames (`LEADF`).
- T3. Captions never overlap the hero element. If they would, move the hero up, never the caption.

## M - Motion
- M1. One thing moves at a time; the camera counts. **Enforced:** no drift during a beat's first 14 frames, no decor that moves on its own.
- M2. Ease-in-out (cubic) for every move. No bounce, overshoot or shake. **Enforced:** `ease()` replaces every spring.
- M3. Small reveals 6-9 frames; cards and big moves 10-14; transitions 7-9. **Enforced:** 8 / 12 / 8.
- M4. One slow drift per beat (at most 3%). Punch-ins only on the 3-4 most important words (at most +5%, 12 frames, no shake). **Enforced:** prep.py keeps the first 4 `punch` words.
- M5. Transitions only BETWEEN beats (whip or blur), alternating direction. **Enforced.**
- M6. Every animation proves the line (strike on "not", cards on "three", count on a number). If it doesn't, cut it.

## A - Audio
- A1. Mix at -14 LUFS integrated, true peak -1 dB, 10 ms fades on every voice clip. **Enforced** in prep.py.
- A2. Music 18-22 dB under the voice, ducked a further 4 dB while the voice speaks. **Enforced:** 20 dB + 4 dB.
- A3. SFX on about half the animations: swoosh = beat change, tick = small reveal, low hit = the main punch word only (`main_punch`, else the first). SFX peak 12 dB or more under the voice. **Enforced.**
- A4. One riser (0.8 s) only into the biggest reveal, ending on its word: `"riser": true` on that beat.

## W - Workflow
- W1. Beat table first (line, seconds, graphic, hero, trigger word, hold, SFX). Wait for the owner's OK.
- W2. Stills next: Actions > "Animate video" > mode `stills` gives one frame per beat at its answer moment. Wait for the OK.
- W3. Review render at 360p (mode `preview`, owner rule 29 Oct 2026): 2 self-review passes on the contact sheet against these rules, fix, re-preview, then send it to the owner. Repeat for every round of notes. The final 1080p render (mode `full`, video + 3 hook clips) runs ONCE, only after the owner OKs the last preview. Never 4K.
- W4. On a change, check only the changed beats with stills, never a whole new render.
- W5. Every owner note becomes a numbered rule here. Never "make it better": say what and by how much.
- W6. Deliver: the MP4, the 3 hook clips, the contact sheet, the cue sheet (`<slug>_cue.md`) and every choice made without asking.

## C - Cover / thumbnail (owner rule, 26 Oct 2026)
- C1. Every video ships with a cover: the `Thumb` composition, set by `"thumb"` in the spec (headline, hero: phone | dashboard | strike, chip). Both workflow modes render it as `<slug>_thumbnail.png`.
- C2. Headline 2-5 words at 120 px or more, one green focal word, plus one hero visual and one short chip. Everything that matters sits inside the centre 4:5 crop (y 285-1635) so the Instagram grid shows it.
- C3. Same off-white grid, ink, one green as the videos, so the profile grid looks like one brand. Invented numbers carry "example".
- C4. Review: check it at phone-grid size (about 360 px wide) for readability, then score it with vidIQ `vidiq_score_thumbnail` when the credit budget allows (10 or more credits).

## S - Style by topic type (owner rule, 26 Oct 2026)
Pick the beat types from the topic type, keep every rule above. Tag each idea with its type in the beat table.
| Topic type | Main beat types | Feel |
|---|---|---|
| Income stream | phone_ad, rate, platforms, samples | steady, confident |
| Myth-buster | dashboard ($0), statement + strike, versus, stat | punchy flip, one riser into the big reveal |
| How-to | flow, samples, features | calmer, more holds, built for saves |
| Tool video | shot / phone_ad of the tool, features (one real limit), stack (free vs paid) | demo pace, "Affiliate link" on screen |
| Warning | features (x rows), stamp | serious, quieter music |
| Comparison | versus, stack | quick alternation between the two sides |
| Proof | shot with real public-page screenshots + step tracker | slower so people can read |
Every week, compare saves and shares per topic type and shift the mix toward what works.

## L - Look v5 (owner ask, 29 Oct 2026, from 5 reference reels)
Default for `"style": "story"` videos; `"look": "v4"` in the spec brings back the old full-frame layout with bottom subtitles.
Taken from the reels (layout and motion ideas only, no copied content): one centred hero card, the spoken line built word by
word above it, a dark spotlight flip for the catch, a mono kicker and a progress tracker.
- L1. The scene plays inside ONE white stage card (x 108-972, y 430-1480, radius 56, soft shadow, never a hard edge). Scenes are
  drawn at 0.8 scale from source y 120. The card gets a slow 1.2% push per beat that stops 18 frames before the beat ends (M4, P3).
- L2. Headline above the card replaces the bottom subtitles: up to 7 words, each word fades/blurs in 3 frames before it is
  spoken; words two places back turn grey. Money words get a green box, loss words a red box, ALL-CAPS comment keywords an ink box.
- L3. Kicker at y 128: `// <spec title>` in mono with a green dot. Beat tracker (one segment per beat) at y 1508; handle at y 1580.
- L4. Background: 60 px grid fading out from the centre. Catch / warning beats (`"type": "catch"` or `"dark": true`) flip the
  page to ink with a warm light cone and a red glow around the card; the card stays white.
- L5. Brand stays: off-white, ink, green only for money, red for loss, the same face, real logos, soft glows.

## F - Flow / launch film (owner pick, 29 Oct 2026) - the current default look
Built from the owner's animation prompts (launch-film prompt). Code: `animator/src/flow/` (kit.jsx motion helpers, art.jsx
drawn elements + `BrandLogo`, brandlogos.js, Launch.jsx). Spec `"style": "launch"`; preview with `.github/workflows/preview.yml`
(`"preview_res": 720`). Reference render: `/mnt/project-files/05-style-and-voice/flow-720p/flow_launch_finder_general_720p.mp4`.
- F1. One continuous take, no cuts or fades: each scene grows out of the last (composer -> bubble -> finder ring -> lime flood ->
  result cards -> chat -> button expands into the page -> route -> brand mark).
- F2. One palette: off-white `#F5F5F2`, ink `#0E0E10`, lime `#CDF24F`. Money = ink text on a lime box. Red only on "The catch".
  No rainbow, blue, orange or green fills. Real logos keep their own colours.
- F3. Real logos on every tile, card and chip (simple-icons + program logo files); never letters.
- F4. Always moving: drifting lime dust, spring pop-ins, live counters (followers, n/16), spinner + orbiting tiles, card tilt +
  shine, pulse rings, lime bursts on money and best match, small punch zooms (+3.5%) on key words, gentle camera sway.
- F5. Fast: voice speed 1.12, gap 0.25, short lines (about 25 s for 6 beats); moves 8-12 frames, typing ~2 chars a frame.
- F6. Instagram safe area: the film plays in a box scaled 0.7 at (92, 262) so nothing sits under the right-side buttons or the
  bottom name/caption; `@subcreatorpaid` with the S mark sits at the top centre (y ~170) for the whole video.
- F7. General audience: no niche persona unless the topic needs one ("I post Reels and TikToks, 600 followers").
