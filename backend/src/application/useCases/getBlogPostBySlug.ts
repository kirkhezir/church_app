import { IBlogRepository } from '../../domain/interfaces/IBlogRepository';

/**
 * GetBlogPostBySlug Use Case - Retrieve a single blog post by slug
 */
export class GetBlogPostBySlug {
  constructor(private blogRepository: IBlogRepository) {}

  async execute(slug: string): Promise<any> {
    const post = await this.blogRepository.findBySlug(slug);
    if (!post) {
      const error = new Error('Blog post not found');
      (error as any).statusCode = 404;
      throw error;
    }
    return post;
  }
}
