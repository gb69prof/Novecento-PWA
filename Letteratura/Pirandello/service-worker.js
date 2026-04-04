self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open('pirandello-v1').then(cache => {
      return cache.addAll([
        './',
        './index.html',
        './manifest.json',
        './offline.html'
      ]);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(() => caches.match('./offline.html'));
    })
  );
});