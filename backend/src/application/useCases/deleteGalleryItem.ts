import { IGalleryRepository } from '../../domain/interfaces/IGalleryRepository';

/**
 * DeleteGalleryItem Use Case - Remove a photo from the gallery (Admin/Staff)
 */
export class DeleteGalleryItem {
  constructor(private galleryRepository: IGalleryRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.galleryRepository.findById(id);
    if (!existing) {
      const error = Object.assign(new Error('Gallery item not found'), { statusCode: 404 });
      throw error;
    }
    await this.galleryRepository.delete(id);
  }
}
