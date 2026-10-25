#!/usr/bin/env python3
"""Capture screenshots of public pages for a video spec (runs in GitHub Actions before rendering).

spec.json may list:
  "snaps": [{"url": "https://...", "file": "assets/name.png",
             "find": "text to scroll to (optional)", "width": 1280, "height": 1500, "zoom": 1.0}]
Rules: public pages only, no cookie consent is given (banners are hidden, never accepted), existing files are kept
unless --force. Usage: python renderer/snap.py videos/<slug>/spec.json [--force]
"""
import json, pathlib, sys

HIDE_JS = r"""
() => {
  let n = 0;
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.position !== 'fixed' && cs.position !== 'sticky') continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const txt = (el.innerText || '').toLowerCase().slice(0, 600);
    const overlay = r.height > innerHeight * 0.45 && r.width > innerWidth * 0.6;
    if (/cookie|consent|gdpr|we use|accept all|reject all|privacy choices|newsletter|subscribe|chat with/.test(txt) || overlay) {
      el.style.setProperty('display', 'none', 'important'); n++;
    }
  }
  for (const f of document.querySelectorAll('iframe')) {
    if (/consent|cookie|onetrust|chat|intercom/i.test((f.src || '') + (f.title || ''))) { f.style.setProperty('display', 'none', 'important'); n++; }
  }
  document.documentElement.style.overflow = 'auto'; document.body.style.overflow = 'auto';
  return n;
}
"""


def blank(path):
    from PIL import Image, ImageStat
    im = Image.open(path).convert("L")
    return ImageStat.Stat(im).stddev[0] < 12


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
                hid = pg.evaluate(HIDE_JS)
                if s.get("find"):
                    try:
                        loc = pg.get_by_text(s["find"], exact=False).first
                        loc.scroll_into_view_if_needed(timeout=5000)
                        pg.evaluate("window.scrollBy(0, -260)")
                    except Exception as e:  # noqa: BLE001
                        print(f"snap: text not found on {s['url']}: {s['find']!r} ({e.__class__.__name__})")
                pg.wait_for_timeout(800)
                pg.screenshot(path=str(out))
                if blank(out):
                    pg.wait_for_load_state("networkidle", timeout=20000); pg.wait_for_timeout(4000); pg.evaluate(HIDE_JS)
                    pg.screenshot(path=str(out))
                status = "BLANK - check this page" if blank(out) else "ok"
                print(f"snap: {s['url']} -> {out} (hid {hid} overlays, {status})")
            except Exception as e:  # noqa: BLE001
                print(f"snap: FAILED {s['url']}: {e}")
            ctx.close()
        b.close()


if __name__ == "__main__":
    main()
