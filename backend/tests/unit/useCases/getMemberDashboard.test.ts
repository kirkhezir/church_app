import {
  GetMemberDashboard,
  GetMemberDashboardRequest,
} from '../../../src/application/useCases/getMemberDashboard';
import { Role } from '../../../src/domain/valueObjects/Role';
import { EventCategory } from '../../../src/domain/valueObjects/EventCategory';

describe('GetMemberDashboard Use Case', () => {
  let getMemberDashboard: GetMemberDashboard;
  let mockMemberRepository: any;
  let mockEventRepository: any;
  let mockAnnouncementRepository: any;

  const mockMember = {
    id: 'member-123',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: Role.MEMBER,
    phone: '+66812345678',
    membershipDate: new Date('2024-01-01'),
  };

  const mockEvents = [
    {
      id: 'event-1',
      title: 'Sunday Worship',
      description: 'Weekly worship service',
      category: EventCategory.WORSHIP,
      startDateTime: new Date('2025-12-08T09:00:00'),
      endDateTime: new Date('2025-12-08T11:00:00'),
      location: 'Main Sanctuary',
    },
    {
      id: 'event-2',
      title: 'Bible Study',
      description: 'Weekly Bible study group',
      category: EventCategory.BIBLE_STUDY,
      startDateTime: new Date('2025-12-10T19:00:00'),
      endDateTime: new Date('2025-12-10T21:00:00'),
      location: 'Fellowship Hall',
    },
  ];

  const mockAnnouncements = [
    {
      id: 'ann-1',
      title: 'Church Building Update',
      content: 'Renovation progress update',
      priority: 'NORMAL',
      publishedAt: new Date('2025-12-01'),
      isDraft: false,
    },
    {
      id: 'ann-2',
      title: 'Christmas Service Schedule',
      content: 'Special service times',
      priority: 'URGENT',
      publishedAt: new Date('2025-12-02'),
      isDraft: false,
    },
  ];

  beforeEach(() => {
    mockMemberRepository = {
      findById: jest.fn(),
    };

    mockEventRepository = {
      findUpcoming: jest.fn(),
    };

    mockAnnouncementRepository = {
      findRecent: jest.fn(),
    };

    getMemberDashboard = new GetMemberDashboard(
      mockMemberRepository,
      mockEventRepository,
      mockAnnouncementRepository
    );
  });

  describe('execute', () => {
    it('should return dashboard data for valid member', async () => {
      // Arrange
      mockMemberRepository.findById.mockResolvedValue(mockMember);
      mockEventRepository.findUpcoming.mockResolvedValue(mockEvents);
      mockAnnouncementRepository.findRecent.mockResolvedValue(mockAnnouncements);

      const request: GetMemberDashboardRequest = {
        memberId: 'member-123',
      };

      // Act
      const result = await getMemberDashboard.execute(request);

      // Assert
      expect(result.profile.id).toBe('member-123');
      expect(result.profile.firstName).toBe('John');
      expect(result.profile.lastName).toBe('Doe');
      expect(result.upcomingEvents).toHaveLength(2);
      expect(result.recentAnnouncements).toHaveLength(2);
      expect(result.stats.upcomingEventsCount).toBe(2);
    });

    it('should throw error when member not found', async () => {
      // Arrange
      mockMemberRepository.findById.mockResolvedValue(null);

      const request: GetMemberDashboardRequest = {
        memberId: 'nonexistent-member',
      };

      // Act & Assert
      await expect(getMemberDashboard.execute(request)).rejects.toThrow('Member not found');
    });

    it('should return empty events when no upcoming events', async () => {
      // Arrange
      mockMemberRepository.findById.mockResolvedValue(mockMember);
      mockEventRepository.findUpcoming.mockResolvedValue([]);
      mockAnnouncementRepository.findRecent.mockResolvedValue(mockAnnouncements);

      const request: GetMemberDashboardRequest = {
        memberId: 'member-123',
      };

      // Act
      const result = await getMemberDashboard.execute(request);

      // Assert
      expect(result.upcomingEvents).toHaveLength(0);
      expect(result.stats.upcomingEventsCount).toBe(0);
    });

    it('should return empty announcements when no recent announcements', async () => {
      // Arrange
      mockMemberRepository.findById.mockResolvedValue(mockMember);
      mockEventRepository.findUpcoming.mockResolvedValue(mockEvents);
      mockAnnouncementRepository.findRecent.mockResolvedValue([]);

      const request: GetMemberDashboardRequest = {
        memberId: 'member-123',
      };

      // Act
      const result = await getMemberDashboard.execute(request);

      // Assert
      expect(result.recentAnnouncements).toHaveLength(0);
      expect(result.stats.unreadAnnouncementsCount).toBe(0);
    });

    it('should include member profile information', async () => {
      // Arrange
      mockMemberRepository.findById.mockResolvedValue(mockMember);
      mockEventRepository.findUpcoming.mockResolvedValue([]);
      mockAnnouncementRepository.findRecent.mockResolvedValue([]);

      const request: GetMemberDashboardRequest = {
        memberId: 'member-123',
      };

      // Act
      const result = await getMemberDashboard.execute(request);

      // Assert
      expect(result.profile).toEqual({
        id: 'member-123',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: Role.MEMBER,
        membershipDate: mockMember.membershipDate,
        phone: '+66812345678',
      });
    });

    it('should map event fields correctly', async () => {
      // Arrange
      mockMemberRepository.findById.mockResolvedValue(mockMember);
      mockEventRepository.findUpcoming.mockResolvedValue([mockEvents[0]]);
      mockAnnouncementRepository.findRecent.mockResolvedValue([]);

      const request: GetMemberDashboardRequest = {
        memberId: 'member-123',
      };

      // Act
      const result = await getMemberDashboard.execute(request);

      // Assert
      expect(result.upcomingEvents[0]).toMatchObject({
        id: 'event-1',
        title: 'Sunday Worship',
        description: 'Weekly worship service',
        category: EventCategory.WORSHIP,
        location: 'Main Sanctuary',
      });
    });

    it('should map announcement fields correctly', async () => {
      // Arrange
      mockMemberRepository.findById.mockResolvedValue(mockMember);
      mockEventRepository.findUpcoming.mockResolvedValue([]);
      mockAnnouncementRepository.findRecent.mockResolvedValue([mockAnnouncements[0]]);

      const request: GetMemberDashboardRequest = {
        memberId: 'member-123',
      };

      // Act
      const result = await getMemberDashboard.execute(request);

      // Assert
      expect(result.recentAnnouncements[0]).toMatchObject({
        id: 'ann-1',
        title: 'Church Building Update',
        content: 'Renovation progress update',
        priority: 'NORMAL',
      });
    });

    it('should call repositories with correct limits', async () => {
      // Arrange
      mockMemberRepository.findById.mockResolvedValue(mockMember);
      mockEventRepository.findUpcoming.mockResolvedValue([]);
      mockAnnouncementRepository.findRecent.mockResolvedValue([]);

      const request: GetMemberDashboardRequest = {
        memberId: 'member-123',
      };

      // Act
      await getMemberDashboard.execute(request);

      // Assert
      expect(mockEventRepository.findUpcoming).toHaveBeenCalledWith(5);
      expect(mockAnnouncementRepository.findRecent).toHaveBeenCalledWith(5);
    });
  });
});
