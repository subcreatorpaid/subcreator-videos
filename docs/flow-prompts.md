# Flow prompt workflow (owner idea, 30 Oct 2026)
Cheapest route to premium motion: Claude writes the script and the exact prompts, the owner generates posters and clips in Google Flow (his Google Pro, no extra credits), Claude checks them and does the edit. Examples live in `/mnt/project-files/05-style-and-voice/motion-sample/` (FLOW_PACK_finder_launch.md, FLOW_IMAGE_PROMPTS_*.md, FLOW_CLIP_PROMPTS_*.md, FLOW_TYPO_PROMPTS_*.md, PROJECT_NOTES_*.md).

## Steps (one thread per video)
1. Script from a fact-checked source (`videos/*/spec.json` or a `brain/` draft). Claude Opus writes new scripts; Gemini does the trend scan only.
2. Scene table: time, voice line, on-screen words (1-4 per scene), hero object, motion, SFX.
3. IMAGE prompts, one per scene, 9:16, self-contained, and they carry ALL typography: every word spelled out, real brand names for logos, positions, colours, the exact brand look. Format: `[HEADER] [STYLE] <scene content list>` (see FLOW_IMAGE_PROMPTS_finder_launch_full.md). Ask for 3 variants.
4. Owner sends the posters. Claude reviews each against the checks below and lists what to regenerate (optional).
5. CLIP prompts (Frames to Video, audio OFF), one per poster, tailored to the actual image: "Keep this poster exactly, including all text and logos, add no new text", then the animation (spring overshoot, staggers, camera push 3-4%, heavy ease-out), then "last 0.6 s hold completely still". 3-6 s each.
6. Owner sends the clips. Claude edits (script `scripts/flow_edit_finder.py` is the model): per-beat timing from `animator/prep.py` (Kokoro voice + music + SFX in public/voice.wav), clips in the Instagram safe-area box (0.7 at 92,262), @subcreatorpaid + S mark on top, 0.15 s fades, speed or freeze clips to fit each beat.
7. 360p review (never 1080p first). Notes in one message. Final 1080p only after the last OK, never 4K.

## 3D accents (owner, 30 Oct 2026; rules D1-D4 in docs/animator-rules.md)
Mark 20-30% of the object scenes as 3D (never two in a row, never typography scenes). Image prompt adds: "3D render, soft matte clay and glossy plastic, rounded bevelled edges, 3/4 isometric view, soft studio light, soft contact shadow, same off-white grid background, only white, ink and lime #CDF24F; the headline stays flat 2D text". Clip prompt adds: "slow 3D orbit 10-15 degrees / object turns on its axis, text and logos stay sharp and never warp".

## Poster / clip checks
- Brand: bg #F5F5F2, ink #0E0E10, lime exactly #CDF24F (soft yellow-green; Flow drifts to neon, say "never neon"), red #E5484D only for loss/the catch, Inter-style bold sans, no serif, no dark theme, no wood/photo backgrounds, no hand-drawn doodle style.
- Text spelled exactly as the script; logos correct (if wrong, swap in the real file in the edit); top 8% reserved for our header, nothing important in the bottom 20%.
- Clips: no new text, logos not smeared during fast motion (ask "tiles stay still"), nothing painted over text (ripples), hold at the end.
- Facts: only figures from verified scripts; no `[CHECK:` markers.
