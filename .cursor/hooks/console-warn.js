#!/usr/bin/env node
'use strict';
let raw = '';
process.stdin.on('data', d => (raw += d));
process.stdin.on('end', () => {
  let input = {};
  try { input = JSON.parse(raw); } catch (_) {}
  const content = (input.tool_input && input.tool_input.content) || '';
  const path = (input.tool_input && input.tool_input.path) || '';
  if (!path.endsWith('.js')) { console.log(JSON.stringify({ additional_context: '' })); return; }
  const logs = (content.match(/console\.(log|warn|error|debug)\s*\(/g) || []).length;
  if (logs > 3) {
    console.log(JSON.stringify({ additional_context: `⚠️ console-warn: ${logs} console.* calls in ${path}. Remove debug logs before production.` }));
  } else {
    console.log(JSON.stringify({ additional_context: '' }));
  }
});
