import { CreateEvent } from '../../../src/application/useCases/createEvent';
import { EventCategory } from '../../../src/domain/valueObjects/EventCategory';

describe('CreateEvent Use Case', () => {
  let createEvent: CreateEvent;
  let mockEventRepository: any;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(tomorrow.getHours() + 2);

  const mockCreatedEvent = {
    id: 'event-123',
    title: 'Sunday Worship Service',
    description: 'Weekly worship service',
    startDateTime: tomorrow,
    endDateTime: tomorrowEnd,
    location: 'Main Sanctuary',
    category: EventCategory.WORSHIP,
    maxCapacity: 100,
    imageUrl: null,
    createdById: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    startDate: tomorrow,
    endDate: tomorrowEnd,
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
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowEnd = new Date(tomorrow);
      tomorrowEnd.setHours(tomorrow.getHours() + 2);

      const input = {
        title: 'Sunday Worship Service',
        description: 'Weekly worship service',
        startDateTime: tomorrow,
        endDateTime: tomorrowEnd,
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
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextWeekEnd = new Date(nextWeek);
      nextWeekEnd.setHours(nextWeek.getHours() + 1.5);

      const input = {
        title: 'Open Prayer Meeting',
        description: 'All are welcome',
        startDateTime: nextWeek,
        endDateTime: nextWeekEnd,
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
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const futureDateEnd = new Date(futureDate);
      futureDateEnd.setHours(futureDate.getHours() + 2);

      const input = {
        title: '',
        description: 'Event description',
        startDateTime: futureDate,
        endDateTime: futureDateEnd,
        location: 'Main Hall',
        category: EventCategory.WORSHIP,
        createdById: 'user-123',
      };

      // Act & Assert
      await expect(createEvent.execute(input)).rejects.toThrow();
    });

    it('should throw error when end date is before start date', async () => {
      // Arrange
      const futureStart = new Date();
      futureStart.setDate(futureStart.getDate() + 3);
      futureStart.setHours(12, 0, 0, 0);
      const futureEnd = new Date(futureStart);
      futureEnd.setHours(10, 0, 0, 0); // 2 hours before start

      const input = {
        title: 'Invalid Event',
        description: 'End before start',
        startDateTime: futureStart,
        endDateTime: futureEnd,
        location: 'Main Hall',
        category: EventCategory.WORSHIP,
        createdById: 'user-123',
      };

      // Act & Assert
      await expect(createEvent.execute(input)).rejects.toThrow();
    });

    it('should assign image URL when provided', async () => {
      // Arrange
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const nextMonthEnd = new Date(nextMonth);
      nextMonthEnd.setHours(nextMonth.getHours() + 2);

      const input = {
        title: 'Event with Image',
        description: 'Has an image',
        startDateTime: nextMonth,
        endDateTime: nextMonthEnd,
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
