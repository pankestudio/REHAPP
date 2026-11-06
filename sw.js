const CACHE_NAME = 'rehapp-2026-11-06-runde6a'; // Bump bei jedem Deploy
const ASSETS_REQUIRED = ['./', './index.html', './manifest.webmanifest'];
const ASSETS_OPTIONAL = [
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/shortcut-wasser.png',
  './icons/shortcut-checkin.png',
  './fonts/HostGrotesk-latin.woff2',
  './fonts/HostGrotesk-latin-ext.woff2'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(ASSETS_REQUIRED).then(() =>
        Promise.allSettled(
          ASSETS_OPTIONAL.map(url => cache.add(url).catch(() => {}))
        )
      )
    )
  );
  // Kein automatisches skipWaiting() mehr (Runde 5c Punkt 1): ein Update
  // bleibt "waiting", bis die Person unten auf "Neue Version – Neu laden"
  // tippt (index.html schickt dann SKIP_WAITING per postMessage). Beim
  // allerersten Install gibt es ohnehin keinen Controller, der warten
  // müsste — der Worker aktiviert sich dann sofort von selbst.
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('push', event => {
  const data = event.data?.json() ?? { title: 'REHAPP', body: '' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: './icons/icon-192.png',
      badge: './icons/icon-192.png',
      tag: 'rehapp-push'
    })
  );
});

// index.html/Navigationen: network-first (Runde 5c Punkt 1) — eine neue
// Version muss sofort vom Netz kommen, damit updatefound/installed zuverlässig
// feuert; Cache nur als Offline-Fallback. Alles andere (Fonts, Icons,
// Manifest) bleibt cache-first wie bisher — ändert sich praktisch nie und
// profitiert vom schnellen Offline-Zugriff.
function isAppShellRequest(request) {
  return request.mode === 'navigate' || request.url.endsWith('/index.html') || request.url === self.location.origin + '/';
}

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  if (isAppShellRequest(event.request)) {
    event.respondWith(
      fetch(event.request).then(response => {
        caches.open(CACHE_NAME).then(c => c.put(event.request, response.clone()));
        return response;
      }).catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (event.request.url.startsWith(self.location.origin)) {
          caches.open(CACHE_NAME).then(c => c.put(event.request, response.clone()));
        }
        return response;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
