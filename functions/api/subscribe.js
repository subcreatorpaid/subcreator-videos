// Newsletter sign-up: POST /api/subscribe {email, first, last}
// Sends the subscriber to beehiiv when BEEHIIV_API_KEY and BEEHIIV_PUBLICATION_ID are set (Cloudflare Pages > Settings > Variables).
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json", "cache-control": "no-store" } });
export async function onRequestPost({ request, env }) {
  let b; try { b = await request.json(); } catch { return json({ ok: false, message: "Bad request." }, 400); }
  if (b.company) return json({ ok: true });                                   // honeypot: pretend success
  const email = String(b.email || "").trim().slice(0, 200), first = String(b.first || "").trim().slice(0, 60);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ ok: false, message: "Enter a valid email address." }, 400);
  if (!env.BEEHIIV_API_KEY || !env.BEEHIIV_PUBLICATION_ID)
    return json({ ok: false, message: "Sign-up opens very soon. Join our Telegram channel for now: t.me/subcreatorpaid" }, 503);
  const r = await fetch(`https://api.beehiiv.com/v2/publications/${env.BEEHIIV_PUBLICATION_ID}/subscriptions`, {
    method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${env.BEEHIIV_API_KEY}` },
    body: JSON.stringify({ email, reactivate_existing: false, send_welcome_email: true, utm_source: "website", referring_site: "subcreatorpaid.com",
      custom_fields: first ? [{ name: "First Name", value: first }] : [] })
  });
  if (r.ok) return json({ ok: true, message: "Check your inbox to confirm, then the guide is on its way." });
  return json({ ok: false, message: "Something went wrong. Please try again in a minute." }, 502);
}
export const onRequest = () => json({ ok: false, message: "Use POST" }, 405);
