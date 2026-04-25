#!/usr/bin/env node
'use strict';
let raw = '';
process.stdin.on('data', d => (raw += d));
process.stdin.on('end', () => {
  let input = {};
  try { input = JSON.parse(raw); } catch (_) {}
  const p = (input.tool_input && input.tool_input.path) || '';
  if (p.includes('/dist/') || p.includes('\\dist\\')) {
    console.log(JSON.stringify({ additional_context: '⚠️ build-reminder: You edited a file in /dist/. Edit source files instead and run `node build.js` to rebuild.' }));
  } else {
    console.log(JSON.stringify({ additional_context: '' }));
  }
});
