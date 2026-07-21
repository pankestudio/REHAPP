// src/main.js
import './styles/theme.css';
import { Store }          from './core/Store.js';
import { TimerService }   from './core/TimerService.js';
import { ModuleRegistry } from './core/ModuleRegistry.js';
import * as T             from './ui/Templates.js';

import { HomeModul, HABITS, expandedBlocks, expandedDetails } from './modules/home/index.js';
import { ProtokollModul, protocolsData }    from './modules/protocols/index.js';
import { StatsModul }                       from './modules/stats/index.js';
import { SettingsModul }                    from './modules/settings/index.js';
import { ReminderService }                  from './core/ReminderService.js';
import { GamificationEngine }               from './core/GamificationEngine.js';
import { AnimationEngine }                  from './core/AnimationEngine.js';
import { NutritionModul }                   from './modules/nutrition/index.js';
import { renderOnboarding }                 from './modules/onboarding/index.js';
import { SUPPLEMENTS }                      from './data/supplements/kmoe_crps.js';

ModuleRegistry
  .register(HomeModul)
  .register(ProtokollModul)
  .register(NutritionModul)
  .register(StatsModul)
  .register(SettingsModul);

// ─── Theme ───────────────────────────────────────────────────────────────────
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme ?? 'system');
}

// ─── Timer helpers ────────────────────────────────────────────────────────────
function fmtTime(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;
}

// ─── Bike milestones ──────────────────────────────────────────────────────────
const BIKE_MILESTONES         = { 2: 10, 5: 20, 10: 40 };
const _notifiedBikeMilestones = new Set();

function checkBikeMilestones(km) {
  for (const [dist, xp] of Object.entries(BIKE_MILESTONES)) {
    const d = parseFloat(dist);
    if (km >= d && !_notifiedBikeMilestones.has(d)) {
      _notifiedBikeMilestones.add(d);
      awardXP(xp);
    }
  }
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
  if (document.visibilityState === 'visible') {
    Store.checkDailyReset();
    if (Store.state?.activeExercise?.running) requestWakeLock();
  }
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
    font-size:0.7rem;font-weight:800;letter-spacing:var(--ls-upper);
    border-top:2px solid var(--action-orange);">
    <span>UPDATE VERFÜGBAR</span>
    <button id="apply-update" style="background:var(--action-orange);color:#fff;border:none;
      padding:8px 16px;font-weight:800;font-size:0.65rem;text-transform:uppercase;cursor:pointer;">
      JETZT LADEN</button></div>`;
  document.body.appendChild(b);
  document.getElementById('apply-update').addEventListener('click', () => {
    // Listener first — postMessage can trigger controllerchange synchronously.
    navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), { once: true });
    newSW.postMessage({ type: 'SKIP_WAITING' });
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
    font-size:0.65rem;font-weight:800;letter-spacing:var(--ls-upper);color:var(--text-dim);">
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

// ─── Numeric input overlay (shared) ──────────────────────────────────────────
function showNumericInput({ overlayId, label, inputmode, placeholder, onConfirm }) {
  if (document.getElementById(overlayId)) return;
  const inputId = `${overlayId}-input`;
  const el = document.createElement('div');
  el.id = overlayId;
  el.innerHTML = `
    <div style="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1500;
      display:flex;align-items:flex-end;">
      <div style="background:var(--surface);width:100%;padding:24px 20px calc(24px + var(--safe-bot));
        border-top:2px solid var(--text-main);">
        <span class="u-label">${label}</span>
        <input id="${inputId}" type="number" inputmode="${inputmode}"
          placeholder="${placeholder}"
          style="width:100%;border:1.5px solid var(--border);background:var(--bg);
                 color:var(--text-main);padding:12px;font-size:1.2rem;font-family:inherit;
                 margin:12px 0;outline:none;-webkit-appearance:none;">
        <div style="display:flex;gap:10px;margin-top:4px;">
          <button id="${overlayId}-cancel" style="flex:1;border:1.5px solid var(--border);
            background:transparent;padding:14px;font-weight:800;font-size:0.75rem;
            text-transform:uppercase;cursor:pointer;">Abbrechen</button>
          <button id="${overlayId}-confirm" class="btn-primary" style="flex:2;">Übernehmen</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(el);
  document.getElementById(inputId).focus();
  document.getElementById(`${overlayId}-cancel`).addEventListener('click', () => el.remove());
  document.getElementById(`${overlayId}-confirm`).addEventListener('click', () => {
    onConfirm(document.getElementById(inputId).value);
    el.remove();
  });
}

function showStepsInput() {
  showNumericInput({
    overlayId:   'steps-overlay',
    label:       'Schritte eingeben',
    inputmode:   'numeric',
    placeholder: 'z.B. 8500',
    onConfirm(raw) {
      const val = parseInt(raw);
      if (!isNaN(val) && val >= 0) {
        const prev     = Store.state.steps ?? 0;
        const xpGained = Math.floor(Math.max(val - prev, 0) / 1000) * 10;
        Store.state.steps = val;
        if (xpGained > 0) awardXP(xpGained);
        GamificationEngine.onStepsUpdated(val);
      }
    },
  });
}

function showBikeInput() {
  showNumericInput({
    overlayId:   'bike-overlay',
    label:       'Kilometer eingeben',
    inputmode:   'decimal',
    placeholder: 'z.B. 12.5',
    onConfirm(raw) {
      const val = parseFloat(raw);
      if (!isNaN(val) && val >= 0) {
        Store.state.bikeKm = Math.max(val, Store.state.bikeKm ?? 0);
        checkBikeMilestones(Store.state.bikeKm);
      }
    },
  });
}

// ─── XP helper ───────────────────────────────────────────────────────────────
function awardXP(amount) {
  const prevLevel = Math.floor(Store.state.xp / 100);
  Store.state.xp += amount;
  Store.logActivity();
  const newLevel = Math.floor(Store.state.xp / 100);
  if (newLevel > prevLevel) AnimationEngine.showLevelUp(newLevel + 1);
  else AnimationEngine.showXPGain(amount);
}

// ─── Render ───────────────────────────────────────────────────────────────────
const app = document.querySelector('#app');

function render() {
  if (!app || !Store.state) return;
  const { state } = Store;

  if (!state.settings.onboardingDone) {
    app.innerHTML = renderOnboarding(state);
    document.documentElement.style.fontSize = `${state.settings.fontSize}px`;
    return;
  }

  ModuleRegistry.activate(state.view);
  app.innerHTML = `
    <div class="app-container">
      <header style="margin-bottom:28px;border-bottom:2px solid var(--text-main);padding-bottom:12px;
        display:flex;justify-content:space-between;align-items:baseline;">
        <h2 class="u-mono" style="font-size:0.8rem;font-weight:800;">REHAPP</h2>
        <span style="font-size:0.65rem;color:var(--text-dim);font-weight:800;">
          ${state.settings.userName || ''}
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

  if (action === 'toggle-block') {
    if (expandedBlocks.has(id)) expandedBlocks.delete(id);
    else expandedBlocks.add(id);
    Store.notify('view');
  }

  if (action === 'focus-today') {
    setTimeout(() => {
      const el = document.querySelector('[data-action="tap-habit"], [data-action="start-protocol"]');
      el?.closest('.card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  if (action === 'set-theme') {
    Store.state.settings = { ...Store.state.settings, theme: value };
    applyTheme(value);
  }

  if (action === 'set-timer-mode') {
    if (Store.state.fasting.running) return;
    Store.state.fasting = { ...Store.state.fasting, mode: value };
  }

  if (action === 'toggle-fast') {
    const { running, mode = '16:8' } = Store.state.fasting;
    if (running) {
      if (Store.state.fasting.startTime) {
        const elapsed = Math.floor((Date.now() - Store.state.fasting.startTime) / 1000);
        GamificationEngine.onFastEnd(elapsed);
      }
      Store.state.fasting = { startTime: null, running: false, mode };
      TimerService.stopTick();
    } else {
      const offsetHours = Math.max(0, parseFloat(document.getElementById('fast-offset')?.value) || 0);
      const startTime   = Date.now() - Math.round(offsetHours * 3600 * 1000);
      Store.state.fasting = { startTime, running: true, mode };
      TimerService.startTick();
      _notifiedMilestones.clear();
      for (const k of Object.keys(FASTING_MILESTONES)) {
        if (offsetHours >= parseInt(k)) _notifiedMilestones.add(parseInt(k));
      }
      await requestNotificationPermission();
      GamificationEngine.check();
    }
  }

  if (action === 'add-water') {
    const waterGoal = Store.state.settings?.waterGoal ?? 8;
    if (Store.state.water.length < waterGoal) {
      Store.state.water = [...Store.state.water, Date.now()];
      awardXP(5);
      navigator.vibrate?.(10);
      GamificationEngine.onWaterAdded();
      if (Store.state.water.length === waterGoal) GamificationEngine.onWaterGoalReached();
    }
  }

  if (action === 'add-steps') {
    const add      = parseInt(value);
    const next     = (Store.state.steps ?? 0) + add;
    const xpGained = Math.floor(add / 1000) * 10;
    Store.state.steps = next;
    if (xpGained > 0) awardXP(xpGained);
    GamificationEngine.onStepsUpdated(next);
  }

  if (action === 'set-steps') showStepsInput();

  if (action === 'add-bike') {
    Store.state.bikeKm = (Store.state.bikeKm ?? 0) + parseFloat(value);
    checkBikeMilestones(Store.state.bikeKm);
  }

  if (action === 'set-bike') showBikeInput();

  if (action === 'tap-habit') {
    const habit = HABITS.find(h => h.id === id);
    if (!habit || Store.state.doneHabits[id]) return;
    Store.state.doneHabits = { ...Store.state.doneHabits, [id]: new Date().toDateString() };
    if (habit.xp > 0) awardXP(habit.xp);
    GamificationEngine.check();
  }

  if (action === 'toggle-habit-detail') {
    if (expandedDetails.has(id)) expandedDetails.delete(id);
    else expandedDetails.add(id);
    Store.notify('view');
  }

  if (action === 'take-supplement') {
    const supp = SUPPLEMENTS.find(s => s.id === id);
    if (!supp || Store.state.doneSupplements?.[id]) return;
    Store.state.doneSupplements = { ...(Store.state.doneSupplements ?? {}), [id]: new Date().toDateString() };
    awardXP(supp.xp);
    GamificationEngine.check();
  }

  if (action === 'toggle-module') {
    const mods = { fasting: true, steps: true, bike: true, water: true, ...(Store.state.settings.modules ?? {}) };
    mods[id] = !mods[id];
    Store.state.settings = { ...Store.state.settings, modules: mods };
  }

  if (action === 'toggle-habit-visibility') {
    const hidden = [...(Store.state.settings.hiddenHabits ?? [])];
    const idx = hidden.indexOf(id);
    if (idx >= 0) hidden.splice(idx, 1);
    else hidden.push(id);
    Store.state.settings = { ...Store.state.settings, hiddenHabits: hidden };
  }

  if (action === 'toggle-block-habits') {
    const hidden      = new Set(Store.state.settings.hiddenHabits ?? []);
    const blockHabits = HABITS.filter(h => h.block === id);
    if (value === 'off') blockHabits.forEach(h => hidden.add(h.id));
    else                 blockHabits.forEach(h => hidden.delete(h.id));
    Store.state.settings = { ...Store.state.settings, hiddenHabits: [...hidden] };
  }

  if (action === 'reset-habits-visibility') {
    Store.state.settings = { ...Store.state.settings, hiddenHabits: [] };
  }

  if (action === 'toggle-reminder') {
    if (Notification.permission === 'default') await requestNotificationPermission();
    const current = Store.state.settings.reminders ?? {};
    Store.state.settings = { ...Store.state.settings, reminders: { ...current, [id]: !current[id] } };
  }

  if (action === 'save-gratitude') {
    const ta   = document.getElementById('gratitude-inline');
    const text = ta?.value.trim() ?? '';
    const habit = HABITS.find(h => h.id === 'gratitude');
    Store.state.doneHabits = { ...Store.state.doneHabits, gratitude: text };
    if (habit && habit.xp > 0) awardXP(habit.xp);
    GamificationEngine.check();
  }

  if (action === 'log-cigs') {
    const count = parseInt(value);
    const xp    = count === 0 ? 20 : count <= 3 ? 10 : 0;
    Store.state.doneHabits = { ...Store.state.doneHabits, cigarettes: count };
    if (xp > 0) awardXP(xp);
    GamificationEngine.check();
  }

  if (action === 'save-grip-strength') {
    const input = document.getElementById('grip-kg-input');
    const val   = parseFloat(input?.value);
    if (!isNaN(val) && val > 0) {
      const entry = { date: new Date().toISOString().slice(0, 10), kg: val };
      Store.state.gripStrengthLog = [...(Store.state.gripStrengthLog ?? []), entry];
      if (input) input.value = '';
    }
    return;
  }

  if (action === 'reset-all-data') {
    if (!confirm('Alle Daten löschen und neu starten? Das kann nicht rückgängig gemacht werden.')) return;
    await Store.resetAll();
    return;
  }

  if (action === 'complete-onboarding') {
    const name   = document.getElementById('onb-name')?.value?.trim() ?? '';
    const wakeup = document.getElementById('onb-wakeup')?.value ?? '07:00';
    Store.state.settings = { ...Store.state.settings, userName: name || 'du', wakeTime: wakeup, onboardingDone: true };
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
    const { protocolId } = Store.state.activeExercise;
    const protocol = protocolsData[protocolId];
    if (protocol) {
      TimerService.stopExercise();
      nextExerciseStep(protocol);
    }
  }
});

// Name: nur bei blur — kein Re-render beim Tippen
document.addEventListener('blur', (e) => {
  if (e.target.id === 'set-name') Store.state.settings = { ...Store.state.settings, userName: e.target.value };
}, true);

// Größe: DOM sofort, Store erst beim Loslassen
document.addEventListener('input', (e) => {
  if (e.target.id === 'set-size') document.documentElement.style.fontSize = `${e.target.value}px`;
});
document.addEventListener('change', (e) => {
  if (e.target.id === 'set-size')     Store.state.settings = { ...Store.state.settings, fontSize:  e.target.value };
  if (e.target.id === 'set-wakeup')   Store.state.settings = { ...Store.state.settings, wakeTime:  e.target.value };
  if (e.target.id === 'set-eatstart') Store.state.settings = { ...Store.state.settings, eatStart:  e.target.value };
});

// ─── Exercise progression ─────────────────────────────────────────────────────
function nextExerciseStep(protocol) {
  const { stepIndex } = Store.state.activeExercise;

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
    const xp = protocol.xp ?? 15;
    awardXP(xp);
    GamificationEngine.onProtocolComplete(protocol.id);

    // Mark habit as done for today
    const habitIds = HABITS.map(h => h.protocol);
    if (habitIds.includes(protocol.id)) {
      const doneHabits = { ...(Store.state.doneHabits ?? {}) };
      const habit = HABITS.find(h => h.protocol === protocol.id);
      if (habit) doneHabits[habit.id] = new Date().toDateString();
      Store.state.doneHabits = doneHabits;
    }

    TimerService.stopExercise();
    Store.state.activeExercise = { protocolId: null, stepIndex: 0, running: false };
    AnimationEngine.showProtocolComplete(protocol.title, xp);
    releaseWakeLock();

    navigator.serviceWorker?.controller?.postMessage({
      type: 'EXERCISE_COMPLETE', payload: { title: protocol.title, xp },
    });
  }
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────
async function bootstrap() {
  if (app) app.innerHTML = `
    <div class="app-container" style="display:flex;align-items:center;justify-content:center;min-height:100vh;">
      <span class="u-mono" style="font-size:0.75rem;opacity:0.4;letter-spacing:var(--ls-upper);">INIT…</span>
    </div>`;

  await Store.init();
  // Existing users (have XP or userName) skip onboarding
  if (!Store.state.settings.onboardingDone && (Store.state.xp > 0 || Store.state.settings.userName)) {
    Store.state.settings = { ...Store.state.settings, onboardingDone: true };
  }
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

  // Pre-fill bike milestones so existing today-km don't re-award XP on reload
  const loadedKm = Store.state.bikeKm ?? 0;
  for (const d of Object.keys(BIKE_MILESTONES).map(parseFloat)) {
    if (loadedKm >= d) _notifiedBikeMilestones.add(d);
  }

  Store.subscribe('view',                 render);
  Store.subscribe('xp',                   render);
  Store.subscribe('water',                render);
  Store.subscribe('steps',                render);
  Store.subscribe('bikeKm',              render);
  Store.subscribe('doneHabits',          render);
  Store.subscribe('fasting',             render);
  Store.subscribe('settings', (s) => { render(); applyTheme(s.theme ?? 'system'); });
  Store.subscribe('streaks',              render);
  Store.subscribe('unlockedAchievements', render);
  Store.subscribe('doneSupplements',      render);
  Store.subscribe('gripStrengthLog',      render);

  Store.subscribe('timerTick', (s) => {
    const mode      = Store.state.fasting?.mode ?? '16:8';
    const target    = mode === '100h' ? 360_000 : 57_600;
    const remaining = Math.max(target - s, 0);
    const el        = document.querySelector('#main-timer-display');
    if (el) el.textContent = fmtTime(remaining);
    checkFastingMilestones(s);
  });

  Store.subscribe('exerciseTick', (s) => {
    const el = document.getElementById('exercise-timer-display');
    if (el) el.textContent = s + 's';
    const { protocolId, stepIndex } = Store.state.activeExercise ?? {};
    const protocol = protocolId ? protocolsData[protocolId] : null;
    if (protocol) {
      const step = protocol.steps[stepIndex ?? 0];
      AnimationEngine.updateTimerRing(s, step?.duration ?? 1);
      if (step?.phase) AnimationEngine.setBreathPhase(step.phase);
    }
  });

  ReminderService.start();
  render();
  window.addEventListener('load', registerSW);
  setInterval(() => Store.checkDailyReset(), 60_000);
}

bootstrap();
