# Brand book

## Identity
Sub-Creator Paid researches real income streams for small creators and shows how each one actually pays.
- Position: "I'm learning alongside you." Never claim personal earnings, results or experience the owner does not have.
- Core belief behind every piece: **you do not need 10,000 followers to get paid.**
- Audience: adult creators worldwide with 0-10,000 followers. Not for get-rich-quick seekers; never write to attract them.
- Money always in US dollars ($), as a range or a labelled example, never a promise.

## Voice
Professional, clear, calm, specific (program names, $ ranges, requirements, and always the catch). Respectful of beginners.
**Never:** "hack", "quit your job", "bro", emojis in on-screen text, naming or bashing other creators, promised earnings ("you will make $X"),
trading / crypto / investments / loans / get-paid-to-watch schemes.

| Instead of | Write |
|---|---|
| "This insane hack pays thousands" | "This pays creators with under 1,000 followers. Here's the catch." |
| "Quit your job with UGC" | "UGC won't replace a salary on day one. Beginners usually charge $50-$400 a video." |
| "You NEED this tool" | "Here's the free option, and when the paid one is worth it." |

## Visuals (videos, thumbnails, site, dashboard)
- Palette since 29 Oct 2026 (owner picked the launch film): ONE palette everywhere: white / off-white `#F5F5F2`, ink `#0E0E10`-`#151515`, lime `#CDF24F` (soft `#F1FBD0`).
  Lime is a fill or glow, never text on a light background. Money = ink text on a lime box. Red `#D93A3A` only for loss / "The catch". Muted `#5F5E58`, lines `#E2DFD7`.
- Real brand logos for every platform, program and tool shown (never letters or look-alikes); they keep their own colours.
- Instagram safe area: all content inside x 60-940, y 230-1440 of 1080x1920; @subcreatorpaid with the S mark at the top centre, never at the very bottom.
- Type: Inter (Black for hooks, ExtraBold body); website adds Instrument Serif italic accents.
- Video: 1080x1920, launch-film style (`animator/src/flow/Launch.jsx`, spec `"style": "launch"`, rules in `docs/animator-rules.md` section F), Kokoro voice at 1.12, fast pacing.
- Refuse: cash stacks, luxury shots, fake payouts, other channels' branding or content, real people's photos, a second accent colour (lime is the only accent).

## Series
- **Income Stream of the Week** (value): one verified stream, followers needed, pay, steps, the catch. Gets a website page `site/data/streams/<slug>.json`.
- **Tools That Pay** (tool): a tool small creators need, shown working, one real limit, a free alternative, CTA `subcreatorpaid.com/go/<id>` + disclosure.
- **Myths / how-tos** (value): saves and shares.
- **Small Account Wins / proof**: official pages, viewer wins, comment replies, the owner's own numbers (only real ones).

## Every video ends the same way (owner rule, 26 Oct 2026)
Four parts, 6-8 s in total, in this order:
1. **Comment for the ebook:** "Comment KEYWORD and I'll send you the free <topic> guide." One keyword per guide (UGC, TOOLS, LIST, PAID...).
   Until comment-to-DM automation is live, add: "or get it free on subcreatorpaid.com". Never promise a DM we can't send.
2. **The website:** "Everything is on subcreatorpaid.com" with subcreatorpaid.com/links on screen.
3. **The related affiliate tool:** "The tool I'd start with is linked in my bio" + "Affiliate link" on screen, and the "Tools I use" block
   with the disclosure in the caption. Pick the tool that fits the video's topic (UGC -> Fiverr/OpusClip, email -> beehiiv/Kit, voice -> ElevenLabs, community -> Skool).
4. **Follow.**
**Cross-platform links (owner question, 26 Oct 2026):** the hub is subcreatorpaid.com/links (all profiles, guide, tools). Instagram + YouTube bios link to it;
   TikTok bio shows "subcreatorpaid.com" as text until the 1,000-follower link unlock. Every caption ends with one line pointing to the other platforms
   (TikTok: "More on IG + YouTube: @subcreatorpaid"; Instagram: "Also on TikTok + YouTube: @subcreatorpaid"; YouTube: "Instagram + TikTok: @subcreatorpaid").
**Every DM goes to the website, and we ask for the email first (owner rule, 26 Oct 2026).** When comment-to-DM is set up:
   1) the auto-DM thanks them and asks "What email should I send the <topic> guide to?" (with "you'll also get one verified income stream a week, unsubscribe anytime");
   2) the email goes to our list (D1 via /api/subscribe), never only into the DM tool;
   3) then one link to subcreatorpaid.com/guide/ (or the topic page), where the download sits behind the same email form, so anyone who skipped the email in the DM is asked again on the site.
   No ebook file or affiliate link is sent straight in a DM. Replies to individual DMs in the owner's name still need his OK.
Each ebook is a related free guide (PDF on the site, email sign-up to get it). Topic guides are drafted by the creator and need the owner's OK before going live.

## Packaging and hook strategy (owner ask, 29 Oct 2026; adapted from the YouTube script-writer instructions)
Applies to every Reel, TikTok and Short, max 60 s. Every script comes with the packaging first, then the script.
**Packaging**
- 3 title options, each under 60 characters, each opening a curiosity loop. Use a loss angle ("Is X Quietly Costing You $Y?") or a shortcut angle ("The $0 Way To Start Z"). Mark the favourite. The title is the on-screen hook text and the YouTube Shorts title; Instagram and TikTok use it as the first caption line.
- Cover: one visual with clear conflict or contrast (give it as an image prompt), plus 2-4 overlay words that never repeat the title. See rules C1-C4 in `docs/animator-rules.md`.
**Hook and script**
1. Click confirmation (0-3 s): the first sentence states the exact promise of the title. No intro, no greeting, no channel name.
2. Belief challenge (3-10 s): why the common belief ("you need 10k") is incomplete or wrong, with a payoff promised for later in the video.
3. Value beats: the stream, the proof with USD maths, who it suits. Add a re-hook line roughly every 10-15 s that opens a new question ("But here is the part nobody mentions...").
4. Payoff and close: deliver the promised answer, then ONE takeaway, then the four-part ending above. Never "smash like", never "don't forget to".
**Craft rules**
- Write for the ear: short sentences, plain words.
- A `[VISUAL: ...]` cue every 2-3 sentences; each cue must work as an image prompt on its own.
- `[CHECK: claim]` after every figure, name or rule that is not yet verified. Never invent a statistic, study or quote (this also guards against repetitive or mass-produced content flags: each script needs a point of view, a worked example or a comparison).
- No financial advice framed as instructions ("put your money in..."); describe how a program pays, with the catch.
- US/UK English spelling.

## Before anything ships (creator + guard check)
1. Every fact verified on an official page within 30 days, source saved.
2. Pay is a range or labelled example; the catch is stated.
3. Ads, affiliate links and AI-made content are labelled.
4. Nothing from the never-list.
