/**
 * Auth Routes
 *
 * Authentication endpoints:
 * - POST /api/v1/auth/login - Member login
 * - POST /api/v1/auth/refresh - Refresh access token
 * - POST /api/v1/auth/logout - Member logout
 * - MFA endpoints for multi-factor authentication
 */

import { Router } from 'express';
import * as authController from '../controllers/authController';
import * as mfaController from '../controllers/mfaController';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  authRateLimiter,
  passwordResetRateLimiter,
  mfaRateLimiter,
} from '../middleware/rateLimitMiddleware';

const router = Router();

/**
 * POST /api/v1/auth/login
 * Public endpoint - no authentication required
 * Rate limited: 10 attempts per 15 minutes
 */
router.post('/login', authRateLimiter, authController.login);

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
 * Rate limited: 3 requests per hour
 */
router.post(
  '/password/reset-request',
  passwordResetRateLimiter,
  authController.requestPasswordResetHandler
);

/**
 * POST /api/v1/auth/password/reset
 * Public endpoint - reset password with token
 * Rate limited: same as password reset request
 */
router.post('/password/reset', passwordResetRateLimiter, authController.resetPasswordHandler);

// ============================================================================
// MFA ROUTES
// ============================================================================

/**
 * POST /api/v1/auth/mfa/enroll
 * Protected endpoint - initiate MFA enrollment
 */
router.post('/mfa/enroll', authMiddleware, mfaController.enrollMFA);

/**
 * POST /api/v1/auth/mfa/verify
 * Protected endpoint - complete MFA enrollment with verification
 * Rate limited: 5 attempts per 5 minutes
 */
router.post('/mfa/verify', authMiddleware, mfaRateLimiter, mfaController.verifyMFAEnrollment);

/**
 * POST /api/v1/auth/mfa/verify-login
 * Public endpoint - verify MFA code during login flow
 * Rate limited: 5 attempts per 5 minutes
 */
router.post('/mfa/verify-login', mfaRateLimiter, mfaController.verifyMFALogin);

/**
 * POST /api/v1/auth/mfa/backup-codes
 * Protected endpoint - regenerate backup codes
 */
router.post('/mfa/backup-codes', authMiddleware, mfaController.regenerateBackupCodes);

/**
 * DELETE /api/v1/auth/mfa
 * Protected endpoint - disable MFA
 */
router.delete('/mfa', authMiddleware, mfaController.disableMFA);

export default router;
