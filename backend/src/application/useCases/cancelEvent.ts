import { IEventRepository } from '../../domain/interfaces/IEventRepository';
import { IEventRSVPRepository } from '../../domain/interfaces/IEventRSVPRepository';
import { IMemberRepository } from '../../domain/interfaces/IMemberRepository';
import { EventNotificationService } from '../services/eventNotificationService';

/**
 * CancelEvent Use Case
 *
 * Allows administrators and staff to cancel events.
 * Marks the event as cancelled and notifies all attendees via email.
 */

interface CancelEventInput {
  eventId: string;
  cancelledById: string;
  reason?: string;
}

interface CancelEventOutput {
  id: string;
  title: string;
  cancelledAt: Date;
  message: string;
}

export class CancelEvent {
  constructor(
    private eventRepository: IEventRepository,
    private rsvpRepository: IEventRSVPRepository,
    private memberRepository: IMemberRepository,
    private notificationService: EventNotificationService
  ) {}

  /**
   * Execute the cancel event use case
   */
  async execute(input: CancelEventInput): Promise<CancelEventOutput> {
    // Find event
    const event = await this.eventRepository.findById(input.eventId);

    if (!event) {
      throw new Error('Event not found');
    }

    // Check if already cancelled
    if (event.cancelledAt) {
      throw new Error('Event is already cancelled');
    }

    // Check if already deleted
    if (event.deletedAt) {
      throw new Error('Cannot cancel a deleted event');
    }

    // Get all RSVPs for notification purposes
    const rsvps = await this.rsvpRepository.findByEventId(input.eventId);
    const attendeeCount = rsvps.filter(
      (rsvp) => rsvp.status === 'CONFIRMED' || rsvp.status === 'WAITLISTED'
    ).length;

    // Cancel the event using repository's cancel method
    await this.eventRepository.cancel(input.eventId);

    // Fetch the cancelled event to get updated data
    const cancelledEvent = await this.eventRepository.findById(input.eventId);

    if (!cancelledEvent) {
      throw new Error('Failed to fetch cancelled event');
    }

    // Send cancellation notifications to all attendees (non-blocking)
    if (attendeeCount > 0) {
      this.sendCancellationNotifications(rsvps, cancelledEvent, input.reason).catch((error) => {
        console.error('Failed to send event cancellation notifications:', error);
      });
    }

    return {
      id: cancelledEvent.id,
      title: cancelledEvent.title,
      cancelledAt: cancelledEvent.cancelledAt!,
      message: `Event cancelled successfully. ${attendeeCount} attendees will be notified.`,
    };
  }

  /**
   * Send cancellation notifications to all attendees (async, non-blocking)
   */
  private async sendCancellationNotifications(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rsvps: any[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    event: any,
    reason?: string
  ): Promise<void> {
    try {
      // Get member IDs who have active RSVPs (confirmed or waitlisted)
      const activeMemberIds = rsvps
        .filter((rsvp) => rsvp.status === 'CONFIRMED' || rsvp.status === 'WAITLISTED')
        .map((rsvp) => rsvp.memberId);

      if (activeMemberIds.length === 0) {
        return;
      }

      // Fetch all members
      const members = await Promise.all(
        activeMemberIds.map((id) => this.memberRepository.findById(id))
      );

      // Filter out null values and map to notification format
      const memberDetails = members
        .filter((member) => member !== null)
        .map((member) => ({
          email: member.email,
          firstName: member.firstName,
          lastName: member.lastName,
        }));

      // Send notifications
      await this.notificationService.sendEventCancellationNotification(
        memberDetails,
        {
          id: event.id,
          title: event.title,
          startDate: event.startDate,
          endDate: event.endDate,
          location: event.location,
          category: event.category,
        },
        reason
      );
    } catch (error) {
      console.error('Error sending event cancellation notifications:', error);
    }
  }
}
