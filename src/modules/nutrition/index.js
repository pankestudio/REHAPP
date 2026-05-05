// src/modules/nutrition/index.js
import { SUPPLEMENTS, TIMING_LABELS, PERSONA_LABEL, INTERACTIONS_NOTE } from '../../data/supplements/kmoe_crps.js';

function EatingWindowCard(state) {
  const mode  = state.fasting?.mode ?? '16:8';
  const start = state.fasting?.startTime;

  if (mode === '100h' && state.fasting?.running) {
    return `
      <div class="card" style="border-color:var(--action-orange);">
        <span class="u-label" style="margin-bottom:8px;">Essensfenster · 100h Kickstart</span>
        <div style="font-size:0.85rem;font-weight:800;color:var(--action-orange);margin-bottom:6px;">
          Essensfenster geschlossen
        </div>
        <div style="font-size:0.7rem;color:var(--text-dim);line-height:1.5;">
          D3/K2 und Omega-3 erst beim Fastenbrechen — brauchen Fett für die Aufnahme.<br>
          Alle anderen Supplements wie gewohnt.
        </div>
      </div>`;
  }

  const eatStartStr = state.settings?.eatStart ?? '12:00';
  const [cH, cM]    = eatStartStr.split(':').map(Number);
  const windowWidth  = (8 * 60 / (24 * 60)) * 100; // 8h eating window, always 33.33%

  const nowDate = new Date();
  const nowMin  = nowDate.getHours() * 60 + nowDate.getMinutes();
  const nowPct  = (nowMin / (24 * 60)) * 100;

  let windowStart, windowEnd, isOpen, windowLeft, statusLabel;

  if (start) {
    // Fasten läuft — tatsächliches Fenster aus Startzeit berechnen
    const fastEnd = new Date(start + 16 * 3600 * 1000);
    const eatEnd  = new Date(start + 24 * 3600 * 1000);
    windowStart   = fastEnd.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    windowEnd     = eatEnd.toLocaleTimeString('de-DE',  { hour: '2-digit', minute: '2-digit' });
    const now     = Date.now();
    isOpen        = now >= fastEnd.getTime() && now < eatEnd.getTime();
    statusLabel   = isOpen ? 'Offen' : 'Geschlossen';
    const wsMin   = fastEnd.getHours() * 60 + fastEnd.getMinutes();
    windowLeft    = (wsMin / (24 * 60)) * 100;
  } else {
    // Kein Fasten aktiv — konfiguriertes Fenster anzeigen
    const startMin  = cH * 60 + cM;
    const endMin    = startMin + 8 * 60;
    const eH        = Math.floor(endMin / 60) % 24;
    const eM        = endMin % 60;
    windowStart     = eatStartStr;
    windowEnd       = `${String(eH).padStart(2, '0')}:${String(eM).padStart(2, '0')}`;
    isOpen          = nowMin >= startMin && nowMin < endMin % (24 * 60);
    statusLabel     = isOpen ? 'Offen' : 'Geplant';
    windowLeft      = (startMin / (24 * 60)) * 100;
  }

  const dotColor = isOpen ? '#22c55e' : 'var(--text-dim)';

  return `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <span class="u-label" style="margin:0;">Essensfenster · 16:8</span>
        <div style="display:flex;align-items:center;gap:6px;">
          <div style="width:8px;height:8px;border-radius:50%;background:${dotColor};"></div>
          <span style="font-size:0.65rem;font-weight:800;color:${dotColor};">${statusLabel}</span>
        </div>
      </div>
      <div style="font-size:0.85rem;font-weight:800;margin-bottom:10px;">
        ${windowStart} — ${windowEnd}
      </div>
      <div style="position:relative;height:6px;background:var(--border);border-radius:1px;margin-bottom:6px;">
        <div style="position:absolute;left:${windowLeft.toFixed(1)}%;width:${windowWidth.toFixed(1)}%;height:100%;
          background:var(--text-main);border-radius:1px;opacity:${isOpen ? '1' : '0.3'};"></div>
        <div style="position:absolute;left:${nowPct.toFixed(1)}%;top:-4px;width:2px;height:14px;
          background:var(--action-orange);transform:translateX(-50%);"></div>
      </div>
      <div style="display:flex;justify-content:space-between;">
        <span style="font-size:0.6rem;color:var(--text-dim);">00:00</span>
        <span style="font-size:0.6rem;color:var(--action-orange);font-weight:800;">jetzt</span>
        <span style="font-size:0.6rem;color:var(--text-dim);">24:00</span>
      </div>
    </div>`;
}

function SupplementCard(supp, done, fastingActive, mode) {
  const blocked = !supp.fastingOk && fastingActive && mode === '100h';

  return `
    <div class="card" style="padding:14px 16px;
      ${blocked ? 'opacity:0.35;' : ''}
      ${done    ? 'opacity:0.4;'  : ''}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
        <div style="flex:1;">
          <div style="font-weight:800;font-size:0.85rem;
            ${done ? 'text-decoration:line-through;' : ''}">
            ${supp.label}
          </div>
          <div style="font-size:0.65rem;color:var(--text-dim);margin-top:3px;">${supp.detail}</div>
          ${supp.warning ? `
            <div style="font-size:0.6rem;color:var(--stop-red);margin-top:4px;font-weight:800;">
              ⚠ ${supp.warning}
            </div>` : ''}
          ${blocked ? `
            <div style="font-size:0.6rem;color:var(--action-orange);margin-top:4px;font-weight:800;">
              Erst beim Fastenbrechen (braucht Fett)
            </div>` : ''}
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
          <span class="u-mono" style="font-size:0.65rem;color:var(--text-dim);">+${supp.xp} XP</span>
          ${done
            ? `<div style="width:28px;height:28px;border:1.5px solid var(--border);
                 display:flex;align-items:center;justify-content:center;font-size:0.8rem;">✓</div>`
            : blocked
              ? `<div style="width:28px;height:28px;border:1.5px solid var(--border);
                   display:flex;align-items:center;justify-content:center;
                   font-size:0.65rem;color:var(--text-dim);">—</div>`
              : `<button data-action="take-supplement" data-id="${supp.id}"
                   style="width:28px;height:28px;background:var(--text-main);color:var(--bg);
                          border:none;font-size:0.8rem;font-weight:800;cursor:pointer;">✓</button>`
          }
        </div>
      </div>
      ${!done && !blocked ? `
        <div style="font-size:0.6rem;color:var(--text-dim);margin-top:8px;
          padding-top:8px;border-top:1px solid var(--border);line-height:1.4;">
          ${supp.note}
        </div>` : ''}
    </div>`;
}

function ProgressBar(done, total) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;">
      <div style="flex:1;height:4px;background:var(--border);border-radius:1px;">
        <div style="height:100%;width:${pct}%;background:var(--text-main);
          transition:width 0.6s ease;border-radius:1px;"></div>
      </div>
      <span class="u-mono" style="font-size:0.65rem;color:var(--text-dim);min-width:48px;text-align:right;">
        ${done}/${total} heute
      </span>
    </div>`;
}

export const NutritionModul = {
  id:    'nutrition',
  label: 'Ernährung',

  view(state) {
    const doneSupplements = state.doneSupplements ?? {};
    const fastingActive   = state.fasting?.running ?? false;
    const mode            = state.fasting?.mode ?? '16:8';

    const doneCount  = SUPPLEMENTS.filter(s => doneSupplements[s.id]).length;
    const totalCount = SUPPLEMENTS.length;

    const timings  = ['fasting', 'meal', 'topical_morning', 'topical_evening', 'evening'];
    const sections = timings.map(timing => {
      const group = SUPPLEMENTS.filter(s => s.timing === timing);
      if (!group.length) return '';
      return `
        <div style="margin-bottom:4px;">
          <span class="u-label" style="margin-bottom:8px;">${TIMING_LABELS[timing]}</span>
          ${group.map(s => SupplementCard(s, !!doneSupplements[s.id], fastingActive, mode)).join('')}
        </div>`;
    }).join('');

    return `
      <div style="padding-bottom:100px;">
        <div style="margin-bottom:16px;">
          <span class="u-label" style="margin-bottom:4px;">Protokoll</span>
          <div style="font-size:0.75rem;font-weight:800;color:var(--text-dim);">${PERSONA_LABEL}</div>
        </div>

        ${ProgressBar(doneCount, totalCount)}
        ${EatingWindowCard(state)}
        ${sections}

        <div style="margin-top:8px;padding:14px 16px;border:1px solid var(--border);font-size:0.65rem;
          color:var(--text-dim);line-height:1.6;">
          <span style="font-weight:800;display:block;margin-bottom:4px;">Wechselwirkungen</span>
          ${INTERACTIONS_NOTE}
        </div>
        <div style="margin-top:6px;padding:14px 16px;border:1px solid var(--border);font-size:0.65rem;
          color:var(--text-dim);line-height:1.6;">
          <span style="font-weight:800;display:block;margin-bottom:4px;">Hinweis</span>
          Capsaicin + DMSO/Diclofenac-Rezeptur nur mit Arzt/Rezept — nicht in dieser Liste.
        </div>
      </div>`;
  },
};
