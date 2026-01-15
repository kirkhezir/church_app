import webpush, { PushSubscription, SendResult } from 'web-push';
import { logger } from '../logging/logger';
import prisma from '../database/prismaClient';

/**
 * Push Notification Service
 *
 * Handles web push notifications for the church app.
 * Uses the Web Push Protocol with VAPID authentication.
 */

// VAPID configuration from environment variables
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@singburi-adventist.org';

// Notification payload types
interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
  url?: string;
}

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

// Subscription data from client
interface ClientSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

class PushNotificationService {
  private isConfigured = false;

  constructor() {
    this.configure();
  }

  /**
   * Configure VAPID details
   */
  private configure(): void {
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      logger.warn('VAPID keys not configured. Push notifications disabled.');
      logger.info('Generate VAPID keys with: npx web-push generate-vapid-keys');
      return;
    }

    try {
      webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
      this.isConfigured = true;
      logger.info('Push notification service configured');
    } catch (error) {
      logger.error('Failed to configure push notifications', { error });
    }
  }

  /**
   * Check if push notifications are enabled
   */
  isEnabled(): boolean {
    return this.isConfigured;
  }

  /**
   * Get the public VAPID key for client subscription
   */
  getPublicKey(): string | null {
    return VAPID_PUBLIC_KEY || null;
  }

  /**
   * Save a push subscription for a member
   */
  async saveSubscription(memberId: string, subscription: ClientSubscription): Promise<boolean> {
    try {
      // Store subscription in database
      await prisma.push_subscriptions.upsert({
        where: {
          memberId_endpoint: {
            memberId,
            endpoint: subscription.endpoint,
          },
        },
        update: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          updatedAt: new Date(),
        },
        create: {
          id: crypto.randomUUID(),
          memberId,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          updatedAt: new Date(),
        },
      });

      logger.info('Push subscription saved', { memberId });
      return true;
    } catch (error) {
      logger.error('Failed to save push subscription', { memberId, error });
      return false;
    }
  }

  /**
   * Remove a push subscription
   */
  async removeSubscription(memberId: string, endpoint: string): Promise<boolean> {
    try {
      await prisma.push_subscriptions.delete({
        where: {
          memberId_endpoint: {
            memberId,
            endpoint,
          },
        },
      });

      logger.info('Push subscription removed', { memberId });
      return true;
    } catch (error) {
      logger.error('Failed to remove push subscription', { memberId, error });
      return false;
    }
  }

  /**
   * Remove all subscriptions for a member
   */
  async removeAllSubscriptions(memberId: string): Promise<number> {
    try {
      const result = await prisma.push_subscriptions.deleteMany({
        where: { memberId },
      });

      logger.info('All push subscriptions removed', { memberId, count: result.count });
      return result.count;
    } catch (error) {
      logger.error('Failed to remove all push subscriptions', { memberId, error });
      return 0;
    }
  }

  /**
   * Send notification to a specific member
   */
  async sendToMember(memberId: string, payload: NotificationPayload): Promise<number> {
    if (!this.isConfigured) {
      logger.warn('Push notifications not configured, skipping send');
      return 0;
    }

    try {
      const subscriptions = await prisma.push_subscriptions.findMany({
        where: { memberId },
      });

      if (subscriptions.length === 0) {
        logger.debug('No push subscriptions found for member', { memberId });
        return 0;
      }

      let successCount = 0;
      const failedEndpoints: string[] = [];

      for (const sub of subscriptions) {
        const pushSubscription: PushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        try {
          await this.sendNotification(pushSubscription, payload);
          successCount++;
        } catch (error) {
          // If subscription is invalid, mark for removal
          if (this.isSubscriptionExpired(error)) {
            failedEndpoints.push(sub.endpoint);
          }
        }
      }

      // Clean up expired subscriptions
      if (failedEndpoints.length > 0) {
        await prisma.push_subscriptions.deleteMany({
          where: {
            memberId,
            endpoint: { in: failedEndpoints },
          },
        });
        logger.info('Cleaned up expired subscriptions', {
          memberId,
          count: failedEndpoints.length,
        });
      }

      return successCount;
    } catch (error) {
      logger.error('Failed to send notification to member', { memberId, error });
      return 0;
    }
  }

  /**
   * Send notification to multiple members
   */
  async sendToMembers(memberIds: string[], payload: NotificationPayload): Promise<number> {
    let totalSent = 0;

    for (const memberId of memberIds) {
      const sent = await this.sendToMember(memberId, payload);
      totalSent += sent;
    }

    return totalSent;
  }

  /**
   * Send notification to all members
   */
  async sendToAll(payload: NotificationPayload): Promise<number> {
    if (!this.isConfigured) {
      logger.warn('Push notifications not configured, skipping broadcast');
      return 0;
    }

    try {
      const subscriptions = await prisma.push_subscriptions.findMany({
        include: { members: { select: { id: true } } },
      });

      if (subscriptions.length === 0) {
        logger.debug('No push subscriptions found');
        return 0;
      }

      let successCount = 0;
      const failedSubscriptions: { memberId: string; endpoint: string }[] = [];

      for (const sub of subscriptions) {
        const pushSubscription: PushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        try {
          await this.sendNotification(pushSubscription, payload);
          successCount++;
        } catch (error) {
          if (this.isSubscriptionExpired(error)) {
            failedSubscriptions.push({
              memberId: sub.memberId,
              endpoint: sub.endpoint,
            });
          }
        }
      }

      // Clean up expired subscriptions
      if (failedSubscriptions.length > 0) {
        for (const { memberId, endpoint } of failedSubscriptions) {
          await prisma.pushSubscription
            .delete({
              where: { memberId_endpoint: { memberId, endpoint } },
            })
            .catch(() => {}); // Ignore errors during cleanup
        }
        logger.info('Cleaned up expired subscriptions', {
          count: failedSubscriptions.length,
        });
      }

      logger.info('Broadcast notification sent', {
        total: subscriptions.length,
        success: successCount,
        failed: subscriptions.length - successCount,
      });

      return successCount;
    } catch (error) {
      logger.error('Failed to broadcast notification', { error });
      return 0;
    }
  }

  /**
   * Send a notification to a push subscription
   */
  private async sendNotification(
    subscription: PushSubscription,
    payload: NotificationPayload
  ): Promise<SendResult> {
    const payloadString = JSON.stringify(payload);

    return webpush.sendNotification(subscription, payloadString, {
      TTL: 24 * 60 * 60, // 24 hours
      urgency: payload.requireInteraction ? 'high' : 'normal',
    });
  }

  /**
   * Check if error indicates expired/invalid subscription
   */
  private isSubscriptionExpired(error: unknown): boolean {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const statusCode = (error as { statusCode: number }).statusCode;
      // 404: Subscription not found
      // 410: Subscription expired/unsubscribed
      return statusCode === 404 || statusCode === 410;
    }
    return false;
  }

  // ==========================================
  // Notification Templates
  // ==========================================

  /**
   * Send new announcement notification
   */
  async notifyNewAnnouncement(
    memberIds: string[],
    announcement: { title: string; priority: string }
  ): Promise<number> {
    const payload: NotificationPayload = {
      title: announcement.priority === 'URGENT' ? '🚨 Urgent Announcement' : '📢 New Announcement',
      body: announcement.title,
      icon: '/icons/announcement-icon.png',
      badge: '/icons/badge-icon.png',
      tag: 'announcement',
      data: { type: 'announcement' },
      url: '/announcements',
      requireInteraction: announcement.priority === 'URGENT',
    };

    return this.sendToMembers(memberIds, payload);
  }

  /**
   * Send event reminder notification
   */
  async notifyEventReminder(
    memberIds: string[],
    event: { id: string; title: string; startTime: Date }
  ): Promise<number> {
    const payload: NotificationPayload = {
      title: '📅 Event Reminder',
      body: `${event.title} is starting soon!`,
      icon: '/icons/event-icon.png',
      badge: '/icons/badge-icon.png',
      tag: `event-${event.id}`,
      data: { type: 'event', eventId: event.id },
      url: `/events/${event.id}`,
      actions: [
        { action: 'view', title: 'View Event' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    };

    return this.sendToMembers(memberIds, payload);
  }

  /**
   * Send event cancellation notification
   */
  async notifyEventCancellation(
    memberIds: string[],
    event: { id: string; title: string }
  ): Promise<number> {
    const payload: NotificationPayload = {
      title: '❌ Event Cancelled',
      body: `${event.title} has been cancelled`,
      icon: '/icons/event-cancel-icon.png',
      badge: '/icons/badge-icon.png',
      tag: `event-cancel-${event.id}`,
      data: { type: 'event-cancelled', eventId: event.id },
      url: `/events/${event.id}`,
      requireInteraction: true,
    };

    return this.sendToMembers(memberIds, payload);
  }

  /**
   * Send new message notification
   */
  async notifyNewMessage(
    memberId: string,
    message: { id: string; senderName: string; subject: string }
  ): Promise<number> {
    const payload: NotificationPayload = {
      title: `💬 Message from ${message.senderName}`,
      body: message.subject,
      icon: '/icons/message-icon.png',
      badge: '/icons/badge-icon.png',
      tag: `message-${message.id}`,
      data: { type: 'message', messageId: message.id },
      url: `/messages/${message.id}`,
      actions: [
        { action: 'read', title: 'Read' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    };

    return this.sendToMember(memberId, payload);
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();
