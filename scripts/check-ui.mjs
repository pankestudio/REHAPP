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
//   - die Strings "LV", "// V3", "Guten Tag" im sichtbaren Text ("XP" ist seit
//     Runde 5 Punkt 5 wieder erlaubt — der Heute-Kopf zeigt "XP heute · N
//     gesamt" absichtlich, siehe mobil-heute.png)
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
const FORBIDDEN_STRINGS = ['LV', '// V3', 'Guten Tag'];
const ALLOWED_HEX = new Set([
  '#f4f3ef', '#14140f', '#ffe14d', '#5e5c55', '#6e6b63', '#6b6860', '#d9d4c7',
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
    const smallTargets = new Set();
    let uppercaseCount = 0;

    // UX-Audit Block 3: Touch-Ziele mindestens 44×44px. Die sichtbare Größe
    // darf kleiner bleiben, wenn ein ::before die Tippfläche unsichtbar auf
    // mindestens 44×44 anhebt (siehe .h-pill::before etc.) — darum zählt
    // hier das Maximum aus dem eigenen Rect und dem ::before-Rect.
    function effectiveTapSize(el) {
      const rect = el.getBoundingClientRect();
      let w = rect.width, h = rect.height;
      const before = getComputedStyle(el, '::before');
      if (before && before.content && before.content !== 'none') {
        const bw = parseFloat(before.width);
        const bh = parseFloat(before.height);
        if (!Number.isNaN(bw)) w = Math.max(w, bw);
        if (!Number.isNaN(bh)) h = Math.max(h, bh);
      }
      return { w, h };
    }
    const interactiveSelector = 'button, a[href], input:not([type=range]):not([type=hidden]), select, textarea, [role="button"]';
    document.querySelectorAll(interactiveSelector).forEach(el => {
      const visible = el.offsetParent !== null;
      if (!visible) return;
      if (el.disabled) return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;
      const { w, h } = effectiveTapSize(el);
      if (w < 44 || h < 44) {
        smallTargets.add(`${w.toFixed(0)}×${h.toFixed(0)} @ ${el.id || el.className || el.tagName} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)}"`);
      }
    });

    function rgbToHexInPage(rgb) {
      const m = rgb.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
      if (!m) return null;
      const [, r, g, b, a] = m;
      if (a !== undefined && parseFloat(a) === 0) return null;
      return '#' + [r, g, b].map(v => parseInt(v, 10).toString(16).padStart(2, '0')).join('');
    }

    // UX-Audit Block 7: kein Text unter 12px, kein Schnitt über 600.
    const badSizes = new Set();
    const badWeights = new Set();
    function hasDirectText(el) {
      return Array.from(el.childNodes).some(n => n.nodeType === 3 && n.textContent.trim());
    }

    // UX-Audit Block 8: nur Token-Dauern (100/150/200/300ms) für Transitions/
    // Animationen — Ausnahme 600ms für Stift-Zeichnungen. getComputedStyle
    // serialisiert Zeitwerte immer in Sekunden ("0.1s" statt "100ms").
    const ALLOWED_DURATIONS_S = new Set(['0s', '0.1s', '0.15s', '0.2s', '0.3s', '0.6s']);
    const badDurations = new Set();

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
      if (hasDirectText(el)) {
        const size = parseFloat(cs.fontSize);
        const weight = parseInt(cs.fontWeight, 10);
        const label = el.id || el.className || el.tagName;
        const text = el.textContent.trim().slice(0, 24);
        if (size < 12) badSizes.add(`${size}px @ ${label} "${text}"`);
        if (weight > 600) badWeights.add(`${weight} @ ${label} "${text}"`);
      }
      ['color', 'backgroundColor', 'borderTopColor'].forEach(prop => {
        const hex = rgbToHexInPage(cs[prop]);
        if (hex && !allowedHex.has(hex)) badColors.add(hex + ' (' + prop + ') @ ' + (el.id || el.className || el.tagName));
      });
      ['transitionDuration', 'animationDuration'].forEach(prop => {
        (cs[prop] || '').split(',').map(d => d.trim()).forEach(d => {
          if (d && !ALLOWED_DURATIONS_S.has(d)) {
            badDurations.add(`${d} (${prop}) @ ${el.id || el.className || el.tagName}`);
          }
        });
      });
    });

    const text = document.body.innerText || '';
    return {
      badClasses: [...badClasses],
      badFonts: [...badFonts],
      badColors: [...badColors],
      smallTargets: [...smallTargets],
      badSizes: [...badSizes],
      badWeights: [...badWeights],
      badDurations: [...badDurations],
      uppercaseCount,
      text,
    };
  }, { prefixes: FORBIDDEN_CLASS_PREFIXES, allowedHex: [...ALLOWED_HEX] });

  if (result.badClasses.length) fail(`[${label}] verbotene Klassen-Präfixe: ${result.badClasses.join(', ')}`);
  if (result.badFonts.length) fail(`[${label}] Font ≠ Host Grotesk: ${result.badFonts.join(', ')}`);
  if (result.badColors.length) fail(`[${label}] Farbwerte außerhalb der Tokens: ${result.badColors.join(', ')}`);
  if (result.smallTargets.length) fail(`[${label}] Touch-Ziele unter 44×44px: ${result.smallTargets.join(', ')}`);
  if (result.badSizes.length) fail(`[${label}] Text unter 12px: ${result.badSizes.join(', ')}`);
  if (result.badWeights.length) fail(`[${label}] Schriftschnitt über 600: ${result.badWeights.join(', ')}`);
  if (result.badDurations.length) fail(`[${label}] Nicht-Token-Dauern: ${result.badDurations.join(', ')}`);
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

  // Runde 6a Punkt 2: der Startbildschirm ist eine bewusste, zeitlich
  // begrenzte (<1,4s) Design-Ausnahme mit eigener, nicht kippender Farbe —
  // für die Audits hier soll er erst gar nicht laufen, nicht Teil des zu
  // prüfenden "echten" App-Zustands.
  await page.addInitScript(() => { try { sessionStorage.setItem('rehapp_splash_shown', '1'); } catch (err) {} });
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
