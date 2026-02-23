/**
 * GalleryItem Domain Entity
 *
 * Represents a photo in the church gallery.
 * Business Rules:
 * - Image URL is required
 * - Album ID and title are required for grouping
 */
export class GalleryItem {
  private constructor(
    public readonly id: string,
    public title: string,
    public titleThai: string | null,
    public imageUrl: string,
    public thumbnailUrl: string | null,
    public cloudinaryId: string | null,
    public albumId: string,
    public albumTitle: string,
    public albumTitleThai: string | null,
    public category: string | null,
    public eventDate: string | null,
    public photographer: string | null,
    public description: string | null,
    public sortOrder: number,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {
    this.validateImageUrl(imageUrl);
    this.validateAlbumId(albumId);
  }

  static create(
    id: string,
    title: string,
    imageUrl: string,
    albumId: string,
    albumTitle: string,
    options: {
      titleThai?: string;
      thumbnailUrl?: string;
      cloudinaryId?: string;
      albumTitleThai?: string;
      category?: string;
      eventDate?: string;
      photographer?: string;
      description?: string;
      sortOrder?: number;
    } = {}
  ): GalleryItem {
    const now = new Date();
    return new GalleryItem(
      id,
      title,
      options.titleThai ?? null,
      imageUrl,
      options.thumbnailUrl ?? null,
      options.cloudinaryId ?? null,
      albumId,
      albumTitle,
      options.albumTitleThai ?? null,
      options.category ?? null,
      options.eventDate ?? null,
      options.photographer ?? null,
      options.description ?? null,
      options.sortOrder ?? 0,
      now,
      now
    );
  }

  static fromPersistence(data: {
    id: string;
    title: string;
    titleThai: string | null;
    imageUrl: string;
    thumbnailUrl: string | null;
    cloudinaryId: string | null;
    albumId: string;
    albumTitle: string;
    albumTitleThai: string | null;
    category: string | null;
    eventDate: string | null;
    photographer: string | null;
    description: string | null;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
  }): GalleryItem {
    return new GalleryItem(
      data.id,
      data.title,
      data.titleThai,
      data.imageUrl,
      data.thumbnailUrl,
      data.cloudinaryId,
      data.albumId,
      data.albumTitle,
      data.albumTitleThai,
      data.category,
      data.eventDate,
      data.photographer,
      data.description,
      data.sortOrder,
      data.createdAt,
      data.updatedAt
    );
  }

  private validateImageUrl(url: string): void {
    if (!url || url.trim().length === 0) {
      throw new Error('Gallery item image URL is required');
    }
  }

  private validateAlbumId(albumId: string): void {
    if (!albumId || albumId.trim().length === 0) {
      throw new Error('Gallery item album ID is required');
    }
  }
}
