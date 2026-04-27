/**
 * Faz 5 — Depo ön kontrolü (GSC/Bing çeyreklik pası öncesi).
 * Çıktı: mikro sayfa sayıları, ship:qa ile aynı duplicate title/desc denetimi (çıkış kodu aynı).
 *
 * Run: node scripts/seo-faz5-preflight.cjs
 *      npm run seo:faz5:preflight
 */
"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.join(__dirname, "..");
const node = process.execPath;

function countHtmlUnder(sub) {
  const dir = path.join(root, sub);
  if (!fs.existsSync(dir)) return 0;
  let n = 0;
  const walk = (d) => {
    for (const name of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, name.name);
      if (name.isDirectory()) walk(p);
      else if (name.isFile() && name.name.endsWith(".html")) n++;
    }
  };
  walk(dir);
  return n;
}

console.log("=== Faz 5 preflight —", new Date().toISOString().slice(0, 10), "===\n");
console.log("Micro-ish HTML counts:");
console.log("  convert/     ", countHtmlUnder("convert"));
console.log("  tr/convert/  ", countHtmlUnder(path.join("tr", "convert")));
console.log("  calculators/ ", countHtmlUnder("calculators"));
console.log("  tr/calculators/", countHtmlUnder(path.join("tr", "calculators")));
console.log("");

const dup = spawnSync(node, [path.join(__dirname, "seo-duplicate-titles.cjs")], {
  cwd: root,
  encoding: "utf8",
  env: process.env,
});
if (dup.stdout) process.stdout.write(dup.stdout);
if (dup.stderr) process.stderr.write(dup.stderr);

const integ = spawnSync(node, [path.join(__dirname, "seo-micro-integrity.cjs")], {
  cwd: root,
  encoding: "utf8",
  env: process.env,
});
if (integ.stdout) process.stdout.write(integ.stdout);
if (integ.stderr) process.stderr.write(integ.stderr);

const code = dup.status !== 0 ? dup.status : integ.status;
if (code !== 0) {
  console.error("\n[faz5-preflight] SEO QA failed — fix duplicate/micro issues before GSC-led merge/noindex work.");
  process.exit(code || 1);
}

console.log("\n[faz5-preflight] Repo SEO QA OK. Next: GSC/Bing review per docs/seo-faz5-iteration.md (table §).");
process.exit(0);
