/**
 * Faz 4 — Spoke HTML integrity: self-canonical, hreflang pair, hub link.
 * Run: node scripts/seo-micro-integrity.cjs
 */
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const HOST = "https://snakeconverter.com";

const SPOKE_ROOTS = [
  { dir: path.join(root, "convert"), pathPrefix: "/convert/" },
  { dir: path.join(root, "tr", "convert"), pathPrefix: "/tr/convert/" },
  { dir: path.join(root, "calculators"), pathPrefix: "/calculators/" },
  { dir: path.join(root, "tr", "calculators"), pathPrefix: "/tr/calculators/" },
];

function walkHtml(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, name.name);
    if (name.isFile() && name.name.endsWith(".html")) out.push(p);
  }
  return out;
}

function extractCanonical(html) {
  const m = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  return m ? m[1].trim() : null;
}

function hasHreflang(html) {
  return /<link[^>]+rel=["']alternate["'][^>]+hreflang=/i.test(html);
}

function hasHubLink(html) {
  return /href=["'][^"']*units\.html["']/i.test(html) || /href=["'][^"']*calc\.html["']/i.test(html);
}

let errors = 0;

for (const { dir, pathPrefix } of SPOKE_ROOTS) {
  for (const file of walkHtml(dir)) {
    const rel = path.relative(root, file).replace(/\\/g, "/");
    const raw = fs.readFileSync(file, "utf8");
    const slug = path.basename(file, ".html");
    const expected = HOST + pathPrefix + slug;
    const can = extractCanonical(raw);
    if (!can) {
      console.error("MISSING canonical:", rel);
      errors++;
      continue;
    }
    if (can !== expected) {
      console.error("canonical mismatch:\n  file:", rel, "\n  expected:", expected, "\n  got:", can);
      errors++;
    }
    if (!hasHreflang(raw)) {
      console.error("MISSING hreflang alternates:", rel);
      errors++;
    }
    if (!hasHubLink(raw)) {
      console.error("MISSING link to units.html or calc.html (hub):", rel);
      errors++;
    }
  }
}

console.log("seo-micro-integrity: spoke roots checked —", SPOKE_ROOTS.map((s) => s.pathPrefix).join(", "));
if (errors > 0) {
  console.error("Failures:", errors);
  process.exit(1);
}
process.exit(0);
