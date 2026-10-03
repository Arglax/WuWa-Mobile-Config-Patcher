const CACHE_NAME = 'wuwa-docs-cache-v1.9.0';

const PRECACHE_URLS = [
  './',
  './index.html',
  './404.html',
  './manifest.webmanifest',
  './css/style.css',
  './js/main.js',
  './js/ai-chat.js',
  './js/ai-knowledge.js',
  './js/code-copy.js',
  './js/formatter.js',
  './js/i18n.js',
  './js/metadata.js',
  './js/modal.js',
  './js/search.js',
  './js/theme.js',
  './assets/ai-knowledge.json',
  './assets/img_allowshizuku.jpg',
  './assets/img_appblock.jpg',
  './assets/img_configDeleted.jpg',
  './assets/img_configpatch_success.jpg',
  './assets/img_reverttoVanilla.jpg',
  './assets/img_security_passed.jpg',
  './app-version.txt',
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
  './pages/enable-csharp.html',
  './pages/manual-method.html',
  './pages/troubleshooting.html',
  './pages/bug-reporting.html'
];

// Install Event: Pre-cache assets individually with resilience
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[ServiceWorker] Pre-caching offline assets individually');
      return Promise.allSettled(
        PRECACHE_URLS.map(url =>
          cache.add(url).catch(err => {
            console.warn('[ServiceWorker] Failed to cache asset:', url, err);
          })
        )
      );
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

// Fetch Event: Stale-While-Revalidate & Network-First Strategies
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  const url = new URL(event.request.url);

  // Network-First strategy for dynamic version and knowledge resources
  if (url.pathname.endsWith('app-version.txt') || url.pathname.endsWith('ai-knowledge.json')) {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Stale-While-Revalidate strategy for static app shell
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(cachedResponse => {
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
            // Offline fallback page for HTML navigation requests
            if (event.request.mode === 'navigate') {
              return cache.match('./404.html') || cache.match('./index.html');
            }
          });

        return cachedResponse || fetchPromise;
      });
    })
  );
});
