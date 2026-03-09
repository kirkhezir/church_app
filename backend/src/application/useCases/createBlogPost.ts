import { randomUUID } from 'crypto';
import { IBlogRepository } from '../../domain/interfaces/IBlogRepository';
import { BlogPost } from '../../domain/entities/BlogPost';

interface CreateBlogPostInput {
  title: string;
  titleThai?: string;
  slug?: string;
  excerpt: string;
  excerptThai?: string;
  content: string;
  contentThai?: string;
  author: string;
  category: string;
  categoryThai?: string;
  tags?: string[];
  thumbnailUrl?: string;
  readTime?: number;
  featured?: boolean;
  isPublished?: boolean;
}

/**
 * CreateBlogPost Use Case - Admin creates a new blog post
 */
export class CreateBlogPost {
  constructor(private blogRepository: IBlogRepository) {}

  async execute(input: CreateBlogPostInput) {
    if (!input.title || input.title.trim().length < 3) {
      throw new Error('Blog post title must be at least 3 characters');
    }
    if (!input.content || input.content.trim().length < 10) {
      throw new Error('Content must be at least 10 characters');
    }

    const slug = input.slug || BlogPost.generateSlug(input.title);

    // Check slug uniqueness
    const existing = await this.blogRepository.findBySlug(slug);
    if (existing) {
      throw new Error('A blog post with this slug already exists');
    }

    return this.blogRepository.create({
      id: randomUUID(),
      updatedAt: new Date(),
      title: input.title,
      titleThai: input.titleThai || null,
      slug,
      excerpt: input.excerpt,
      excerptThai: input.excerptThai || null,
      content: input.content,
      contentThai: input.contentThai || null,
      author: input.author,
      category: input.category,
      categoryThai: input.categoryThai || null,
      tags: input.tags || [],
      thumbnailUrl: input.thumbnailUrl || null,
      readTime: input.readTime ?? Math.ceil(input.content.split(/\s+/).length / 200),
      featured: input.featured ?? false,
      isPublished: input.isPublished ?? true,
      publishedAt: new Date(),
    });
  }
}
