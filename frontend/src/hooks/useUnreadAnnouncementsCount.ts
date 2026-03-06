import { useState, useEffect } from 'react';
import { announcementService } from '../services/endpoints/announcementService';
import { useAuth } from './useAuth';

/**
 * Lightweight hook that fetches the total active announcement count.
 *
 * Uses page=1, limit=1 so only a tiny response comes back — we only
 * need `pagination.total`. Automatically re-fetches every 5 minutes
 * and whenever the user re-authenticates.
 *
 * Returns 0 on error (bell still renders without a badge).
 */
export function useUnreadAnnouncementsCount(): number {
  const { isAuthenticated } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      setCount(0);
      return;
    }

    let cancelled = false;

    const fetch = async () => {
      try {
        const response = await announcementService.getAnnouncements(false, 1, 1);
        if (!cancelled) {
          setCount(response.pagination.total);
        }
      } catch {
        // Silent — the bell renders without a badge rather than breaking the layout
      }
    };

    fetch();

    // Refresh every 5 minutes while the page is open
    const interval = setInterval(fetch, 5 * 60 * 1000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  return count;
}
