// Shared helpers for the site's own Cloudflare D1 database (binding name "DB").
export const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json", "cache-control": "no-store" } });

let ready = false;
export async function ensure(db) {
  if (ready) return;
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS subscribers (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL, first TEXT, last TEXT,
      source TEXT, status TEXT NOT NULL DEFAULT 'active', synced INTEGER NOT NULL DEFAULT 0, created TEXT NOT NULL, iph TEXT)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS comments (id INTEGER PRIMARY KEY AUTOINCREMENT, page TEXT NOT NULL, name TEXT NOT NULL, body TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending', reply TEXT, created TEXT NOT NULL, iph TEXT)`),
    db.prepare(`CREATE INDEX IF NOT EXISTS comments_page ON comments(page, status)`)
  ]);
  ready = true;
}

// One-way hash of the visitor's IP plus today's date: lets us rate-limit spam without storing IP addresses.
export async function ipHash(request) {
  const ip = request.headers.get("cf-connecting-ip") || "0";
  const d = new TextEncoder().encode(ip + "|" + new Date().toISOString().slice(0, 10) + "|scp");
  const h = await crypto.subtle.digest("SHA-256", d);
  return [...new Uint8Array(h)].slice(0, 12).map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function tooMany(db, table, iph, limit) {
  const r = await db.prepare(`SELECT COUNT(*) AS n FROM ${table} WHERE iph = ?1 AND created > ?2`)
    .bind(iph, new Date(Date.now() - 3600e3).toISOString()).first();
  return (r && r.n) >= limit;
}
