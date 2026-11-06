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
// Runde 5d Punkt 3: läuft im Demo-Modus (?demo=…, feste Uhr, Demodaten aus
// tests/fixtures/demo.json) bei 390×844 und 1440×900, je hell und Nacht, und
// prüft zusätzlich: Gelb nur mit data-gelb, Stift-Linien sichtbar, kein
// horizontaler Überlauf, Kontrast (4,5:1 bzw. 3:1 für großen Text), img mit
// alt, dekorative SVGs mit aria-hidden, keine confirm()/alert()/prompt().
// Jede Meldung nennt Zustand, Viewport, Selektor und gemessenen Wert.
//
// Nutzung: node scripts/check-ui.mjs [--out datei.txt]   (bzw. npm run check-ui)
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
  // Tusche-Nacht (Runde 6a Punkt 5)
  '#a8a496', '#8e8a7e', '#36352d', '#22211b', '#4f4d44',
]);

const DEMO_TIME = '2026-11-03T11:18';
// marke = die zwei P der Wortmarke im Nachtmodus (Entscheidung Runde 6a, Logo R2).
const GELB_VALUES = ['aktion', 'glanz', 'ueberwindung', 'atem', 'weg', 'marke'];
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

async function auditStateBase(page, label) {
  checkedStates++;
  await mkdir(SCREENSHOT_DIR, { recursive: true });
  const shotName = label.replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '.png';
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, shotName) });

  const result = await page.evaluate(({ prefixes, allowedHex: allowedHexArr, GELB }) => {
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

    // ── Runde 5d Punkt 3 ────────────────────────────────────────────────
    const sel = el => {
      if (el.id) return '#' + el.id;
      const c = typeof el.className === 'string' ? el.className : (el.className && el.className.baseVal) || '';
      return el.tagName.toLowerCase() + (c ? '.' + c.trim().split(/\s+/).slice(0, 2).join('.') : '');
    };
    const isShown = el => {
      if (el.closest('[aria-hidden="true"]:not(svg):not(path)') && !el.closest('svg')) return false;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return false;
      if (r.bottom < 0 || r.top > innerHeight * 3) return false;
      let n = el;
      while (n && n.nodeType === 1) {
        const cs = getComputedStyle(n);
        if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return false;
        n = n.parentElement;
      }
      return true;
    };
    const yellowHex = (getComputedStyle(document.documentElement).getPropertyValue('--yellow') || '#FFE14D').trim().toLowerCase();
    const yr = parseInt(yellowHex.slice(1, 3), 16), yg = parseInt(yellowHex.slice(3, 5), 16), yb = parseInt(yellowHex.slice(5, 7), 16);
    const yellowRe = new RegExp(`rgba?\\(${yr},\\s*${yg},\\s*${yb}(,\\s*(1|0?\\.\\d+))?\\)`);
    const gelbOhne = new Set();
    const gelbFalsch = new Set();
    document.querySelectorAll('body *').forEach(el => {
      if (el.closest('#h-splash')) return;
      const cs = getComputedStyle(el);
      const props = [cs.backgroundColor, cs.borderTopColor, cs.boxShadow, cs.fill, cs.stroke, cs.outlineColor];
      if (cs.borderTopWidth === '0px') props[1] = '';
      if (cs.outlineStyle === 'none') props[5] = '';
      if (!props.some(v => v && yellowRe.test(v))) return;
      if (!isShown(el)) return;
      const tagged = el.closest('[data-gelb]');
      if (!tagged) gelbOhne.add(sel(el));
      else if (!GELB.includes(tagged.getAttribute('data-gelb'))) gelbFalsch.add(sel(el) + ' data-gelb="' + tagged.getAttribute('data-gelb') + '"');
    });

    const penBad = new Set();
    document.querySelectorAll('.h-pen-draw').forEach(path => {
      if (!isShown(path)) return;
      let len = 0;
      try { len = path.getTotalLength(); } catch (e) {}
      const off = parseFloat(getComputedStyle(path).strokeDashoffset) || 0;
      if (!(len > 0)) penBad.add(sel(path) + ' Länge ' + len);
      else if (Math.abs(off) > 0.5) penBad.add(sel(path) + ' dashoffset ' + off.toFixed(1));
    });

    const overflow = document.documentElement.scrollWidth > innerWidth
      ? `scrollWidth ${document.documentElement.scrollWidth} > ${innerWidth}` : null;

    // Kontrast: Textfarbe gegen den ersten deckenden Hintergrund darunter.
    const parse = v => { const m = v && v.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/); return m ? [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]] : null; };
    const lum = ([r, g, b]) => { const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
    const bgOf = el => {
      let n = el, layers = [];
      while (n && n.nodeType === 1) {
        const c = parse(getComputedStyle(n).backgroundColor);
        if (c && c[3] > 0) { layers.push(c); if (c[3] >= 1) break; }
        n = n.parentElement;
      }
      let base = [255, 255, 255];
      for (let i = layers.length - 1; i >= 0; i--) { const [r, g, b, a] = layers[i]; base = [r * a + base[0] * (1 - a), g * a + base[1] * (1 - a), b * a + base[2] * (1 - a)]; }
      return base;
    };
    const lowContrast = new Set();
    document.querySelectorAll('body *').forEach(el => {
      if (!hasDirectText(el) || el.closest('#h-splash, .h-demo-band, svg')) return;
      if (!isShown(el)) return;
      const cs = getComputedStyle(el);
      const fg = parse(cs.color);
      if (!fg) return;
      const bg = bgOf(el);
      const a = fg[3];
      const f = [fg[0] * a + bg[0] * (1 - a), fg[1] * a + bg[1] * (1 - a), fg[2] * a + bg[2] * (1 - a)];
      const L1 = lum(f), L2 = lum(bg);
      const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
      const size = parseFloat(cs.fontSize), weight = parseInt(cs.fontWeight, 10);
      const large = size >= 24 || (size >= 18.66 && weight >= 600);
      const need = large ? 3 : 4.5;
      if (ratio < need) lowContrast.add(`${sel(el)} "${el.textContent.trim().slice(0, 20)}" ${ratio.toFixed(2)}:1 (min ${need})`);
    });

    const imgNoAlt = [...document.querySelectorAll('img')].filter(i => !i.hasAttribute('alt')).map(sel);
    const svgNoHidden = new Set();
    document.querySelectorAll('svg').forEach(svg => {
      if (svg.closest('svg') !== svg) return;
      if (!isShown(svg)) return;
      if (svg.getAttribute('aria-hidden') === 'true') return;
      if (svg.getAttribute('role') === 'img' && (svg.getAttribute('aria-label') || svg.querySelector('title'))) return;
      if (svg.closest('[aria-hidden="true"]')) return;
      const host = svg.parentElement;
      svgNoHidden.add(sel(host) + ' > svg');
    });

    const text = document.body.innerText || '';
    return {
      gelbOhne: [...gelbOhne], gelbFalsch: [...gelbFalsch], penBad: [...penBad], overflow,
      lowContrast: [...lowContrast], imgNoAlt, svgNoHidden: [...svgNoHidden],
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
  }, { prefixes: FORBIDDEN_CLASS_PREFIXES, allowedHex: [...ALLOWED_HEX], GELB: GELB_VALUES });

  if (result.badClasses.length) fail(`[${label}] verbotene Klassen-Präfixe: ${result.badClasses.join(', ')}`);
  if (result.badFonts.length) fail(`[${label}] Font ≠ Host Grotesk: ${result.badFonts.join(', ')}`);
  if (result.badColors.length) fail(`[${label}] Farbwerte außerhalb der Tokens: ${result.badColors.join(', ')}`);
  if (result.smallTargets.length) fail(`[${label}] Touch-Ziele unter 44×44px: ${result.smallTargets.join(', ')}`);
  if (result.badSizes.length) fail(`[${label}] Text unter 12px: ${result.badSizes.join(', ')}`);
  if (result.badWeights.length) fail(`[${label}] Schriftschnitt über 600: ${result.badWeights.join(', ')}`);
  if (result.badDurations.length) fail(`[${label}] Nicht-Token-Dauern: ${result.badDurations.join(', ')}`);
  if (result.gelbOhne.length) fail(`[${label}] Gelb ohne data-gelb: ${result.gelbOhne.join(', ')}`);
  if (result.gelbFalsch.length) fail(`[${label}] data-gelb mit unbekanntem Wert: ${result.gelbFalsch.join(', ')}`);
  if (result.penBad.length) fail(`[${label}] Stift-Linie nicht vollständig sichtbar: ${result.penBad.join(', ')}`);
  if (result.overflow) fail(`[${label}] horizontaler Überlauf: ${result.overflow}`);
  if (result.lowContrast.length) fail(`[${label}] Kontrast zu gering: ${result.lowContrast.join(', ')}`);
  if (result.imgNoAlt.length) fail(`[${label}] img ohne alt: ${result.imgNoAlt.join(', ')}`);
  if (result.svgNoHidden.length) fail(`[${label}] SVG ohne aria-hidden oder Label: ${result.svgNoHidden.join(', ')}`);
  if (result.uppercaseCount) fail(`[${label}] ${result.uppercaseCount} Element(e) mit text-transform:uppercase`);
  FORBIDDEN_STRINGS.forEach(s => {
    if (result.text.includes(s)) fail(`[${label}] verbotener String im sichtbaren Text: "${s}"`);
  });
  // Runde 5d: keine Versalien-Wörter im Text (V3-Reste wie "// FASTENZEIT").
  // text-transform fängt das nicht, wenn der String selbst groß geschrieben ist.
  const caps = [...new Set((result.text.match(/(?<![\p{L}])[A-ZÄÖÜ]{5,}(?![\p{L}])/gu) || []))]
    .filter(w => !['REHAPP', 'REHAB'].includes(w));
  if (caps.length) fail(`[${label}] Wörter in Versalien: ${caps.join(', ')}`);
  if (/(^|\s)\/\/\s/.test(result.text)) fail(`[${label}] "// "-Präfix im sichtbaren Text (Rest aus V3)`);

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

  // Runde 6a Punkt 5: keine fest codierten Tusche-/Papier-/Weißwerte in
  // Komponenten. Erlaubt sind nur Token-Definitionen (--name: #…) und die
  // vorbelegte theme-color im <head>, die applyTheme() überschreibt.
  const hardcoded = html.split('\n')
    .map((line, i) => ({ line, n: i + 1 }))
    .filter(({ line }) => /#14140f|#f4f3ef|#fff\b|#ffffff/i.test(line))
    .filter(({ line }) => !/--[a-z-]+:\s*#/i.test(line) && !line.includes('<meta name="theme-color"'));
  if (hardcoded.length) fail(`Fest codierte Farben in Komponenten: ${hardcoded.map(h => 'Zeile ' + h.n).join(', ')}`);

  // Runde 5d Punkt 3: keine Systemdialoge im Code (Kommentare ausgenommen).
  const dialogs = html.split('\n').map((line, i) => ({ line, n: i + 1 }))
    .filter(({ line }) => !/^\s*(\/\/|\*|<!--)/.test(line))
    .filter(({ line }) => /(^|[^.\w])(window\.)?(confirm|alert|prompt)\s*\(/.test(line.replace(/\/\/.*$/, '')));
  if (dialogs.length) fail(`Systemdialoge im Code: ${dialogs.map(d => 'Zeile ' + d.n).join(', ')}`);

  const server = await startServer();
  const browser = await chromium.launch();
  const consoleErrors = [];
  for (const vp of [{ w: 390, h: 844 }, { w: 1440, h: 900 }]) {
    await sweep(browser, '', consoleErrors, vp);
    await sweep(browser, '-nacht', consoleErrors, vp);
  }

  if (consoleErrors.length) fail(`Konsolenfehler während des Durchlaufs: ${JSON.stringify(consoleErrors)}`);

  await browser.close();
  server.close();

  console.log(`\n${checkedStates} Zustände geprüft.\n`);
  const outIdx = process.argv.indexOf('--out');
  if (outIdx > -1 && process.argv[outIdx + 1]) {
    const { writeFile } = await import('node:fs/promises');
    await writeFile(process.argv[outIdx + 1], `check-ui.mjs, ${new Date().toISOString()}\n${checkedStates} Zustände, ${failures.length} Befund(e)\n\n` + failures.map(f => '✗ ' + f).join('\n') + '\n');
  }
  if (failures.length) {
    console.log(`FEHLGESCHLAGEN — ${failures.length} Befund(e):\n`);
    failures.forEach(f => console.log('  ✗ ' + f));
    process.exitCode = 1;
  } else {
    console.log('ALLE PRÜFUNGEN BESTANDEN.');
  }
}

// Ein Durchlauf über alle Tabs + Sheets. suffix '-nacht' wiederholt alles
// mit theme_mode=night (Tusche-Nacht, Runde 6a Punkt 5) — gleiche Regeln,
// Screenshots landen als <zustand>-nacht.png daneben.
async function sweep(browser, suffix, consoleErrors, vp) {
  const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
  page.on('pageerror', e => consoleErrors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });

  // Runde 6a Punkt 2: der Startbildschirm ist eine bewusste, zeitlich
  // begrenzte (<1,4s) Design-Ausnahme mit eigener, nicht kippender Farbe —
  // für die Audits hier soll er erst gar nicht laufen, nicht Teil des zu
  // prüfenden "echten" App-Zustands.
  await page.addInitScript(night => {
    try {
      sessionStorage.setItem('rehapp_splash_shown', '1');
      localStorage.setItem('theme_mode', night ? 'night' : 'light');
    } catch (err) {}
  }, suffix === '-nacht');
  const theme = suffix === '-nacht' ? 'night' : 'light';
  await page.goto(`http://localhost:${PORT}/index.html?demo=${DEMO_TIME}&theme=${theme}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  const auditState = async (p, label) => { await p.waitForTimeout(700); return auditStateBase(p, label + suffix + '@' + vp.w); };

  console.log(`\nBesuche Tabs + Sheets bei ${vp.w}px${suffix ? ' (Nacht)' : ''} …`);
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

  await page.evaluate(() => document.getElementById('nav-move').click());
  await page.waitForTimeout(300);
  await auditState(page, 'uebungen');
  await page.evaluate(() => { const g = getActiveHeuteGoals().find(g => g.kind === 'routine'); if (g) openRoutinePlayer(g.id); });
  await page.waitForTimeout(300);
  await auditState(page, 'uebungen-player');
  await page.evaluate(() => closePlayer());

  await page.evaluate(() => document.getElementById('nav-sammlung').click());
  await page.waitForTimeout(300);
  await auditState(page, 'sammlung');
  await page.evaluate(() => setSammlungSegment('history'));
  await page.waitForTimeout(200);
  await auditState(page, 'sammlung-verlauf');

  await page.evaluate(() => document.getElementById('nav-supp').click());
  await page.waitForTimeout(300);
  await auditState(page, 'wissen');

  await page.evaluate(() => document.getElementById('nav-settings').click());
  await page.waitForTimeout(300);
  await auditState(page, 'setup');
  await page.evaluate(() => document.querySelector('#set-routine-list .h-row').click());
  await page.waitForTimeout(200);
  await auditState(page, 'setup-routine-sheet');
  await page.evaluate(() => document.querySelector('#routine-editor-overlay .h-circle-btn').click());
  await page.waitForTimeout(200);
  await page.evaluate(() => document.querySelector('#set-exercise-list .h-row').click());
  await page.waitForTimeout(200);
  await auditState(page, 'setup-uebung-sheet');
  await page.evaluate(() => document.querySelector('#exercise-editor-overlay .h-circle-btn').click());
  await page.waitForTimeout(200);
  await page.close();
}

main().catch(err => { console.error(err); process.exitCode = 1; });
