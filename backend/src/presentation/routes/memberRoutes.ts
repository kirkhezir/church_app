/**
 * Member Routes (T096, T243-T246)
 *
 * Routes for member-related endpoints:
 * - GET /api/v1/members - List members (directory)
 * - GET /api/v1/members/dashboard - Get dashboard data
 * - GET /api/v1/members/me - Get current member profile
 * - GET /api/v1/members/search - Search members
 * - GET /api/v1/members/:id - Get member profile
 * - PATCH /api/v1/members/me - Update profile
 * - PATCH /api/v1/members/me/privacy - Update privacy settings
 * - PATCH /api/v1/members/me/notifications - Update notifications
 *
 * All routes require authentication
 */

import { Router } from 'express';
import { MemberController } from '../controllers/memberController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const memberController = new MemberController();

/**
 * GET /api/v1/members
 * List members (directory) with privacy controls
 * Requires authentication
 */
router.get('/', authMiddleware, memberController.listMembers);

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
 * GET /api/v1/members/search
 * Search members by name
 * Requires authentication
 */
router.get('/search', authMiddleware, memberController.searchMembers);

/**
 * GET /api/v1/members/:id
 * Get member profile with privacy controls
 * Requires authentication
 */
router.get('/:id', authMiddleware, memberController.getMemberById);

/**
 * PATCH /api/v1/members/me
 * Update current member profile
 * Requires authentication
 */
router.patch('/me', authMiddleware, memberController.updateProfile);

/**
 * PATCH /api/v1/members/me/privacy
 * Update privacy settings
 * Requires authentication
 */
router.patch('/me/privacy', authMiddleware, memberController.updatePrivacySettings);

/**
 * PATCH /api/v1/members/me/notifications
 * Update notification preferences
 * Requires authentication
 */
router.patch('/me/notifications', authMiddleware, memberController.updateNotificationPreferences);

export default router;
