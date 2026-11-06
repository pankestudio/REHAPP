// Syntax-Check für index.html: prüft JEDEN Inline-<script>-Block mit
// node --check (bis Runde 5d nur den letzten, und der Regex traf seit dem
// Demo-Skript im <head> den falschen Block).
const { readFileSync, writeFileSync, mkdtempSync } = require('fs');
const { execFileSync } = require('child_process');
const os = require('os');
const path = require('path');

const html = readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const blocks = [...html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)]
  .filter(m => !/type=["']?(application\/(ld\+)?json|text\/template)/.test(m[1]));
if (!blocks.length) { console.error('Kein <script>-Block gefunden'); process.exit(1); }

const dir = mkdtempSync(path.join(os.tmpdir(), 'rehapp-validate-'));
let failed = 0;
blocks.forEach((m, i) => {
  const line = html.slice(0, m.index).split('\n').length;
  const file = path.join(dir, `block-${i + 1}.js`);
  writeFileSync(file, m[2]);
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
  } catch (err) {
    failed++;
    console.error(`Syntaxfehler in <script>-Block ${i + 1} (ab Zeile ${line} in index.html):`);
    console.error(String(err.stderr || err.message));
  }
});
if (failed) process.exit(1);
console.log(`SYNTAX OK (${blocks.length} Skript-Blöcke)`);
