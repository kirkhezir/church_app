/**
 * Report Routes
 *
 * Handles PDF report generation endpoints.
 * Delegates to ReportController following Clean Architecture.
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';
import { reportRateLimiter } from '../middleware/rateLimitMiddleware';
import { ReportController } from '../controllers/reportController';

const router = Router();
const controller = new ReportController();

// Apply rate limiting to all report routes
router.use(reportRateLimiter);

router.get('/members', authMiddleware, requireRole('ADMIN', 'STAFF'), (req, res, next) =>
  controller.getMemberReport(req, res, next)
);

router.get('/events', authMiddleware, requireRole('ADMIN', 'STAFF'), (req, res, next) =>
  controller.getEventsReport(req, res, next)
);

router.get(
  '/events/:id/attendance',
  authMiddleware,
  requireRole('ADMIN', 'STAFF'),
  (req, res, next) => controller.getEventAttendanceReport(req, res, next)
);

router.get('/announcements', authMiddleware, requireRole('ADMIN', 'STAFF'), (req, res, next) =>
  controller.getAnnouncementsReport(req, res, next)
);

export default router;
