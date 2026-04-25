#!/usr/bin/env node
'use strict';
let raw = '';
process.stdin.on('data', d => (raw += d));
process.stdin.on('end', () => {
  let input = {};
  try { input = JSON.parse(raw); } catch (_) {}
  const cmd = (input.command || '').toLowerCase();
  const dangerous = ['force', '--hard', 'reset head', 'push -f', 'push --force'];
  const found = dangerous.find(d => cmd.includes(d));
  if (found) {
    console.log(JSON.stringify({
      permission: 'ask',
      user_message: `⚠️ Risky git command detected: "${found}". Are you sure?`,
      agent_message: `Hook flagged this git command as potentially destructive.`,
    }));
  } else {
    console.log(JSON.stringify({ permission: 'allow' }));
  }
});
