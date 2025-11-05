/**
 * Event Service
 *
 * Handles all event-related API calls:
 * - Event listing with filters
 * - Event details
 * - Event creation/update/cancellation (admin/staff)
 * - RSVP management
 * - RSVP list viewing (admin/staff)
 */

import apiClient from '../api/apiClient';
import { Event, EventCategory, EventRSVP } from '../../types/api';

// ============================================================================
// REQUEST TYPES
// ============================================================================

interface GetEventsParams {
  category?: EventCategory;
  startDate?: string;
  endDate?: string;
}

interface CreateEventInput {
  title: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  location: string;
  category: EventCategory;
  maxCapacity?: number;
  imageUrl?: string;
}

interface UpdateEventInput {
  title?: string;
  description?: string;
  startDateTime?: string;
  endDateTime?: string;
  location?: string;
  category?: EventCategory;
  maxCapacity?: number;
  imageUrl?: string;
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

interface EventListResponse {
  success: boolean;
  data: Event[];
}

interface EventDetailResponse {
  success: boolean;
  data: Event;
}

interface CreateEventResponse {
  success: boolean;
  data: Event;
}

interface UpdateEventResponse {
  success: boolean;
  data: Event;
}

interface CancelEventResponse {
  success: boolean;
  data: {
    id: string;
    title: string;
    cancelledAt: string;
    message: string;
  };
}

interface RSVPResponse {
  success: boolean;
  data: {
    id: string;
    eventId: string;
    memberId: string;
    status: string;
    message: string;
    isWaitlisted: boolean;
    availableSpots: number;
  };
}

interface CancelRSVPResponse {
  success: boolean;
  data: {
    message: string;
    success: boolean;
    waitlistPromoted: boolean;
  };
}

interface EventRSVPsResponse {
  success: boolean;
  data: {
    eventId: string;
    eventTitle: string;
    totalRSVPs: number;
    confirmedCount: number;
    waitlistedCount: number;
    cancelledCount: number;
    maxCapacity: number | null;
    availableSpots: number;
    rsvps: EventRSVP[];
  };
}

// ============================================================================
// EVENT SERVICE
// ============================================================================

export const eventService = {
  /**
   * Get list of events with optional filters
   * Public endpoint - no authentication required
   */
  async getEvents(params?: GetEventsParams): Promise<Event[]> {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const queryString = queryParams.toString();
    const url = `/events${queryString ? `?${queryString}` : ''}`;

    const response = (await apiClient.get(url)) as EventListResponse;
    return response.data;
  },

  /**
   * Get event details by ID
   * Public endpoint - no authentication required
   */
  async getEventById(eventId: string): Promise<Event> {
    const response = (await apiClient.get(`/events/${eventId}`)) as EventDetailResponse;
    return response.data;
  },

  /**
   * Create new event
   * Requires: ADMIN or STAFF role
   */
  async createEvent(input: CreateEventInput): Promise<Event> {
    const response = (await apiClient.post('/events', input)) as CreateEventResponse;
    return response.data;
  },

  /**
   * Update event
   * Requires: ADMIN or STAFF role
   */
  async updateEvent(eventId: string, input: UpdateEventInput): Promise<Event> {
    const response = (await apiClient.patch(`/events/${eventId}`, input)) as UpdateEventResponse;
    return response.data;
  },

  /**
   * Cancel event (soft delete)
   * Requires: ADMIN or STAFF role
   */
  async cancelEvent(
    eventId: string
  ): Promise<{ id: string; title: string; cancelledAt: string; message: string }> {
    const response = (await apiClient.delete(`/events/${eventId}`)) as CancelEventResponse;
    return response.data;
  },

  /**
   * RSVP to an event
   * Requires: Authentication (any member)
   */
  async rsvpToEvent(eventId: string): Promise<{
    id: string;
    eventId: string;
    memberId: string;
    status: string;
    message: string;
    isWaitlisted: boolean;
    availableSpots: number;
  }> {
    const response = (await apiClient.post(`/events/${eventId}/rsvp`)) as RSVPResponse;
    return response.data;
  },

  /**
   * Cancel RSVP
   * Requires: Authentication (any member)
   */
  async cancelRSVP(
    eventId: string
  ): Promise<{ message: string; success: boolean; waitlistPromoted: boolean }> {
    const response = (await apiClient.delete(`/events/${eventId}/rsvp`)) as CancelRSVPResponse;
    return response.data;
  },

  /**
   * Get list of RSVPs for an event
   * Requires: ADMIN or STAFF role
   */
  async getEventRSVPs(
    eventId: string,
    status?: 'CONFIRMED' | 'WAITLISTED' | 'CANCELLED'
  ): Promise<{
    eventId: string;
    eventTitle: string;
    totalRSVPs: number;
    confirmedCount: number;
    waitlistedCount: number;
    cancelledCount: number;
    maxCapacity: number | null;
    availableSpots: number;
    rsvps: EventRSVP[];
  }> {
    const queryString = status ? `?status=${status}` : '';
    const response = (await apiClient.get(
      `/events/${eventId}/rsvps${queryString}`
    )) as EventRSVPsResponse;
    return response.data;
  },
};
