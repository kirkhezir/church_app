/**
 * Service Worker for Push Notifications
 *
 * Handles background push notification events
 */

// Cache version
const CACHE_VERSION = 'v1';
const CACHE_NAME = `church-app-${CACHE_VERSION}`;

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  event.waitUntil(self.clients.claim());
});

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
