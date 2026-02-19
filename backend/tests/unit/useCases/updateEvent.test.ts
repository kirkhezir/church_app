/**
 * Unit Tests for UpdateEvent Use Case
 *
 * Tests event update functionality:
 * - Successful updates with valid data
 * - Validation of title, description, location, capacity
 * - Date validation (end > start)
 * - Rejection of updates to cancelled/deleted events
 */

import { UpdateEvent } from '../../../src/application/useCases/updateEvent';
import { IEventRepository } from '../../../src/domain/interfaces/IEventRepository';
import { EventCategory } from '../../../src/domain/valueObjects/EventCategory';

const mockEventRepository: jest.Mocked<IEventRepository> = {
  findById: jest.fn(),
  findAll: jest.fn(),
  findByCategory: jest.fn(),
  findUpcoming: jest.fn(),
  findByCreator: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  cancel: jest.fn(),
  delete: jest.fn(),
};

describe('UpdateEvent Use Case', () => {
  let updateEvent: UpdateEvent;

  const existingEvent = {
    id: 'event-1',
    title: 'Sabbath Worship',
    description: 'Weekly worship service',
    startDateTime: new Date('2026-06-01T09:00:00Z'),
    endDateTime: new Date('2026-06-01T12:00:00Z'),
    location: 'Main Sanctuary',
    category: EventCategory.WORSHIP,
    maxCapacity: 100,
    imageUrl: null,
    createdById: 'admin-1',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    cancelledAt: null,
    deletedAt: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    updateEvent = new UpdateEvent(mockEventRepository);
    mockEventRepository.findById.mockResolvedValue({ ...existingEvent });
    mockEventRepository.update.mockImplementation(async (data) => ({
      ...existingEvent,
      ...data,
      updatedAt: new Date(),
    }));
  });

  describe('successful updates', () => {
    it('should update event title', async () => {
      const result = await updateEvent.execute({
        eventId: 'event-1',
        title: 'Updated Worship Service',
      });

      expect(result.title).toBe('Updated Worship Service');
      expect(mockEventRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Updated Worship Service' })
      );
    });

    it('should update event description', async () => {
      const result = await updateEvent.execute({
        eventId: 'event-1',
        description: 'A new description for the worship service',
      });

      expect(result.description).toBe('A new description for the worship service');
    });

    it('should update event location', async () => {
      const result = await updateEvent.execute({
        eventId: 'event-1',
        location: 'Fellowship Hall',
      });

      expect(result.location).toBe('Fellowship Hall');
    });

    it('should update event category', async () => {
      const result = await updateEvent.execute({
        eventId: 'event-1',
        category: EventCategory.FELLOWSHIP,
      });

      expect(result.category).toBe(EventCategory.FELLOWSHIP);
    });

    it('should update max capacity', async () => {
      const result = await updateEvent.execute({
        eventId: 'event-1',
        maxCapacity: 200,
      });

      expect(result.maxCapacity).toBe(200);
    });

    it('should allow setting max capacity to null (unlimited)', async () => {
      const result = await updateEvent.execute({
        eventId: 'event-1',
        maxCapacity: null,
      });

      expect(result.maxCapacity).toBeNull();
    });

    it('should update dates when valid', async () => {
      const newStart = new Date('2026-07-01T09:00:00Z');
      const newEnd = new Date('2026-07-01T12:00:00Z');

      const result = await updateEvent.execute({
        eventId: 'event-1',
        startDateTime: newStart,
        endDateTime: newEnd,
      });

      expect(result.startDateTime).toBe(newStart);
      expect(result.endDateTime).toBe(newEnd);
    });
  });

  describe('validation errors', () => {
    it('should throw if event not found', async () => {
      mockEventRepository.findById.mockResolvedValue(null);

      await expect(updateEvent.execute({ eventId: 'missing', title: 'Test' })).rejects.toThrow(
        'Event not found'
      );
    });

    it('should throw if event is cancelled', async () => {
      mockEventRepository.findById.mockResolvedValue({
        ...existingEvent,
        cancelledAt: new Date(),
      });

      await expect(updateEvent.execute({ eventId: 'event-1', title: 'Test' })).rejects.toThrow(
        'Cannot update a cancelled event'
      );
    });

    it('should throw if event is deleted', async () => {
      mockEventRepository.findById.mockResolvedValue({
        ...existingEvent,
        deletedAt: new Date(),
      });

      await expect(updateEvent.execute({ eventId: 'event-1', title: 'Test' })).rejects.toThrow(
        'Cannot update a deleted event'
      );
    });

    it('should throw if title is too short', async () => {
      await expect(updateEvent.execute({ eventId: 'event-1', title: 'AB' })).rejects.toThrow(
        'Event title must be at least 3 characters'
      );
    });

    it('should throw if description is empty', async () => {
      await expect(updateEvent.execute({ eventId: 'event-1', description: '' })).rejects.toThrow(
        'Event description is required'
      );
    });

    it('should throw if location is too short', async () => {
      await expect(updateEvent.execute({ eventId: 'event-1', location: 'AB' })).rejects.toThrow(
        'Event location must be at least 3 characters'
      );
    });

    it('should throw if max capacity is less than 1', async () => {
      await expect(updateEvent.execute({ eventId: 'event-1', maxCapacity: 0 })).rejects.toThrow(
        'Event capacity must be at least 1'
      );
    });

    it('should throw if end date is before start date', async () => {
      await expect(
        updateEvent.execute({
          eventId: 'event-1',
          startDateTime: new Date('2026-06-01T12:00:00Z'),
          endDateTime: new Date('2026-06-01T09:00:00Z'),
        })
      ).rejects.toThrow('End date must be after start date');
    });

    it('should throw if new end date is before existing start date', async () => {
      await expect(
        updateEvent.execute({
          eventId: 'event-1',
          endDateTime: new Date('2026-06-01T08:00:00Z'), // before existing start 09:00
        })
      ).rejects.toThrow('End date must be after start date');
    });
  });
});
