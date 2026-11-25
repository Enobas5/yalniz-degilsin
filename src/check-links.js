// Sayfadaki dış bağlantıları kontrol eder. Kullanım: node src/check-links.js
// Kesin bozuk (404, 410, hata sayfası) ile "buradan kontrol edilemedi" (403, zaman aşımı…) ayrı listelenir:
// bazı kamu siteleri yurt dışındaki sunuculardan gelen istekleri engelliyor, bu bozuk demek değildir.
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const own = "https://enobas5.github.io/yalniz-degilsin/";
const urls = new Set();
for (const f of ["index.html", "en/index.html"]) {
  const html = fs.readFileSync(path.join(ROOT, f), "utf8");
  for (const m of html.matchAll(/<a [^>]*href="(https?:[^"]+)"/g)) urls.add(m[1].replace(/&amp;/g, "&"));
}
const list = [...urls].filter((u) => !u.startsWith(own) && !u.startsWith("https://wa.me/"));
const BAD = /ErrorPage|\/404(\b|\.)/i;

async function check(u) {
  let why = "";
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(u, { redirect: "follow", signal: AbortSignal.timeout(40000), headers: { "User-Agent": "Mozilla/5.0 (compatible; link-kontrol)", "Accept-Language": "tr" } });
      if (r.body) r.body.cancel().catch(() => {});
      if (r.status === 404 || r.status === 410 || BAD.test(r.url)) return { u, s: "bozuk", why: String(r.status) };
      if (r.ok) return { u, s: "ok" };
      why = String(r.status);
      if (r.status === 403) break;
    } catch (e) {
      why = (e.cause && e.cause.code) || e.name;
      if (why === "ENOTFOUND" && i === 2) return { u, s: "bozuk", why };
    }
    await new Promise((x) => setTimeout(x, 3000));
  }
  return { u, s: "belirsiz", why };
}

(async () => {
  const out = [];
  const q = list.slice();
  await Promise.all(Array.from({ length: 6 }, async () => { while (q.length) out.push(await check(q.shift())); }));
  const pick = (s) => out.filter((x) => x.s === s).map((x) => `- ${x.u} (${x.why})`).join("\n");
  const bad = pick("bozuk"), unk = pick("belirsiz");
  const md = `${list.length} bağlantı kontrol edildi.\n\n## Bozuk\n${bad || "Yok"}\n\n## Buradan kontrol edilemedi (tarayıcıda elle bak)\n${unk || "Yok"}\n`;
  console.log(md);
  fs.writeFileSync(path.join(ROOT, "link-raporu.md"), md);
  if (bad) process.exitCode = 1;
})();
