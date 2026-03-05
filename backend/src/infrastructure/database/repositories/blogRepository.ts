import prisma from '../prismaClient';
import { IBlogRepository } from '../../../domain/interfaces/IBlogRepository';

/**
 * Blog Repository Implementation
 * Implements repository interface using Prisma ORM
 */
export class BlogRepository implements IBlogRepository {
  async findAll(
    options: { isPublished?: boolean; category?: string; featured?: boolean } = {}
  ): Promise<any[]> {
    const where: any = {};
    if (options.isPublished !== undefined) where.isPublished = options.isPublished;
    if (options.category) where.category = options.category;
    if (options.featured !== undefined) where.featured = options.featured;

    return prisma.blog_posts.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
    });
  }

  async findById(id: string): Promise<any | null> {
    return prisma.blog_posts.findUnique({ where: { id } });
  }

  async findBySlug(slug: string): Promise<any | null> {
    return prisma.blog_posts.findUnique({ where: { slug } });
  }

  async create(data: any): Promise<any> {
    return prisma.blog_posts.create({ data });
  }

  async update(id: string, data: any): Promise<any> {
    return prisma.blog_posts.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.blog_posts.delete({ where: { id } });
  }

  async getCategories(): Promise<string[]> {
    const results = await prisma.blog_posts.findMany({
      where: { isPublished: true },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });
    return results.map((r: any) => r.category);
  }

  async findRecent(limit: number): Promise<any[]> {
    return prisma.blog_posts.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });
  }
}
