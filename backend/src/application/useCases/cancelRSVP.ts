import { IEventRepository } from '../../domain/interfaces/IEventRepository';
import { IEventRSVPRepository } from '../../domain/interfaces/IEventRSVPRepository';

/**
 * CancelRSVP Use Case
 *
 * Allows members to cancel their RSVP to an event.
 * Can promote waitlisted attendees if capacity becomes available.
 */

interface CancelRSVPInput {
  eventId: string;
  memberId: string;
}

interface CancelRSVPOutput {
  success: boolean;
  message: string;
  waitlistPromoted?: boolean;
}

export class CancelRSVP {
  constructor(
    private eventRepository: IEventRepository,
    private rsvpRepository: IEventRSVPRepository
  ) {}

  /**
   * Execute the cancel RSVP use case
   */
  async execute(input: CancelRSVPInput): Promise<CancelRSVPOutput> {
    // Find event
    const event = await this.eventRepository.findById(input.eventId);

    if (!event) {
      throw new Error('Event not found');
    }

    // Check if event has already started
    const now = new Date();
    if (event.startDate < now) {
      throw new Error('Cannot cancel RSVP for an event that has already started');
    }

    // Find existing RSVP
    const existingRSVP = await this.rsvpRepository.findByEventAndMember(
      input.eventId,
      input.memberId
    );

    if (!existingRSVP) {
      throw new Error('RSVP not found');
    }

    // Check if already cancelled
    if (existingRSVP.status === 'CANCELLED') {
      throw new Error('RSVP is already cancelled');
    }

    const wasConfirmed = existingRSVP.status === 'CONFIRMED';

    // Delete the RSVP
    await this.rsvpRepository.deleteByEventAndMember(input.eventId, input.memberId);

    let waitlistPromoted = false;

    // If the cancelled RSVP was confirmed and event has capacity limits,
    // check if we can promote someone from waitlist
    if (wasConfirmed && event.maxCapacity) {
      const allRSVPs = await this.rsvpRepository.findByEventId(input.eventId);

      // Find first waitlisted RSVP (by rsvp date)
      const waitlistedRSVP = allRSVPs
        .filter((rsvp) => rsvp.status === 'WAITLISTED')
        .sort((a, b) => a.rsvpedAt.getTime() - b.rsvpedAt.getTime())[0];

      if (waitlistedRSVP) {
        // Promote from waitlist to confirmed
        await this.rsvpRepository.updateStatus(waitlistedRSVP.id, 'CONFIRMED');
        waitlistPromoted = true;

        // TODO: Send notification to promoted member
        console.log(
          `Member ${waitlistedRSVP.memberId} promoted from waitlist for event ${event.title}`
        );
      }
    }

    return {
      success: true,
      message: waitlistPromoted
        ? 'RSVP cancelled successfully. A waitlisted attendee has been promoted.'
        : 'RSVP cancelled successfully',
      waitlistPromoted,
    };
  }
}
