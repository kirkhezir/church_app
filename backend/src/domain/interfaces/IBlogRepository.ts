/**
 * Repository interface for BlogPost entity
 */
export interface IBlogRepository {
  findAll(options?: {
    isPublished?: boolean;
    category?: string;
    featured?: boolean;
  }): Promise<any[]>;
  findById(id: string): Promise<any | null>;
  findBySlug(slug: string): Promise<any | null>;
  create(post: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  delete(id: string): Promise<void>;
  getCategories(): Promise<string[]>;
  findRecent(limit: number): Promise<any[]>;
}
