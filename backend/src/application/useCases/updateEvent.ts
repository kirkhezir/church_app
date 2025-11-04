import { IEventRepository } from '../../domain/interfaces/IEventRepository';
import { EventCategory } from '../../domain/valueObjects/EventCategory';

/**
 * UpdateEvent Use Case
 *
 * Allows administrators and staff to update existing events.
 * Validates input and enforces business rules.
 */

interface UpdateEventInput {
  eventId: string;
  title?: string;
  description?: string;
  startDateTime?: Date;
  endDateTime?: Date;
  location?: string;
  category?: EventCategory;
  maxCapacity?: number | null;
  imageUrl?: string | null;
}

interface UpdateEventOutput {
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

export class UpdateEvent {
  constructor(private eventRepository: IEventRepository) {}

  /**
   * Execute the update event use case
   */
  async execute(input: UpdateEventInput): Promise<UpdateEventOutput> {
    // Find existing event
    const existingEvent = await this.eventRepository.findById(input.eventId);

    if (!existingEvent) {
      throw new Error('Event not found');
    }

    // Check if event is cancelled or deleted
    if (existingEvent.cancelledAt) {
      throw new Error('Cannot update a cancelled event');
    }
    if (existingEvent.deletedAt) {
      throw new Error('Cannot update a deleted event');
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (input.title !== undefined) {
      if (!input.title || input.title.trim().length < 3) {
        throw new Error('Event title must be at least 3 characters');
      }
      updateData.title = input.title.trim();
    }

    if (input.description !== undefined) {
      if (!input.description || input.description.trim() === '') {
        throw new Error('Event description is required');
      }
      updateData.description = input.description.trim();
    }

    if (input.location !== undefined) {
      if (!input.location || input.location.trim().length < 3) {
        throw new Error('Event location must be at least 3 characters');
      }
      updateData.location = input.location.trim();
    }

    if (input.category !== undefined) {
      updateData.category = input.category;
    }

    if (input.maxCapacity !== undefined) {
      if (input.maxCapacity !== null && input.maxCapacity < 1) {
        throw new Error('Event capacity must be at least 1');
      }
      updateData.maxCapacity = input.maxCapacity;
    }

    if (input.imageUrl !== undefined) {
      updateData.imageUrl = input.imageUrl;
    }

    // Validate dates if provided
    const startDateTime = input.startDateTime || existingEvent.startDateTime;
    const endDateTime = input.endDateTime || existingEvent.endDateTime;

    if (input.startDateTime) {
      updateData.startDateTime = input.startDateTime;
    }
    if (input.endDateTime) {
      updateData.endDateTime = input.endDateTime;
    }

    // Validate end date is after start date
    if (endDateTime <= startDateTime) {
      throw new Error('End date must be after start date');
    }

    // Merge existing event with updates
    const eventToUpdate = {
      id: existingEvent.id,
      title: input.title !== undefined ? input.title : existingEvent.title,
      description: input.description !== undefined ? input.description : existingEvent.description,
      startDateTime:
        input.startDateTime !== undefined ? input.startDateTime : existingEvent.startDateTime,
      endDateTime: input.endDateTime !== undefined ? input.endDateTime : existingEvent.endDateTime,
      location: input.location !== undefined ? input.location : existingEvent.location,
      category: input.category !== undefined ? input.category : existingEvent.category,
      maxCapacity: input.maxCapacity !== undefined ? input.maxCapacity : existingEvent.maxCapacity,
      imageUrl: existingEvent.imageUrl,
      createdById: existingEvent.createdById,
      updatedAt: new Date(),
    };

    // Update event
    const updatedEvent = await this.eventRepository.update(eventToUpdate);

    // Return output
    return {
      id: updatedEvent.id,
      title: updatedEvent.title,
      description: updatedEvent.description,
      startDateTime: updatedEvent.startDateTime,
      endDateTime: updatedEvent.endDateTime,
      location: updatedEvent.location,
      category: updatedEvent.category as EventCategory,
      maxCapacity: updatedEvent.maxCapacity,
      imageUrl: updatedEvent.imageUrl,
      createdById: updatedEvent.createdById,
      createdAt: updatedEvent.createdAt,
      updatedAt: updatedEvent.updatedAt,
    };
  }
}
