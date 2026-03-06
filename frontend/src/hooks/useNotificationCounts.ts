import { useState, useEffect } from 'react';
import { apiClient } from '../services/api/apiClient';
import { useAuth } from './useAuth';

export interface NotificationCounts {
  announcements: number;
  messages: number;
  prayerRequests: number; // non-zero only for admin/staff
  total: number;
}

const EMPTY: NotificationCounts = { announcements: 0, messages: 0, prayerRequests: 0, total: 0 };

interface NotificationCountsResponse {
  unreadAnnouncements: number;
  unreadMessages: number;
  pendingPrayer: number;
}

/**
 * Polls /members/notification-counts for real per-member unread counts.
 *
 * - announcements : active announcements the member has NOT viewed
 * - messages      : unread inbox messages
 * - prayerRequests: pending prayer requests awaiting moderation (admin/staff only)
 *
 * Refreshes every 5 minutes and whenever the user re-authenticates.
 * All errors are suppressed — the bell never breaks the layout.
 */
export function useNotificationCounts(): NotificationCounts {
  const { isAuthenticated } = useAuth();
  const [counts, setCounts] = useState<NotificationCounts>(EMPTY);

  useEffect(() => {
    if (!isAuthenticated) {
      setCounts(EMPTY);
      return;
    }

    let cancelled = false;

    const fetchCounts = async () => {
      try {
        const data = await apiClient.get<NotificationCountsResponse>(
          '/members/notification-counts'
        );
        if (!cancelled) {
          const announcements = data.unreadAnnouncements ?? 0;
          const messages = data.unreadMessages ?? 0;
          const prayerRequests = data.pendingPrayer ?? 0;
          setCounts({
            announcements,
            messages,
            prayerRequests,
            total: announcements + messages + prayerRequests,
          });
        }
      } catch {
        // Silent — leave counts unchanged rather than breaking the layout
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 5 * 60 * 1000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  return counts;
}
