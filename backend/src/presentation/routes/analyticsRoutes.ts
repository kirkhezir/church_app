/**
 * Analytics Routes
 *
 * Handles analytics data endpoints for dashboard metrics.
 * Delegates to AnalyticsController → Use Cases → AnalyticsRepository
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';
import { AnalyticsController } from '../controllers/analyticsController';

const router = Router();
const controller = new AnalyticsController();

router.get('/dashboard', authMiddleware, requireRole('ADMIN', 'STAFF'), (req, res, next) =>
  controller.getDashboard(req, res, next)
);

router.get('/member-growth', authMiddleware, requireRole('ADMIN', 'STAFF'), (req, res, next) =>
  controller.getMemberGrowth(req, res, next)
);

router.get('/attendance', authMiddleware, requireRole('ADMIN', 'STAFF'), (req, res, next) =>
  controller.getAttendance(req, res, next)
);

router.get('/demographics', authMiddleware, requireRole('ADMIN', 'STAFF'), (req, res, next) =>
  controller.getDemographics(req, res, next)
);

router.get('/engagement', authMiddleware, requireRole('ADMIN', 'STAFF'), (req, res, next) =>
  controller.getEngagement(req, res, next)
);

export default router;
