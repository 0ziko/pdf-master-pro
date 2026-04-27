/**
 * SnakeConverter — Production Build Script
 *
 * Produces a hardened, obfuscated build in ./dist/
 * Deploy ./dist/ to Cloudflare Pages — never the source root.
 *
 * Usage:  node build.js
 */

"use strict";

const fs            = require("fs");
const path          = require("path");
const fse           = require("fs-extra");
const { execFileSync } = require("child_process");
const { obfuscate }    = require("javascript-obfuscator");

/* ── Config ─────────────────────────────────────────── */

/**
 * Domains where the obfuscated code is allowed to run.
 * Add your custom domain here if you set one up on Cloudflare.
 */
const ALLOWED_DOMAINS = [
  "pdf-master-pro.pages.dev",
  "snakeconverter.com",
  "www.snakeconverter.com",
  "localhost",
  "127.0.0.1",
];

/**
 * javascript-obfuscator options.
 * Adjust the preset to balance protection vs file size / performance.
 */
const OBFUSCATOR_OPTIONS = {
  compact:                          true,
  controlFlowFlattening:            true,
  controlFlowFlatteningThreshold:   0.5,   /* 0–1; higher = stronger but bigger */
  deadCodeInjection:                true,
  deadCodeInjectionThreshold:       0.25,
  debugProtection:                  false,  /* set true to block DevTools (disruptive) */
  disableConsoleOutput:             false,
  domainLock:                       ALLOWED_DOMAINS,
  domainLockRedirectUrl:            "about:blank",
  identifierNamesGenerator:         "hexadecimal",
  log:                              false,
  numbersToExpressions:             true,
  renameGlobals:                    false,  /* keep globals (window.PDFLib etc.) reachable */
  selfDefending:                    true,   /* code detects and resists prettifying */
  simplify:                         true,
  splitStrings:                     true,
  splitStringsChunkLength:          8,
  stringArray:                      true,
  stringArrayCallsTransform:        true,
  stringArrayCallsTransformThreshold: 0.6,
  stringArrayEncoding:              ["rc4"],
  stringArrayIndexShift:            true,
  stringArrayRotate:                true,
  stringArrayShuffle:               true,
  stringArrayWrappersCount:         3,
  stringArrayWrappersChainedCalls:  true,
  stringArrayWrappersParametersMaxCount: 4,
  stringArrayWrappersType:          "function",
  stringArrayThreshold:             0.75,
  transformObjectKeys:              true,
  unicodeEscapeSequence:            false,  /* true makes files 3× larger */
};

/* JS files to obfuscate */
const JS_FILES = [
  "js/config.js",
  "js/i18n.js",
  "js/utils.js",
  "js/font-loader.js",
  "js/pdf-encrypt.js",
  "js/pdf-decrypt.js",
  "js/excel-to-pdf.js",
  "js/image-to-pdf.js",
  "js/pdf-merge.js",
  "js/pdf-split.js",
  "js/pdf-reencrypt.js",
  "js/snake-mascot.js",
  "js/snake-tools.js",
  "js/app.js",
  "js/tools.js",
  "js/life-tools.js",
  "js/holiday-overrides.js",
  "js/coffee-fortune.js",
  "js/units.js",
  "js/calc-tools.js",
  "js/micro-spoke.js",
  "js/dev-tools.js",
  "js/color-tools.js",
];

/* Extra HTML files to copy to dist (besides index.html) */
const EXTRA_HTML = ["pdf.html", "tools.html", "units.html", "calc.html", "dev.html", "color.html"];

/* ── Helpers ─────────────────────────────────────────── */
const SRC  = __dirname;
const DIST = path.join(__dirname, "dist");

function banner(msg) {
  console.log(`\n  ▸ ${msg}`);
}

function sizeKB(filePath) {
  return (fs.statSync(filePath).size / 1024).toFixed(1) + " KB";
}

/* ── Main ────────────────────────────────────────────── */
async function build() {
  console.log("\n╔══════════════════════════════════════╗");
  console.log("║   SnakeConverter  —  Production Build ║");
  console.log("╚══════════════════════════════════════╝");

  /* 0. Generate SEO micro landings + sitemap merge */
  banner("Generating convert/calculators landings + sitemap…");
  execFileSync(process.execPath, [path.join(SRC, "scripts", "generate-micro-pages.cjs")], { cwd: SRC, stdio: "inherit" });
  execFileSync(process.execPath, [path.join(SRC, "scripts", "generate-sitemap.cjs")], { cwd: SRC, stdio: "inherit" });

  /* 1. Clean dist */
  banner("Cleaning dist/…");
  fse.removeSync(DIST);
  fse.ensureDirSync(path.join(DIST, "js"));
  fse.ensureDirSync(path.join(DIST, "css"));

  /* 2. Copy & minify CSS (no obfuscation needed — CSS is human-readable by nature) */
  banner("Copying CSS…");
  const cssFile = "css/app.css";
  fse.copySync(path.join(SRC, cssFile), path.join(DIST, cssFile));
  console.log(`     ${cssFile}  (${sizeKB(path.join(SRC, cssFile))})`);
  if (fs.existsSync(path.join(SRC, "css/lp.css"))) {
    fse.copySync(path.join(SRC, "css/lp.css"), path.join(DIST, "css/lp.css"));
    banner("Copied css/lp.css");
  }

  /* 3. Process index.html — add copyright comment, copy */
  banner("Processing index.html…");
  let html = fs.readFileSync(path.join(SRC, "index.html"), "utf8");

  /* inject a copyright notice at the top */
  const year = new Date().getFullYear();
  const copyright = `<!--\n  © ${year} SnakeConverter. All rights reserved.\n  Unauthorized copying or redistribution of this software is prohibited.\n-->\n`;
  if (!html.startsWith("<!--")) html = copyright + html;
  fs.writeFileSync(path.join(DIST, "index.html"), html, "utf8");

  /* 3b. Copy extra HTML files */
  for (const f of EXTRA_HTML) {
    let html = fs.readFileSync(path.join(SRC, f), "utf8");
    const year = new Date().getFullYear();
    const copyright = `<!--\n  © ${year} SnakeConverter. All rights reserved.\n-->\n`;
    if (!html.startsWith("<!--")) html = copyright + html;
    fs.writeFileSync(path.join(DIST, f), html, "utf8");
    banner(`Copied ${f}`);
  }

  /* 3b2. All other root *.html, convert/, tr/, calculators/ (SEO landings) */
  function copyHtmlWithCopyright(relPath) {
    const srcF = path.join(SRC, relPath);
    if (!fs.existsSync(srcF) || !relPath.endsWith(".html")) return;
    let html = fs.readFileSync(srcF, "utf8");
    const year = new Date().getFullYear();
    const copyright = `<!--\n  © ${year} SnakeConverter. All rights reserved.\n-->\n`;
    if (!html.startsWith("<!--")) html = copyright + html;
    const destF = path.join(DIST, relPath);
    fse.ensureDirSync(path.dirname(destF));
    fs.writeFileSync(destF, html, "utf8");
  }
  for (const f of fs.readdirSync(SRC)) {
    if (f.endsWith(".html") && f !== "index.html" && !EXTRA_HTML.includes(f)) {
      copyHtmlWithCopyright(f);
      banner("Copied " + f);
    }
  }
  for (const d of ["convert", "tr", "calculators"]) {
    const from = path.join(SRC, d);
    if (fs.existsSync(from)) {
      fse.copySync(from, path.join(DIST, d), { overwrite: true });
      banner("Copied " + d + "/");
    }
  }
  for (const extra of ["robots.txt", "favicon.svg", "og-image.png", "sitemap.xml"]) {
    if (fs.existsSync(path.join(SRC, extra))) {
      fse.copySync(path.join(SRC, extra), path.join(DIST, extra));
      banner("Copied " + extra);
    }
  }

  /* 4. Obfuscate JS files */
  banner("Obfuscating JavaScript…");
  let totalSrcKB = 0, totalDistKB = 0;

  for (const rel of JS_FILES) {
    const src  = path.join(SRC, rel);
    const dest = path.join(DIST, rel);

    if (!fs.existsSync(src)) {
      console.warn(`     SKIP (not found): ${rel}`);
      continue;
    }

    const srcCode    = fs.readFileSync(src, "utf8");
    const srcSize    = fs.statSync(src).size;
    const obfuscated = obfuscate(srcCode, {
      ...OBFUSCATOR_OPTIONS,
      sourceMap: false,
    });

    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, obfuscated.getObfuscatedCode(), "utf8");

    const distSize = fs.statSync(dest).size;
    totalSrcKB  += srcSize;
    totalDistKB += distSize;
    console.log(
      `     ${rel.padEnd(26)} ${(srcSize / 1024).toFixed(1).padStart(6)} KB  →  ${(distSize / 1024).toFixed(1).padStart(6)} KB`
    );
  }

  /* 5. Summary */
  console.log("\n  ─────────────────────────────────────");
  console.log(`  Total JS  ${(totalSrcKB / 1024).toFixed(1).padStart(7)} KB  →  ${(totalDistKB / 1024).toFixed(1).padStart(7)} KB`);
  console.log("\n  ✔ Build complete!  Deploy the  dist/  folder to Cloudflare Pages.");
  console.log("    Cloudflare build command:  node build.js");
  console.log("    Cloudflare output dir:     dist\n");
}

build().catch((err) => {
  console.error("\n  ✖ Build failed:", err.message);
  process.exit(1);
});
