/**
 * Upload Controller
 *
 * Handles file upload HTTP requests for images (events, profiles, announcements).
 * Uses Cloudinary for storage and optimization.
 */

import { Request, Response, NextFunction } from 'express';
import { cloudinaryService } from '../../infrastructure/storage/cloudinaryService';
import { logger } from '../../infrastructure/logging/logger';

/**
 * Allowed image MIME types
 */
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

/**
 * Max file size in bytes (10MB)
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Upload Controller Class
 */
export class UploadController {
  /**
   * POST /api/v1/upload/image
   * Upload a general image
   */
  uploadImage = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    try {
      // Check if Cloudinary is configured
      if (!cloudinaryService.isReady()) {
        res.status(503).json({
          error: 'ServiceUnavailable',
          message: 'File upload service is not configured',
        });
        return;
      }

      // Validate file exists
      if (!req.file) {
        res.status(400).json({
          error: 'ValidationError',
          message: 'No file provided',
        });
        return;
      }

      // Validate file type
      if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
        res.status(400).json({
          error: 'ValidationError',
          message: 'Invalid file type. Allowed types: JPEG, PNG, GIF, WebP',
        });
        return;
      }

      // Validate file size
      if (req.file.size > MAX_FILE_SIZE) {
        res.status(400).json({
          error: 'ValidationError',
          message: 'File too large. Maximum size is 10MB',
        });
        return;
      }

      // Get folder from request body (default: general)
      const folder = req.body.folder || 'church-app/general';

      // Upload to Cloudinary
      const result = await cloudinaryService.uploadImage(req.file.buffer, {
        folder,
        tags: ['upload'],
      });

      logger.info('Image uploaded successfully', {
        userId: (req as any).user?.userId,
        publicId: result.publicId,
        bytes: result.bytes,
      });

      res.status(200).json({
        success: true,
        data: {
          url: result.secureUrl,
          publicId: result.publicId,
          width: result.width,
          height: result.height,
          format: result.format,
          size: result.bytes,
        },
      });
    } catch (error) {
      logger.error('Image upload failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: (req as any).user?.userId,
      });

      res.status(500).json({
        error: 'UploadError',
        message: 'Failed to upload image. Please try again.',
      });
    }
  };

  /**
   * POST /api/v1/upload/event-image
   * Upload an event image with optimized settings
   */
  uploadEventImage = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    try {
      if (!cloudinaryService.isReady()) {
        res.status(503).json({
          error: 'ServiceUnavailable',
          message: 'File upload service is not configured',
        });
        return;
      }

      if (!req.file) {
        res.status(400).json({
          error: 'ValidationError',
          message: 'No file provided',
        });
        return;
      }

      if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
        res.status(400).json({
          error: 'ValidationError',
          message: 'Invalid file type. Allowed types: JPEG, PNG, GIF, WebP',
        });
        return;
      }

      if (req.file.size > MAX_FILE_SIZE) {
        res.status(400).json({
          error: 'ValidationError',
          message: 'File too large. Maximum size is 10MB',
        });
        return;
      }

      const eventId = req.body.eventId;
      const result = await cloudinaryService.uploadEventImage(req.file.buffer, eventId);

      logger.info('Event image uploaded', {
        userId: (req as any).user?.userId,
        eventId,
        publicId: result.publicId,
      });

      res.status(200).json({
        success: true,
        data: {
          url: result.secureUrl,
          publicId: result.publicId,
          width: result.width,
          height: result.height,
        },
      });
    } catch (error) {
      logger.error('Event image upload failed', { error });
      res.status(500).json({
        error: 'UploadError',
        message: 'Failed to upload event image',
      });
    }
  };

  /**
   * POST /api/v1/upload/profile-picture
   * Upload a member profile picture
   */
  uploadProfilePicture = async (
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> => {
    try {
      if (!cloudinaryService.isReady()) {
        res.status(503).json({
          error: 'ServiceUnavailable',
          message: 'File upload service is not configured',
        });
        return;
      }

      if (!req.file) {
        res.status(400).json({
          error: 'ValidationError',
          message: 'No file provided',
        });
        return;
      }

      if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
        res.status(400).json({
          error: 'ValidationError',
          message: 'Invalid file type. Allowed types: JPEG, PNG, GIF, WebP',
        });
        return;
      }

      // Profile pictures max 5MB
      if (req.file.size > 5 * 1024 * 1024) {
        res.status(400).json({
          error: 'ValidationError',
          message: 'Profile picture too large. Maximum size is 5MB',
        });
        return;
      }

      const memberId = (req as any).user?.userId;
      if (!memberId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      const result = await cloudinaryService.uploadProfilePicture(req.file.buffer, memberId);

      logger.info('Profile picture uploaded', {
        userId: memberId,
        publicId: result.publicId,
      });

      res.status(200).json({
        success: true,
        data: {
          url: result.secureUrl,
          publicId: result.publicId,
          thumbnailUrl: cloudinaryService.getThumbnailUrl(result.publicId),
        },
      });
    } catch (error) {
      logger.error('Profile picture upload failed', { error });
      res.status(500).json({
        error: 'UploadError',
        message: 'Failed to upload profile picture',
      });
    }
  };

  /**
   * POST /api/v1/upload/announcement-image
   * Upload an announcement image
   */
  uploadAnnouncementImage = async (
    req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> => {
    try {
      if (!cloudinaryService.isReady()) {
        res.status(503).json({
          error: 'ServiceUnavailable',
          message: 'File upload service is not configured',
        });
        return;
      }

      if (!req.file) {
        res.status(400).json({
          error: 'ValidationError',
          message: 'No file provided',
        });
        return;
      }

      if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
        res.status(400).json({
          error: 'ValidationError',
          message: 'Invalid file type. Allowed types: JPEG, PNG, GIF, WebP',
        });
        return;
      }

      if (req.file.size > MAX_FILE_SIZE) {
        res.status(400).json({
          error: 'ValidationError',
          message: 'File too large. Maximum size is 10MB',
        });
        return;
      }

      const announcementId = req.body.announcementId;
      const result = await cloudinaryService.uploadAnnouncementImage(
        req.file.buffer,
        announcementId
      );

      logger.info('Announcement image uploaded', {
        userId: (req as any).user?.userId,
        announcementId,
        publicId: result.publicId,
      });

      res.status(200).json({
        success: true,
        data: {
          url: result.secureUrl,
          publicId: result.publicId,
          width: result.width,
          height: result.height,
        },
      });
    } catch (error) {
      logger.error('Announcement image upload failed', { error });
      res.status(500).json({
        error: 'UploadError',
        message: 'Failed to upload announcement image',
      });
    }
  };

  /**
   * DELETE /api/v1/upload/image/:publicId
   * Delete an image from Cloudinary
   */
  deleteImage = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    try {
      if (!cloudinaryService.isReady()) {
        res.status(503).json({
          error: 'ServiceUnavailable',
          message: 'File upload service is not configured',
        });
        return;
      }

      // Decode publicId (may contain slashes encoded as ~)
      const publicId = req.params.publicId.replace(/~/g, '/');

      if (!publicId) {
        res.status(400).json({
          error: 'ValidationError',
          message: 'Public ID is required',
        });
        return;
      }

      const success = await cloudinaryService.deleteImage(publicId);

      if (success) {
        logger.info('Image deleted', {
          userId: (req as any).user?.userId,
          publicId,
        });

        res.status(200).json({
          success: true,
          message: 'Image deleted successfully',
        });
      } else {
        res.status(404).json({
          error: 'NotFound',
          message: 'Image not found or already deleted',
        });
      }
    } catch (error) {
      logger.error('Image deletion failed', { error });
      res.status(500).json({
        error: 'DeleteError',
        message: 'Failed to delete image',
      });
    }
  };

  /**
   * GET /api/v1/upload/usage
   * Get Cloudinary usage statistics (Admin only)
   */
  getUsage = async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    try {
      if (!cloudinaryService.isReady()) {
        res.status(503).json({
          error: 'ServiceUnavailable',
          message: 'File upload service is not configured',
        });
        return;
      }

      const usage = await cloudinaryService.getUsage();

      // Format for human readability
      const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
      };

      res.status(200).json({
        success: true,
        data: {
          storage: {
            used: formatBytes(usage.storage.used),
            usedBytes: usage.storage.used,
          },
          bandwidth: {
            used: formatBytes(usage.bandwidth.used),
            usedBytes: usage.bandwidth.used,
          },
          transformations: {
            used: usage.transformations.used,
          },
        },
      });
    } catch (error) {
      logger.error('Failed to get usage', { error });
      res.status(500).json({
        error: 'Error',
        message: 'Failed to get usage statistics',
      });
    }
  };
}

// Export singleton instance
export const uploadController = new UploadController();
