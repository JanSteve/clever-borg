// Cinexa Service Worker - Network-First for navigation & HTML, Cache-First for static assets
const CACHE_NAME = 'cinexa-v4.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/css/player.css',
  '/js/auth.js?v=4.0',
  '/js/movies-data.js?v=4.0',
  '/js/tmdb-service.js?v=4.0',
  '/js/player.js?v=4.0',
  '/js/app.js?v=4.0',
  '/manifest.json'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing legacy cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  
  if (url.pathname.startsWith('/api/') || url.hostname.includes('quge5.com') || url.hostname.includes('vidsrc') || url.hostname.includes('firebase')) {
    return; // Pass network directly
  }

  // Network-First for HTML navigation so users always see the latest platform updates
  if (e.request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('.html')) {
    e.respondWith(
      fetch(e.request).then((res) => {
        if (res && res.status === 200) {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone));
        }
        return res;
      }).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Cache-First with Network Fallback for assets
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone));
        }
        return res;
      });
    })
  );
});
