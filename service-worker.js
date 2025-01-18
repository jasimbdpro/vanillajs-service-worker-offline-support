const CACHE_NAME = 'offline-cache-v1'; // Name of the cache
const URLS_TO_CACHE = [
  '/',            // Root directory for the site
  '/index.html',  // Main HTML file
  '/styles.css',  // Add your CSS here
]; 

// Install Event - Cache necessary resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and cached resources');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
  self.skipWaiting(); // Force the service worker to activate immediately
});

// Activate Event - Clean up old caches if needed
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Start controlling all clients immediately
});

// Fetch Event - Serve from cache if offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // If found in cache, return the cached response
      return response || fetch(event.request)
        .catch(() => {
          // If both cache and fetch fail, optionally return a fallback
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
    })
  );
});
