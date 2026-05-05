// src/ui/Templates.js

const NAV_ICONS = {
  home:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  protocols: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  nutrition: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>',
  stats:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
  settings:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
};

export const NavTemplate = (activeView, modules) => `
  <nav class="bottom-nav">
    ${modules.map(m => `
      <button data-action="set-view" data-value="${m.id}"
        class="nav-btn ${activeView === m.id ? 'active' : ''}">
        <span class="nav-icon">${NAV_ICONS[m.id] ?? ''}</span>
        <span class="nav-label">${m.label}</span>
      </button>
    `).join('')}
  </nav>`;

export const ExerciseOverlayTemplate = (protocol, stepIndex, time) => {
  const isLast  = stepIndex === protocol.steps.length - 1;
  const pct     = Math.round((stepIndex / protocol.steps.length) * 100);
  const CIRC    = 2 * Math.PI * 40;
  const step    = protocol.steps[stepIndex];
  const hasBreath = !!step.phase;

  return `
  <div id="exercise-overlay" style="
    position:fixed;inset:0;background:var(--bg);z-index:1000;
    padding:var(--safe-top) 24px calc(var(--safe-bot) + 24px);
    display:flex;flex-direction:column;">

    <!-- 1px Fortschrittsbalken oben -->
    <div style="position:absolute;top:0;left:0;right:0;height:1px;background:var(--border);">
      <div style="height:1px;width:${pct}%;background:var(--text-main);transition:width 0.5s linear;"></div>
    </div>

    <!-- Header -->
    <div style="display:flex;justify-content:space-between;align-items:center;
      padding-top:calc(var(--safe-top) + 8px);margin-bottom:32px;">
      <div>
        <div style="font-size:0.6rem;font-weight:800;letter-spacing:0.1em;
          text-transform:uppercase;color:var(--text-dim);">
          ${protocol.title}
        </div>
        <div style="font-size:0.6rem;color:var(--text-dim);margin-top:3px;">
          ${stepIndex + 1} / ${protocol.steps.length}
        </div>
      </div>
      <button data-action="stop-exercise" style="
        background:none;border:1px solid var(--border);
        padding:6px 14px;font-size:0.6rem;font-weight:800;
        letter-spacing:0.08em;text-transform:uppercase;
        color:var(--text-dim);cursor:pointer;">
        —
      </button>
    </div>

    <!-- Ring + Timer -->
    <div style="flex:1;display:flex;flex-direction:column;
      align-items:center;justify-content:center;text-align:center;">

      <div style="position:relative;width:96px;height:96px;margin-bottom:28px;">
        <svg viewBox="0 0 96 96" width="96" height="96"
          style="position:absolute;inset:0;transform:rotate(-90deg);">
          <circle cx="48" cy="48" r="40" fill="none"
            stroke="var(--border)" stroke-width="1"/>
          <circle id="exercise-ring" cx="48" cy="48" r="40" fill="none"
            stroke="var(--text-main)" stroke-width="1.5"
            stroke-linecap="butt"
            stroke-dasharray="${CIRC.toFixed(2)} ${CIRC.toFixed(2)}"/>
        </svg>
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;">
          <span id="exercise-timer-display" class="u-mono" style="
            font-size:28px;font-weight:400;
            letter-spacing:-0.03em;
            color:var(--text-main);
            transition:opacity 0.3s ease;">
            ${time}s
          </span>
        </div>
      </div>

      <div id="exercise-step-name" style="
        font-size:1.1rem;font-weight:800;
        letter-spacing:-0.02em;
        color:var(--text-main);
        margin-bottom:10px;">
        ${step.title}
      </div>

      <div style="font-size:0.65rem;color:var(--text-dim);min-height:16px;">
        ${!isLast ? protocol.steps[stepIndex + 1].title : ''}
      </div>

      ${hasBreath ? `
        <div style="margin-top:24px;display:flex;flex-direction:column;align-items:center;gap:10px;">
          <div id="breath-dot" style="
            width:16px;height:16px;border-radius:50%;
            background:var(--text-main);opacity:0.5;
            transition:all 0.4s ease;"></div>
          <div id="breath-label" style="
            font-size:0.6rem;font-weight:800;letter-spacing:0.1em;
            text-transform:uppercase;color:var(--text-dim);"></div>
        </div>` : ''}

      <div id="protocol-xp-display" style="
        margin-top:20px;
        font-size:0.7rem;font-weight:800;letter-spacing:0.08em;
        text-transform:uppercase;color:var(--text-dim);
        opacity:0;">
        +${protocol.xp ?? 15} XP
      </div>
    </div>

    <!-- Buttons -->
    <div style="display:flex;gap:8px;">
      <button data-action="skip-step" style="
        flex:1;border:1px solid var(--border);background:transparent;
        padding:14px;font-size:0.6rem;font-weight:800;
        letter-spacing:0.08em;text-transform:uppercase;
        cursor:pointer;color:var(--text-dim);">
        ${isLast ? 'Fertig' : 'Überspringen'}
      </button>
      <button data-action="stop-exercise" style="
        flex:1;border:1px solid var(--border);background:transparent;
        padding:14px;font-size:0.6rem;font-weight:800;
        letter-spacing:0.08em;text-transform:uppercase;
        cursor:pointer;color:var(--text-dim);">
        Abbrechen
      </button>
    </div>

  </div>`;
};
