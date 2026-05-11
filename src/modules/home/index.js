// src/modules/home/index.js

export const HABITS = [
  // ── Morgen ────────────────────────────────────────────────────────────────────
  { id: 'sleep',      block: 'morgen',   label: 'Geschlafen',        sub: 'mind. 6 Stunden',                 xp: 20, type: 'check'    },
  { id: 'morning',    block: 'morgen',   label: 'Morgenroutine',     sub: '8 Min · Körper aufwecken',         xp: 20, type: 'protocol', protocol: 'morning_routine' },
  { id: 'breath',     block: 'morgen',   label: 'Atemübung 4-7-8',   sub: '3 Runden · Nervensystem',          xp: 8,  type: 'protocol', protocol: 'breath'          },
  { id: 'sunlight',   block: 'morgen',   label: 'Draußen',           sub: 'Tageslicht & frische Luft',        xp: 5,  type: 'check'    },
  { id: 'noscreen_am',block: 'morgen',   label: 'Screen-frei',       sub: 'Erste 30 Min nach dem Aufwachen',  xp: 15, type: 'check'    },
  { id: 'teeth',      block: 'morgen',   label: 'Zähne',             sub: '2 Min + Zungenreiniger',           xp: 5,  type: 'check'    },
  // ── Tag ───────────────────────────────────────────────────────────────────────
  { id: 'movement',   block: 'tag',      label: 'Bewegungspause',    sub: '2 Min aufstehen · strecken',       xp: 3,  type: 'check'    },
  { id: 'box',        block: 'tag',      label: 'Box Breathing',     sub: 'Stress abbauen · 5 Runden',        xp: 10, type: 'protocol', protocol: 'box_breathing'   },
  { id: 'learning',   block: 'tag',      label: 'Input',             sub: '10 Minuten Neues',                 xp: 15, type: 'check'    },
  { id: 'cooking',    block: 'tag',      label: 'Gekocht',           sub: 'Eine Mahlzeit selbst gekocht',     xp: 15, type: 'check'    },
  { id: 'others',     block: 'tag',      label: 'Für andere',        sub: 'Etwas für jemand getan',           xp: 20, type: 'check'    },
  // ── Abend ─────────────────────────────────────────────────────────────────────
  { id: 'stretch',    block: 'abend',    label: 'Dehnung',           sub: '10 Min · Faszien & Gelenke',       xp: 10, type: 'protocol', protocol: 'stretch'         },
  { id: 'vagus',      block: 'abend',    label: 'Vagus',             sub: '5 Min · Parasympathikus',          xp: 15, type: 'protocol', protocol: 'vagus'           },
  { id: 'meditation', block: 'abend',    label: 'Meditation',        sub: '10 Minuten',                       xp: 15, type: 'protocol', protocol: 'meditation'      },
  { id: 'gratitude',  block: 'abend',    label: 'Dankbarkeit',       sub: 'Was war dein Up heute?',           xp: 10, type: 'text'     },
  // ── Verzicht ──────────────────────────────────────────────────────────────────
  { id: 'no_alcohol', block: 'verzicht', label: 'Kein Alkohol',      sub: 'Jeder Tag ohne Alkohol zählt',     xp: 20, type: 'check'    },
  { id: 'no_sugar',   block: 'verzicht', label: 'Kein Zucker',       sub: 'Zucker entzündet',                 xp: 15, type: 'check'    },
  { id: 'no_drugs',   block: 'verzicht', label: 'Drogenfrei',        sub: 'Jeder Tag ohne Drogen zählt',      xp: 20, type: 'check'    },
  { id: 'cigarettes', block: 'verzicht', label: 'Zigaretten',        sub: 'Keine = +20 XP · 1–3 = +10 XP',    xp: 20, type: 'cigs'     },
];

const BLOCKS = [
  { id: 'morgen',   label: 'Morgen'   },
  { id: 'tag',      label: 'Tag'      },
  { id: 'abend',    label: 'Abend'    },
  { id: 'verzicht', label: 'Verzicht' },
];

function formatTime(s) {
  const h   = Math.floor(s / 3600).toString().padStart(2, '0');
  const m   = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${h}:${m}:${sec}`;
}

function currentBlock(wakeTime = '07:00') {
  const [wh, wm]  = wakeTime.split(':').map(Number);
  const now       = new Date();
  const nowMin    = now.getHours() * 60 + now.getMinutes();
  const wakeMin   = wh * 60 + (wm || 0);
  if (nowMin < wakeMin + 4 * 60)  return 'morgen';
  if (nowMin < wakeMin + 12 * 60) return 'tag';
  return 'abend';
}

// ── Habit cards ───────────────────────────────────────────────────────────────

function CigsCard(habit, doneHabits) {
  const done    = habit.id in doneHabits;
  const btnBase = `border:1.5px solid var(--border);background:transparent;
    font-weight:var(--fw-black);font-size:0.72rem;cursor:pointer;
    padding:8px 0;flex:1;letter-spacing:var(--ls-upper);`;

  if (done) {
    const count = doneHabits[habit.id];
    return `
      <div class="card" style="display:flex;align-items:center;gap:12px;
        padding:14px 20px;margin-bottom:8px;opacity:0.4;">
        <div style="flex:1;">
          <div style="font-weight:var(--fw-bold);font-size:0.85rem;text-decoration:line-through;">${habit.label}</div>
          <div style="font-size:0.6rem;color:var(--text-dim);margin-top:2px;">${habit.sub}</div>
        </div>
        <span class="u-mono" style="font-size:0.72rem;">${count === 0 ? '✓ Keine' : count + '×'}</span>
      </div>`;
  }

  return `
    <div class="card" style="padding:14px 20px;margin-bottom:8px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <div>
          <div style="font-weight:var(--fw-bold);font-size:0.85rem;">${habit.label}</div>
          <div style="font-size:0.6rem;color:var(--text-dim);margin-top:2px;">${habit.sub}</div>
        </div>
        <span class="u-mono" style="font-size:0.62rem;color:var(--text-dim);">+${habit.xp}</span>
      </div>
      <div style="display:flex;gap:6px;">
        <button data-action="log-cigs" data-value="0"
          style="${btnBase}flex:2;text-transform:uppercase;">Keine</button>
        <button data-action="log-cigs" data-value="1" style="${btnBase}">1</button>
        <button data-action="log-cigs" data-value="2" style="${btnBase}">2</button>
        <button data-action="log-cigs" data-value="3"
          style="${btnBase}text-transform:uppercase;font-size:0.65rem;">3 max</button>
      </div>
    </div>`;
}

function GratitudeCard(habit, doneHabits) {
  const done = habit.id in doneHabits;

  if (done) {
    return `
      <div class="card" style="padding:14px 20px;margin-bottom:8px;opacity:0.4;">
        <div style="font-weight:var(--fw-bold);font-size:0.85rem;text-decoration:line-through;">${habit.label}</div>
        ${doneHabits.gratitude
          ? `<div style="font-size:0.75rem;color:var(--text-dim);margin-top:4px;font-style:italic;">${doneHabits.gratitude}</div>`
          : ''}
      </div>`;
  }

  return `
    <div class="card" style="padding:14px 20px;margin-bottom:8px;">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;">
        <div>
          <div style="font-weight:var(--fw-bold);font-size:0.85rem;">${habit.label}</div>
          <div style="font-size:0.6rem;color:var(--text-dim);margin-top:2px;">${habit.sub}</div>
        </div>
        <span class="u-mono" style="font-size:0.62rem;color:var(--text-dim);">+${habit.xp}</span>
      </div>
      <textarea id="gratitude-inline" rows="2"
        placeholder="Heute war schön, dass …"
        style="width:100%;background:var(--bg);border:1.5px solid var(--border);
               padding:10px;font-family:inherit;font-size:0.85rem;resize:none;
               outline:none;color:var(--text-main);margin-bottom:8px;box-sizing:border-box;"></textarea>
      <button data-action="save-gratitude" class="btn-primary" style="width:100%;padding:10px;">
        Speichern
      </button>
    </div>`;
}

function HabitCard(habit, doneHabits) {
  if (habit.type === 'cigs') return CigsCard(habit, doneHabits);
  if (habit.type === 'text') return GratitudeCard(habit, doneHabits);

  const done = !!doneHabits[habit.id];

  const action = done
    ? `<div style="width:32px;height:32px;border:1.5px solid var(--border);
         display:flex;align-items:center;justify-content:center;font-size:0.9rem;opacity:0.4;">✓</div>`
    : habit.type === 'protocol'
      ? `<button data-action="start-protocol" data-id="${habit.protocol}"
           style="width:32px;height:32px;cursor:pointer;font-weight:var(--fw-black);
             font-size:0.8rem;border:1.5px solid var(--text-main);
             background:var(--text-main);color:var(--bg);">▶</button>`
      : `<button data-action="tap-habit" data-id="${habit.id}"
           style="width:32px;height:32px;cursor:pointer;font-weight:var(--fw-black);
             font-size:0.8rem;border:1.5px solid var(--text-main);
             background:transparent;color:var(--text-main);">+</button>`;

  return `
    <div class="card" style="display:flex;justify-content:space-between;align-items:center;
      padding:14px 20px;margin-bottom:8px;${done ? 'opacity:0.4;' : ''}">
      <div style="flex:1;min-width:0;padding-right:12px;">
        <div style="font-weight:var(--fw-bold);font-size:0.85rem;
          ${done ? 'text-decoration:line-through;' : ''}">${habit.label}</div>
        ${habit.sub ? `<div style="font-size:0.65rem;color:var(--text-dim);margin-top:3px;">${habit.sub}</div>` : ''}
      </div>
      <div style="display:flex;align-items:center;gap:10px;flex-shrink:0;">
        ${!done ? `<span class="u-mono" style="font-size:0.62rem;color:var(--text-dim);">+${habit.xp}</span>` : ''}
        ${action}
      </div>
    </div>`;
}

function BlockSection(block, doneHabits, wakeTime) {
  const habits  = HABITS.filter(h => h.block === block.id);
  if (!habits.length) return '';
  const active  = block.id === currentBlock(wakeTime);
  return `
    <div style="margin-bottom:16px;">
      <span class="u-label" style="margin-bottom:8px;${active ? '' : 'opacity:0.45;'}">
        ${block.label}
      </span>
      ${habits.map(h => HabitCard(h, doneHabits)).join('')}
    </div>`;
}

// ── Fasting milestone banner ──────────────────────────────────────────────────

const FASTING_SCIENCE = {
  12: 'Wachstumshormone steigen — Zellreparatur aktiv.',
  16: 'Autophagie aktiv — Körper beginnt Zellmüll zu recyceln.',
  18: 'Fettstoffwechsel auf Maximum. Ketone steigen.',
  24: 'Tiefe Zellreinigung. Stärkster Autophagie-Effekt.',
};

function MilestoneBanner(state) {
  if (!state.fasting?.running || !state.fasting?.startTime) return '';
  const hours      = Math.floor((Date.now() - state.fasting.startTime) / 3_600_000);
  const thresholds = [12, 16, 18, 24];
  const reached    = thresholds.filter(m => hours >= m);
  const next       = thresholds.find(m => hours < m);
  if (!reached.length && !next) return '';

  const current      = reached[reached.length - 1];
  const sci          = current ? FASTING_SCIENCE[current] : null;
  const hoursToNext  = next ? next - hours : null;

  return `
    <div class="card" style="margin-bottom:12px;border-left:3px solid var(--text-main);">
      <div style="display:flex;justify-content:space-between;align-items:baseline;
        margin-bottom:${sci ? '6px' : '0'};">
        <span class="u-label" style="margin:0;">${current ? current + 'h FASTEN' : 'FASTEN'}</span>
        ${hoursToNext !== null
          ? `<span class="u-mono" style="font-size:0.62rem;color:var(--text-dim);">nächste: ${next}h in ${hoursToNext}h</span>`
          : `<span class="u-mono" style="font-size:0.62rem;color:var(--text-dim);">24h erreicht</span>`}
      </div>
      ${sci ? `<div style="font-size:0.78rem;color:var(--text-dim);line-height:1.4;">${sci}</div>` : ''}
    </div>`;
}

// ── Metric cards ──────────────────────────────────────────────────────────────

function TimerCard(state) {
  const { startTime, running, mode = '16:8' } = state.fasting;
  const target    = mode === '100h' ? 360_000 : 57_600;
  const elapsed   = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
  const remaining = Math.max(target - elapsed, 0);
  const display   = running ? formatTime(remaining) : formatTime(target);

  const modeBtn = (label, val) => {
    const active = mode === val;
    return `<button data-action="set-timer-mode" data-value="${val}"
      style="padding:4px 10px;font-size:0.6rem;font-weight:var(--fw-black);
        letter-spacing:var(--ls-upper);cursor:pointer;
        border:1.5px solid var(--text-main);
        ${val === '16:8' ? 'border-right:none;' : ''}
        background:${active ? 'var(--text-main)' : 'transparent'};
        color:${active ? 'var(--bg)' : 'var(--text-main)'};">${label}</button>`;
  };

  return `
    <div class="card" style="text-align:center;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <span class="u-label" style="margin:0;">Fasten</span>
        <div style="display:flex;pointer-events:${running ? 'none' : 'auto'};
          opacity:${running ? 0.35 : 1};">
          ${modeBtn('16:8', '16:8')}${modeBtn('100h', '100h')}
        </div>
      </div>
      <div id="main-timer-display" class="u-mono"
        style="font-size:clamp(2.4rem,10vw,3.6rem);letter-spacing:-0.04em;margin:0 0 20px;
               font-weight:var(--fw-medium);line-height:1;">
        ${display}
      </div>
      ${!running ? `
        <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:16px;">
          <span style="font-size:0.6rem;color:var(--text-dim);font-weight:var(--fw-black);
            text-transform:uppercase;letter-spacing:var(--ls-upper);">Bereits</span>
          <input type="number" id="fast-offset" min="0" max="99" step="1" value="0"
            style="width:52px;border:1.5px solid var(--border);background:var(--bg);
                   color:var(--text-main);padding:6px 8px;text-align:center;
                   font-family:var(--font-mono);font-size:0.9rem;outline:none;
                   -webkit-appearance:none;appearance:none;">
          <span style="font-size:0.6rem;color:var(--text-dim);font-weight:var(--fw-black);
            text-transform:uppercase;letter-spacing:var(--ls-upper);">h gefastet</span>
        </div>` : ''}
      <button data-action="toggle-fast" class="btn-primary ${running ? 'btn-stop' : ''}"
        style="max-width:280px;">
        ${running ? '■ Stopp' : '▶ Start Fasten'}
      </button>
    </div>`;
}

function WaterCard(state) {
  const count = state.water.length;
  const max   = 8;
  const pct   = Math.round((count / max) * 100);
  const dots  = Array.from({ length: max }, (_, i) => {
    const filled = i < count;
    return `
      <button data-action="add-water" aria-label="0.5L Wasser"
        style="width:11%;aspect-ratio:1;cursor:pointer;border-radius:var(--radius-sm);
               transition:background 0.15s,border-color 0.15s;
               border:1.5px ${filled ? 'solid var(--text-main)' : 'dashed var(--border)'};
               background:${filled ? 'var(--text-main)' : 'transparent'};
               color:${filled ? 'var(--bg)' : 'transparent'};
               font-size:0.55rem;font-weight:var(--fw-black);">✓
      </button>`;
  }).join('');
  return `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px;">
        <span class="u-label" style="margin:0;">Wasser</span>
        <span class="u-mono" style="font-size:0.75rem;color:var(--text-dim);">
          ${(count * 0.5).toFixed(1)} / 4.0 L · +5 XP
        </span>
      </div>
      <div style="display:flex;justify-content:space-between;gap:3px;">${dots}</div>
      <div style="margin-top:8px;height:3px;background:var(--border);border-radius:1px;">
        <div style="height:100%;width:${pct}%;background:var(--text-main);transition:width 0.4s ease;"></div>
      </div>
    </div>`;
}

function XPBar(state) {
  const level    = Math.floor(state.xp / 100) + 1;
  const progress = state.xp % 100;
  return `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
      <span class="u-mono" style="font-size:0.8rem;font-weight:var(--fw-black);min-width:32px;">L${level}</span>
      <div style="flex:1;height:4px;background:var(--border);border-radius:1px;">
        <div style="height:100%;width:${progress}%;background:var(--text-main);
          transition:width 0.6s cubic-bezier(0.1,0,0,1);border-radius:1px;"></div>
      </div>
      <span class="u-mono" style="font-size:0.7rem;color:var(--text-dim);min-width:48px;text-align:right;">
        ${state.xp} XP
      </span>
    </div>`;
}

export const HomeModul = {
  id:    'home',
  label: 'Heute',

  view(state) {
    const doneHabits = state.doneHabits ?? {};
    const wakeTime   = state.settings?.wakeTime ?? '07:00';
    return `
      <div>
        ${XPBar(state)}
        ${TimerCard(state)}
        ${MilestoneBanner(state)}
        ${WaterCard(state)}
        <div style="margin-top:8px;">
          ${BLOCKS.map(b => BlockSection(b, doneHabits, wakeTime)).join('')}
        </div>
      </div>`;
  },
};
