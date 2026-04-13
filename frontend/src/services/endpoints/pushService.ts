/**
 * Push Notification Service
 *
 * Handles push notification subscription management
 */

import { apiClient } from '../api/apiClient';

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface PushStatus {
  enabled: boolean;
  message: string;
}

/**
 * Get VAPID public key for push subscription
 */
export async function getVapidPublicKey(): Promise<string> {
  const response = await apiClient.get<{ success: boolean; data: { publicKey: string } }>(
    '/push/vapid-key'
  );
  return response.data.publicKey;
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPush(subscription: PushSubscriptionData): Promise<void> {
  await apiClient.post('/push/subscribe', subscription);
}

/**
 * Unsubscribe from push notifications (current device)
 */
export async function unsubscribeFromPush(): Promise<void> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      // Send endpoint to backend so it can remove the subscription
      await apiClient.delete('/push/subscribe', { data: { endpoint: subscription.endpoint } });
      // Unsubscribe from browser push manager
      await subscription.unsubscribe();
    }
  } catch (error) {
    console.error('Failed to unsubscribe from push:', error);
    throw error;
  }
}

/**
 * Unsubscribe from push notifications (all devices)
 */
export async function unsubscribeAllDevices(): Promise<void> {
  await apiClient.delete('/push/subscribe/all');
}

/**
 * Get push notification status
 */
export async function getPushStatus(): Promise<PushStatus> {
  const response = await apiClient.get<{ success: boolean; data: PushStatus }>('/push/status');
  return response.data;
}

/**
 * Convert base64 string to Uint8Array for VAPID key
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Request push notification permission and subscribe
 */
export async function requestPushPermission(): Promise<PushSubscription | null> {
  // Check if push is supported
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications are not supported');
    return null;
  }

  // Request permission
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.warn('Push notification permission denied');
    return null;
  }

  try {
    // Get VAPID public key
    const vapidPublicKey = await getVapidPublicKey();

    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;

    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
    });

    // Send subscription to backend
    const subscriptionJson = subscription.toJSON();
    await subscribeToPush({
      endpoint: subscriptionJson.endpoint!,
      keys: {
        p256dh: subscriptionJson.keys!.p256dh,
        auth: subscriptionJson.keys!.auth,
      },
    });

    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    return null;
  }
}

/**
 * Check if push notifications are currently enabled
 */
export async function isPushEnabled(): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription !== null;
  } catch {
    return false;
  }
}
