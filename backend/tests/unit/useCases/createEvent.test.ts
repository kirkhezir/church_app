import { CreateEvent } from '../../../src/application/useCases/createEvent';
import { EventCategory } from '../../../src/domain/valueObjects/EventCategory';

describe('CreateEvent Use Case', () => {
  let createEvent: CreateEvent;
  let mockEventRepository: any;

  const mockCreatedEvent = {
    id: 'event-123',
    title: 'Sunday Worship Service',
    description: 'Weekly worship service',
    startDateTime: new Date('2025-12-15T10:00:00Z'),
    endDateTime: new Date('2025-12-15T12:00:00Z'),
    location: 'Main Sanctuary',
    category: EventCategory.WORSHIP,
    maxCapacity: 100,
    imageUrl: null,
    createdById: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    startDate: new Date('2025-12-15T10:00:00Z'),
    endDate: new Date('2025-12-15T12:00:00Z'),
    cancelledAt: null,
    deletedAt: null,
  };

  beforeEach(() => {
    mockEventRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUpcoming: jest.fn(),
      findByCategory: jest.fn(),
      findByDateRange: jest.fn(),
      cancelEvent: jest.fn(),
      restoreEvent: jest.fn(),
      findByCreator: jest.fn(),
      cancel: jest.fn(),
    };

    createEvent = new CreateEvent(mockEventRepository);
  });

  describe('execute', () => {
    it('should create an event successfully with valid input', async () => {
      // Arrange
      const input = {
        title: 'Sunday Worship Service',
        description: 'Weekly worship service',
        startDateTime: new Date('2025-12-15T10:00:00Z'),
        endDateTime: new Date('2025-12-15T12:00:00Z'),
        location: 'Main Sanctuary',
        category: EventCategory.WORSHIP,
        maxCapacity: 100,
        createdById: 'user-123',
      };

      mockEventRepository.create.mockResolvedValue(mockCreatedEvent);

      // Act
      const result = await createEvent.execute(input);

      // Assert
      expect(result).toBeDefined();
      expect(result.title).toBe('Sunday Worship Service');
      expect(result.category).toBe(EventCategory.WORSHIP);
      expect(result.maxCapacity).toBe(100);
      expect(mockEventRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should create an event without max capacity (unlimited)', async () => {
      // Arrange
      const input = {
        title: 'Open Prayer Meeting',
        description: 'All are welcome',
        startDateTime: new Date('2025-12-15T19:00:00Z'),
        endDateTime: new Date('2025-12-15T20:30:00Z'),
        location: 'Fellowship Hall',
        category: EventCategory.FELLOWSHIP,
        createdById: 'user-123',
      };

      const eventWithoutCapacity = {
        ...mockCreatedEvent,
        title: 'Open Prayer Meeting',
        maxCapacity: null,
      };

      mockEventRepository.create.mockResolvedValue(eventWithoutCapacity);

      // Act
      const result = await createEvent.execute(input);

      // Assert
      expect(result.maxCapacity).toBeNull();
    });

    it('should throw error when start date is in the past', async () => {
      // Arrange
      const pastDate = new Date('2020-01-01T10:00:00Z');
      const input = {
        title: 'Past Event',
        description: 'Should fail',
        startDateTime: pastDate,
        endDateTime: new Date('2020-01-01T12:00:00Z'),
        location: 'Somewhere',
        category: EventCategory.FELLOWSHIP,
        createdById: 'user-123',
      };

      // Act & Assert
      await expect(createEvent.execute(input)).rejects.toThrow(
        'Event start date cannot be in the past'
      );
      expect(mockEventRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error when title is empty', async () => {
      // Arrange
      const input = {
        title: '',
        description: 'Event description',
        startDateTime: new Date('2025-12-15T10:00:00Z'),
        endDateTime: new Date('2025-12-15T12:00:00Z'),
        location: 'Main Hall',
        category: EventCategory.WORSHIP,
        createdById: 'user-123',
      };

      // Act & Assert
      await expect(createEvent.execute(input)).rejects.toThrow();
    });

    it('should throw error when end date is before start date', async () => {
      // Arrange
      const input = {
        title: 'Invalid Event',
        description: 'End before start',
        startDateTime: new Date('2025-12-15T12:00:00Z'),
        endDateTime: new Date('2025-12-15T10:00:00Z'), // Before start
        location: 'Main Hall',
        category: EventCategory.WORSHIP,
        createdById: 'user-123',
      };

      // Act & Assert
      await expect(createEvent.execute(input)).rejects.toThrow();
    });

    it('should assign image URL when provided', async () => {
      // Arrange
      const input = {
        title: 'Event with Image',
        description: 'Has an image',
        startDateTime: new Date('2025-12-15T10:00:00Z'),
        endDateTime: new Date('2025-12-15T12:00:00Z'),
        location: 'Main Hall',
        category: EventCategory.COMMUNITY,
        imageUrl: 'https://example.com/event-image.jpg',
        createdById: 'user-123',
      };

      const eventWithImage = {
        ...mockCreatedEvent,
        imageUrl: 'https://example.com/event-image.jpg',
      };

      mockEventRepository.create.mockResolvedValue(eventWithImage);

      // Act
      const result = await createEvent.execute(input);

      // Assert
      expect(result.imageUrl).toBe('https://example.com/event-image.jpg');
    });
  });
});
