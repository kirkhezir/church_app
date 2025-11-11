import { Request, Response, NextFunction } from 'express';
import { createAnnouncement } from '../../application/useCases/createAnnouncement';
import { getAnnouncements } from '../../application/useCases/getAnnouncements';
import { getAnnouncementById } from '../../application/useCases/getAnnouncementById';
import { updateAnnouncement } from '../../application/useCases/updateAnnouncement';
import { archiveAnnouncement } from '../../application/useCases/archiveAnnouncement';
import { deleteAnnouncement } from '../../application/useCases/deleteAnnouncement';
import { trackAnnouncementView } from '../../application/useCases/trackAnnouncementView';
import { Priority } from '../../domain/valueObjects/Priority';
import logger from '../../infrastructure/logging/logger';

/**
 * Announcement Controller
 * Handles HTTP requests for announcement management
 */
export class AnnouncementController {
  /**
   * POST /api/v1/announcements
   * Create a new announcement (admin/staff only)
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, content, priority = 'NORMAL' } = req.body;
      const userId = (req as any).user.userId;

      // Validate required fields
      if (!title || !content) {
        res.status(400).json({
          error: 'Validation failed',
          message: 'Title and content are required',
        });
        return;
      }

      // Validate priority enum
      if (priority && !['URGENT', 'NORMAL'].includes(priority)) {
        res.status(400).json({
          error: 'Validation failed',
          message: 'Priority must be either URGENT or NORMAL',
        });
        return;
      }

      const announcement = await createAnnouncement(userId, title, content, priority as Priority);

      res.status(201).json(announcement);
    } catch (error: any) {
      // Handle validation errors from domain entity
      if (
        error.message.includes('must be at least') ||
        error.message.includes('cannot exceed') ||
        error.message.includes('cannot be empty')
      ) {
        res.status(400).json({
          error: 'Validation failed',
          message: error.message,
        });
        return;
      }
      if (
        error.message.includes('only administrators') ||
        error.message.includes('Author not found')
      ) {
        res.status(403).json({ error: 'Forbidden', message: error.message });
        return;
      }
      next(error);
    }
  }

  /**
   * GET /api/v1/announcements
   * List announcements with optional filters
   */
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const archived = req.query.archived === 'true';
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await getAnnouncements(archived, page, limit);

      res.status(200).json(result);
    } catch (error: any) {
      next(error);
    }
  }

  /**
   * GET /api/v1/announcements/:id
   * Get announcement by ID
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const announcement = await getAnnouncementById(id);

      res.status(200).json(announcement);
    } catch (error: any) {
      if (error.message === 'Invalid announcement ID format') {
        res.status(400).json({ error: 'Bad Request', message: error.message });
        return;
      }
      if (error.message === 'Announcement not found') {
        res.status(404).json({ error: 'Not Found', message: error.message });
        return;
      }
      next(error);
    }
  }

  /**
   * PUT /api/v1/announcements/:id
   * Update announcement (admin/staff only)
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.userId;
      const { title, content, priority } = req.body;

      // Validate priority if provided
      if (priority && !['URGENT', 'NORMAL'].includes(priority)) {
        res.status(400).json({
          error: 'Validation failed',
          message: 'Priority must be either URGENT or NORMAL',
        });
        return;
      }

      const announcement = await updateAnnouncement(id, userId, {
        title,
        content,
        priority: priority as Priority,
      });

      res.status(200).json(announcement);
    } catch (error: any) {
      if (error.message === 'Invalid announcement ID format') {
        res.status(400).json({ error: 'Bad Request', message: error.message });
        return;
      }
      if (
        error.message.includes('only administrators') ||
        error.message.includes('User not found')
      ) {
        res.status(403).json({ error: 'Forbidden', message: error.message });
        return;
      }
      if (error.message === 'Announcement not found') {
        res.status(404).json({ error: 'Not Found', message: error.message });
        return;
      }
      next(error);
    }
  }

  /**
   * POST /api/v1/announcements/:id/archive
   * Archive announcement (admin/staff only)
   */
  async archive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.userId;

      await archiveAnnouncement(id, userId);

      res.status(200).json({ message: 'Announcement archived successfully' });
    } catch (error: any) {
      if (error.message === 'Invalid announcement ID format') {
        res.status(400).json({ error: 'Bad Request', message: error.message });
        return;
      }
      if (
        error.message.includes('only administrators') ||
        error.message.includes('User not found')
      ) {
        res.status(403).json({ error: 'Forbidden', message: error.message });
        return;
      }
      if (error.message === 'Announcement not found') {
        res.status(404).json({ error: 'Not Found', message: error.message });
        return;
      }
      next(error);
    }
  }

  /**
   * DELETE /api/v1/announcements/:id
   * Delete announcement (admin/staff only)
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.userId;

      await deleteAnnouncement(id, userId);

      res.status(200).json({ message: 'Announcement deleted successfully' });
    } catch (error: any) {
      if (error.message === 'Invalid announcement ID format') {
        res.status(400).json({ error: 'Bad Request', message: error.message });
        return;
      }
      if (
        error.message.includes('only administrators') ||
        error.message.includes('User not found')
      ) {
        res.status(403).json({ error: 'Forbidden', message: error.message });
        return;
      }
      if (error.message === 'Announcement not found') {
        res.status(404).json({ error: 'Not Found', message: error.message });
        return;
      }
      next(error);
    }
  }

  /**
   * POST /api/v1/announcements/:id/view
   * Track that a member viewed an announcement
   */
  async trackView(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.userId;

      await trackAnnouncementView(id, userId);

      res.status(200).json({ message: 'View tracked successfully' });
    } catch (error: any) {
      // View tracking errors should not break the API
      logger.warn('View tracking failed', { error: error.message });
      res.status(200).json({ message: 'Request processed' });
    }
  }
}

// Export singleton instance
export const announcementController = new AnnouncementController();
