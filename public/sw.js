// Cinexa Service Worker - Cache-First for static assets, Network-First for API
const CACHE_NAME = 'cinexa-v2.5';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/player.css',
  '/js/movies-data.js',
  '/js/tmdb-service.js',
  '/js/player.js',
  '/js/app.js',
  '/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // Only cache GET requests and non-API/stream URLs
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  
  if (url.pathname.startsWith('/api/') || url.hostname.includes('quge5.com') || url.hostname.includes('vidsrc')) {
    return; // Pass network directly
  }

  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone));
        }
        return res;
      }).catch(() => caches.match('/index.html'));
    })
  );
});
