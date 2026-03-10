/**
 * useNotificationCounts
 *
 * Thin compatibility wrapper over NotificationContext.
 * Retains the same interface so all existing callers continue to work
 * while the real polling + WebSocket logic lives in NotificationContext.
 */
import { useNotifications } from '../contexts/NotificationContext';

export interface NotificationCounts {
  announcements: number;
  messages: number;
  prayerRequests: number;
  total: number;
  /** Imperatively re-fetch counts (e.g. after submitting a prayer request) */
  refresh: () => void;
}

export function useNotificationCounts(): NotificationCounts {
  const { counts, refresh } = useNotifications();
  return { ...counts, refresh };
}
