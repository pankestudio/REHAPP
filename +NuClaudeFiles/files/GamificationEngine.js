// src/core/GamificationEngine.js
// Zentrale Engine — prüft Achievements, vergibt XP-Boni, triggert Notifications.
// Wird von main.js nach jeder relevanten Aktion aufgerufen.

import { ACHIEVEMENTS, ACHIEVEMENT_MAP } from './achievements.js';
import { Store } from './Store.js';
import { AnimationEngine } from './AnimationEngine.js';

export const GamificationEngine = {

  // ── Achievement prüfen und vergeben ────────────────────────────────────────
  check() {
    const state    = Store.state;
    const unlocked = new Set(state.unlockedAchievements ?? []);
    const newOnes  = [];

    for (const achievement of ACHIEVEMENTS) {
      if (unlocked.has(achievement.id)) continue;
      try {
        if (achievement.check(state)) {
          unlocked.add(achievement.id);
          newOnes.push(achievement);
        }
      } catch { /* state field not yet populated */ }
    }

    if (newOnes.length) {
      Store.state.unlockedAchievements = [...unlocked];

      // Award XP for each new achievement
      const bonusXP = newOnes.reduce((sum, a) => sum + (a.xp ?? 0), 0);
      if (bonusXP > 0) Store.state.xp += bonusXP;

      // Show toast via AnimationEngine
      newOnes.forEach(a => AnimationEngine.showAchievement(a));

      // Update app badge with total achievements
      navigator.serviceWorker?.controller?.postMessage({
        type: 'SET_BADGE',
        payload: { count: unlocked.size },
      });
    }

    // Check perfect day
    GamificationEngine._checkPerfectDay();

    return newOnes;
  },

  // ── Protokoll abgeschlossen ────────────────────────────────────────────────
  onProtocolComplete(protocolId) {
    const state = Store.state;

    // Increment total protocols
    Store.state.totalProtocols = (state.totalProtocols ?? 0) + 1;

    // Track per-protocol counts
    const counts = { ...(state.protocolCounts ?? {}) };
    counts[protocolId] = (counts[protocolId] ?? 0) + 1;
    Store.state.protocolCounts = counts;

    // Track completed protocol IDs (for first-time achievements)
    const completed = new Set(state.completedProtocols ?? []);
    completed.add(protocolId);
    Store.state.completedProtocols = [...completed];

    GamificationEngine.check();
  },

  // ── Fasten-Session beendet ────────────────────────────────────────────────
  onFastEnd(elapsedSeconds) {
    const hours = elapsedSeconds / 3600;
    const state  = Store.state;

    Store.state.fastingSessions = (state.fastingSessions ?? 0) + 1;
    Store.state.totalFastingHours = (state.totalFastingHours ?? 0) + hours;

    if (hours > (state.longestFast ?? 0)) {
      Store.state.longestFast = hours;
    }

    GamificationEngine.check();
  },

  // ── Wasser Tagesziel erreicht ─────────────────────────────────────────────
  onWaterGoalReached() {
    Store.state.waterGoalDays = (Store.state.waterGoalDays ?? 0) + 1;
    Store.state.totalWaterUnits = (Store.state.totalWaterUnits ?? 0) + 1;
    GamificationEngine.check();
  },

  // ── Wasser hinzugefügt ────────────────────────────────────────────────────
  onWaterAdded() {
    Store.state.totalWaterUnits = (Store.state.totalWaterUnits ?? 0) + 1;
    GamificationEngine.check();
  },

  // ── Schritte aktualisiert ─────────────────────────────────────────────────
  onStepsUpdated(newTotal) {
    Store.state.totalSteps = Math.max(Store.state.totalSteps ?? 0, newTotal);
    const goal = Store.state.settings?.stepsGoal ?? 10000;
    if (newTotal >= goal) {
      Store.state.stepsGoalDays = (Store.state.stepsGoalDays ?? 0) + 1;
    }
    GamificationEngine.check();
  },

  // ── Perfekter Tag ──────────────────────────────────────────────────────────
  _checkPerfectDay() {
    const state      = Store.state;
    const doneHabits = state.doneHabits ?? {};
    const habitCount = Object.keys(doneHabits).length;
    const waterDone  = state.water.length >= (state.settings?.waterGoal ?? 8);
    const stepsDone  = (state.steps ?? 0) >= (state.settings?.stepsGoal ?? 10000);

    // Perfect day = all habits + water goal + steps goal
    if (habitCount >= 3 && waterDone && stepsDone) {
      const today = new Date().toDateString();
      if (state.lastPerfectDay !== today) {
        Store.state.lastPerfectDay = today;
        Store.state.perfectDays    = (state.perfectDays ?? 0) + 1;
      }
    }
  },
};