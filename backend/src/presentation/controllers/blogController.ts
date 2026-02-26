import { Request, Response, NextFunction } from 'express';
import { GetBlogPosts } from '../../application/useCases/getBlogPosts';
import { GetBlogPostBySlug } from '../../application/useCases/getBlogPostBySlug';
import { CreateBlogPost } from '../../application/useCases/createBlogPost';
import { UpdateBlogPost } from '../../application/useCases/updateBlogPost';
import { DeleteBlogPost } from '../../application/useCases/deleteBlogPost';
import { BlogRepository } from '../../infrastructure/database/repositories/blogRepository';

/**
 * BlogController
 *
 * Handles HTTP requests for blog post management.
 */
export class BlogController {
  private blogRepository: BlogRepository;

  constructor() {
    this.blogRepository = new BlogRepository();
  }

  /**
   * GET /api/v1/blog
   * Get list of published blog posts with optional filters (PUBLIC)
   */
  async getBlogPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const useCase = new GetBlogPosts(this.blogRepository);
      const result = await useCase.execute({
        category: req.query.category as string | undefined,
        featured: req.query.featured === 'true' ? true : undefined,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/blog/categories
   * Get list of unique categories (PUBLIC)
   */
  async getCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await this.blogRepository.getCategories();
      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/blog/:slug
   * Get blog post details by slug (PUBLIC)
   */
  async getBlogPostBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const useCase = new GetBlogPostBySlug(this.blogRepository);
      const result = await useCase.execute(req.params.slug);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/blog
   * Create a new blog post (ADMIN, STAFF)
   */
  async createBlogPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const useCase = new CreateBlogPost(this.blogRepository);
      const result = await useCase.execute({
        title: req.body.title,
        titleThai: req.body.titleThai,
        content: req.body.content,
        contentThai: req.body.contentThai,
        excerpt: req.body.excerpt,
        excerptThai: req.body.excerptThai,
        category: req.body.category,
        tags: req.body.tags,
        thumbnailUrl: req.body.coverImageUrl || req.body.thumbnailUrl,
        author: req.body.author,
        categoryThai: req.body.categoryThai,
        featured: req.body.featured,
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/blog/:id
   * Update blog post details (ADMIN, STAFF)
   */
  async updateBlogPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const useCase = new UpdateBlogPost(this.blogRepository);
      const result = await useCase.execute(req.params.id, req.body);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/blog/:id
   * Delete a blog post (ADMIN, STAFF)
   */
  async deleteBlogPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const useCase = new DeleteBlogPost(this.blogRepository);
      await useCase.execute(req.params.id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
