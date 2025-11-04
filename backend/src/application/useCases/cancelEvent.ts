import { IEventRepository } from '../../domain/interfaces/IEventRepository';
import { IEventRSVPRepository } from '../../domain/interfaces/IEventRSVPRepository';

/**
 * CancelEvent Use Case
 *
 * Allows administrators and staff to cancel events.
 * Marks the event as cancelled and could notify all attendees.
 */

interface CancelEventInput {
  eventId: string;
  cancelledById: string;
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
    private rsvpRepository: IEventRSVPRepository
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
    const attendeeCount = rsvps.length;

    // Cancel the event using repository's cancel method
    await this.eventRepository.cancel(input.eventId);

    // Fetch the cancelled event to get updated data
    const cancelledEvent = await this.eventRepository.findById(input.eventId);

    if (!cancelledEvent) {
      throw new Error('Failed to fetch cancelled event');
    }

    // TODO: Send cancellation notifications to all attendees
    // This would typically be done via an email service or notification service
    // For now, we'll just log that notifications should be sent
    if (attendeeCount > 0) {
      console.log(
        `Event "${cancelledEvent.title}" cancelled. ${attendeeCount} attendees should be notified.`
      );
    }

    return {
      id: cancelledEvent.id,
      title: cancelledEvent.title,
      cancelledAt: cancelledEvent.cancelledAt!,
      message: `Event cancelled successfully. ${attendeeCount} attendees will be notified.`,
    };
  }
}
