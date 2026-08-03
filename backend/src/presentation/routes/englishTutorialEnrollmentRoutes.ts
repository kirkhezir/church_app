import { Router } from 'express';
import { EnglishTutorialEnrollmentController } from '../controllers/englishTutorialEnrollmentController';
import { contactFormRateLimiter } from '../middleware/rateLimitMiddleware';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';

/**
 * English Tutorial Enrollment Routes
 *
 * POST  /api/v1/english-tutorial-enrollments             - Submit an enrollment (public)
 * GET   /api/v1/english-tutorial-enrollments              - List all enrollments (ADMIN, STAFF)
 * PATCH /api/v1/english-tutorial-enrollments/:id/review   - Mark reviewed (ADMIN, STAFF)
 */
const router = Router();
const controller = new EnglishTutorialEnrollmentController();

router.post('/', contactFormRateLimiter, (req, res) => controller.submitEnrollment(req, res));

router.get('/', authMiddleware, requireRole('ADMIN', 'STAFF'), (req, res) =>
  controller.getAllEnrollments(req, res)
);

router.patch('/:id/review', authMiddleware, requireRole('ADMIN', 'STAFF'), (req, res) =>
  controller.reviewEnrollment(req, res)
);

export default router;
