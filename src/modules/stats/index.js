// src/modules/stats/index.js
import { Store }        from '../../core/Store.js';
import { ACHIEVEMENTS } from '../../core/achievements.js';

function StreakCard(state) {
  const current = state.streaks.current;
  const longest = state.longestStreak ?? current;
  return `
    <div class="card">
      <span class="u-label" style="margin-bottom:12px;">Streaks</span>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
        <div style="text-align:center;padding:16px 10px;border:1px solid var(--border);">
          <div class="u-mono" style="font-size:2.4rem;font-weight:700;letter-spacing:-0.03em;line-height:1;">${current}</div>
          <div class="u-label" style="font-size:0.6rem;margin-top:6px;">Aktuell</div>
        </div>
        <div style="text-align:center;padding:16px 10px;border:1px solid var(--border);">
          <div class="u-mono" style="font-size:2.4rem;font-weight:700;letter-spacing:-0.03em;line-height:1;">${longest}</div>
          <div class="u-label" style="font-size:0.6rem;margin-top:6px;">Rekord</div>
        </div>
      </div>
      <span class="u-label" style="margin-bottom:8px;">Letzte 14 Tage</span>
      <div id="activity-dots" style="display:flex;gap:4px;">
        ${Array(14).fill(0).map(() =>
          `<div style="flex:1;height:24px;background:var(--border);border-radius:2px;"></div>`
        ).join('')}
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
        ${AchievementsCard(state)}
      </div>`;
  },

  async _enrich() {
    const dotsEl = document.getElementById('activity-dots');
    if (dotsEl) {
      const log    = await Store.getActivityLog(14);
      const byDate = {};
      log.forEach(e => { byDate[e.date] = true; });
      const days = Array.from({ length: 14 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (13 - i));
        return d.toDateString();
      });
      dotsEl.innerHTML = days.map(d => `
        <div style="flex:1;height:24px;border-radius:2px;
          background:${byDate[d] ? 'var(--text-main)' : 'var(--border)'};
          transition:background 0.3s;">
        </div>`).join('');
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
