import { IEventRepository } from '../../domain/interfaces/IEventRepository';
import { IEventRSVPRepository } from '../../domain/interfaces/IEventRSVPRepository';
import { EventCategory } from '../../domain/valueObjects/EventCategory';

/**
 * GetEventById Use Case
 *
 * Retrieves a single event by ID with RSVP count and details.
 * Public access - no authentication required.
 */

interface GetEventByIdInput {
  eventId: string;
}

interface EventDetailOutput {
  id: string;
  title: string;
  description: string;
  startDateTime: Date;
  endDateTime: Date;
  location: string;
  category: EventCategory;
  maxCapacity: number | null;
  imageUrl: string | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  cancelledAt: Date | null;
  rsvpCount: number;
  availableSpots: number | null;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export class GetEventById {
  constructor(
    private eventRepository: IEventRepository,
    private rsvpRepository: IEventRSVPRepository
  ) {}

  /**
   * Execute the get event by ID use case
   */
  async execute(input: GetEventByIdInput): Promise<EventDetailOutput> {
    // Find event
    const event = await this.eventRepository.findById(input.eventId);

    if (!event) {
      throw new Error('Event not found');
    }

    // Get confirmed RSVP count
    const rsvpCount = await this.rsvpRepository.getConfirmedCount(input.eventId);

    // Calculate available spots
    let availableSpots: number | null = null;
    if (event.maxCapacity !== null) {
      availableSpots = Math.max(0, event.maxCapacity - rsvpCount);
    }

    // Return event details
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      startDateTime: event.startDateTime,
      endDateTime: event.endDateTime,
      location: event.location,
      category: event.category as EventCategory,
      maxCapacity: event.maxCapacity,
      imageUrl: event.imageUrl,
      createdById: event.createdById,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      cancelledAt: event.cancelledAt,
      rsvpCount,
      availableSpots,
      creator: {
        id: event.creator.id,
        firstName: event.creator.firstName,
        lastName: event.creator.lastName,
        email: event.creator.email,
      },
    };
  }
}
