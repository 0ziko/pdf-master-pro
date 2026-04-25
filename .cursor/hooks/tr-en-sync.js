#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
let raw = '';
process.stdin.on('data', d => (raw += d));
process.stdin.on('end', () => {
  let input = {};
  try { input = JSON.parse(raw); } catch (_) {}
  const editedPath = (input.tool_input && input.tool_input.path) || '';
  if (!editedPath.endsWith('i18n.js')) { console.log(JSON.stringify({ additional_context: '' })); return; }
  const src = fs.readFileSync(path.join(ROOT, 'js', 'i18n.js'), 'utf8');
  function countKeys(block) {
    return (block.match(/"[^"]+"\s*:/g) || []).length;
  }
  const enMatch = src.match(/\ben\s*:\s*\{([\s\S]*?)(?=\btr\s*:\s*\{)/);
  const trMatch = src.match(/\btr\s*:\s*\{([\s\S]*?)(?=\n\s*\}\s*;?\s*$|\n\s*\}\s*\n\s*\})/);
  const enCount = enMatch ? countKeys(enMatch[1]) : 0;
  const trCount = trMatch ? countKeys(trMatch[1]) : 0;
  const diff = enCount - trCount;
  if (Math.abs(diff) > 3) {
    console.log(JSON.stringify({ additional_context: `⚠️ tr-en-sync: EN has ${enCount} keys, TR has ${trCount} keys (diff: ${diff}). Ensure TR translations are added.` }));
  } else {
    console.log(JSON.stringify({ additional_context: `✅ tr-en-sync: EN=${enCount}, TR=${trCount} keys (diff: ${diff}).` }));
  }
});
