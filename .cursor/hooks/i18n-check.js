#!/usr/bin/env node
/**
 * i18n-check.js  —  SnakeConverter afterFileEdit hook
 *
 * After any HTML or i18n.js file is edited, this hook:
 *   1. Scans all HTML files for data-i18n / data-i18n-ph attribute values
 *   2. Parses js/i18n.js to extract all defined EN and TR keys
 *   3. Reports any key that exists in HTML but is missing from EN or TR
 *
 * Output is returned as `additional_context` so the agent sees it immediately.
 */
'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

/* ── Read stdin (hook input) ── */
let raw = '';
process.stdin.on('data', d => (raw += d));
process.stdin.on('end', () => {
  let input = {};
  try { input = JSON.parse(raw); } catch (_) {}

  const editedPath = (input.tool_input && input.tool_input.path) || '';
  const rel = editedPath.replace(/\\/g, '/');

  /* Only run for .html or i18n.js edits */
  const relevant = rel.endsWith('.html') || rel.endsWith('i18n.js');
  if (!relevant) {
    console.log(JSON.stringify({ additional_context: '' }));
    return;
  }

  /* ── Parse i18n.js keys ── */
  const i18nFile = path.join(ROOT, 'js', 'i18n.js');
  if (!fs.existsSync(i18nFile)) {
    console.log(JSON.stringify({ additional_context: '⚠️ i18n-check: js/i18n.js not found.' }));
    return;
  }
  const i18nSrc = fs.readFileSync(i18nFile, 'utf8');

  function extractKeys(block) {
    const keys = new Set();
    const re = /"([^"]+)"\s*:/g;
    let m;
    while ((m = re.exec(block)) !== null) keys.add(m[1]);
    return keys;
  }

  /* Split EN and TR sections heuristically */
  const enMatch = i18nSrc.match(/\ben\s*:\s*\{([\s\S]*?)(?=\btr\s*:\s*\{)/);
  const trMatch = i18nSrc.match(/\btr\s*:\s*\{([\s\S]*?)(?=\n\s*\}\s*;?\s*$|\n\s*\}\s*\n\s*\})/);

  const enKeys = enMatch ? extractKeys(enMatch[1]) : new Set();
  const trKeys = trMatch ? extractKeys(trMatch[1]) : new Set();

  /* ── Scan HTML files ── */
  const HTML_FILES = [
    'index.html', 'pdf.html', 'tools.html', 'units.html',
    'calc.html', 'dev.html', 'color.html', 'pricing.html',
  ];

  const usedKeys = new Set();
  HTML_FILES.forEach(f => {
    const fp = path.join(ROOT, f);
    if (!fs.existsSync(fp)) return;
    const src = fs.readFileSync(fp, 'utf8');
    const re = /data-i18n(?:-ph)?="([^"]+)"/g;
    let m;
    while ((m = re.exec(src)) !== null) usedKeys.add(m[1]);
  });

  /* ── Compare ── */
  const missingEN = [];
  const missingTR = [];
  for (const key of usedKeys) {
    if (!enKeys.has(key)) missingEN.push(key);
    if (!trKeys.has(key)) missingTR.push(key);
  }

  if (!missingEN.length && !missingTR.length) {
    console.log(JSON.stringify({
      additional_context: `✅ i18n-check passed — all ${usedKeys.size} keys found in both EN and TR.`,
    }));
    return;
  }

  const lines = [`⚠️  i18n KEY CHECKER — ${new Date().toLocaleTimeString()}`];
  if (missingEN.length) {
    lines.push(`\n❌ Missing from EN (${missingEN.length}):\n  ${missingEN.join('\n  ')}`);
  }
  if (missingTR.length) {
    lines.push(`\n❌ Missing from TR (${missingTR.length}):\n  ${missingTR.join('\n  ')}`);
  }
  lines.push('\n👉 Add the missing keys to js/i18n.js before pushing.');

  console.log(JSON.stringify({ additional_context: lines.join('') }));
});
