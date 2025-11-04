import { RSVPStatus } from '../valueObjects/RSVPStatus';

/**
 * EventRSVP Domain Entity
 *
 * Represents a member's RSVP to an event with business rules
 * for status transitions and duplicate prevention.
 */
export class EventRSVP {
  readonly id: string;
  readonly eventId: string;
  readonly memberId: string;
  readonly status: RSVPStatus;
  readonly rsvpedAt: Date;
  readonly updatedAt: Date;

  private constructor(data: {
    id: string;
    eventId: string;
    memberId: string;
    status: RSVPStatus;
    rsvpedAt: Date;
    updatedAt: Date;
  }) {
    this.id = data.id;
    this.eventId = data.eventId;
    this.memberId = data.memberId;
    this.status = data.status;
    this.rsvpedAt = data.rsvpedAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Create a new RSVP with validation
   */
  static create(data: {
    id: string;
    eventId: string;
    memberId: string;
    status: RSVPStatus;
    rsvpedAt?: Date;
    updatedAt?: Date;
  }): EventRSVP {
    // Validate required fields
    this.validateRequiredFields(data);

    // Validate status
    this.validateStatus(data.status);

    return new EventRSVP({
      id: data.id,
      eventId: data.eventId,
      memberId: data.memberId,
      status: data.status,
      rsvpedAt: data.rsvpedAt ?? new Date(),
      updatedAt: data.updatedAt ?? new Date(),
    });
  }

  /**
   * Validate required fields
   */
  private static validateRequiredFields(data: { eventId: string; memberId: string }): void {
    if (!data.eventId || data.eventId.trim() === '') {
      throw new Error('Event ID is required for RSVP');
    }
    if (!data.memberId || data.memberId.trim() === '') {
      throw new Error('Member ID is required for RSVP');
    }
  }

  /**
   * Validate RSVP status
   */
  private static validateStatus(status: RSVPStatus): void {
    const validStatuses: RSVPStatus[] = ['CONFIRMED', 'WAITLISTED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid RSVP status: ${status}`);
    }
  }

  /**
   * Check if RSVP is confirmed
   */
  isConfirmed(): boolean {
    return this.status === 'CONFIRMED';
  }

  /**
   * Check if RSVP is waitlisted
   */
  isWaitlisted(): boolean {
    return this.status === 'WAITLISTED';
  }

  /**
   * Check if RSVP is cancelled
   */
  isCancelled(): boolean {
    return this.status === 'CANCELLED';
  }

  /**
   * Check if RSVP is active (confirmed or waitlisted)
   */
  isActive(): boolean {
    return this.isConfirmed() || this.isWaitlisted();
  }

  /**
   * Create a new RSVP with updated status
   * (used for status transitions)
   */
  withStatus(newStatus: RSVPStatus): EventRSVP {
    // Validate status transition
    this.validateStatusTransition(this.status, newStatus);

    return new EventRSVP({
      id: this.id,
      eventId: this.eventId,
      memberId: this.memberId,
      status: newStatus,
      rsvpedAt: this.rsvpedAt,
      updatedAt: new Date(),
    });
  }

  /**
   * Validate status transitions
   * Business rules for allowed transitions:
   * - CONFIRMED -> WAITLISTED (when capacity changes)
   * - CONFIRMED -> CANCELLED (member cancels)
   * - WAITLISTED -> CONFIRMED (spot opens up)
   * - WAITLISTED -> CANCELLED (member cancels)
   * - CANCELLED -> CONFIRMED (member re-RSVPs with capacity)
   * - CANCELLED -> WAITLISTED (member re-RSVPs without capacity)
   */
  private validateStatusTransition(from: RSVPStatus, to: RSVPStatus): void {
    if (from === to) {
      throw new Error('RSVP is already in the requested status');
    }

    // All transitions are allowed except:
    // - You cannot transition FROM cancelled TO cancelled (redundant)
    // This is already handled by the "from === to" check above
  }

  /**
   * Convert to plain object for persistence/serialization
   */
  toObject(): {
    id: string;
    eventId: string;
    memberId: string;
    status: RSVPStatus;
    rsvpedAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.id,
      eventId: this.eventId,
      memberId: this.memberId,
      status: this.status,
      rsvpedAt: this.rsvpedAt,
      updatedAt: this.updatedAt,
    };
  }
}
