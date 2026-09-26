// Muss inhaltlich mit der Meilenstein-Liste in scheduleNotifications() (index.html) übereinstimmen.
// Serverseitig wird zusätzlich eine stabile `id` gebraucht, um bereits verschickte
// Meilensteine je Gerät zu markieren (sentMilestones).
const MILESTONES = [
  { id: 'h12',  hours: 12,  text: '12h erreicht — Ruhe bewahren, Wasser und Elektrolyte halten.' },
  { id: 'h18',  hours: 18,  text: 'Ketose aktiv — 18h gefastet.' },
  { id: 'h24',  hours: 24,  text: '24h erreicht — Glykogen weitgehend erschöpft.' },
  { id: 'h36',  hours: 36,  text: '36h — häufig wird der Hunger jetzt ruhiger.' },
  { id: 'h48',  hours: 48,  text: 'Autophagie-Peak — 48h erreicht.' },
  { id: 'h72',  hours: 72,  text: '72h — Stammzellphase / Regenerationsfokus.' },
  { id: 'h100', hours: 100, text: '100h abgeschlossen — Refeed-Fenster startet.' },
];

module.exports = { MILESTONES };
