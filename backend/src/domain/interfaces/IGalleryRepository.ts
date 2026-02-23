/**
 * Repository interface for GalleryItem entity
 */
export interface IGalleryRepository {
  findAll(options?: { albumId?: string }): Promise<any[]>;
  findById(id: string): Promise<any | null>;
  getAlbums(): Promise<any[]>;
  create(item: any): Promise<any>;
  delete(id: string): Promise<void>;
}
