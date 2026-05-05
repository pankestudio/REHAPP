// src/core/achievements.js

export const ACHIEVEMENTS = [

  // ── Fasten ────────────────────────────────────────────────────────────────
  {
    id: 'fast_first',
    title: 'Erster Schritt',
    desc: 'Erste Fasten-Session gestartet',
    icon: '⏱',
    xp: 25,
    check: (s) => s.fasting.startTime !== null || s.fastingSessions >= 1,
  },
  {
    id: 'fast_16h',
    title: '16 Stunden',
    desc: '16h Fasten am Stück durchgehalten',
    icon: '🔥',
    xp: 80,
    check: (s) => s.longestFast >= 16,
  },
  {
    id: 'fast_24h',
    title: 'Ein Tag',
    desc: '24h Fasten abgeschlossen',
    icon: '⚡',
    xp: 150,
    check: (s) => s.longestFast >= 24,
  },
  {
    id: 'fast_100h',
    title: 'Kickstart',
    desc: '100h Fasten — kompletter Neustart',
    icon: '🏆',
    xp: 500,
    check: (s) => s.longestFast >= 100,
  },

  // ── Wasser ────────────────────────────────────────────────────────────────
  {
    id: 'water_first',
    title: 'Erste Hydration',
    desc: 'Erste 0.5L getrunken',
    icon: '💧',
    xp: 10,
    check: (s) => s.totalWaterUnits >= 1,
  },
  {
    id: 'water_goal',
    title: 'Volltank',
    desc: 'Tagesziel Wasser einmal erreicht',
    icon: '🌊',
    xp: 30,
    check: (s) => s.waterGoalDays >= 1,
  },
  {
    id: 'water_7days',
    title: 'Hydration-Streak',
    desc: '7 Tage in Folge Wasserziel erreicht',
    icon: '🌊',
    xp: 100,
    check: (s) => s.waterGoalDays >= 7,
  },

  // ── Schritte ──────────────────────────────────────────────────────────────
  {
    id: 'steps_first',
    title: 'In Bewegung',
    desc: 'Erste 1.000 Schritte eingetragen',
    icon: '👣',
    xp: 10,
    check: (s) => s.totalSteps >= 1000,
  },
  {
    id: 'steps_goal',
    title: 'Tagesziel',
    desc: 'Schritteziel einmal erreicht',
    icon: '🚶',
    xp: 30,
    check: (s) => s.stepsGoalDays >= 1,
  },
  {
    id: 'steps_marathon',
    title: 'Marathon',
    desc: '42.195 Schritte gesamt',
    icon: '🏅',
    xp: 200,
    check: (s) => s.totalSteps >= 42195,
  },

  // ── Protokolle ────────────────────────────────────────────────────────────
  {
    id: 'protocol_first',
    title: 'Erste Übung',
    desc: 'Erstes Protokoll abgeschlossen',
    icon: '💪',
    xp: 20,
    check: (s) => s.totalProtocols >= 1,
  },
  {
    id: 'protocol_10',
    title: 'Zehn Runden',
    desc: '10 Protokolle abgeschlossen',
    icon: '🥊',
    xp: 75,
    check: (s) => s.totalProtocols >= 10,
  },
  {
    id: 'protocol_50',
    title: 'Disziplin',
    desc: '50 Protokolle abgeschlossen',
    icon: '🎯',
    xp: 300,
    check: (s) => s.totalProtocols >= 50,
  },
  {
    id: 'morning_routine_first',
    title: 'Guten Morgen',
    desc: 'Erste Morgenroutine abgeschlossen',
    icon: '🌅',
    xp: 30,
    check: (s) => s.completedProtocols?.includes('morning_routine'),
  },
  {
    id: 'vagus_master',
    title: 'Vagus-Meister',
    desc: 'Vagus-Protokoll 10x abgeschlossen',
    icon: '🧘',
    xp: 100,
    check: (s) => (s.protocolCounts?.vagus ?? 0) >= 10,
  },

  // ── Streaks ───────────────────────────────────────────────────────────────
  {
    id: 'streak_3',
    title: '3 Tage',
    desc: '3 Tage in Folge aktiv',
    icon: '🔗',
    xp: 50,
    check: (s) => s.streaks.current >= 3,
  },
  {
    id: 'streak_7',
    title: 'Eine Woche',
    desc: '7 Tage in Folge aktiv',
    icon: '⭐',
    xp: 100,
    check: (s) => s.streaks.current >= 7,
  },
  {
    id: 'streak_30',
    title: 'Ein Monat',
    desc: '30 Tage in Folge aktiv',
    icon: '🌟',
    xp: 400,
    check: (s) => s.streaks.current >= 30,
  },
  {
    id: 'streak_100',
    title: '100 Tage',
    desc: '100 Tage ohne Unterbrechung',
    icon: '💎',
    xp: 1000,
    check: (s) => s.streaks.current >= 100,
  },

  // ── XP / Level ────────────────────────────────────────────────────────────
  {
    id: 'level_5',
    title: 'Level 5',
    desc: 'Level 5 erreicht',
    icon: '🎖',
    xp: 0,
    check: (s) => Math.floor(s.xp / 100) + 1 >= 5,
  },
  {
    id: 'level_10',
    title: 'Level 10',
    desc: 'Level 10 erreicht',
    icon: '🏆',
    xp: 0,
    check: (s) => Math.floor(s.xp / 100) + 1 >= 10,
  },
  {
    id: 'level_20',
    title: 'Level 20',
    desc: 'Level 20 erreicht',
    icon: '👑',
    xp: 0,
    check: (s) => Math.floor(s.xp / 100) + 1 >= 20,
  },

  // ── Kombination ───────────────────────────────────────────────────────────
  {
    id: 'perfect_day',
    title: 'Perfekter Tag',
    desc: 'Alle Tages-Habits an einem Tag erledigt',
    icon: '✨',
    xp: 50,
    check: (s) => s.perfectDays >= 1,
  },
  {
    id: 'perfect_week',
    title: 'Perfekte Woche',
    desc: '7 perfekte Tage in Folge',
    icon: '🌈',
    xp: 350,
    check: (s) => s.perfectDays >= 7,
  },
];

export const ACHIEVEMENT_MAP = Object.fromEntries(ACHIEVEMENTS.map(a => [a.id, a]));
