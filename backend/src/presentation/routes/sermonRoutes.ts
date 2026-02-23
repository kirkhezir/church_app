import { Router } from 'express';
import { SermonController } from '../controllers/sermonController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';

/**
 * Sermon Routes
 *
 * Defines all sermon management endpoints.
 */

const router = Router();
const sermonController = new SermonController();

/**
 * Public routes (no authentication required)
 */

// GET /api/v1/sermons - List published sermons
router.get('/', (req, res, next) => sermonController.getSermons(req, res, next));

// GET /api/v1/sermons/speakers - List unique speakers
router.get('/speakers', (req, res, next) => sermonController.getSpeakers(req, res, next));

// GET /api/v1/sermons/series - List unique series
router.get('/series', (req, res, next) => sermonController.getSeries(req, res, next));

// GET /api/v1/sermons/:id - Get sermon details
router.get('/:id', (req, res, next) => sermonController.getSermonById(req, res, next));

// POST /api/v1/sermons/:id/views - Increment view count
router.post('/:id/views', (req, res, next) => sermonController.incrementViews(req, res, next));

/**
 * Admin/Staff routes (requires authentication + role check)
 */

// POST /api/v1/sermons - Create sermon
router.post('/', authMiddleware, requireRole('ADMIN', 'STAFF'), (req, res, next) =>
  sermonController.createSermon(req, res, next)
);

// PATCH /api/v1/sermons/:id - Update sermon
router.patch('/:id', authMiddleware, requireRole('ADMIN', 'STAFF'), (req, res, next) =>
  sermonController.updateSermon(req, res, next)
);

// DELETE /api/v1/sermons/:id - Delete sermon
router.delete('/:id', authMiddleware, requireRole('ADMIN', 'STAFF'), (req, res, next) =>
  sermonController.deleteSermon(req, res, next)
);

export default router;
