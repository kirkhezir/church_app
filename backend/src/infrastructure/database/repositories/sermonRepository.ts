import prisma from '../prismaClient';
import { ISermonRepository } from '../../../domain/interfaces/ISermonRepository';

/**
 * Sermon Repository Implementation
 * Implements repository interface using Prisma ORM
 */
export class SermonRepository implements ISermonRepository {
  async findAll(
    options: { isPublished?: boolean; speaker?: string; series?: string } = {}
  ): Promise<any[]> {
    const where: any = {};
    if (options.isPublished !== undefined) where.isPublished = options.isPublished;
    if (options.speaker) where.speaker = options.speaker;
    if (options.series) where.series = options.series;

    return prisma.sermons.findMany({
      where,
      orderBy: { date: 'desc' },
    });
  }

  async findById(id: string): Promise<any | null> {
    return prisma.sermons.findUnique({ where: { id } });
  }

  async create(data: any): Promise<any> {
    return prisma.sermons.create({ data });
  }

  async update(id: string, data: any): Promise<any> {
    return prisma.sermons.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.sermons.delete({ where: { id } });
  }

  async incrementViews(id: string): Promise<void> {
    await prisma.sermons.update({
      where: { id },
      data: { views: { increment: 1 }, updatedAt: new Date() },
    });
  }

  async getSpeakers(): Promise<string[]> {
    const results = await prisma.sermons.findMany({
      where: { isPublished: true },
      select: { speaker: true },
      distinct: ['speaker'],
      orderBy: { speaker: 'asc' },
    });
    return results.map((r: any) => r.speaker);
  }

  async getSeries(): Promise<string[]> {
    const results = await prisma.sermons.findMany({
      where: { isPublished: true, series: { not: null } },
      select: { series: true },
      distinct: ['series'],
      orderBy: { series: 'asc' },
    });
    return results.map((r: any) => r.series).filter(Boolean);
  }
}
