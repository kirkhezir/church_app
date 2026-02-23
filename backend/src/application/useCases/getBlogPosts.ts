import { IBlogRepository } from '../../domain/interfaces/IBlogRepository';

/**
 * GetBlogPosts Use Case - Retrieve published blog posts with optional filtering
 */
export class GetBlogPosts {
  constructor(private blogRepository: IBlogRepository) {}

  async execute(input: { category?: string; featured?: boolean } = {}): Promise<any[]> {
    return this.blogRepository.findAll({
      isPublished: true,
      category: input.category,
      featured: input.featured,
    });
  }
}
