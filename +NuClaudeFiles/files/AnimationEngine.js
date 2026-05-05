// src/core/AnimationEngine.js
// Rams-Prinzip: Bewegung kommuniziert Funktion — keine Dekoration.
// Kein externes Framework. Web Animations API + CSS transitions.

export const AnimationEngine = {

  // ── XP-Bar smooth updaten ─────────────────────────────────────────────────
  updateXPBar(xp) {
    const bar   = document.querySelector('#xp-bar-fill');
    const label = document.querySelector('#xp-label');
    if (!bar) return;
    const pct = xp % 100;
    bar.style.transition = 'width 0.9s cubic-bezier(0.25, 0, 0, 1)';
    bar.style.width = pct + '%';
    if (label) label.textContent = xp + ' XP';
  },

  // ── Habit abhaken ─────────────────────────────────────────────────────────
  checkHabit(habitId) {
    const card = document.querySelector(`[data-habit-id="${habitId}"]`);
    if (!card) return;
    const btn = card.querySelector('[data-action="tap-habit"], [data-action="start-protocol"]');
    if (btn) {
      btn.textContent = '×';
      btn.style.transition = 'all 0.25s ease';
      btn.style.background = 'var(--text-main)';
      btn.style.color = 'var(--bg)';
      btn.style.borderColor = 'var(--text-main)';
    }
    // Karte dimmt nach kurzer Verzögerung
    setTimeout(() => {
      card.style.transition = 'opacity 0.4s ease';
      card.style.opacity = '0.35';
    }, 280);
  },

  // ── Supplement abhaken ────────────────────────────────────────────────────
  checkSupplement(suppId) {
    const card = document.querySelector(`[data-supp-id="${suppId}"]`);
    if (!card) return;
    const btn = card.querySelector('[data-action="take-supplement"]');
    if (btn) {
      btn.textContent = '×';
      btn.style.background = 'var(--text-main)';
      btn.style.color = 'var(--bg)';
    }
    setTimeout(() => {
      card.style.transition = 'opacity 0.4s ease';
      card.style.opacity = '0.35';
    }, 280);
  },

  // ── Achievement Notification ───────────────────────────────────────────────
  // Kein Feuerwerk. Ein Ring der sich füllt. Das war's.
  showAchievement(achievement) {
    document.getElementById('achievement-toast')?.remove();

    const CIRC = 2 * Math.PI * 13;
    const el   = document.createElement('div');
    el.id      = 'achievement-toast';
    el.innerHTML = `
      <div style="
        position:fixed;top:calc(var(--safe-top) + 10px);left:12px;right:12px;
        background:var(--surface);border:1px solid var(--text-main);
        padding:14px 16px;z-index:3000;
        display:flex;align-items:center;gap:14px;
        opacity:0;transform:translateY(-6px);
        transition:opacity 0.25s ease, transform 0.25s ease;
      " id="achievement-toast-inner">
        <div style="position:relative;width:32px;height:32px;flex-shrink:0;">
          <svg viewBox="0 0 32 32" width="32" height="32"
            style="position:absolute;inset:0;transform:rotate(-90deg);">
            <circle cx="16" cy="16" r="13" fill="none"
              stroke="var(--border)" stroke-width="1"/>
            <circle id="ach-ring-stroke" cx="16" cy="16" r="13" fill="none"
              stroke="var(--text-main)" stroke-width="1.5"
              stroke-dasharray="0 ${CIRC.toFixed(2)}"
              style="transition:stroke-dasharray 1s linear;"/>
          </svg>
        </div>
        <div style="flex:1;">
          <div style="font-size:0.6rem;font-weight:800;letter-spacing:0.1em;
            text-transform:uppercase;color:var(--text-dim);margin-bottom:3px;">
            Erfolg
          </div>
          <div style="font-size:0.85rem;font-weight:800;color:var(--text-main);">
            ${achievement.title}
          </div>
          <div style="font-size:0.65rem;color:var(--text-dim);margin-top:2px;">
            ${achievement.desc}${achievement.xp ? ` · +${achievement.xp} XP` : ''}
          </div>
        </div>
      </div>`;

    document.body.appendChild(el);

    // Einblenden
    requestAnimationFrame(() => {
      const inner = document.getElementById('achievement-toast-inner');
      if (inner) { inner.style.opacity = '1'; inner.style.transform = 'translateY(0)'; }
      // Ring füllt sich
      setTimeout(() => {
        const ring = document.getElementById('ach-ring-stroke');
        if (ring) ring.setAttribute('stroke-dasharray', `${CIRC.toFixed(2)} ${CIRC.toFixed(2)}`);
      }, 100);
    });

    // Ausblenden
    setTimeout(() => {
      const inner = document.getElementById('achievement-toast-inner');
      if (inner) { inner.style.opacity = '0'; inner.style.transform = 'translateY(-6px)'; }
      setTimeout(() => el.remove(), 300);
    }, 4000);
  },

  // ── Protokoll abgeschlossen ────────────────────────────────────────────────
  showProtocolComplete(title, xp) {
    const overlay = document.getElementById('exercise-overlay');
    if (!overlay) return;
    // Step-Name durch Abschluss-Zeile ersetzen, kein neues Overlay
    const timerEl = document.getElementById('exercise-timer-display');
    const stepEl  = overlay.querySelector('[id="exercise-step-name"]');
    if (timerEl) {
      timerEl.style.transition = 'opacity 0.3s ease';
      timerEl.style.opacity    = '0';
      setTimeout(() => {
        timerEl.textContent     = '×';
        timerEl.style.fontSize  = '2rem';
        timerEl.style.opacity   = '1';
      }, 300);
    }
    // XP einblenden
    const xpEl = document.getElementById('protocol-xp-display');
    if (xpEl) {
      setTimeout(() => {
        xpEl.style.transition = 'opacity 0.4s ease';
        xpEl.style.opacity    = '1';
      }, 500);
    }
    // Overlay nach 1.5s schließen
    setTimeout(() => overlay.remove(), 1800);
  },

  // ── Timer Ring updaten (jede Sekunde) ─────────────────────────────────────
  updateTimerRing(remaining, total) {
    const ring = document.getElementById('exercise-ring');
    if (!ring) return;
    const CIRC = 2 * Math.PI * 40;
    const pct  = remaining / total;
    ring.setAttribute('stroke-dasharray',
      `${(pct * CIRC).toFixed(2)} ${CIRC.toFixed(2)}`);
    // Letzte 3 Sekunden: Ring wird heller (nicht rot — Rams mag kein Alarm-Rot)
    ring.style.opacity = remaining <= 3 ? '0.4' : '1';
  },

  // ── Atem-Kreis Phase ─────────────────────────────────────────────────────
  setBreathPhase(phase) {
    const dot   = document.getElementById('breath-dot');
    const label = document.getElementById('breath-label');
    if (!dot) return;

    const config = {
      in:   { size: '36px', opacity: '0.9', dur: '1.1s', label: 'Einatmen'  },
      out:  { size: '6px',  opacity: '0.3', dur: '0.9s', label: 'Ausatmen'  },
      hold: { size: '20px', opacity: '0.6', dur: '0.3s', label: 'Halten'    },
      null: { size: '16px', opacity: '0.5', dur: '0.3s', label: ''          },
    };

    const c = config[phase] ?? config['null'];
    dot.style.transition      = `all ${c.dur} ease`;
    dot.style.width            = c.size;
    dot.style.height           = c.size;
    dot.style.opacity          = c.opacity;
    if (label) label.textContent = c.label;
  },
};
