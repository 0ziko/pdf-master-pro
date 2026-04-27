/**
 * One-shot: regen micro + sitemap, then SEO QA (duplicate meta + micro integrity), then build.
 * Run from repo root: node scripts/ship-check.cjs
 * Or: npm run ship:qa
 */
"use strict";

const { spawnSync } = require("child_process");
const path = require("path");

const root = path.join(__dirname, "..");
const node = process.execPath;
const j = (name) => path.join(__dirname, name);

function runScript(file, label) {
  const r = spawnSync(node, [j(file)], { stdio: "inherit", cwd: root, env: process.env });
  if (r.status !== 0) {
    console.error("FAIL:", label, "exit", r.status);
    process.exit(r.status || 1);
  }
}

const { main: regenMicro } = require(j("generate-micro-pages.cjs"));
const { main: regenSitemap } = require(j("generate-sitemap.cjs"));

regenMicro();
regenSitemap();
runScript("seo-duplicate-titles.cjs", "seo-duplicate-titles");
runScript("seo-micro-integrity.cjs", "seo-micro-integrity");

const buildPath = path.join(root, "build.js");
if (require("fs").existsSync(buildPath)) {
  const r = spawnSync(node, [buildPath], { stdio: "inherit", cwd: root, env: process.env });
  if (r.status !== 0) {
    console.error("FAIL: build.js exit", r.status);
    process.exit(r.status || 1);
  }
} else {
  console.warn("ship-check: build.js not found, skipping build.");
}

console.log("ship-check: OK (micro + sitemap + seo:qa + build)");
