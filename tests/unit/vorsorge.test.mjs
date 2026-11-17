// Unit-Tests für die reine Vorsorge-Logik (Runde 7).
// Lädt den Block <script id="vorsorge-logik"> aus index.html in eine Node-VM,
// ohne Browser. Start: npm test (läuft auch in npm run check).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const html = readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const block = html.match(/<script id="vorsorge-logik">([\s\S]*?)<\/script>/);
assert.ok(block, 'Skript-Block vorsorge-logik fehlt');
const L = vm.runInNewContext(block[1] + `
;({ CHECKS, dueStatus, checkList, countDueChecks, nextPsaDate, scorePhq2, scorePhq9, stopBangRisk,
   stopBangPrefill, scoreUcla, epworthResult, isiResult, bpMean, crisisCheckOverdue, CRISIS_CONTACTS,
   vsAddMonths, PHQ9_ITEMS, PHQ_OPTIONS })`);

// Ergebnisse aus der VM stammen aus einem anderen Realm: vor dem Vergleich klonen.
const eq = (actual, expected, msg) => assert.deepEqual(JSON.parse(JSON.stringify(actual)), expected, msg);
const TODAY = '2026-11-03'; // Demo-Tag
const P = { birthYear: 1981, sex: 'm', smokerProfile: false, familyCRC: false, tbeArea: false, flags: {} };
const check = id => L.CHECKS.find(c => c.id === id);
const st = (id, logs = [], profile = P, today = TODAY) => L.dueStatus(check(id), logs, profile, today);
const log = (checkId, date, extra = {}) => ({ kind: 'log', checkId, date, ...extra });

test('CHECKS enthält genau die IDs aus Modul 6', () => {
  eq(L.CHECKS.map(c => c.id).sort(), ['bp_week', 'checkup35', 'colo', 'covid', 'crc_family', 'crc_start', 'dental', 'eyes', 'flu', 'fsme', 'hearing', 'ifobt', 'lpa_once', 'lung_ldct', 'pcv20', 'psa_decision', 'psa_followup', 'skin', 'td', 'zoster'].sort());
});

test('nextPsaDate: 1,2 → 5 Jahre, 2,1 → 2 Jahre, 3,4 → 3 Monate mit Hinweis', () => {
  eq(L.nextPsaDate(1.2, TODAY), { months: 60, date: '2031-11-03', hint: null });
  eq(L.nextPsaDate(2.1, TODAY), { months: 24, date: '2028-11-03', hint: null });
  const high = L.nextPsaDate(3.4, TODAY);
  assert.equal(high.months, 3);
  assert.equal(high.date, '2027-02-03');
  assert.equal(high.hint, 'Kontrolle in 3 Monaten, bei Bestätigung Urologie und MRT vor einer Biopsie');
});
test('nextPsaDate: Grenzen 1,5 / 2,99 / 3', () => {
  assert.equal(L.nextPsaDate(1.49, TODAY).months, 60);
  assert.equal(L.nextPsaDate(1.5, TODAY).months, 24);
  assert.equal(L.nextPsaDate(2.99, TODAY).months, 24);
  assert.equal(L.nextPsaDate(3, TODAY).months, 3);
  assert.equal(L.nextPsaDate(1.2, '2028-02-29').date, '2033-02-28'); // Monatsende
});

test('scorePhq9: Frage 9 = 1 löst die Krisenseite aus, unabhängig von der Summe', () => {
  const r = L.scorePhq9([0, 0, 0, 0, 0, 0, 0, 0, 1]);
  assert.equal(r.score, 1);
  assert.equal(r.crisis, true);
  assert.equal(L.scorePhq9([3, 3, 3, 3, 3, 3, 3, 3, 0]).crisis, false);
  assert.equal(L.scorePhq9([0, 0, 0, 0, 0, 0, 0, 0, 3]).crisis, true);
});
test('scorePhq9: Bänder 5–9, 10–14, 15–19, ab 20', () => {
  const at = n => L.scorePhq9([Math.min(n, 3), Math.min(Math.max(n - 3, 0), 3), Math.min(Math.max(n - 6, 0), 3), Math.min(Math.max(n - 9, 0), 3), Math.min(Math.max(n - 12, 0), 3), Math.min(Math.max(n - 15, 0), 3), Math.min(Math.max(n - 18, 0), 3), Math.min(Math.max(n - 21, 0), 3), 0]);
  assert.equal(at(4).action, null);
  assert.equal(at(5).action, 'In 4 Wochen noch einmal ausfüllen.');
  assert.equal(at(9).action, 'In 4 Wochen noch einmal ausfüllen.');
  assert.equal(at(10).action, 'Ärztlich oder psychotherapeutisch abklären lassen.');
  assert.equal(at(15).action, 'Zeitnah abklären lassen.');
  assert.equal(at(20).action, 'Zeitnah abklären lassen.');
  assert.equal(at(20).score, 20);
});
test('PHQ-9-Wortlaut: neun Fragen, vier Antworten, Frage i unverändert', () => {
  assert.equal(L.PHQ9_ITEMS.length, 9);
  assert.equal(L.PHQ9_ITEMS[8], 'Gedanken, dass Sie lieber tot wären oder sich Leid zufügen möchten');
  eq([...L.PHQ_OPTIONS], ['Überhaupt nicht', 'An einzelnen Tagen', 'An mehr als der Hälfte der Tage', 'Beinahe jeden Tag']);
});

test('scorePhq2: ab 2 PHQ-9, ab 3 Hausarzt, 2 Ja bei den Zusatzfragen auch unter 2', () => {
  assert.equal(L.scorePhq2([1, 0], [0, 0, 0, 0]).offerPhq9, false);
  assert.equal(L.scorePhq2([1, 1], []).offerPhq9, true);
  assert.equal(L.scorePhq2([1, 1], []).gp, false);
  assert.equal(L.scorePhq2([2, 1], []).gp, true);
  assert.equal(L.scorePhq2([0, 0], [1, 1, 0, 0]).offerPhq9, true);
  assert.equal(L.scorePhq2([0, 1], [1, 0, 0, 0]).offerPhq9, false);
});

test('stopBangRisk: ab 3 Punkten oder ≥ 2 STOP-Fragen plus männlich', () => {
  assert.equal(L.stopBangRisk([1, 1, 0, 0, 0, 0, 0, 0], { sex: 'm' }).risk, true);
  assert.equal(L.stopBangRisk([1, 1, 0, 0, 0, 0, 0, 0], { sex: 'w' }).risk, false);
  assert.equal(L.stopBangRisk([1, 0, 0, 0, 1, 1, 0, 0], { sex: 'w' }).risk, true);
  assert.equal(L.stopBangRisk([1, 0, 0, 0, 0, 0, 0, 1], { sex: 'm' }).risk, false);
  assert.equal(L.stopBangRisk([1, 0, 0, 0, 0, 0, 0, 1], { sex: 'm' }).score, 2);
});
test('stopBangPrefill: Alter und Geschlecht aus dem Profil', () => {
  eq([...L.stopBangPrefill(P, TODAY)], [null, null, null, null, null, 0, null, 1]);
  eq([...L.stopBangPrefill({ birthYear: 1970, sex: 'w' }, TODAY)], [null, null, null, null, null, 1, null, 0]);
});

test('UCLA-3 ab 6, Epworth ab 11/16, ISI ab 15', () => {
  assert.equal(L.scoreUcla([2, 2, 1]).often, false);
  assert.equal(L.scoreUcla([2, 2, 2]).often, true);
  assert.equal(L.epworthResult(10).actions.length, 0);
  eq([...L.epworthResult(11).actions], ['Ärztlich abklären lassen.']);
  assert.equal(L.epworthResult(16).actions[1], 'Bis zur Klärung bei Müdigkeit nicht Auto fahren.');
  assert.ok(L.isiResult(15).actions.some(a => a.includes('HelloBetter Schlafen') && a.includes('somnio')));
  assert.ok(!L.isiResult(14).actions.some(a => a.includes('DiGA')));
});

test('dueStatus: Profil 1981/m ohne Einträge', () => {
  const list = L.checkList(P, [], TODAY).map(r => `${r.check.id}:${r.status}${r.startAge || ''}`);
  eq(list, [
    'checkup35:faellig', 'lpa_once:faellig', 'skin:faellig', 'psa_decision:faellig', 'td:faellig', 'dental:faellig', 'eyes:faellig', 'bp_week:faellig',
    'crc_start:spaeter50', 'hearing:spaeter50', 'flu:spaeter60', 'zoster:spaeter60', 'pcv20:spaeter60', 'covid:spaeter75',
  ]);
});
test('dueStatus: lung_ldct nur mit Raucherprofil, dann ab 50', () => {
  assert.equal(st('lung_ldct').status, 'hidden');
  assert.equal(st('lung_ldct', [], { ...P, smokerProfile: true }).status, 'spaeter');
  assert.equal(st('lung_ldct', [], { ...P, smokerProfile: true }).startAge, 50);
  assert.equal(st('lung_ldct', [], { ...P, birthYear: 1970, smokerProfile: true }).status, 'faellig');
  assert.equal(st('lung_ldct', [], { ...P, birthYear: 1950, smokerProfile: true }).status, 'hidden'); // über 75
});
test('dueStatus: fällig, bald (≤ 60 Tage), aktuell, erledigt', () => {
  assert.equal(st('dental', [log('dental', '2026-05-20')]).status, 'bald');     // fällig 2026-11-20
  assert.equal(st('dental', [log('dental', '2026-05-03')]).status, 'faellig');  // genau heute
  assert.equal(st('dental', [log('dental', '2026-07-10')]).status, 'aktuell'); // fällig 2027-01-10, 68 Tage
  assert.equal(st('skin', [log('skin', '2024-12-01')]).status, 'bald');        // fällig 2026-12-01, 28 Tage
  assert.equal(st('skin', [log('skin', '2025-01-02')]).status, 'bald');        // genau 60 Tage
  assert.equal(st('skin', [log('skin', '2025-01-03')]).status, 'aktuell');     // 61 Tage
  assert.equal(st('lpa_once', [log('lpa_once', '2020-01-01')]).status, 'erledigt');
  assert.equal(st('checkup35', [log('checkup35', '2024-02-12')]).due, '2027-02-12');
});
test('dueStatus: PSA nur für m, Verzicht blendet 2 Jahre aus, Wert bestimmt den nächsten Termin', () => {
  assert.equal(st('psa_decision', [], { ...P, sex: 'w' }).status, 'hidden');
  assert.equal(st('psa_decision', [], { ...P, sex: 'd' }).status, 'hidden');
  const verzicht = [log('psa_decision', '2026-01-10', { note: 'verzicht' })];
  assert.equal(st('psa_decision', verzicht).status, 'hidden');
  assert.equal(st('psa_decision', verzicht, P, '2028-01-10').status, 'faellig');
  assert.equal(st('psa_followup', verzicht).status, 'hidden');
  const wert = [log('psa_decision', '2026-11-01', { note: 'ja' }), log('psa_followup', '2026-11-01', { value: 3.4 })];
  assert.equal(st('psa_decision', wert).status, 'hidden');
  const f = st('psa_followup', wert);
  assert.equal(f.due, '2027-02-01');
  assert.match(f.hint, /Urologie und MRT/);
  assert.equal(st('psa_followup', [log('psa_followup', '2026-11-01', { value: 1.2 })]).due, '2031-11-01');
  assert.equal(st('psa_followup', [log('psa_followup', '2026-11-01', { value: 2.1 })]).due, '2028-11-01');
});
test('dueStatus: Darmkrebs-Weg und Familienanamnese', () => {
  const p55 = { ...P, birthYear: 1971 };
  assert.equal(st('crc_start', [], p55).status, 'faellig');
  assert.equal(st('ifobt', [], p55).status, 'hidden');
  const ifobt = [log('ifobt', '2025-06-01')];
  assert.equal(st('crc_start', ifobt, p55).status, 'hidden');
  assert.equal(st('ifobt', ifobt, p55).due, '2027-06-01');
  assert.equal(st('colo', [...ifobt, log('colo', '2026-01-01')], p55).due, '2036-01-01');
  assert.equal(st('ifobt', [...ifobt, log('colo', '2026-01-01')], p55).status, 'hidden');
  assert.equal(st('crc_family').status, 'hidden');
  assert.equal(st('crc_family', [], { ...P, familyCRC: true, familyCRCAge: 52 }).status, 'faellig'); // Start 42
  assert.equal(st('crc_family', [], { ...P, birthYear: 1990, familyCRC: true, familyCRCAge: 52 }).startAge, 42);
  assert.equal(st('crc_family', [], { ...P, birthYear: 1990, familyCRC: true, familyCRCAge: 70 }).startAge, 45); // spätestens 45
  assert.equal(st('crc_family', [], { ...P, birthYear: 1990, familyCRC: true }).startAge, 45);
});
test('dueStatus: Blutdruck ab 135/85 nach 1 Monat, sonst 12; Augen ab 60 alle 30 Monate', () => {
  assert.equal(st('bp_week', [log('bp_week', '2026-10-01', { value: 137, value2: 80 })]).due, '2026-11-01');
  assert.equal(st('bp_week', [log('bp_week', '2026-10-01', { value: 128, value2: 85 })]).due, '2026-11-01');
  assert.equal(st('bp_week', [log('bp_week', '2026-10-01', { value: 134, value2: 84 })]).due, '2027-10-01');
  assert.equal(st('eyes', [log('eyes', '2024-01-01')]).due, '2029-01-01');
  assert.equal(st('eyes', [log('eyes', '2024-01-01')], { ...P, birthYear: 1960 }).due, '2026-07-01');
});
test('dueStatus: ohne Geburtsjahr nichts, FSME nur mit Risikogebiet', () => {
  assert.equal(st('td', [], {}).status, 'hidden');
  assert.equal(st('fsme').status, 'hidden');
  assert.equal(st('fsme', [], { ...P, tbeArea: true }).status, 'faellig');
});

test('Demo-Fixture: zwei fällig, Messwoche ergibt den Mittelwert der Demo-Werte', () => {
  const fx = JSON.parse(readFileSync(path.join(ROOT, 'tests/fixtures/demo.json'), 'utf8'));
  const profile = fx.checks.find(r => r.kind === 'profile');
  const logs = fx.checks.filter(r => r.kind === 'log');
  const list = L.checkList(profile, logs, TODAY);
  eq(list.filter(r => r.status === 'faellig').map(r => r.check.id), ['psa_decision', 'bp_week']);
  assert.ok(list.some(r => r.status === 'aktuell'));
  assert.equal(L.countDueChecks(profile, logs, TODAY), 2);
  const values = Object.values(fx.checks.find(r => r.kind === 'bpweek').readings);
  const sys = Math.round(values.reduce((s, v) => s + v[0], 0) / values.length);
  const dia = Math.round(values.reduce((s, v) => s + v[1], 0) / values.length);
  const m = L.bpMean(values);
  eq({ sys: m.sys, dia: m.dia, n: m.n }, { sys, dia, n: 26 });
  eq({ sys: m.sys, dia: m.dia, high: m.high }, { sys: 137, dia: 86, high: true });
  assert.equal(L.bpMean([[134, 84], [134, 84]]).high, false);
  assert.equal(L.bpMean([[135, 70]]).high, true);
});

test('Krisennummern: Prüfdatum älter als 12 Monate wird gemeldet', () => {
  const c = L.CRISIS_CONTACTS.checkedAt;
  assert.equal(L.crisisCheckOverdue(c), false);
  assert.equal(L.crisisCheckOverdue(L.vsAddMonths(c, 12)), false);
  assert.equal(L.crisisCheckOverdue(L.vsAddMonths(c, 13)), true);
  const tels = L.CRISIS_CONTACTS.groups.flatMap(g => g.numbers.map(n => n.tel));
  eq(tels, ['08001110111', '08001110222', '116123', '116117', '112']);
});

test('Kein XP, keine Abzeichen, kein Gelb im Vorsorge-Code', () => {
  const start = html.indexOf('// ══════════════ VORSORGE — Ansicht');
  const end = html.indexOf('// ── Erinnerungen: Push-Master-Switch');
  assert.ok(start > 0 && end > start, 'Vorsorge-UI-Bereich nicht gefunden');
  const code = (block[1] + html.slice(start, end)).split('\n').filter(l => !/^\s*\/\//.test(l)).join('\n');
  for (const bad of ['awardXP', 'checkNewUnlocks', 'data-gelb', 'h-pill--shadow', '--yellow', 'confirm(', 'alert(']) {
    assert.ok(!code.replace(/openConfirmDialog\(/g, '').includes(bad), `${bad} im Vorsorge-Code`);
  }
  const overlays = html.slice(html.indexOf('<!-- VORSORGE (Runde 7)'), html.indexOf('<!-- ══ BOTTOM NAV'));
  assert.ok(!/data-gelb|h-pill--shadow/.test(overlays), 'Gelb im Vorsorge-Markup');
});
