// src/core/Store.js
import { openRehappDB, migrateFromLocalStorage } from './db.js';

const EPHEMERAL = new Set(['timerTick', 'exerciseTick', 'view', 'activeExercise']);

const bc = new BroadcastChannel('rehapp');

const DEFAULT_STATE = {
  xp:             0,
  water:          [],
  steps:          0,
  bikeKm:         0,
  doneHabits:      {},
  doneSupplements: {},
  fasting:        { startTime: null, running: false, mode: '16:8' },
  activeExercise: { protocolId: null, stepIndex: 0, running: false },
  view:           'home',
  streaks:        { current: 0, lastActivity: null },
  settings:       { userName: '', fontSize: '16', theme: 'dark', reminders: {}, wakeTime: '07:00', eatStart: '12:00' },
  lastReset:            new Date().toDateString(),
  // ── Gamification ──────────────────────────────────────────────────────────
  unlockedAchievements: [],
  totalProtocols:       0,
  protocolCounts:       {},
  completedProtocols:   [],
  fastingSessions:      0,
  totalFastingHours:    0,
  longestFast:          0,
  totalWaterUnits:      0,
  waterGoalDays:        0,
  totalSteps:           0,
  stepsGoalDays:        0,
  perfectDays:          0,
  lastPerfectDay:       null,
  longestStreak:        0,
};

export const Store = {
  _db:        null,
  _listeners: {},
  _memory:    { ...DEFAULT_STATE },

  async init() {
    this._db = await openRehappDB();
    await migrateFromLocalStorage(this._db);

    const durableKeys = Object.keys(DEFAULT_STATE).filter(k => !EPHEMERAL.has(k));
    const tx = this._db.transaction('state', 'readonly');
    await Promise.all(
      durableKeys.map(async (key) => {
        const val = await tx.store.get(key);
        if (val !== undefined) this._memory[key] = val;
      })
    );

    this.state = new Proxy(this._memory, {
      set: (target, key, value) => {
        target[key] = value;
        if (!EPHEMERAL.has(key)) {
          this._db.put('state', value, key).catch(err =>
            console.warn('[Store] IDB write failed:', key, err)
          );
          bc.postMessage({ type: 'STATE_UPDATE', key, value });
        }
        this._notify(key, value);
        return true;
      },
    });

    bc.addEventListener('message', ({ data }) => {
      const { type, key, value } = data ?? {};
      if (type === 'STATE_UPDATE' && key in this._memory) {
        this._memory[key] = value;
        this._notify(key, value);
      }
    });

    navigator.serviceWorker?.addEventListener('message', ({ data }) => {
      if (data?.type === 'DAILY_RESET_CHECK') this.checkDailyReset();
    });

    return this;
  },

  subscribe(key, fn) {
    if (!this._listeners[key]) this._listeners[key] = [];
    this._listeners[key].push(fn);
    return () => {
      this._listeners[key] = this._listeners[key].filter(f => f !== fn);
    };
  },

  notify(key, val) {
    this._notify(key, val);
  },

  _notify(key, val) {
    this._listeners[key]?.forEach(fn => fn(val));
  },

  checkDailyReset() {
    const today = new Date().toDateString();
    if (this.state.lastReset !== today) {
      this.state.water           = [];
      this.state.steps           = 0;
      this.state.bikeKm          = 0;
      this.state.doneHabits      = {};
      this.state.doneSupplements = {};
      this.state.lastReset       = today;
      return true;
    }
    return false;
  },

  logActivity() {
    const today = new Date().toDateString();
    if (this.state.streaks.lastActivity === today) return;
    const newStreak = {
      ...this.state.streaks,
      current:      this.state.streaks.current + 1,
      lastActivity: today,
    };
    this.state.streaks = newStreak;
    if (newStreak.current > (this.state.longestStreak ?? 0)) {
      this.state.longestStreak = newStreak.current;
    }
    this._db?.add('activity_log', {
      date:      today,
      timestamp: Date.now(),
      type:      'daily',
      xp:        this.state.xp,
      water:     this.state.water.length,
      streak:    newStreak.current,
    }).catch(() => {});
    navigator.serviceWorker?.controller?.postMessage({
      type: 'SET_BADGE', payload: { count: newStreak.current },
    });
  },

  async getActivityLog(days = 30) {
    if (!this._db) return [];
    const cutoff = Date.now() - days * 86_400_000;
    const all    = await this._db.getAllFromIndex('activity_log', 'by_timestamp');
    return all.filter(e => e.timestamp >= cutoff);
  },

  async getWeeklyXP() {
    const log = await this.getActivityLog(7);
    if (!log.length) return 0;
    return log[log.length - 1].xp - (log[0]?.xp ?? 0);
  },

  async getHydrationHistory(days = 14) {
    const log    = await this.getActivityLog(days);
    const byDate = {};
    for (const entry of log) byDate[entry.date] = entry.water ?? 0;
    return Object.entries(byDate).map(([date, count]) => ({ date, count }));
  },

  async getLongestStreak() {
    return this.state.streaks.current;
  },
};
