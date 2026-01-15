import { announcements as PrismaAnnouncement } from '@prisma/client';
import prisma from '../prismaClient';
import { IAnnouncementRepository } from '../../../domain/interfaces/IAnnouncementRepository';

/**
 * Transform Prisma result to API format
 * Renames 'members' to 'author' and '_count.member_announcement_views' to '_count.views'
 */
function transformAnnouncement(announcement: any): any {
  if (!announcement) return null;
  const { members, _count, ...rest } = announcement;
  return {
    ...rest,
    author: members,
    _count: _count ? { views: _count.member_announcement_views ?? 0 } : { views: 0 },
  };
}

/**
 * Announcement Repository Implementation
 * Implements repository interface using Prisma ORM
 */
export class AnnouncementRepository implements IAnnouncementRepository {
  /**
   * Find announcement by ID
   */
  async findById(id: string): Promise<PrismaAnnouncement | null> {
    const announcement = await prisma.announcements.findUnique({
      where: { id, deletedAt: null },
      include: {
        members: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            member_announcement_views: true,
          },
        },
      },
    });

    return transformAnnouncement(announcement) as never;
  }

  /**
   * Find all active announcements (not archived)
   */
  async findActive(): Promise<PrismaAnnouncement[]> {
    const announcements = await prisma.announcements.findMany({
      where: {
        deletedAt: null,
        archivedAt: null,
      },
      include: {
        members: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            member_announcement_views: true,
          },
        },
      },
      orderBy: [{ priority: 'desc' }, { publishedAt: 'desc' }],
    });

    return announcements.map(transformAnnouncement) as never[];
  }

  /**
   * Find archived announcements
   */
  async findArchived(): Promise<PrismaAnnouncement[]> {
    const announcements = await prisma.announcements.findMany({
      where: {
        deletedAt: null,
        archivedAt: { not: null },
      },
      include: {
        members: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            member_announcement_views: true,
          },
        },
      },
      orderBy: { archivedAt: 'desc' },
    });

    return announcements.map(transformAnnouncement) as never[];
  }

  /**
   * Find urgent announcements
   */
  async findUrgent(): Promise<PrismaAnnouncement[]> {
    const announcements = await prisma.announcements.findMany({
      where: {
        deletedAt: null,
        archivedAt: null,
        priority: 'URGENT',
      },
      include: {
        members: {
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

    return announcements.map(transformAnnouncement) as never[];
  }

  /**
   * Find recent announcements
   */
  async findRecent(limit: number = 10): Promise<PrismaAnnouncement[]> {
    const announcements = await prisma.announcements.findMany({
      where: {
        deletedAt: null,
        archivedAt: null,
        publishedAt: { lte: new Date() }, // Only published announcements
      },
      include: {
        members: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            member_announcement_views: true,
          },
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });

    return announcements.map(transformAnnouncement) as never[];
  }

  /**
   * Create new announcement
   */
  async create(announcement: any): Promise<PrismaAnnouncement> {
    const created = await prisma.announcements.create({
      data: {
        id: announcement.id,
        title: announcement.title,
        content: announcement.content,
        priority: announcement.priority as never,
        authorId: announcement.authorId,
        publishedAt: announcement.publishedAt || new Date(),
        updatedAt: new Date(),
      },
      include: {
        members: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return transformAnnouncement(created) as never;
  }

  /**
   * Update existing announcement
   */
  async update(announcement: any): Promise<PrismaAnnouncement> {
    const updated = await prisma.announcements.update({
      where: { id: announcement.id },
      data: {
        title: announcement.title,
        content: announcement.content,
        priority: announcement.priority as never,
        updatedAt: new Date(),
      },
      include: {
        members: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return transformAnnouncement(updated) as never;
  }

  /**
   * Archive announcement
   */
  async archive(id: string): Promise<void> {
    await prisma.announcements.update({
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
    await prisma.announcements.update({
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
    await prisma.member_announcement_views.upsert({
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
        id: crypto.randomUUID(),
        memberId,
        announcementId,
      },
    });
  }

  /**
   * Check if member has viewed announcement
   */
  async hasViewed(announcementId: string, memberId: string): Promise<boolean> {
    const view = await prisma.member_announcement_views.findUnique({
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

    const announcements = await prisma.announcements.findMany({
      where: filters,
      include: {
        members: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            member_announcement_views: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    return announcements.map(transformAnnouncement) as never[];
  }

  /**
   * Count announcements with filters
   */
  async countWithFilters(filters: any): Promise<number> {
    return prisma.announcements.count({
      where: filters,
    });
  }

  /**
   * Unarchive announcement (restore from archive)
   */
  async unarchive(id: string): Promise<void> {
    await prisma.announcements.update({
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
    const result = await prisma.announcements.updateMany({
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
    const result = await prisma.announcements.updateMany({
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
        members: {
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
      totalmember_announcement_views: uniqueViews,
      firstViewed,
      lastViewed,
      recentmember_announcement_views: views.slice(0, 10),
    };
  }
}

// Export singleton instance
export const announcementRepository = new AnnouncementRepository();
