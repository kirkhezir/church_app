/**
 * Blog Service
 *
 * Handles all blog-related API calls:
 * - Blog post listing with filters
 * - Blog post details by slug
 * - Blog CRUD (admin/staff)
 * - Category listing
 */

import apiClient from '../api/apiClient';

// ============================================================================
// TYPES
// ============================================================================

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  titleThai?: string;
  content: string;
  contentThai?: string;
  excerpt: string;
  excerptThai?: string;
  category: string;
  categoryThai?: string;
  tags: string[];
  thumbnailUrl?: string;
  author: string;
  featured: boolean;
  readTime: number;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface GetBlogPostsParams {
  category?: string;
  featured?: boolean;
}

interface CreateBlogPostInput {
  title: string;
  titleThai?: string;
  content: string;
  contentThai?: string;
  excerpt: string;
  excerptThai?: string;
  category: string;
  categoryThai?: string;
  tags?: string[];
  thumbnailUrl?: string;
  author: string;
  featured?: boolean;
}

interface UpdateBlogPostInput {
  title?: string;
  titleThai?: string;
  content?: string;
  contentThai?: string;
  excerpt?: string;
  excerptThai?: string;
  category?: string;
  categoryThai?: string;
  tags?: string[];
  thumbnailUrl?: string;
  author?: string;
  featured?: boolean;
  isPublished?: boolean;
}

interface BlogListResponse {
  success: boolean;
  data: BlogPost[];
}

interface BlogDetailResponse {
  success: boolean;
  data: BlogPost;
}

interface CategoriesResponse {
  success: boolean;
  data: string[];
}

// ============================================================================
// BLOG SERVICE
// ============================================================================

export const blogService = {
  /**
   * Get list of published blog posts
   */
  async getBlogPosts(params?: GetBlogPostsParams): Promise<BlogPost[]> {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.featured !== undefined) queryParams.append('featured', String(params.featured));
    const query = queryParams.toString();

    const response = (await apiClient.get(`/blog${query ? `?${query}` : ''}`)) as BlogListResponse;
    return response.data;
  },

  /**
   * Get blog post by slug
   */
  async getBlogPostBySlug(slug: string): Promise<BlogPost> {
    const response = (await apiClient.get(`/blog/${slug}`)) as BlogDetailResponse;
    return response.data;
  },

  /**
   * Get list of unique categories
   */
  async getCategories(): Promise<string[]> {
    const response = (await apiClient.get('/blog/categories')) as CategoriesResponse;
    return response.data;
  },

  /**
   * Create a new blog post (admin/staff)
   */
  async createBlogPost(data: CreateBlogPostInput): Promise<BlogPost> {
    const response = (await apiClient.post('/blog', data)) as BlogDetailResponse;
    return response.data;
  },

  /**
   * Update a blog post (admin/staff)
   */
  async updateBlogPost(id: string, data: UpdateBlogPostInput): Promise<BlogPost> {
    const response = (await apiClient.patch(`/blog/${id}`, data)) as BlogDetailResponse;
    return response.data;
  },

  /**
   * Delete a blog post (admin/staff)
   */
  async deleteBlogPost(id: string): Promise<void> {
    await apiClient.delete(`/blog/${id}`);
  },
};

export default blogService;
