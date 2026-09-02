const CACHE_NAME = 'wuwa-docs-cache-v1.5.1';

const PRECACHE_URLS = [
  './',
  './index.html',
  './css/style.css',
  './js/main.js',
  './js/ai-chat.js',
  './js/ai-knowledge.js',
  './js/code-copy.js',
  './js/formatter.js',
  './js/metadata.js',
  './js/modal.js',
  './js/search.js',
  './js/theme.js',
  './assets/ai-knowledge.json',
  './app-version.txt',
  './images/logo.png',
  './images/logo.jpg',
  './images/csharp.jpg',
  './images/oneline.jpg',
  './images/smart.jpg',
  './images/text.jpg',
  './pages/setup-shizuku.html',
  './pages/patching-configs.html',
  './pages/config-editor.html',
  './pages/utilities-diagnostics.html',
  './pages/advanced-tools.html',
  './pages/manual-method.html',
  './pages/troubleshooting.html',
  './pages/bug-reporting.html'
];

// Install Event: Pre-cache the App Shell
self.addEventListener('install', event => {
  self.skipWaiting(); // Force the new service worker to activate immediately
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Pre-caching offline assets');
        return cache.addAll(PRECACHE_URLS);
      })
  );
});

// Activate Event: Clean up old caches when the version increments
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Stale-While-Revalidate Strategy
self.addEventListener('fetch', event => {
  // Ignore non-GET requests (like the POST to the Gemini AI API)
  if (event.request.method !== 'GET') return;

  // Ignore cross-origin requests unless they are specific CDNs you want to cache
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(cachedResponse => {
        
        // Fetch the fresh version from the network in the background
        const fetchedResponse = fetch(event.request).then(networkResponse => {
          // Only cache valid HTTP 200 responses
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // Network failed (offline) - do nothing, the cached response will be returned
        });

        // Return the cached response immediately if we have it, otherwise wait for the network
        return cachedResponse || fetchedResponse;
      });
    })
  );
});