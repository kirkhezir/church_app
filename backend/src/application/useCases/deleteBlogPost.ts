import { IBlogRepository } from '../../domain/interfaces/IBlogRepository';

/**
 * DeleteBlogPost Use Case - Admin deletes a blog post
 */
export class DeleteBlogPost {
  constructor(private blogRepository: IBlogRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.blogRepository.findById(id);
    if (!existing) {
      const error = new Error('Blog post not found');
      (error as any).statusCode = 404;
      throw error;
    }
    await this.blogRepository.delete(id);
  }
}
