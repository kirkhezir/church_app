/**
 * Member Routes (T096)
 *
 * Routes for member-related endpoints:
 * - GET /api/v1/members/dashboard - Get dashboard data
 * - GET /api/v1/members/me - Get current member profile
 *
 * All routes require authentication
 */

import { Router } from 'express';
import { MemberController } from '../controllers/memberController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const memberController = new MemberController();

/**
 * GET /api/v1/members/dashboard
 * Get dashboard data for authenticated member
 * Requires authentication
 */
router.get('/dashboard', authMiddleware, memberController.getDashboard);

/**
 * GET /api/v1/members/me
 * Get current member profile
 * Requires authentication
 */
router.get('/me', authMiddleware, memberController.getProfile);

/**
 * PATCH /api/v1/members/me
 * Update current member profile
 * Requires authentication
 */
router.patch('/me', authMiddleware, memberController.updateProfile);

/**
 * PATCH /api/v1/members/me/notifications
 * Update notification preferences
 * Requires authentication
 */
router.patch('/me/notifications', authMiddleware, memberController.updateNotificationPreferences);

export default router;
