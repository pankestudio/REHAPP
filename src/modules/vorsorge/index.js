// src/modules/vorsorge/index.js
import { SCREENINGS } from '../../data/screenings.js';

function monthsSince(dateISO) {
  if (!dateISO) return Infinity;
  const diff = Date.now() - new Date(dateISO).getTime();
  return diff / (1000 * 60 * 60 * 24 * 30.44);
}

function nextDueDate(dateISO, intervalMonths) {
  if (!dateISO) return null;
  const d = new Date(dateISO);
  d.setMonth(d.getMonth() + intervalMonths);
  return d;
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
}

function ScreeningCard(screening, lastDate, overdue) {
  const next   = nextDueDate(lastDate, screening.intervalMonths);
  const nextFmt = next ? formatDate(next.toISOString().slice(0, 10)) : null;
  const today  = new Date().toISOString().slice(0, 10);
  const doneToday = lastDate === today;

  return `
    <div class="card" style="padding:14px 20px;margin-bottom:8px;
      ${overdue ? 'border-left:3px solid var(--text-main);' : ''}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">
        <div style="flex:1;min-width:0;padding-right:12px;">
          <div style="font-weight:var(--fw-bold);font-size:0.85rem;">${screening.label}</div>
          <div style="font-size:0.6rem;color:var(--text-dim);margin-top:2px;">${screening.desc}</div>
        </div>
        ${overdue
          ? `<span style="font-size:0.55rem;font-weight:800;text-transform:uppercase;
              letter-spacing:0.06em;color:var(--text-main);flex-shrink:0;">FÄLLIG</span>`
          : ''}
      </div>
      <div style="display:flex;justify-content:space-between;font-size:0.6rem;
        color:var(--text-dim);margin-bottom:10px;">
        <span>Zuletzt: <strong>${formatDate(lastDate)}</strong></span>
        ${nextFmt ? `<span>Nächste: <strong>${nextFmt}</strong></span>` : ''}
      </div>
      ${doneToday
        ? `<div style="font-size:0.65rem;color:var(--text-dim);font-style:italic;padding:8px 0;">
            ✓ Heute eingetragen
           </div>`
        : `<button data-action="log-screening" data-id="${screening.id}"
            style="width:100%;padding:10px;border:1.5px solid var(--border);background:transparent;
              font-size:0.65rem;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;
              cursor:pointer;color:var(--text-main);touch-action:manipulation;">
            Heute gemacht
           </button>`}
    </div>`;
}

function ProfileMissing() {
  return `
    <div class="card">
      <span class="u-label" style="margin-bottom:8px;">Profil unvollständig</span>
      <div style="font-size:0.75rem;color:var(--text-dim);line-height:1.55;margin-bottom:16px;">
        Für personalisierte Vorsorge-Empfehlungen bitte Geburtsjahr und Geschlecht im
        <strong>Setup</strong> ergänzen.
      </div>
      <button data-action="set-view" data-value="settings" class="btn-primary">
        Zum Setup →
      </button>
    </div>`;
}

export const VorsorgeModul = {
  id:    'vorsorge',
  label: 'Vorsorge',

  view(state) {
    const log       = state.vorsorgeLog ?? {};
    const settings  = state.settings ?? {};
    const birthYear = settings.birthYear ? parseInt(settings.birthYear) : null;
    const gender    = settings.gender ?? null;

    if (!birthYear || !gender) {
      return `
        <div style="padding-bottom:100px;">
          ${ProfileMissing()}
        </div>`;
    }

    const ageYears = new Date().getFullYear() - birthYear;
    const today    = new Date().toISOString().slice(0, 10);

    const applicable = SCREENINGS.filter(s => {
      if (s.fromAge > ageYears) return false;
      if (s.toAge && s.toAge < ageYears) return false;
      if (s.gender !== 'all' && s.gender !== gender) return false;
      return true;
    });

    const overdue  = applicable.filter(s => monthsSince(log[s.id]) > s.intervalMonths);
    const upcoming = applicable.filter(s => {
      const ms = monthsSince(log[s.id]);
      return ms <= s.intervalMonths && ms > s.intervalMonths * 0.75;
    });
    const ok       = applicable.filter(s => monthsSince(log[s.id]) <= s.intervalMonths * 0.75);

    const overdueCards  = overdue.map(s => ScreeningCard(s, log[s.id] ?? null, true)).join('');
    const upcomingCards = upcoming.map(s => ScreeningCard(s, log[s.id] ?? null, false)).join('');
    const okCards       = ok.map(s => ScreeningCard(s, log[s.id] ?? null, false)).join('');

    const doneCount = applicable.filter(s => {
      const ms = monthsSince(log[s.id]);
      return ms <= s.intervalMonths;
    }).length;

    return `
      <div style="padding-bottom:100px;">
        <div class="card" style="padding:14px 20px;margin-bottom:16px;">
          <span class="u-label" style="margin-bottom:8px;">Vorsorge</span>
          <div style="display:flex;align-items:flex-end;gap:20px;">
            <div>
              <div class="u-mono" style="font-size:2.4rem;font-weight:800;letter-spacing:-0.04em;line-height:1;">
                ${doneCount}/${applicable.length}
              </div>
              <div style="font-size:0.6rem;color:var(--text-dim);margin-top:4px;text-transform:uppercase;
                font-weight:800;letter-spacing:0.08em;">aktuell</div>
            </div>
          </div>
          <div style="margin-top:12px;height:3px;background:var(--border);border-radius:1px;">
            <div style="height:100%;width:${applicable.length ? Math.round(doneCount/applicable.length*100) : 0}%;
              background:var(--text-main);border-radius:1px;transition:width 0.4s ease;"></div>
          </div>
        </div>

        ${overdue.length ? `
          <div class="u-label" style="margin-bottom:8px;">Fällig</div>
          ${overdueCards}` : ''}

        ${upcoming.length ? `
          <div class="u-label" style="margin-bottom:8px;margin-top:${overdue.length ? '16px' : '0'};">Bald fällig</div>
          ${upcomingCards}` : ''}

        ${ok.length ? `
          <div class="u-label" style="margin-bottom:8px;margin-top:${(overdue.length || upcoming.length) ? '16px' : '0'};">Aktuell</div>
          ${okCards}` : ''}
      </div>`;
  },
};
