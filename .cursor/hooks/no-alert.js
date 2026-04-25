#!/usr/bin/env node
'use strict';
const fs = require('fs');
let raw = '';
process.stdin.on('data', d => (raw += d));
process.stdin.on('end', () => {
  let input = {};
  try { input = JSON.parse(raw); } catch (_) {}
  const content = (input.tool_input && input.tool_input.content) || '';
  const path = (input.tool_input && input.tool_input.path) || '';
  if (!path.endsWith('.js')) { console.log(JSON.stringify({ additional_context: '' })); return; }
  const alerts = (content.match(/\balert\s*\(/g) || []).length;
  if (alerts > 0) {
    console.log(JSON.stringify({ additional_context: `⚠️ no-alert: ${alerts} alert() call(s) found in ${path}. Use a toast/UI message instead.` }));
  } else {
    console.log(JSON.stringify({ additional_context: '' }));
  }
});
