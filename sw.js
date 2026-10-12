// Reisetavla service worker
// Appskallet caches slik at appen åpner raskt og uten nett.
// Rutedata og kjøretøyposisjoner fra Entur caches ALDRI – de skal alltid være ferske.
// Øk VERSION ved hver publisering som endrer ikoner eller manifest.
const VERSION = 'reisetavla-v12';
const SHELL = ['./', 'index.html', 'kart.html', 'app/dist/app.js', 'app/dist/app.css', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

const fresh = (req, key) => fetch(req, { cache: 'no-cache' })   // spør alltid serveren om ny versjon
  .then(r => { if (r.ok) { const copy = r.clone(); caches.open(VERSION).then(c => c.put(key || req, copy)); } return r; })
  .catch(() => caches.match(key || req));

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;            // GraphQL-kall (POST) går rett til nettet
  if (url.hostname.endsWith('entur.io')) return;      // aldri cache sanntidsdata
  if (url.hostname.includes('kartverket') || url.hostname.includes('openstreetmap')) return;      // kartfliser hentes rett fra nettet

  // Sider: nett først, cache som reserve (ny versjon slår inn med en gang)
  if (e.request.mode === 'navigate') {
    e.respondWith(fresh(e.request, url.pathname.endsWith('kart.html') ? 'kart.html' : 'index.html'));
    return;
  }
  // Appens egne skript og stiler: nett først, så en ny versjon av appen slår inn ved neste åpning
  if (url.origin === location.origin && /\.(js|css)$/.test(url.pathname)) { e.respondWith(fresh(e.request)); return; }

  // Ikoner, fonter og Leaflet: cache først
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
    if (r.ok && (url.origin === location.origin || url.hostname.includes('fonts.g') || url.hostname === 'cdnjs.cloudflare.com')) {
      const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy));
    }
    return r;
  })));
});
