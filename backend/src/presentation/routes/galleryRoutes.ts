import { Router } from 'express';
import { GalleryController } from '../controllers/galleryController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';

/**
 * Gallery Routes
 *
 * Defines all photo gallery endpoints.
 */

const router = Router();
const galleryController = new GalleryController();

/**
 * Public routes (no authentication required)
 */

// GET /api/v1/gallery - Get gallery items and albums
router.get('/', (req, res, next) => galleryController.getGallery(req, res, next));

/**
 * Admin/Staff routes (requires authentication + role check)
 */

// POST /api/v1/gallery - Add photo to gallery
router.post('/', authMiddleware, requireRole('ADMIN', 'STAFF'), (req, res, next) =>
  galleryController.createGalleryItem(req, res, next)
);

// DELETE /api/v1/gallery/:id - Delete gallery item
router.delete('/:id', authMiddleware, requireRole('ADMIN', 'STAFF'), (req, res, next) =>
  galleryController.deleteGalleryItem(req, res, next)
);

export default router;
