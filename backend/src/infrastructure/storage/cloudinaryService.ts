/**
 * Cloudinary Storage Service
 *
 * Handles image uploads, transformations, and deletions using Cloudinary.
 * Provides automatic image optimization and CDN delivery.
 */

import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { logger } from '../logging/logger';

// Configure Cloudinary from environment variables
// IMPORTANT: Never hardcode credentials - use environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Always use HTTPS
});

/**
 * Upload result interface
 */
export interface CloudinaryUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

/**
 * Upload options interface
 */
export interface UploadOptions {
  folder?: string;
  publicId?: string;
  transformation?: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'limit' | 'scale' | 'thumb';
    quality?: 'auto' | 'auto:low' | 'auto:eco' | 'auto:good' | 'auto:best' | number;
    format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  };
  tags?: string[];
}

/**
 * Default transformation for optimized image delivery
 */
const DEFAULT_TRANSFORMATION = {
  width: 1200,
  height: 800,
  crop: 'limit' as const,
  quality: 'auto:good' as const,
  fetch_format: 'auto' as const,
};

/**
 * Cloudinary Storage Service
 */
export class CloudinaryService {
  private isConfigured: boolean;

  constructor() {
    this.isConfigured = !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );

    if (!this.isConfigured) {
      logger.warn('Cloudinary is not configured. File uploads will fail.');
    } else {
      logger.info('Cloudinary service initialized');
    }
  }

  /**
   * Check if Cloudinary is properly configured
   */
  isReady(): boolean {
    return this.isConfigured;
  }

  /**
   * Upload image to Cloudinary
   * @param buffer - Image buffer data
   * @param options - Upload options (folder, transformation, etc.)
   * @returns Upload result with URL and metadata
   */
  async uploadImage(buffer: Buffer, options: UploadOptions = {}): Promise<CloudinaryUploadResult> {
    if (!this.isConfigured) {
      throw new Error('Cloudinary is not configured. Check environment variables.');
    }

    const {
      folder = 'church-app',
      publicId,
      transformation = DEFAULT_TRANSFORMATION,
      tags = [],
    } = options;

    return new Promise((resolve, reject) => {
      const uploadOptions = {
        folder,
        public_id: publicId,
        resource_type: 'image' as const,
        transformation: [
          {
            width: transformation.width || DEFAULT_TRANSFORMATION.width,
            height: transformation.height || DEFAULT_TRANSFORMATION.height,
            crop: transformation.crop || DEFAULT_TRANSFORMATION.crop,
          },
          {
            quality: transformation.quality || DEFAULT_TRANSFORMATION.quality,
            fetch_format: (transformation as any).format || DEFAULT_TRANSFORMATION.fetch_format,
          },
        ],
        tags: ['church-app', ...tags],
      };

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            logger.error('Cloudinary upload failed', {
              error: error.message,
              folder,
            });
            reject(new Error(`Upload failed: ${error.message}`));
          } else if (result) {
            logger.info('Image uploaded to Cloudinary', {
              publicId: result.public_id,
              bytes: result.bytes,
              format: result.format,
            });
            resolve({
              url: result.url,
              secureUrl: result.secure_url,
              publicId: result.public_id,
              width: result.width,
              height: result.height,
              format: result.format,
              bytes: result.bytes,
            });
          } else {
            reject(new Error('Upload failed: No result returned'));
          }
        }
      );

      uploadStream.end(buffer);
    });
  }

  /**
   * Upload event image with optimized settings
   */
  async uploadEventImage(buffer: Buffer, eventId?: string): Promise<CloudinaryUploadResult> {
    return this.uploadImage(buffer, {
      folder: 'church-app/events',
      publicId: eventId ? `event-${eventId}` : undefined,
      transformation: {
        width: 1200,
        height: 630,
        crop: 'fill',
        quality: 'auto:good',
      },
      tags: ['event'],
    });
  }

  /**
   * Upload profile picture with optimized settings
   */
  async uploadProfilePicture(buffer: Buffer, memberId: string): Promise<CloudinaryUploadResult> {
    return this.uploadImage(buffer, {
      folder: 'church-app/profiles',
      publicId: `profile-${memberId}`,
      transformation: {
        width: 400,
        height: 400,
        crop: 'fill',
        quality: 'auto:good',
      },
      tags: ['profile'],
    });
  }

  /**
   * Upload announcement image with optimized settings
   */
  async uploadAnnouncementImage(
    buffer: Buffer,
    announcementId?: string
  ): Promise<CloudinaryUploadResult> {
    return this.uploadImage(buffer, {
      folder: 'church-app/announcements',
      publicId: announcementId ? `announcement-${announcementId}` : undefined,
      transformation: {
        width: 800,
        height: 600,
        crop: 'limit',
        quality: 'auto:good',
      },
      tags: ['announcement'],
    });
  }

  /**
   * Delete image from Cloudinary
   * @param publicId - The public ID of the image to delete
   */
  async deleteImage(publicId: string): Promise<boolean> {
    if (!this.isConfigured) {
      throw new Error('Cloudinary is not configured');
    }

    try {
      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result === 'ok') {
        logger.info('Image deleted from Cloudinary', { publicId });
        return true;
      } else {
        logger.warn('Image deletion failed', { publicId, result });
        return false;
      }
    } catch (error) {
      logger.error('Error deleting image from Cloudinary', {
        publicId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Generate optimized URL for an existing image
   * @param publicId - The public ID of the image
   * @param options - Transformation options
   */
  getOptimizedUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      crop?: string;
      quality?: string;
    } = {}
  ): string {
    return cloudinary.url(publicId, {
      secure: true,
      transformation: [
        {
          width: options.width || 800,
          height: options.height,
          crop: options.crop || 'limit',
        },
        {
          quality: options.quality || 'auto',
          fetch_format: 'auto',
        },
      ],
    });
  }

  /**
   * Get thumbnail URL for an image
   */
  getThumbnailUrl(publicId: string, size: number = 150): string {
    return cloudinary.url(publicId, {
      secure: true,
      transformation: [
        {
          width: size,
          height: size,
          crop: 'thumb',
          gravity: 'face',
        },
        {
          quality: 'auto',
          fetch_format: 'auto',
        },
      ],
    });
  }

  /**
   * Get Cloudinary usage statistics
   */
  async getUsage(): Promise<{
    storage: { used: number; limit: number };
    bandwidth: { used: number; limit: number };
    transformations: { used: number; limit: number };
  }> {
    if (!this.isConfigured) {
      throw new Error('Cloudinary is not configured');
    }

    try {
      const usage = await cloudinary.api.usage();
      return {
        storage: {
          used: usage.storage?.used_bytes || 0,
          limit: usage.storage?.limit || 0,
        },
        bandwidth: {
          used: usage.bandwidth?.used_bytes || 0,
          limit: usage.bandwidth?.limit || 0,
        },
        transformations: {
          used: usage.transformations?.used || 0,
          limit: usage.transformations?.limit || 0,
        },
      };
    } catch (error) {
      logger.error('Failed to get Cloudinary usage', { error });
      throw error;
    }
  }
}

// Export singleton instance
export const cloudinaryService = new CloudinaryService();
