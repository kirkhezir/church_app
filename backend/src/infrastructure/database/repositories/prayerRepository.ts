import prisma from '../prismaClient';
import { IPrayerRepository } from '../../../domain/interfaces/IPrayerRepository';

/**
 * Prayer Repository Implementation
 * Implements repository interface using Prisma ORM
 */
export class PrayerRepository implements IPrayerRepository {
  async findPublicApproved(): Promise<any[]> {
    return prisma.prayer_requests.findMany({
      where: { isPublic: true, status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll(options: { status?: string } = {}): Promise<any[]> {
    const where: any = {};
    if (options.status) where.status = options.status;

    return prisma.prayer_requests.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<any | null> {
    return prisma.prayer_requests.findUnique({ where: { id } });
  }

  async create(data: any): Promise<any> {
    return prisma.prayer_requests.create({ data });
  }

  async updateStatus(id: string, status: string): Promise<any> {
    return prisma.prayer_requests.update({
      where: { id },
      data: { status: status as any, updatedAt: new Date() },
    });
  }

  async incrementPrayerCount(id: string): Promise<any> {
    return prisma.prayer_requests.update({
      where: { id },
      data: { prayerCount: { increment: 1 }, updatedAt: new Date() },
    });
  }

  async findRecentPublic(limit: number): Promise<any[]> {
    return prisma.prayer_requests.findMany({
      where: { isPublic: true, status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async countPublicApproved(): Promise<number> {
    return prisma.prayer_requests.count({
      where: { isPublic: true, status: 'APPROVED' },
    });
  }
}
