/**
 * NotificationContext
 *
 * Central hub for all in-app notifications:
 * - Real-time items via WebSocket (message:new, announcement:new/urgent,
 *   event:update, prayer:approved, prayer:pending)
 * - DB-synced counts via polling every 30 s (fallback / accuracy layer)
 * - gooeyToast banners for every new event
 * - In-memory notification list (session-scoped, up to 50 items)
 *
 * Usage:
 *   const { items, counts, unreadCount, markRead, markAllRead, refresh } = useNotifications();
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { websocketClient } from '../services/websocket/websocketClient';
import { apiClient } from '../services/api/apiClient';
import { useAuth } from '../hooks/useAuth';
import { gooeyToast } from 'goey-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationType =
  | 'message'
  | 'announcement'
  | 'announcement_urgent'
  | 'prayer_approved'
  | 'prayer_pending'
  | 'event_update';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  href: string;
  read: boolean;
  createdAt: Date;
}

export interface NotificationCounts {
  announcements: number;
  messages: number;
  prayerRequests: number;
  total: number;
}

export interface NotificationContextValue {
  /** Real-time notification items (session only, last 50) */
  items: NotificationItem[];
  /** DB-polled unread counts per category */
  counts: NotificationCounts;
  /** Number of unread items in the in-memory list */
  unreadCount: number;
  /** Mark a single item as read */
  markRead: (id: string) => void;
  /** Mark all items as read and reset counts */
  markAllRead: () => void;
  /** Force an immediate re-fetch of DB counts */
  refresh: () => void;
}

const EMPTY_COUNTS: NotificationCounts = {
  announcements: 0,
  messages: 0,
  prayerRequests: 0,
  total: 0,
};

// ─── Context ─────────────────────────────────────────────────────────────────

const NotificationContext = createContext<NotificationContextValue>({
  items: [],
  counts: EMPTY_COUNTS,
  unreadCount: 0,
  markRead: () => {},
  markAllRead: () => {},
  refresh: () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────

interface NotificationCountsResponse {
  unreadAnnouncements: number;
  unreadMessages: number;
  pendingPrayer: number;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [counts, setCounts] = useState<NotificationCounts>(EMPTY_COUNTS);
  const fetchRef = useRef<() => void>(() => {});

  // ── Helpers ────────────────────────────────────────────────────────────────

  const addItem = useCallback(
    (item: Omit<NotificationItem, 'id' | 'read' | 'createdAt'> & { idSuffix: string }) => {
      const newItem: NotificationItem = {
        id: `${item.idSuffix}-${Date.now()}`,
        type: item.type,
        title: item.title,
        body: item.body,
        href: item.href,
        read: false,
        createdAt: new Date(),
      };
      setItems((prev) => [newItem, ...prev].slice(0, 50));
      return newItem;
    },
    []
  );

  const truncate = (text: string, max = 80) =>
    text.length > max ? `${text.slice(0, max)}…` : text;

  // ── DB count polling ───────────────────────────────────────────────────────

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
      // silent — never break the layout
    }
  }, [isAuthenticated]);

  fetchRef.current = fetchCounts;

  useEffect(() => {
    if (!isAuthenticated) {
      setCounts(EMPTY_COUNTS);
      setItems([]);
      websocketClient.disconnect();
      return;
    }

    fetchCounts();
    const interval = setInterval(() => fetchRef.current(), 30_000);

    // Connect WebSocket
    const token = localStorage.getItem('accessToken');
    if (token) websocketClient.connect(token);

    return () => {
      clearInterval(interval);
    };
  }, [isAuthenticated, fetchCounts]);

  // ── WebSocket event listeners ──────────────────────────────────────────────

  useEffect(() => {
    if (!isAuthenticated) return;

    // ── message:new ─────────────────────────────────────────────────────────
    websocketClient.onNewMessage((msg) => {
      addItem({
        type: 'message',
        title: `New message from ${msg.senderName}`,
        body: truncate(msg.content, 70),
        href: '/app/messages',
        idSuffix: `msg-${msg.id}`,
      });
      setCounts((prev) => ({
        ...prev,
        messages: prev.messages + 1,
        total: prev.total + 1,
      }));
      gooeyToast.info(`Message from ${msg.senderName}`, {
        description: truncate(msg.content, 70),
        action: {
          label: 'View',
          onClick: () => {
            window.location.href = '/app/messages';
          },
        },
      });
    });

    // ── announcement:new ────────────────────────────────────────────────────
    websocketClient.onNewAnnouncement((ann) => {
      addItem({
        type: 'announcement',
        title: ann.title,
        body: truncate(ann.content, 80),
        href: '/app/announcements',
        idSuffix: `ann-${ann.id}`,
      });
      setCounts((prev) => ({
        ...prev,
        announcements: prev.announcements + 1,
        total: prev.total + 1,
      }));
      gooeyToast.info(ann.title, {
        description: truncate(ann.content, 80),
        action: {
          label: 'Read',
          onClick: () => {
            window.location.href = '/app/announcements';
          },
        },
      });
    });

    // ── announcement:urgent ─────────────────────────────────────────────────
    websocketClient.onUrgentAnnouncement((ann) => {
      addItem({
        type: 'announcement_urgent',
        title: ann.title,
        body: truncate(ann.content, 80),
        href: '/app/announcements',
        idSuffix: `ann-urgent-${ann.id}`,
      });
      gooeyToast.warning(`Urgent: ${ann.title}`, {
        description: truncate(ann.content, 80),
        action: {
          label: 'Read Now',
          onClick: () => {
            window.location.href = '/app/announcements';
          },
        },
      });
    });

    // ── event:update ────────────────────────────────────────────────────────
    websocketClient.onEventUpdate((update) => {
      const label =
        update.type === 'cancelled'
          ? 'Event cancelled'
          : update.type === 'created'
            ? 'New event added'
            : 'Event updated';
      const when = new Date(update.event.startDateTime).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      addItem({
        type: 'event_update',
        title: `${label}: ${update.event.title}`,
        body: when,
        href: '/app/events',
        idSuffix: `event-${update.event.id}-${update.type}`,
      });
      gooeyToast.info(`${label}: ${update.event.title}`, {
        description: when,
        action: {
          label: 'View Events',
          onClick: () => {
            window.location.href = '/app/events';
          },
        },
      });
    });

    // ── prayer:approved ─────────────────────────────────────────────────────
    websocketClient.onPrayerApproved((prayer) => {
      addItem({
        type: 'prayer_approved',
        title: 'New prayer request on the wall',
        body: truncate(prayer.request, 80),
        href: '/app/prayer',
        idSuffix: `prayer-approved-${prayer.id}`,
      });
      gooeyToast.info('New Prayer Request', {
        description: 'A new prayer has been added to the community wall.',
        action: {
          label: 'Pray Now',
          onClick: () => {
            window.location.href = '/app/prayer';
          },
        },
      });
    });

    // ── prayer:pending (admin/staff only — WS server filters by role room) ──
    websocketClient.onPrayerPending((prayer) => {
      addItem({
        type: 'prayer_pending',
        title: 'Prayer request needs review',
        body: `From ${prayer.name} · ${prayer.category}`,
        href: '/app/admin/prayer',
        idSuffix: `prayer-pending-${prayer.id}`,
      });
      setCounts((prev) => ({
        ...prev,
        prayerRequests: prev.prayerRequests + 1,
        total: prev.total + 1,
      }));
      gooeyToast.info('New Prayer Request', {
        description: `From ${prayer.name} — awaiting review`,
        action: {
          label: 'Review',
          onClick: () => {
            window.location.href = '/app/admin/prayer';
          },
        },
      });
    });

    return () => {
      websocketClient.offMessageEvents();
      websocketClient.offAnnouncementEvents();
      websocketClient.offEventUpdateEvents();
      websocketClient.offPrayerEvents();
    };
  }, [isAuthenticated, addItem]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const markRead = useCallback((id: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
  }, []);

  const markAllRead = useCallback(() => {
    setItems((prev) => prev.map((item) => ({ ...item, read: true })));
    // Trigger a fresh count poll so badge reduces
    setTimeout(() => fetchRef.current(), 300);
  }, []);

  const refresh = useCallback(() => fetchRef.current(), []);

  const unreadCount = items.filter((item) => !item.read).length;

  return (
    <NotificationContext.Provider
      value={{ items, counts, unreadCount, markRead, markAllRead, refresh }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useNotifications(): NotificationContextValue {
  return useContext(NotificationContext);
}
