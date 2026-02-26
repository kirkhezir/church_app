/**
 * AnalyticsController
 *
 * Handles HTTP requests for analytics endpoints.
 * Wires use cases to Express route handlers following Clean Architecture.
 */

import { Request, Response, NextFunction } from 'express';
import { GetDashboardAnalytics } from '../../application/useCases/getDashboardAnalytics';
import { GetMemberGrowth } from '../../application/useCases/getMemberGrowth';
import { GetAttendanceAnalytics } from '../../application/useCases/getAttendanceAnalytics';
import { GetDemographics } from '../../application/useCases/getDemographics';
import { GetEngagementMetrics } from '../../application/useCases/getEngagementMetrics';
import { AnalyticsRepository } from '../../infrastructure/database/repositories/analyticsRepository';
import { logger } from '../../infrastructure/logging/logger';

export class AnalyticsController {
  private analyticsRepository: AnalyticsRepository;

  constructor() {
    this.analyticsRepository = new AnalyticsRepository();
  }

  /**
   * GET /analytics/dashboard
   */
  async getDashboard(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('Fetching dashboard analytics');
      const useCase = new GetDashboardAnalytics(this.analyticsRepository);
      const data = await useCase.execute();

      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /analytics/member-growth
   */
  async getMemberGrowth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const months = parseInt(req.query.months as string) || 6;
      logger.info(`Fetching member growth data for ${months} months`);

      const useCase = new GetMemberGrowth(this.analyticsRepository);
      const data = await useCase.execute({ months });

      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /analytics/attendance
   */
  async getAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 8;
      logger.info(`Fetching attendance data for ${limit} events`);

      const useCase = new GetAttendanceAnalytics(this.analyticsRepository);
      const data = await useCase.execute({ limit });

      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /analytics/demographics
   */
  async getDemographics(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('Fetching member demographics');
      const useCase = new GetDemographics(this.analyticsRepository);
      const data = await useCase.execute();

      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /analytics/engagement
   */
  async getEngagement(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('Fetching engagement metrics');
      const useCase = new GetEngagementMetrics(this.analyticsRepository);
      const data = await useCase.execute();

      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
