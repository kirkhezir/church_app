/**
 * Push Notification Routes
 *
 * Handles push notification subscription management.
 * Delegates to PushController following Clean Architecture.
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { pushSubscriptionRateLimiter } from '../middleware/rateLimitMiddleware';
import { PushController } from '../controllers/pushController';

const router = Router();
const controller = new PushController();

// Apply rate limiting to subscription endpoints
router.use('/subscribe', pushSubscriptionRateLimiter);

router.get('/vapid-key', (req, res) => controller.getVapidKey(req, res));

router.post('/subscribe', authMiddleware, (req, res, next) => controller.subscribe(req, res, next));

router.delete('/subscribe', authMiddleware, (req, res, next) =>
  controller.unsubscribe(req, res, next)
);

router.delete('/subscribe/all', authMiddleware, (req, res, next) =>
  controller.unsubscribeAll(req, res, next)
);

router.get('/status', (req, res) => controller.getStatus(req, res));

export default router;
