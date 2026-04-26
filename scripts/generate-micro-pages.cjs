/**
 * Generate SEO micro landings under convert/, tr/convert/, calculators/, tr/calculators/
 * Run: node scripts/generate-micro-pages.cjs
 */
"use strict";

const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const { HOST, UNIT_PAIRS, CALC_SPOKES } = require("./micro-routes.cjs");

const SYMS = {
  centimeter: "cm", inch: "in", meter: "m", foot: "ft", kilometer: "km", mile: "mi", millimeter: "mm", yard: "yd",
  kilogram: "kg", pound: "lb", gram: "g", ounce: "oz", stone: "st", metric_ton: "t",
  c: "°C", f: "°F", k: "K", liter: "L", us_gallon: "gal (US)", milliliter: "mL", us_fl_oz: "fl oz (US)",
  kilometer_per_hour: "km/h", mile_per_hour: "mph", knot: "kn",
  megabyte: "MB", gigabyte: "GB", terabyte: "TB", kilobyte: "KB",
  square_meter: "m²", square_foot: "ft²", acre: "ac", hectare: "ha", square_kilometer: "km²",
};

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

function buildUnitIntroEN(base, row) {
  const a = SYMS[row.from] || row.from;
  const b = SYMS[row.to] || row.to;
  return (
    "<p>Need to convert <strong>" +
    esc(a) +
    "</strong> to <strong>" +
    esc(b) +
    "</strong>? This page is tailored to that exact query. Enter a value and see the result immediately. The factors match our <a href=\"" +
    base +
    "units.html\">full unit hub</a>; nothing leaves your browser.</p>" +
    "<p>Bookmark this URL if you use the pair often (school, engineering, travel). For many units at once, use the <a href=\"" +
    base +
    "unit-converter.html\">all-in-one converter</a>.</p>" +
    "<p>See the FAQ for accuracy and privacy. Below the tool you will find a short explanation of how conversions are computed for this category.</p>"
  );
}

function buildUnitIntroTR(base, row) {
  const a = SYMS[row.from] || row.from;
  const b = SYMS[row.to] || row.to;
  return (
    "<p><strong>" +
    esc(a) +
    "</strong> biriminden <strong>" +
    esc(b) +
    "</strong> birimine mi çeviriyorsunuz? Bu sayfa bu aramaya özeldir; değer yazın, sonuç anında güncellensin. Katsayılar <a href=\"" +
    base +
    "units.html\">ana birim sayfası</a> ile aynıdır; veri sunucuya gitmez.</p>" +
    "<p>Sık kullanıyorsanız yer imi ekleyin. Çoklu birim için <a href=\"" +
    base +
    "unit-converter.html\">genel dönüştürücüyü</a> kullanın.</p>" +
    "<p>Doğruluk ve gizlilik için SSS’ye bakın.</p>"
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

function schemaFAQ() {
  return (
    "<script type=\"application/ld+json\">" +
    JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: "How do I use this page?", acceptedAnswer: { "@type": "Answer", text: "Type a value. Results update live in your browser." } },
        { "@type": "Question", name: "Is it accurate?", acceptedAnswer: { "@type": "Answer", text: "Same engine as the main hub on snakeconverter.com." } },
        { "@type": "Question", name: "Is data sent to a server?", acceptedAnswer: { "@type": "Answer", text: "No. Calculations are local." } },
      ],
    }) +
    "</script>"
  );
}

function toolUnitBlock(row, rel) {
  const cfg = JSON.stringify({ type: "unit", category: row.category, from: row.from, to: row.to });
  return (
    '<section class="lp-tool-box" style="max-width:560px;border:1px solid var(--border-subtle);border-radius:.9rem;padding:1rem 1.1rem;margin:1rem 0">' +
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
    '<script src="' +
    rel +
    'js/units.js"></script><script src="' +
    rel +
    'js/micro-spoke.js"></script>'
  );
}

function pageUnitEN(row) {
  const rel = "../";
  const can = HOST + "/convert/" + row.slug;
  const title = titleCaseSlug(row.slug) + " — free converter | SnakeConverter";
  const desc = "Convert " + (SYMS[row.from] || row.from) + " to " + (SYMS[row.to] || row.to) + " online. Free, instant, browser-based.";
  const h1 = titleCaseSlug(row.slug).replace(/ To /g, " to ");
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
${schemaFAQ()}
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
<p style="margin:1.2rem 0"><a href="${rel}unit-converter.html">Unit converter (all types)</a> · <a href="${rel}units.html">Units hub</a> · <a href="${rel}tr/convert/${row.slug}.html">Türkçe</a></p>
</main>
<footer style="text-align:center;padding:2rem;font-size:.7rem;opacity:.75"><a href="${rel}index.html">Home</a></footer>
</body></html>`;
}

function pageUnitTR(row) {
  const rel = "../../";
  const can = HOST + "/tr/convert/" + row.slug;
  const title = titleCaseSlug(row.slug) + " — ücretsiz dönüştürücü | SnakeConverter";
  const desc = (SYMS[row.from] || row.from) + " → " + (SYMS[row.to] || row.to) + " çevrimi. Ücretsiz, anında, tarayıcıda.";
  const h1 = titleCaseSlug(row.slug).replace(/ To /g, " / ");
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
${howItWorks(row)}
${faqTR(rel)}
<p style="margin:1.2rem 0"><a href="${rel}convert/${row.slug}.html">English (EN)</a> · <a href="${rel}unit-converter.html">Tüm dönüştürücü</a> · <a href="${rel}units.html">Birim merkezi</a></p>
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
    (calc === "age" ? '<script src="' + rel + 'js/tools.js"></script>' : '<script src="' + rel + 'js/calc-tools.js"></script>') +
    '<script src="' + rel + 'js/micro-spoke.js"></script>';
  return '<section class="lp-tool-box" style="max-width:600px;border:1px solid var(--border-subtle);border-radius:.9rem;padding:1rem;margin:1rem 0;display:grid;gap:.4rem">' + inner + "</section>" + scripts + loads;
}

function pageCalcEN(row) {
  const rel = "../";
  const can = HOST + "/calculators/" + row.slug;
  const title = row.h1en + " | SnakeConverter";
  const desc = "Free " + row.slug.replace(/-/g, " ") + ". Runs in your browser. No signup.";
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
${schemaFAQ()}
<link rel="icon" href="${rel}favicon.svg" type="image/svg+xml"/>
<link rel="stylesheet" href="${rel}css/lp.css"/>
</head>
<body>
<header class="lp-header"><div class="lp-header-inner">
<a href="${rel}index.html" class="lp-logo"><span class="lp-logo-snake">🐍</span><span>SnakeConverter</span></a>
<nav class="lp-header-nav"><a href="${rel}index.html">Home</a><a href="${rel}calc.html">Calculators</a></nav>
</div></header>
<main class="lp-wrap">
<section class="lp-hero"><h1 class="lp-h1">${esc(row.h1en)}</h1><p class="lp-hero-sub" style="margin-top:.4rem">${esc(desc)}</p></section>
${toolCalcBlock(row.calc, rel)}
${faqEN(false, rel)}
<p><a href="${rel}calc.html">All calculators</a> · <a href="${rel}tr/calculators/${row.slug}.html">Türkçe</a></p>
</main>
<footer style="text-align:center;padding:2rem;font-size:.7rem;opacity:.75"><a href="${rel}index.html">Home</a></footer>
</body></html>`;
}

function pageCalcTR(row) {
  const rel = "../../";
  const can = HOST + "/tr/calculators/" + row.slug;
  const title = row.h1tr + " | SnakeConverter";
  const desc = "Ücretsiz " + row.slug.replace(/-/g, " ") + ". Tarayıcıda çalışır.";
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
<link rel="icon" href="${rel}favicon.svg" type="image/svg+xml"/>
<link rel="stylesheet" href="${rel}css/lp.css"/>
</head>
<body>
<header class="lp-header"><div class="lp-header-inner">
<a href="${rel}index.html" class="lp-logo"><span class="lp-logo-snake">🐍</span><span>SnakeConverter</span></a>
<nav class="lp-header-nav"><a href="${rel}index.html">Ana sayfa</a><a href="${rel}calc.html">Hesap</a></nav>
</div></header>
<main class="lp-wrap">
<section class="lp-hero"><h1 class="lp-h1">${esc(row.h1tr)}</h1><p class="lp-hero-sub" style="margin-top:.4rem">${esc(desc)}</p></section>
${toolCalcBlock(row.calc, rel)}
${faqTR(rel)}
<p><a href="${rel}calculators/${row.slug}.html">EN</a> · <a href="${rel}calc.html">Tüm hesaplar</a></p>
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
