// Syntax-Check für index.html — extrahiert den <script>-Block und prüft ihn mit node --check
const { readFileSync, writeFileSync } = require('fs');
const { execSync } = require('child_process');

const html = readFileSync('index.html', 'utf8');
const match = html.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/);
if (!match) { console.error('Kein <script>-Block gefunden'); process.exit(1); }

const tmp = '/tmp/rehapp_validate.js';
writeFileSync(tmp, match[1]);

try {
  execSync(`node --check ${tmp}`, { stdio: 'inherit' });
  console.log('SYNTAX OK');
} catch {
  process.exit(1);
}
