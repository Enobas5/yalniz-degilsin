// Siteyi iki dilde üretir: index.html (Türkçe) ve en/index.html (İngilizce).
// Kaynak metin Türkçedir: src/template.html ve src/data.js. Çeviriler src/en.json içinde { "Türkçe": "English" }.
// Kullanım: node src/build.js          (çevrilmemiş metin varsa listeler ve hata koduyla biter)
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const { T, S, M } = require("./data.js");
const template = fs.readFileSync(path.join(__dirname, "template.html"), "utf8").replace(/\r\n/g, "\n");
const dictPath = path.join(__dirname, "en.json");
const dict = fs.existsSync(dictPath) ? JSON.parse(fs.readFileSync(dictPath, "utf8")) : {};
const SITE = "https://enobas5.github.io/yalniz-degilsin/";
const miss = new Map();
const used = new Set();

function build(lang) {
const en = lang === "en";
const t_ = (s) => {
  if (!en) return s;
  if (Object.prototype.hasOwnProperty.call(dict, s)) { used.add(s); return dict[s]; }
  miss.set(s, true);
  return s;
};

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const phase = { bas: t_("Tanışma ve başlangıç"), ic: t_("İlişkinin içinde"), son: t_("Ayrılık ve sonrası"), dij: t_("Dijital") };
const pad = "            ";

// Her kavramın kendi kaynağı (İngilizce adına göre)
const L = (href, text) => `<a href="${href}">${t_(text)}</a>`;
const TSRC = {
  "Love bombing / Future faking": [L("https://health.clevelandclinic.org/love-bombing", "Cleveland Clinic, Love bombing")],
  "Gaslighting": [L("https://www.acibadem.com.tr/saglikli-yasam/manipulasyon-nedir-gaslighting-ve-psikolojik-manipulasyon/", "Acıbadem, Gaslighting")],
  "Emotional abuse": [L("https://www.mevzuat.gov.tr/mevzuatmetin/1.5.6284.pdf", "6284 sayılı Kanun")],
  "Silent treatment / Stonewalling": [L("https://health.clevelandclinic.org/stonewalling-in-a-relationship", "Cleveland Clinic, Stonewalling")],
  "DARVO": [L("https://www.womenslaw.org/about-abuse/forms-abuse/emotional-and-psychological-abuse/forms-emotional-and-psychological-abuse-3", "WomensLaw, DARVO")],
  "Trauma bonding": [L("https://health.clevelandclinic.org/trauma-bonding", "Cleveland Clinic, Trauma bonding"), L("https://www.psychologytoday.com/us/basics/trauma-bonding", "Psychology Today, Trauma bonding")],
  "Ghosting / Orbiting / Zombieing": [L("https://news.cuanschutz.edu/news-stories/a-psychotherapist-breaks-down-some-perils-of-digital-dating-and-how-to-cope", "Colorado Üniversitesi, Ghosting ve orbiting")],
  "Sextortion": [L("https://www.mevzuat.gov.tr/mevzuatmetin/1.5.5237.pdf", "Türk Ceza Kanunu, madde 107")],
  "Revenge porn / Image-based abuse": [L("https://www.mevzuat.gov.tr/mevzuatmetin/1.5.5237.pdf", "Türk Ceza Kanunu, madde 73, 134, 139 ve 226"), L("https://stopncii.org/?lang=tr-tr", "StopNCII (18 yaş üstü, Türkçe)")],
  "Cyberstalking": [L("https://www.mevzuat.gov.tr/mevzuatmetin/1.5.5237.pdf", "Türk Ceza Kanunu, madde 123/A")],
  "Hoovering": [L("https://health.clevelandclinic.org/hoovering", "Cleveland Clinic, Hoovering")],
};
const SSRC = {
  "Pubic lice": [L("https://gesund.bund.de/tr/filzlaeuse", "Almanya Sağlık Bakanlığı (Türkçe), Kasık biti")],
  "Scabies": [L("https://halksagligi.hacettepe.edu.tr/duyurular/halkayonelik/uyuz2024.pdf", "Hacettepe Üniversitesi Halk Sağlığı, Uyuz")],
  "Molluscum contagiosum": [L("https://gesund.bund.de/tr/dellwarzen", "Almanya Sağlık Bakanlığı (Türkçe), Molluskum kontagiozum")],
  "Mpox": [L("https://www.istabip.org.tr/site_icerik/2024/agustos/maymun-cicegi-bilgi-notu.pdf", "İstanbul Tabip Odası, Mpox")],
  "Gonorrhea": [L("https://www.who.int/news-room/fact-sheets/detail/sexually-transmitted-infections-%28stis%29", "Dünya Sağlık Örgütü, CYBE bilgi notu")],
};
const src = (list) => (list ? `\n${pad}    <p class="src">${t_("Kaynak:")} ${list.join(" · ")}</p>` : "");

const names = (x) => en ? `<span class="acc__t">${esc(x.en)}</span><span class="acc__en" lang="tr">${esc(x.tr)}</span>` : `<span class="acc__t">${esc(x.tr)}</span><span class="acc__en" lang="en">${esc(x.en)}</span>`;
const terms = T.map((t) => `${pad}<li${t.id ? ` id="${t.id}"` : ""} data-cat="${t.f}"><details class="acc">
${pad}  <summary><span>${names(t)}</span><span class="acc__cat">${phase[t.f]}</span></summary>
${pad}  <div class="acc__body">
${pad}    <p>${esc(t_(t.d))}</p>
${pad}    <p class="q"><span class="k">${t_("Örnek")}</span>${esc(t_(t.q))}</p>
${pad}    <p><span class="k">${t_("Ne yapabilirsin")}</span>${esc(t_(t.x))}</p>${src(TSRC[t.en])}
${pad}  </div>
${pad}</details></li>`).join("\n");

const cLbl = { ok: `<span class="ok">${t_("İyileşir")}</span>`, mid: t_("Kalıcı ama kontrol edilir") };
const stis = S.map((s) => `${pad}<li data-cat="${s.c}${s.skin ? " skin" : ""}"><details class="acc">
${pad}  <summary><span>${names(s)}</span><span class="acc__cat">${cLbl[s.c]}${s.skin ? " · " + t_("Ten temasıyla da") : ""}</span></summary>
${pad}  <div class="acc__body">
${pad}    <p><span class="k">${t_("Nasıl bulaşır")}</span>${esc(t_(s.b))}</p>
${pad}    <p><span class="k">${t_("Belirtiler")}</span>${esc(t_(s.s))}</p>
${pad}    <p><span class="k">${t_("Tedavi")}</span>${esc(t_(s.t))}</p>
${pad}    <p><span class="k">${t_("Korunma ve test")}</span>${esc(t_(s.k))}</p>${src(SSRC[s.en])}
${pad}  </div>
${pad}</details></li>`).join("\n");

const missing = Object.keys(TSRC).filter((k) => !T.some((t) => t.en === k)).concat(Object.keys(SSRC).filter((k) => !S.some((s) => s.en === k)));
if (missing.length) console.warn("Eşleşmeyen kaynak anahtarı:", missing);

// Madde kartları: sıra, "en hafif" sanılandan en ağırına
const madde = M.map((m, i) => `${pad}<li id="madde-k${i + 1}"><details class="acc">
${pad}  <summary><span><span class="acc__t"><span class="rank">${i + 1}</span>${esc(t_(m.tr))}</span>${en ? `<span class="acc__en" lang="tr">${esc(m.tr)}</span>` : m.en ? `<span class="acc__en">${esc(m.en)}</span>` : ""}</span></summary>
${pad}  <div class="acc__body">
${pad}    <p class="myth"><span class="k">${t_("Sanılan")}</span><s>${esc(t_(m.sanilan))}</s></p>
${pad}    <div><span class="k">${t_("Gerçek")}</span><ul class="d">${m.gercek.map((g) => `<li>${esc(t_(g))}</li>`).join("")}</ul></div>
${pad}    <p class="src">${t_("Kaynak:")} ${m.src.map(([h, t]) => `<a href="${h}">${t_(t)}</a>`).join(" · ")}</p>
${pad}  </div>
${pad}</details></li>`).join("\n");

// Linkler ve numaralar yeniden kontrol edildiğinde bu tarihi güncelle
const CHECKED = ["2026-11-25", t_("25 Kasım 2026")];

// Giriş grafiği: nokta ızgarası. Sabit tohumlu rastgelelik, her derlemede aynı desen.
function dots(cols, rows, you, cls, seed) {
  let x = seed;
  const rnd = () => ((x = (x * 1664525 + 1013904223) % 4294967296) / 4294967296);
  const gap = 24, r = 3, w = cols * gap, h = rows * gap;
  const out = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const cx = i * gap + gap / 2, cy = j * gap + gap / 2;
    const d = Math.hypot(i - you[0], j - you[1]);
    if (d === 0) {
      out.push(`<circle class="ring" cx="${cx}" cy="${cy}" r="9"/><circle class="you" cx="${cx}" cy="${cy}" r="6"/>`);
      continue;
    }
    const on = rnd() < Math.max(0, 0.95 - d * 0.085);   // yakındakiler büyük olasılıkla yanar
    out.push(on ? `<circle class="on" style="--d:${d.toFixed(1)}" cx="${cx}" cy="${cy}" r="${r}"/>` : `<circle cx="${cx}" cy="${cy}" r="${r}"/>`);
  }
  return `    <svg class="dots ${cls}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${t_("Soluk noktalarla dolu bir ızgara. Ortadaki tek yeşil noktanın çevresindeki noktalar parlak; yeşil nokta yalnız değil.")}">\n      ${out.join("")}\n    </svg>`;
}
const hero = dots(48, 13, [30, 6], "dots--lg", 7) + "\n" + dots(15, 12, [9, 5], "dots--sm", 11);

// Alt başlıklara kimlik ver ve her bölüm bandına "Bu bölümde" atlama bağlantılarını yaz
function chapters(src) {
  return src.replace(/<section id="(\w+)" class="chapter grid"[\s\S]*?<\/section>/g, (sec, cid) => {
    let n = 0;
    const subs = [];
    sec = sec.replace(/(<div class="block fade-up">\s*)<h3 class="label"(?: id="([^"]+)")?( data-acik)?(?: data-k="([^"]*)")?>([\s\S]*?)<\/h3>/g, (m, pre, id, acik, k, t) => {
      n++;
      const hid = id || `${cid}-${n}`;
      subs.push([hid, t.trim()]);
      return `${pre}<h3 id="${hid}"${acik || ""}${k ? ` data-k="${k}"` : ""}>${t}</h3>`;
    });
    const jump = subs.length
      ? `<nav class="jump fade-up" aria-label="${(sec.match(/class="chapter__name">([^<]+)</) || [, ""])[1]}: ${t_("bu bölümde")}"><span class="jump__t">${t_("Bu bölümde")}</span>${subs.map(([id, t], i) => `<a href="#${id}"><b>${String(i + 1).padStart(2, "0")}</b>${t}</a>`).join("")}</nav>`
      : "";
    return sec.replace("{{JUMP}}", jump);
  });
}


// ---- şablonu çevir ----
// Satır içi etiketler (<strong>, <a>…) numaralı yer tutucuya çevrilir: "Hemen <1>112</1>'yi ara".
const INLINE = /^(strong|b|em|i|a|q|s|time|abbr)$/;
const hasWord = (s) => /\p{L}{2,}/u.test(s.replace(/<[^>]+>/g, "").replace(/\{\{\w+\}\}/g, ""));
function segment(run) {
  const tok = run.match(/<[^>]+>|[^<]+/g) || [];
  let a = 0, z = tok.length;
  const isTag = (x) => x[0] === "<", isClose = (x) => x[1] === "/", blank = (x) => !isTag(x) && !x.trim();
  const match = (i) => { let d = 0; for (let j = i; j < z; j++) if (isTag(tok[j])) { d += isClose(tok[j]) ? -1 : 1; if (d === 0) return j; } return -1; };
  const back = (i) => { let d = 0; for (let j = i; j >= a; j--) if (isTag(tok[j])) { d += isClose(tok[j]) ? 1 : -1; if (d === 0) return j; } return -1; };
  for (let go = true; go && a < z;) {
    go = false;
    if (blank(tok[a]) || (isTag(tok[a]) && (isClose(tok[a]) || match(a) === -1))) { a++; go = true; continue; }
    if (blank(tok[z - 1]) || (isTag(tok[z - 1]) && (!isClose(tok[z - 1]) || back(z - 1) === -1))) { z--; go = true; continue; }
    if (isTag(tok[a]) && match(a) === z - 1) { a++; z--; go = true; }
  }
  const core = tok.slice(a, z), open = [], stack = [];
  let key = "";
  for (const x of core) {
    if (!isTag(x)) key += x;
    else if (isClose(x)) key += `</${stack.pop()}>`;
    else { open.push(x); stack.push(open.length); key += `<${open.length}>`; }
  }
  const lead = key.match(/^\s*/)[0], trail = key.match(/\s*$/)[0];
  key = key.trim().replace(/\s+/g, " ");
  if (!hasWord(key)) return run;
  let out = t_(key);
  out = out.replace(/<(\/?)(\d+)>/g, (m, c, n) => { const o = open[n - 1]; return c ? `</${o.match(/^<(\w+)/)[1]}>` : o; });
  return tok.slice(0, a).join("") + lead + out + trail + tok.slice(z).join("");
}
function translate(html) {
  const cut = html.lastIndexOf("<script>");
  let page = html.slice(0, cut), js = html.slice(cut);
  const st = page.indexOf("<script>"), en1 = page.indexOf("</style>") + 8;
  let head = page.slice(0, st), keep = page.slice(st, en1), bodyHtml = page.slice(en1);
  head = head.replace(/<title>([^<]*)</, (m, x) => `<title>${t_(x)}<`)
    .replace(/(<meta (?:name="description"|property="og:(?:title|description|image:alt)") content=")([^"]*)"/g, (m, p, x) => `${p}${t_(x)}"`)
    .replace("tr_TR", "en_GB").replace("img/paylasim.png", "img/share-en.png");
  // nitelikler
  bodyHtml = bodyHtml.replace(/ (aria-label|placeholder|data-label|data-k)="([^"]*)"/g, (m, n, v) => (hasWord(v) ? ` ${n}="${t_(v)}"` : m));
  const parts = bodyHtml.match(/<!--[\s\S]*?-->|<[^>]+>|[^<]+/g);
  let out = "", run = "", inSrc = false;
  const flush = () => { if (run) { out += hasWord(run) ? segment(run) : run; run = ""; } };
  for (const x of parts) {
    const name = (x.match(/^<\/?([a-z0-9]+)/i) || [])[1];
    if (/^<p class="src"/.test(x)) inSrc = true;
    if (x[0] !== "<") run += x;
    else if (!x.startsWith("<!--") && name && INLINE.test(name) && !inSrc) run += x;
    else { flush(); out += x; }
    if (inSrc && x === "</p>") inSrc = false;
  }
  flush();
  // betikteki arayüz metinleri
  js = js.replace(/"([^"\n]*)"/g, (m, x) => (JS.includes(x) ? JSON.stringify(t_(x)) : m))
    .replace(/Sonuç yok\. Başka bir kelime dene ya da <a href="#rehber">Rehber<\/a> bölümüne bak\./, () => t_('Sonuç yok. Başka bir kelime dene ya da <a href="#rehber">Rehber</a> bölümüne bak.'));
  return (head + keep + out + js)
    .replace('<html lang="tr"', '<html lang="en"')
    .replace(/(["(])(fonts|img)\//g, "$1../$2/")
    // İngilizce menü daha uzun: sıkışık düzene daha erken geç
    .replaceAll("max-width: 1190px", "max-width: 1295px").replaceAll("min-width: 1190.02px", "min-width: 1295.02px").replaceAll("max-width: 1345px", "max-width: 1485px").replaceAll("max-width: 1630px", "max-width: 1810px");
}
const JS = ["Koyu tema", "Açık tema", "Sonuç sayısı: ", "Sonuç yok", " · kart", " kavram gösteriliyor", " enfeksiyon gösteriliyor", "Hepsini kapat", "Hepsini aç", "Gizli kalmak", "Gizlilik", "Rehber"];

let tpl = template;
if (en) tpl = translate(tpl);
const html = chapters(tpl)
  .replaceAll("{{CHECKED}}", `<p class="checked">${t_("Linkler ve numaralar son kontrol:")} <time datetime="${CHECKED[0]}">${CHECKED[1]}</time></p>`)
  .replaceAll("{{ALT_HREF}}", en ? "../" : "en/").replaceAll("{{ALT_LANG}}", en ? "tr" : "en").replaceAll("{{ALT_NAME}}", en ? "Türkçe" : "English")
  .replaceAll("{{URL}}", SITE + (en ? "en/" : ""))
  .replace("{{EN_NOTE}}", en ? `  <p>This is a translation; the Turkish page is the original. The laws, services and phone numbers are those of Türkiye. Some helplines may answer only in Turkish, so ask whether someone speaks your language.</p>\n` : "")
  .replace("{{HERO}}", hero)
  .replace("{{TERMS}}", terms).replace("{{STIS}}", stis)
  .replace("{{MADDE}}", madde).replaceAll("{{T_COUNT}}", T.length).replace("{{S_COUNT}}", S.length);
// iki ve daha çok kaynağı olan satırlar katlanır; tek kaynak açık kalır
const folded = html.replace(/<p class="src">([\s\S]*?)<\/p>/g, (m, x) => {
  const n = (x.match(/<a /g) || []).length, label = t_("Kaynak:");
  if (n < 2 || !x.startsWith(label)) return m;
  return `<details class="srcs"><summary>${t_("Kaynaklar")} (${n})</summary><p class="src">${x.slice(label.length).trim()}</p></details>`;
});
const out = path.join(ROOT, en ? "en/index.html" : "index.html");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, folded);
console.log("ok", lang, html.length);
}

build("tr");
build("en");
// arama motorları için (alan adı değişince SITE'ı güncellemek yeter)
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${["", "en/"].map((x) => `<url><loc>${SITE}${x}</loc><xhtml:link rel="alternate" hreflang="tr" href="${SITE}"/><xhtml:link rel="alternate" hreflang="en" href="${SITE}en/"/></url>`).join("\n")}
</urlset>
`);
fs.writeFileSync(path.join(ROOT, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${SITE}sitemap.xml\n`);
if (miss.size) {
  fs.writeFileSync(path.join(__dirname, "missing.json"), JSON.stringify([...miss.keys()], null, 1));
  console.warn("Çevrilmemiş:", miss.size, "→ src/missing.json");
  process.exitCode = 1;
}
const stale = Object.keys(dict).filter((k) => !used.has(k));
if (stale.length) console.warn("Kullanılmayan çeviri:", stale.length, stale.slice(0, 5));
