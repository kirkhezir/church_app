import { RSVPToEvent } from '../../../src/application/useCases/rsvpToEvent';
import { EventCategory } from '../../../src/domain/valueObjects/EventCategory';

describe('RSVPToEvent Use Case', () => {
  let rsvpToEvent: RSVPToEvent;
  let mockEventRepository: any;
  let mockRSVPRepository: any;
  let mockMemberRepository: any;
  let mockNotificationService: any;

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7); // 7 days from now

  const futureEndDate = new Date(futureDate);
  futureEndDate.setHours(futureEndDate.getHours() + 2);

  const mockEvent = {
    id: 'event-123',
    title: 'Sunday Worship Service',
    description: 'Weekly worship service',
    startDateTime: futureDate,
    endDateTime: futureEndDate,
    startDate: futureDate,
    endDate: futureEndDate,
    location: 'Main Sanctuary',
    category: EventCategory.WORSHIP,
    maxCapacity: 100,
    imageUrl: null,
    createdById: 'admin-123',
    createdAt: new Date(),
    updatedAt: new Date(),
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

    mockRSVPRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEventAndMember: jest.fn(),
      findByEvent: jest.fn(),
      findByMember: jest.fn(),
      getConfirmedCount: jest.fn(),
      getWaitlistCount: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findWaitlistedForEvent: jest.fn(),
      findByEventId: jest.fn(),
      findByMemberId: jest.fn(),
      updateStatus: jest.fn(),
      deleteByEventAndMember: jest.fn(),
    };

    mockMemberRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      search: jest.fn(),
      findByRole: jest.fn(),
      searchByName: jest.fn(),
      count: jest.fn(),
    };

    mockNotificationService = {
      sendRSVPConfirmation: jest.fn().mockResolvedValue(undefined),
      sendEventReminder: jest.fn(),
      sendEventUpdate: jest.fn(),
      sendEventCancellation: jest.fn(),
      sendWaitlistPromotion: jest.fn(),
    };

    rsvpToEvent = new RSVPToEvent(
      mockEventRepository,
      mockRSVPRepository,
      mockMemberRepository,
      mockNotificationService
    );
  });

  describe('execute', () => {
    it('should successfully RSVP when event has capacity', async () => {
      // Arrange
      const input = {
        eventId: 'event-123',
        memberId: 'member-123',
      };

      mockEventRepository.findById.mockResolvedValue(mockEvent);
      mockRSVPRepository.findByEventAndMember.mockResolvedValue(null);
      mockRSVPRepository.getConfirmedCount.mockResolvedValue(50); // 50 of 100 spots taken
      mockMemberRepository.findById.mockResolvedValue({
        id: 'member-123',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
      });
      mockRSVPRepository.create.mockResolvedValue({
        id: 'rsvp-123',
        eventId: 'event-123',
        memberId: 'member-123',
        status: 'CONFIRMED',
        rsvpedAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const result = await rsvpToEvent.execute(input);

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe('CONFIRMED');
      expect(result.isWaitlisted).toBe(false);
      expect(result.availableSpots).toBe(49); // 100 - 50 - 1 = 49
      expect(mockRSVPRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should add to waitlist when event is at capacity', async () => {
      // Arrange
      const input = {
        eventId: 'event-123',
        memberId: 'member-123',
      };

      mockEventRepository.findById.mockResolvedValue(mockEvent);
      mockRSVPRepository.findByEventAndMember.mockResolvedValue(null);
      mockRSVPRepository.getConfirmedCount.mockResolvedValue(100); // Full capacity
      mockMemberRepository.findById.mockResolvedValue({
        id: 'member-123',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
      });
      mockRSVPRepository.create.mockResolvedValue({
        id: 'rsvp-123',
        eventId: 'event-123',
        memberId: 'member-123',
        status: 'WAITLISTED',
        rsvpedAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const result = await rsvpToEvent.execute(input);

      // Assert
      expect(result.status).toBe('WAITLISTED');
      expect(result.isWaitlisted).toBe(true);
      expect(result.message).toContain('waitlist');
    });

    it('should always confirm RSVP when event has no capacity limit', async () => {
      // Arrange
      const eventWithNoCapacity = { ...mockEvent, maxCapacity: null };
      const input = {
        eventId: 'event-123',
        memberId: 'member-123',
      };

      mockEventRepository.findById.mockResolvedValue(eventWithNoCapacity);
      mockRSVPRepository.findByEventAndMember.mockResolvedValue(null);
      mockRSVPRepository.getConfirmedCount.mockResolvedValue(1000); // Many RSVPs but no limit
      mockMemberRepository.findById.mockResolvedValue({
        id: 'member-123',
        email: 'john@example.com',
      });
      mockRSVPRepository.create.mockResolvedValue({
        id: 'rsvp-123',
        eventId: 'event-123',
        memberId: 'member-123',
        status: 'CONFIRMED',
        rsvpedAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const result = await rsvpToEvent.execute(input);

      // Assert
      expect(result.status).toBe('CONFIRMED');
      expect(result.isWaitlisted).toBe(false);
      expect(result.availableSpots).toBe(-1); // -1 indicates unlimited
    });

    it('should throw error when event not found', async () => {
      // Arrange
      const input = {
        eventId: 'nonexistent-event',
        memberId: 'member-123',
      };

      mockEventRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(rsvpToEvent.execute(input)).rejects.toThrow('Event not found');
    });

    it('should throw error when event is cancelled', async () => {
      // Arrange
      const cancelledEvent = { ...mockEvent, cancelledAt: new Date() };
      const input = {
        eventId: 'event-123',
        memberId: 'member-123',
      };

      mockEventRepository.findById.mockResolvedValue(cancelledEvent);

      // Act & Assert
      await expect(rsvpToEvent.execute(input)).rejects.toThrow('Cannot RSVP to a cancelled event');
    });

    it('should throw error when event is deleted', async () => {
      // Arrange
      const deletedEvent = { ...mockEvent, deletedAt: new Date() };
      const input = {
        eventId: 'event-123',
        memberId: 'member-123',
      };

      mockEventRepository.findById.mockResolvedValue(deletedEvent);

      // Act & Assert
      await expect(rsvpToEvent.execute(input)).rejects.toThrow('Cannot RSVP to a deleted event');
    });

    it('should throw error when event has already started', async () => {
      // Arrange
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1); // Yesterday
      const startedEvent = { ...mockEvent, startDateTime: pastDate };
      const input = {
        eventId: 'event-123',
        memberId: 'member-123',
      };

      mockEventRepository.findById.mockResolvedValue(startedEvent);

      // Act & Assert
      await expect(rsvpToEvent.execute(input)).rejects.toThrow(
        'Cannot RSVP to an event that has already started'
      );
    });

    it('should throw error when member has already RSVPed', async () => {
      // Arrange
      const input = {
        eventId: 'event-123',
        memberId: 'member-123',
      };

      mockEventRepository.findById.mockResolvedValue(mockEvent);
      mockRSVPRepository.findByEventAndMember.mockResolvedValue({
        id: 'existing-rsvp',
        eventId: 'event-123',
        memberId: 'member-123',
        status: 'CONFIRMED',
        rsvpedAt: new Date(),
        updatedAt: new Date(),
      });

      // Act & Assert
      await expect(rsvpToEvent.execute(input)).rejects.toThrow(
        'You have already RSVPed to this event'
      );
    });

    it('should allow re-RSVP if previous RSVP was cancelled', async () => {
      // Arrange
      const input = {
        eventId: 'event-123',
        memberId: 'member-123',
      };

      mockEventRepository.findById.mockResolvedValue(mockEvent);
      mockRSVPRepository.findByEventAndMember.mockResolvedValue({
        id: 'cancelled-rsvp',
        eventId: 'event-123',
        memberId: 'member-123',
        status: 'CANCELLED', // Previous RSVP was cancelled
        rsvpedAt: new Date(),
        updatedAt: new Date(),
      });
      mockRSVPRepository.getConfirmedCount.mockResolvedValue(50);
      mockMemberRepository.findById.mockResolvedValue({
        id: 'member-123',
        email: 'john@example.com',
      });
      mockRSVPRepository.create.mockResolvedValue({
        id: 'new-rsvp',
        eventId: 'event-123',
        memberId: 'member-123',
        status: 'CONFIRMED',
        rsvpedAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const result = await rsvpToEvent.execute(input);

      // Assert
      expect(result.status).toBe('CONFIRMED');
      expect(mockRSVPRepository.create).toHaveBeenCalledTimes(1);
    });
  });
});
