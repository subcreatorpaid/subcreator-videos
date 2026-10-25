#!/usr/bin/env python3
"""Capture screenshots of public pages for a video spec (runs in GitHub Actions before rendering).

spec.json may list:
  "snaps": [{"url": "https://...", "file": "assets/name.png",
             "find": "text to scroll to (optional)", "width": 1280, "height": 1500, "zoom": 1.0}]
Rules: public pages only, no cookie consent is given (banners are hidden, never accepted), existing files are kept
unless --force. Usage: python renderer/snap.py videos/<slug>/spec.json [--force]
"""
import json, pathlib, sys

HIDE = """
[id*="cookie" i],[class*="cookie" i],[id*="consent" i],[class*="consent" i],[id*="onetrust" i],[class*="onetrust" i],
[id*="gdpr" i],[class*="gdpr" i],#CybotCookiebotDialog,.cc-window,.cky-consent-container,[aria-label*="cookie" i],
[role="dialog"][aria-modal="true"],[class*="newsletter-popup" i],[id*="intercom" i],[class*="intercom" i],
[class*="drift" i],iframe[title*="chat" i]{display:none!important;visibility:hidden!important}
html,body{overflow:auto!important}
"""


def main():
    spec_p = pathlib.Path(sys.argv[1]); force = "--force" in sys.argv
    spec = json.loads(spec_p.read_text())
    snaps = [s for s in spec.get("snaps", []) if force or not (spec_p.parent / s["file"]).exists()]
    if not snaps:
        print("snap: nothing to capture"); return
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = p.chromium.launch()
        for s in snaps:
            out = spec_p.parent / s["file"]; out.parent.mkdir(parents=True, exist_ok=True)
            ctx = b.new_context(viewport={"width": s.get("width", 1280), "height": s.get("height", 1500)},
                                device_scale_factor=s.get("zoom", 1.0), locale="en-US",
                                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36")
            pg = ctx.new_page()
            try:
                pg.goto(s["url"], wait_until="domcontentloaded", timeout=45000)
                pg.wait_for_timeout(3500)
                pg.add_style_tag(content=HIDE)
                if s.get("find"):
                    try:
                        loc = pg.get_by_text(s["find"], exact=False).first
                        loc.scroll_into_view_if_needed(timeout=5000)
                        pg.evaluate("window.scrollBy(0, -260)")
                    except Exception as e:  # noqa: BLE001
                        print(f"snap: text not found on {s['url']}: {s['find']!r} ({e.__class__.__name__})")
                pg.wait_for_timeout(800)
                pg.screenshot(path=str(out))
                print(f"snap: {s['url']} -> {out}")
            except Exception as e:  # noqa: BLE001
                print(f"snap: FAILED {s['url']}: {e}")
            ctx.close()
        b.close()


if __name__ == "__main__":
    main()
