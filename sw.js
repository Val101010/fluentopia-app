const CACHE_NAME = 'fluentopia-v6';
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

// Aplicația pornește imediat din copia salvată pe dispozitiv, iar în fundal se descarcă versiunea nouă.
// (Dacă profesorul a publicat o versiune mai nouă, aplicația veche se reîncarcă singură — vezi „versiunea minimă".)
// Firebase/Firestore, YouTube etc. NU trec prin aici: merg direct la rețea.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(req).then((hit) => {
        const fresh = fetch(req, { cache: 'no-cache' }).then((res) => {
          if (res && res.ok && res.type === 'basic') cache.put(req, res.clone()).catch(() => {});
          return res;
        }).catch(() => hit || caches.match('./index.html').then((h) => h || Response.error()));
        if (hit) { event.waitUntil(fresh.catch(() => {})); return hit; }
        return fresh;
      })
    )
  );
});
