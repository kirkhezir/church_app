/**
 * useEvents Hook
 *
 * Custom hook for managing event data fetching and state
 * Handles loading, error states, and data caching
 */

import { useState, useEffect, useCallback } from 'react';
import { eventService } from '../services/endpoints/eventService';
import { Event, EventCategory } from '../types/api';

interface UseEventsOptions {
  category?: EventCategory;
  startDate?: string;
  endDate?: string;
  autoFetch?: boolean; // Whether to fetch on mount
}

interface UseEventsReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching and managing events list
 */
export function useEvents(options: UseEventsOptions = {}): UseEventsReturn {
  const { category, startDate, endDate, autoFetch = true } = options;

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await eventService.getEvents({
        category,
        startDate,
        endDate,
      });

      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  }, [category, startDate, endDate]);

  useEffect(() => {
    if (autoFetch) {
      fetchEvents();
    }
  }, [autoFetch, fetchEvents]);

  return {
    events,
    loading,
    error,
    refetch: fetchEvents,
  };
}

interface UseEventDetailOptions {
  eventId: string;
  autoFetch?: boolean;
}

interface UseEventDetailReturn {
  event: Event | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching single event details
 */
export function useEventDetail(options: UseEventDetailOptions): UseEventDetailReturn {
  const { eventId, autoFetch = true } = options;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = useCallback(async () => {
    if (!eventId) return;

    try {
      setLoading(true);
      setError(null);

      const data = await eventService.getEventById(eventId);
      setEvent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch event');
      console.error('Error fetching event:', err);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (autoFetch) {
      fetchEvent();
    }
  }, [autoFetch, fetchEvent]);

  return {
    event,
    loading,
    error,
    refetch: fetchEvent,
  };
}

interface UseEventRSVPReturn {
  rsvping: boolean;
  rsvpError: string | null;
  rsvpToEvent: (eventId: string) => Promise<void>;
  cancelRSVP: (eventId: string) => Promise<void>;
}

/**
 * Hook for managing RSVP actions
 */
export function useEventRSVP(onSuccess?: () => void): UseEventRSVPReturn {
  const [rsvping, setRsvping] = useState<boolean>(false);
  const [rsvpError, setRsvpError] = useState<string | null>(null);

  const rsvpToEvent = useCallback(
    async (eventId: string) => {
      try {
        setRsvping(true);
        setRsvpError(null);

        await eventService.rsvpToEvent(eventId);

        if (onSuccess) {
          onSuccess();
        }
      } catch (err) {
        setRsvpError(err instanceof Error ? err.message : 'Failed to RSVP');
        console.error('Error RSVPing to event:', err);
        throw err;
      } finally {
        setRsvping(false);
      }
    },
    [onSuccess]
  );

  const cancelRSVP = useCallback(
    async (eventId: string) => {
      try {
        setRsvping(true);
        setRsvpError(null);

        await eventService.cancelRSVP(eventId);

        if (onSuccess) {
          onSuccess();
        }
      } catch (err) {
        setRsvpError(err instanceof Error ? err.message : 'Failed to cancel RSVP');
        console.error('Error canceling RSVP:', err);
        throw err;
      } finally {
        setRsvping(false);
      }
    },
    [onSuccess]
  );

  return {
    rsvping,
    rsvpError,
    rsvpToEvent,
    cancelRSVP,
  };
}
