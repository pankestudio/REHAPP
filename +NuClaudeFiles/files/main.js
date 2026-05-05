// src/main.js
import './styles/theme.css';
import { Store }          from './core/Store.js';
import { TimerService }   from './core/TimerService.js';
import { ModuleRegistry } from './core/ModuleRegistry.js';
import * as T             from './ui/Templates.js';

import { HomeModul, HABITS }                from './modules/home/index.js';
import { GamificationEngine }               from './core/GamificationEngine.js';
import { AnimationEngine }                  from './core/AnimationEngine.js';
import { ProtokollModul, protocolsData }    from './modules/protocols/index.js';
import { StatsModul }                       from './modules/stats/index.js';
import { SettingsModul }                    from './modules/settings/index.js';
import { NutritionModul }                   from './modules/nutrition/index.js';

ModuleRegistry
  .register(HomeModul)
  .register(ProtokollModul)
  .register(NutritionModul)
  .register(StatsModul)
  .register(SettingsModul);


// ── Theme ─────────────────────────────────────────────────────────────────────
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme ?? 'system');
}
// ─── Fasting milestones ────────────────────────────────────────────────────────
const FASTING_MILESTONES  = { 12: 50, 16: 80, 18: 100, 24: 150 };
const _notifiedMilestones = new Set();

// ─── Wake Lock ────────────────────────────────────────────────────────────────
let _wakeLock = null;
async function requestWakeLock() {
  if (!('wakeLock' in navigator)) return;
  try { _wakeLock = await navigator.wakeLock.request('screen'); } catch {}
}
function releaseWakeLock() {
  _wakeLock?.release().catch(() => {});
  _wakeLock = null;
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && Store.state?.activeExercise?.running) requestWakeLock();
});

// ─── SW ───────────────────────────────────────────────────────────────────────
async function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' });
    window.addEventListener('focus', () => reg.update());
    reg.addEventListener('updatefound', () => {
      const sw = reg.installing;
      if (!sw) return;
      sw.addEventListener('statechange', () => {
        if (sw.state === 'installed' && navigator.serviceWorker.controller) showUpdateBanner(sw);
      });
    });
  } catch (err) { console.warn('[SW]', err); }
}

function showUpdateBanner(newSW) {
  if (document.getElementById('update-banner')) return;
  const b = document.createElement('div');
  b.id = 'update-banner';
  b.innerHTML = `<div style="position:fixed;bottom:calc(80px + var(--safe-bot));left:0;right:0;
    display:flex;justify-content:space-between;align-items:center;
    background:var(--text-main);color:var(--bg);padding:14px 20px;z-index:2000;
    font-size:0.7rem;font-weight:800;letter-spacing:0.05em;
    border-top:2px solid var(--action-orange);">
    <span>UPDATE VERFÜGBAR</span>
    <button id="apply-update" style="background:var(--action-orange);color:#fff;border:none;
      padding:8px 16px;font-weight:800;font-size:0.65rem;text-transform:uppercase;cursor:pointer;">
      JETZT LADEN</button></div>`;
  document.body.appendChild(b);
  document.getElementById('apply-update').addEventListener('click', () => {
    newSW.postMessage({ type: 'SKIP_WAITING' });
    navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), { once: true });
  });
}

// ─── Install prompt ───────────────────────────────────────────────────────────
let _deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  _deferredInstallPrompt = e;
  if (!window.matchMedia('(display-mode: standalone)').matches) showInstallBanner();
});
function showInstallBanner() {
  if (document.getElementById('install-banner')) return;
  const b = document.createElement('div');
  b.id = 'install-banner';
  b.innerHTML = `<div style="position:fixed;top:0;left:0;right:0;
    display:flex;justify-content:space-between;align-items:center;
    background:var(--surface);border-bottom:2px solid var(--border);
    padding:calc(var(--safe-top) + 10px) 20px 14px;z-index:2000;
    font-size:0.65rem;font-weight:800;letter-spacing:0.05em;color:var(--text-dim);">
    <span>ALS APP INSTALLIEREN</span>
    <div style="display:flex;gap:10px;">
      <button id="dismiss-install" style="background:none;border:1px solid var(--border);
        padding:6px 12px;font-size:0.65rem;font-weight:800;text-transform:uppercase;
        cursor:pointer;color:var(--text-dim);">—</button>
      <button id="confirm-install" style="background:var(--text-main);color:var(--bg);
        border:none;padding:6px 14px;font-size:0.65rem;font-weight:800;
        text-transform:uppercase;cursor:pointer;">INSTALL</button>
    </div></div>`;
  document.body.appendChild(b);
  document.getElementById('confirm-install').addEventListener('click', async () => {
    if (!_deferredInstallPrompt) return;
    _deferredInstallPrompt.prompt();
    const { outcome } = await _deferredInstallPrompt.userChoice;
    if (outcome === 'accepted') b.remove();
    _deferredInstallPrompt = null;
  });
  document.getElementById('dismiss-install').addEventListener('click', () => b.remove());
}

async function requestNotificationPermission() {
  if (!('Notification' in window) || Notification.permission !== 'default') return;
  return Notification.requestPermission();
}

function checkFastingMilestones(s) {
  const hours = Math.floor(s / 3600);
  for (const [h, xp] of Object.entries(FASTING_MILESTONES)) {
    const m = parseInt(h);
    if (hours >= m && !_notifiedMilestones.has(m)) {
      _notifiedMilestones.add(m);
      Store.state.xp += xp;
      Store.logActivity();
      navigator.serviceWorker?.controller?.postMessage({ type: 'FASTING_MILESTONE', payload: { hours: m, xp } });
    }
  }
}

// ─── Steps input overlay ──────────────────────────────────────────────────────
function showStepsInput() {
  if (document.getElementById('steps-overlay')) return;
  const el = document.createElement('div');
  el.id = 'steps-overlay';
  el.innerHTML = `
    <div style="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1500;
      display:flex;align-items:flex-end;">
      <div style="background:var(--surface);width:100%;padding:24px 20px calc(24px + var(--safe-bot));
        border-top:2px solid var(--text-main);">
        <span class="u-label">Schritte eingeben</span>
        <input id="steps-input" type="number" inputmode="numeric"
          placeholder="z.B. 8500"
          style="width:100%;border:1.5px solid var(--border);background:var(--bg);
                 padding:12px;font-size:1.2rem;font-family:inherit;margin:12px 0;
                 outline:none;-webkit-appearance:none;">
        <div style="display:flex;gap:10px;margin-top:4px;">
          <button id="steps-cancel" style="flex:1;border:1.5px solid var(--border);
            background:transparent;padding:14px;font-weight:800;font-size:0.75rem;
            text-transform:uppercase;cursor:pointer;">Abbrechen</button>
          <button id="steps-confirm" class="btn-primary" style="flex:2;">
            Übernehmen
          </button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(el);

  const input = document.getElementById('steps-input');
  input.focus();

  document.getElementById('steps-cancel').addEventListener('click', () => el.remove());
  document.getElementById('steps-confirm').addEventListener('click', () => {
    const val = parseInt(input.value);
    if (!isNaN(val) && val >= 0) {
      const prev     = Store.state.steps ?? 0;
      const added    = Math.max(val - prev, 0);
      const xpGained = Math.floor(added / 1000) * 10;
      Store.state.steps = val;
      if (xpGained > 0) { Store.state.xp += xpGained; Store.logActivity(); }
    }
    el.remove();
  });
}

// ─── Render ───────────────────────────────────────────────────────────────────
const app = document.querySelector('#app');

function render() {
  if (!app || !Store.state) return;
  const { state } = Store;
  ModuleRegistry.activate(state.view);
  app.innerHTML = `
    <div class="app-container">
      <header style="margin-bottom:28px;border-bottom:2px solid var(--text-main);padding-bottom:12px;
        display:flex;justify-content:space-between;align-items:baseline;">
        <h2 class="u-mono" style="font-size:0.8rem;font-weight:800;">REHAPP</h2>
        <span style="font-size:0.65rem;color:var(--text-dim);font-weight:800;">
          ${state.settings.userName || 'SYSTEM-USER'}
        </span>
      </header>
      ${ModuleRegistry.renderView(state.view, state)}
      ${T.NavTemplate(state.view, ModuleRegistry.getNavItems())}
    </div>`;
  document.documentElement.style.fontSize = `${state.settings.fontSize}px`;
}

// ─── Events ───────────────────────────────────────────────────────────────────
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const { action, value, id } = btn.dataset;

  if (action === 'set-view') {
    ModuleRegistry.deactivate(Store.state.view);
    Store.state.view = value;
  }

  if (action === 'set-theme') {
    Store.state.settings = { ...Store.state.settings, theme: value };
    applyTheme(value);
  }

  if (action === 'set-timer-mode') {
    // Only switchable when not running
    if (!Store.state.fasting.running) {
      Store.state.fasting = { ...Store.state.fasting, mode: value };
    }
  }

  if (action === 'toggle-fast') {
    const running = Store.state.fasting.running;
    const mode    = Store.state.fasting.mode ?? '16:8';
    if (running && Store.state.fasting.startTime) {
      const elapsed = Math.floor((Date.now() - Store.state.fasting.startTime) / 1000);
      GamificationEngine.onFastEnd(elapsed);
    }
    Store.state.fasting = { startTime: running ? null : Date.now(), running: !running, mode };
    if (!running) {
      TimerService.startTick();
      _notifiedMilestones.clear();
      await requestNotificationPermission();
      GamificationEngine.check();
    } else {
      TimerService.stopTick();
    }
  }

  if (action === 'add-water') {
    const goal = Store.state.settings?.waterGoal ?? 8;
    if (Store.state.water.length < goal) {
      Store.state.water = [...Store.state.water, Date.now()];
      Store.state.xp   += 5;
      Store.logActivity();
      GamificationEngine.onWaterAdded();
      if (Store.state.water.length === goal) GamificationEngine.onWaterGoalReached();
    }
  }

  if (action === 'take-supplement') {
    const { SUPPLEMENTS } = await import('./data/supplements/kmoe_crps.js');
    const supp = SUPPLEMENTS.find(s => s.id === id);
    if (supp) {
      const done = { ...(Store.state.doneSupplements ?? {}) };
      done[supp.id] = new Date().toDateString();
      Store.state.doneSupplements = done;
      Store.state.xp += supp.xp;
      Store.logActivity();
      GamificationEngine.check();
    }
  }

  if (action === 'tap-habit') {
    const habit = HABITS.find(h => h.id === id);
    if (habit) {
      const doneHabits = { ...(Store.state.doneHabits ?? {}) };
      doneHabits[habit.id] = new Date().toDateString();
      Store.state.doneHabits = doneHabits;
      Store.state.xp += habit.xp;
      Store.logActivity();
    }
  }

  if (action === 'save-gratitude') {
    const input = document.getElementById('gratitude-input');
    const text  = input?.value?.trim();
    if (text) {
      const doneHabits = { ...(Store.state.doneHabits ?? {}) };
      doneHabits['gratitude'] = new Date().toDateString();
      Store.state.doneHabits = doneHabits;
      Store.state.xp += 5;
      Store.logActivity();
    }
  }

  if (action === 'add-steps') {
    const add      = parseInt(value);
    const prev     = Store.state.steps ?? 0;
    const next     = prev + add;
    const xpGained = Math.floor(add / 1000) * 10;
    Store.state.steps = next;
    if (xpGained > 0) { Store.state.xp += xpGained; Store.logActivity(); }
    GamificationEngine.onStepsUpdated(next);
  }

  if (action === 'set-steps') {
    showStepsInput();
  }

  if (action === 'start-protocol') {
    const protocol = protocolsData[id];
    if (!protocol) return;

    Store.state.activeExercise = { protocolId: protocol.id, stepIndex: 0, running: true };
    await requestWakeLock();

    const tpl = document.createElement('template');
    tpl.innerHTML = T.ExerciseOverlayTemplate(protocol, 0, protocol.steps[0].duration);
    document.body.appendChild(tpl.content.firstElementChild);

    TimerService.startExerciseCountdown(
      protocol.steps[0].duration,
      () => nextExerciseStep(protocol)
    );
  }

  if (action === 'stop-exercise') {
    TimerService.stopExercise();
    Store.state.activeExercise = { protocolId: null, stepIndex: 0, running: false };
    document.getElementById('exercise-overlay')?.remove();
    releaseWakeLock();
  }

  if (action === 'skip-step') {
    const { protocolId, stepIndex } = Store.state.activeExercise;
    const protocol = protocolsData[protocolId];
    if (protocol) {
      TimerService.stopExercise();
      nextExerciseStep(protocol, true); // true = skip, no XP for this step
    }
  }
});

// Name: nur bei blur — kein Re-render beim Tippen
document.addEventListener('blur', (e) => {
  if (e.target.id === 'set-name') {
    Store.state.settings = { ...Store.state.settings, userName: e.target.value };
  }
}, true);

// Größe: sofort visuell, Store nur beim loslassen
document.addEventListener('input', (e) => {
  if (e.target.id === 'set-size') document.documentElement.style.fontSize = `${e.target.value}px`;
});
document.addEventListener('change', (e) => {
  if (e.target.id === 'set-size') Store.state.settings = { ...Store.state.settings, fontSize: e.target.value };
});

// ─── Exercise progression ─────────────────────────────────────────────────────
function nextExerciseStep(protocol, skipped = false) {
  const { stepIndex } = Store.state.activeExercise;
  if (!skipped) Store.state.xp += protocol.xp ? Math.round(protocol.xp / protocol.steps.length) : 15;

  if (stepIndex + 1 < protocol.steps.length) {
    const next = stepIndex + 1;
    Store.state.activeExercise = { ...Store.state.activeExercise, stepIndex: next };
    const existing = document.getElementById('exercise-overlay');
    if (existing) {
      const tpl = document.createElement('template');
      tpl.innerHTML = T.ExerciseOverlayTemplate(protocol, next, protocol.steps[next].duration);
      existing.replaceWith(tpl.content.firstElementChild);
    }
    TimerService.startExerciseCountdown(protocol.steps[next].duration, () => nextExerciseStep(protocol));
  } else {
    // Protocol complete — award XP, mark habit done
    const xp = protocol.xp ?? 15;
    Store.state.xp += xp;
    Store.logActivity();
    GamificationEngine.onProtocolComplete(protocol.id);

    // Mark habit as done for today
    const habitIds = HABITS.map(h => h.protocol);
    if (habitIds.includes(protocol.id)) {
      const todayKey   = new Date().toDateString();
      const doneHabits = { ...(Store.state.doneHabits ?? {}) };
      // find habit id by protocol id
      const habit = HABITS.find(h => h.protocol === protocol.id);
      if (habit) doneHabits[habit.id] = todayKey;
      Store.state.doneHabits = doneHabits;
    }

    TimerService.stopExercise();
    Store.state.activeExercise = { protocolId: null, stepIndex: 0, running: false };
    AnimationEngine.showProtocolComplete(protocol.title, protocol.xp ?? 15);
    releaseWakeLock();

    navigator.serviceWorker?.controller?.postMessage({
      type: 'EXERCISE_COMPLETE', payload: { title: protocol.title },
    });
  }
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────
async function bootstrap() {
  if (app) app.innerHTML = `
    <div class="app-container" style="display:flex;align-items:center;justify-content:center;min-height:100vh;">
      <span class="u-mono" style="font-size:0.75rem;opacity:0.4;letter-spacing:0.1em;">INIT…</span>
    </div>`;

  await Store.init();
  applyTheme(Store.state.settings?.theme ?? 'system');
  Store.checkDailyReset();

  if (Store.state.fasting.running) {
    TimerService.startTick();
    const h = Store.state.fasting.startTime
      ? (Date.now() - Store.state.fasting.startTime) / 3_600_000 : 0;
    for (const k of Object.keys(FASTING_MILESTONES)) {
      if (h > parseInt(k)) _notifiedMilestones.add(parseInt(k));
    }
  }

  Store.subscribe('view',      render);
  Store.subscribe('xp',        render);
  Store.subscribe('water',     render);
  Store.subscribe('steps',     render);
  Store.subscribe('doneHabits',render);
  Store.subscribe('fasting',   render);
  Store.subscribe('settings', (s) => {
    render();
    applyTheme(s.theme ?? 'system');
  });
  Store.subscribe('unlockedAchievements',  render);
  Store.subscribe('doneSupplements',        render);
  Store.subscribe('streaks',              render);

  Store.subscribe('timerTick', (s) => {
    const el = document.querySelector('#main-timer-display');
    if (el) el.textContent = new Date(s * 1000).toISOString().substring(11, 19);

    // Update progress ring without full re-render
    const mode   = Store.state.fasting.mode ?? '16:8';
    const goal   = mode === '100h' ? 360000 : 57600;
    const pct    = Math.min(Math.round((s / goal) * 100), 100);
    const r      = 28;
    const circ   = 2 * Math.PI * r;
    const dash   = Math.min(pct / 100, 1) * circ;
    const ring   = document.querySelector('#app circle:last-child');
    const label  = document.querySelector('#app .u-mono[style*="position:absolute"]');
    if (ring)  ring.setAttribute('stroke-dasharray', `${dash.toFixed(1)} ${circ.toFixed(1)}`);
    if (label) label.textContent = pct + '%';

    // Remaining time
    const rem = document.querySelector('#app [id="remaining-display"]');
    if (rem) {
      const remaining = Math.max(goal - s, 0);
      rem.textContent = 'noch ' + new Date(remaining * 1000).toISOString().substring(11, 19);
    }

    checkFastingMilestones(s);
  });

  Store.subscribe('exerciseTick', (s) => {
    const el = document.getElementById('exercise-timer-display');
    if (el) el.textContent = s + 's';
    // Update ring
    const { protocolId, stepIndex } = Store.state.activeExercise ?? {};
    const protocol = protocolId ? protocolsData[protocolId] : null;
    if (protocol) {
      const step = protocol.steps[stepIndex ?? 0];
      AnimationEngine.updateTimerRing(s, step?.duration ?? 1);
      if (step?.phase) AnimationEngine.setBreathPhase(step.phase);
    }
  });

  render();
  window.addEventListener('load', registerSW);
  setInterval(() => Store.checkDailyReset(), 60_000);

  // Movement break reminder every 60min (only if activity level is sedentary)
  setInterval(() => {
    if (Store.state.settings?.activityLevel === 'sedentary' && Store.state.fasting?.running) {
      navigator.serviceWorker?.controller?.postMessage({
        type: 'FASTING_MILESTONE',
        payload: { hours: 0, xp: 0, body: 'Zeit für eine kurze Bewegungspause!' }
      });
    }
  }, 60 * 60_000);
}

bootstrap();
