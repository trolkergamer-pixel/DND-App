const CACHE_APP = 'nextturn-app-v1';
const CACHE_CDN = 'nextturn-cdn-v1';

const APP_ASSETS = [
  './NextTurn.html',
  './app.jsx',
  './dice.jsx',
  './i18n.jsx',
  './screens-battle.jsx',
  './screens-campaign.jsx',
  './screens-setup.jsx',
  './tweaks-panel.jsx',
  './manifest.json',
  './icons/icon.svg',
  './icons/icon-maskable.svg',
];

// Pre-cache all app files on install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_APP)
      .then(cache => cache.addAll(APP_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Remove old caches on activate
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k !== CACHE_APP && k !== CACHE_CDN)
          .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // CDN resources (React, Babel, Google Fonts): cache-first, update in background
  const isCDN = url.hostname.includes('unpkg.com') ||
                url.hostname.includes('googleapis.com') ||
                url.hostname.includes('gstatic.com');

  if (isCDN) {
    event.respondWith(
      caches.open(CACHE_CDN).then(cache =>
        cache.match(event.request).then(cached => {
          if (cached) return cached;
          return fetch(event.request)
            .then(response => {
              if (response.ok) cache.put(event.request, response.clone());
              return response;
            })
            .catch(() => cached);
        })
      )
    );
    return;
  }

  // Local app assets: cache-first, then network with cache update
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        const networkFetch = fetch(event.request)
          .then(response => {
            if (response.ok) {
              caches.open(CACHE_APP)
                .then(cache => cache.put(event.request, response.clone()));
            }
            return response;
          })
          .catch(() => cached);

        return cached || networkFetch;
      })
    );
  }
});
