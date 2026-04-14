/**
 * AnalyticsController
 *
 * Handles HTTP requests for analytics endpoints.
 * Wires use cases to Express route handlers following Clean Architecture.
 *
 * Includes a lightweight in-memory TTL cache to avoid hitting the database
 * repeatedly for slowly-changing admin analytics data.
 */

import { Request, Response, NextFunction } from 'express';
import { GetDashboardAnalytics } from '../../application/useCases/getDashboardAnalytics';
import { GetMemberGrowth } from '../../application/useCases/getMemberGrowth';
import { GetAttendanceAnalytics } from '../../application/useCases/getAttendanceAnalytics';
import { GetDemographics } from '../../application/useCases/getDemographics';
import { GetEngagementMetrics } from '../../application/useCases/getEngagementMetrics';
import { AnalyticsRepository } from '../../infrastructure/database/repositories/analyticsRepository';
import { logger } from '../../infrastructure/logging/logger';

/** Simple in-memory TTL cache (avoids Redis dependency for admin analytics) */
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}
const analyticsCache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCached<T>(key: string): T | null {
  const entry = analyticsCache.get(key);
  if (entry && entry.expiresAt > Date.now()) return entry.data as T;
  analyticsCache.delete(key);
  return null;
}

function setCache<T>(key: string, data: T): void {
  analyticsCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

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
      const cached = getCached('analytics:dashboard');
      if (cached) {
        res.json({ success: true, data: cached });
        return;
      }

      logger.info('Fetching dashboard analytics');
      const useCase = new GetDashboardAnalytics(this.analyticsRepository);
      const data = await useCase.execute();
      setCache('analytics:dashboard', data);

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
      const cacheKey = `analytics:member-growth:${months}`;
      const cached = getCached(cacheKey);
      if (cached) {
        res.json({ success: true, data: cached });
        return;
      }

      logger.info(`Fetching member growth data for ${months} months`);
      const useCase = new GetMemberGrowth(this.analyticsRepository);
      const data = await useCase.execute({ months });
      setCache(cacheKey, data);

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
      const cacheKey = `analytics:attendance:${limit}`;
      const cached = getCached(cacheKey);
      if (cached) {
        res.json({ success: true, data: cached });
        return;
      }

      logger.info(`Fetching attendance data for ${limit} events`);
      const useCase = new GetAttendanceAnalytics(this.analyticsRepository);
      const data = await useCase.execute({ limit });
      setCache(cacheKey, data);

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
      const cached = getCached('analytics:demographics');
      if (cached) {
        res.json({ success: true, data: cached });
        return;
      }

      logger.info('Fetching member demographics');
      const useCase = new GetDemographics(this.analyticsRepository);
      const data = await useCase.execute();
      setCache('analytics:demographics', data);

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
      const cached = getCached('analytics:engagement');
      if (cached) {
        res.json({ success: true, data: cached });
        return;
      }

      logger.info('Fetching engagement metrics');
      const useCase = new GetEngagementMetrics(this.analyticsRepository);
      const data = await useCase.execute();
      setCache('analytics:engagement', data);

      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
