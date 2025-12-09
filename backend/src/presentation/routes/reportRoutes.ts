/**
 * Report Routes
 *
 * Handles PDF report generation endpoints
 */

import { Router, Response, NextFunction } from 'express';
import { reportService } from '../../infrastructure/reports/reportService';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';
import { logger } from '../../infrastructure/logging/logger';

const router = Router();

/**
 * GET /reports/members
 * Generate member directory PDF
 */
router.get(
  '/members',
  authMiddleware,
  requireRole('ADMIN', 'STAFF'),
  async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      logger.info('Generating member directory report');
      const pdfBuffer = await reportService.generateMemberDirectory();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="member-directory-${Date.now()}.pdf"`
      );
      res.setHeader('Content-Length', pdfBuffer.length);

      return res.send(pdfBuffer);
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * GET /reports/events
 * Generate events report PDF
 */
router.get(
  '/events',
  authMiddleware,
  requireRole('ADMIN', 'STAFF'),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate } = req.query;

      // Default to last 30 days if not specified
      const end = endDate ? new Date(endDate as string) : new Date();
      const start = startDate
        ? new Date(startDate as string)
        : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

      logger.info('Generating events report', { startDate: start, endDate: end });
      const pdfBuffer = await reportService.generateEventsReport(start, end);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="events-report-${Date.now()}.pdf"`
      );
      res.setHeader('Content-Length', pdfBuffer.length);

      return res.send(pdfBuffer);
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * GET /reports/events/:id/attendance
 * Generate attendance report for a specific event
 */
router.get(
  '/events/:id/attendance',
  authMiddleware,
  requireRole('ADMIN', 'STAFF'),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      logger.info('Generating event attendance report', { eventId: id });
      const pdfBuffer = await reportService.generateEventAttendanceReport(id);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="event-attendance-${id}-${Date.now()}.pdf"`
      );
      res.setHeader('Content-Length', pdfBuffer.length);

      return res.send(pdfBuffer);
    } catch (error) {
      if (error instanceof Error && error.message === 'Event not found') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Event not found',
          },
        });
      }
      return next(error);
    }
  }
);

/**
 * GET /reports/announcements
 * Generate announcements report PDF
 */
router.get(
  '/announcements',
  authMiddleware,
  requireRole('ADMIN', 'STAFF'),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate } = req.query;

      // Default to last 30 days if not specified
      const end = endDate ? new Date(endDate as string) : new Date();
      const start = startDate
        ? new Date(startDate as string)
        : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

      logger.info('Generating announcements report', { startDate: start, endDate: end });
      const pdfBuffer = await reportService.generateAnnouncementsReport(start, end);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="announcements-report-${Date.now()}.pdf"`
      );
      res.setHeader('Content-Length', pdfBuffer.length);

      return res.send(pdfBuffer);
    } catch (error) {
      return next(error);
    }
  }
);

export default router;
