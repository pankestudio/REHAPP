const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (err) {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const { deviceId } = body;
  if (!deviceId || typeof deviceId !== 'string') {
    return { statusCode: 400, body: 'deviceId fehlt' };
  }

  try {
    const store = getStore('push-subscriptions');
    await store.delete(deviceId);
    return { statusCode: 200 };
  } catch (err) {
    return { statusCode: 500, body: err.message };
  }
};
