// Kavram ve enfeksiyon satırlarını statik HTML olarak üretip şablona yerleştirir.
const fs = require("fs");
const path = require("path");
const [, , tplPath, dataPath, outPath] = process.argv;
const { T, S, M } = require(path.resolve(dataPath));

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const phase = { bas: "Tanışma ve başlangıç", ic: "İlişkinin içinde", son: "Ayrılık ve sonrası", dij: "Dijital" };
const pad = "            ";

// Her kavramın kendi kaynağı (İngilizce adına göre)
const L = (href, text) => `<a href="${href}">${text}</a>`;
const TSRC = {
  "Love bombing": [L("https://health.clevelandclinic.org/love-bombing", "Cleveland Clinic, Love bombing")],
  "Gaslighting": [L("https://www.acibadem.com.tr/saglikli-yasam/manipulasyon-nedir-gaslighting-ve-psikolojik-manipulasyon/", "Acıbadem, Gaslighting")],
  "Emotional abuse": [L("https://www.mevzuat.gov.tr/mevzuatmetin/1.5.6284.pdf", "6284 sayılı Kanun")],
  "Silent treatment / Stonewalling": [L("https://health.clevelandclinic.org/stonewalling-in-a-relationship", "Cleveland Clinic, Stonewalling")],
  "DARVO": [L("https://www.womenslaw.org/about-abuse/forms-abuse/emotional-and-psychological-abuse/forms-emotional-and-psychological-abuse-3", "WomensLaw, DARVO")],
  "Trauma bonding": [L("https://health.clevelandclinic.org/trauma-bonding", "Cleveland Clinic, Trauma bonding"), L("https://www.psychologytoday.com/us/basics/trauma-bonding", "Psychology Today, Trauma bonding")],
  "Ghosting": [L("https://news.cuanschutz.edu/news-stories/a-psychotherapist-breaks-down-some-perils-of-digital-dating-and-how-to-cope", "Colorado Üniversitesi, Ghosting ve orbiting")],
  "Orbiting": [L("https://news.cuanschutz.edu/news-stories/a-psychotherapist-breaks-down-some-perils-of-digital-dating-and-how-to-cope", "Colorado Üniversitesi, Ghosting ve orbiting")],
  "Sextortion": [L("https://www.mevzuat.gov.tr/mevzuatmetin/1.5.5237.pdf", "Türk Ceza Kanunu, madde 107")],
  "Revenge porn / Image-based abuse": [L("https://www.mevzuat.gov.tr/mevzuatmetin/1.5.5237.pdf", "Türk Ceza Kanunu, madde 73, 134 ve 139")],
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
const src = (list) => (list ? `\n${pad}    <p class="src">Kaynak: ${list.join(" · ")}</p>` : "");

const terms = T.map((t) => `${pad}<li data-cat="${t.f}"><details class="acc">
${pad}  <summary><span><span class="acc__t">${esc(t.tr)}</span><span class="acc__en" lang="en">${esc(t.en)}</span></span><span class="acc__cat">${phase[t.f]}</span></summary>
${pad}  <div class="acc__body">
${pad}    <p>${esc(t.d)}</p>
${pad}    <p class="q"><span class="k">Örnek</span>${esc(t.q)}</p>
${pad}    <p><span class="k">Ne yapabilirsin</span>${esc(t.x)}</p>${src(TSRC[t.en])}
${pad}  </div>
${pad}</details></li>`).join("\n");

const cLbl = { ok: '<span class="ok">İyileşir</span>', mid: "Kalıcı ama kontrol edilir" };
const stis = S.map((s) => `${pad}<li data-cat="${s.c}${s.skin ? " skin" : ""}"><details class="acc">
${pad}  <summary><span><span class="acc__t">${esc(s.tr)}</span><span class="acc__en" lang="en">${esc(s.en)}</span></span><span class="acc__cat">${cLbl[s.c]}${s.skin ? " · Ten temasıyla da" : ""}</span></summary>
${pad}  <div class="acc__body">
${pad}    <p><span class="k">Nasıl bulaşır</span>${esc(s.b)}</p>
${pad}    <p><span class="k">Belirtiler</span>${esc(s.s)}</p>
${pad}    <p><span class="k">Tedavi</span>${esc(s.t)}</p>
${pad}    <p><span class="k">Korunma ve test</span>${esc(s.k)}</p>${src(SSRC[s.en])}
${pad}  </div>
${pad}</details></li>`).join("\n");

const missing = Object.keys(TSRC).filter((k) => !T.some((t) => t.en === k)).concat(Object.keys(SSRC).filter((k) => !S.some((s) => s.en === k)));
if (missing.length) console.warn("Eşleşmeyen kaynak anahtarı:", missing);

// Madde kartları: sıra, "en hafif" sanılandan en ağırına
const madde = M.map((m, i) => `${pad}<li id="madde-k${i + 1}" style="--r:${((i + 1) / M.length * 100).toFixed(0)}%"><details class="acc">
${pad}  <summary><span><span class="acc__t"><span class="rank">${i + 1}</span>${esc(m.tr)}</span><span class="acc__en">${esc(m.en)}</span></span><span class="acc__cat"><span class="riskbar" aria-hidden="true"></span></span></summary>
${pad}  <div class="acc__body">
${pad}    <p class="myth"><span class="k">Sanılan</span><s>${esc(m.sanilan)}</s></p>
${pad}    <div><span class="k">Gerçek</span><ul class="d">${m.gercek.map((g) => `<li>${esc(g)}</li>`).join("")}</ul></div>
${pad}    <p class="src">Kaynak: ${m.src.map(([h, t]) => `<a href="${h}">${t}</a>`).join(" · ")}</p>
${pad}  </div>
${pad}</details></li>`).join("\n");

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
  return `    <svg class="dots ${cls}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Soluk noktalarla dolu bir ızgara. Ortadaki tek yeşil noktanın çevresindeki noktalar parlak; yeşil nokta yalnız değil.">\n      ${out.join("")}\n    </svg>`;
}
const hero = dots(48, 13, [30, 6], "dots--lg", 7) + "\n" + dots(15, 12, [9, 5], "dots--sm", 11);

// Alt başlıklara kimlik ver ve her bölüm bandına "Bu bölümde" atlama bağlantılarını yaz
function chapters(src) {
  return src.replace(/<section id="(\w+)" class="chapter grid"[\s\S]*?<\/section>/g, (sec, cid) => {
    let n = 0;
    const subs = [];
    sec = sec.replace(/(<div class="block fade-up">\s*)<h3 class="label"(?: id="([^"]+)")?>([\s\S]*?)<\/h3>/g, (m, pre, id, t) => {
      n++;
      const hid = id || `${cid}-${n}`;
      subs.push([hid, t.trim()]);
      return `${pre}<h3 id="${hid}">${t}</h3>`;
    });
    const jump = subs.length
      ? `<nav class="jump fade-up" aria-label="${(sec.match(/class="chapter__name">([^<]+)</) || [, ""])[1]}: bu bölümde"><span class="jump__t">Bu bölümde</span>${subs.map(([id, t], i) => `<a href="#${id}"><b>${String(i + 1).padStart(2, "0")}</b>${t}</a>`).join("")}</nav>`
      : "";
    return sec.replace("{{JUMP}}", jump);
  });
}

const html = chapters(fs.readFileSync(tplPath, "utf8"))
  .replace("{{HERO}}", hero)
  .replace("{{TERMS}}", terms).replace("{{STIS}}", stis)
  .replace("{{MADDE}}", madde).replace("{{T_COUNT}}", T.length).replace("{{S_COUNT}}", S.length);
fs.writeFileSync(outPath, html);
console.log("ok", html.length);
