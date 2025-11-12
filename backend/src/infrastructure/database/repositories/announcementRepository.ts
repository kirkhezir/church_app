import { Announcement as PrismaAnnouncement } from '@prisma/client';
import prisma from '../prismaClient';
import { IAnnouncementRepository } from '../../../domain/interfaces/IAnnouncementRepository';

/**
 * Announcement Repository Implementation
 * Implements repository interface using Prisma ORM
 */
export class AnnouncementRepository implements IAnnouncementRepository {
  /**
   * Find announcement by ID
   */
  async findById(id: string): Promise<PrismaAnnouncement | null> {
    const announcement = await prisma.announcement.findUnique({
      where: { id, deletedAt: null },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            views: true,
          },
        },
      },
    });

    return announcement as never;
  }

  /**
   * Find all active announcements (not archived)
   */
  async findActive(): Promise<PrismaAnnouncement[]> {
    const announcements = await prisma.announcement.findMany({
      where: {
        deletedAt: null,
        archivedAt: null,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            views: true,
          },
        },
      },
      orderBy: [{ priority: 'desc' }, { publishedAt: 'desc' }],
    });

    return announcements as never[];
  }

  /**
   * Find archived announcements
   */
  async findArchived(): Promise<PrismaAnnouncement[]> {
    const announcements = await prisma.announcement.findMany({
      where: {
        deletedAt: null,
        archivedAt: { not: null },
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            views: true,
          },
        },
      },
      orderBy: { archivedAt: 'desc' },
    });

    return announcements as never[];
  }

  /**
   * Find urgent announcements
   */
  async findUrgent(): Promise<PrismaAnnouncement[]> {
    const announcements = await prisma.announcement.findMany({
      where: {
        deletedAt: null,
        archivedAt: null,
        priority: 'URGENT',
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { publishedAt: 'desc' },
    });

    return announcements as never[];
  }

  /**
   * Find recent announcements
   */
  async findRecent(limit: number = 10): Promise<PrismaAnnouncement[]> {
    const announcements = await prisma.announcement.findMany({
      where: {
        deletedAt: null,
        archivedAt: null,
        publishedAt: { lte: new Date() }, // Only published announcements
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            views: true,
          },
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });

    return announcements as never[];
  }

  /**
   * Create new announcement
   */
  async create(announcement: any): Promise<PrismaAnnouncement> {
    const created = await prisma.announcement.create({
      data: {
        id: announcement.id,
        title: announcement.title,
        content: announcement.content,
        priority: announcement.priority as never,
        authorId: announcement.authorId,
        publishedAt: announcement.publishedAt || new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return created as never;
  }

  /**
   * Update existing announcement
   */
  async update(announcement: any): Promise<PrismaAnnouncement> {
    const updated = await prisma.announcement.update({
      where: { id: announcement.id },
      data: {
        title: announcement.title,
        content: announcement.content,
        priority: announcement.priority as never,
        updatedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return updated as never;
  }

  /**
   * Archive announcement
   */
  async archive(id: string): Promise<void> {
    await prisma.announcement.update({
      where: { id },
      data: {
        archivedAt: new Date(),
      },
    });
  }

  /**
   * Delete announcement (soft delete)
   */
  async delete(id: string): Promise<void> {
    await prisma.announcement.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Mark announcement as viewed by member
   */
  async markAsViewed(announcementId: string, memberId: string): Promise<void> {
    await prisma.memberAnnouncementView.upsert({
      where: {
        memberId_announcementId: {
          memberId,
          announcementId,
        },
      },
      update: {
        viewedAt: new Date(),
      },
      create: {
        memberId,
        announcementId,
      },
    });
  }

  /**
   * Check if member has viewed announcement
   */
  async hasViewed(announcementId: string, memberId: string): Promise<boolean> {
    const view = await prisma.memberAnnouncementView.findUnique({
      where: {
        memberId_announcementId: {
          memberId,
          announcementId,
        },
      },
    });

    return view !== null;
  }

  /**
   * Get view count for announcement
   */
  async getViewCount(announcementId: string): Promise<number> {
    return prisma.memberAnnouncementView.count({
      where: { announcementId },
    });
  }

  /**
   * Find announcements with filters and pagination
   */
  async findWithFilters(
    filters: any,
    orderBy: any,
    page: number,
    limit: number
  ): Promise<PrismaAnnouncement[]> {
    const skip = (page - 1) * limit;

    const announcements = await prisma.announcement.findMany({
      where: filters,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            views: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    return announcements as never[];
  }

  /**
   * Count announcements with filters
   */
  async countWithFilters(filters: any): Promise<number> {
    return prisma.announcement.count({
      where: filters,
    });
  }

  /**
   * Unarchive announcement (restore from archive)
   */
  async unarchive(id: string): Promise<void> {
    await prisma.announcement.update({
      where: { id },
      data: {
        archivedAt: null,
      },
    });
  }

  /**
   * Bulk archive announcements
   */
  async bulkArchive(ids: string[]): Promise<number> {
    const result = await prisma.announcement.updateMany({
      where: {
        id: { in: ids },
        deletedAt: null,
      },
      data: {
        archivedAt: new Date(),
      },
    });
    return result.count;
  }

  /**
   * Bulk delete announcements
   */
  async bulkDelete(ids: string[]): Promise<number> {
    const result = await prisma.announcement.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        deletedAt: new Date(),
      },
    });
    return result.count;
  }

  /**
   * Get all authors who have created announcements
   */
  async getAuthors(): Promise<any[]> {
    const authors = await prisma.member.findMany({
      where: {
        announcements: {
          some: {
            deletedAt: null,
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
      orderBy: {
        firstName: 'asc',
      },
    });

    return authors;
  }

  /**
   * Get announcement view analytics
   */
  async getViewAnalytics(announcementId: string): Promise<any> {
    const views = await prisma.memberAnnouncementView.findMany({
      where: { announcementId },
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        viewedAt: 'desc',
      },
    });

    const uniqueViews = views.length;
    const firstViewed = views.length > 0 ? views[views.length - 1].viewedAt : null;
    const lastViewed = views.length > 0 ? views[0].viewedAt : null;

    return {
      totalViews: uniqueViews,
      firstViewed,
      lastViewed,
      recentViews: views.slice(0, 10),
    };
  }
}

// Export singleton instance
export const announcementRepository = new AnnouncementRepository();
