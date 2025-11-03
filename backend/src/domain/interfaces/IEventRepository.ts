/**
 * Repository interface for Event entity
 */
export interface IEventRepository {
  /**
   * Find event by ID
   */
  findById(id: string): Promise<any | null>;

  /**
   * Find all events (excluding deleted)
   */
  findAll(): Promise<any[]>;

  /**
   * Find events by category
   */
  findByCategory(category: string): Promise<any[]>;

  /**
   * Find upcoming events
   */
  findUpcoming(limit?: number): Promise<any[]>;

  /**
   * Find events by creator
   */
  findByCreator(creatorId: string): Promise<any[]>;

  /**
   * Create new event
   */
  create(event: any): Promise<any>;

  /**
   * Update existing event
   */
  update(event: any): Promise<any>;

  /**
   * Cancel event (soft cancel)
   */
  cancel(id: string): Promise<void>;

  /**
   * Delete event (soft delete)
   */
  delete(id: string): Promise<void>;
}
