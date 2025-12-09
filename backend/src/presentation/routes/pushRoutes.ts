/**
 * Push Notification Routes
 *
 * Handles push notification subscription management
 */

import { Router, Request, Response, NextFunction } from 'express';
import { pushNotificationService } from '../../infrastructure/notifications/pushNotificationService';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware';
import { logger } from '../../infrastructure/logging/logger';

const router = Router();

/**
 * GET /push/vapid-key
 * Get the public VAPID key for client subscription
 */
router.get('/vapid-key', (_req: Request, res: Response) => {
  const publicKey = pushNotificationService.getPublicKey();

  if (!publicKey) {
    return res.status(503).json({
      success: false,
      error: {
        code: 'PUSH_NOT_CONFIGURED',
        message: 'Push notifications are not configured',
      },
    });
  }

  return res.json({
    success: true,
    data: {
      publicKey,
    },
  });
});

/**
 * POST /push/subscribe
 * Subscribe to push notifications
 */
router.post(
  '/subscribe',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { endpoint, keys } = req.body;
      const userId = req.user!.userId;

      // Validate subscription data
      if (!endpoint || !keys?.p256dh || !keys?.auth) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_SUBSCRIPTION',
            message: 'Invalid push subscription data',
          },
        });
      }

      const success = await pushNotificationService.saveSubscription(userId, {
        endpoint,
        keys: {
          p256dh: keys.p256dh,
          auth: keys.auth,
        },
      });

      if (success) {
        logger.info('Push subscription saved', { userId });
        return res.status(201).json({
          success: true,
          message: 'Successfully subscribed to push notifications',
        });
      } else {
        return res.status(500).json({
          success: false,
          error: {
            code: 'SUBSCRIPTION_FAILED',
            message: 'Failed to save subscription',
          },
        });
      }
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * DELETE /push/subscribe
 * Unsubscribe from push notifications
 */
router.delete(
  '/subscribe',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { endpoint } = req.body;
      const userId = req.user!.userId;

      if (!endpoint) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Endpoint is required',
          },
        });
      }

      const success = await pushNotificationService.removeSubscription(userId, endpoint);

      if (success) {
        logger.info('Push subscription removed', { userId });
        return res.json({
          success: true,
          message: 'Successfully unsubscribed from push notifications',
        });
      } else {
        return res.status(404).json({
          success: false,
          error: {
            code: 'SUBSCRIPTION_NOT_FOUND',
            message: 'Subscription not found',
          },
        });
      }
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * DELETE /push/subscribe/all
 * Unsubscribe all devices for current user
 */
router.delete(
  '/subscribe/all',
  authMiddleware,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const count = await pushNotificationService.removeAllSubscriptions(userId);

      logger.info('All push subscriptions removed', { userId, count });
      return res.json({
        success: true,
        message: `Successfully removed ${count} subscription(s)`,
        data: { count },
      });
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * GET /push/status
 * Check push notification status
 */
router.get('/status', (_req: Request, res: Response) => {
  const enabled = pushNotificationService.isEnabled();

  return res.json({
    success: true,
    data: {
      enabled,
      message: enabled ? 'Push notifications are enabled' : 'Push notifications are not configured',
    },
  });
});

export default router;
