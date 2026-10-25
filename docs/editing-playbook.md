# Editing playbook (list / explainer Shorts)

Learned from frame-by-frame study of the 15 most-viewed Shorts of a fast-growing faceless explainer channel
(130K-2M views each, Oct 2026). Full notes: reference/channel-study.md. We copy the *editing grammar* only,
never their content, branding, book, mascot, people or footage.

## The 12 rules every video follows
1. Plain off-white background + faint dotted grid; ONE accent colour (ours: forest green) used only on decor,
   icons and the logo. Everything else is near-black text.
2. Motion in frame 0: camera pulls back from a grid close-up, or screenshots fly in. Never a static first frame.
3. Hook formula: small setup line -> NAME / NUMBER huge -> black highlight box wiping open with the payoff.
4. Something new appears every 2-4 s. Never more than ~8 words on screen.
5. Words appear as they are spoken, rising in light grey and darkening. Key words: bold or UPPERCASE on their own line.
6. Body template: small line + bold key phrase on top, visual in the middle, caption under it, ✦ bullets one per phrase.
7. Each list item opens with "First is" + a logo-badge pill sliding in + a card/screenshot of the real thing.
8. Prefer diagrams over stock footage: timelines, fan-out lines, orbit rings, dotted step paths.
9. Proof beats: real screenshots, stacked price/fee cards, big counting numbers.
10. Vary the transition: punch-zoom (new section), blur-whip (new idea), shatter (big reveal / before the CTA),
    whip slide (quick aside), in-place cut (same section).
11. Retention: optional early "Save this" bookmark beat (~5-7 s in); recap with a highlight box before the CTA.
12. Same ending every time: Comment "WORD" -> book drops -> pages open -> promise -> follow + bouncing logo.

## Beat types in render_list.py and when each fits best
| What the line says | Best-fit beat | Why |
|---|---|---|
| The promise / topic | `hook` style `stack` (no images), `sandwich` (2-3 real screenshots), `scatter` (floating buttons, playful) | sandwich = proof up front, top performer pattern |
| "First / Second / Third: NAME" | `title_card` with `badge` (+ `image` screenshot) | logo badge + real page = instant credibility |
| A myth or "what you DON'T need" | `features` with `heading` and `x` icons | ✖ list reads as myth-busting |
| A single claim / reframe | `statement` (+ `highlight` box, `decor: soft`) | big uppercase payoff word |
| Money moves from A to many B | `fanout` (from -> to[]) | one node, dotted lines to targets |
| A process in steps | `flow` (steps[]) | dotted curved path, dots per step |
| One headline number | `stat` (big counts up, + rows with icons) | count-up = "proof" feeling |
| Several fees / prices / options compared | `stack` (cards[] + node timeline) | cards pile up like pricing pages |
| Repeat / many of something / ecosystem | `orbit` (center + items[]) | pills circling the logo |
| A real page or tool | `shot` (image + top + caption + bullets, device card/laptop/phone) | the reference's main body template |
| "Save this" | `save` (bookmark + cursor click) | early save prompt |
| Bullet list with no visual | `bullets` (phone mockup) | split layout |
| Comment-for-guide | `book_cta` (book drops, pages open) | only when the guide + DM automation exist |
| Follow | `follow` | logo bounce |

`"type": "auto"` picks from the fields given (keyword -> book_cta, label+badge -> title_card, cards -> stack,
big -> stat, steps -> flow, to -> fanout, image -> shot, center+items -> orbit, icon items -> features,
items -> bullets, else statement). Variety check: don't use the same beat type 3 times in a row.

## Default transition per beat (override with "transition")
hook zoom · title_card zoom · statement blur · stat blur · stack zoom · orbit zoom · flow whip · save whip ·
shot/features/bullets/fanout cut · book_cta shatter · follow zoom.

## Screenshots
- Public pages only (sign-up pages, pricing pages, help-centre pages, the platform's own marketing pages),
  captured in the owner's Chrome. Choose "essential cookies only" on banners and crop the banner out.
- Never show other people's personal data, private dashboards, or other creators' products/faces.
- Save to `<project>/assets/` and reference them relative to the spec file.
- Draw brand initials in badges (letter) rather than redrawing brand logos.

## Sound design (added 25 Oct 2026)
Every visual event has a sound, kept under the voice: typewriter keys on words, thud on big accent words,
swipe on the highlight box, zip on lines, pop on badges/pills/icons, card slap on cards, ticks on counting
numbers, glass on shatter, page turn on the book, whip/whoosh/swoosh on transitions, click on "Save this".
Music bed ducks under the voice; effects duck a little too. Never add sounds the viewer can't see a reason for.

## v4 additions: 3-profile Instagram study (25 Oct 2026)
Studied on public pages: @jayantcreates.ai (top Reels 10.4k, 8.8k), @phanik.ig (129k, 14.1k), @nick_saraev (2.7M).
Techniques learned, never copied: no wording, characters, branding or footage from these creators is used.

| Technique (source) | How to use it | Spec |
|---|---|---|
| Step tracker 01 02 03 (jayant) | On every beat of a multi-part video, so viewers see progress and stay for the last part | `"step": [2, 3], "step_labels": ["UGC", "Amazon", "Etsy"]` |
| Left-aligned bold headline, accent words green (jayant) | Top of any visual beat; replaces the centred top line | `"headline": "Beginners usually charge *$50 to $400*"` |
| Hard-shadow screenshot card (jayant) | Proof screenshots: flat, black outline, solid offset shadow | shot `"style": "brutal"` |
| Hand-drawn circle / highlighter on a screenshot (phanik, nick) | Point at the exact word or number on a real page | shot `"marks": [{"box": [x0, y0, x1, y1], "kind": "circle" or "highlight"}]` (fractions of the image) |
| Number badge over a screenshot, counting up (nick) | The key number on a proof page | shot `"callout": {"big": "$50-$400", "label": "...", "pos": [0.5, 0.98]}` |
| Tilted sticker with hard shadow (jayant) | One short number or result on a screenshot | shot `"sticker": "3%-4.5%"` |
| Line chart that draws itself + count-up (jayant) | Growth or earnings over time. Real or clearly labelled example data only | `"type": "chart", "points": [...], "big": "10,000", "label": "..."` |
| Cards converge into one counter (phanik) | Several parts adding up to one total (fees, income sources) | `"type": "converge", "cards": [{"title", "sub"}], "big": "$8.60", "label": "You keep about"` |
| Strike-through correction (phanik) | Busting a myth: "Not ~followers~" then the real answer | statement `"strike": "followers"` (+ `"strike_pre"`) |
| Comment box types the keyword, then the DM reply slides in (jayant) | The comment-keyword CTA (needs ManyChat or similar running) | `"type": "comment_cta", "keyword": "LIST", "reply": "...", "attachment": "Income Guide (PDF)"` |

Pace rules confirmed by all three: a new visual every 1.5-3 s; the hook's first frame already shows the topic visually;
key words get colour or a box, never the whole sentence; one idea per screen.

For the AI host (later): split screen (visual top, host bottom; nick), white caption card with one big
coloured key phrase under the host (phanik), screenshot cards layered behind the host's head (phanik),
a punch-in close-up for the CTA (nick), and an ebook mock + QR end card (phanik). These need the
lip-sync clips first, so they are not in the renderer yet.
