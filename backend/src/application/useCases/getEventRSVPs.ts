import { IEventRepository } from '../../domain/interfaces/IEventRepository';
import { IEventRSVPRepository } from '../../domain/interfaces/IEventRSVPRepository';

/**
 * GetEventRSVPs Use Case
 *
 * Retrieves all RSVPs for a specific event.
 * Typically used by administrators and staff to view attendee lists.
 */

interface GetEventRSVPsInput {
  eventId: string;
  status?: 'CONFIRMED' | 'WAITLISTED' | 'CANCELLED'; // Optional filter
}

interface RSVPSummary {
  id: string;
  memberId: string;
  memberName?: string;
  memberEmail?: string;
  status: string;
  notes?: string;
  rsvpedAt: Date;
}

interface GetEventRSVPsOutput {
  eventId: string;
  eventTitle: string;
  totalRSVPs: number;
  confirmedCount: number;
  waitlistedCount: number;
  cancelledCount: number;
  maxCapacity: number | null;
  availableSpots: number;
  rsvps: RSVPSummary[];
}

export class GetEventRSVPs {
  constructor(
    private eventRepository: IEventRepository,
    private rsvpRepository: IEventRSVPRepository
  ) {}

  /**
   * Execute the get event RSVPs use case
   */
  async execute(input: GetEventRSVPsInput): Promise<GetEventRSVPsOutput> {
    // Find event
    const event = await this.eventRepository.findById(input.eventId);

    if (!event) {
      throw new Error('Event not found');
    }

    // Get all RSVPs for the event
    const allRSVPs = await this.rsvpRepository.findByEventId(input.eventId);

    // Apply status filter if provided
    let filteredRSVPs = allRSVPs;
    if (input.status) {
      filteredRSVPs = allRSVPs.filter((rsvp) => rsvp.status === input.status);
    }

    // Calculate counts
    const confirmedCount = allRSVPs.filter((rsvp) => rsvp.status === 'CONFIRMED').length;
    const waitlistedCount = allRSVPs.filter((rsvp) => rsvp.status === 'WAITLISTED').length;
    const cancelledCount = allRSVPs.filter((rsvp) => rsvp.status === 'CANCELLED').length;

    // Calculate available spots
    const availableSpots = event.maxCapacity ? Math.max(0, event.maxCapacity - confirmedCount) : -1; // -1 means unlimited

    // Transform RSVPs to summary format
    const rsvps: RSVPSummary[] = filteredRSVPs.map((rsvp) => ({
      id: rsvp.id,
      memberId: rsvp.memberId,
      memberName: undefined, // Member details would need to be joined from repository
      memberEmail: undefined,
      status: rsvp.status,
      notes: undefined,
      rsvpedAt: rsvp.rsvpedAt,
    }));

    return {
      eventId: event.id,
      eventTitle: event.title,
      totalRSVPs: allRSVPs.length,
      confirmedCount,
      waitlistedCount,
      cancelledCount,
      maxCapacity: event.maxCapacity,
      availableSpots,
      rsvps,
    };
  }
}
