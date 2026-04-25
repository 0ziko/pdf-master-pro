#!/usr/bin/env node
/**
 * audit-links.js — postToolUse hook
 * Fires after Write / StrReplace on any .html file.
 * Parses index.html links and validates every href="*.html#id"
 * against the real section IDs in the target pages.
 */
'use strict';

const fs   = require('fs');
const path = require('path');

let raw = '';
process.stdin.on('data', d => (raw += d));
process.stdin.on('end', () => {
  let input = {};
  try { input = JSON.parse(raw); } catch (_) {}

  /* Only run when an HTML file was edited */
  const editedPath = (input.tool_input && input.tool_input.path) || '';
  if (!editedPath.endsWith('.html')) {
    process.stdout.write(JSON.stringify({ additional_context: '' }));
    return;
  }

  const projectRoot = path.dirname(editedPath);
  const indexPath   = path.join(projectRoot, 'index.html');

  if (!fs.existsSync(indexPath)) {
    process.stdout.write(JSON.stringify({ additional_context: '' }));
    return;
  }

  /* ── 1. Extract all href="*.html#id" links from index.html ── */
  const indexHtml = fs.readFileSync(indexPath, 'utf8');
  const linkRe    = /href="([a-zA-Z0-9_-]+\.html)#([^"]+)"/g;
  const links     = [];
  let m;
  while ((m = linkRe.exec(indexHtml)) !== null) {
    links.push({ file: m[1], id: m[2], raw: m[0] });
  }

  /* ── 2. PDF tabs come from app.js VALID_TABS, not section IDs ── */
  const PDF_VALID_TABS = new Set([
    'excel', 'image', 'merge', 'split', 'encrypt', 'share', 'screenshot'
  ]);

  /* ── 3. For each target page, collect actual section IDs ── */
  const sectionCache = {};
  function getSectionIds(htmlFile) {
    if (sectionCache[htmlFile]) return sectionCache[htmlFile];
    const p = path.join(projectRoot, htmlFile);
    if (!fs.existsSync(p)) { sectionCache[htmlFile] = new Set(); return sectionCache[htmlFile]; }
    const html = fs.readFileSync(p, 'utf8');
    const ids  = new Set();
    /* tool-page-section IDs */
    const secRe = /id="([^"]+)"\s+class="tool-page-section"/g;
    let sm;
    while ((sm = secRe.exec(html)) !== null) ids.add(sm[1]);
    /* Also capture dynamically generated CATS keys from units.js */
    if (htmlFile === 'units.html') {
      const unitsJsPath = path.join(projectRoot, 'js', 'units.js');
      if (fs.existsSync(unitsJsPath)) {
        const unitsJs = fs.readFileSync(unitsJsPath, 'utf8');
        const catRe   = /^\s+(\w+):\s*\{/gm;
        let cm;
        while ((cm = catRe.exec(unitsJs)) !== null) ids.add(cm[1]);
        /* Custom sections appended by units.html script */
        ['cooking', 'shoe-size', 'typography'].forEach(id => ids.add(id));
      }
    }
    sectionCache[htmlFile] = ids;
    return ids;
  }

  /* ── 4. Audit every link ── */
  const broken = [];
  for (const link of links) {
    if (link.file === 'pdf.html') {
      if (!PDF_VALID_TABS.has(link.id)) {
        broken.push({ file: link.file, id: link.id, hint: `Valid pdf tabs: ${[...PDF_VALID_TABS].join(', ')}` });
      }
    } else {
      const ids = getSectionIds(link.file);
      if (ids.size === 0) continue; /* file not found — skip */
      if (!ids.has(link.id)) {
        broken.push({
          file: link.file,
          id:   link.id,
          hint: `Available IDs: ${[...ids].join(', ')}`
        });
      }
    }
  }

  if (broken.length === 0) {
    process.stdout.write(JSON.stringify({ additional_context: '' }));
    return;
  }

  /* ── 5. Return broken links as agent context ── */
  const report = [
    `⚠️  LINK AUDIT: ${broken.length} broken navigation link(s) detected in index.html:`,
    '',
    ...broken.map((b, i) =>
      `${i + 1}. href="${b.file}#${b.id}" — section #${b.id} does not exist in ${b.file}\n   ${b.hint}`
    ),
    '',
    'Fix these links in index.html before committing.',
  ].join('\n');

  process.stdout.write(JSON.stringify({ additional_context: report }));
});
