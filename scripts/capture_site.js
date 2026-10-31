// Real captures of the live site for videos: node scripts/capture_site.js [baseUrl] [outDir]
// Build the site first (python3 site/build.py) and serve site/_site, e.g. `python3 -m http.server 8765 -d site/_site`.
const {chromium} = require('playwright');
const base = process.argv[2] || 'http://localhost:8765';
const out = (process.argv[3] || 'animator/previews/overview_site') + '/';
const shots = [['home', '/', 0], ['finder', '/#finder', null], ['streams', '/streams/', 0], ['stream', '/streams/ugc/', 0], ['tools', '/tools/', 0], ['tracker', '/tracker/', 0], ['guide', '/guide/', 0]];
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 1000, height: 1120}});
  for (const [n, u, y] of shots) {
    await p.goto(base + u, {waitUntil: 'networkidle'}); await p.waitForTimeout(700);
    if (y !== null) await p.evaluate((v) => window.scrollTo(0, v), y);
    await p.waitForTimeout(500); await p.screenshot({path: out + n + '.png'}); console.log(n);
  }
  await b.close();
})();
