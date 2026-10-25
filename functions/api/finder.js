// AI income finder: POST /api/finder  {text, followers, platform, enjoy}
// Scores verified income streams with simple rules, then (if the Workers AI binding "AI" is set) lets an AI model
// re-rank them and personalise the wording. Pay figures always come from our verified data, never from the model.
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json", "cache-control": "no-store" } });

function rules(db, b) {
  const f = +b.followers || 0, nb = /cook|food|beauty|skin|tech|home|fitness|fashion|travel|pet/i.test(b.text) ? 5 : 0;
  return db.filter(x => !(x.min && f < x.min)).map(x => ({
    slug: x.slug, name: x.name, score: Math.min(96, 55 + (x.enjoy.includes(b.enjoy) ? 30 : 0) + (x.plat.includes(b.platform) ? 5 : 0) + nb),
    why: x.why, pay: x.pay, first: x.first
  })).sort((a, b) => b.score - a.score);
}

export async function onRequestPost({ request, env }) {
  let b;
  try { b = await request.json(); } catch { return json({ error: "Bad request" }, 400); }
  if (b.website) return json({ matches: [] });                       // honeypot
  const text = String(b.text || "").slice(0, 300).trim();
  if (text.length < 3) return json({ error: "Tell us a little about your account." }, 400);
  const ok = (v, list) => list.includes(String(v)) ? String(v) : list[0];
  const q = { text, followers: ok(b.followers, ["0", "1", "2", "3"]), platform: ok(b.platform, ["ig", "tt", "yt"]), enjoy: ok(b.enjoy, ["film", "rec", "make", "write"]) };
  const db = await env.ASSETS.fetch(new URL("/static/finder.json", request.url)).then(r => r.json());
  let matches = rules(db, q).slice(0, 3), summary = "", engine = env.AI ? "ai-pending" : "rules";
  if (env.AI) {
    try {
      const fl = ["0-1k", "1k-5k", "5k-10k", "10k+"][+q.followers], pl = { ig: "Instagram", tt: "TikTok", yt: "YouTube" }[q.platform];
      const opts = rules(db, q).map(x => `${x.slug}: ${x.name}. ${x.why}`).join("\n");
      const prompt = `A creator describes their account: "${text}". Followers: ${fl}. Platform: ${pl}. They enjoy: ${q.enjoy}.\n` +
        `Choose the 3 best income streams ONLY from this list (use the slug exactly):\n${opts}\n` +
        `Reply with JSON only: {"summary":"one friendly sentence about their best path, no numbers","picks":[{"slug":"...","score":50-97,"first":"one specific first step for THIS creator, max 20 words, no money figures"}]}`;
      const r = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", { messages: [
        { role: "system", content: "You match small creators to income streams. Only use the slugs given. Never invent pay figures, programs or guarantees. Plain, professional English." },
        { role: "user", content: prompt }], max_tokens: 400 });
      const raw = r && r.response, m = typeof raw === "object" && raw ? null : String(raw || "").match(/\{[\s\S]*\}/);
      engine = "ai-unparsed";
      if (m || (raw && typeof raw === "object")) {
        const out = m ? JSON.parse(m[0]) : raw; const bySlug = Object.fromEntries(db.map(x => [x.slug, x]));
        const picks = (out.picks || []).filter(p => bySlug[p.slug]).slice(0, 3).map(p => ({
          slug: p.slug, name: bySlug[p.slug].name, score: Math.max(40, Math.min(97, parseInt(p.score) || 60)),
          why: bySlug[p.slug].why, pay: bySlug[p.slug].pay,
          first: String(p.first || bySlug[p.slug].first).replace(/\$\s?\d[\d,.]*/g, "").replace(/\s{2,}/g, " ").trim().slice(0, 160)
        }));
        for (const x of rules(db, q)) { if (picks.length >= 3) break; if (!picks.some(p => p.slug === x.slug)) picks.push(x); }
        if (picks.length) { matches = picks; engine = "ai"; summary = String(out.summary || "").replace(/\$\s?\d[\d,.]*/g, "").slice(0, 240); }
      }
    } catch (e) { engine = "ai-error"; console.log("finder AI error", String(e && e.message || e)); }
  }
  return json({ matches, summary, ai: engine === "ai", engine });
}
export const onRequest = () => json({ error: "Use POST" }, 405);
