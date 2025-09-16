/**
 * Service Worker for Nature Power Learning App
 * Provides offline support, caching, and performance optimization
 */

const CACHE_NAME = 'nature-power-v1.0.0';
const CACHE_PREFIX = 'nature-power';

// Files to cache for offline functionality
const STATIC_CACHE_FILES = [
  '/',
  '/index.html',
  '/learn.html',
  '/digital-citizenship.html',
  '/build.html',
  '/gallery.html',
  '/teacher.html',
  
  // CSS files
  '/css/styles.css',
  '/css/components.css',
  '/css/widgets.css',
  '/css/digital-citizenship.css',
  
  // JavaScript files
  '/js/app.js',
  '/js/utils/toast.js',
  '/js/utils/journal.js',
  '/js/utils/accessibility.js',
  '/js/widgets/wonder-slider.js',
  '/js/widgets/weather-explorer.js',
  '/js/widgets/houses-widget.js',
  '/js/widgets/circuits-widget.js',
  '/js/widgets/design-tester.js',
  '/js/widgets/digital-citizenship.js',
  
  // External resources
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@600;700&display=swap'
];

// Runtime cache patterns
const CACHE_STRATEGIES = {
  documents: 'networkFirst',
  scripts: 'cacheFirst',
  styles: 'cacheFirst',
  images: 'cacheFirst',
  api: 'networkFirst'
};

// Cache duration in seconds
const CACHE_DURATIONS = {
  short: 300,     // 5 minutes
  medium: 3600,   // 1 hour
  long: 86400,    // 24 hours
  week: 604800    // 1 week
};

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static resources...');
        return cache.addAll(STATIC_CACHE_FILES);
      })
      .then(() => {
        console.log('[SW] Static resources cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Error caching static resources:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.startsWith(CACHE_PREFIX) && cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Determine cache strategy based on request type
  const strategy = getCacheStrategy(request);
  
  event.respondWith(
    handleRequest(request, strategy)
  );
});

// Message event - handle communication with main thread
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_CACHE_STATUS':
      getCacheStatus().then((status) => {
        event.ports[0].postMessage({ type: 'CACHE_STATUS', data: status });
      });
      break;
      
    case 'CLEAR_CACHE':
      clearCache(data.cacheName).then((success) => {
        event.ports[0].postMessage({ type: 'CACHE_CLEARED', data: { success } });
      });
      break;
      
    case 'PRECACHE_RESOURCES':
      precacheResources(data.resources).then((result) => {
        event.ports[0].postMessage({ type: 'PRECACHE_COMPLETE', data: result });
      });
      break;
  }
});

// Background sync for journal data
self.addEventListener('sync', (event) => {
  if (event.tag === 'journal-sync') {
    event.waitUntil(syncJournalData());
  }
});

// Push notifications (for future teacher notifications)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/icons/icon-192.png',
        badge: '/icons/badge-72.png',
        tag: data.tag || 'default',
        requireInteraction: data.requireInteraction || false,
        actions: data.actions || []
      })
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action) {
    // Handle action buttons
    handleNotificationAction(event.action, event.notification.data);
  } else {
    // Handle main notification click
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper functions
function getCacheStrategy(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Documents (HTML)
  if (request.destination === 'document' || pathname.endsWith('.html')) {
    return CACHE_STRATEGIES.documents;
  }
  
  // Scripts
  if (request.destination === 'script' || pathname.endsWith('.js')) {
    return CACHE_STRATEGIES.scripts;
  }
  
  // Styles
  if (request.destination === 'style' || pathname.endsWith('.css')) {
    return CACHE_STRATEGIES.styles;
  }
  
  // Images
  if (request.destination === 'image' || /\.(png|jpg|jpeg|gif|svg|webp)$/.test(pathname)) {
    return CACHE_STRATEGIES.images;
  }
  
  // API calls (if any)
  if (pathname.startsWith('/api/')) {
    return CACHE_STRATEGIES.api;
  }
  
  // Default to network first
  return CACHE_STRATEGIES.documents;
}

async function handleRequest(request, strategy) {
  switch (strategy) {
    case 'cacheFirst':
      return cacheFirst(request);
    case 'networkFirst':
      return networkFirst(request);
    case 'staleWhileRevalidate':
      return staleWhileRevalidate(request);
    default:
      return networkFirst(request);
  }
}

async function cacheFirst(request) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Check if cache is stale
      const cacheTime = new Date(cachedResponse.headers.get('sw-cache-time') || 0);
      const maxAge = getCacheMaxAge(request);
      const isStale = Date.now() - cacheTime.getTime() > maxAge * 1000;
      
      if (!isStale) {
        return cachedResponse;
      }
    }
    
    // Fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      const responseToCache = networkResponse.clone();
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cache-time', new Date().toISOString());
      
      const modifiedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });
      
      await cache.put(request, modifiedResponse);
    }
    
    return networkResponse;
  } catch (error) {
    // Return cached version if available
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for documents
    if (request.destination === 'document') {
      return createOfflinePage();
    }
    
    throw error;
  }
}

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      const responseToCache = networkResponse.clone();
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cache-time', new Date().toISOString());
      
      const modifiedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });
      
      await cache.put(request, modifiedResponse);
    }
    
    return networkResponse;
  } catch (error) {
    // Try cache
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for documents
    if (request.destination === 'document') {
      return createOfflinePage();
    }
    
    throw error;
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  const networkResponsePromise = fetch(request).then((networkResponse) => {
    if (networkResponse && networkResponse.status === 200) {
      const responseToCache = networkResponse.clone();
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cache-time', new Date().toISOString());
      
      const modifiedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });
      
      cache.put(request, modifiedResponse);
    }
    return networkResponse;
  }).catch(() => null);
  
  return cachedResponse || networkResponsePromise;
}

function getCacheMaxAge(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Static assets can be cached longer
  if (pathname.includes('/css/') || pathname.includes('/js/') || pathname.includes('/images/')) {
    return CACHE_DURATIONS.week;
  }
  
  // HTML files should be cached for shorter periods
  if (pathname.endsWith('.html') || pathname === '/') {
    return CACHE_DURATIONS.medium;
  }
  
  // Default cache duration
  return CACHE_DURATIONS.long;
}

function createOfflinePage() {
  const offlineHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Offline - Nature Power Learning</title>
        <style>
            body {
                font-family: 'Inter', sans-serif;
                margin: 0;
                padding: 40px 20px;
                background: #F9FAFB;
                text-align: center;
                color: #111827;
            }
            .offline-container {
                max-width: 600px;
                margin: 0 auto;
                background: white;
                padding: 60px 40px;
                border-radius: 16px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            .offline-icon {
                font-size: 4rem;
                margin-bottom: 20px;
            }
            .offline-title {
                font-size: 2rem;
                font-weight: 700;
                margin-bottom: 20px;
                color: #3A86FF;
            }
            .offline-message {
                font-size: 1.1rem;
                line-height: 1.6;
                margin-bottom: 30px;
                color: #6B7280;
            }
            .retry-btn {
                background: #3A86FF;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.2s ease;
            }
            .retry-btn:hover {
                background: #2563EB;
            }
            .offline-features {
                margin-top: 40px;
                text-align: left;
            }
            .feature-item {
                margin-bottom: 10px;
                color: #6B7280;
            }
        </style>
    </head>
    <body>
        <div class="offline-container">
            <div class="offline-icon">🌱</div>
            <h1 class="offline-title">You're offline</h1>
            <p class="offline-message">
                Don't worry! You can still access previously visited pages and your saved journal entries.
                We'll reconnect automatically when your internet is back.
            </p>
            <button class="retry-btn" onclick="window.location.reload()">Try Again</button>
            
            <div class="offline-features">
                <h3>What you can still do:</h3>
                <div class="feature-item">✓ View your saved journal entries</div>
                <div class="feature-item">✓ Continue working on cached activities</div>
                <div class="feature-item">✓ Save new work locally</div>
                <div class="feature-item">✓ Export your learning progress</div>
            </div>
        </div>
    </body>
    </html>
  `;
  
  return new Response(offlineHTML, {
    status: 200,
    statusText: 'OK',
    headers: {
      'Content-Type': 'text/html'
    }
  });
}

async function getCacheStatus() {
  const cache = await caches.open(CACHE_NAME);
  const keys = await cache.keys();
  
  return {
    cacheName: CACHE_NAME,
    totalItems: keys.length,
    cacheSize: await calculateCacheSize(cache),
    lastUpdated: new Date().toISOString()
  };
}

async function calculateCacheSize(cache) {
  const keys = await cache.keys();
  let totalSize = 0;
  
  for (const request of keys) {
    try {
      const response = await cache.match(request);
      if (response && response.body) {
        const reader = response.body.getReader();
        let size = 0;
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.length;
        }
        
        totalSize += size;
      }
    } catch (error) {
      console.warn('[SW] Error calculating size for:', request.url);
    }
  }
  
  return totalSize;
}

async function clearCache(cacheName) {
  try {
    if (cacheName) {
      return await caches.delete(cacheName);
    } else {
      const cacheNames = await caches.keys();
      const results = await Promise.all(
        cacheNames.map(name => caches.delete(name))
      );
      return results.every(result => result);
    }
  } catch (error) {
    console.error('[SW] Error clearing cache:', error);
    return false;
  }
}

async function precacheResources(resources) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const results = await Promise.allSettled(
      resources.map(url => cache.add(url))
    );
    
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;
    
    return {
      successful,
      failed,
      total: resources.length
    };
  } catch (error) {
    console.error('[SW] Error precaching resources:', error);
    return {
      successful: 0,
      failed: resources.length,
      total: resources.length
    };
  }
}

async function syncJournalData() {
  // This would sync local journal data with a server if implemented
  console.log('[SW] Syncing journal data...');
  
  try {
    // Get journal data from IndexedDB or localStorage
    const clients = await self.clients.matchAll();
    
    for (const client of clients) {
      client.postMessage({
        type: 'SYNC_JOURNAL',
        data: { status: 'started' }
      });
    }
    
    // Implement actual sync logic here
    
    for (const client of clients) {
      client.postMessage({
        type: 'SYNC_JOURNAL',
        data: { status: 'completed' }
      });
    }
    
    console.log('[SW] Journal sync completed');
  } catch (error) {
    console.error('[SW] Journal sync failed:', error);
  }
}

function handleNotificationAction(action, data) {
  switch (action) {
    case 'view-progress':
      return clients.openWindow('/teacher.html#progress');
    case 'moderate-gallery':
      return clients.openWindow('/gallery.html?moderate=true');
    default:
      return clients.openWindow('/');
  }
}

// Performance monitoring
function trackPerformance() {
  // Track cache hit rates, response times, etc.
  // This data could be sent to analytics if implemented
}

console.log('[SW] Service worker script loaded');
