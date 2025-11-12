import { useState, useEffect } from 'react';
import { announcementService, Announcement } from '../services/endpoints/announcementService';

export interface AnnouncementFilters {
  search?: string;
  priority?: 'URGENT' | 'NORMAL';
  authorId?: string;
  sortBy?: 'date' | 'priority' | 'views';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Custom hook for fetching announcements list
 */
export function useAnnouncements(
  archived: boolean = false,
  page: number = 1,
  limit: number = 10,
  refreshTrigger: number = 0,
  filters?: AnnouncementFilters
) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await announcementService.getAnnouncements(archived, page, limit, filters);
        setAnnouncements(response.data);
        setPagination(response.pagination);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load announcements');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
    // Serialize filters to avoid unnecessary re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [archived, page, limit, refreshTrigger, JSON.stringify(filters)]);

  return { announcements, pagination, loading, error };
}

/**
 * Custom hook for fetching single announcement
 */
export function useAnnouncement(id: string | undefined) {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchAnnouncement = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await announcementService.getAnnouncementById(id);
        setAnnouncement(data);

        // Track view
        announcementService.trackView(id).catch(() => {
          // Silently fail - tracking is not critical
        });
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load announcement');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncement();
  }, [id]);

  return { announcement, loading, error };
}
