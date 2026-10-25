/* PintaKids — funciona sem internet: guarda os arquivos do app no aparelho.
   Ao publicar uma versão nova, aumente VERSION para os aparelhos atualizarem. */
const VERSION = 'pintakids-v1';
const FILES = [
  './', './index.html', './manifest.webmanifest', './css/style.css',
  './js/storage.js', './js/sfx.js', './js/drawings.js', './js/catalog.js',
  './js/brushes.js', './js/painter.js', './js/score.js', './js/app.js',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png',
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// rede primeiro (pega atualizações), cache como reserva (funciona offline)
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request, new URL(e.request.url).origin === location.origin ? { cache: 'no-cache' } : {}).then((res) => {
      if (res && (res.ok || res.type === 'opaque')) { const cp = res.clone(); caches.open(VERSION).then((c) => c.put(e.request, cp)); }
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match('./index.html')))
  );
});
