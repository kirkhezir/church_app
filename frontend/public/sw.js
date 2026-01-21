/**
 * Service Worker for Push Notifications and Offline Support
 *
 * Handles background push notification events and caching
 */

// Cache version - using build timestamp for automatic cache busting
// This will be replaced during build process
const BUILD_TIMESTAMP = '__BUILD_TIMESTAMP__';
const CACHE_VERSION = `v${BUILD_TIMESTAMP}`;
const STATIC_CACHE = `church-app-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `church-app-dynamic-${CACHE_VERSION}`;
const API_CACHE = `church-app-api-${CACHE_VERSION}`;

console.log('Service Worker Cache Version:', CACHE_VERSION);

// Assets to cache on install
const STATIC_ASSETS = ['/', '/index.html', '/manifest.json', '/offline.html'];

// API endpoints to cache
const CACHEABLE_API_ROUTES = ['/api/v1/events', '/api/v1/announcements', '/api/v1/members'];

// Cache expiration times (in seconds)
const CACHE_EXPIRATION = {
  static: 7 * 24 * 60 * 60, // 7 days
  api: 5 * 60, // 5 minutes
  dynamic: 24 * 60 * 60, // 1 day
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing with version:', CACHE_VERSION);
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Failed to cache some assets:', err);
        // Continue even if some assets fail
      });
    })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean old caches and notify clients
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating with version:', CACHE_VERSION);
  event.waitUntil(
    Promise.all([
      // Delete old caches
      caches.keys().then((keys) => {
        return Promise.all(
          keys
            .filter((key) => {
              return (
                key.startsWith('church-app-') &&
                key !== STATIC_CACHE &&
                key !== DYNAMIC_CACHE &&
                key !== API_CACHE
              );
            })
            .map((key) => {
              console.log('Deleting old cache:', key);
              return caches.delete(key);
            })
        );
      }),
      // Take control of all clients immediately
      self.clients.claim().then(() => {
        // Notify all clients about the update
        return self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: 'SW_UPDATED',
              version: CACHE_VERSION,
            });
          });
        });
      }),
    ])
  );
});

// Message event - handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key.startsWith('church-app-')) {
              console.log('Manually clearing cache:', key);
              return caches.delete(key);
            }
          })
        );
      })
    );
  }
});

// Fetch event - network first with cache fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // API requests - network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithCache(request, API_CACHE));
    return;
  }

  // HTML pages - always network first to get latest version
  if (url.pathname.endsWith('.html') || url.pathname === '/' || !url.pathname.includes('.')) {
    event.respondWith(networkFirstWithCache(request, DYNAMIC_CACHE));
    return;
  }

  // Static assets (JS, CSS, images) - cache first for performance
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirstWithNetwork(request, STATIC_CACHE));
    return;
  }

  // Other dynamic content - network first
  event.respondWith(networkFirstWithCache(request, DYNAMIC_CACHE));
});

// Cache strategies
async function networkFirstWithCache(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    // Return offline response for API
    return new Response(JSON.stringify({ error: 'Offline', message: 'No internet connection' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 503,
    });
  }
}

async function cacheFirstWithNetwork(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  try {
    const response = await fetch(request);
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    return caches.match('/offline.html');
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cached = await caches.match(request);
  const fetchPromise = fetch(request).then((response) => {
    caches.open(cacheName).then((cache) => {
      cache.put(request, response.clone());
    });
    return response;
  });
  return cached || fetchPromise;
}

function isStaticAsset(pathname) {
  const staticExtensions = [
    '.js',
    '.css',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.svg',
    '.ico',
    '.woff',
    '.woff2',
  ];
  return staticExtensions.some((ext) => pathname.endsWith(ext));
}

// Push notification event
self.addEventListener('push', (event) => {
  if (!event.data) {
    console.log('Push event but no data');
    return;
  }

  try {
    const data = event.data.json();
    console.log('Push notification received:', data);

    const options = {
      body: data.body || 'New notification',
      icon: data.icon || '/icons/icon-192x192.png',
      badge: data.badge || '/icons/badge-72x72.png',
      tag: data.tag || 'default',
      data: data.data || {},
      actions: data.actions || [],
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false,
    };

    // Add vibration pattern for important notifications
    if (data.priority === 'high' || data.type === 'urgent') {
      options.vibrate = [200, 100, 200];
    }

    event.waitUntil(self.registration.showNotification(data.title || 'Church App', options));
  } catch (error) {
    console.error('Error showing push notification:', error);
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.notification.tag);

  event.notification.close();

  // Get the notification data
  const data = event.notification.data || {};
  let url = '/';

  // Determine URL based on notification type
  switch (data.type) {
    case 'event':
      url = data.eventId ? `/events/${data.eventId}` : '/events';
      break;
    case 'announcement':
      url = data.announcementId ? `/announcements/${data.announcementId}` : '/announcements';
      break;
    case 'message':
      url = data.messageId ? `/messages/${data.messageId}` : '/messages';
      break;
    default:
      url = data.url || '/';
  }

  // Handle action buttons
  if (event.action) {
    switch (event.action) {
      case 'view':
        // Open the specific item
        break;
      case 'dismiss':
        // Just close the notification (already done)
        return;
      case 'rsvp':
        url = data.eventId ? `/events/${data.eventId}/rsvp` : url;
        break;
    }
  }

  // Open the app or focus existing window
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          // Navigate to the URL if different
          if (client.url !== url) {
            client.navigate(url);
          }
          return;
        }
      }
      // If no window is open, open a new one
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('Notification dismissed:', event.notification.tag);
});

// Push subscription change event
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('Push subscription changed');

  event.waitUntil(
    // Re-subscribe with new subscription
    self.registration.pushManager
      .subscribe({
        userVisibleOnly: true,
        // applicationServerKey will need to be fetched from the server
      })
      .then((subscription) => {
        console.log('Re-subscribed to push notifications');
        // Send new subscription to server
        return fetch('/api/v1/push/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subscription.toJSON()),
        });
      })
      .catch((error) => {
        console.error('Failed to re-subscribe:', error);
      })
  );
});
