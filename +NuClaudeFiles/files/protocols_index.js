// src/modules/protocols/index.js
import { ProtocolListTemplate } from '../../ui/Templates.js';

export const protocolsData = {

  // ── Universalprotokolle (Startseite) ────────────────────────────────────────

  breath: {
    id: 'breath', title: 'Atemübung 4-7-8', xp: 8,
    description: 'Beruhigt das Nervensystem in unter 3 Minuten',
    steps: [
      { title: 'Einatmen durch die Nase',      duration: 4 },
      { title: 'Atem anhalten',                duration: 7 },
      { title: 'Ausatmen durch den Mund',       duration: 8 },
      { title: 'Einatmen durch die Nase',      duration: 4 },
      { title: 'Atem anhalten',                duration: 7 },
      { title: 'Ausatmen durch den Mund',       duration: 8 },
      { title: 'Letzte Runde — Einatmen',       duration: 4 },
      { title: 'Atem anhalten',                duration: 7 },
      { title: 'Ausatmen — loslassen',          duration: 8 },
    ],
  },

  box_breathing: {
    id: 'box_breathing', title: 'Box Breathing', xp: 10,
    description: 'Navy SEAL Technik — akuter Stress, maximale Wirkung',
    steps: [
      { title: 'Einatmen',                     duration: 4 },
      { title: 'Oben halten',                  duration: 4 },
      { title: 'Ausatmen',                     duration: 4 },
      { title: 'Unten halten',                 duration: 4 },
      { title: 'Einatmen',                     duration: 4 },
      { title: 'Oben halten',                  duration: 4 },
      { title: 'Ausatmen',                     duration: 4 },
      { title: 'Unten halten',                 duration: 4 },
      { title: 'Einatmen',                     duration: 4 },
      { title: 'Oben halten',                  duration: 4 },
      { title: 'Ausatmen',                     duration: 4 },
      { title: 'Unten halten',                 duration: 4 },
      { title: 'Einatmen',                     duration: 4 },
      { title: 'Oben halten',                  duration: 4 },
      { title: 'Ausatmen',                     duration: 4 },
      { title: 'Unten halten — letzte Runde',  duration: 4 },
      { title: 'Einatmen',                     duration: 4 },
      { title: 'Oben halten',                  duration: 4 },
      { title: 'Ausatmen — fertig',            duration: 4 },
    ],
  },

  physiological_sigh: {
    id: 'physiological_sigh', title: 'Physiologischer Seufzer', xp: 5,
    description: 'Schnellste Entspannungsmethode — 60 Sekunden',
    steps: [
      { title: 'Einatmen (Nase)',              duration: 3 },
      { title: 'Nochmals einatmen (kurz)',     duration: 2 },
      { title: 'Lang ausatmen (Mund)',         duration: 8 },
      { title: 'Einatmen (Nase)',              duration: 3 },
      { title: 'Nochmals einatmen (kurz)',     duration: 2 },
      { title: 'Lang ausatmen (Mund)',         duration: 8 },
      { title: 'Einatmen (Nase)',              duration: 3 },
      { title: 'Nochmals einatmen (kurz)',     duration: 2 },
      { title: 'Langer Ausatem — fertig',      duration: 8 },
    ],
  },

  stretch: {
    id: 'stretch', title: 'Ganzkörper Dehnung', xp: 10,
    description: '5 Minuten · Faszien, Gelenke, Durchblutung',
    steps: [
      { title: 'Nacken links',                 duration: 30 },
      { title: 'Nacken rechts',                duration: 30 },
      { title: 'Schulter Quergriff links',      duration: 30 },
      { title: 'Schulter Quergriff rechts',     duration: 30 },
      { title: 'Brust öffnen — Hände hinten',  duration: 30 },
      { title: 'Hüftbeuger links',             duration: 45 },
      { title: 'Hüftbeuger rechts',            duration: 45 },
      { title: 'Ischiasmuskel links',          duration: 30 },
      { title: 'Ischiasmuskel rechts',         duration: 30 },
      { title: 'Wadendehnung',                 duration: 30 },
    ],
  },

  // ── Morgenroutine ───────────────────────────────────────────────────────────

  morning_routine: {
    id: 'morning_routine', title: 'Morgenroutine', xp: 20,
    description: '8 Minuten · Körper aufwecken, Geist ausrichten',
    steps: [
      { title: 'Katze / Kuh — Wirbelsäule wellen',         duration: 45 },
      { title: 'Kind-Pose — Rücken strecken',              duration: 30 },
      { title: 'Hüftkreise stehend — 10x jede Seite',     duration: 40 },
      { title: 'Schulterrotation rückwärts — 10x',        duration: 20 },
      { title: 'Brücke — Gesäß heben, 10x',               duration: 40 },
      { title: 'Taubenpose links',                         duration: 45 },
      { title: 'Taubenpose rechts',                        duration: 45 },
      { title: 'Körperdrehung liegend — links',            duration: 30 },
      { title: 'Körperdrehung liegend — rechts',           duration: 30 },
      { title: 'Stehend strecken — Arme hoch, gähnen',    duration: 20 },
      { title: 'Physiologischer Seufzer — loslassen',     duration: 15 },
    ],
  },

  // ── Vagus-Protokoll ─────────────────────────────────────────────────────────

  vagus: {
    id: 'vagus', title: 'Vagus-Stimulation', xp: 15,
    description: 'Parasympathikus aktivieren — Stressabbau, Verdauung, Schlaf',
    steps: [
      { title: 'Tiefes Bauchatmen — langsam einatmen',    duration: 30 },
      { title: 'Gurgeln mit Wasser',                      duration: 30 },
      { title: 'Humming — summen auf Ausatem',            duration: 60 },
      { title: 'Kaltes Wasser — Gesicht eintauchen',      duration: 20 },
      { title: 'Langer Ausatem — Lippen gespitzt',        duration: 30 },
      { title: 'Gurgeln — zweite Runde',                  duration: 30 },
      { title: 'Humming — zweite Runde',                  duration: 60 },
      { title: 'Stille — nachspüren',                     duration: 30 },
    ],
  },

  // ── Kraft / Aktivierung ─────────────────────────────────────────────────────

  micro_workout: {
    id: 'micro_workout', title: 'Mikro-Workout', xp: 20,
    description: '10 Minuten · Gerätefrei · Zwei Runden',
    steps: [
      { title: 'Kniebeuge — Runde 1',                     duration: 30 },
      { title: 'Liegestütz — Runde 1',                    duration: 30 },
      { title: 'Ausfallschritt wechselnd — Runde 1',      duration: 30 },
      { title: 'Plank halten — Runde 1',                  duration: 30 },
      { title: 'Jumping Jacks — Runde 1',                 duration: 30 },
      { title: 'Pause',                                   duration: 60 },
      { title: 'Kniebeuge — Runde 2',                     duration: 30 },
      { title: 'Liegestütz — Runde 2',                    duration: 30 },
      { title: 'Ausfallschritt wechselnd — Runde 2',      duration: 30 },
      { title: 'Plank halten — Runde 2',                  duration: 30 },
      { title: 'Jumping Jacks — Runde 2',                 duration: 30 },
    ],
  },

  back_activation: {
    id: 'back_activation', title: 'Rückenaktivierung', xp: 15,
    description: 'Für Büroarbeiter · Tiefe Rückenmuskulatur',
    steps: [
      { title: 'Superman — 10 Wdh. halten je 2s',         duration: 40 },
      { title: 'Bird-Dog links — 10 Wdh.',                duration: 40 },
      { title: 'Bird-Dog rechts — 10 Wdh.',               duration: 40 },
      { title: 'Dead Bug — 10 Wdh. je Seite',             duration: 50 },
      { title: 'Brücke — 10 Wdh. langsam',                duration: 40 },
      { title: 'Katze/Kuh — 10x fließend',                duration: 40 },
    ],
  },

  // ── Faszien ─────────────────────────────────────────────────────────────────



  // ── Lymphdrainage ───────────────────────────────────────────────────────────

  mld: {
    id: 'mld', title: 'Lymphdrainage', xp: 15,
    description: 'Entstauung · Post-OP · Ödem-Prävention',
    steps: [
      { title: 'Tiefatmung — Zwerchfell aktivieren',      duration: 30 },
      { title: 'Halsdrüsen sanft ausstreichen',           duration: 30 },
      { title: 'Achseln kreisend stimulieren',            duration: 30 },
      { title: 'Leiste aktivieren — sanfter Druck',       duration: 60 },
      { title: 'Oberschenkel innen ausstreichen',         duration: 60 },
      { title: 'Kniebeuge hinter der Kniekehle',          duration: 30 },
      { title: 'Unterschenkel aufwärts ausstreichen',     duration: 60 },
      { title: 'Abschluss — Tiefatmung',                  duration: 30 },
    ],
  },

  // ── Post-OP Atem ────────────────────────────────────────────────────────────


};

// ── Kategorien für den Reha-Tab ─────────────────────────────────────────────

const CATEGORIES = [
  {
    label: 'Atmung',
    ids:   ['box_breathing', 'physiological_sigh'],
  },
  {
    label: 'Beweglichkeit',
    ids:   ['morning_routine', 'stretch'],
  },
  {
    label: 'Nervensystem',
    ids:   ['vagus'],
  },
  {
    label: 'Kraft',
    ids:   ['micro_workout', 'back_activation'],
  },
  {
    label: 'Reha',
    ids:   ['mld'],
  },
];

function ProtocolCard(p) {
  const mins = Math.round(p.steps.reduce((a, s) => a + s.duration, 0) / 60);
  return `
    <div class="card" style="padding:14px 16px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">
        <div style="flex:1;padding-right:12px;">
          <div style="font-weight:800;font-size:0.85rem;letter-spacing:-0.01em;">${p.title}</div>
          <div style="font-size:0.65rem;color:var(--text-dim);margin-top:3px;line-height:1.4;">${p.description}</div>
        </div>
        <div style="text-align:right;flex-shrink:0;">
          <div class="u-mono" style="font-size:0.7rem;color:var(--text-dim);">+${p.xp} XP</div>
          <div style="font-size:0.6rem;color:var(--text-dim);margin-top:2px;">${mins} min · ${p.steps.length} Schritte</div>
        </div>
      </div>
      <button data-action="start-protocol" data-id="${p.id}"
        style="width:100%;background:var(--text-main);color:var(--bg);border:none;
               padding:10px;font-size:0.7rem;font-weight:800;text-transform:uppercase;
               letter-spacing:0.05em;cursor:pointer;margin-top:8px;">
        Starten
      </button>
    </div>`;
}

export const ProtokollModul = {
  id:    'protocols',
  label: 'Reha',

  view(_state) {
    const sections = CATEGORIES.map(cat => {
      const cards = cat.ids
        .map(id => protocolsData[id])
        .filter(Boolean)
        .map(ProtocolCard)
        .join('');
      return `
        <div style="margin-bottom:8px;">
          <span class="u-label" style="margin-bottom:8px;">${cat.label}</span>
          ${cards}
        </div>`;
    }).join('');

    return `<div style="padding-bottom:100px;">${sections}</div>`;
  },
};
