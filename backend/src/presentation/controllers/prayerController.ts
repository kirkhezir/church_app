import { Request, Response, NextFunction } from 'express';
import { GetPrayerRequests } from '../../application/useCases/getPrayerRequests';
import { SubmitPrayerRequest } from '../../application/useCases/submitPrayerRequest';
import { PrayForRequest } from '../../application/useCases/prayForRequest';
import { UnprayForRequest } from '../../application/useCases/unprayForRequest';
import { ModeratePrayerRequest } from '../../application/useCases/moderatePrayerRequest';
import { PrayerRepository } from '../../infrastructure/database/repositories/prayerRepository';
import { websocketServer } from '../../infrastructure/websocket/websocketServer';

/**
 * PrayerController
 *
 * Handles HTTP requests for prayer request management.
 */
export class PrayerController {
  private prayerRepository: PrayerRepository;

  constructor() {
    this.prayerRepository = new PrayerRepository();
  }

  /**
   * GET /api/v1/prayer
   * Get public approved prayer requests (PUBLIC)
   */
  async getPrayerRequests(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const useCase = new GetPrayerRequests(this.prayerRepository);
      const result = await useCase.execute();

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/prayer/all
   * Get all prayer requests including pending (ADMIN, STAFF)
   */
  async getAllPrayerRequests(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.prayerRepository.findAll();

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/prayer
   * Submit a new prayer request (PUBLIC - rate limited)
   */
  async submitPrayerRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const useCase = new SubmitPrayerRequest(this.prayerRepository);
      const result = await useCase.execute({
        name: req.body.name,
        email: req.body.email,
        request: req.body.request,
        requestThai: req.body.requestThai,
        category: req.body.category,
        categoryThai: req.body.categoryThai,
        isAnonymous: req.body.isAnonymous,
      });

      res.status(201).json({
        success: true,
        data: result,
      });

      // Notify admin/staff of new pending prayer request via WebSocket
      websocketServer.sendPrayerPendingNotification({
        id: result.id,
        name: result.name ?? 'Anonymous',
        category: result.category ?? 'other',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/prayer/:id/pray
   * Increment prayer count (PUBLIC)
   */
  async prayForRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const useCase = new PrayForRequest(this.prayerRepository);
      const result = await useCase.execute(req.params.id);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/prayer/:id/pray
   * Decrement prayer count / toggle off (PUBLIC)
   */
  async unprayForRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const useCase = new UnprayForRequest(this.prayerRepository);
      const result = await useCase.execute(req.params.id);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/prayer/:id/moderate
   * Approve or archive a prayer request (ADMIN, STAFF)
   */
  async moderatePrayerRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const useCase = new ModeratePrayerRequest(this.prayerRepository);
      const result = await useCase.execute({
        id: req.params.id,
        status: req.body.status,
      });

      res.status(200).json({
        success: true,
        data: result,
      });

      // Broadcast to all connected members when prayer is approved (added to wall)
      if (req.body.status === 'APPROVED') {
        websocketServer.sendPrayerApprovedNotification({
          id: result.id,
          category: result.category ?? 'other',
          request: result.request ?? '',
        });
      }
    } catch (error) {
      next(error);
    }
  }
}
