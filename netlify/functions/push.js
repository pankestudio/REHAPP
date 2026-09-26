const webpush = require('web-push');

// Direkter Relay für einen einzelnen, sofortigen Push (z.B. manueller Test
// aus der Konsole). Für automatische Fasten-Meilensteine siehe push-check.js
// — die serverseitige Zeitplanung, die auch bei geschlossenem Browser feuert.
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (err) {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const { subscription, title, body: msg } = body;
  if (!subscription) return { statusCode: 400, body: 'subscription fehlt' };

  try {
    webpush.setVapidDetails(
      process.env.VAPID_EMAIL,
      process.env.VAPID_PUBLIC,
      process.env.VAPID_PRIVATE
    );
    await webpush.sendNotification(subscription, JSON.stringify({ title, body: msg }));
    return { statusCode: 200 };
  } catch (err) {
    return { statusCode: err.statusCode || 500, body: err.message };
  }
};
