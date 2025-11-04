import { IEventRepository } from '../../domain/interfaces/IEventRepository';
import { EventCategory } from '../../domain/valueObjects/EventCategory';

/**
 * GetEvents Use Case
 *
 * Retrieves a list of events with optional filtering by category and date range.
 * Public access - no authentication required.
 */

interface GetEventsInput {
  category?: EventCategory;
  startDate?: Date;
  endDate?: Date;
}

interface EventOutput {
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
  rsvpCount?: number;
  creator?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export class GetEvents {
  constructor(private eventRepository: IEventRepository) {}

  /**
   * Execute the get events use case
   */
  async execute(input: GetEventsInput = {}): Promise<EventOutput[]> {
    let events: any[];

    // Apply filters based on input
    if (input.category) {
      // Filter by category
      events = await this.eventRepository.findByCategory(input.category);
    } else {
      // No filters - get all active events
      events = await this.eventRepository.findAll();
    }

    // Apply date range filter manually if needed
    if (input.startDate || input.endDate) {
      const startDate = input.startDate || new Date(0);
      const endDate = input.endDate || new Date(2100, 0, 1);
      events = events.filter((event) => {
        const eventStart = new Date(event.startDate);
        return eventStart >= startDate && eventStart <= endDate;
      });
    }

    // Transform to output format
    return events.map((event) => ({
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
      rsvpCount: event._count?.rsvps || 0,
      creator: event.creator
        ? {
            id: event.creator.id,
            firstName: event.creator.firstName,
            lastName: event.creator.lastName,
            email: event.creator.email,
          }
        : undefined,
    }));
  }
}
