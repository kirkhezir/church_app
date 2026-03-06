import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '../services/api/apiClient';
import { useAuth } from './useAuth';

export interface NotificationCounts {
  announcements: number;
  messages: number;
  prayerRequests: number; // non-zero only for admin/staff
  total: number;
  /** Imperatively re-fetch counts (e.g. after submitting a prayer request) */
  refresh: () => void;
}

const EMPTY_COUNTS = { announcements: 0, messages: 0, prayerRequests: 0, total: 0 };

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
 * Refreshes every 60 seconds and whenever the user re-authenticates.
 * Exposes a `refresh()` method for immediate re-fetch (e.g. after submission).
 * All errors are suppressed — the bell never breaks the layout.
 */
export function useNotificationCounts(): NotificationCounts {
  const { isAuthenticated } = useAuth();
  const [counts, setCounts] = useState(EMPTY_COUNTS);
  // Use a ref so the interval callback always calls the latest fetchCounts
  const fetchRef = useRef<() => void>(() => undefined);

  const fetchCounts = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await apiClient.get<NotificationCountsResponse>('/members/notification-counts');
      const announcements = data.unreadAnnouncements ?? 0;
      const messages = data.unreadMessages ?? 0;
      const prayerRequests = data.pendingPrayer ?? 0;
      setCounts({
        announcements,
        messages,
        prayerRequests,
        total: announcements + messages + prayerRequests,
      });
    } catch {
      // Silent — leave counts unchanged rather than breaking the layout
    }
  }, [isAuthenticated]);

  // Keep the ref in sync so the interval always has the latest version
  fetchRef.current = fetchCounts;

  useEffect(() => {
    if (!isAuthenticated) {
      setCounts(EMPTY_COUNTS);
      return;
    }

    fetchCounts();
    const interval = setInterval(() => fetchRef.current(), 60 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchCounts]);

  const refresh = useCallback(() => fetchRef.current(), []);

  return { ...counts, refresh };
}
