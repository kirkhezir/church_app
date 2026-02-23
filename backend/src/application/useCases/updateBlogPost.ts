import { IBlogRepository } from '../../domain/interfaces/IBlogRepository';

/**
 * UpdateBlogPost Use Case - Admin updates an existing blog post
 */
export class UpdateBlogPost {
  constructor(private blogRepository: IBlogRepository) {}

  async execute(id: string, data: Record<string, any>): Promise<any> {
    const existing = await this.blogRepository.findById(id);
    if (!existing) {
      const error = new Error('Blog post not found');
      (error as any).statusCode = 404;
      throw error;
    }
    return this.blogRepository.update(id, data);
  }
}
