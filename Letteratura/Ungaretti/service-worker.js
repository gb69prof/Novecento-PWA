
const CACHE_VERSION = 'ungaretti-pwa-v2';
const APP_SHELL = [
  './', './index.html', './styles.css', './app.js', './highlight.js', './pwa.js', './manifest.json', './offline.html',
  './assets/Ungaretti-Foto.png',
  './assets/Ungaretti-Filosofia-base.png', './assets/Ungaretti-frattura.png', './assets/Ungaretti-immagine-mondo.png', './assets/Ungaretti-poetica.png', './assets/Ungaretti-opere.png', './assets/ungaretti-conclusione.png',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png',
  './1-ungaretti-filosofia-base.html', './2-ungaretti-frattura-sentimento-base.html', './3-ungaretti-immagine-del-mondo.html', './4-ungaretti-poetica.html', './5-ungaretti-opere-principali.html', './6-ungaretti-conclusione.html'
];
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('message', (event) => { if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting(); });
function staleWhileRevalidate(request, cacheName = CACHE_VERSION){
  return caches.open(cacheName).then(async (cache) => {
    const cached = await cache.match(request);
    const network = fetch(request).then((response) => {
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    }).catch(() => cached);
    return cached || network;
  });
}
function networkFirst(request, fallback = './offline.html'){
  return fetch(request).then((response) => {
    const clone = response.clone(); caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone)); return response;
  }).catch(async () => (await caches.match(request)) || caches.match(fallback));
}
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const dest = request.destination;
  if (request.mode === 'navigate') { event.respondWith(networkFirst(request)); return; }
  if (['style','script','worker','manifest','font','image'].includes(dest)) { event.respondWith(staleWhileRevalidate(request)); return; }
  if (/(\.pdf|\.glb|\.gltf|\.mp4|\.webm)$/i.test(url.pathname)) { event.respondWith(staleWhileRevalidate(request)); return; }
});
