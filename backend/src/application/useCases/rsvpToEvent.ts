import { IEventRepository } from '../../domain/interfaces/IEventRepository';
import { IEventRSVPRepository } from '../../domain/interfaces/IEventRSVPRepository';
import { IMemberRepository } from '../../domain/interfaces/IMemberRepository';
import { EventRSVP } from '../../domain/entities/EventRSVP';
import { RSVPStatus } from '../../domain/valueObjects/RSVPStatus';
import { EventNotificationService } from '../services/eventNotificationService';
import { v4 as uuidv4 } from 'uuid';

/**
 * RSVPToEvent Use Case
 *
 * Allows authenticated members to RSVP to events.
 * Handles capacity checking and waitlist assignment.
 * Sends confirmation emails to members.
 */

interface RSVPToEventInput {
  eventId: string;
  memberId: string;
  notes?: string;
}

interface RSVPToEventOutput {
  id: string;
  eventId: string;
  memberId: string;
  status: string;
  isWaitlisted: boolean;
  availableSpots: number;
  message: string;
}

export class RSVPToEvent {
  constructor(
    private eventRepository: IEventRepository,
    private rsvpRepository: IEventRSVPRepository,
    private memberRepository: IMemberRepository,
    private notificationService: EventNotificationService
  ) {}

  /**
   * Execute the RSVP to event use case
   */
  async execute(input: RSVPToEventInput): Promise<RSVPToEventOutput> {
    // Find event
    const event = await this.eventRepository.findById(input.eventId);

    if (!event) {
      throw new Error('Event not found');
    }

    // Check if event is cancelled
    if (event.cancelledAt) {
      throw new Error('Cannot RSVP to a cancelled event');
    }

    // Check if event is deleted
    if (event.deletedAt) {
      throw new Error('Cannot RSVP to a deleted event');
    }

    // Check if event has already started or ended
    const now = new Date();
    if (event.startDate < now) {
      throw new Error('Cannot RSVP to an event that has already started');
    }

    // Check for existing RSVP
    const existingRSVP = await this.rsvpRepository.findByEventAndMember(
      input.eventId,
      input.memberId
    );

    if (existingRSVP && existingRSVP.status !== 'CANCELLED') {
      throw new Error('You have already RSVPed to this event');
    }

    // Get current confirmed RSVP count
    const confirmedCount = await this.rsvpRepository.getConfirmedCount(input.eventId);

    // Determine RSVP status based on capacity
    let status: RSVPStatus;
    let isWaitlisted: boolean;
    let message: string;

    if (!event.maxCapacity) {
      // No capacity limit
      status = RSVPStatus.CONFIRMED;
      isWaitlisted = false;
      message = 'RSVP confirmed successfully';
    } else if (confirmedCount < event.maxCapacity) {
      // Space available
      status = RSVPStatus.CONFIRMED;
      isWaitlisted = false;
      message = 'RSVP confirmed successfully';
    } else {
      // Event is full - add to waitlist
      status = RSVPStatus.WAITLISTED;
      isWaitlisted = true;
      message = 'Event is full. You have been added to the waitlist';
    }

    // Create RSVP entity
    const rsvpEntity = EventRSVP.create({
      id: uuidv4(),
      eventId: input.eventId,
      memberId: input.memberId,
      status,
    });

    // Save RSVP
    const createdRSVP = await this.rsvpRepository.create(rsvpEntity);

    // Calculate available spots
    const availableSpots = event.maxCapacity
      ? Math.max(0, event.maxCapacity - confirmedCount - (status === 'CONFIRMED' ? 1 : 0))
      : -1; // -1 means unlimited

    // Send confirmation email (don't block on email sending)
    this.sendConfirmationEmail(input.memberId, event, status).catch((error) => {
      console.error('Failed to send RSVP confirmation email:', error);
    });

    return {
      id: createdRSVP.id,
      eventId: createdRSVP.eventId,
      memberId: createdRSVP.memberId,
      status: createdRSVP.status,
      isWaitlisted,
      availableSpots,
      message,
    };
  }

  /**
   * Send RSVP confirmation email (async, non-blocking)
   */
  private async sendConfirmationEmail(
    memberId: string,
    event: any,
    status: RSVPStatus
  ): Promise<void> {
    try {
      const member = await this.memberRepository.findById(memberId);
      if (!member) {
        console.error('Member not found for notification:', memberId);
        return;
      }

      await this.notificationService.sendRSVPConfirmation(
        {
          email: member.email,
          firstName: member.firstName,
          lastName: member.lastName,
        },
        {
          id: event.id,
          title: event.title,
          startDate: event.startDate,
          endDate: event.endDate,
          location: event.location,
          category: event.category,
        },
        status === RSVPStatus.CONFIRMED ? 'CONFIRMED' : 'WAITLISTED'
      );
    } catch (error) {
      // Log but don't throw - email failure shouldn't fail the RSVP
      console.error('Error sending RSVP confirmation email:', error);
    }
  }
}
