import { v4 as uuidv4 } from 'uuid';
import { Event } from '../../domain/entities/Event';
import { IEventRepository } from '../../domain/interfaces/IEventRepository';
import { EventCategory } from '../../domain/valueObjects/EventCategory';

/**
 * CreateEvent Use Case
 *
 * Allows administrators and staff to create new church events.
 * Validates input, enforces business rules, and persists the event.
 */

interface CreateEventInput {
  title: string;
  description: string;
  startDateTime: Date;
  endDateTime: Date;
  location: string;
  category: EventCategory;
  maxCapacity?: number | null;
  imageUrl?: string | null;
  createdById: string;
}

interface CreateEventOutput {
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
}

export class CreateEvent {
  constructor(private eventRepository: IEventRepository) {}

  /**
   * Execute the create event use case
   */
  async execute(input: CreateEventInput): Promise<CreateEventOutput> {
    // Validate that start date is not in the past
    const now = new Date();
    if (input.startDateTime < now) {
      throw new Error('Event start date cannot be in the past');
    }

    // Create event domain entity (includes validation)
    const event = Event.create({
      id: uuidv4(),
      title: input.title,
      description: input.description,
      startDateTime: input.startDateTime,
      endDateTime: input.endDateTime,
      location: input.location,
      category: input.category,
      maxCapacity: input.maxCapacity ?? null,
      imageUrl: input.imageUrl ?? null,
      createdById: input.createdById,
    });

    // Persist event
    const createdEvent = await this.eventRepository.create({
      id: event.id,
      title: event.title,
      description: event.description,
      startDateTime: event.startDateTime,
      endDateTime: event.endDateTime,
      location: event.location,
      category: event.category,
      maxCapacity: event.maxCapacity,
      imageUrl: event.imageUrl,
      createdById: event.createdById,
    });

    // Return output
    return {
      id: createdEvent.id,
      title: createdEvent.title,
      description: createdEvent.description,
      startDateTime: createdEvent.startDateTime,
      endDateTime: createdEvent.endDateTime,
      location: createdEvent.location,
      category: createdEvent.category as EventCategory,
      maxCapacity: createdEvent.maxCapacity,
      imageUrl: createdEvent.imageUrl,
      createdById: createdEvent.createdById,
      createdAt: createdEvent.createdAt,
      updatedAt: createdEvent.updatedAt,
    };
  }
}
