import apiClient from '../api/apiClient';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'URGENT' | 'NORMAL';
  publishedAt: string;
  archivedAt: string | null;
  isDraft: boolean;
  createdAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  _count?: {
    views: number;
  };
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  priority?: 'URGENT' | 'NORMAL';
  isDraft?: boolean;
}

export interface UpdateAnnouncementRequest {
  title?: string;
  content?: string;
  priority?: 'URGENT' | 'NORMAL';
  isDraft?: boolean;
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

export interface AnnouncementFilters {
  archived?: boolean;
  page?: number;
  limit?: number;
  search?: string;
  priority?: 'URGENT' | 'NORMAL';
  authorId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'date' | 'priority' | 'views';
  sortOrder?: 'asc' | 'desc';
  includeDrafts?: boolean;
}

export interface Author {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface ViewAnalytics {
  totalViews: number;
  firstViewed: string | null;
  lastViewed: string | null;
  recentViews: Array<{
    id: string;
    viewedAt: string;
    member: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }>;
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
    limit: number = 10,
    filters?: Omit<AnnouncementFilters, 'archived' | 'page' | 'limit'>
  ): Promise<AnnouncementsListResponse> {
    const params: any = { archived, page, limit, ...filters };
    const response = await apiClient.get<AnnouncementsListResponse>('/announcements', {
      params,
    });
    return response;
  },

  /**
   * Get announcement by ID
   */
  async getAnnouncementById(id: string): Promise<Announcement> {
    const response = await apiClient.get<Announcement>(`/announcements/${id}`);
    return response; // apiClient.get already unwraps response.data
  },

  /**
   * Create new announcement (admin/staff only)
   */
  async createAnnouncement(data: CreateAnnouncementRequest): Promise<Announcement> {
    const response = await apiClient.post<Announcement>('/announcements', data);
    return response;
  },

  /**
   * Update announcement (admin/staff only)
   */
  async updateAnnouncement(id: string, data: UpdateAnnouncementRequest): Promise<Announcement> {
    const response = await apiClient.put<Announcement>(`/announcements/${id}`, data);
    return response;
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

  /**
   * Unarchive (restore) announcement (admin/staff only)
   */
  async unarchiveAnnouncement(id: string): Promise<void> {
    await apiClient.post(`/announcements/${id}/unarchive`);
  },

  /**
   * Bulk archive announcements (admin/staff only)
   */
  async bulkArchive(ids: string[]): Promise<{ message: string; count: number }> {
    const response = await apiClient.post<{ message: string; count: number }>(
      '/announcements/bulk-archive',
      { ids }
    );
    return response;
  },

  /**
   * Bulk delete announcements (admin/staff only)
   */
  async bulkDelete(ids: string[]): Promise<{ message: string; count: number }> {
    const response = await apiClient.post<{ message: string; count: number }>(
      '/announcements/bulk-delete',
      { ids }
    );
    return response;
  },

  /**
   * Get list of announcement authors
   */
  async getAuthors(): Promise<Author[]> {
    const response = await apiClient.get<Author[]>('/announcements/authors');
    return response;
  },

  /**
   * Get announcement view analytics (admin/staff only)
   */
  async getAnalytics(id: string): Promise<ViewAnalytics> {
    const response = await apiClient.get<ViewAnalytics>(`/announcements/${id}/analytics`);
    return response;
  },
};
