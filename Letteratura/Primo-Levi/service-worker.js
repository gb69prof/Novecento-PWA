
const CACHE = 'levi-pwa-v2';
const OFFLINE_URL = './offline.html';
const PRECACHE = [
  './', './index.html', './styles.css', './app.js', './highlight.js', './pwa.js', './manifest.json', './offline.html',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png',
  './assets/Levi-conclusione.png', './assets/Levi-filosofia-base.png', './assets/Levi-foto-colori.png', './assets/Levi-frattura.png', './assets/Levi-immagine-mondo.png', './assets/Levi-poetica.png', './assets/Primo_Levi_bianco_e_nero.JPG',
  './1-primo-levi-vita.html', './2-primo-levi-filosofia-base.html', './3-primo-levi-frattura-sentimento-base.html', './4-primo-levi-immagine-del-mondo.html', './5-primo-levi-poetica.html', './6-primo-levi-opere-principali.html', './7-primo-levi-conclusione.html'
];
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(PRECACHE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('message', event => { if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === location.origin;
  if (!sameOrigin) return;
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; }).catch(() => caches.match(req).then(r => r || caches.match('./index.html') || caches.match(OFFLINE_URL))));
    return;
  }
  const ext = url.pathname.split('.').pop().toLowerCase();
  if (['png','jpg','jpeg','webp','gif','svg','ico'].includes(ext)) {
    event.respondWith(caches.match(req).then(cached => cached || fetch(req).then(res => { const copy=res.clone(); caches.open(CACHE).then(c=>c.put(req,copy)); return res; })));
    return;
  }
  event.respondWith(caches.match(req).then(cached => cached || fetch(req).then(res => { const copy=res.clone(); caches.open(CACHE).then(c=>c.put(req,copy)); return res; }).catch(() => caches.match(OFFLINE_URL))));
});
