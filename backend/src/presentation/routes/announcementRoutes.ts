import { Router } from 'express';
import { announcementController } from '../controllers/announcementController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';

const router = Router();

/**
 * Announcement Routes
 * All routes require authentication
 */

/**
 * @route   POST /api/v1/announcements
 * @desc    Create new announcement
 * @access  Admin, Staff only
 */
router.post('/', authMiddleware, requireRole('ADMIN', 'STAFF'), (req, res, next) =>
  announcementController.create(req, res, next)
);

/**
 * @route   GET /api/v1/announcements
 * @desc    List announcements (with pagination and archive filter)
 * @access  Authenticated members
 */
router.get('/', authMiddleware, (req, res, next) => announcementController.list(req, res, next));

/**
 * @route   GET /api/v1/announcements/:id
 * @desc    Get announcement by ID
 * @access  Authenticated members
 */
router.get('/:id', authMiddleware, (req, res, next) =>
  announcementController.getById(req, res, next)
);

/**
 * @route   PUT /api/v1/announcements/:id
 * @desc    Update announcement
 * @access  Admin, Staff only
 */
router.put('/:id', authMiddleware, requireRole('ADMIN', 'STAFF'), (req, res, next) =>
  announcementController.update(req, res, next)
);

/**
 * @route   POST /api/v1/announcements/:id/archive
 * @desc    Archive announcement
 * @access  Admin, Staff only
 */
router.post('/:id/archive', authMiddleware, requireRole('ADMIN', 'STAFF'), (req, res, next) =>
  announcementController.archive(req, res, next)
);

/**
 * @route   DELETE /api/v1/announcements/:id
 * @desc    Delete announcement (soft delete)
 * @access  Admin, Staff only
 */
router.delete('/:id', authMiddleware, requireRole('ADMIN', 'STAFF'), (req, res, next) =>
  announcementController.delete(req, res, next)
);

/**
 * @route   POST /api/v1/announcements/:id/view
 * @desc    Track announcement view
 * @access  Authenticated members
 */
router.post('/:id/view', authMiddleware, (req, res, next) =>
  announcementController.trackView(req, res, next)
);

/**
 * @route   POST /api/v1/announcements/:id/unarchive
 * @desc    Unarchive (restore) announcement
 * @access  Admin, Staff only
 */
router.post('/:id/unarchive', authMiddleware, requireRole('ADMIN', 'STAFF'), (req, res, next) =>
  announcementController.unarchive(req, res, next)
);

/**
 * @route   POST /api/v1/announcements/bulk-archive
 * @desc    Archive multiple announcements
 * @access  Admin, Staff only
 */
router.post('/bulk-archive', authMiddleware, requireRole('ADMIN', 'STAFF'), (req, res, next) =>
  announcementController.bulkArchive(req, res, next)
);

/**
 * @route   POST /api/v1/announcements/bulk-delete
 * @desc    Delete multiple announcements
 * @access  Admin, Staff only
 */
router.post('/bulk-delete', authMiddleware, requireRole('ADMIN', 'STAFF'), (req, res, next) =>
  announcementController.bulkDelete(req, res, next)
);

/**
 * @route   GET /api/v1/announcements/authors
 * @desc    Get list of announcement authors
 * @access  Authenticated members
 */
router.get('/authors', authMiddleware, (req, res, next) =>
  announcementController.getAuthors(req, res, next)
);

/**
 * @route   GET /api/v1/announcements/:id/analytics
 * @desc    Get announcement view analytics
 * @access  Admin, Staff only
 */
router.get('/:id/analytics', authMiddleware, requireRole('ADMIN', 'STAFF'), (req, res, next) =>
  announcementController.getAnalytics(req, res, next)
);

export default router;
