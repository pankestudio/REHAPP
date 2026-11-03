#!/usr/bin/env node
// scripts/check-ui.mjs — REHAPP UI-Prüfskript (Hybrid "ein Designsystem" Aufräumen).
//
// Prüft den tatsächlich gerenderten Zustand der App (nicht nur den Quelltext):
// startet einen lokalen Static-Server, öffnet index.html in einem echten
// Browser (Playwright), besucht alle 5 Tabs + die wichtigsten Sheets/Overlays
// und prüft dort jeweils den gerenderten DOM auf:
//   - verbotene Klassen-Präfixe (panel, page-header, bottom-nav, hero, xp,
//     supp-, mld-, bfr-, emg-, recipe-, btn-, gmi-, quote, habit, scroll-page,
//     cal-btn)
//   - Farbwerte außerhalb der Tokens (color/background-color/border-color)
//   - text-transform: uppercase
//   - jede andere font-family als Host Grotesk
//   - die Strings "XP", "LV", "// V3", "Guten Tag" im sichtbaren Text
// Legt außerdem Screenshots aller besuchten Zustände unter screenshots/ ab.
//
// Nutzung: node scripts/check-ui.mjs   (bzw. npm run check-ui)
// Braucht Playwright (devDependency) — beim ersten Lauf ggf. zusätzlich
// `npx playwright install chromium`.

import { chromium } from 'playwright';
import http from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCREENSHOT_DIR = path.join(ROOT, 'screenshots');
const PORT = 8743;

const FORBIDDEN_CLASS_PREFIXES = [
  'panel', 'page-header', 'bottom-nav', 'hero', 'xp', 'supp-', 'mld-', 'bfr-',
  'emg-', 'recipe-', 'btn-', 'gmi-', 'quote', 'habit', 'scroll-page', 'cal-btn',
];
const FORBIDDEN_STRINGS = ['XP', 'LV', '// V3', 'Guten Tag'];
const ALLOWED_HEX = new Set([
  '#f4f3ef', '#14140f', '#ffe14d', '#5e5c55', '#8a877e', '#6b6860', '#d9d4c7',
  '#eae6dc', '#bdb8ac',
]);

let failures = [];
let checkedStates = 0;

function fail(msg) { failures.push(msg); }

function rgbToHex(rgb) {
  const m = rgb.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
  if (!m) return null;
  const [, r, g, b, a] = m;
  if (a !== undefined && parseFloat(a) === 0) return null; // transparent, ignore
  const hex = '#' + [r, g, b].map(v => parseInt(v, 10).toString(16).padStart(2, '0')).join('');
  return hex;
}

async function auditState(page, label) {
  checkedStates++;
  await mkdir(SCREENSHOT_DIR, { recursive: true });
  const shotName = label.replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '.png';
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, shotName) });

  const result = await page.evaluate(({ prefixes, allowedHex: allowedHexArr }) => {
    const allowedHex = new Set(allowedHexArr);
    const badClasses = new Set();
    const badFonts = new Set();
    const badColors = new Set();
    let uppercaseCount = 0;

    function rgbToHexInPage(rgb) {
      const m = rgb.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
      if (!m) return null;
      const [, r, g, b, a] = m;
      if (a !== undefined && parseFloat(a) === 0) return null;
      return '#' + [r, g, b].map(v => parseInt(v, 10).toString(16).padStart(2, '0')).join('');
    }

    document.querySelectorAll('*').forEach(el => {
      if (el.className && typeof el.className === 'string') {
        el.className.split(/\s+/).filter(Boolean).forEach(cls => {
          if (prefixes.some(p => cls.startsWith(p))) badClasses.add(cls + ' @ ' + (el.id || el.tagName));
        });
      }
      const visible = el.offsetParent !== null || el === document.body;
      if (!visible) return;
      const cs = getComputedStyle(el);
      if (cs.textTransform === 'uppercase') uppercaseCount++;
      if (cs.fontFamily && !cs.fontFamily.includes('Host Grotesk')) {
        badFonts.add(cs.fontFamily + ' @ ' + (el.id || el.className || el.tagName));
      }
      ['color', 'backgroundColor', 'borderTopColor'].forEach(prop => {
        const hex = rgbToHexInPage(cs[prop]);
        if (hex && !allowedHex.has(hex)) badColors.add(hex + ' (' + prop + ') @ ' + (el.id || el.className || el.tagName));
      });
    });

    const text = document.body.innerText || '';
    return {
      badClasses: [...badClasses],
      badFonts: [...badFonts],
      badColors: [...badColors],
      uppercaseCount,
      text,
    };
  }, { prefixes: FORBIDDEN_CLASS_PREFIXES, allowedHex: [...ALLOWED_HEX] });

  if (result.badClasses.length) fail(`[${label}] verbotene Klassen-Präfixe: ${result.badClasses.join(', ')}`);
  if (result.badFonts.length) fail(`[${label}] Font ≠ Host Grotesk: ${result.badFonts.join(', ')}`);
  if (result.badColors.length) fail(`[${label}] Farbwerte außerhalb der Tokens: ${result.badColors.join(', ')}`);
  if (result.uppercaseCount) fail(`[${label}] ${result.uppercaseCount} Element(e) mit text-transform:uppercase`);
  FORBIDDEN_STRINGS.forEach(s => {
    if (result.text.includes(s)) fail(`[${label}] verbotener String im sichtbaren Text: "${s}"`);
  });

  console.log(`  geprüft: ${label} (Screenshot: screenshots/${shotName})`);
}

function startServer() {
  return new Promise(resolve => {
    const server = http.createServer(async (req, res) => {
      let reqPath = decodeURIComponent(req.url.split('?')[0]);
      if (reqPath === '/') reqPath = '/index.html';
      const filePath = path.join(ROOT, reqPath);
      try {
        const data = await readFile(filePath);
        const ext = path.extname(filePath);
        const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2', '.png': 'image/png' };
        res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
        res.end(data);
      } catch {
        res.writeHead(404); res.end('not found');
      }
    });
    server.listen(PORT, () => resolve(server));
  });
}

async function main() {
  // Statische Vorab-Checks ----------------------------------------------
  const html = await readFile(path.join(ROOT, 'index.html'), 'utf8');
  const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
  if (!styleMatch) { fail('Kein <style>-Block gefunden'); }
  else {
    const css = styleMatch[1];
    const ruleCount = (css.match(/\{/g) || []).length;
    console.log(`CSS-Regeln: ${ruleCount} (Ziel: < 300)`);
    if (ruleCount >= 300) fail(`hybrid.css hat ${ruleCount} Regeln — Ziel ist unter 300`);
    if (!css.includes("'Host Grotesk'")) fail('Kein @font-face für Host Grotesk im <style>-Block');
  }

  const server = await startServer();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const consoleErrors = [];
  page.on('pageerror', e => consoleErrors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });

  await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  console.log('\nBesuche Tabs + Sheets …');
  await auditState(page, 'heute');

  await page.evaluate(() => openFastenSheet());
  await page.waitForTimeout(200);
  await auditState(page, 'heute-fasten-sheet');
  await page.evaluate(() => closeFastenSheet());

  await page.evaluate(() => openWasserSheet());
  await page.waitForTimeout(200);
  await auditState(page, 'heute-wasser-sheet');
  await page.evaluate(() => closeWasserSheet());

  await page.evaluate(() => openSupplementeSheet());
  await page.waitForTimeout(200);
  await auditState(page, 'heute-supplemente-sheet');
  await page.evaluate(() => closeSupplementeSheet());

  await page.evaluate(() => openGoalSheet());
  await page.waitForTimeout(200);
  await auditState(page, 'heute-ziel-sheet');
  await page.evaluate(() => closeGoalSheet());

  await page.click('#nav-move');
  await page.waitForTimeout(300);
  await auditState(page, 'uebungen');
  await page.evaluate(() => { const g = getActiveHeuteGoals().find(g => g.kind === 'routine'); if (g) openRoutinePlayer(g.id); });
  await page.waitForTimeout(300);
  await auditState(page, 'uebungen-player');
  await page.evaluate(() => closePlayer());

  await page.click('#nav-sammlung');
  await page.waitForTimeout(300);
  await auditState(page, 'sammlung');
  await page.evaluate(() => setSammlungSegment('history'));
  await page.waitForTimeout(200);
  await auditState(page, 'sammlung-verlauf');

  await page.click('#nav-supp');
  await page.waitForTimeout(300);
  await auditState(page, 'wissen');

  await page.click('#nav-settings');
  await page.waitForTimeout(300);
  await auditState(page, 'setup');
  await page.click('#set-routine-list .h-row');
  await page.waitForTimeout(200);
  await auditState(page, 'setup-routine-sheet');
  await page.click('#routine-editor-overlay .h-circle-btn');
  await page.waitForTimeout(200);
  await page.click('#set-exercise-list .h-row');
  await page.waitForTimeout(200);
  await auditState(page, 'setup-uebung-sheet');
  await page.click('#exercise-editor-overlay .h-circle-btn');
  await page.waitForTimeout(200);

  if (consoleErrors.length) fail(`Konsolenfehler während des Durchlaufs: ${JSON.stringify(consoleErrors)}`);

  await browser.close();
  server.close();

  console.log(`\n${checkedStates} Zustände geprüft.\n`);
  if (failures.length) {
    console.log(`FEHLGESCHLAGEN — ${failures.length} Befund(e):\n`);
    failures.forEach(f => console.log('  ✗ ' + f));
    process.exitCode = 1;
  } else {
    console.log('ALLE PRÜFUNGEN BESTANDEN.');
  }
}

main().catch(err => { console.error(err); process.exitCode = 1; });
