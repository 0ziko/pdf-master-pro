#!/usr/bin/env node
/**
 * deploy-reminder.js — postToolUse hook (user-level or project-level)
 *
 * Neden ayrı dosya: Workspace kökü `empty-window` gibi üst klasör açıkken
 * pdf-master-pro/.cursor/hooks.json yüklenmeyebilir. Bu betik
 * ~/.cursor/hooks.json üzerinden mutlaka koşturulabilir; yol içinde
 * `pdf-master-pro` (veya REPO_MARKERS) geçen düzenlemelerde agent'a
 * PowerShell deploy bloğunu additional_context ile verir.
 *
 * Ayrıca: afterFileEdit yalnızca "Write" ile eşleşirse, agent'ın çoğunlukla
 * kullandığı "StrReplace" bu event'e düşmediği için diğer kancalar susuyordu;
 * deploy için postToolUse + StrReplace|Write kullanın.
 */
'use strict';

/* Bu stringler düzenlenen dosya yolunda (case-insensitive) aranır. */
const REPO_MARKERS = ['pdf-master-pro'];

const POWERSHELL_BLOCK = [
  '',
  '─── [Otomatik: SnakeConverter — deploy (PowerShell)] ───',
  'Bu repoda yayın: `main`e push edince Cloudflare Pages genelde otomatik deploy alır. `node build.js` sadece `dist/` üretir; CDN’e gitmez.',
  'Cevabının **sonuna** aşağıdaki bloğu ekle; kullanıcı aynı akışı kopyalayıp çalıştırsın.',
  '```powershell',
  'Set-Location "C:\\Users\\ozanv\\.cursor\\projects\\empty-window\\pdf-master-pro"',
  '',
  'node build.js',
  'git status',
  'git add -A',
  'git commit -m "chore: kısa açıklama"',
  'git push origin main',
  '',
  '# Dal main değilse:',
  '# git push origin <dal-adı>',
  '# Worker (R2 paylaşım) için: cd worker; npx wrangler deploy',
  '```',
].join('\n');

function pathMatchesRepo(filePath) {
  const n = String(filePath || '').replace(/\\/g, '/').toLowerCase();
  if (!n) return false;
  return REPO_MARKERS.some((m) => n.includes(m.toLowerCase()));
}

let raw = '';
process.stdin.on('data', (d) => (raw += d));
process.stdin.on('end', () => {
  let input = {};
  try {
    input = JSON.parse(raw);
  } catch (_) {}
  const p = (input.tool_input && input.tool_input.path) || '';
  if (!pathMatchesRepo(p)) {
    process.stdout.write(JSON.stringify({ additional_context: '' }));
    return;
  }
  process.stdout.write(JSON.stringify({ additional_context: POWERSHELL_BLOCK }));
});
