/**
 * Generate SEO micro landings under convert/, tr/convert/, calculators/, tr/calculators/
 * Run: node scripts/generate-micro-pages.cjs
 */
"use strict";

const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
/** ISO date in JSON-LD + visible “last updated” on micro landings. Bump when regenerating at scale. */
const SCHEMA_DATE_MODIFIED = "2026-04-26";
const { HOST, UNIT_PAIRS, CALC_SPOKES } = require("./micro-routes.cjs");
const { convertPairValue } = require("./micro-convert-helpers.cjs");

const SYMS = {
  centimeter: "cm", inch: "in", meter: "m", foot: "ft", kilometer: "km", mile: "mi", millimeter: "mm", yard: "yd",
  kilogram: "kg", pound: "lb", gram: "g", ounce: "oz", stone: "st", metric_ton: "t",
  c: "°C", f: "°F", k: "K", liter: "L", us_gallon: "gal (US)", milliliter: "mL", us_fl_oz: "fl oz (US)",
  kilometer_per_hour: "km/h", mile_per_hour: "mph", knot: "kn",
  megabyte: "MB", gigabyte: "GB", terabyte: "TB", kilobyte: "KB",
  square_meter: "m²", square_foot: "ft²", acre: "ac", hectare: "ha", square_kilometer: "km²",
};

function microContentUpdatedP(lang) {
  if (lang === "tr") {
    return '<p class="lp-micro-updated" style="text-align:center;font-size:.68rem;opacity:.72;margin:1rem 0 0 0">İçerik son güncelleme: 26 Nisan 2026</p>';
  }
  return '<p class="lp-micro-updated" style="text-align:center;font-size:.68rem;opacity:.72;margin:1rem 0 0 0">Content last updated: 26 April 2026</p>';
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function titleCaseSlug(slug) {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

/* Human-readable unit names (EN) for H1 — keep in sync with js/units.js labels. */
const EN_LONG = {
  centimeter: "centimeters", inch: "inches", meter: "meters", foot: "feet", millimeter: "millimeters", yard: "yards",
  kilometer: "kilometers", mile: "miles", kilogram: "kilograms", pound: "pounds", gram: "grams", ounce: "ounces",
  stone: "stone", metric_ton: "metric tons", c: "Celsius", f: "Fahrenheit", k: "kelvin", liter: "liters",
  us_gallon: "US gallons", milliliter: "milliliters", us_fl_oz: "US fluid ounces",
  kilometer_per_hour: "km/h", mile_per_hour: "mph", knot: "knots", megabyte: "MB", gigabyte: "GB", terabyte: "TB",
  kilobyte: "KB", square_meter: "square meters", square_foot: "square feet", acre: "acres", hectare: "hectares",
  square_kilometer: "square kilometers",
};

const TR_LONG = {
  centimeter: "santimetre (cm)", inch: "inç", meter: "metre", foot: "fit", millimeter: "milimetre", yard: "yarda",
  kilometer: "kilometre", mile: "mil", kilogram: "kilogram", pound: "pound", gram: "gram", ounce: "ons",
  stone: "stone", metric_ton: "metrik ton", c: "Celsius", f: "Fahrenheit", k: "kelvin", liter: "litre",
  us_gallon: "ABD galonu", milliliter: "mililitre", us_fl_oz: "ABD sıvı onsu",
  kilometer_per_hour: "km/s", mile_per_hour: "mph", knot: "knot", megabyte: "MB", gigabyte: "GB", terabyte: "TB",
  kilobyte: "KB", square_meter: "metrekare", square_foot: "fitkare", acre: "ar", hectare: "hektar", square_kilometer: "km²",
};

const USE_EN = {
  length: "Common uses: screens and displays, body height, furniture depth, and travel distances.",
  weight: "Common uses: body weight, shipping, cooking, and small parcel estimates.",
  temperature: "Common uses: weather, baking, and lab-style °C/°F conversions.",
  volume: "Common uses: cooking volumes, fuel economy context, and bottle sizes.",
  speed: "Common uses: vehicle speed limits, running pace, and marine knots.",
  data: "Common uses: file sizes, download estimates, and storage planning.",
  area: "Common uses: land lots, room floors, and agricultural fields.",
};

const USE_TR = {
  length: "Tipik kullanım: ekran, boy, mobilya ölçüsü, seyahat mesafesi.",
  weight: "Tipik kullanım: kilo, kargo, mutfak ölçüleri.",
  temperature: "Tipik kullanım: hava, fırın, °C/°F karşılaştırma.",
  volume: "Tipik kullanım: mutfak, yakıt verimi, şişe hacimleri.",
  speed: "Tipik kullanım: araç hızı, tempolu koşu, deniz knot.",
  data: "Tipik kullanım: dosya boyutu, indirme, depolama.",
  area: "Tipik kullanım: arsa, oda zemini, tarla alanı.",
};

const CALC_INTRO_EXAMPLE_EN = {
  pctOf: "For example, 25% of 200 is 50 — change the inputs to match your case.",
  discount: "For example, 20% off $100 gives you a $80 final price (before tax).",
  ratio: "For example, 4 : 6 simplifies to 2 : 3.",
  age: "Pick a birth date; you’ll get years, months, and days in your browser — nothing is uploaded.",
  dateDiff: "Select two dates to count the calendar days and weeks between them.",
  compound: "Enter principal, annual rate, years, and compounding per year; interest compounds on the same schedule as the main calculator.",
  loan: "Enter principal, APR, and term in months; the payment uses the same amortization math as the main loan tool.",
  profit: "Enter cost and selling price; margin % matches the main profit calculator.",
  mbps: "For example, 100 Mbps is 12.5 MB/s (divide by 8).",
  binary: "Type a decimal to see binary, or edit binary to see decimal — same logic as the main dev tools.",
};

const CALC_INTRO_EXAMPLE_TR = {
  pctOf: "Örnek: 200’ün %25’i 50’dir; değerleri kendi senaryona göre değiştir.",
  discount: "Örnek: 100 ABD doları üzerine %20 indirim, vergi hariç 80 dolar fiyat verir.",
  ratio: "Örnek: 4 : 6 oranı 2 : 3’e sadeleşir.",
  age: "Doğum tarihini seç; yıl, ay, gün tarayıcıda hesaplanır, sunucuya gitmez.",
  dateDiff: "İki tarih arasındaki gün ve haftayı sayar.",
  compound: "Ana faiz, yıllık oran, süre ve bileşim sıklığı — ana sayfadakiyle aynı yöntem.",
  loan: "Ana para, yıllık faiz, ay sayısı; taksit hesabı ana kredi aracıyla aynı.",
  profit: "Maliyet ve satış fiyatı; marj % ana hesapla uyumlu.",
  mbps: "Örnek: 100 Mbps = 12,5 MB/s (8’e böl).",
  binary: "Ondalık veya ikilik gir; dönüşüm ana geliştirici araçlarıyla aynı.",
};

function h1EnConvert(row) {
  return "Convert " + (EN_LONG[row.from] || row.from) + " to " + (EN_LONG[row.to] || row.to);
}

function h1TrConvert(row) {
  return (TR_LONG[row.from] || row.from) + " → " + (TR_LONG[row.to] || row.to) + " dönüştür";
}

function prettyTitleFromSlug(slug) {
  const i = slug.indexOf("-to-");
  if (i < 0) return titleCaseSlug(slug);
  const a = slug
    .slice(0, i)
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  const b = slug
    .slice(i + 4)
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return a + " to " + b;
}

function titleUnitEN(row) {
  const p = prettyTitleFromSlug(row.slug) + " converter";
  let t = p + " (Free, fast) | SnakeConverter";
  if (t.length > 62) t = prettyTitleFromSlug(row.slug) + " | SnakeConverter";
  return t;
}

function descUnitEN(row) {
  const a = EN_LONG[row.from] || row.from;
  const b = EN_LONG[row.to] || row.to;
  return (
    "Convert " +
    a +
    " to " +
    b +
    " instantly in your browser. Free, no signup — private, same engine as the main unit hub."
  );
}

function titleUnitTR(row) {
  const a = TR_LONG[row.from] || row.from;
  const b = TR_LONG[row.to] || row.to;
  const p = a + " → " + b;
  let t = p + " (Ücretsiz, hızlı) | SnakeConverter";
  if (t.length > 62) t = p + " | SnakeConverter";
  return t;
}

function descUnitTR(row) {
  return (
    (TR_LONG[row.from] || row.from) +
    " → " +
    (TR_LONG[row.to] || row.to) +
    " çevirisi tarayıcıda, anında. Ücretsiz, kayıt yok, veri yüklenmez — ana birim aracıyla aynı motor."
  );
}

function exampleInputForSpoke(row) {
  if (row.category === "temperature") {
    if (row.from === "c") return 100;
    if (row.from === "f") return 32;
    return 10;
  }
  if (row.category === "data" && (row.to === "terabyte" || row.from === "terabyte")) return 1;
  return 10;
}

function buildUnitExampleLineEN(row) {
  const v = exampleInputForSpoke(row);
  const out = convertPairValue(row.category, v, row.from, row.to);
  const fs = EN_LONG[row.from] || row.from;
  const ts = EN_LONG[row.to] || row.to;
  if (!out || out === "—")
    return "Enter any value; the result uses the same factors as the main converter.";
  return "For example, " + v + " " + fs + " = " + out + " " + ts + " (illustration only; type your own number).";
}

function buildUnitExampleLineTR(row) {
  const v = exampleInputForSpoke(row);
  const out = convertPairValue(row.category, v, row.from, row.to);
  const fs = TR_LONG[row.from] || row.from;
  const ts = TR_LONG[row.to] || row.to;
  if (!out || out === "—") return "Değer girin; katsayılar ana dönüştürücüyle aynı.";
  return "Örnek: " + v + " " + fs + " = " + out + " " + ts + " (gösterim; kendi değerinizi girin).";
}

function relatedUnitSlugs(row) {
  const same = UNIT_PAIRS.filter((r) => r.category === row.category && r.slug !== row.slug);
  const out = same.slice(0, 3);
  let i = 0;
  while (out.length < 3 && i < UNIT_PAIRS.length) {
    if (UNIT_PAIRS[i].slug !== row.slug && !out.find((o) => o.slug === UNIT_PAIRS[i].slug)) out.push(UNIT_PAIRS[i]);
    i++;
  }
  return out.slice(0, 3);
}

function relatedCalcSlugs(slug) {
  const i = CALC_SPOKES.findIndex((s) => s.slug === slug);
  if (i < 0) return [];
  const out = [];
  if (i > 0) out.push(CALC_SPOKES[i - 1]);
  if (i < CALC_SPOKES.length - 1) out.push(CALC_SPOKES[i + 1]);
  let j = 0;
  while (out.length < 3 && j < CALC_SPOKES.length) {
    if (CALC_SPOKES[j].slug !== slug && !out.find((o) => o.slug === CALC_SPOKES[j].slug)) out.push(CALC_SPOKES[j]);
    j++;
  }
  return out.slice(0, 3);
}

function buildRelatedHtmlSpokesEN(rel, slugs, folder) {
  if (!slugs.length) return "";
  const links = slugs.map((s) => "<a href=\"" + rel + folder + s + ".html\">" + esc(titleCaseSlug(s)) + "</a>");
  return '<p class="lp-prose" style="font-size:.82rem;margin-top:1rem;line-height:1.55;color:var(--text-muted)"><strong>Related tools:</strong> ' + links.join(" · ") + "</p>";
}

function buildRelatedHtmlSpokesTR(slugs) {
  if (!slugs.length) return "";
  /* Same directory as this file: tr/convert/{slug}.html */
  const links = slugs.map((s) => "<a href=\"" + esc(s) + ".html\">" + esc(titleCaseSlug(s)) + "</a>");
  return '<p class="lp-prose" style="font-size:.82rem;margin-top:1rem;line-height:1.55;color:var(--text-muted)"><strong>Benzer:</strong> ' + links.join(" · ") + "</p>";
}

function jsonLdGraphWebUnit(opts) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "url": opts.url,
        "name": opts.title,
        "description": opts.desc,
        "inLanguage": opts.lang,
        "dateModified": SCHEMA_DATE_MODIFIED,
      },
      {
        "@type": "SoftwareApplication",
        "name": opts.title,
        "url": opts.url,
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Web Browser",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "description": opts.desc,
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": opts.lang === "en" ? "How do I use this page?" : "Nasıl kullanırım?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text":
                opts.lang === "en"
                  ? "Type a value. Results update in your browser; nothing is uploaded."
                  : "Değer girin; sonuçlar tarayıcıda güncellenir, yük yok.",
            },
          },
          {
            "@type": "Question",
            "name": opts.lang === "en" ? "Is it accurate?" : "Doğruluk?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text":
                opts.lang === "en"
                  ? "The same engine as the main unit hub: SI, imperial, and US definitions."
                  : "Ana birim sayfasıyla aynı motor: SI, emperyal ve US tanımları.",
            },
          },
          {
            "@type": "Question",
            "name": opts.lang === "en" ? "Is my data sent to a server?" : "Veri sunucuya gider mi?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": opts.lang === "en" ? "No. All math runs locally in your browser." : "Hayır. Tümü tarayıcıda çalışır.",
            },
          },
        ],
      },
    ],
  };
}

function jsonLdGraphCalc(opts) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "url": opts.url,
        "name": opts.h1,
        "description": opts.desc,
        "inLanguage": opts.lang,
        "dateModified": SCHEMA_DATE_MODIFIED,
      },
      {
        "@type": "SoftwareApplication",
        "name": opts.h1,
        "url": opts.url,
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Web Browser",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "description": opts.desc,
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": opts.lang === "en" ? "Where is my data processed?" : "Veri nerede işlenir?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": opts.lang === "en" ? "In your browser. No account required." : "Tarayıcınızda. Hesap gerekmez.",
            },
          },
        ],
      },
    ],
  };
}

function metaOgBlock(opts) {
  return [
    '<meta property="og:type" content="website"/>',
    '<meta property="og:url" content="' + esc(opts.canonical) + '"/>',
    '<meta property="og:title" content="' + esc(opts.ogTitle) + '"/>',
    '<meta property="og:description" content="' + esc(opts.ogDesc) + '"/>',
    '<meta name="twitter:card" content="summary"/>',
    '<meta name="twitter:title" content="' + esc(opts.ogTitle) + '"/>',
    '<meta name="twitter:description" content="' + esc(opts.ogDesc) + '"/>',
  ].join("\n");
}

function buildUnitIntroEN(base, row) {
  const a = SYMS[row.from] || row.from;
  const b = SYMS[row.to] || row.to;
  const u = USE_EN[row.category] || "Common use cases include everyday measurements in your region.";
  return (
    "<p>This free <strong>unit converter</strong> answers searches for " +
    esc(EN_LONG[row.from] || a) +
    " to " +
    esc(EN_LONG[row.to] || b) +
    " — with the same internal factors as our <a href=\"" +
    base +
    "units.html\">unit hub</a>, fully in your browser (no upload).</p>" +
    "<p><strong>Quick example:</strong> " +
    buildUnitExampleLineEN(row) +
    "</p>" +
    "<p><strong>Typical use:</strong> " +
    esc(u) +
    " </p>" +
    "<p>Bookmark this URL for repeat use, or use the <a href=\"" +
    base +
    "unit-converter.html\">all-in-one converter</a> for many pairs at once.</p>"
  );
}

function buildUnitIntroTR(base, row) {
  const a = SYMS[row.from] || row.from;
  const b = SYMS[row.to] || row.to;
  const u = USE_TR[row.category] || "Günlük çevre birim dönüşümleri.";
  return (
    "<p>Bu ücretsiz <strong>birim dönüştürücü</strong>, " +
    esc(TR_LONG[row.from] || a) +
    " → " +
    esc(TR_LONG[row.to] || b) +
    " aramaları için: katsayılar <a href=\"" +
    base +
    "units.html\">ana birim</a> ile aynı, tamamen tarayıcıda, yükleme yok.</p>" +
    "<p><strong>Örnek:</strong> " +
    buildUnitExampleLineTR(row) +
    "</p>" +
    "<p><strong>Tipik kullanım:</strong> " +
    esc(u) +
    "</p>" +
    "<p>Sık kullanım için yer imi; çoklu çiftler için <a href=\"" +
    base +
    "unit-converter.html\">genel dönüştürücü</a>.</p>"
  );
}

function howItWorks(row) {
  if (row.category === "temperature") {
    return '<section class="lp-section" style="margin-top:1rem"><h2 class="lp-section-title" style="font-size:1.05rem">Formula</h2><p class="lp-prose" style="line-height:1.65;font-size:.88rem;color:var(--text-muted)">Temperature conversions use the standard °C, °F, and K relationships. Values are first normalized, then written in your target unit.</p></section>';
  }
  if (row.category === "data") {
    return '<section class="lp-section" style="margin-top:1rem"><h2 class="lp-section-title" style="font-size:1.05rem">How it works</h2><p class="lp-prose" style="line-height:1.65;font-size:.88rem;color:var(--text-muted)">Data sizes use binary prefixes: 1 KB = 1024 B, 1 MB = 1024 KB, consistent with the main data table on the units page.</p></section>';
  }
  return '<section class="lp-section" style="margin-top:1rem"><h2 class="lp-section-title" style="font-size:1.05rem">How it works</h2><p class="lp-prose" style="line-height:1.65;font-size:.88rem;color:var(--text-muted)">Your input is converted to an internal base unit, then to the target using fixed factors from the same table as the main converter.</p></section>';
}

function howItWorksTR(row) {
  if (row.category === "temperature") {
    return '<section class="lp-section" style="margin-top:1rem"><h2 class="lp-section-title" style="font-size:1.05rem">Formül</h2><p class="lp-prose" style="line-height:1.65;font-size:.88rem;color:var(--text-muted)">Sıcaklık dönüşümleri standart °C, °F ve K ilişkilerini kullanır. Değerler önce normalize edilir, sonra hedef birimde gösterilir.</p></section>';
  }
  if (row.category === "data") {
    return '<section class="lp-section" style="margin-top:1rem"><h2 class="lp-section-title" style="font-size:1.05rem">Nasıl çalışır?</h2><p class="lp-prose" style="line-height:1.65;font-size:.88rem;color:var(--text-muted)">Veri boyutları ikili önekler kullanır: 1 KB = 1024 B, 1 MB = 1024 KB; birimler sayfasındaki veri tablosuyla tutarlıdır.</p></section>';
  }
  return '<section class="lp-section" style="margin-top:1rem"><h2 class="lp-section-title" style="font-size:1.05rem">Nasıl çalışır?</h2><p class="lp-prose" style="line-height:1.65;font-size:.88rem;color:var(--text-muted)">Girdiniz önce iç taban birime, ardından ana dönüştürücüdeki aynı sabit katsayılarla hedef birime çevrilir.</p></section>';
}

function faqEN(isUnit, rel) {
  const hub = isUnit ? rel + "units.html" : rel + "calc.html";
  return (
    '<section class="lp-section" style="margin-top:1.2rem"><h2 class="lp-section-title" style="font-size:1.1rem">FAQ</h2><div class="lp-faq">' +
    "<details open><summary>How do I use this page?</summary><div class=\"lp-faq-body\">Type your values. Results update as you type. This URL is scoped to a single tool so you can find it from search or bookmarks.</div></details>" +
    "<details><summary>Is it accurate?</summary><div class=\"lp-faq-body\">The same code paths as the main <a href=\"" +
    hub +
    '">tool hub</a> are used, with standard definitions for SI, imperial, and US units.</div></details>' +
    "<details><summary>Is my input uploaded?</summary><div class=\"lp-faq-body\">No. All calculations run in your browser; nothing is sent to SnakeConverter.</div></details></div></section>"
  );
}

function faqTR(rel) {
  return (
    '<section class="lp-section" style="margin-top:1.2rem"><h2 class="lp-section-title" style="font-size:1.1rem">SSS</h2><div class="lp-faq">' +
    "<details open><summary>Nasıl kullanırım?</summary><div class=\"lp-faq-body\">Değerleri girin; sonuç anında güncellenir. Bu sayfa tek araç içindir.</div></details>" +
    "<details><summary>Doğruluk?</summary><div class=\"lp-faq-body\">Aynı hesap yolu <a href=\"" +
    rel +
    "units.html\">birim</a> ve <a href=\"" +
    rel +
    "calc.html\">hesap</a> sayfalarında da kullanılır.</div></details>" +
    "<details><summary>Veri yükleniyor mu?</summary><div class=\"lp-faq-body\">Hayır. Hepsi tarayıcıda çalışır.</div></details></div></section>"
  );
}

function toolUnitBlock(row, rel) {
  const cfg = JSON.stringify({ type: "unit", category: row.category, from: row.from, to: row.to });
  return (
    '<section class="lp-tool-box" style="max-width:560px;min-height:7.5rem;border:1px solid var(--border-subtle);border-radius:.9rem;padding:1rem 1.1rem;margin:1rem 0">' +
    '<label for="spoke-input" style="font-size:.78rem;font-weight:700">Value (' +
    esc(SYMS[row.from] || row.from) +
    ")</label><br/>" +
    '<input class="lp-input" type="number" id="spoke-input" value="1" step="any" style="max-width:220px;margin:.35rem 0 .5rem" />' +
    '<p class="spoke-out" id="spoke-result" style="font-size:1.6rem;font-weight:800">—</p>' +
    '<p class="spoke-sub" id="spoke-result-unit" style="font-size:.8rem;opacity:.85">(' +
    esc(SYMS[row.to] || row.to) +
    ")</p></section>" +
    "<script>window.__MICRO_SPOKE__=" +
    cfg +
    ";</script>" +
    '<script defer src="' +
    rel +
    'js/units.js"></script><script defer src="' +
    rel +
    'js/micro-spoke.js"></script>'
  );
}

function pageUnitEN(row) {
  const rel = "../";
  const can = HOST + "/convert/" + row.slug;
  const title = titleUnitEN(row);
  const desc = descUnitEN(row);
  const h1 = h1EnConvert(row);
  const related = relatedUnitSlugs(row).map((r) => r.slug);
  const graph = jsonLdGraphWebUnit({
    url: can,
    title: title,
    desc: desc,
    lang: "en",
  });
  const graphScript = "<script type=\"application/ld+json\">" + JSON.stringify(graph) + "</script>\n";
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}"/>
<link rel="canonical" href="${esc(can)}"/>
<link rel="alternate" hreflang="en" href="${esc(can)}"/>
<link rel="alternate" hreflang="tr" href="${esc(HOST + "/tr/convert/" + row.slug)}"/>
<link rel="alternate" hreflang="x-default" href="${esc(can)}"/>
${graphScript}${metaOgBlock({ canonical: can, ogTitle: title, ogDesc: desc })}
<link rel="icon" href="${rel}favicon.svg" type="image/svg+xml"/>
<link rel="stylesheet" href="${rel}css/lp.css"/>
</head>
<body>
<header class="lp-header"><div class="lp-header-inner">
<a href="${rel}index.html" class="lp-logo"><span class="lp-logo-snake">🐍</span><span>SnakeConverter</span></a>
<nav class="lp-header-nav"><a href="${rel}index.html">Home</a><a href="${rel}units.html">Units</a><a href="${rel}calc.html">Calculators</a></nav>
</div></header>
<main class="lp-wrap">
<section class="lp-hero"><h1 class="lp-h1">${esc(h1)}</h1><p class="lp-hero-sub" style="margin-top:.4rem;max-width:40rem;opacity:.9">${esc(desc)}</p></section>
${buildUnitIntroEN(rel, row)}
${toolUnitBlock(row, rel)}
${howItWorks(row)}
${faqEN(true, rel)}
${buildRelatedHtmlSpokesEN(rel, related, "convert/")}
<p style="margin:1.2rem 0"><a href="${rel}unit-converter.html">Unit converter (all types)</a> · <a href="${rel}units.html">Units hub</a> · <a href="${rel}tr/convert/${row.slug}.html">Türkçe</a></p>
${microContentUpdatedP("en")}
</main>
<footer style="text-align:center;padding:2rem;font-size:.7rem;opacity:.75"><a href="${rel}index.html">Home</a></footer>
</body></html>`;
}

function pageUnitTR(row) {
  const rel = "../../";
  const can = HOST + "/tr/convert/" + row.slug;
  const title = titleUnitTR(row);
  const desc = descUnitTR(row);
  const h1 = h1TrConvert(row);
  const related = relatedUnitSlugs(row).map((r) => r.slug);
  const graph = jsonLdGraphWebUnit({
    url: can,
    title: title,
    desc: desc,
    lang: "tr",
  });
  const graphScript = "<script type=\"application/ld+json\">" + JSON.stringify(graph) + "</script>\n";
  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}"/>
<link rel="canonical" href="${esc(can)}"/>
<link rel="alternate" hreflang="en" href="${esc(HOST + "/convert/" + row.slug)}"/>
<link rel="alternate" hreflang="tr" href="${esc(can)}"/>
<link rel="alternate" hreflang="x-default" href="${esc(HOST + "/convert/" + row.slug)}"/>
${graphScript}${metaOgBlock({ canonical: can, ogTitle: title, ogDesc: desc })}
<link rel="icon" href="${rel}favicon.svg" type="image/svg+xml"/>
<link rel="stylesheet" href="${rel}css/lp.css"/>
</head>
<body>
<header class="lp-header"><div class="lp-header-inner">
<a href="${rel}index.html" class="lp-logo"><span class="lp-logo-snake">🐍</span><span>SnakeConverter</span></a>
<nav class="lp-header-nav"><a href="${rel}index.html">Ana sayfa</a><a href="${rel}units.html">Birimler</a><a href="${rel}calc.html">Hesap</a></nav>
</div></header>
<main class="lp-wrap">
<section class="lp-hero"><h1 class="lp-h1">${esc(h1)}</h1><p class="lp-hero-sub" style="margin-top:.4rem;max-width:40rem;opacity:.9">${esc(desc)}</p></section>
${buildUnitIntroTR(rel, row)}
${toolUnitBlock(row, rel)}
${howItWorksTR(row)}
${faqTR(rel)}
${buildRelatedHtmlSpokesTR(related)}
<p style="margin:1.2rem 0"><a href="${rel}convert/${row.slug}.html">English (EN)</a> · <a href="${rel}unit-converter.html">Tüm dönüştürücü</a> · <a href="${rel}units.html">Birim merkezi</a></p>
${microContentUpdatedP("tr")}
</main>
<footer style="text-align:center;padding:2rem;font-size:.7rem;opacity:.75"><a href="${rel}index.html">Ana sayfa</a></footer>
</body></html>`;
}

function toolCalcBlock(calc, rel) {
  const cfg = JSON.stringify({ type: "calc", calc: calc });
  let inner = "";
  if (calc === "pctOf") {
    inner =
      '<label>Percent (%)</label> <input class="lp-input" type="number" id="spoke-pct" value="25" /> ' +
      '<label>Of</label> <input class="lp-input" type="number" id="spoke-of" value="200" />' +
      '<p class="spoke-out" id="spoke-result" style="font-size:1.5rem;font-weight:800;margin-top:.5rem">—</p>';
  } else if (calc === "discount") {
    inner =
      '<label>Original price</label> <input class="lp-input" type="number" id="spoke-price" value="100" /> ' +
      '<label>Discount %</label> <input class="lp-input" type="number" id="spoke-dpct" value="20" />' +
      '<div id="spoke-out" class="lp-prose" style="margin-top:.5rem">—</div>';
  } else if (calc === "ratio") {
    inner =
      '<label>A</label> <input class="lp-input" type="number" id="spoke-ra" value="4" /> ' +
      '<label>B</label> <input class="lp-input" type="number" id="spoke-rb" value="6" />' +
      '<p class="spoke-out" id="spoke-out" style="font-size:1.4rem;font-weight:800;margin-top:.5rem">—</p>';
  } else if (calc === "age") {
    inner = '<label>Birth date</label> <input class="lp-input" type="date" id="spoke-birth" />' + '<div id="spoke-out" style="margin-top:.5rem">—</div>';
  } else if (calc === "dateDiff") {
    inner =
      '<label>From</label> <input class="lp-input" type="date" id="spoke-d1" /> ' +
      '<label>To</label> <input class="lp-input" type="date" id="spoke-d2" />' +
      '<div id="spoke-out" style="margin-top:.5rem">—</div>';
  } else if (calc === "compound") {
    inner =
      '<label>Principal</label> <input class="lp-input" type="number" id="spoke-cp" value="1000" /> ' +
      '<label>Rate % / yr</label> <input class="lp-input" type="number" id="spoke-cr" value="5" />' +
      '<label>Years</label> <input class="lp-input" type="number" id="spoke-cy" value="10" />' +
      '<label>Compound / yr</label> <input class="lp-input" type="number" id="spoke-cn" value="12" />' +
      '<div id="spoke-out" style="margin-top:.5rem">—</div>';
  } else if (calc === "loan") {
    inner =
      '<label>Principal</label> <input class="lp-input" type="number" id="spoke-loan-p" value="200000" /> ' +
      '<label>APR %</label> <input class="lp-input" type="number" id="spoke-loan-r" value="6" />' +
      '<label>Months</label> <input class="lp-input" type="number" id="spoke-loan-n" value="360" />' +
      '<div id="spoke-out" style="margin-top:.5rem">—</div>';
  } else if (calc === "profit") {
    inner =
      '<label>Cost</label> <input class="lp-input" type="number" id="spoke-pc" value="50" /> ' +
      '<label>Price</label> <input class="lp-input" type="number" id="spoke-pp" value="80" />' +
      '<div id="spoke-out" style="margin-top:.5rem">—</div>';
  } else if (calc === "mbps") {
    inner = '<label>Megabit per second (Mbps)</label> <input class="lp-input" type="number" id="spoke-mbps" value="100" />' + '<p class="spoke-out" id="spoke-out" style="font-size:1.5rem;font-weight:800">—</p><p class="lp-prose" style="font-size:.8rem">MB/s = Mbps ÷ 8</p>';
  } else if (calc === "binary") {
    inner =
      '<label>Decimal</label> <input class="lp-input" type="text" id="spoke-dec" value="10" />' +
      '<label>Binary</label> <input class="lp-input" type="text" id="spoke-bin" value="1010" />';
  }
  const scripts = '<script>window.__MICRO_SPOKE__=' + cfg + ";</script>";
  const loads =
    (calc === "age" ? '<script defer src="' + rel + 'js/tools.js"></script>' : '<script defer src="' + rel + 'js/calc-tools.js"></script>') +
    '<script defer src="' + rel + 'js/micro-spoke.js"></script>';
  return (
    '<section class="lp-tool-box" style="max-width:600px;min-height:6rem;border:1px solid var(--border-subtle);border-radius:.9rem;padding:1rem;margin:1rem 0;display:grid;gap:.4rem">' +
    inner +
    "</section>" +
    scripts +
    loads
  );
}

function buildCalcIntroEN(row) {
  const line = CALC_INTRO_EXAMPLE_EN[row.calc] || "Adjust the fields; results follow the same rules as the main calculator page.";
  return '<p class="lp-prose" style="line-height:1.6;font-size:.9rem;max-width:40rem">' + esc(line) + "</p>";
}

function buildCalcIntroTR(row) {
  const line = CALC_INTRO_EXAMPLE_TR[row.calc] || "Alanları değiştirin; sonuçlar ana sayfadakiyle aynı yolu izler.";
  return '<p class="lp-prose" style="line-height:1.6;font-size:.9rem;max-width:40rem">' + esc(line) + "</p>";
}

function howItWorksCalcEN(rel) {
  return (
    '<section class="lp-section" style="margin-top:1rem"><h2 class="lp-section-title" style="font-size:1.05rem">How it works</h2><p class="lp-prose" style="line-height:1.65;font-size:.88rem;color:var(--text-muted)">Calculations run entirely in your browser; nothing is sent to a server. Logic matches the <a href="' +
    rel +
    'calc.html">main calculator hub</a>.</p></section>'
  );
}

function howItWorksCalcTR(rel) {
  return (
    '<section class="lp-section" style="margin-top:1rem"><h2 class="lp-section-title" style="font-size:1.05rem">Nasıl çalışır?</h2><p class="lp-prose" style="line-height:1.65;font-size:.88rem;color:var(--text-muted)">Hesap tamamen tarayıcıda; sunucuya sayı gitmez. Mantık <a href="' +
    rel +
    'calc.html">ana hesap</a> sayfasıyla aynıdır.</p></section>'
  );
}

function titleCalcEN(row) {
  const short = row.h1en.split("—")[0].trim() + " (Free, in-browser) | SnakeConverter";
  if (short.length > 64) return row.h1en.split("—")[0].trim() + " | SnakeConverter";
  return short;
}

function descCalcEN(row) {
  return (
    "Use this free " +
    row.slug.replace(/-/g, " ") +
    " in your browser — no signup, instant output. Same behavior as the main SnakeConverter calculator tools."
  );
}

function titleCalcTR(row) {
  const short = row.h1tr.split("—")[0].trim() + " (Ücretsiz) | SnakeConverter";
  if (short.length > 64) return row.h1tr.split("—")[0].trim() + " | SnakeConverter";
  return short;
}

function descCalcTR(row) {
  return "Ücretsiz " + row.slug.replace(/-/g, " ") + " — tarayıcıda, anında, kayıt yok. Ana sayfadakiyle aynı yol.";
}

function buildRelatedHtmlCalcsEN(rel, list) {
  if (!list || !list.length) return "";
  const links = list.map(
    (r) => "<a href=\"" + rel + "calculators/" + r.slug + ".html\">" + esc(r.h1en.split("—")[0].trim()) + "</a>"
  );
  return '<p class="lp-prose" style="font-size:.82rem;margin-top:1rem;color:var(--text-muted)"><strong>Related calculators:</strong> ' + links.join(" · ") + "</p>";
}

function buildRelatedHtmlCalcsTR(list) {
  if (!list || !list.length) return "";
  const links = list.map(
    (r) => "<a href=\"" + esc(r.slug) + ".html\">" + esc(r.h1tr.split("—")[0].trim()) + "</a>"
  );
  return '<p class="lp-prose" style="font-size:.82rem;margin-top:1rem;color:var(--text-muted)"><strong>Diğer hesaplar:</strong> ' + links.join(" · ") + "</p>";
}

function pageCalcEN(row) {
  const rel = "../";
  const can = HOST + "/calculators/" + row.slug;
  const title = titleCalcEN(row);
  const desc = descCalcEN(row);
  const related = relatedCalcSlugs(row.slug);
  const graph = jsonLdGraphCalc({
    url: can,
    h1: row.h1en,
    desc: desc,
    lang: "en",
  });
  const graphScript = "<script type=\"application/ld+json\">" + JSON.stringify(graph) + "</script>\n";
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}"/>
<link rel="canonical" href="${esc(can)}"/>
<link rel="alternate" hreflang="en" href="${esc(can)}"/>
<link rel="alternate" hreflang="tr" href="${esc(HOST + "/tr/calculators/" + row.slug)}"/>
<link rel="alternate" hreflang="x-default" href="${esc(can)}"/>
${graphScript}${metaOgBlock({ canonical: can, ogTitle: title, ogDesc: desc })}
<link rel="icon" href="${rel}favicon.svg" type="image/svg+xml"/>
<link rel="stylesheet" href="${rel}css/lp.css"/>
</head>
<body>
<header class="lp-header"><div class="lp-header-inner">
<a href="${rel}index.html" class="lp-logo"><span class="lp-logo-snake">🐍</span><span>SnakeConverter</span></a>
<nav class="lp-header-nav"><a href="${rel}index.html">Home</a><a href="${rel}calc.html">Calculators</a></nav>
</div></header>
<main class="lp-wrap">
<section class="lp-hero"><h1 class="lp-h1">${esc(row.h1en)}</h1><p class="lp-hero-sub" style="margin-top:.4rem;max-width:40rem;opacity:.9">${esc(desc)}</p></section>
${buildCalcIntroEN(row)}
${toolCalcBlock(row.calc, rel)}
${howItWorksCalcEN(rel)}
${faqEN(false, rel)}
${buildRelatedHtmlCalcsEN(rel, related)}
<p style="margin:1.2rem 0 0 0"><a href="${rel}calc.html">All calculators</a> · <a href="${rel}tr/calculators/${row.slug}.html">Türkçe</a></p>
${microContentUpdatedP("en")}
</main>
<footer style="text-align:center;padding:2rem;font-size:.7rem;opacity:.75"><a href="${rel}index.html">Home</a></footer>
</body></html>`;
}

function pageCalcTR(row) {
  const rel = "../../";
  const can = HOST + "/tr/calculators/" + row.slug;
  const title = titleCalcTR(row);
  const desc = descCalcTR(row);
  const related = relatedCalcSlugs(row.slug);
  const graph = jsonLdGraphCalc({
    url: can,
    h1: row.h1tr,
    desc: desc,
    lang: "tr",
  });
  const graphScript = "<script type=\"application/ld+json\">" + JSON.stringify(graph) + "</script>\n";
  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}"/>
<link rel="canonical" href="${esc(can)}"/>
<link rel="alternate" hreflang="en" href="${esc(HOST + "/calculators/" + row.slug)}"/>
<link rel="alternate" hreflang="tr" href="${esc(can)}"/>
<link rel="alternate" hreflang="x-default" href="${esc(HOST + "/calculators/" + row.slug)}"/>
${graphScript}${metaOgBlock({ canonical: can, ogTitle: title, ogDesc: desc })}
<link rel="icon" href="${rel}favicon.svg" type="image/svg+xml"/>
<link rel="stylesheet" href="${rel}css/lp.css"/>
</head>
<body>
<header class="lp-header"><div class="lp-header-inner">
<a href="${rel}index.html" class="lp-logo"><span class="lp-logo-snake">🐍</span><span>SnakeConverter</span></a>
<nav class="lp-header-nav"><a href="${rel}index.html">Ana sayfa</a><a href="${rel}calc.html">Hesap</a></nav>
</div></header>
<main class="lp-wrap">
<section class="lp-hero"><h1 class="lp-h1">${esc(row.h1tr)}</h1><p class="lp-hero-sub" style="margin-top:.4rem;max-width:40rem;opacity:.9">${esc(desc)}</p></section>
${buildCalcIntroTR(row)}
${toolCalcBlock(row.calc, rel)}
${howItWorksCalcTR(rel)}
${faqTR(rel)}
${buildRelatedHtmlCalcsTR(related)}
<p style="margin:1.2rem 0 0 0"><a href="${rel}calculators/${row.slug}.html">EN</a> · <a href="${rel}calc.html">Tüm hesaplar</a></p>
${microContentUpdatedP("tr")}
</main>
<footer style="text-align:center;padding:2rem;font-size:.7rem;opacity:.75"><a href="${rel}index.html">Ana sayfa</a></footer>
</body></html>`;
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function main() {
  const out = [];
  ensureDir(path.join(root, "data"));
  ensureDir(path.join(root, "convert"));
  ensureDir(path.join(root, "tr", "convert"));
  ensureDir(path.join(root, "calculators"));
  ensureDir(path.join(root, "tr", "calculators"));

  UNIT_PAIRS.forEach((row) => {
    const f = path.join(root, "convert", row.slug + ".html");
    fs.writeFileSync(f, pageUnitEN(row), "utf8");
    out.push({ loc: HOST + "/convert/" + row.slug, file: f });
    const ftr = path.join(root, "tr", "convert", row.slug + ".html");
    fs.writeFileSync(ftr, pageUnitTR(row), "utf8");
    out.push({ loc: HOST + "/tr/convert/" + row.slug, file: ftr });
  });

  CALC_SPOKES.forEach((row) => {
    const f = path.join(root, "calculators", row.slug + ".html");
    fs.writeFileSync(f, pageCalcEN(row), "utf8");
    out.push({ loc: HOST + "/calculators/" + row.slug, file: f });
    const ftr = path.join(root, "tr", "calculators", row.slug + ".html");
    fs.writeFileSync(ftr, pageCalcTR(row), "utf8");
    out.push({ loc: HOST + "/tr/calculators/" + row.slug, file: ftr });
  });

  fs.writeFileSync(path.join(root, "data", "generated-urls.json"), JSON.stringify({ generatedAt: new Date().toISOString().slice(0, 10), urls: out.map((x) => x.loc) }, null, 2), "utf8");
  console.log("Wrote " + out.length + " pages + data/generated-urls.json");
}

main();
