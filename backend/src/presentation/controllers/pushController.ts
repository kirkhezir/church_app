/**
 * PushController
 *
 * Handles HTTP requests for push notification subscription management.
 * Delegates to pushNotificationService for actual notification logic.
 */

import { Request, Response, NextFunction } from 'express';
import { pushNotificationService } from '../../infrastructure/notifications/pushNotificationService';
import { logger } from '../../infrastructure/logging/logger';

interface AuthenticatedRequest extends Request {
  user?: { userId: string; role: string };
}

export class PushController {
  /**
   * GET /push/vapid-key
   */
  getVapidKey(_req: Request, res: Response): void {
    const publicKey = pushNotificationService.getPublicKey();

    if (!publicKey) {
      res.status(503).json({
        success: false,
        error: { code: 'PUSH_NOT_CONFIGURED', message: 'Push notifications are not configured' },
      });
      return;
    }

    res.json({ success: true, data: { publicKey } });
  }

  /**
   * POST /push/subscribe
   */
  async subscribe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { endpoint, keys } = req.body;
      const userId = (req as AuthenticatedRequest).user!.userId;

      if (!endpoint || !keys?.p256dh || !keys?.auth) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_SUBSCRIPTION', message: 'Invalid push subscription data' },
        });
        return;
      }

      const success = await pushNotificationService.saveSubscription(userId, {
        endpoint,
        keys: { p256dh: keys.p256dh, auth: keys.auth },
      });

      if (success) {
        logger.info('Push subscription saved', { userId });
        res.status(201).json({
          success: true,
          message: 'Successfully subscribed to push notifications',
        });
      } else {
        res.status(500).json({
          success: false,
          error: { code: 'SUBSCRIPTION_FAILED', message: 'Failed to save subscription' },
        });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /push/subscribe
   */
  async unsubscribe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { endpoint } = req.body;
      const userId = (req as AuthenticatedRequest).user!.userId;

      if (!endpoint) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_REQUEST', message: 'Endpoint is required' },
        });
        return;
      }

      const success = await pushNotificationService.removeSubscription(userId, endpoint);

      if (success) {
        logger.info('Push subscription removed', { userId });
        res.json({ success: true, message: 'Successfully unsubscribed from push notifications' });
      } else {
        res.status(404).json({
          success: false,
          error: { code: 'SUBSCRIPTION_NOT_FOUND', message: 'Subscription not found' },
        });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /push/subscribe/all
   */
  async unsubscribeAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user!.userId;
      const count = await pushNotificationService.removeAllSubscriptions(userId);

      logger.info('All push subscriptions removed', { userId, count });
      res.json({
        success: true,
        message: `Successfully removed ${count} subscription(s)`,
        data: { count },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /push/status
   */
  getStatus(_req: Request, res: Response): void {
    const enabled = pushNotificationService.isEnabled();

    res.json({
      success: true,
      data: {
        enabled,
        message: enabled
          ? 'Push notifications are enabled'
          : 'Push notifications are not configured',
      },
    });
  }
}
