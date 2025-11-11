import apiClient from '../api/apiClient';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'URGENT' | 'NORMAL';
  publishedAt: string;
  archivedAt: string | null;
  createdAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  priority?: 'URGENT' | 'NORMAL';
}

export interface UpdateAnnouncementRequest {
  title?: string;
  content?: string;
  priority?: 'URGENT' | 'NORMAL';
}

export interface AnnouncementsListResponse {
  data: Announcement[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Announcement Service
 * API methods for announcement management
 */
export const announcementService = {
  /**
   * Get list of announcements with optional filters
   */
  async getAnnouncements(
    archived: boolean = false,
    page: number = 1,
    limit: number = 10
  ): Promise<AnnouncementsListResponse> {
    const response = await apiClient.get('/announcements', {
      params: { archived, page, limit },
    });
    return response.data;
  },

  /**
   * Get announcement by ID
   */
  async getAnnouncementById(id: string): Promise<Announcement> {
    const response = await apiClient.get(`/announcements/${id}`);
    return response.data;
  },

  /**
   * Create new announcement (admin/staff only)
   */
  async createAnnouncement(data: CreateAnnouncementRequest): Promise<Announcement> {
    const response = await apiClient.post('/announcements', data);
    return response.data;
  },

  /**
   * Update announcement (admin/staff only)
   */
  async updateAnnouncement(id: string, data: UpdateAnnouncementRequest): Promise<Announcement> {
    const response = await apiClient.put(`/announcements/${id}`, data);
    return response.data;
  },

  /**
   * Archive announcement (admin/staff only)
   */
  async archiveAnnouncement(id: string): Promise<void> {
    await apiClient.post(`/announcements/${id}/archive`);
  },

  /**
   * Delete announcement (admin/staff only)
   */
  async deleteAnnouncement(id: string): Promise<void> {
    await apiClient.delete(`/announcements/${id}`);
  },

  /**
   * Track announcement view
   */
  async trackView(id: string): Promise<void> {
    await apiClient.post(`/announcements/${id}/view`);
  },
};
