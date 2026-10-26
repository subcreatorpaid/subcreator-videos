"""Project index: one page listing every video with its status, the key links and the owner's open to-dos.

  python3 content/plan100/index_page.py [FILES]     (default FILES = /mnt/project-files)

Reads content/plan100/registry.json (from master.py), which video folders in FILES/02-videos have a video.mp4,
and the Buffer schedule in brain/week-plan.json. Writes FILES/00-INDEX.md and dashboard/out/project_index.html
(published as the "Project Index" artifact). Rerun after renders or scheduling changes.
"""
import html, json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
FILES = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "/mnt/project-files")
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from common import AFF

LINKS = [
    ("Start here (project summary)", "https://claude.ai/artifact/LJVKULTZrQCh2xTWuVdfh6", "What the business is and how everything fits"),
    ("Control Room", "https://claude.ai/artifact/2LBTT8WvBgQ4pf3iYLZ55v", "Goals, numbers, approvals"),
    ("Render Room", "https://claude.ai/artifact/5RpYRzaySkv1cMp3xQtcok", "One Render button per video"),
    ("20 Best Video Ideas", "https://claude.ai/artifact/SvJ9VwDfNZFKjpde1LyeqQ", "Top trending ideas, in make order"),
    ("Website videos page", "https://subcreatorpaid.com/videos/", "The finished videos, live"),
    ("Link-in-bio page", "https://subcreatorpaid.com/links/", "Goes in every profile bio"),
    ("Buffer", "https://publish.buffer.com", "Where the posts are scheduled"),
]
FOLDERS = [
    ("00-INDEX.md", "This list as a text file"),
    ("01-start-here/", "The brain, the brand book and the rules"),
    ("02-videos/NNN_name/", "One folder per video: video.mp4, hook_1-3.mp4, thumbnail, captions, script, guide, affiliate, spec"),
    ("03-guides/", "Every free-guide PDF in one place, plus the main free guide"),
    ("04-affiliates/", "AFFILIATE_SIGNUPS.md: which program each video uses and where to join"),
    ("05-style-and-voice/", "Style samples, voice samples, early previews"),
    ("99-archive/", "Old copies and review rounds (kept, not needed day to day)"),
]
STATUS = {"scheduled": "Scheduled", "ready": "Finished", "paused": "Paused"}


def rows():
    reg = json.loads((ROOT / "content/plan100/registry.json").read_text())
    plan = json.loads((ROOT / "brain/week-plan.json").read_text())
    sched = {p["slug"]: p for p in plan["posts"] if p.get("status") == "scheduled"}
    out = []
    for r in reg:
        folder = f"{r['n']}_{re.sub(r'^v\d{3}_', '', r['slug'])}"
        p = sched.get(r["slug"])
        st = "scheduled" if p else "ready" if (FILES / "02-videos" / folder / "video.mp4").exists() else "paused"
        out.append(dict(n=r["n"], title=r["title"], type=r["type"], seconds=r["seconds"], folder=folder, status=st,
                        tool=AFF[r["tool"]][0] if r.get("tool") else "", when=f"{p['day']} {p.get('slot', '')}".strip() if p else ""))
    return out


def todos(vids):
    paused = sum(v["status"] == "paused" for v in vids)
    to_join = [v[0] for k, v in AFF.items() if v[3] != "joined" and k != "fiverr"]
    return [
        (f"Say \"go\" to render the {paused} paused videos", "GitHub's free render minutes ran out. I can render them in the cloud, about 2.5 minutes each.", "https://claude.ai/artifact/5RpYRzaySkv1cMp3xQtcok"),
        ("Log in to Fiverr Affiliates and send me your link", "Seven videos point to Fiverr.", "https://fiverraffiliates.com/v2/login/"),
        (f"Join the {len(to_join)} affiliate programs still open", ", ".join(to_join) + ". The list in 04-affiliates says which videos use each one.", None),
        ("Set up ManyChat", "Comment keyword, then a DM that asks for the email, then the free guide.", "https://manychat.com"),
        ("Add payout details and the link-in-bio", "Put subcreatorpaid.com/links in the Instagram, TikTok and YouTube bios.", "https://subcreatorpaid.com/links/"),
    ]


def markdown(vids, tds):
    c = {k: sum(v["status"] == k for v in vids) for k in STATUS}
    out = ["# Sub-Creator Paid: project index", "",
           f"{len(vids)} videos: {c['scheduled']} scheduled in Buffer, {c['ready']} finished and ready, {c['paused']} paused (not rendered yet).", "",
           "## Folders", ""] + [f"- `{f}` {d}" for f, d in FOLDERS] + ["", "## Links", ""] + [f"- [{t}]({u}): {d}" for t, u, d in LINKS]
    out += ["", "## Your open to-dos", ""] + [f"{i}. {t}. {d}" + (f" ({u})" if u else "") for i, (t, d, u) in enumerate(tds, 1)]
    out += ["", "## Videos", "", "| # | Video | Status | Type | Length | Tool | Folder |", "|---|---|---|---|---|---|---|"]
    out += [f"| {v['n']} | {v['title']} | {STATUS[v['status']]}{(' ' + v['when']) if v['when'] else ''} | {v['type']} | ~{v['seconds']} s | {v['tool'] or '-'} | 02-videos/{v['folder']} |" for v in vids]
    return "\n".join(out) + "\n"


def page(vids, tds):
    e = html.escape
    c = {k: sum(v["status"] == k for v in vids) for k in STATUS}
    links = "".join(f'<a class="link" href="{e(u)}" target="_blank" rel="noopener"><b>{e(t)}</b><span>{e(d)}</span></a>' for t, u, d in LINKS)
    todo = "".join(f'<li><b>{e(t)}</b><span>{e(d)}</span>' + (f' <a href="{e(u)}" target="_blank" rel="noopener">Open</a>' if u else "") + "</li>" for t, d, u in tds)
    folders = "".join(f"<li><code>{e(f)}</code><span>{e(d)}</span></li>" for f, d in FOLDERS)
    trs = "".join(
        f'<tr data-s="{v["status"]}" data-q="{e((v["n"] + " " + v["title"] + " " + v["tool"] + " " + v["type"]).lower())}">'
        f'<td class="num">{e(v["n"])}</td><td class="t"><b>{e(v["title"])}</b><code>02-videos/{e(v["folder"])}</code></td>'
        f'<td><span class="pill {v["status"]}">{STATUS[v["status"]]}</span>{("<small>" + e(v["when"]) + "</small>") if v["when"] else ""}</td>'
        f'<td>{e(v["type"])}</td><td class="num">~{v["seconds"]} s</td><td>{e(v["tool"]) or "&ndash;"}</td></tr>' for v in vids)
    tpl = (pathlib.Path(__file__).parent / "index_page.html").read_text()
    return (tpl.replace("{{TOTAL}}", str(len(vids))).replace("{{SCHED}}", str(c["scheduled"])).replace("{{READY}}", str(c["ready"]))
            .replace("{{PAUSED}}", str(c["paused"])).replace("{{LINKS}}", links).replace("{{TODOS}}", todo)
            .replace("{{FOLDERS}}", folders).replace("{{ROWS}}", trs))


def main():
    vids = rows(); tds = todos(vids)
    (FILES / "00-INDEX.md").write_text(markdown(vids, tds))
    out = ROOT / "dashboard/out"; out.mkdir(parents=True, exist_ok=True)
    (out / "project_index.html").write_text(page(vids, tds))
    print({k: sum(v["status"] == k for v in vids) for k in STATUS}, "->", FILES / "00-INDEX.md", out / "project_index.html")


if __name__ == "__main__":
    main()
