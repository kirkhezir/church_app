/**
 * Unit Tests for CreateAnnouncement Use Case
 *
 * Tests announcement creation:
 * - Author validation (exists, role)
 * - Announcement entity validation (title, content)
 * - Draft vs published behaviour
 * - URGENT priority triggers email
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock module-level singletons before imports
jest.mock('../../../src/infrastructure/database/repositories/announcementRepository', () => ({
  announcementRepository: {
    create: jest.fn(),
  },
}));

jest.mock('../../../src/infrastructure/database/repositories/memberRepository', () => ({
  memberRepository: {
    findById: jest.fn(),
    findAll: jest.fn(),
  },
}));

jest.mock('../../../src/infrastructure/email/emailService', () => ({
  EmailService: jest.fn().mockImplementation(() => ({
    sendEmail: jest.fn().mockResolvedValue(undefined),
  })),
}));

jest.mock('../../../src/infrastructure/logging/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

import { createAnnouncement } from '../../../src/application/useCases/createAnnouncement';
import { Priority } from '../../../src/domain/valueObjects/Priority';
import { announcementRepository } from '../../../src/infrastructure/database/repositories/announcementRepository';
import { memberRepository } from '../../../src/infrastructure/database/repositories/memberRepository';

const mockAnnouncementRepo = announcementRepository as jest.Mocked<typeof announcementRepository>;
const mockMemberRepo = memberRepository as jest.Mocked<typeof memberRepository>;

describe('CreateAnnouncement Use Case', () => {
  const adminAuthor = {
    id: 'author-1',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@church.org',
    role: 'ADMIN',
    emailNotifications: true,
  };

  const staffAuthor = {
    id: 'author-2',
    firstName: 'Staff',
    lastName: 'Member',
    email: 'staff@church.org',
    role: 'STAFF',
    emailNotifications: true,
  };

  const regularMember = {
    id: 'member-1',
    firstName: 'Regular',
    lastName: 'Member',
    email: 'member@church.org',
    role: 'MEMBER',
    emailNotifications: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Default: admin author exists, repo creates successfully
    mockMemberRepo.findById.mockResolvedValue(adminAuthor as any);
    mockAnnouncementRepo.create.mockImplementation(async (data: any) => ({
      id: data.id,
      title: data.title,
      content: data.content,
      priority: data.priority,
      authorId: data.authorId,
      publishedAt: data.publishedAt,
      archivedAt: data.archivedAt ?? null,
      isDraft: data.isDraft,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      deletedAt: data.deletedAt ?? null,
    }));
  });

  describe('successful creation', () => {
    it('should create an announcement as ADMIN', async () => {
      const result = await createAnnouncement(
        'author-1',
        'Test Announcement',
        'This is a test announcement content.',
        Priority.NORMAL,
        false
      );

      expect(result).toBeDefined();
      expect(result.title).toBe('Test Announcement');
      expect(result.content).toBe('This is a test announcement content.');
      expect(result.authorId).toBe('author-1');
      expect(mockAnnouncementRepo.create).toHaveBeenCalledTimes(1);
    });

    it('should create an announcement as STAFF', async () => {
      mockMemberRepo.findById.mockResolvedValue(staffAuthor as any);

      const result = await createAnnouncement(
        'author-2',
        'Staff Announcement',
        'Content from staff member.',
        Priority.NORMAL,
        false
      );

      expect(result).toBeDefined();
      expect(result.title).toBe('Staff Announcement');
    });

    it('should create a draft announcement', async () => {
      const result = await createAnnouncement(
        'author-1',
        'Draft Title',
        'Draft content here.',
        Priority.NORMAL,
        true
      );

      expect(result).toBeDefined();
      expect(result.isDraft).toBe(true);
      expect(mockAnnouncementRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ isDraft: true })
      );
    });

    it('should use NORMAL priority by default', async () => {
      const result = await createAnnouncement(
        'author-1',
        'Default Priority',
        'Content with default priority.'
      );

      expect(result).toBeDefined();
      expect(result.priority).toBe(Priority.NORMAL);
    });

    it('should persist with toPersistence data plus isDraft flag', async () => {
      await createAnnouncement(
        'author-1',
        'Persistence Test',
        'Testing persistence flow.',
        Priority.NORMAL,
        false
      );

      expect(mockAnnouncementRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Persistence Test',
          content: 'Testing persistence flow.',
          priority: Priority.NORMAL,
          authorId: 'author-1',
          isDraft: false,
        })
      );
    });
  });

  describe('URGENT priority email trigger', () => {
    it('should trigger emails for URGENT non-draft announcements', async () => {
      mockMemberRepo.findAll.mockResolvedValue([
        regularMember,
        { ...regularMember, id: 'member-2', email: 'member2@church.org' },
      ] as any);

      await createAnnouncement(
        'author-1',
        'Urgent Notice',
        'This is urgent content.',
        Priority.URGENT,
        false
      );

      // Fire-and-forget — findAll should be called eventually
      // Allow microtask to settle
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(mockMemberRepo.findAll).toHaveBeenCalled();
    });

    it('should NOT trigger emails for URGENT draft announcements', async () => {
      await createAnnouncement(
        'author-1',
        'Urgent Draft',
        'This urgent draft should not email.',
        Priority.URGENT,
        true
      );

      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(mockMemberRepo.findAll).not.toHaveBeenCalled();
    });

    it('should NOT trigger emails for NORMAL priority', async () => {
      await createAnnouncement(
        'author-1',
        'Normal Announcement',
        'Regular announcement content.',
        Priority.NORMAL,
        false
      );

      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(mockMemberRepo.findAll).not.toHaveBeenCalled();
    });
  });

  describe('validation errors', () => {
    it('should throw if author not found', async () => {
      mockMemberRepo.findById.mockResolvedValue(null);

      await expect(createAnnouncement('nonexistent', 'Title', 'Content')).rejects.toThrow(
        'Author not found'
      );
    });

    it('should throw if author is a regular MEMBER', async () => {
      mockMemberRepo.findById.mockResolvedValue(regularMember as any);

      await expect(createAnnouncement('member-1', 'Title', 'Content')).rejects.toThrow(
        'Only administrators and staff can create announcements'
      );
    });

    it('should throw if title is too short', async () => {
      await expect(createAnnouncement('author-1', 'Hi', 'Content body here.')).rejects.toThrow(
        'Announcement title must be at least 3 characters long'
      );
    });

    it('should throw if title exceeds 150 characters', async () => {
      const longTitle = 'A'.repeat(151);

      await expect(createAnnouncement('author-1', longTitle, 'Content body here.')).rejects.toThrow(
        'Announcement title cannot exceed 150 characters'
      );
    });

    it('should throw if content is empty', async () => {
      await expect(createAnnouncement('author-1', 'Valid Title', '')).rejects.toThrow(
        'Announcement content cannot be empty'
      );
    });

    it('should throw if content exceeds 5000 characters', async () => {
      const longContent = 'B'.repeat(5001);

      await expect(createAnnouncement('author-1', 'Valid Title', longContent)).rejects.toThrow(
        'Announcement content cannot exceed 5000 characters'
      );
    });
  });
});
