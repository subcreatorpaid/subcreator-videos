// Comments on stream pages, stored in the site's own Cloudflare D1 database (binding "DB").
// GET  /api/comments?page=<slug>  -> approved comments for that page
// POST /api/comments {page, name, body, website}  -> saved as "pending"; shown only after the owner approves it.
import { json, ensure, ipHash, tooMany } from "../../lib/db.js";
const okPage = p => /^[a-z0-9-]{1,60}$/.test(p);

export async function onRequestGet({ request, env }) {
  const page = new URL(request.url).searchParams.get("page") || "";
  if (!okPage(page)) return json({ comments: [] }, 400);
  if (!env.DB) return json({ comments: [], open: false });
  await ensure(env.DB);
  const { results } = await env.DB.prepare(`SELECT name, body, reply, created FROM comments WHERE page = ?1 AND status = 'approved' ORDER BY id DESC LIMIT 100`).bind(page).all();
  return json({ comments: results || [], open: true });
}

export async function onRequestPost({ request, env }) {
  let b; try { b = await request.json(); } catch { return json({ ok: false, message: "Bad request." }, 400); }
  if (b.website) return json({ ok: true, message: "Thanks! Your comment will appear after review." });   // honeypot
  const page = String(b.page || ""), name = String(b.name || "").replace(/\s+/g, " ").trim().slice(0, 40), body = String(b.body || "").trim().slice(0, 1000);
  if (!okPage(page)) return json({ ok: false, message: "Bad request." }, 400);
  if (name.length < 2) return json({ ok: false, message: "Add your name (or a nickname)." }, 400);
  if (body.length < 3) return json({ ok: false, message: "Write a question or comment first." }, 400);
  if (!env.DB) return json({ ok: false, message: "Comments open soon." }, 503);
  await ensure(env.DB);
  const iph = await ipHash(request);
  if (await tooMany(env.DB, "comments", iph, 5)) return json({ ok: false, message: "You've posted a lot in the last hour. Try again later." }, 429);
  await env.DB.prepare(`INSERT INTO comments (page, name, body, created, iph) VALUES (?1, ?2, ?3, ?4, ?5)`).bind(page, name, body, new Date().toISOString(), iph).run();
  return json({ ok: true, message: "Thanks! Your comment will appear after a quick review." });
}
export const onRequest = () => json({ ok: false, message: "Method not allowed" }, 405);
