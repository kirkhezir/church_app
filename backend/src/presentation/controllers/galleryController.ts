import { Request, Response, NextFunction } from 'express';
import { GetGallery } from '../../application/useCases/getGallery';
import { CreateGalleryItem } from '../../application/useCases/createGalleryItem';
import { DeleteGalleryItem } from '../../application/useCases/deleteGalleryItem';
import { GalleryRepository } from '../../infrastructure/database/repositories/galleryRepository';

/**
 * GalleryController
 *
 * Handles HTTP requests for photo gallery management.
 */
export class GalleryController {
  private galleryRepository: GalleryRepository;

  constructor() {
    this.galleryRepository = new GalleryRepository();
  }

  /**
   * GET /api/v1/gallery
   * Get gallery items and albums, optionally filtered by album (PUBLIC)
   */
  async getGallery(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const useCase = new GetGallery(this.galleryRepository);
      const result = await useCase.execute({
        albumId: req.query.albumId as string | undefined,
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
   * POST /api/v1/gallery
   * Add a new photo to the gallery (ADMIN, STAFF)
   */
  async createGalleryItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const useCase = new CreateGalleryItem(this.galleryRepository);
      const result = await useCase.execute({
        imageUrl: req.body.imageUrl,
        title: req.body.title,
        titleThai: req.body.titleThai,
        description: req.body.description,
        albumId: req.body.albumId,
        albumTitle: req.body.albumTitle,
        albumTitleThai: req.body.albumTitleThai,
        photographer: req.body.photographer,
        eventDate: req.body.eventDate ?? null,
        sortOrder: req.body.sortOrder,
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
   * DELETE /api/v1/gallery/:id
   * Delete a gallery item (ADMIN, STAFF)
   */
  async deleteGalleryItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const useCase = new DeleteGalleryItem(this.galleryRepository);
      await useCase.execute(req.params.id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
