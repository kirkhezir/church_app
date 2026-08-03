import { Router } from 'express';
import { EnglishTutorialEnrollmentController } from '../controllers/englishTutorialEnrollmentController';
import { contactFormRateLimiter } from '../middleware/rateLimitMiddleware';

/**
 * English Tutorial Enrollment Routes
 *
 * POST /api/v1/english-tutorial-enrollments - Submit an enrollment
 */
const router = Router();
const controller = new EnglishTutorialEnrollmentController();

router.post('/', contactFormRateLimiter, (req, res) => controller.submitEnrollment(req, res));

export default router;
