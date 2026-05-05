// src/modules/settings/index.js
import { REMINDERS } from '../../core/ReminderService.js';

export const SettingsModul = {
  id:    'settings',
  label: 'Setup',

  view(state) {
    const s      = state.settings;
    const rem    = s.reminders ?? {};
    const theme  = s.theme ?? 'system';

    const reminderRows = REMINDERS.map((r, i) => {
      const on   = !!rem[r.id];
      const last = i === REMINDERS.length - 1;
      return `
        <div style="display:flex;align-items:center;gap:12px;padding:12px 0;
          ${last ? '' : 'border-bottom:1px solid var(--border);'}">
          <div style="flex:1;min-width:0;">
            <div style="font-weight:var(--fw-bold);font-size:0.82rem;">${r.label}</div>
            <div style="font-size:0.6rem;color:var(--text-dim);margin-top:2px;">${r.sub}</div>
          </div>
          <button data-action="toggle-reminder" data-id="${r.id}"
            style="flex-shrink:0;width:42px;height:24px;border-radius:12px;border:none;cursor:pointer;
              background:${on ? 'var(--text-main)' : 'var(--border)'};position:relative;">
            <span style="position:absolute;top:3px;left:${on ? '21px' : '3px'};
              width:18px;height:18px;background:${on ? 'var(--bg)' : 'var(--surface)'};
              border-radius:50%;"></span>
          </button>
        </div>`;
    }).join('');

    return `
      <div>
        <div class="card">
          <span class="u-label">Konfiguration</span>
          <div style="margin-top:12px;">
            <label class="u-label" style="font-size:0.6rem;">Nutzername</label>
            <input
              type="text"
              id="set-name"
              value="${s.userName}"
              autocomplete="off"
              style="width:100%;border:1.5px solid var(--border);background:var(--bg);
                     color:var(--text-main);padding:10px;outline:none;
                     font-family:inherit;font-size:1rem;margin-bottom:20px;">

            <label class="u-label" style="font-size:0.6rem;">Aufwachzeit</label>
            <input
              type="time"
              id="set-wakeup"
              value="${s.wakeTime ?? '07:00'}"
              style="width:100%;border:1.5px solid var(--border);background:var(--bg);
                     color:var(--text-main);padding:10px;outline:none;
                     font-family:inherit;font-size:1rem;margin-bottom:20px;">

            <label class="u-label" style="font-size:0.6rem;">Essensfenster Start · 16:8</label>
            <input
              type="time"
              id="set-eatstart"
              value="${s.eatStart ?? '12:00'}"
              style="width:100%;border:1.5px solid var(--border);background:var(--bg);
                     color:var(--text-main);padding:10px;outline:none;
                     font-family:inherit;font-size:1rem;margin-bottom:6px;">
            <div style="font-size:0.6rem;color:var(--text-dim);margin-bottom:20px;">
              ${(() => {
                const [h, m] = (s.eatStart ?? '12:00').split(':').map(Number);
                const endMin = h * 60 + m + 8 * 60;
                const eH = String(Math.floor(endMin / 60) % 24).padStart(2, '0');
                const eM = String(endMin % 60).padStart(2, '0');
                const fastH = String((h - 16 + 24) % 24).padStart(2, '0');
                const fastM = String(m).padStart(2, '0');
                return `Fasten ${fastH}:${fastM} — ${s.eatStart ?? '12:00'} · Essen bis ${eH}:${eM}`;
              })()}
            </div>

            <label class="u-label" style="font-size:0.6rem;">Schriftgröße</label>
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
              <input
                type="range"
                id="set-size"
                min="14" max="20"
                value="${s.fontSize}"
                style="flex:1;">
              <span class="u-mono" style="font-size:0.75rem;min-width:32px;">${s.fontSize}px</span>
            </div>

            <label class="u-label" style="font-size:0.6rem;">Theme</label>
            <div style="display:flex;gap:8px;">
              ${['light','dark','system'].map(t => `
                <button data-action="set-theme" data-value="${t}"
                  style="flex:1;padding:12px;border:1.5px solid var(--border);cursor:pointer;
                         font-size:0.7rem;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;
                         background:${theme === t ? 'var(--text-main)' : 'transparent'};
                         color:${theme === t ? 'var(--bg)' : 'var(--text-dim)'};">
                  ${t === 'light' ? 'Hell' : t === 'dark' ? 'Dunkel' : 'Auto'}
                </button>`).join('')}
            </div>
          </div>
        </div>

        <div class="card" style="padding:0 20px;">
          <div style="padding:16px 0 4px;">
            <span class="u-label" style="margin:0;">Erinnerungen</span>
          </div>
          ${reminderRows}
          <div style="padding-bottom:4px;"></div>
        </div>
      </div>`;
  },
};
