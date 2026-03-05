/**
 * Repository interface for Sermon entity
 */
export interface ISermonRepository {
  findAll(options?: { isPublished?: boolean; speaker?: string; series?: string }): Promise<any[]>;
  findById(id: string): Promise<any | null>;
  create(sermon: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  delete(id: string): Promise<void>;
  incrementViews(id: string): Promise<void>;
  getSpeakers(): Promise<string[]>;
  getSeries(): Promise<string[]>;
  findRecent(limit: number): Promise<any[]>;
}
