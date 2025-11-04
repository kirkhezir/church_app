/**
 * Auth Routes
 *
 * Authentication endpoints:
 * - POST /api/v1/auth/login - Member login
 * - POST /api/v1/auth/refresh - Refresh access token
 * - POST /api/v1/auth/logout - Member logout
 */

import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

/**
 * POST /api/v1/auth/login
 * Public endpoint - no authentication required
 */
router.post('/login', authController.login);

/**
 * POST /api/v1/auth/refresh
 * Public endpoint - no authentication required (uses refresh token)
 */
router.post('/refresh', authController.refresh);

/**
 * POST /api/v1/auth/logout
 * Protected endpoint - requires authentication
 */
router.post('/logout', authMiddleware, authController.logout);

/**
 * POST /api/v1/auth/password/reset-request
 * Public endpoint - request password reset email
 */
router.post('/password/reset-request', authController.requestPasswordResetHandler);

/**
 * POST /api/v1/auth/password/reset
 * Public endpoint - reset password with token
 */
router.post('/password/reset', authController.resetPasswordHandler);

export default router;
