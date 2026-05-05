// public/sw.js
// REHAPP SW — v4.1
// Strategy: Cache-first for shell, stale-while-revalidate for assets,
// background sync for activity, periodic sync for daily reset,
// push notifications for fasting milestones, App Badge for streak.

const CACHE_NAME = 'rehapp-v4.1';
const SHELL = ['/'];

// ─── BroadcastChannel for SW↔client comms ────────────────────────────────────
const bc = new BroadcastChannel('rehapp');

// ─── Install: cache app shell ─────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

// ─── Activate: prune old caches, claim clients, register periodic sync ────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Prune stale caches
      caches.keys().then((names) =>
        Promise.all(
          names
            .filter((n) => n !== CACHE_NAME)
            .map((n) => caches.delete(n))
        )
      ),
      // Take control of all open tabs immediately
      self.clients.claim(),
      // Register periodic background sync for daily reset (if supported)
      self.registration.periodicSync?.register('rehapp-daily-reset', {
        minInterval: 12 * 60 * 60 * 1000, // every 12h
      }).catch(() => { /* periodicSync not available, handled in-app */ }),
    ])
  );
});

// ─── Fetch: cache-first for shell, network-first for everything else ──────────
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Ignore chrome-extension, non-http
  if (!url.protocol.startsWith('http')) return;

  // App shell: cache-first
  if (url.pathname === '/' || url.pathname === '/index.html') {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // Vite assets (hashed): cache-first forever (immutable)
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(event.request, { immutable: true }));
    return;
  }

  // Manifest, icons, sw itself: stale-while-revalidate
  if (
    url.pathname.endsWith('.webmanifest') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg')
  ) {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
  }

  // Everything else: network-first with cache fallback
  event.respondWith(networkFirst(event.request));
});

// ─── Caching strategies ───────────────────────────────────────────────────────

async function cacheFirst(request, { immutable = false } = {}) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return offlineFallback(request);
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const networkFetch = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);

  return cached || await networkFetch || offlineFallback(request);
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || offlineFallback(request);
  }
}

function offlineFallback(request) {
  // For navigation requests, serve the app shell
  if (request.mode === 'navigate') {
    return caches.match('/');
  }
  // For other requests, return a minimal offline response
  return new Response(
    JSON.stringify({ error: 'offline', timestamp: Date.now() }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}

// ─── Background Sync: activity log queue ─────────────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'rehapp-activity-sync') {
    event.waitUntil(syncActivityLog());
  }
});

async function syncActivityLog() {
  // If you add a remote backend later, flush queued activity here.
  // For now, notify clients that sync fired (useful for debugging/future use).
  bc.postMessage({ type: 'SYNC_COMPLETE', timestamp: Date.now() });
}

// ─── Periodic Sync: daily reset check ────────────────────────────────────────
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'rehapp-daily-reset') {
    event.waitUntil(checkDailyReset());
  }
});

async function checkDailyReset() {
  // Notify all clients to run their daily reset logic
  const clients = await self.clients.matchAll({ type: 'window' });
  if (clients.length > 0) {
    clients.forEach((client) => client.postMessage({ type: 'DAILY_RESET_CHECK' }));
  }
  // If no clients open, we can't touch localStorage from SW.
  // The app handles this on next open via Store.checkDailyReset().
}

// ─── Push Notifications: fasting milestones ───────────────────────────────────
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'REHAPP', {
      body: data.body || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-96.png',
      tag: data.tag || 'rehapp-notification',
      renotify: true,
      data: data.url ? { url: data.url } : undefined,
      actions: data.actions || [],
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        // Focus existing window if open
        const existing = clients.find((c) => c.url === url && 'focus' in c);
        if (existing) return existing.focus();
        // Otherwise open a new window
        if (self.clients.openWindow) return self.clients.openWindow(url);
      })
  );
});

// ─── Internal push: SW-generated fasting milestone notifications ──────────────
// Called from in-app JS via postMessage when fasting timer hits milestones.
// The SW sends the actual notification so it works even when app is backgrounded.

self.addEventListener('message', async (event) => {
  const { type, payload } = event.data || {};

  switch (type) {
    case 'FASTING_MILESTONE': {
      const { hours, xp } = payload;
      await self.registration.showNotification('REHAPP // CHRONOMETER', {
        body: `${hours}h Fasten erreicht. +${xp} XP`,
        icon: '/icons/icon-192.png',
        badge: '/icons/badge-96.png',
        tag: 'fasting-milestone',
        silent: false,
      });
      break;
    }

    case 'EXERCISE_COMPLETE': {
      const { title, xp } = payload;
      await self.registration.showNotification('REHAPP // PROTOKOLL', {
        body: `${title} abgeschlossen. +${xp ?? 15} XP`,
        icon: '/icons/icon-192.png',
        badge: '/icons/badge-96.png',
        tag: 'exercise-complete',
        silent: true,
      });
      break;
    }

    case 'SET_BADGE': {
      // App Badge API — shows streak count on app icon
      const { count } = payload;
      if (navigator.setAppBadge) {
        count > 0
          ? navigator.setAppBadge(count).catch(() => {})
          : navigator.clearAppBadge().catch(() => {});
      }
      break;
    }

    case 'LOCAL_REMINDER': {
      const { title, body, tag } = payload;
      await self.registration.showNotification(title, {
        body,
        icon:     '/icons/icon-192.png',
        badge:    '/icons/badge-96.png',
        tag,
        renotify: true,
        silent:   false,
      });
      break;
    }

    case 'SKIP_WAITING': {
      self.skipWaiting();
      break;
    }
  }
});