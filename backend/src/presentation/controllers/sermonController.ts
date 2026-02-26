import { Request, Response, NextFunction } from 'express';
import { GetSermons } from '../../application/useCases/getSermons';
import { GetSermonById } from '../../application/useCases/getSermonById';
import { CreateSermon } from '../../application/useCases/createSermon';
import { UpdateSermon } from '../../application/useCases/updateSermon';
import { DeleteSermon } from '../../application/useCases/deleteSermon';
import { IncrementSermonViews } from '../../application/useCases/incrementSermonViews';
import { SermonRepository } from '../../infrastructure/database/repositories/sermonRepository';

/**
 * SermonController
 *
 * Handles HTTP requests for sermon management.
 */
export class SermonController {
  private sermonRepository: SermonRepository;

  constructor() {
    this.sermonRepository = new SermonRepository();
  }

  /**
   * GET /api/v1/sermons
   * Get list of published sermons with optional filters (PUBLIC)
   */
  async getSermons(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const useCase = new GetSermons(this.sermonRepository);
      const result = await useCase.execute({
        speaker: req.query.speaker as string | undefined,
        series: req.query.series as string | undefined,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/sermons/speakers
   * Get list of unique speakers (PUBLIC)
   */
  async getSpeakers(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const speakers = await this.sermonRepository.getSpeakers();
      res.status(200).json({
        success: true,
        data: speakers,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/sermons/series
   * Get list of unique series (PUBLIC)
   */
  async getSeries(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const series = await this.sermonRepository.getSeries();
      res.status(200).json({
        success: true,
        data: series,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/sermons/:id
   * Get sermon details by ID (PUBLIC)
   */
  async getSermonById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const useCase = new GetSermonById(this.sermonRepository);
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
   * POST /api/v1/sermons/:id/views
   * Increment sermon view count (PUBLIC)
   */
  async incrementViews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const useCase = new IncrementSermonViews(this.sermonRepository);
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
   * POST /api/v1/sermons
   * Create a new sermon (ADMIN, STAFF)
   */
  async createSermon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const useCase = new CreateSermon(this.sermonRepository);
      const result = await useCase.execute({
        title: req.body.title,
        titleThai: req.body.titleThai,
        speaker: req.body.speaker,
        speakerThai: req.body.speakerThai,
        series: req.body.series,
        scripture: req.body.scripture,
        date: new Date(req.body.date),
        youtubeUrl: req.body.youtubeUrl,
        audioUrl: req.body.audioUrl,
        thumbnailUrl: req.body.thumbnailUrl,
        duration: req.body.duration,
        description: req.body.description,
        descriptionThai: req.body.descriptionThai,
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/sermons/:id
   * Update sermon details (ADMIN, STAFF)
   */
  async updateSermon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const useCase = new UpdateSermon(this.sermonRepository);
      const result = await useCase.execute(req.params.id, {
        ...req.body,
        date: req.body.date ? new Date(req.body.date) : undefined,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/sermons/:id
   * Delete a sermon (ADMIN, STAFF)
   */
  async deleteSermon(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const useCase = new DeleteSermon(this.sermonRepository);
      await useCase.execute(req.params.id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
