// src/modules/stats/index.js
import { Store }        from '../../core/Store.js';
import { ACHIEVEMENTS } from '../../core/achievements.js';
import { HABITS }       from '../home/index.js';
import { SCREENINGS }   from '../../data/screenings.js';

function StreakCard(state) {
  const current = state.streaks.current;
  const longest = state.longestStreak ?? current;
  const streakMsg = current >= 7  ? 'Woche am Stück — stark!'
                  : current >= 3  ? 'Am Ball bleiben!'
                  : current === 1 ? 'Erster Schritt gemacht.'
                  : current === 0 ? 'Heute loslegen!'
                  : '';
  return `
    <div class="card">
      <span class="u-label" style="margin-bottom:12px;">Serie</span>
      <div style="display:flex;align-items:flex-end;gap:20px;margin-bottom:6px;">
        <div>
          <div class="u-mono" style="font-size:3.6rem;font-weight:800;letter-spacing:-0.04em;line-height:1;">
            ${current}
          </div>
          <div style="font-size:0.6rem;color:var(--text-dim);margin-top:4px;font-weight:800;
            text-transform:uppercase;letter-spacing:0.08em;">Tage aktuell</div>
        </div>
        <div style="padding-bottom:8px;">
          <div class="u-mono" style="font-size:1.6rem;font-weight:700;letter-spacing:-0.03em;
            color:var(--text-dim);">${longest}</div>
          <div style="font-size:0.55rem;color:var(--text-dim);margin-top:2px;font-weight:800;
            text-transform:uppercase;letter-spacing:0.08em;">Rekord</div>
        </div>
      </div>
      ${streakMsg ? `<div style="font-size:0.7rem;color:var(--text-dim);font-style:italic;
        margin-bottom:14px;">${streakMsg}</div>` : '<div style="margin-bottom:14px;"></div>'}
      <span class="u-label" style="margin-bottom:8px;">Letzte 7 Tage</span>
      <div id="activity-dots" style="display:flex;gap:4px;align-items:flex-end;">
        ${Array(7).fill(0).map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          const label = ['Mo','Di','Mi','Do','Fr','Sa','So'][d.getDay() === 0 ? 6 : d.getDay() - 1];
          return `
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">
              <div style="width:100%;height:32px;background:var(--border);border-radius:2px;"
                data-date="${d.toDateString()}"></div>
              <span style="font-size:0.5rem;color:var(--text-dim);font-weight:800;">${label}</span>
            </div>`;
        }).join('')}
      </div>
    </div>`;
}

function XPCard(state) {
  const level    = Math.floor(state.xp / 100) + 1;
  const progress = state.xp % 100;
  return `
    <div class="card">
      <span class="u-label" style="margin-bottom:12px;">Fortschritt</span>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:16px;">
        <div style="text-align:center;padding:12px 8px;border:1px solid var(--border);">
          <div class="u-mono" style="font-size:1.8rem;font-weight:700;">${level}</div>
          <div class="u-label" style="font-size:0.55rem;margin-top:4px;">Level</div>
        </div>
        <div style="text-align:center;padding:12px 8px;border:1px solid var(--border);">
          <div class="u-mono" style="font-size:1.8rem;font-weight:700;">${state.xp}</div>
          <div class="u-label" style="font-size:0.55rem;margin-top:4px;">Gesamt XP</div>
        </div>
        <div style="text-align:center;padding:12px 8px;border:1px solid var(--border);">
          <div class="u-mono" id="weekly-xp-val" style="font-size:1.8rem;font-weight:700;">—</div>
          <div class="u-label" style="font-size:0.55rem;margin-top:4px;">Diese Woche</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:10px;">
        <span class="u-mono" style="font-size:0.7rem;min-width:28px;">L${level}</span>
        <div style="flex:1;height:6px;background:var(--border);border-radius:1px;">
          <div style="height:100%;width:${progress}%;background:var(--text-main);
            transition:width 0.6s ease;border-radius:1px;"></div>
        </div>
        <span class="u-mono" style="font-size:0.7rem;min-width:28px;text-align:right;">L${level + 1}</span>
      </div>
    </div>`;
}

function HydrationCard() {
  return `
    <div class="card">
      <span class="u-label" style="margin-bottom:12px;">Hydration // 14 Tage</span>
      <div id="hydration-chart" style="display:flex;align-items:flex-end;gap:3px;height:56px;">
        ${Array(14).fill(0).map(() =>
          `<div style="flex:1;height:8px;background:var(--border);border-radius:1px;"></div>`
        ).join('')}
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:6px;">
        <span style="font-size:0.6rem;color:var(--text-dim);">vor 14 Tagen</span>
        <span style="font-size:0.6rem;color:var(--text-dim);">heute</span>
      </div>
    </div>`;
}

function GripStrengthCard(state) {
  const log    = state.gripStrengthLog ?? [];
  const recent = log.slice(-14);
  const max    = recent.length ? Math.max(...recent.map(e => e.kg), 1) : 1;

  const bars = recent.map(({ kg }) => {
    const pct = Math.max(Math.round((kg / max) * 100), 8);
    return `
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;">
        <span style="font-size:0.45rem;color:var(--text-dim);line-height:1;">${kg}</span>
        <div style="flex:1;width:100%;display:flex;align-items:flex-end;">
          <div style="width:100%;height:${pct}%;background:var(--text-main);
            border-radius:1px;min-height:3px;transition:height 0.4s ease;"></div>
        </div>
      </div>`;
  }).join('');

  return `
    <div class="card">
      <span class="u-label" style="margin-bottom:12px;">Griffkraft // kg</span>
      ${recent.length
        ? `<div style="display:flex;align-items:flex-end;gap:3px;height:52px;margin-bottom:12px;">
            ${bars}
           </div>`
        : `<div style="font-size:0.7rem;color:var(--text-dim);font-style:italic;margin-bottom:12px;">
            Noch keine Messungen — trag deine erste ein!
           </div>`}
      <div style="display:flex;gap:10px;align-items:stretch;">
        <input id="grip-kg-input" type="number" inputmode="decimal" placeholder="kg"
          style="flex:1;border:1.5px solid var(--border);background:var(--bg);
                 color:var(--text-main);padding:10px;font-size:1rem;font-family:inherit;
                 outline:none;-webkit-appearance:none;min-width:0;">
        <button data-action="save-grip-strength" class="btn-primary" style="flex:1;padding:10px;">
          Speichern
        </button>
      </div>
    </div>`;
}

const BUDAPEST = [
  { id: 'allodynia',    label: 'Allodynie',            desc: 'Schmerz bei leichter Berührung' },
  { id: 'temp_diff',   label: 'Temperatur-Differenz', desc: 'Fuß wärmer/kälter als Gegenseite' },
  { id: 'color_change',label: 'Farbänderung',          desc: 'Bläulich/Rötliche Verfärbung' },
  { id: 'swelling',    label: 'Ödem',                  desc: 'Sichtbare Schwellung' },
];

function PainCard(state) {
  const log   = state.painLog ?? [];
  const today = new Date().toISOString().slice(0, 10);
  const todayEntry = log.find(e => e.date === today);

  // Last 14 days chart data
  const recent14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const iso = d.toISOString().slice(0, 10);
    return log.find(e => e.date === iso) ?? null;
  });

  const chartMax = Math.max(...recent14.map(e => e?.score ?? 0), 1);

  const bars = recent14.map((entry, i) => {
    const hasData = entry !== null;
    const score   = entry?.score ?? 0;
    const pct     = hasData ? Math.max(Math.round((score / chartMax) * 100), score > 0 ? 8 : 0) : 0;
    const color   = score >= 7 ? 'var(--text-main)' : score >= 4 ? 'var(--text-dim)' : 'var(--border)';
    return `
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;">
        ${hasData && score > 0 ? `<span style="font-size:0.42rem;color:var(--text-dim);">${score}</span>` : '<span style="font-size:0.42rem;"></span>'}
        <div style="flex:1;width:100%;display:flex;align-items:flex-end;">
          <div style="width:100%;height:${pct}%;background:${color};
            border-radius:1px;min-height:${hasData ? '2px' : '0'};
            transition:height 0.4s ease;"></div>
        </div>
      </div>`;
  }).join('');

  // Habit correlation: check days with high habit completion vs lower pain
  const correlationMsg = (() => {
    if (log.length < 5) return '';
    const withHighHabits = log.filter(e => (e.habitPct ?? 0) >= 70);
    const withLowHabits  = log.filter(e => (e.habitPct ?? 0) < 70);
    if (!withHighHabits.length || !withLowHabits.length) return '';
    const avgHigh = withHighHabits.reduce((s, e) => s + e.score, 0) / withHighHabits.length;
    const avgLow  = withLowHabits.reduce((s, e) => s + e.score, 0) / withLowHabits.length;
    const diff = avgLow - avgHigh;
    if (diff >= 1) return `An Tagen mit ≥70% Habits: ⌀ ${avgHigh.toFixed(1)} Schmerz — ${diff.toFixed(1)} Punkte weniger als ohne.`;
    return '';
  })();

  const criteriaCheckboxes = BUDAPEST.map(c => {
    const checked = todayEntry?.criteria?.includes(c.id);
    return `
      <label style="display:flex;align-items:center;gap:10px;padding:6px 0;cursor:pointer;
        border-bottom:1px solid var(--border);">
        <input type="checkbox" id="pain-crit-${c.id}" ${checked ? 'checked' : ''}
          style="width:16px;height:16px;cursor:pointer;accent-color:var(--text-main);">
        <div>
          <div style="font-size:0.72rem;font-weight:var(--fw-bold);">${c.label}</div>
          <div style="font-size:0.58rem;color:var(--text-dim);">${c.desc}</div>
        </div>
      </label>`;
  }).join('');

  return `
    <div class="card">
      <span class="u-label" style="margin-bottom:12px;">Schmerz-Tagebuch</span>

      ${log.length >= 2 ? `
        <div style="display:flex;align-items:flex-end;gap:3px;height:52px;margin-bottom:12px;">
          ${bars}
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:14px;">
          <span style="font-size:0.55rem;color:var(--text-dim);">vor 14 Tagen</span>
          <span style="font-size:0.55rem;color:var(--text-dim);">heute</span>
        </div>` : ''}

      ${correlationMsg ? `
        <div style="font-size:0.68rem;color:var(--text-dim);font-style:italic;
          margin-bottom:12px;padding:10px;border:1px solid var(--border);line-height:1.5;">
          ${correlationMsg}
        </div>` : ''}

      <div style="margin-bottom:14px;">
        <div style="font-size:0.6rem;font-weight:800;text-transform:uppercase;
          letter-spacing:0.08em;margin-bottom:8px;">Heute · Schmerz 0–10</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;">
          ${Array.from({ length: 11 }, (_, i) => `
            <button data-action="set-pain-score" data-value="${i}"
              style="width:40px;height:40px;border:1.5px solid ${todayEntry?.score === i ? 'var(--text-main)' : 'var(--border)'};
                background:${todayEntry?.score === i ? 'var(--text-main)' : 'transparent'};
                color:${todayEntry?.score === i ? 'var(--bg)' : 'var(--text-main)'};
                font-weight:800;font-size:0.85rem;cursor:pointer;touch-action:manipulation;">
              ${i}
            </button>`).join('')}
        </div>

        <div style="font-size:0.6rem;font-weight:800;text-transform:uppercase;
          letter-spacing:0.08em;margin-bottom:6px;">Budapest-Kriterien (heute)</div>
        <div style="margin-bottom:12px;">${criteriaCheckboxes}</div>

        <button data-action="save-pain-entry" class="btn-primary" style="width:100%;padding:10px;">
          ${todayEntry ? 'Eintrag aktualisieren' : 'Heute speichern'}
        </button>
      </div>
    </div>`;
}

function ExperimentsCard(state) {
  const experiments = state.experiments ?? [];
  const today       = new Date().toISOString().slice(0, 10);
  const painLog     = state.painLog ?? [];

  const getEndDate = (ex) => {
    const d = new Date(ex.startDate);
    d.setDate(d.getDate() + ex.durationDays);
    return d.toISOString().slice(0, 10);
  };

  const active    = experiments.find(ex => getEndDate(ex) > today);
  const completed = experiments.filter(ex => getEndDate(ex) <= today);

  // Auswertung: Schmerzscore des Folgetags nach Varianten-Log
  function evalExperiment(ex) {
    const variantADays = ex.dailyLog?.filter(d => d.variant === 'A') ?? [];
    const variantBDays = ex.dailyLog?.filter(d => d.variant === 'B') ?? [];

    function avgNextMorningPain(days) {
      const scores = days.map(d => {
        const nextDay = new Date(d.date);
        nextDay.setDate(nextDay.getDate() + 1);
        const iso = nextDay.toISOString().slice(0, 10);
        return painLog.find(p => p.date === iso)?.score ?? null;
      }).filter(s => s !== null);
      if (!scores.length) return null;
      return scores.reduce((a, b) => a + b, 0) / scores.length;
    }

    return { avgA: avgNextMorningPain(variantADays), avgB: avgNextMorningPain(variantBDays),
             nA: variantADays.length, nB: variantBDays.length };
  }

  // Aktives Experiment — heutige Variante already logged?
  const todayLogged = active?.dailyLog?.find(d => d.date === today);

  const activeSection = active ? `
    <div style="margin-bottom:14px;padding:12px;border:1.5px solid var(--border);">
      <div style="font-size:0.7rem;font-weight:800;margin-bottom:4px;">${active.title}</div>
      <div style="font-size:0.6rem;color:var(--text-dim);margin-bottom:10px;">
        ${active.habitOrProtocolId} · A: ${active.variantA} / B: ${active.variantB} ·
        Tag ${active.dailyLog?.length ?? 0} / ${active.durationDays}
      </div>
      ${todayLogged
        ? `<div style="font-size:0.65rem;color:var(--text-dim);font-style:italic;">Heute: Variante ${todayLogged.variant} ✓</div>`
        : `<div style="display:flex;gap:8px;">
            <button data-action="log-experiment-variant" data-id="${active.id}" data-value="A"
              style="flex:1;border:1.5px solid var(--border);background:transparent;padding:10px;
                font-size:0.7rem;font-weight:800;cursor:pointer;">Variante A</button>
            <button data-action="log-experiment-variant" data-id="${active.id}" data-value="B"
              style="flex:1;border:1.5px solid var(--border);background:transparent;padding:10px;
                font-size:0.7rem;font-weight:800;cursor:pointer;">Variante B</button>
          </div>`}
    </div>` : '';

  const completedSection = completed.map(ex => {
    const { avgA, avgB, nA, nB } = evalExperiment(ex);
    const winner = avgA !== null && avgB !== null
      ? (avgA < avgB ? `A (⌀ ${avgA.toFixed(1)} vs. ${avgB.toFixed(1)})` : `B (⌀ ${avgB.toFixed(1)} vs. ${avgA.toFixed(1)})`)
      : 'Zu wenig Daten';
    return `
      <div style="padding:10px;border:1px solid var(--border);margin-bottom:8px;opacity:0.7;">
        <div style="font-size:0.65rem;font-weight:800;margin-bottom:4px;">${ex.title} ✓</div>
        <div style="font-size:0.58rem;color:var(--text-dim);">
          ${nA}× A · ${nB}× B · Schmerzscore Folgetag: ${winner}
        </div>
      </div>`;
  }).join('');

  const createForm = !active ? `
    <div style="margin-bottom:8px;">
      <div style="font-size:0.6rem;color:var(--text-dim);margin-bottom:10px;">
        Teste 2–4 Wochen lang, ob Variante A oder B deinen nächsten Morgen-Schmerzscore senkt.
      </div>
      <input id="exp-title" placeholder="Titel des Experiments"
        style="width:100%;border:1.5px solid var(--border);background:var(--bg);
               color:var(--text-main);padding:9px;font-size:0.85rem;font-family:inherit;
               outline:none;margin-bottom:6px;box-sizing:border-box;">
      <input id="exp-habit" placeholder="Habit / Protokoll (z. B. vagus)"
        style="width:100%;border:1.5px solid var(--border);background:var(--bg);
               color:var(--text-main);padding:9px;font-size:0.85rem;font-family:inherit;
               outline:none;margin-bottom:6px;box-sizing:border-box;">
      <div style="display:flex;gap:6px;margin-bottom:6px;">
        <input id="exp-variant-a" placeholder="Variante A"
          style="flex:1;border:1.5px solid var(--border);background:var(--bg);
                 color:var(--text-main);padding:9px;font-size:0.85rem;font-family:inherit;
                 outline:none;min-width:0;box-sizing:border-box;">
        <input id="exp-variant-b" placeholder="Variante B"
          style="flex:1;border:1.5px solid var(--border);background:var(--bg);
                 color:var(--text-main);padding:9px;font-size:0.85rem;font-family:inherit;
                 outline:none;min-width:0;box-sizing:border-box;">
      </div>
      <div style="display:flex;gap:6px;align-items:center;margin-bottom:10px;">
        <span style="font-size:0.62rem;color:var(--text-dim);white-space:nowrap;">Dauer:</span>
        <input id="exp-days" type="number" min="7" max="90" value="14" inputmode="numeric"
          style="width:64px;border:1.5px solid var(--border);background:var(--bg);
                 color:var(--text-main);padding:9px;font-size:0.85rem;font-family:inherit;
                 outline:none;-webkit-appearance:none;">
        <span style="font-size:0.62rem;color:var(--text-dim);">Tage</span>
      </div>
      <button data-action="create-experiment" class="btn-primary" style="width:100%;padding:10px;">
        Experiment starten
      </button>
    </div>` : '';

  return `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12px;">
        <span class="u-label" style="margin:0;">N-of-1 Experimente</span>
        ${active ? `<span style="font-size:0.6rem;color:var(--text-dim);">läuft</span>` : ''}
      </div>
      ${activeSection}
      ${completedSection}
      ${createForm}
    </div>`;
}

function AchievementsCard(state) {
  const unlocked = new Set(state.unlockedAchievements ?? []);
  const count    = unlocked.size;
  const total    = ACHIEVEMENTS.length;

  const badges = ACHIEVEMENTS.map(a => {
    const done = unlocked.has(a.id);
    return `
      <div title="${a.title} — ${a.desc}" style="
        display:flex;flex-direction:column;align-items:center;gap:4px;
        opacity:${done ? '1' : '0.2'};
        filter:${done ? 'none' : 'grayscale(1)'};
      ">
        <div style="font-size:1.6rem;line-height:1;">${a.icon}</div>
        <div style="font-size:0.55rem;font-weight:800;text-align:center;
          max-width:48px;line-height:1.2;color:${done ? 'var(--text-main)' : 'var(--text-dim)'};">
          ${a.title}
        </div>
      </div>`;
  }).join('');

  return `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:16px;">
        <span class="u-label" style="margin:0;">Abzeichen</span>
        <span class="u-mono" style="font-size:0.75rem;color:var(--text-dim);">${count} / ${total}</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px 8px;">
        ${badges}
      </div>
    </div>`;
}

function PrintReportCard() {
  return `
    <div class="card" style="text-align:center;">
      <span class="u-label" style="margin-bottom:8px;">Arztbericht</span>
      <div style="font-size:0.65rem;color:var(--text-dim);margin-bottom:14px;line-height:1.5;">
        Kompakte Zusammenfassung für den nächsten Arzttermin —
        Schmerz, Compliance, Griffkraft, Vorsorge.
      </div>
      <button data-action="show-print-report" class="btn-primary" style="max-width:260px;">
        Bericht erstellen &amp; drucken
      </button>
    </div>`;
}

// Generates the full print-overlay HTML injected into body
export function buildPrintReport(state) {
  const today      = new Date().toISOString().slice(0, 10);
  const painLog    = (state.painLog ?? []).slice(-30);
  const gripLog    = state.gripStrengthLog ?? [];
  const vorsorgeLog = state.vorsorgeLog ?? {};
  const streak     = state.streaks?.current ?? 0;
  const birthYear  = state.settings?.birthYear ?? null;
  const gender     = state.settings?.gender ?? null;
  const name       = state.settings?.userName ?? '';

  // Pain stats
  const avgPain = painLog.length
    ? (painLog.reduce((s, e) => s + e.score, 0) / painLog.length).toFixed(1)
    : '—';
  const painTrend = (() => {
    if (painLog.length < 6) return '';
    const first = painLog.slice(0, 3).reduce((s, e) => s + e.score, 0) / 3;
    const last  = painLog.slice(-3).reduce((s, e) => s + e.score, 0) / 3;
    return last < first - 0.5 ? '↓ besser' : last > first + 0.5 ? '↑ schlechter' : '→ stabil';
  })();
  const budapestDays = painLog.filter(e => e.criteria?.length > 0).length;

  // Mini pain bar chart (inline SVG, 30 cols)
  const painMax = Math.max(...painLog.map(e => e.score), 1);
  const barW = 8; const barH = 40; const gap = 2;
  const painBars = painLog.map((e, i) => {
    const h = Math.max(Math.round((e.score / painMax) * barH), e.score > 0 ? 2 : 0);
    const fill = e.score >= 7 ? '#cc0000' : e.score >= 4 ? '#888' : '#ccc';
    return `<rect x="${i * (barW + gap)}" y="${barH - h}" width="${barW}" height="${h}" fill="${fill}"/>`;
  }).join('');
  const painSvgW = painLog.length * (barW + gap);
  const painChart = painLog.length
    ? `<svg width="${painSvgW}" height="${barH}" style="display:block;margin:6pt 0;">${painBars}</svg>`
    : '<em style="color:#888">Keine Daten</em>';

  // Core habit compliance from painLog habitPct (proxy)
  const avgHabitPct = painLog.filter(e => e.habitPct != null).length
    ? Math.round(painLog.filter(e => e.habitPct != null).reduce((s, e) => s + e.habitPct, 0) / painLog.filter(e => e.habitPct != null).length)
    : null;

  // Grip strength
  const gripRows = gripLog.slice(-10).map(e =>
    `<tr><td>${e.date}</td><td>${e.kg} kg</td></tr>`).join('');
  const gripFirst = gripLog[0];
  const gripLast  = gripLog[gripLog.length - 1];
  const gripTrend = gripFirst && gripLast && gripFirst !== gripLast
    ? (gripLast.kg > gripFirst.kg ? `↑ ${(gripLast.kg - gripFirst.kg).toFixed(1)} kg gewonnen` : `↓ ${(gripFirst.kg - gripLast.kg).toFixed(1)} kg`)
    : '';

  // Vorsorge status
  const age = birthYear ? new Date().getFullYear() - birthYear : null;
  const relevantScreenings = SCREENINGS.filter(sc => {
    if (age !== null && sc.fromAge > age) return false;
    if (sc.toAge !== undefined && age !== null && age > sc.toAge) return false;
    if (sc.gender !== 'all') {
      if (sc.gender === 'female' && gender !== 'female') return false;
      if (sc.gender === 'male'   && gender !== 'male')   return false;
    }
    return true;
  });

  const vorsorgeRows = relevantScreenings.map(sc => {
    const lastDone = vorsorgeLog[sc.id];
    let status = 'Nie erfasst';
    if (lastDone) {
      const doneDate  = new Date(lastDone);
      const nextDue   = new Date(doneDate);
      nextDue.setMonth(nextDue.getMonth() + sc.intervalMonths);
      const daysLeft  = Math.ceil((nextDue - new Date()) / 86_400_000);
      status = daysLeft < 0
        ? `FÄLLIG (seit ${-daysLeft}d)`
        : daysLeft < 30
          ? `bald fällig (in ${daysLeft}d)`
          : `aktuell (fällig ${nextDue.toLocaleDateString('de-DE')})`;
    }
    return `<tr><td>${sc.label}</td><td>${lastDone ?? '—'}</td><td>${status}</td></tr>`;
  }).join('');

  return `
    <div class="print-overlay" id="print-overlay" style="
      position:fixed;inset:0;background:var(--bg);z-index:2000;overflow-y:auto;
      padding:24px 20px calc(24px + var(--safe-bot));">

      <!-- Controls — hidden on print -->
      <div class="no-print" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <span style="font-size:0.7rem;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;">
          Arztbericht
        </span>
        <div style="display:flex;gap:10px;">
          <button onclick="window.print()"
            style="background:var(--text-main);color:var(--bg);border:none;padding:10px 16px;
              font-weight:800;font-size:0.65rem;text-transform:uppercase;cursor:pointer;">
            Drucken / PDF
          </button>
          <button onclick="document.getElementById('print-overlay').remove()"
            style="background:transparent;border:1.5px solid var(--border);padding:10px 16px;
              font-weight:800;font-size:0.65rem;text-transform:uppercase;cursor:pointer;">
            Schließen
          </button>
        </div>
      </div>

      <!-- Report content -->
      <div style="max-width:640px;margin:0 auto;">

        <div class="print-section" style="margin-bottom:20px;border-bottom:2px solid var(--text-main);padding-bottom:12px;">
          <div style="font-size:1.1rem;font-weight:800;letter-spacing:-0.02em;">REHAPP — Arztbericht</div>
          <div style="font-size:0.65rem;color:var(--text-dim);margin-top:4px;">
            ${name ? name + ' · ' : ''}Erstellt: ${today} · Zeitraum: letzte 30 Tage
          </div>
          <div style="font-size:0.65rem;margin-top:4px;">
            Aktuelle Serie: <strong>${streak}</strong> Tage · XP gesamt: <strong>${state.xp ?? 0}</strong>
          </div>
        </div>

        <div class="print-section">
          <div style="font-size:0.6rem;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">
            Schmerz-Verlauf (letzte 30 Tage)
          </div>
          ${painChart}
          <div style="font-size:0.72rem;line-height:1.8;">
            Ø Score: <strong>${avgPain} / 10</strong>
            ${painTrend ? ` · Trend: <strong>${painTrend}</strong>` : ''}
            · Budapest-Kriterien notiert: <strong>${budapestDays}×</strong>
            ${avgHabitPct !== null ? ` · Ø Habit-Compliance: <strong>${avgHabitPct}%</strong>` : ''}
          </div>
          ${painLog.length >= 3 ? `
            <div style="margin-top:10px;overflow-x:auto;">
              <table class="print-table">
                <thead><tr><th>Datum</th><th>Score</th><th>Budapest</th><th>Habits</th></tr></thead>
                <tbody>
                  ${painLog.slice(-14).map(e => `<tr>
                    <td>${e.date}</td>
                    <td>${e.score}</td>
                    <td>${e.criteria?.length ? e.criteria.join(', ') : '—'}</td>
                    <td>${e.habitPct != null ? e.habitPct + '%' : '—'}</td>
                  </tr>`).join('')}
                </tbody>
              </table>
            </div>` : ''}
        </div>

        ${gripLog.length ? `
        <div class="print-section" style="margin-top:16px;">
          <div style="font-size:0.6rem;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">
            Griffkraft-Verlauf
          </div>
          ${gripTrend ? `<div style="font-size:0.72rem;margin-bottom:8px;">${gripTrend}</div>` : ''}
          <table class="print-table">
            <thead><tr><th>Datum</th><th>Griffkraft</th></tr></thead>
            <tbody>${gripRows}</tbody>
          </table>
        </div>` : ''}

        ${relevantScreenings.length ? `
        <div class="print-section" style="margin-top:16px;">
          <div style="font-size:0.6rem;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">
            Vorsorge-Status
          </div>
          <table class="print-table">
            <thead><tr><th>Untersuchung</th><th>Zuletzt</th><th>Status</th></tr></thead>
            <tbody>${vorsorgeRows}</tbody>
          </table>
        </div>` : ''}

        <div class="print-section" style="margin-top:20px;font-size:0.58rem;color:var(--text-dim);
          line-height:1.6;border-top:1px solid var(--border);padding-top:12px;">
          Dieser Bericht wurde automatisch von REHAPP generiert und ersetzt keine ärztliche Beurteilung.
          Schmerzdaten beruhen auf Selbsteinschätzung. Budapest-Kriterien wurden nicht durch einen Arzt bewertet.
        </div>

      </div>
    </div>`;
}

export const StatsModul = {
  id:    'stats',
  label: 'Stats',

  view(state) {
    requestAnimationFrame(() => StatsModul._enrich());
    return `
      <div style="padding-bottom:100px;">
        ${StreakCard(state)}
        ${XPCard(state)}
        ${HydrationCard()}
        ${GripStrengthCard(state)}
        ${PainCard(state)}
        ${ExperimentsCard(state)}
        ${AchievementsCard(state)}
        ${PrintReportCard()}
      </div>`;
  },

  async _enrich() {
    const dotsEl = document.getElementById('activity-dots');
    if (dotsEl) {
      const log    = await Store.getActivityLog(7);
      const byDate = {};
      log.forEach(e => { byDate[e.date] = true; });
      dotsEl.querySelectorAll('[data-date]').forEach(el => {
        const active = byDate[el.dataset.date];
        el.style.background = active ? 'var(--text-main)' : 'var(--border)';
        el.style.transition  = 'background 0.3s';
      });
    }

    const xpEl = document.getElementById('weekly-xp-val');
    if (xpEl) {
      const weekly = await Store.getWeeklyXP();
      xpEl.textContent = `+${weekly}`;
    }

    const chartEl = document.getElementById('hydration-chart');
    if (chartEl) {
      const history = await Store.getHydrationHistory(14);
      if (history.length) {
        const max = Math.max(...history.map(d => d.count), 1);
        chartEl.innerHTML = history.map(({ count }) => {
          const pct = Math.max(Math.round((count / max) * 100), count > 0 ? 10 : 0);
          return `<div style="flex:1;height:${pct}%;background:${count > 0 ? 'var(--text-main)' : 'var(--border)'};
            border-radius:1px;transition:height 0.4s ease;align-self:flex-end;"></div>`;
        }).join('');
      }
    }
  },
};
