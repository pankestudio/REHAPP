#!/usr/bin/env node
// scripts/shots.mjs — Runde 5d Punkt 4: Screenshots, Regression, Vergleichsseite.
//
// Nutzung:
//   npm run shots              Screenshots nach screenshots/aktuell/, Vergleich
//                              gegen screenshots/basis/, Vergleichsseite
//                              screenshots/report.html
//   npm run shots -- --update  aktuelle Screenshots werden zur neuen Basis.
//                              Das ist ein eigener Commit mit Grund im Text.
//
// Alles läuft im Demo-Modus (feste Uhr, Demodaten aus tests/fixtures/demo.json),
// mit reduzierter Bewegung, damit sich Screenshots nur ändern, wenn sich die App
// ändert. deviceScaleFactor 2, je 390×844 und 1440×900, hell und Nacht.
// Regression: höchstens 1 % abweichende Pixel (maxDiffPixelRatio 0.01).
// Die Referenzbilder aus docs/design/ sind Entwürfe, keine Pixelvorlage; sie
// stehen auf der Vergleichsseite nur zum Anschauen daneben.

import { chromium } from 'playwright';
import http from 'node:http';
import { readFile, writeFile, mkdir, readdir, copyFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'screenshots');
const AKTUELL = path.join(OUT, 'aktuell');
const BASIS = path.join(OUT, 'basis');
const REFERENZ = path.join(OUT, 'referenz');
const PORT = 8744;
const MAX_DIFF = 0.01;
const UPDATE = process.argv.includes('--update');

const VIEWPORTS = [{ name: '390', w: 390, h: 844 }, { name: '1440', w: 1440, h: 900 }];
const THEMES = ['hell', 'nacht'];

// Jeder Screen: Demo-Uhrzeit und was danach zu tun ist.
const SCREENS = [
  { id: 'heute-0705', time: '2026-11-03T07:05' },
  { id: 'heute-1118', time: '2026-11-03T11:18' },
  { id: 'heute-1540', time: '2026-11-03T15:40' },
  { id: 'heute-2140', time: '2026-11-03T21:40' },
  { id: 'heute-alles-erledigt', time: '2026-11-03T21:40', run: async () => {
    const key = getLocalDateKey();
    for (const g of getActiveHeuteGoals()) if (!isLogged(g.id, key)) await toggleLog(g.id, key, false);
    buildHeuteScreen();
  } },
  { id: 'uebungen', run: () => showPage('pg-move') },
  { id: 'uebungsdetail', run: () => { showPage('pg-move'); openGoalDetailSheet('goal-from-morning'); } },
  { id: 'player-timer', run: () => openPlayer('exercise-foot-activation') },
  { id: 'player-atmung', run: () => openPlayer('exercise-box-breathing') },
  { id: 'sammlung-detail', run: () => { showPage('pg-sammlung'); openBadgeDetail('goal-from-morning'); } },
  { id: 'wissen', run: () => showPage('pg-supp') },
  { id: 'setup', run: () => showPage('pg-settings') },
  { id: 'checkin', time: '2026-11-03T21:40', run: () => openAbendCheckin() },
  { id: 'ziel-anlegen', run: () => goToGoalEditor(null) },
];
const DEFAULT_TIME = '2026-11-03T11:18';

function startServer() {
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml' };
  return new Promise(resolve => {
    const server = http.createServer(async (req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p === '/') p = '/index.html';
      try {
        const data = await readFile(path.join(ROOT, p));
        res.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream' });
        res.end(data);
      } catch { res.writeHead(404); res.end(); }
    });
    server.listen(PORT, () => resolve(server));
  });
}

// Pixelvergleich im Browser über Canvas, damit keine Zusatzpakete nötig sind.
async function diffRatio(page, aPath, bPath) {
  const [a, b] = await Promise.all([readFile(aPath), readFile(bPath)]);
  return page.evaluate(async ([a64, b64]) => {
    const load = src => new Promise((ok, err) => { const i = new Image(); i.onload = () => ok(i); i.onerror = err; i.src = 'data:image/png;base64,' + src; });
    const [ia, ib] = await Promise.all([load(a64), load(b64)]);
    if (ia.width !== ib.width || ia.height !== ib.height) return 1;
    const read = img => { const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0); return x.getImageData(0, 0, c.width, c.height).data; };
    const da = read(ia), db = read(ib);
    let diff = 0;
    for (let i = 0; i < da.length; i += 4) {
      if (Math.abs(da[i] - db[i]) > 16 || Math.abs(da[i + 1] - db[i + 1]) > 16 || Math.abs(da[i + 2] - db[i + 2]) > 16) diff++;
    }
    return diff / (da.length / 4);
  }, [a.toString('base64'), b.toString('base64')]);
}

async function main() {
  await rm(AKTUELL, { recursive: true, force: true });
  await mkdir(AKTUELL, { recursive: true });
  await mkdir(BASIS, { recursive: true });
  await mkdir(REFERENZ, { recursive: true });

  const server = await startServer();
  const browser = await chromium.launch();
  const errors = [];
  const shots = [];

  for (const vp of VIEWPORTS) {
    for (const theme of THEMES) {
      const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 2, reducedMotion: 'reduce', serviceWorkers: 'block' });
      for (const s of SCREENS) {
        const page = await ctx.newPage();
        page.on('pageerror', e => errors.push(`${s.id}@${vp.name}-${theme}: ${e.message}`));
        const t = s.time || DEFAULT_TIME;
        await page.goto(`http://localhost:${PORT}/index.html?demo=${t}&theme=${theme === 'nacht' ? 'night' : 'light'}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(800);
        if (s.run) { await page.evaluate(s.run); await page.waitForTimeout(700); }
        const file = `${s.id}-${vp.name}-${theme}.png`;
        await page.screenshot({ path: path.join(AKTUELL, file) });
        shots.push({ screen: s.id, vp: vp.name, theme, file });
        await page.close();
      }
      await ctx.close();
      console.log(`  ${vp.name}px ${theme}: ${SCREENS.length} Screenshots`);
    }
  }

  // Regression gegen die Basis
  const cmpPage = await browser.newPage();
  let red = 0, neu = 0;
  for (const s of shots) {
    const basis = path.join(BASIS, s.file);
    if (UPDATE || !existsSync(basis)) {
      await copyFile(path.join(AKTUELL, s.file), basis);
      s.status = UPDATE ? 'Basis aktualisiert' : 'neu in Basis';
      if (!UPDATE) neu++;
      continue;
    }
    const r = await diffRatio(cmpPage, path.join(AKTUELL, s.file), basis);
    s.diff = r;
    s.status = r <= MAX_DIFF ? 'gleich' : 'abweichend';
    if (r > MAX_DIFF) red++;
  }
  await browser.close();
  server.close();

  // Referenzbilder und Befunde für die Vergleichsseite
  const refMap = JSON.parse(await readFile(path.join(ROOT, 'tests/visual/referenzen.json'), 'utf8'));
  for (const f of await readdir(path.join(ROOT, 'docs/design'))) {
    if (f.endsWith('.png')) await copyFile(path.join(ROOT, 'docs/design', f), path.join(REFERENZ, f));
  }
  let checkLines = [];
  const checkFile = path.join(OUT, 'check.txt');
  if (existsSync(checkFile)) checkLines = (await readFile(checkFile, 'utf8')).split('\n').filter(l => l.startsWith('✗'));

  await writeFile(path.join(OUT, 'report.html'), report(shots, refMap, checkLines, errors));
  console.log(`\n${shots.length} Screenshots, ${red} abweichend, ${neu} neu in der Basis.`);
  console.log('Vergleichsseite: screenshots/report.html');
  if (errors.length) { console.log('Seitenfehler:\n  ' + errors.join('\n  ')); process.exitCode = 1; }
  if (red && !UPDATE) {
    console.log(`\nREGRESSION: ${red} Screenshot(s) weichen mehr als ${MAX_DIFF * 100} % ab. Gewollt? npm run shots -- --update`);
    process.exitCode = 1;
  }
}

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function report(shots, refMap, checkLines, errors) {
  const byScreen = {};
  shots.forEach(s => { (byScreen[s.screen] ||= []).push(s); });
  const stamp = new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' });
  const sections = Object.entries(byScreen).map(([screen, list]) => {
    const refs = refMap[screen] || {};
    const checkKey = refs.check || screen;
    const msgs = checkLines.filter(l => l.includes(`[${checkKey}`));
    const rows = list.map(s => {
      const ref = refs[s.vp];
      const badge = s.status === 'abweichend' ? `<span class="bad">abweichend ${(s.diff * 100).toFixed(2)} %</span>`
        : s.status === 'gleich' ? `<span class="ok">gleich ${(s.diff * 100).toFixed(2)} %</span>` : `<span>${esc(s.status)}</span>`;
      return `<div class="pair">
        <figure>${ref ? `<img src="referenz/${esc(ref)}" alt="Referenz ${esc(ref)}" loading="lazy">` : '<div class="none">kein Referenzbild</div>'}<figcaption>Referenz${ref ? ' · ' + esc(ref) : ''}</figcaption></figure>
        <figure><img src="aktuell/${esc(s.file)}" alt="Aktuell ${esc(s.file)}" loading="lazy"><figcaption>Aktuell · ${s.vp}px ${s.theme} · ${badge}</figcaption></figure>
      </div>`;
    }).join('');
    return `<section><h2>${esc(screen)}</h2>${rows}
      <div class="msgs">${msgs.length ? '<ul>' + msgs.map(m => `<li>${esc(m.slice(2))}</li>`).join('') + '</ul>' : '<p>Keine Regel-Meldungen.</p>'}</div></section>`;
  }).join('');
  const red = shots.filter(s => s.status === 'abweichend').length;
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>REHAPP Abnahme</title>
<style>
:root{--paper:#F4F3EF;--ink:#14140F;--muted:#5E5C55;--line:#D9D4C7;--ok:#2E6B3A;--bad:#A12A1E}
body{margin:0;background:var(--paper);color:var(--ink);font:15px/1.5 system-ui,sans-serif;padding:24px 16px}
h1{font-weight:300;font-size:40px;margin:0 0 4px}h2{font-weight:400;font-size:24px;border-top:1px solid var(--line);padding-top:20px;margin:32px 0 12px}
.meta{color:var(--muted)}.pair{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px}
figure{margin:0}img{width:100%;height:auto;border:1px solid var(--line);background:#fff}figcaption{color:var(--muted);font-size:13px;margin-top:4px}
.none{aspect-ratio:390/844;border:1px dashed var(--line);display:grid;place-items:center;color:var(--muted)}
.ok{color:var(--ok)}.bad{color:var(--bad);font-weight:600}.msgs{font-size:13px;color:var(--muted)}
@media (max-width:700px){.pair{grid-template-columns:1fr}}
</style></head><body>
<h1>REHAPP Abnahme</h1>
<p class="meta">Erzeugt ${esc(stamp)} · Demo-Modus · ${shots.length} Screenshots · ${red} abweichend · Regel-Meldungen: ${checkLines.length}${errors.length ? ' · Seitenfehler: ' + errors.length : ''}</p>
<p class="meta">Links das Referenzbild aus docs/design/ (Entwurf, keine Pixelvorlage), rechts der aktuelle Stand. „gleich/abweichend“ vergleicht gegen screenshots/basis/.</p>
${sections}
</body></html>`;
}

main().catch(err => { console.error(err); process.exitCode = 1; });
