import { IGalleryRepository } from '../../domain/interfaces/IGalleryRepository';

/**
 * GetGallery Use Case - Retrieve gallery items, optionally filtered by album
 */
export class GetGallery {
  constructor(private galleryRepository: IGalleryRepository) {}

  async execute(input: { albumId?: string } = {}): Promise<any> {
    const items = await this.galleryRepository.findAll({ albumId: input.albumId });
    const albums = await this.galleryRepository.getAlbums();
    return { items, albums };
  }
}
