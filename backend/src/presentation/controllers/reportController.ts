/**
 * ReportController
 *
 * Handles HTTP requests for PDF report generation.
 * Delegates to reportService for actual PDF generation.
 */

import { Request, Response, NextFunction } from 'express';
import { reportService } from '../../infrastructure/reports/reportService';
import { logger } from '../../infrastructure/logging/logger';

export class ReportController {
  /**
   * GET /reports/members
   * Generate member directory PDF
   */
  async getMemberReport(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('Generating member directory report');
      const pdfBuffer = await reportService.generateMemberDirectory();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="member-directory-${Date.now()}.pdf"`
      );
      res.setHeader('Content-Length', pdfBuffer.length);
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /reports/events
   * Generate events report PDF
   */
  async getEventsReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

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
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /reports/events/:id/attendance
   * Generate attendance report for a specific event
   */
  async getEventAttendanceReport(req: Request, res: Response, next: NextFunction): Promise<void> {
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
      res.send(pdfBuffer);
    } catch (error) {
      if (error instanceof Error && error.message === 'Event not found') {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Event not found' },
        });
        return;
      }
      next(error);
    }
  }

  /**
   * GET /reports/announcements
   * Generate announcements report PDF
   */
  async getAnnouncementsReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

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
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }
}
