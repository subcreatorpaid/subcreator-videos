#!/usr/bin/env python3
"""Monday stats report with no Claude: pulls what is reachable with API keys, writes brain/stats/<date>.md, updates brain/goals.json.latest.
Only real numbers are written; a source whose secret is missing or whose call fails is listed as 'not connected' (never estimated).

Optional GitHub secrets (all read-only): YT_API_KEY (YouTube Data API key), CF_API_TOKEN + CF_ACCOUNT_ID + CF_D1_ID (D1 read) and
CF_WA_SITE_TAG (Web Analytics site tag), IG_TOKEN + IG_USER_ID (Instagram Graph API), TG_BOT_TOKEN (bot added to the channel).
TikTok has no key-free read API: type its number into brain/goals.json yourself, or send the analytics screenshot.
"""
import datetime as dt, json, os, pathlib, urllib.parse, urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
E = os.environ.get
now = dt.datetime.now(dt.timezone.utc); today = now.date().isoformat()
week_ago = (now - dt.timedelta(days=7)).strftime("%Y-%m-%dT%H:%M:%SZ")


def call(url, body=None, headers=None):
    req = urllib.request.Request(url, json.dumps(body).encode() if body else None, headers={"Content-Type": "application/json", **(headers or {})})
    with urllib.request.urlopen(req, timeout=60) as r: return json.load(r)


def youtube():
    d = call("https://www.googleapis.com/youtube/v3/channels?part=statistics&forHandle=subcreatorpaid&key=" + E("YT_API_KEY"))["items"][0]["statistics"]
    return {"youtube": int(d["subscriberCount"]), "youtube_views_total": int(d["viewCount"])}


def d1(sql):
    u = f"https://api.cloudflare.com/client/v4/accounts/{E('CF_ACCOUNT_ID')}/d1/database/{E('CF_D1_ID')}/query"
    return call(u, {"sql": sql}, {"Authorization": "Bearer " + E("CF_API_TOKEN")})["result"][0]["results"][0]


def signups():
    t = d1("SELECT COUNT(*) AS n FROM subscribers WHERE status='active' AND email NOT LIKE '%@example.%'")["n"]
    w = d1(f"SELECT COUNT(*) AS n FROM subscribers WHERE created >= '{week_ago}'")["n"]
    return {"email_subscribers": t, "signups_7d": w}


def visits():
    q = ("query($a:String!,$t:String!,$s:Time!){viewer{accounts(filter:{accountTag:$a}){rumPageloadEventsAdaptiveGroups(limit:1,"
         "filter:{siteTag:$t,datetime_geq:$s}){count sum{visits}}}}}")
    r = call("https://api.cloudflare.com/client/v4/graphql", {"query": q, "variables": {"a": E("CF_ACCOUNT_ID"), "t": E("CF_WA_SITE_TAG"), "s": week_ago}},
             {"Authorization": "Bearer " + E("CF_API_TOKEN")})
    g = r["data"]["viewer"]["accounts"][0]["rumPageloadEventsAdaptiveGroups"][0]
    return {"site_visitors_7d": g["sum"]["visits"], "page_views_7d": g["count"]}


def instagram():
    r = call(f"https://graph.facebook.com/v21.0/{E('IG_USER_ID')}?fields=followers_count&access_token={E('IG_TOKEN')}")
    return {"instagram": r["followers_count"]}


def telegram():
    r = call(f"https://api.telegram.org/bot{E('TG_BOT_TOKEN')}/getChatMemberCount?chat_id=@subcreatorpaid")
    return {"telegram": r["result"]}


SOURCES = [("YouTube", ["YT_API_KEY"], youtube), ("Email list (D1)", ["CF_API_TOKEN", "CF_ACCOUNT_ID", "CF_D1_ID"], signups),
           ("Site visits (Web Analytics)", ["CF_API_TOKEN", "CF_ACCOUNT_ID", "CF_WA_SITE_TAG"], visits),
           ("Instagram", ["IG_TOKEN", "IG_USER_ID"], instagram), ("Telegram", ["TG_BOT_TOKEN"], telegram)]
got, notes = {}, []
for name, keys, fn in SOURCES:
    if not all(E(k) for k in keys): notes.append(f"- {name}: not connected (missing {', '.join(k for k in keys if not E(k))})"); continue
    try: got.update(fn()); notes.append(f"- {name}: ok")
    except Exception as e: notes.append(f"- {name}: failed ({type(e).__name__}: {str(e)[:80]})")

goals = json.loads((ROOT / "brain/goals.json").read_text()); last = goals["latest"]
follow = lambda d: (d.get("instagram") or 0) + (d.get("tiktok") or 0)
gained = follow({**last, **got}) - follow(last)
goals["latest"] = {**last, **{k: v for k, v in got.items() if k in last}, "date": today}
goals.setdefault("history", [])
(ROOT / "brain/goals.json").write_text(json.dumps(goals, indent=2, ensure_ascii=False) + "\n")
n = goals["latest"]; days_left = (dt.date.fromisoformat(goals["deadline"]) - now.date()).days
total = follow(n)
lines = [f"# Weekly stats {today}", "", "| Metric | Now |", "|---|---|"]
for label, k in [("Instagram followers", "instagram"), ("TikTok followers (enter by hand)", "tiktok"), ("YouTube subscribers", "youtube"),
                 ("Telegram", "telegram"), ("Email subscribers", "email_subscribers"), ("New sign-ups, 7 days", "signups_7d"),
                 ("Site visitors, 7 days", "site_visitors_7d"), ("Page views, 7 days", "page_views_7d"), ("Affiliate sign-ups total", "affiliate_signups_total"),
                 ("Earned USD total", "earned_usd_total")]:
    lines.append(f"| {label} | {got.get(k, n.get(k)) if got.get(k, n.get(k)) is not None else 'n/a'} |")
lines += ["", f"Goal: {goals['goal']}. IG + TikTok now {total} of 10,000, {days_left} days left, pace needed {goals['weekly_pace']}/week. "
          f"Change this week: {gained:+d} (only counts sources that answered).", "", "## Sources", *notes, ""]
out = ROOT / f"brain/stats/{today}.md"; out.parent.mkdir(exist_ok=True); out.write_text("\n".join(lines)); print("\n".join(lines))
