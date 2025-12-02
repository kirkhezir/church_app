import { CancelEvent } from '../../../src/application/useCases/cancelEvent';
import { EventCategory } from '../../../src/domain/valueObjects/EventCategory';

describe('CancelEvent Use Case', () => {
  let cancelEvent: CancelEvent;
  let mockEventRepository: any;
  let mockRSVPRepository: any;
  let mockMemberRepository: any;
  let mockNotificationService: any;

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);

  const mockEvent = {
    id: 'event-123',
    title: 'Sunday Worship Service',
    description: 'Weekly worship service',
    startDateTime: futureDate,
    endDateTime: new Date(futureDate.getTime() + 2 * 60 * 60 * 1000),
    location: 'Main Sanctuary',
    category: EventCategory.WORSHIP,
    maxCapacity: 100,
    createdById: 'admin-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    cancelledAt: null,
    deletedAt: null,
  };

  beforeEach(() => {
    mockEventRepository = {
      findById: jest.fn(),
      cancel: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockRSVPRepository = {
      findByEventId: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    };

    mockMemberRepository = {
      findById: jest.fn(),
      findByIds: jest.fn(),
    };

    mockNotificationService = {
      sendEventCancellation: jest.fn().mockResolvedValue(undefined),
    };

    cancelEvent = new CancelEvent(
      mockEventRepository,
      mockRSVPRepository,
      mockMemberRepository,
      mockNotificationService
    );
  });

  describe('execute', () => {
    it('should cancel an event successfully', async () => {
      // Arrange
      mockEventRepository.findById.mockResolvedValueOnce(mockEvent).mockResolvedValueOnce({
        ...mockEvent,
        cancelledAt: new Date(),
      });
      mockRSVPRepository.findByEventId.mockResolvedValue([]);
      mockEventRepository.cancel.mockResolvedValue(undefined);

      const input = {
        eventId: 'event-123',
        cancelledById: 'admin-123',
        reason: 'Weather conditions',
      };

      // Act
      const result = await cancelEvent.execute(input);

      // Assert
      expect(result.id).toBe('event-123');
      expect(result.title).toBe('Sunday Worship Service');
      expect(result.cancelledAt).toBeInstanceOf(Date);
      expect(result.message).toContain('cancelled successfully');
      expect(mockEventRepository.cancel).toHaveBeenCalledWith('event-123');
    });

    it('should notify attendees when cancelling event with RSVPs', async () => {
      // Arrange
      const rsvps = [
        { id: 'rsvp-1', memberId: 'member-1', status: 'CONFIRMED' },
        { id: 'rsvp-2', memberId: 'member-2', status: 'CONFIRMED' },
        { id: 'rsvp-3', memberId: 'member-3', status: 'WAITLISTED' },
      ];

      mockEventRepository.findById.mockResolvedValueOnce(mockEvent).mockResolvedValueOnce({
        ...mockEvent,
        cancelledAt: new Date(),
      });
      mockRSVPRepository.findByEventId.mockResolvedValue(rsvps);
      mockEventRepository.cancel.mockResolvedValue(undefined);

      const input = {
        eventId: 'event-123',
        cancelledById: 'admin-123',
      };

      // Act
      const result = await cancelEvent.execute(input);

      // Assert
      expect(result.message).toContain('3 attendees will be notified');
    });

    it('should throw error when event not found', async () => {
      // Arrange
      mockEventRepository.findById.mockResolvedValue(null);

      const input = {
        eventId: 'nonexistent-event',
        cancelledById: 'admin-123',
      };

      // Act & Assert
      await expect(cancelEvent.execute(input)).rejects.toThrow('Event not found');
    });

    it('should throw error when event is already cancelled', async () => {
      // Arrange
      mockEventRepository.findById.mockResolvedValue({
        ...mockEvent,
        cancelledAt: new Date(),
      });

      const input = {
        eventId: 'event-123',
        cancelledById: 'admin-123',
      };

      // Act & Assert
      await expect(cancelEvent.execute(input)).rejects.toThrow('Event is already cancelled');
    });

    it('should throw error when event is deleted', async () => {
      // Arrange
      mockEventRepository.findById.mockResolvedValue({
        ...mockEvent,
        deletedAt: new Date(),
      });

      const input = {
        eventId: 'event-123',
        cancelledById: 'admin-123',
      };

      // Act & Assert
      await expect(cancelEvent.execute(input)).rejects.toThrow('Cannot cancel a deleted event');
    });

    it('should not count cancelled RSVPs in notification count', async () => {
      // Arrange
      const rsvps = [
        { id: 'rsvp-1', memberId: 'member-1', status: 'CONFIRMED' },
        { id: 'rsvp-2', memberId: 'member-2', status: 'CANCELLED' },
        { id: 'rsvp-3', memberId: 'member-3', status: 'CANCELLED' },
      ];

      mockEventRepository.findById.mockResolvedValueOnce(mockEvent).mockResolvedValueOnce({
        ...mockEvent,
        cancelledAt: new Date(),
      });
      mockRSVPRepository.findByEventId.mockResolvedValue(rsvps);
      mockEventRepository.cancel.mockResolvedValue(undefined);

      const input = {
        eventId: 'event-123',
        cancelledById: 'admin-123',
      };

      // Act
      const result = await cancelEvent.execute(input);

      // Assert
      expect(result.message).toContain('1 attendees will be notified');
    });
  });
});
