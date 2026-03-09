import { IGalleryRepository } from '../../domain/interfaces/IGalleryRepository';
import { randomUUID } from 'crypto';

/**
 * CreateGalleryItem Use Case - Add a new photo to the gallery (Admin/Staff)
 */
export class CreateGalleryItem {
  constructor(private galleryRepository: IGalleryRepository) {}

  async execute(input: {
    imageUrl: string;
    title?: string;
    titleThai?: string;
    description?: string;
    albumId: string;
    albumTitle: string;
    albumTitleThai?: string;
    photographer?: string;
    eventDate?: string;
    sortOrder?: number;
  }) {
    if (!input.imageUrl) {
      throw new Error('Image URL is required');
    }
    if (!input.albumId || !input.albumTitle) {
      throw new Error('Album ID and title are required');
    }

    return await this.galleryRepository.create({
      id: randomUUID(),
      updatedAt: new Date(),
      title: input.title ?? '',
      titleThai: input.titleThai ?? null,
      imageUrl: input.imageUrl,
      albumId: input.albumId,
      albumTitle: input.albumTitle,
      albumTitleThai: input.albumTitleThai ?? null,
      photographer: input.photographer ?? null,
      description: input.description ?? null,
      eventDate: input.eventDate ?? null,
      sortOrder: input.sortOrder ?? 0,
    });
  }
}
