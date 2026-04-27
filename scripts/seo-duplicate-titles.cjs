/**
 * Faz 4 — Find duplicate <title> and meta description across static HTML.
 * Run: node scripts/seo-duplicate-titles.cjs
 */
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const seenTitles = new Map();
const seenDesc = new Map();
const skip = new Set(["node_modules", ".git", "dist", "out"]);

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    if (name.name.startsWith(".")) continue;
    const p = path.join(dir, name.name);
    if (name.isDirectory()) {
      if (skip.has(name.name)) continue;
      walk(p, files);
    } else if (name.isFile() && name.name.endsWith(".html")) {
      files.push(p);
    }
  }
  return files;
}

function extract(html, re) {
  const m = html.match(re);
  return m ? m[1].replace(/\s+/g, " ").trim() : null;
}

const htmlFiles = walk(root);
let emptyTitle = 0;

for (const f of htmlFiles) {
  const rel = path.relative(root, f).replace(/\\/g, "/");
  const raw = fs.readFileSync(f, "utf8");
  const title = extract(raw, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const desc = extract(raw, /<meta\s+name="description"\s+content="([^"]*)"/i);
  if (!title || !title.length) {
    emptyTitle++;
    console.warn("MISSING or empty <title>:", rel);
  } else {
    if (!seenTitles.has(title)) seenTitles.set(title, []);
    seenTitles.get(title).push(rel);
  }
  if (desc) {
    if (!seenDesc.has(desc)) seenDesc.set(desc, []);
    seenDesc.get(desc).push(rel);
  }
}

let dupsT = 0;
let dupsD = 0;
console.log("=== Duplicate <title> (same string, 2+ files) ===\n");
for (const [t, list] of seenTitles) {
  if (list.length < 2) continue;
  dupsT++;
  console.log("Title:", t.slice(0, 120) + (t.length > 120 ? "…" : ""));
  list.forEach((r) => console.log("  -", r));
  console.log("");
}
console.log("=== Duplicate meta name=description (same string, 2+ files) ===\n");
for (const [d, list] of seenDesc) {
  if (list.length < 2) continue;
  dupsD++;
  console.log("Desc:", d.slice(0, 100) + (d.length > 100 ? "…" : ""));
  list.forEach((r) => console.log("  -", r));
  console.log("");
}

console.log("Scanned", htmlFiles.length, "html files.");
console.log("Duplicate title groups:", dupsT, "| duplicate description groups:", dupsD, "| empty titles:", emptyTitle);
if (dupsT > 0 || dupsD > 0 || emptyTitle > 0) process.exit(1);
process.exit(0);
