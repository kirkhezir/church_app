/**
 * Repository interface for Announcement entity
 */
export interface IAnnouncementRepository {
  /**
   * Find announcement by ID
   */
  findById(id: string): Promise<any | null>;

  /**
   * Find all active announcements (not archived)
   */
  findActive(): Promise<any[]>;

  /**
   * Find archived announcements
   */
  findArchived(): Promise<any[]>;

  /**
   * Create new announcement
   */
  create(announcement: any): Promise<any>;

  /**
   * Update existing announcement
   */
  update(announcement: any): Promise<any>;

  /**
   * Archive announcement
   */
  archive(id: string): Promise<void>;

  /**
   * Delete announcement (soft delete)
   */
  delete(id: string): Promise<void>;

  /**
   * Find recent published announcements
   */
  findRecent(limit: number): Promise<any[]>;
}
