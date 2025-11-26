/**
 * Admin Routes
 *
 * Admin-only endpoints with MFA requirement:
 * - Member management (create, list, delete)
 * - Audit log viewing
 * - Data export
 *
 * T307: Create admin routes
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/mfaMiddleware';
import {
  createMember,
  listMembers,
  deleteMember,
  getAuditLogsHandler,
  exportMembers,
  exportEvents,
} from '../controllers/adminController';

const router = Router();

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(requireAdmin);

// Member management
router.post('/members', createMember);
router.get('/members', listMembers);
router.delete('/members/:id', deleteMember);

// Audit logs
router.get('/audit-logs', getAuditLogsHandler);

// Data export
router.get('/export/members', exportMembers);
router.get('/export/events', exportEvents);

export default router;
