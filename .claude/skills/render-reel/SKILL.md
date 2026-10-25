---
name: render-reel
description: Renders a Sub-Creator Paid income-stream video (1080x1920 MP4 with voice, music, sound effects and captions), a cover, a 5-slide 4:5 carousel (PNG + PDF for LinkedIn) and the weekly roundup carousel, and splits one batched voiceover into per-video files, in the brand template. Triggers - "render stream", "render the reel", "make the video", "build the carousel", "make the cover", "roundup carousel", "split the voiceover", "render this spec".
---

> **In the subcreator-videos repo:** `scripts/` = `renderer/`, fonts are in `fonts/`, examples in `reference/`. Where this file disagrees with `brain/` (palette, AI host, hosting), `brain/` wins.


# Render reel

## Needs
- If this session has no code workspace (no shell), do not try to render: return the finished spec.json and say it needs a session with code tools.
- A code workspace with Python 3, Pillow, NumPy, SciPy and ffmpeg (ffmpeg with the built-in "flite" voice is used only as a fallback). Install missing Python packages with pip.
- `spec.json` from the stream-scriptor skill (schema and example: reference/spec_example.json).
- Optional voice file: the 5 lines read in order with a clear pause between lines (vidIQ voiceover, an ElevenLabs file or the owner's own recording). Set `audio.voice` to its path. Without it a basic robotic fallback voice is used - always say so.
- Optional Nora (Google Vids AI avatar), three modes:
  - **Talking (best):** `nora.talking` = ONE clip of Nora reading all 5 lines, with a short pause between lines. She opens and closes the video full-screen and talks in a live bubble over the cards in scenes 2-4. Her audio is the voice, so no vidIQ voiceover is needed. Clip must be under 60 s (the Vids avatar limit) and her words must match `lines` (captions come from the spec).
  - **Hook only:** `nora.clip` = a clip of her saying `lines[0]` only; the voice file then holds lines 2-5.
  - **Photo:** `nora.photo` = a still of her for a static bubble.
  - Vertical (9:16) or landscape (16:9) clips both work: landscape is shown as a full-width band over a blurred copy. Every Nora render saves `<slug>_nora_crop_check.png`; look at it, and if the red square misses her face set `nora.face_box` = [x, y, size] (1080x1920 coordinates) and re-render.

## Run
```bash
python3 scripts/render_reel.py spec.json out/            # video + cover + carousel
python3 scripts/render_reel.py spec.json out/ --stills   # quick preview: cover + carousel only
python3 scripts/render_reel.py --split-voice week.mp3 a.json b.json c.json   # one voiceover -> one voice file per spec
python3 scripts/render_reel.py --roundup roundup.json out/                    # weekly roundup carousel
python3 scripts/render_list.py list.json out/            # "Top 3" list video (kinetic text, no presenter, ~60 s)
python3 scripts/render_list.py list.json out/ --stills   # preview one frame per beat
```

### "Top 3" list videos (render_list.py)
Format and editing modelled on a 650K-view Short: hook, then First / Second / Third (each: title card, bullets or statement, feature rows), then a "Comment KEYWORD" guide mockup and a follow beat. Editing: the camera opens on a close-up of the dashed grid and pulls back; words rise in light grey and darken as they are spoken; `*WORD*` accent words get their own big uppercase line; the hook's last line is a black highlight box that wipes in; title cards are "First" + big uppercase name + a 3D-tilted card sliding up; bullets sit beside a phone mockup (marked "Example"); feature rows sit under a tilted site card; punch-zoom, blur-whip and in-place cuts between beats (override per beat with `"transition": "zoom" | "blur" | "cut"`); tilted book for the comment CTA; bouncing logo on the follow beat; handle as a faint watermark. No top bar or progress bar. **Before writing a list spec, read reference/editing-playbook.md** (15-Short channel study: the 12 rules and which beat type fits which line). Beat types: hook (style stack / sandwich / scatter), title_card (badge + screenshot), shot, statement (+ highlight box), features (+ heading, x icons), bullets, stat (count-up), stack (fee/price cards + node timeline), fanout, flow, orbit, save, book_cta, follow - or `"type": "auto"` to let the renderer pick the best fit. Transitions: zoom, blur, cut, whip, shatter. v4 (3-profile Instagram study): chart, converge and comment_cta beat types; on shot beats `"style": "brutal"`, `marks`, `callout`, `sticker`; `headline` (left-aligned, green accent words) and `step` (01 02 03 tracker) on any beat; `strike` on statements - see the v4 table in reference/editing-playbook.md. Real screenshots go in `assets/` next to the spec (public pages only, captured in the owner's Chrome). Full example with assets: reference/list_v3_example/. Sound design is automatic (scripts/sfx.py, all synthesised): every element logs its own sound while the video renders - typewriter keys as plain words appear, a thud on big accent words, swipe on highlight boxes, zip as lines draw, pop on badges/pills/icons, card slap on stacked cards, ticking on count-ups, glass on shatter, page turn when the book opens, whip/whoosh/swoosh on transitions, click on the save beat. Set `"sfx_level"` in the spec (default 1.0) to make them quieter or louder. `"intro"` on a badge title card replaces "First is" (e.g. "It's called"). `_render.json` lists how many of each sound were used. Spec: `beats` = [{"say": spoken line, "show": {...}}]. One vidIQ voiceover with each "say" as its own paragraph; the renderer finds each line by its pauses. Only use the "Comment KEYWORD" beat once the guide exists and a DM automation is set up.
Outputs in `out/`: `<slug>.mp4`, `<slug>_cover.png`, `<slug>_carousel_1..5.png`, `<slug>_carousel.pdf` (upload to LinkedIn as a document), `<slug>_carousel_preview.png`, `<slug>_render.json` (duration, scene timings, whether the fallback voice was used). Roundup: `<slug>_1..N.png`, `<slug>.pdf`, `<slug>_preview.png` (example input: reference/roundup_example.json).

Long text wraps onto two lines automatically, but stick to the spec's character limits for the cleanest look. Flows take up to 4 steps.

## Free voice (default for new videos)
Set `"audio": {"engine": "kokoro", "kokoro_voice": "af_heart", "speed": 1.0}` - Kokoro, a free open-source voice that runs locally (scripts/tts.py; needs `pip install kokoro-onnx` and the two model files listed there). Each `say` line is voiced separately, so no pause-splitting is needed. The owner's GitHub repo "subcreator-videos" renders specs automatically with this voice via GitHub Actions; when it is connected, add new video folders there instead of rendering here.

## Getting a vidIQ voiceover (batch it)
1. Batch the whole week in ONE call: every video's lines in order (for Nora-led videos, lines 2-5 only), each line its own paragraph separated by a blank line. Voice Matilda (`XrExE9yKIg1WjnnlVkGX`). Cost: 14 credits per 1,000 characters, rounded up per call, max 5,000 characters per call. One call per video wastes the rounding; batching roughly halves the cost.
2. Poll `vidiq_job_poll` until completed and give the owner the MP3 link (it expires in about 12 hours).
3. If the workspace cannot download the link: when the owner's computer is linked, ask them to click the link (it saves to Downloads) and pick the file up from there with the device tools; otherwise ask them to attach it.
4. Split it: `--split-voice week.mp3 spec1.json spec2.json ...` in the same order as the batch. It writes `<spec>_voice.wav` beside each spec and sets `audio.voice`. Check its printed durations look sensible (20-35 s each).

Budget: the free vidIQ plan gives 150 credits a month, roughly 2 to 3 weeks of batched voiceovers at 8 voiced videos a week. Tell the owner when credits will run short (check `vidiq_balance`) and suggest recording some lines themselves.

## Check before delivering
1. Run `--stills` first and look at the carousel preview: no text over card edges, no clipped words.
2. After the full render, grab one frame per scene with ffmpeg and look at them.
3. Confirm the duration is 20-40 s and that captions match the voice.
4. Deliver the MP4, cover and carousel files, and state whether the fallback voice was used. When the owner's computer is linked and they've given a folder, also save the files there.

## Rules
- Never change the palette, fonts or layout per video; only the spec's words change.
- Keep text within the spec's character limits; if something overflows, shorten the words in the spec, not the font.
- Fonts (Inter, SIL Open Font License) are bundled in fonts/.
