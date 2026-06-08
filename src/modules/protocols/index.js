// src/modules/protocols/index.js

export const protocolsData = {

  breath: {
    id: 'breath', title: 'Atemübung 4-7-8', xp: 8, intensity: 'leicht',
    description: 'Beruhigt das Nervensystem in unter 3 Minuten',
    why: 'Aktiviert den Parasympathikus und senkt Cortisol — funktioniert innerhalb einer Atemrunde.',
    steps: [
      { title: 'Einatmen durch die Nase',     duration: 4 },
      { title: 'Atem anhalten',               duration: 7 },
      { title: 'Ausatmen durch den Mund',      duration: 8 },
      { title: 'Einatmen durch die Nase',     duration: 4 },
      { title: 'Atem anhalten',               duration: 7 },
      { title: 'Ausatmen durch den Mund',      duration: 8 },
      { title: 'Letzte Runde — Einatmen',      duration: 4 },
      { title: 'Atem anhalten',               duration: 7 },
      { title: 'Ausatmen — loslassen',         duration: 8 },
    ],
  },

  box_breathing: {
    id: 'box_breathing', title: 'Box Breathing', xp: 10, intensity: 'leicht',
    description: 'Navy SEAL Technik — akuter Stress, maximale Wirkung',
    why: 'Setzt den Stress-Reset-Knopf: gleichmäßige Phasen regulieren das autonome Nervensystem in Minuten.',
    steps: [
      { title: 'Einatmen',                    duration: 4 },
      { title: 'Oben halten',                 duration: 4 },
      { title: 'Ausatmen',                    duration: 4 },
      { title: 'Unten halten',                duration: 4 },
      { title: 'Einatmen',                    duration: 4 },
      { title: 'Oben halten',                 duration: 4 },
      { title: 'Ausatmen',                    duration: 4 },
      { title: 'Unten halten',                duration: 4 },
      { title: 'Einatmen',                    duration: 4 },
      { title: 'Oben halten',                 duration: 4 },
      { title: 'Ausatmen',                    duration: 4 },
      { title: 'Unten halten',                duration: 4 },
      { title: 'Einatmen',                    duration: 4 },
      { title: 'Oben halten',                 duration: 4 },
      { title: 'Ausatmen',                    duration: 4 },
      { title: 'Unten halten — letzte Runde', duration: 4 },
      { title: 'Einatmen',                    duration: 4 },
      { title: 'Oben halten',                 duration: 4 },
      { title: 'Ausatmen — fertig',           duration: 4 },
    ],
  },

  physiological_sigh: {
    id: 'physiological_sigh', title: 'Physiologischer Seufzer', xp: 5, intensity: 'leicht',
    description: 'Schnellste Entspannungsmethode — 60 Sekunden',
    why: 'Der doppelte Einatem öffnet kollabierte Alveolen; der lange Ausatem aktiviert sofort den Vagusnerv.',
    steps: [
      { title: 'Einatmen (Nase)',             duration: 3 },
      { title: 'Nochmals einatmen (kurz)',    duration: 2 },
      { title: 'Lang ausatmen (Mund)',        duration: 8 },
      { title: 'Einatmen (Nase)',             duration: 3 },
      { title: 'Nochmals einatmen (kurz)',    duration: 2 },
      { title: 'Lang ausatmen (Mund)',        duration: 8 },
      { title: 'Einatmen (Nase)',             duration: 3 },
      { title: 'Nochmals einatmen (kurz)',    duration: 2 },
      { title: 'Langer Ausatem — fertig',     duration: 8 },
    ],
  },

  stretch: {
    id: 'stretch', title: 'Ganzkörper Dehnung', xp: 10, intensity: 'leicht',
    description: '5 Minuten · Faszien, Gelenke, Durchblutung',
    why: 'Erhält die Fasziengleitfähigkeit und Gelenkspielraum — beugt Verklebungen und morgendlicher Steifheit vor.',
    steps: [
      { title: 'Nacken links',                duration: 30 },
      { title: 'Nacken rechts',               duration: 30 },
      { title: 'Schulter Quergriff links',     duration: 30 },
      { title: 'Schulter Quergriff rechts',    duration: 30 },
      { title: 'Brust öffnen — Hände hinten', duration: 30 },
      { title: 'Hüftbeuger links',            duration: 45 },
      { title: 'Hüftbeuger rechts',           duration: 45 },
      { title: 'Ischiasmuskel links',         duration: 30 },
      { title: 'Ischiasmuskel rechts',        duration: 30 },
      { title: 'Wadendehnung',                duration: 30 },
    ],
  },

  morning_routine: {
    id: 'morning_routine', title: 'Morgenroutine', xp: 20, intensity: 'leicht',
    description: '8 Minuten · Körper aufwecken, Geist ausrichten',
    why: 'Bereitet Gelenke, Faszien und Nervensystem auf den Tag vor — reduziert das Verletzungsrisiko und steigert die Energie.',
    steps: [
      { title: 'Katze / Kuh — Wirbelsäule wellen',        duration: 45 },
      { title: 'Kind-Pose — Rücken strecken',             duration: 30 },
      { title: 'Hüftkreise stehend — 10x jede Seite',    duration: 40 },
      { title: 'Schulterrotation rückwärts — 10x',       duration: 20 },
      { title: 'Brücke — Gesäß heben, 10x',              duration: 40 },
      { title: 'Taubenpose links',                        duration: 45 },
      { title: 'Taubenpose rechts',                       duration: 45 },
      { title: 'Körperdrehung liegend — links',           duration: 30 },
      { title: 'Körperdrehung liegend — rechts',          duration: 30 },
      { title: 'Stehend strecken — Arme hoch, gähnen',   duration: 20 },
      { title: 'Physiologischer Seufzer — loslassen',    duration: 15 },
    ],
  },

  vagus: {
    id: 'vagus', title: 'Vagus-Stimulation', xp: 15, intensity: 'leicht',
    description: 'Parasympathikus aktivieren — Stressabbau, Verdauung, Schlaf',
    why: 'Direkte Stimulation des Vagusnervs senkt Entzündungsmarker, reguliert die Herzratenvariabilität und verbessert den Schlaf.',
    steps: [
      { title: 'Tiefes Bauchatmen — langsam einatmen',   duration: 30 },
      { title: 'Gurgeln mit Wasser',                     duration: 30 },
      { title: 'Humming — summen auf Ausatem',           duration: 60 },
      { title: 'Kaltes Wasser — Gesicht eintauchen',     duration: 20 },
      { title: 'Langer Ausatem — Lippen gespitzt',       duration: 30 },
      { title: 'Gurgeln — zweite Runde',                 duration: 30 },
      { title: 'Humming — zweite Runde',                 duration: 60 },
      { title: 'Stille — nachspüren',                    duration: 30 },
    ],
  },

  meditation: {
    id: 'meditation', title: 'Meditation', xp: 15, intensity: 'leicht',
    description: '10 Minuten · Ankommen, Stille, Loslassen',
    why: 'Verändert nachweislich die Gehirnstruktur: stärkt die Stressresilienz und reduziert die Schmerzwahrnehmung bei chronischen Beschwerden.',
    steps: [
      { title: 'Ankommen & Atem finden',                 duration: 120 },
      { title: 'Stille halten',                          duration: 360 },
      { title: 'Sanft zurückkommen',                     duration: 120 },
    ],
  },

  micro_workout: {
    id: 'micro_workout', title: 'Mikro-Workout', xp: 20, intensity: 'intensiv',
    description: '10 Minuten · Gerätefrei · Zwei Runden',
    why: 'Erhöht BDNF und Testosteron, verbessert Insulinsensitivität — messbare Wirkung schon nach 10 Minuten Intensität.',
    steps: [
      { title: 'Kniebeuge — Runde 1',                    duration: 30 },
      { title: 'Liegestütz — Runde 1',                   duration: 30 },
      { title: 'Ausfallschritt wechselnd — Runde 1',     duration: 30 },
      { title: 'Plank halten — Runde 1',                 duration: 30 },
      { title: 'Jumping Jacks — Runde 1',                duration: 30 },
      { title: 'Pause',                                  duration: 60 },
      { title: 'Kniebeuge — Runde 2',                    duration: 30 },
      { title: 'Liegestütz — Runde 2',                   duration: 30 },
      { title: 'Ausfallschritt wechselnd — Runde 2',     duration: 30 },
      { title: 'Plank halten — Runde 2',                 duration: 30 },
      { title: 'Jumping Jacks — Runde 2',                duration: 30 },
    ],
  },

  back_activation: {
    id: 'back_activation', title: 'Rückenaktivierung', xp: 15, intensity: 'mittel',
    description: 'Für Büroarbeiter · Tiefe Rückenmuskulatur',
    why: 'Aktiviert die tiefe Rückenmuskulatur, die im Sitzen einschläft und bei Untätigkeit zu chronischen Beschwerden führt.',
    steps: [
      { title: 'Superman — 10 Wdh. halten je 2s',        duration: 40 },
      { title: 'Bird-Dog links — 10 Wdh.',               duration: 40 },
      { title: 'Bird-Dog rechts — 10 Wdh.',              duration: 40 },
      { title: 'Dead Bug — 10 Wdh. je Seite',            duration: 50 },
      { title: 'Brücke — 10 Wdh. langsam',               duration: 40 },
      { title: 'Katze/Kuh — 10x fließend',               duration: 40 },
    ],
  },

  janda_foot: {
    id: 'janda_foot', title: 'Kurzer Fuß · Janda', xp: 8, intensity: 'leicht',
    description: 'Fußintrinsik · Propriozeption · linker Fuß · 3× täglich',
    why: 'Stärkt die intrinsische Fußmuskulatur — Voraussetzung für normales Gangbild und zentrale Schmerzreduktion bei KMÖ.',
    steps: [
      { title: 'Fuß flach aufsetzen — Zehen entspannen',          duration: 10 },
      { title: 'Ballen zur Ferse ziehen — Zehen bleiben flach',   duration: 8  },
      { title: 'Halten — Fußgewölbe aktiviert',                   duration: 6  },
      { title: 'Lösen',                                           duration: 4  },
      { title: 'Ballen zur Ferse — Wiederholung 2',               duration: 8  },
      { title: 'Halten',                                          duration: 6  },
      { title: 'Lösen',                                           duration: 4  },
      { title: 'Ballen zur Ferse — Wiederholung 3',               duration: 8  },
      { title: 'Halten',                                          duration: 6  },
      { title: 'Lösen',                                           duration: 4  },
      { title: 'Ballen zur Ferse — Wiederholung 4',               duration: 8  },
      { title: 'Halten',                                          duration: 6  },
      { title: 'Lösen',                                           duration: 4  },
      { title: 'Ballen zur Ferse — letzte Wiederholung',          duration: 8  },
      { title: 'Halten — maximal aktivieren',                     duration: 8  },
      { title: 'Fuß entspannen — nachspüren',                     duration: 15 },
    ],
  },

  mld: {
    id: 'mld', title: 'Lymphdrainage', xp: 15, intensity: 'leicht',
    description: 'Entstauung · Post-OP · Ödem-Prävention',
    why: 'Reduziert Ödembildung und fördert den Lymphabfluss — verringert Gewebsdruck und damit den KMÖ-typischen Ruheschmerz.',
    steps: [
      { title: 'Tiefatmung — Zwerchfell aktivieren',     duration: 30 },
      { title: 'Halsdrüsen sanft ausstreichen',          duration: 30 },
      { title: 'Achseln kreisend stimulieren',           duration: 30 },
      { title: 'Leiste aktivieren — sanfter Druck',      duration: 60 },
      { title: 'Oberschenkel innen ausstreichen',        duration: 60 },
      { title: 'Kniebeuge hinter der Kniekehle',         duration: 30 },
      { title: 'Unterschenkel aufwärts ausstreichen',    duration: 60 },
      { title: 'Abschluss — Tiefatmung',                 duration: 30 },
    ],
  },

  toes: {
    id: 'toes', title: 'Zehenübungen', xp: 8, intensity: 'leicht',
    description: 'Fußaktivierung · Lymphfluss · Propriozeption',
    why: 'Verbessert die Propriozeption des Fußes und stärkt die fußstabilisierende Muskulatur — wirkt der KMÖ-bedingten Atrophie entgegen.',
    steps: [
      { title: 'Zehen spreizen & halten',                duration: 30 },
      { title: 'Zehen krallen & lösen',                  duration: 30 },
      { title: 'Großzehe isoliert heben',                duration: 30 },
      { title: 'Kleinzehe isoliert heben',               duration: 30 },
      { title: 'Fußrollbewegung',                        duration: 60 },
    ],
  },

  foot_morning: {
    id: 'foot_morning', title: 'Fuß-Aktivierung Morgen', xp: 12, intensity: 'leicht',
    description: 'Vor dem ersten Schritt · Durchblutung · Propriozeption',
    why: 'Bringt Durchblutung und Propriozeption in den Fuß, bevor das erste Gewicht draufkommt — reduziert Anlaufschmerz und Sturzrisiko.',
    steps: [
      { title: 'Zehen einzeln spreizen & halten',                  duration: 20 },
      { title: 'Fußkreise links — 10x jede Richtung',              duration: 30 },
      { title: 'Ferse heben, Ballen belasten — 10x langsam',       duration: 30 },
      { title: 'Kurzer Fuß nach Janda — 3 Wdh.',                   duration: 25 },
      { title: 'Gewichtsverlagerung — Ferse zu Ballen, stehend',   duration: 30 },
      { title: 'Erste Schritte — Ferse bewusst aufsetzen & abrollen', duration: 35 },
    ],
  },

  foot_midday: {
    id: 'foot_midday', title: 'Gangschulung', xp: 15, intensity: 'mittel',
    description: 'Muskelkräftigung · Koordination · Gangmuster',
    why: 'Trainiert die neuromuskuläre Kontrolle und normalisiert das durch KMÖ veränderte Gangbild — entscheidend für die Langzeit-Rehabilitation.',
    steps: [
      { title: 'Einbeinstand links — Augen auf',                   duration: 20 },
      { title: 'Einbeinstand links — Augen zu',                    duration: 15 },
      { title: 'Zehenstand — 10x langsam heben & senken',          duration: 35 },
      { title: 'Ferse-Zehe-Gang — langsam, bewusst',               duration: 30 },
      { title: 'Seitwärtsschritte — 10x jede Richtung',            duration: 30 },
      { title: 'Kniebeuge links betont — 8x',                      duration: 35 },
      { title: 'Bewusstes Gehen — Ferse, Außenkante, Ballen, Abstoß', duration: 35 },
    ],
  },

  foot_evening: {
    id: 'foot_evening', title: 'Fuß-Regeneration Abend', xp: 10, intensity: 'leicht',
    description: 'Entstauung · Mobilisation · Desensibilisierung',
    why: 'Fördert venösen und lymphatischen Rückfluss über Nacht — reduziert Schwellung, Morgensteifigkeit und den KMÖ-typischen Nachtschmerz.',
    steps: [
      { title: 'Fußsohle ausstreichen — Ferse zu Zehen',           duration: 30 },
      { title: 'Unterschenkel aufwärts ausstreichen — sanft',       duration: 45 },
      { title: 'Fußgelenk Kreise — 10x jede Richtung',             duration: 30 },
      { title: 'Wade dehnen — Wand, linkes Bein',                  duration: 30 },
      { title: 'Zehen sanft mobilisieren — einzeln bewegen',        duration: 30 },
      { title: 'Nachspüren — Fuß entspannt ablegen',               duration: 20 },
    ],
  },

};

// ── Kategorien für den Reha-Tab ─────────────────────────────────────────────

const CATEGORIES = [
  { label: 'Fußtraining · 3× täglich', ids: ['foot_morning', 'foot_midday', 'foot_evening'] },
  { label: 'Atmung',                    ids: ['box_breathing', 'physiological_sigh'] },
  { label: 'Beweglichkeit',             ids: ['morning_routine', 'stretch'] },
  { label: 'Nervensystem',              ids: ['vagus', 'meditation'] },
  { label: 'Kraft',                     ids: ['micro_workout', 'back_activation'] },
  { label: 'Reha / Post-OP',            ids: ['mld', 'toes', 'janda_foot'] },
];

// ── Bewegungs-Karten (Schritte & Fahrrad) ──────────────────────────────────

function StepsCard(state) {
  const steps    = state.steps ?? 0;
  const goal     = 5000;
  const pct      = Math.min(Math.round((steps / goal) * 100), 100);
  const segments = [1000, 2000, 3000, 4000, 5000];
  const ticks    = segments.map(s => {
    const left = Math.round((s / goal) * 100);
    return `<div style="position:absolute;left:${left}%;top:-3px;width:2px;height:9px;
      background:${steps >= s ? 'var(--bg)' : 'var(--border)'};transform:translateX(-50%);"></div>`;
  }).join('');
  return `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px;">
        <span class="u-label" style="margin:0;">Schritte</span>
        <span class="u-mono" style="font-size:0.75rem;color:var(--text-dim);">+10 XP / 1.000</span>
      </div>
      <div style="display:flex;align-items:baseline;gap:6px;margin-bottom:10px;">
        <span class="u-mono" style="font-size:2rem;font-weight:var(--fw-bold);letter-spacing:-0.03em;">
          ${steps.toLocaleString('de-DE')}
        </span>
        <span style="font-size:0.7rem;color:var(--text-dim);">/ ${goal.toLocaleString('de-DE')}</span>
      </div>
      <div style="position:relative;height:6px;background:var(--border);border-radius:1px;">
        <div style="height:100%;width:${pct}%;background:var(--text-main);
          transition:width 0.6s ease;border-radius:1px;"></div>
        ${ticks}
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:10px;gap:8px;">
        <button data-action="add-steps" data-value="1000"
          style="flex:1;border:1.5px solid var(--border);background:transparent;
                 padding:8px 0;font-size:0.65rem;font-weight:var(--fw-black);
                 text-transform:uppercase;letter-spacing:var(--ls-upper);cursor:pointer;">+1.000</button>
        <button data-action="add-steps" data-value="2500"
          style="flex:1;border:1.5px solid var(--border);background:transparent;
                 padding:8px 0;font-size:0.65rem;font-weight:var(--fw-black);
                 text-transform:uppercase;letter-spacing:var(--ls-upper);cursor:pointer;">+2.500</button>
        <button data-action="set-steps"
          style="flex:1;border:1.5px solid var(--border);background:transparent;
                 padding:8px 0;font-size:0.65rem;font-weight:var(--fw-black);
                 text-transform:uppercase;letter-spacing:var(--ls-upper);cursor:pointer;">Eingeben</button>
      </div>
    </div>`;
}

function BikeCard(state) {
  const km         = state.bikeKm ?? 0;
  const goal       = 10;
  const pct        = Math.min(Math.round((km / goal) * 100), 100);
  const milestones = [2, 5, 10];
  const ticks      = milestones.map(m => {
    const left = Math.round((m / goal) * 100);
    return `<div style="position:absolute;left:${left}%;top:-3px;width:2px;height:9px;
      background:${km >= m ? 'var(--bg)' : 'var(--border)'};transform:translateX(-50%);"></div>`;
  }).join('');
  return `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px;">
        <span class="u-label" style="margin:0;">Fahrrad</span>
        <span class="u-mono" style="font-size:0.62rem;color:var(--text-dim);">2km +10 · 5km +20 · 10km +40 XP</span>
      </div>
      <div style="display:flex;align-items:baseline;gap:6px;margin-bottom:10px;">
        <span class="u-mono" style="font-size:2rem;font-weight:var(--fw-bold);letter-spacing:-0.03em;">
          ${km % 1 === 0 ? km : km.toFixed(1)}
        </span>
        <span style="font-size:0.7rem;color:var(--text-dim);">/ ${goal} km</span>
      </div>
      <div style="position:relative;height:6px;background:var(--border);border-radius:1px;">
        <div style="height:100%;width:${pct}%;background:var(--text-main);
          transition:width 0.6s ease;border-radius:1px;"></div>
        ${ticks}
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:10px;gap:8px;">
        <button data-action="add-bike" data-value="2"
          style="flex:1;border:1.5px solid var(--border);background:transparent;
                 padding:8px 0;font-size:0.65rem;font-weight:var(--fw-black);
                 text-transform:uppercase;letter-spacing:var(--ls-upper);cursor:pointer;">+2 km</button>
        <button data-action="add-bike" data-value="5"
          style="flex:1;border:1.5px solid var(--border);background:transparent;
                 padding:8px 0;font-size:0.65rem;font-weight:var(--fw-black);
                 text-transform:uppercase;letter-spacing:var(--ls-upper);cursor:pointer;">+5 km</button>
        <button data-action="add-bike" data-value="10"
          style="flex:1;border:1.5px solid var(--border);background:transparent;
                 padding:8px 0;font-size:0.65rem;font-weight:var(--fw-black);
                 text-transform:uppercase;letter-spacing:var(--ls-upper);cursor:pointer;">+10 km</button>
        <button data-action="set-bike"
          style="flex:1;border:1.5px solid var(--border);background:transparent;
                 padding:8px 0;font-size:0.65rem;font-weight:var(--fw-black);
                 text-transform:uppercase;letter-spacing:var(--ls-upper);cursor:pointer;">Eingeben</button>
      </div>
    </div>`;
}

// ── Protokoll-Karte ─────────────────────────────────────────────────────────

const INTENSITY_COLORS = { leicht: 'var(--text-dim)', mittel: '#d97706', intensiv: '#dc2626' };

function ProtocolCard(p) {
  const mins    = Math.round(p.steps.reduce((a, s) => a + s.duration, 0) / 60);
  const intCol  = INTENSITY_COLORS[p.intensity] ?? 'var(--text-dim)';
  return `
    <div class="card" style="padding:14px 16px;margin-bottom:8px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">
        <div style="flex:1;padding-right:12px;">
          <div style="font-weight:800;font-size:0.85rem;letter-spacing:-0.01em;">${p.title}</div>
          <div style="font-size:0.62rem;color:var(--text-dim);margin-top:3px;line-height:1.4;">${p.description}</div>
          ${p.why ? `
          <div style="font-size:0.62rem;color:var(--text-main);opacity:0.6;margin-top:5px;
            line-height:1.4;font-style:italic;">${p.why}</div>` : ''}
        </div>
        <div style="text-align:right;flex-shrink:0;padding-top:2px;">
          <div class="u-mono" style="font-size:0.7rem;color:var(--text-dim);">+${p.xp} XP</div>
          <div style="font-size:0.6rem;color:var(--text-dim);margin-top:2px;">${mins} min</div>
          ${p.intensity ? `<div style="font-size:0.55rem;font-weight:800;text-transform:uppercase;
            letter-spacing:0.05em;margin-top:4px;color:${intCol};">${p.intensity}</div>` : ''}
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

  view(state) {
    const modules   = state.settings?.modules ?? {};
    const stepsOn   = modules.steps ?? true;
    const bikeOn    = modules.bike  ?? true;

    const protocolSections = CATEGORIES.map(cat => {
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

    const hasMovement = stepsOn || bikeOn;
    return `
      <div style="padding-bottom:100px;">
        ${hasMovement ? `
          <div style="margin-bottom:8px;">
            <span class="u-label" style="margin-bottom:8px;">Bewegung</span>
            ${stepsOn ? StepsCard(state) : ''}
            ${bikeOn  ? BikeCard(state)  : ''}
          </div>` : ''}
        ${protocolSections}
      </div>`;
  },
};
