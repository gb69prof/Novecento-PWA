const CACHE = 'pirandello-pwa-v2';
const OFFLINE_URL = './offline.html';
const PRECACHE = [
  './', './index.html', './styles.css', './app.js', './highlight.js', './pwa.js', './manifest.json', './offline.html',
  './icons/icon-180.png', './icons/icon-192.png', './icons/icon-512.png',
  './assets/Mondo-Pirandello.png', './assets/Umorismo-Pirandello.jpeg.png', './assets/Mattia-Pirandello.jpeg.png', './assets/Uno-nessuno-centomila.png', './assets/Cosi2.png', './assets/Sei-1.png', './assets/IMG_3679.png', './assets/IMG_3697.jpeg', './assets/IMG_3728.jpeg', './assets/Conclusione.png',
  './1-pirandello-visione-del-mondo.html', './2-pirandello-umorismo.html', './3-pirandello-fu-mattia-pascal.html', './4-pirandello-uno-nessuno-centomila.html', './5-pirandello-cosi-e-se-vi-pare.html', './6-pirandello-sei-personaggi.html', './7-pirandello-novelle.html', './8-pirandello-romanzi.html', './9-pirandello-teatro.html', './10-pirandello-conclusione.html'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then(r => r || caches.match('./index.html') || caches.match(OFFLINE_URL))));
    return;
  }

  const ext = url.pathname.split('.').pop().toLowerCase();
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'ico'].includes(ext)) {
    event.respondWith(caches.match(req).then(cached => cached || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
      return res;
    })));
    return;
  }

  event.respondWith(caches.match(req).then(cached => cached || fetch(req).then(res => {
    const copy = res.clone();
    caches.open(CACHE).then(c => c.put(req, copy));
    return res;
  }).catch(() => caches.match(OFFLINE_URL))));
});
