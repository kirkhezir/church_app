import prisma from '../prismaClient';
import { IGalleryRepository } from '../../../domain/interfaces/IGalleryRepository';

/**
 * Gallery Repository Implementation
 * Implements repository interface using Prisma ORM
 */
export class GalleryRepository implements IGalleryRepository {
  async findAll(options: { albumId?: string } = {}): Promise<any[]> {
    const where: any = {};
    if (options.albumId) where.albumId = options.albumId;

    return prisma.gallery_items.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findById(id: string): Promise<any | null> {
    return prisma.gallery_items.findUnique({ where: { id } });
  }

  async getAlbums(): Promise<any[]> {
    // Group by albumId to get unique albums with photo counts
    const items = await prisma.gallery_items.findMany({
      select: {
        albumId: true,
        albumTitle: true,
        albumTitleThai: true,
        imageUrl: true,
        eventDate: true,
      },
      orderBy: { sortOrder: 'asc' },
    });

    // Group by albumId and compute counts + cover image
    const albumMap = new Map<string, any>();
    for (const item of items) {
      if (!albumMap.has(item.albumId)) {
        albumMap.set(item.albumId, {
          id: item.albumId,
          title: item.albumTitle,
          titleThai: item.albumTitleThai,
          coverImage: item.imageUrl,
          date: item.eventDate,
          photoCount: 0,
        });
      }
      albumMap.get(item.albumId).photoCount += 1;
    }

    return Array.from(albumMap.values());
  }

  async create(data: any): Promise<any> {
    return prisma.gallery_items.create({ data });
  }

  async delete(id: string): Promise<void> {
    await prisma.gallery_items.delete({ where: { id } });
  }
}
