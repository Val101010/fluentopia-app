const CACHE_NAME = 'fluentopia-v5';
const APP_SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) { if ('focus' in client) return client.focus(); }
      if (self.clients.openWindow) return self.clients.openWindow('./');
    })
  );
});

// Doar fișierele aplicației (același domeniu) trec prin service worker.
// Firebase/Firestore, YouTube, fonturi etc. merg direct la rețea — altfel conexiunile Firestore (care țin deschis un flux)
// erau copiate în cache și încetineau aplicația, iar când nu exista copie apărea eroarea „Failed to convert value to 'Response'".
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    fetch(req, { cache: 'no-cache' })
      .then((res) => {
        if (res && res.ok && res.type === 'basic') { const copy = res.clone(); event.waitUntil(caches.open(CACHE_NAME).then((c) => c.put(req, copy)).catch(() => {})); }
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match('./index.html')).then((hit) => hit || Response.error()))
  );
});
