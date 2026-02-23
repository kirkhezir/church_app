/**
 * Sermon Service
 *
 * Handles all sermon-related API calls:
 * - Sermon listing with filters
 * - Sermon details
 * - View count tracking
 * - Sermon CRUD (admin/staff)
 * - Speaker and series lists
 */

import apiClient from '../api/apiClient';

// ============================================================================
// TYPES
// ============================================================================

export interface Sermon {
  id: string;
  title: string;
  titleThai?: string;
  speaker: string;
  speakerThai?: string;
  series?: string;
  seriesThai?: string;
  scripture?: string;
  date: string;
  youtubeUrl?: string;
  audioUrl?: string;
  thumbnailUrl?: string;
  duration?: string;
  description?: string;
  descriptionThai?: string;
  views: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GetSermonsParams {
  speaker?: string;
  series?: string;
}

interface CreateSermonInput {
  title: string;
  titleThai?: string;
  speaker: string;
  speakerThai?: string;
  series?: string;
  seriesThai?: string;
  scripture?: string;
  date: string;
  youtubeUrl?: string;
  audioUrl?: string;
  thumbnailUrl?: string;
  duration?: string;
  description?: string;
  descriptionThai?: string;
}

interface UpdateSermonInput {
  title?: string;
  titleThai?: string;
  speaker?: string;
  speakerThai?: string;
  series?: string;
  seriesThai?: string;
  scripture?: string;
  date?: string;
  youtubeUrl?: string;
  audioUrl?: string;
  thumbnailUrl?: string;
  duration?: string;
  description?: string;
  descriptionThai?: string;
  isPublished?: boolean;
}

interface SermonListResponse {
  success: boolean;
  data: Sermon[];
}

interface SermonDetailResponse {
  success: boolean;
  data: Sermon;
}

interface SpeakersResponse {
  success: boolean;
  data: string[];
}

interface SeriesResponse {
  success: boolean;
  data: string[];
}

// ============================================================================
// SERMON SERVICE
// ============================================================================

export const sermonService = {
  /**
   * Get list of published sermons
   */
  async getSermons(params?: GetSermonsParams): Promise<Sermon[]> {
    const queryParams = new URLSearchParams();
    if (params?.speaker) queryParams.append('speaker', params.speaker);
    if (params?.series) queryParams.append('series', params.series);
    const query = queryParams.toString();

    const response = (await apiClient.get(
      `/sermons${query ? `?${query}` : ''}`
    )) as SermonListResponse;
    return response.data;
  },

  /**
   * Get sermon by ID
   */
  async getSermonById(id: string): Promise<Sermon> {
    const response = (await apiClient.get(`/sermons/${id}`)) as SermonDetailResponse;
    return response.data;
  },

  /**
   * Get list of unique speakers
   */
  async getSpeakers(): Promise<string[]> {
    const response = (await apiClient.get('/sermons/speakers')) as SpeakersResponse;
    return response.data;
  },

  /**
   * Get list of unique series
   */
  async getSeries(): Promise<string[]> {
    const response = (await apiClient.get('/sermons/series')) as SeriesResponse;
    return response.data;
  },

  /**
   * Increment sermon view count
   */
  async incrementViews(id: string): Promise<Sermon> {
    const response = (await apiClient.post(`/sermons/${id}/views`)) as SermonDetailResponse;
    return response.data;
  },

  /**
   * Create a new sermon (admin/staff)
   */
  async createSermon(data: CreateSermonInput): Promise<Sermon> {
    const response = (await apiClient.post('/sermons', data)) as SermonDetailResponse;
    return response.data;
  },

  /**
   * Update a sermon (admin/staff)
   */
  async updateSermon(id: string, data: UpdateSermonInput): Promise<Sermon> {
    const response = (await apiClient.patch(`/sermons/${id}`, data)) as SermonDetailResponse;
    return response.data;
  },

  /**
   * Delete a sermon (admin/staff)
   */
  async deleteSermon(id: string): Promise<void> {
    await apiClient.delete(`/sermons/${id}`);
  },
};

export default sermonService;
