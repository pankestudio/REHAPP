// src/core/ReminderService.js
import { Store } from './Store.js';

export const REMINDERS = [
  {
    id:          'water',
    label:       'Wasser trinken',
    sub:         'Alle 60 Min',
    type:        'interval',
    intervalMin: 60,
  },
  {
    id:         'toes',
    label:      'Zehenübungen',
    sub:        '09:00 · 13:00 · 17:00',
    type:       'times',
    times:      ['09:00', '13:00', '17:00'],
    protocolId: 'toes',
  },
  {
    id:          'breath',
    label:       'Atemübung',
    sub:         'Alle 2 Stunden',
    type:        'interval',
    intervalMin: 120,
    protocolId:  'breath',
  },
  {
    id:         'lymph',
    label:      'Lymphdrainage',
    sub:        '09:30 · 15:30',
    type:       'times',
    times:      ['09:30', '15:30'],
    protocolId: 'mld',
  },
];

const _intervals  = {};
const _firedToday = {};
let   _clockId    = null;

export const ReminderService = {
  start() {
    this._apply();
    this._startClock();
    Store.subscribe('settings', () => this._apply());
  },

  _apply() {
    for (const id of Object.keys(_intervals)) {
      clearInterval(_intervals[id]);
      delete _intervals[id];
    }
    const enabled = Store.state.settings?.reminders ?? {};
    for (const r of REMINDERS) {
      if (!enabled[r.id] || r.type !== 'interval') continue;
      _intervals[r.id] = setInterval(() => this._fire(r), r.intervalMin * 60_000);
    }
  },

  _startClock() {
    if (_clockId) return;
    _clockId = setInterval(() => {
      const now   = new Date();
      const today = now.toDateString();
      const hhmm  = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const enabled = Store.state.settings?.reminders ?? {};
      for (const r of REMINDERS) {
        if (!enabled[r.id] || r.type !== 'times') continue;
        if (!r.times.includes(hhmm)) continue;
        const key = `${r.id}-${hhmm}-${today}`;
        if (_firedToday[key]) continue;
        _firedToday[key] = true;
        this._fire(r);
      }
    }, 60_000);
  },

  _fire(r) {
    this._showToast(r);
    navigator.serviceWorker?.controller?.postMessage({
      type:    'LOCAL_REMINDER',
      payload: { title: 'REHAPP', body: r.label, tag: `reminder-${r.id}` },
    });
  },

  _showToast(r) {
    document.getElementById('reminder-toast')?.remove();
    const el = document.createElement('div');
    el.id = 'reminder-toast';
    el.innerHTML = `
      <div style="position:fixed;bottom:calc(80px + var(--safe-bot));left:16px;right:16px;z-index:1500;
        background:var(--text-main);color:var(--bg);padding:14px 16px;
        border-radius:var(--radius-sm);display:flex;justify-content:space-between;align-items:center;
        gap:12px;box-shadow:0 4px 20px rgba(0,0,0,0.25);">
        <div style="min-width:0;">
          <div style="font-weight:var(--fw-black);font-size:0.75rem;letter-spacing:var(--ls-upper);
            text-transform:uppercase;">${r.label}</div>
          <div style="font-size:0.62rem;opacity:0.6;margin-top:2px;">${r.sub}</div>
        </div>
        <div style="display:flex;gap:8px;flex-shrink:0;">
          ${r.protocolId ? `
            <button data-action="start-protocol" data-id="${r.protocolId}"
              style="background:var(--action-orange);border:none;color:#fff;padding:8px 12px;
                font-size:0.6rem;font-weight:var(--fw-black);text-transform:uppercase;
                letter-spacing:var(--ls-upper);cursor:pointer;">▶ Start</button>` : ''}
          <button id="reminder-dismiss"
            style="background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);
              color:inherit;padding:8px 12px;font-size:0.6rem;font-weight:var(--fw-black);
              text-transform:uppercase;letter-spacing:var(--ls-upper);cursor:pointer;">✕</button>
        </div>
      </div>`;
    document.body.appendChild(el);
    document.getElementById('reminder-dismiss').addEventListener('click', () => el.remove());
    setTimeout(() => el.remove(), 12_000);
  },
};
