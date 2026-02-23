/**
 * Gallery Service
 *
 * Handles all gallery-related API calls:
 * - Gallery listing with album filter
 * - Album listing
 * - Photo CRUD (admin/staff)
 */

import apiClient from '../api/apiClient';

// ============================================================================
// TYPES
// ============================================================================

export interface GalleryItem {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string;
  title: string;
  titleThai?: string;
  description?: string;
  descriptionThai?: string;
  albumId: string;
  albumTitle: string;
  albumTitleThai?: string;
  category?: string;
  eventDate?: string;
  photographer?: string;
  sortOrder: number;
  createdAt: string;
}

export interface Album {
  id: string;
  title: string;
  titleThai?: string;
  coverImage: string;
  photoCount: number;
}

interface CreateGalleryItemInput {
  imageUrl: string;
  title?: string;
  titleThai?: string;
  description?: string;
  descriptionThai?: string;
  albumId: string;
  albumTitle: string;
  albumTitleThai?: string;
  photographer?: string;
  eventDate?: string;
  sortOrder?: number;
}

interface GalleryResponse {
  success: boolean;
  data: {
    items: GalleryItem[];
    albums: Album[];
  };
}

interface GalleryItemResponse {
  success: boolean;
  data: GalleryItem;
}

// ============================================================================
// GALLERY SERVICE
// ============================================================================

export const galleryService = {
  /**
   * Get gallery items and albums, optionally filtered by album
   */
  async getGallery(albumId?: string): Promise<{ items: GalleryItem[]; albums: Album[] }> {
    const query = albumId ? `?albumId=${albumId}` : '';
    const response = (await apiClient.get(`/gallery${query}`)) as GalleryResponse;
    return response.data;
  },

  /**
   * Add a new photo to the gallery (admin/staff)
   */
  async createGalleryItem(data: CreateGalleryItemInput): Promise<GalleryItem> {
    const response = (await apiClient.post('/gallery', data)) as GalleryItemResponse;
    return response.data;
  },

  /**
   * Delete a gallery item (admin/staff)
   */
  async deleteGalleryItem(id: string): Promise<void> {
    await apiClient.delete(`/gallery/${id}`);
  },
};

export default galleryService;
