// Liefert den öffentlichen VAPID-Key an den Client, damit er nicht im
// Frontend-Code hartcodiert werden muss. Der Public Key ist per Definition
// nicht geheim — nur VAPID_PRIVATE bleibt serverseitig.
exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') return { statusCode: 405, body: 'Method Not Allowed' };
  const key = process.env.VAPID_PUBLIC;
  if (!key) return { statusCode: 500, body: 'VAPID_PUBLIC nicht konfiguriert' };
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key }),
  };
};
