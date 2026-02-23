/**
 * BlogPost Domain Entity
 *
 * Represents a blog/news post for the church website.
 * Business Rules:
 * - Title must be between 3-300 characters
 * - Slug is auto-generated from title if not provided
 * - Content is required
 * - Category is required
 */
export class BlogPost {
  private constructor(
    public readonly id: string,
    public title: string,
    public titleThai: string | null,
    public slug: string,
    public excerpt: string,
    public excerptThai: string | null,
    public content: string,
    public contentThai: string | null,
    public author: string,
    public category: string,
    public categoryThai: string | null,
    public tags: string[],
    public thumbnailUrl: string | null,
    public readTime: number,
    public featured: boolean,
    public isPublished: boolean,
    public publishedAt: Date,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {
    this.validateTitle(title);
    this.validateContent(content);
  }

  static create(
    id: string,
    title: string,
    content: string,
    excerpt: string,
    author: string,
    category: string,
    options: {
      titleThai?: string;
      slug?: string;
      excerptThai?: string;
      contentThai?: string;
      categoryThai?: string;
      tags?: string[];
      thumbnailUrl?: string;
      readTime?: number;
      featured?: boolean;
      isPublished?: boolean;
    } = {}
  ): BlogPost {
    const now = new Date();
    const slug = options.slug || BlogPost.generateSlug(title);
    return new BlogPost(
      id,
      title,
      options.titleThai ?? null,
      slug,
      excerpt,
      options.excerptThai ?? null,
      content,
      options.contentThai ?? null,
      author,
      category,
      options.categoryThai ?? null,
      options.tags ?? [],
      options.thumbnailUrl ?? null,
      options.readTime ?? Math.ceil(content.split(/\s+/).length / 200),
      options.featured ?? false,
      options.isPublished ?? true,
      now,
      now,
      now
    );
  }

  static fromPersistence(data: {
    id: string;
    title: string;
    titleThai: string | null;
    slug: string;
    excerpt: string;
    excerptThai: string | null;
    content: string;
    contentThai: string | null;
    author: string;
    category: string;
    categoryThai: string | null;
    tags: string[];
    thumbnailUrl: string | null;
    readTime: number;
    featured: boolean;
    isPublished: boolean;
    publishedAt: Date;
    createdAt: Date;
    updatedAt: Date;
  }): BlogPost {
    return new BlogPost(
      data.id,
      data.title,
      data.titleThai,
      data.slug,
      data.excerpt,
      data.excerptThai,
      data.content,
      data.contentThai,
      data.author,
      data.category,
      data.categoryThai,
      data.tags,
      data.thumbnailUrl,
      data.readTime,
      data.featured,
      data.isPublished,
      data.publishedAt,
      data.createdAt,
      data.updatedAt
    );
  }

  static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private validateTitle(title: string): void {
    if (!title || title.trim().length < 3) {
      throw new Error('Blog post title must be at least 3 characters');
    }
    if (title.length > 300) {
      throw new Error('Blog post title cannot exceed 300 characters');
    }
  }

  private validateContent(content: string): void {
    if (!content || content.trim().length < 10) {
      throw new Error('Blog post content must be at least 10 characters');
    }
  }
}
