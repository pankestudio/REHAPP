// src/core/GamificationEngine.js
import { ACHIEVEMENTS } from './achievements.js';
import { Store }        from './Store.js';
import { AnimationEngine } from './AnimationEngine.js';

export const GamificationEngine = {

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

      const bonusXP = newOnes.reduce((sum, a) => sum + (a.xp ?? 0), 0);
      if (bonusXP > 0) Store.state.xp += bonusXP;

      newOnes.forEach(a => AnimationEngine.showAchievement(a));

      navigator.serviceWorker?.controller?.postMessage({
        type: 'SET_BADGE',
        payload: { count: unlocked.size },
      });
    }

    GamificationEngine._checkPerfectDay();
    return newOnes;
  },

  onProtocolComplete(protocolId) {
    const state = Store.state;
    Store.state.totalProtocols = (state.totalProtocols ?? 0) + 1;

    const counts = { ...(state.protocolCounts ?? {}) };
    counts[protocolId] = (counts[protocolId] ?? 0) + 1;
    Store.state.protocolCounts = counts;

    const completed = new Set(state.completedProtocols ?? []);
    completed.add(protocolId);
    Store.state.completedProtocols = [...completed];

    GamificationEngine.check();
  },

  onFastEnd(elapsedSeconds) {
    const hours = elapsedSeconds / 3600;
    const state  = Store.state;
    Store.state.fastingSessions   = (state.fastingSessions ?? 0) + 1;
    Store.state.totalFastingHours = (state.totalFastingHours ?? 0) + hours;
    if (hours > (state.longestFast ?? 0)) Store.state.longestFast = hours;
    GamificationEngine.check();
  },

  onWaterGoalReached() {
    Store.state.waterGoalDays   = (Store.state.waterGoalDays ?? 0) + 1;
    Store.state.totalWaterUnits = (Store.state.totalWaterUnits ?? 0) + 1;
    GamificationEngine.check();
  },

  onWaterAdded() {
    Store.state.totalWaterUnits = (Store.state.totalWaterUnits ?? 0) + 1;
    GamificationEngine.check();
  },

  onStepsUpdated(newTotal) {
    Store.state.totalSteps = Math.max(Store.state.totalSteps ?? 0, newTotal);
    const goal = Store.state.settings?.stepsGoal ?? 10000;
    if (newTotal >= goal) {
      Store.state.stepsGoalDays = (Store.state.stepsGoalDays ?? 0) + 1;
    }
    GamificationEngine.check();
  },

  _checkPerfectDay() {
    const state      = Store.state;
    const doneHabits = state.doneHabits ?? {};
    const habitCount = Object.keys(doneHabits).length;
    const waterDone  = state.water.length >= (state.settings?.waterGoal ?? 8);
    const stepsDone  = (state.steps ?? 0) >= (state.settings?.stepsGoal ?? 10000);

    if (habitCount >= 3 && waterDone && stepsDone) {
      const today = new Date().toDateString();
      if (state.lastPerfectDay !== today) {
        Store.state.lastPerfectDay = today;
        Store.state.perfectDays    = (state.perfectDays ?? 0) + 1;
      }
    }
  },
};
