import { EventCategory } from '../valueObjects/EventCategory';

/**
 * Event Domain Entity
 *
 * Represents a church event (worship service, Bible study, community event, etc.)
 * with business rules for validation and capacity management.
 */
export class Event {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly startDateTime: Date;
  readonly endDateTime: Date;
  readonly location: string;
  readonly category: EventCategory;
  readonly maxCapacity: number | null;
  readonly imageUrl: string | null;
  readonly createdById: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly cancelledAt: Date | null;
  readonly deletedAt: Date | null;

  private constructor(data: {
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
    deletedAt: Date | null;
  }) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.startDateTime = data.startDateTime;
    this.endDateTime = data.endDateTime;
    this.location = data.location;
    this.category = data.category;
    this.maxCapacity = data.maxCapacity;
    this.imageUrl = data.imageUrl;
    this.createdById = data.createdById;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.cancelledAt = data.cancelledAt;
    this.deletedAt = data.deletedAt;
  }

  /**
   * Create a new Event with validation
   */
  static create(data: {
    id: string;
    title: string;
    description: string;
    startDateTime: Date;
    endDateTime: Date;
    location: string;
    category: EventCategory;
    maxCapacity?: number | null;
    imageUrl?: string | null;
    createdById: string;
    createdAt?: Date;
    updatedAt?: Date;
    cancelledAt?: Date | null;
    deletedAt?: Date | null;
  }): Event {
    // Validate required fields
    this.validateRequiredFields(data);

    // Validate dates
    this.validateDates(data.startDateTime, data.endDateTime);

    // Validate capacity
    if (data.maxCapacity !== undefined && data.maxCapacity !== null) {
      this.validateCapacity(data.maxCapacity);
    }

    // Validate title length
    this.validateTitle(data.title);

    // Validate location
    this.validateLocation(data.location);

    return new Event({
      id: data.id,
      title: data.title.trim(),
      description: data.description.trim(),
      startDateTime: data.startDateTime,
      endDateTime: data.endDateTime,
      location: data.location.trim(),
      category: data.category,
      maxCapacity: data.maxCapacity ?? null,
      imageUrl: data.imageUrl ?? null,
      createdById: data.createdById,
      createdAt: data.createdAt ?? new Date(),
      updatedAt: data.updatedAt ?? new Date(),
      cancelledAt: data.cancelledAt ?? null,
      deletedAt: data.deletedAt ?? null,
    });
  }

  /**
   * Validate required fields are present and non-empty
   */
  private static validateRequiredFields(data: {
    title: string;
    description: string;
    location: string;
    createdById: string;
  }): void {
    if (!data.title || data.title.trim() === '') {
      throw new Error('Event title is required');
    }
    if (!data.description || data.description.trim() === '') {
      throw new Error('Event description is required');
    }
    if (!data.location || data.location.trim() === '') {
      throw new Error('Event location is required');
    }
    if (!data.createdById || data.createdById.trim() === '') {
      throw new Error('Event creator ID is required');
    }
  }

  /**
   * Validate event dates
   */
  private static validateDates(startDateTime: Date, endDateTime: Date): void {
    if (!(startDateTime instanceof Date) || isNaN(startDateTime.getTime())) {
      throw new Error('Invalid start date');
    }
    if (!(endDateTime instanceof Date) || isNaN(endDateTime.getTime())) {
      throw new Error('Invalid end date');
    }
    if (endDateTime <= startDateTime) {
      throw new Error('End date must be after start date');
    }
    // Optionally validate that events are not in the past (when creating new events)
    // This could be handled at the use case level
  }

  /**
   * Validate event capacity
   */
  private static validateCapacity(capacity: number): void {
    if (capacity < 1) {
      throw new Error('Event capacity must be at least 1');
    }
    if (capacity > 10000) {
      throw new Error('Event capacity cannot exceed 10,000');
    }
  }

  /**
   * Validate event title
   */
  private static validateTitle(title: string): void {
    if (title.trim().length < 3) {
      throw new Error('Event title must be at least 3 characters');
    }
    if (title.trim().length > 200) {
      throw new Error('Event title cannot exceed 200 characters');
    }
  }

  /**
   * Validate event location
   */
  private static validateLocation(location: string): void {
    if (location.trim().length < 3) {
      throw new Error('Event location must be at least 3 characters');
    }
    if (location.trim().length > 500) {
      throw new Error('Event location cannot exceed 500 characters');
    }
  }

  /**
   * Check if the event is cancelled
   */
  isCancelled(): boolean {
    return this.cancelledAt !== null;
  }

  /**
   * Check if the event is deleted (soft delete)
   */
  isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  /**
   * Check if the event is active (not cancelled and not deleted)
   */
  isActive(): boolean {
    return !this.isCancelled() && !this.isDeleted();
  }

  /**
   * Check if the event has reached capacity
   */
  isAtCapacity(currentRSVPCount: number): boolean {
    if (this.maxCapacity === null) {
      return false; // No capacity limit
    }
    return currentRSVPCount >= this.maxCapacity;
  }

  /**
   * Get available spots remaining
   */
  getAvailableSpots(currentRSVPCount: number): number | null {
    if (this.maxCapacity === null) {
      return null; // Unlimited capacity
    }
    const remaining = this.maxCapacity - currentRSVPCount;
    return Math.max(0, remaining);
  }

  /**
   * Check if the event has started
   */
  hasStarted(): boolean {
    return new Date() >= this.startDateTime;
  }

  /**
   * Check if the event has ended
   */
  hasEnded(): boolean {
    return new Date() >= this.endDateTime;
  }

  /**
   * Check if the event is currently in progress
   */
  isInProgress(): boolean {
    const now = new Date();
    return now >= this.startDateTime && now < this.endDateTime;
  }

  /**
   * Check if RSVPs are still allowed
   * (e.g., event hasn't started, is active, etc.)
   */
  canAcceptRSVPs(): boolean {
    return this.isActive() && !this.hasStarted();
  }

  /**
   * Convert to plain object for persistence/serialization
   */
  toObject(): {
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
    deletedAt: Date | null;
  } {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      startDateTime: this.startDateTime,
      endDateTime: this.endDateTime,
      location: this.location,
      category: this.category,
      maxCapacity: this.maxCapacity,
      imageUrl: this.imageUrl,
      createdById: this.createdById,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      cancelledAt: this.cancelledAt,
      deletedAt: this.deletedAt,
    };
  }
}
