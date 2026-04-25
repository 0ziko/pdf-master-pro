#!/usr/bin/env node
/**
 * lang-coverage.js  —  SnakeConverter afterFileEdit hook
 *
 * After any HTML file is saved, scans for interactive/content elements
 * (button, label, h1-h6, option, th) that have visible text but are
 * missing a data-i18n attribute.
 *
 * Reports a coverage %, and lists the first 10 offenders so the developer
 * can fix them before pushing.
 */
'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

process.stdin.on('data', () => {});
process.stdin.on('end', () => {
  /* Only act on html files in the project root */
  const edited = (process.env.CURSOR_EDIT_PATH || '').replace(/\\/g, '/');
  if (!edited.endsWith('.html')) {
    process.stdout.write(JSON.stringify({ additional_context: '' }));
    return;
  }

  const filePath = path.join(ROOT, path.basename(edited));
  if (!fs.existsSync(filePath)) {
    process.stdout.write(JSON.stringify({ additional_context: '' }));
    return;
  }

  const src = fs.readFileSync(filePath, 'utf8');

  /* Tags we care about */
  const tags = ['button', 'label', 'h1', 'h2', 'h3', 'h4', 'option', 'th'];
  const tagRe = new RegExp(
    `<(${tags.join('|')})(\\s[^>]*)?>([^<]{2,})<\\/(?:${tags.join('|')})>`,
    'gi'
  );

  const withI18n    = [];
  const withoutI18n = [];
  let m;

  while ((m = tagRe.exec(src)) !== null) {
    const attrs = m[2] || '';
    const text  = m[3].trim();
    /* Skip empty, pure-number, or icon-only text */
    if (!text || /^[\d\s±×÷+\-*/.,:;()%]+$/.test(text)) continue;
    /* Skip script/style noise */
    if (text.startsWith('//') || text.includes('{')) continue;

    if (/data-i18n/.test(attrs)) {
      withI18n.push(text.slice(0, 40));
    } else {
      withoutI18n.push({ tag: m[1], text: text.slice(0, 60) });
    }
  }

  const total    = withI18n.length + withoutI18n.length;
  const coverage = total ? Math.round((withI18n.length / total) * 100) : 100;
  const fileName = path.basename(filePath);

  if (coverage === 100 || total === 0) {
    process.stdout.write(JSON.stringify({
      additional_context: `✅ lang-coverage [${fileName}]: 100% — all ${total} translatable elements have data-i18n.`,
    }));
    return;
  }

  const emoji = coverage >= 80 ? '🟡' : '🔴';
  const lines = [
    `${emoji} lang-coverage [${fileName}]: ${coverage}% i18n coverage (${withI18n.length}/${total} elements translated).`,
    `\n⚠️  ${withoutI18n.length} element(s) missing data-i18n — first 10:`,
  ];
  withoutI18n.slice(0, 10).forEach(e => {
    lines.push(`\n  <${e.tag}> "${e.text}"`);
  });
  lines.push('\n👉 Add data-i18n="key" and define the key in js/i18n.js (both EN and TR).');

  process.stdout.write(JSON.stringify({ additional_context: lines.join('') }));
});
