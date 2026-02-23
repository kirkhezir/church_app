import { Router } from 'express';
import { PrayerController } from '../controllers/prayerController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';
import rateLimit from 'express-rate-limit';

/**
 * Prayer Routes
 *
 * Defines all prayer request endpoints.
 */

const router = Router();
const prayerController = new PrayerController();

// Rate limit for prayer request submissions
const prayerSubmitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 submissions per hour
  message: { success: false, error: 'Too many prayer requests submitted. Please try again later.' },
});

/**
 * Public routes (no authentication required)
 */

// GET /api/v1/prayer - Get public approved prayer requests
router.get('/', (req, res, next) => prayerController.getPrayerRequests(req, res, next));

// POST /api/v1/prayer - Submit a prayer request (rate limited)
router.post('/', prayerSubmitLimiter, (req, res, next) =>
  prayerController.submitPrayerRequest(req, res, next)
);

// POST /api/v1/prayer/:id/pray - Pray for a request (increment count)
router.post('/:id/pray', (req, res, next) => prayerController.prayForRequest(req, res, next));

/**
 * Admin/Staff routes (requires authentication + role check)
 */

// GET /api/v1/prayer/all - Get all prayer requests (including pending)
router.get('/all', authMiddleware, requireRole('ADMIN', 'STAFF'), (req, res, next) =>
  prayerController.getAllPrayerRequests(req, res, next)
);

// PATCH /api/v1/prayer/:id/moderate - Approve or archive a prayer request
router.patch('/:id/moderate', authMiddleware, requireRole('ADMIN', 'STAFF'), (req, res, next) =>
  prayerController.moderatePrayerRequest(req, res, next)
);

export default router;
