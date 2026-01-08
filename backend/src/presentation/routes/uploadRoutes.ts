/**
 * Upload Routes
 *
 * Handles file upload endpoints for images.
 * Uses Multer for multipart form data processing.
 *
 * Routes:
 * - POST /api/v1/upload/image - Upload general image
 * - POST /api/v1/upload/event-image - Upload event image
 * - POST /api/v1/upload/profile-picture - Upload profile picture
 * - POST /api/v1/upload/announcement-image - Upload announcement image
 * - DELETE /api/v1/upload/image/:publicId - Delete image
 * - GET /api/v1/upload/usage - Get storage usage (Admin)
 */

import { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';
import { uploadController } from '../controllers/uploadController';

const router = Router();

/**
 * Configure Multer for memory storage
 * Files are stored in memory as Buffer objects
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
    files: 1, // Only 1 file per request
  },
  fileFilter: (_req, file, cb) => {
    // Allow only image files
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP)'));
    }
  },
});

/**
 * Error handler for Multer errors
 */
const handleMulterError = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'File too large. Maximum size is 10MB',
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Too many files. Only 1 file allowed per request',
      });
    }
    return res.status(400).json({
      error: 'UploadError',
      message: err.message,
    });
  }

  if (err) {
    return res.status(400).json({
      error: 'UploadError',
      message: err.message || 'File upload failed',
    });
  }

  next();
};

// ============================================================================
// PUBLIC ROUTES (None - all uploads require authentication)
// ============================================================================

// ============================================================================
// AUTHENTICATED ROUTES
// ============================================================================

/**
 * POST /api/v1/upload/image
 * Upload a general image (any authenticated user)
 *
 * Body (multipart/form-data):
 * - image: File (required)
 * - folder: string (optional, default: 'church-app/general')
 */
router.post(
  '/image',
  authMiddleware,
  upload.single('image'),
  handleMulterError,
  uploadController.uploadImage
);

/**
 * POST /api/v1/upload/event-image
 * Upload an event image (Staff/Admin only)
 *
 * Body (multipart/form-data):
 * - image: File (required)
 * - eventId: string (optional, for updating existing event image)
 */
router.post(
  '/event-image',
  authMiddleware,
  requireRole('ADMIN', 'STAFF'),
  upload.single('image'),
  handleMulterError,
  uploadController.uploadEventImage
);

/**
 * POST /api/v1/upload/profile-picture
 * Upload own profile picture (any authenticated user)
 *
 * Body (multipart/form-data):
 * - image: File (required)
 */
router.post(
  '/profile-picture',
  authMiddleware,
  upload.single('image'),
  handleMulterError,
  uploadController.uploadProfilePicture
);

/**
 * POST /api/v1/upload/announcement-image
 * Upload an announcement image (Staff/Admin only)
 *
 * Body (multipart/form-data):
 * - image: File (required)
 * - announcementId: string (optional)
 */
router.post(
  '/announcement-image',
  authMiddleware,
  requireRole('ADMIN', 'STAFF'),
  upload.single('image'),
  handleMulterError,
  uploadController.uploadAnnouncementImage
);

/**
 * DELETE /api/v1/upload/image/:publicId
 * Delete an image (Staff/Admin only)
 *
 * Params:
 * - publicId: string (URL encoded, use ~ instead of / for nested paths)
 */
router.delete(
  '/image/:publicId',
  authMiddleware,
  requireRole('ADMIN', 'STAFF'),
  uploadController.deleteImage
);

// ============================================================================
// ADMIN ROUTES
// ============================================================================

/**
 * GET /api/v1/upload/usage
 * Get Cloudinary usage statistics (Admin only)
 */
router.get('/usage', authMiddleware, requireRole('ADMIN'), uploadController.getUsage);

export default router;
