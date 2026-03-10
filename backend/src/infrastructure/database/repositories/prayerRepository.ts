import { randomUUID } from 'crypto';
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

  async findPublicApprovedWithHasPrayed(memberId?: string): Promise<any[]> {
    const prayers = await prisma.prayer_requests.findMany({
      where: { isPublic: true, status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      include: memberId ? { supporters: { where: { memberId }, select: { id: true } } } : false,
    });
    return prayers.map((p: any) => {
      const { supporters, ...rest } = p as any;
      return {
        ...rest,
        hasPrayed: memberId ? (supporters?.length ?? 0) > 0 : false,
      };
    });
  }

  async addSupporter(prayerRequestId: string, memberId: string): Promise<void> {
    await prisma.prayer_supporters.upsert({
      where: { prayerRequestId_memberId: { prayerRequestId, memberId } },
      create: { id: randomUUID(), prayerRequestId, memberId },
      update: {},
    });
  }

  async removeSupporter(prayerRequestId: string, memberId: string): Promise<void> {
    await prisma.prayer_supporters.deleteMany({ where: { prayerRequestId, memberId } });
  }

  async hasMemberPrayed(prayerRequestId: string, memberId: string): Promise<boolean> {
    const count = await prisma.prayer_supporters.count({
      where: { prayerRequestId, memberId },
    });
    return count > 0;
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

  async decrementPrayerCount(id: string): Promise<any> {
    // Fetch current count first to ensure we never go below 0
    const current = await prisma.prayer_requests.findUnique({ where: { id } });
    if (!current || current.prayerCount <= 0) return current;
    return prisma.prayer_requests.update({
      where: { id },
      data: { prayerCount: { decrement: 1 }, updatedAt: new Date() },
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

  async countPending(): Promise<number> {
    return prisma.prayer_requests.count({
      where: { status: 'PENDING' },
    });
  }
}
