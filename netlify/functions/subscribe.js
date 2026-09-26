const { getStore } = require('@netlify/blobs');

// Legt eine Push-Subscription an oder aktualisiert Fastenstart/-modus einer
// bereits bestehenden. Ein Aufruf ohne `subscription` (nur deviceId +
// timerStart/timerMode) aktualisiert ausschließlich die Timer-Daten eines
// Geräts, das sich schon einmal registriert hat — bricht sonst folgenlos ab,
// damit Timer-Events (Start/Reset) auch dann sicher aufrufbar sind, wenn nie
// eine Subscription angelegt wurde.
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (err) {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const { deviceId, subscription, timerStart, timerMode } = body;
  if (!deviceId || typeof deviceId !== 'string') {
    return { statusCode: 400, body: 'deviceId fehlt' };
  }

  try {
    const store = getStore('push-subscriptions');
    const existing = (await store.get(deviceId, { type: 'json' })) || {};
    const merged = { ...existing };

    if (subscription) merged.subscription = subscription;
    if (!merged.subscription) {
      // Kein Bestand und keine neue Subscription mitgeliefert — nichts zu tun.
      return { statusCode: 200, body: JSON.stringify({ stored: false }) };
    }

    if ('timerStart' in body) {
      if (merged.timerStart !== timerStart) merged.sentMilestones = [];
      merged.timerStart = timerStart;
    }
    if (timerMode) merged.timerMode = timerMode;
    if (!merged.sentMilestones) merged.sentMilestones = [];

    await store.setJSON(deviceId, merged);
    return { statusCode: 200, body: JSON.stringify({ stored: true }) };
  } catch (err) {
    return { statusCode: 500, body: err.message };
  }
};
