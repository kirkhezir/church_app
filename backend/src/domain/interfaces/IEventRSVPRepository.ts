import { event_rsvps as PrismaEventRSVP } from '@prisma/client';

/**
 * EventRSVP Repository Interface
 * Defines methods for persisting and retrieving EventRSVPs
 */
export interface IEventRSVPRepository {
  /**
   * Find RSVP by ID
   */
  findById(id: string): Promise<PrismaEventRSVP | null>;

  /**
   * Find RSVP by event and member
   */
  findByEventAndMember(eventId: string, memberId: string): Promise<PrismaEventRSVP | null>;

  /**
   * Find all RSVPs for an event
   */
  findByEventId(eventId: string): Promise<PrismaEventRSVP[]>;

  /**
   * Find all RSVPs for a member
   */
  findByMemberId(memberId: string): Promise<PrismaEventRSVP[]>;

  /**
   * Get count of confirmed RSVPs for an event
   */
  getConfirmedCount(eventId: string): Promise<number>;

  /**
   * Create new RSVP
   */
  create(data: {
    id: string;
    eventId: string;
    memberId: string;
    status: 'CONFIRMED' | 'WAITLISTED' | 'CANCELLED';
  }): Promise<PrismaEventRSVP>;

  /**
   * Update RSVP status
   */
  updateStatus(
    id: string,
    status: 'CONFIRMED' | 'WAITLISTED' | 'CANCELLED'
  ): Promise<PrismaEventRSVP>;

  /**
   * Delete RSVP
   */
  delete(id: string): Promise<void>;

  /**
   * Delete RSVP by event and member
   */
  deleteByEventAndMember(eventId: string, memberId: string): Promise<void>;
}
