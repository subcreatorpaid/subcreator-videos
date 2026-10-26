// Newsletter sign-up: POST /api/subscribe {email, first, last}
// Saves the subscriber in the site's own Cloudflare D1 database (binding "DB").
// When BEEHIIV_API_KEY and BEEHIIV_PUBLICATION_ID are set, also sends them to beehiiv (which sends the emails).
import { json, ensure, ipHash, tooMany } from "../../lib/db.js";

export async function onRequestPost({ request, env }) {
  let b; try { b = await request.json(); } catch { return json({ ok: false, message: "Bad request." }, 400); }
  if (b.company) return json({ ok: true, message: "You're on the list." });          // honeypot: pretend success
  const email = String(b.email || "").trim().toLowerCase().slice(0, 200);
  const first = String(b.first || "").trim().slice(0, 60), last = String(b.last || "").trim().slice(0, 60);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json({ ok: false, message: "Enter a valid email address." }, 400);
  const beehiiv = env.BEEHIIV_API_KEY && env.BEEHIIV_PUBLICATION_ID;
  if (!env.DB && !beehiiv)
    return json({ ok: false, message: "Sign-up opens very soon. Join our Telegram channel for now: t.me/subcreatorpaid" }, 503);

  let synced = 0;
  if (beehiiv) {
    const r = await fetch(`https://api.beehiiv.com/v2/publications/${env.BEEHIIV_PUBLICATION_ID}/subscriptions`, {
      method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${env.BEEHIIV_API_KEY}` },
      body: JSON.stringify({ email, reactivate_existing: false, send_welcome_email: true, utm_source: "website", referring_site: "subcreatorpaid.com",
        custom_fields: first ? [{ name: "First Name", value: first }] : [] })
    }).catch(() => null);
    synced = r && r.ok ? 1 : 0;
    if (!synced && !env.DB) return json({ ok: false, message: "Something went wrong. Please try again in a minute." }, 502);
  }
  if (env.DB) {
    try {
      await ensure(env.DB);
      const iph = await ipHash(request);
      if (await tooMany(env.DB, "subscribers", iph, 5)) return json({ ok: false, message: "Too many sign-ups from this connection. Try again later." }, 429);
      await env.DB.prepare(`INSERT INTO subscribers (email, first, last, source, synced, created, iph) VALUES (?1, ?2, ?3, 'website', ?4, ?5, ?6)
        ON CONFLICT(email) DO UPDATE SET status = 'active', synced = MAX(synced, excluded.synced)`)
        .bind(email, first, last, synced, new Date().toISOString(), iph).run();
    } catch (e) {
      console.log("subscribe db error", String(e && e.message || e));
      if (!synced) return json({ ok: false, message: "Something went wrong. Please try again in a minute." }, 500);
    }
  }
  return json({ ok: true, guide_url: "/files/small-creator-income-guide.pdf",
                 message: "You're on the list. Your free guide is ready to download, and one verified income stream arrives by email each week." });
}
export const onRequest = () => json({ ok: false, message: "Use POST" }, 405);
