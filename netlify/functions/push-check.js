const webpush = require('web-push');
const { getStore } = require('@netlify/blobs');
const { MILESTONES } = require('./lib/milestones');

// Läuft alle 5 Minuten (netlify.toml → [functions."push-check"].schedule),
// unabhängig davon ob ein Browser offen ist. Das ist der einzige Ort, der
// wirklich weiß, wann ein Fasten-Meilenstein fällig ist — der Client selbst
// kann das nicht zuverlässig prüfen, sobald er geschlossen ist.
exports.handler = async () => {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL,
    process.env.VAPID_PUBLIC,
    process.env.VAPID_PRIVATE
  );

  const store = getStore('push-subscriptions');
  const { blobs } = await store.list();

  for (const { key } of blobs) {
    let record;
    try {
      record = await store.get(key, { type: 'json' });
    } catch (err) {
      console.warn('push-check: read failed', key, err.message);
      continue;
    }
    if (!record || !record.subscription || !record.timerStart || record.timerMode !== '100h') continue;

    const elapsed = Date.now() - record.timerStart;
    const sent = new Set(record.sentMilestones || []);
    let dirty = false;
    let gone = false;

    for (const ms of MILESTONES) {
      if (elapsed < ms.hours * 3600000 || sent.has(ms.id)) continue;
      try {
        await webpush.sendNotification(record.subscription, JSON.stringify({ title: 'REHAPP', body: ms.text }));
        sent.add(ms.id);
        dirty = true;
      } catch (err) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          // Subscription ist auf dem Client widerrufen/abgelaufen — Eintrag entfernen.
          gone = true;
          break;
        }
        console.warn('push-check: send failed', key, ms.id, err.message);
        // Nicht als gesendet markieren — nächster Lauf versucht es erneut.
      }
    }

    if (gone) {
      await store.delete(key);
    } else if (dirty) {
      record.sentMilestones = [...sent];
      await store.setJSON(key, record);
    }
  }

  return { statusCode: 200 };
};
