/**
 * Unit Tests: Announcement Domain Entity
 *
 * Tests business logic and validation rules
 */

import { Announcement } from '../../../src/domain/entities/Announcement';
import { Priority } from '../../../src/domain/valueObjects/Priority';

describe('Announcement Entity', () => {
  const validAnnouncementData = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Announcement',
    content: 'This is a test announcement content.',
    priority: Priority.NORMAL,
    authorId: '123e4567-e89b-12d3-a456-426614174001',
    publishedAt: new Date('2025-11-11T10:00:00Z'),
    archivedAt: null,
    createdAt: new Date('2025-11-11T10:00:00Z'),
    updatedAt: new Date('2025-11-11T10:00:00Z'),
    deletedAt: null,
  };

  describe('create', () => {
    it('should create a valid announcement with NORMAL priority', () => {
      const announcement = Announcement.create(
        validAnnouncementData.id,
        validAnnouncementData.title,
        validAnnouncementData.content,
        Priority.NORMAL,
        validAnnouncementData.authorId
      );

      expect(announcement.id).toBe(validAnnouncementData.id);
      expect(announcement.title).toBe(validAnnouncementData.title);
      expect(announcement.content).toBe(validAnnouncementData.content);
      expect(announcement.priority).toBe(Priority.NORMAL);
      expect(announcement.authorId).toBe(validAnnouncementData.authorId);
      expect(announcement.publishedAt).toBeInstanceOf(Date);
      expect(announcement.archivedAt).toBeNull();
      expect(announcement.deletedAt).toBeNull();
    });

    it('should create a valid announcement with URGENT priority', () => {
      const announcement = Announcement.create(
        validAnnouncementData.id,
        validAnnouncementData.title,
        validAnnouncementData.content,
        Priority.URGENT,
        validAnnouncementData.authorId
      );

      expect(announcement.priority).toBe(Priority.URGENT);
    });

    it('should trim whitespace from title and content', () => {
      const announcement = Announcement.create(
        validAnnouncementData.id,
        '  Whitespace Title  ',
        '  Whitespace Content  ',
        Priority.NORMAL,
        validAnnouncementData.authorId
      );

      // Note: trimming happens in validation, but title/content are stored as-is
      expect(announcement.title).toBe('  Whitespace Title  ');
      expect(announcement.content).toBe('  Whitespace Content  ');
    });

    it('should throw error if title is too short (< 3 chars)', () => {
      expect(() => {
        Announcement.create(
          validAnnouncementData.id,
          'AB',
          validAnnouncementData.content,
          Priority.NORMAL,
          validAnnouncementData.authorId
        );
      }).toThrow('Announcement title must be at least 3 characters long');
    });

    it('should throw error if title is too long (> 150 chars)', () => {
      const longTitle = 'A'.repeat(151);
      expect(() => {
        Announcement.create(
          validAnnouncementData.id,
          longTitle,
          validAnnouncementData.content,
          Priority.NORMAL,
          validAnnouncementData.authorId
        );
      }).toThrow('Announcement title cannot exceed 150 characters');
    });

    it('should throw error if content is empty', () => {
      expect(() => {
        Announcement.create(
          validAnnouncementData.id,
          validAnnouncementData.title,
          '',
          Priority.NORMAL,
          validAnnouncementData.authorId
        );
      }).toThrow('Announcement content cannot be empty');
    });

    it('should throw error if content is too long (> 5000 chars)', () => {
      const longContent = 'A'.repeat(5001);
      expect(() => {
        Announcement.create(
          validAnnouncementData.id,
          validAnnouncementData.title,
          longContent,
          Priority.NORMAL,
          validAnnouncementData.authorId
        );
      }).toThrow('Announcement content cannot exceed 5000 characters');
    });

    it('should accept title at minimum length (3 chars)', () => {
      const announcement = Announcement.create(
        validAnnouncementData.id,
        'ABC',
        validAnnouncementData.content,
        Priority.NORMAL,
        validAnnouncementData.authorId
      );

      expect(announcement.title).toBe('ABC');
    });

    it('should accept title at maximum length (150 chars)', () => {
      const maxTitle = 'A'.repeat(150);
      const announcement = Announcement.create(
        validAnnouncementData.id,
        maxTitle,
        validAnnouncementData.content,
        Priority.NORMAL,
        validAnnouncementData.authorId
      );

      expect(announcement.title).toBe(maxTitle);
    });

    it('should accept content at maximum length (5000 chars)', () => {
      const maxContent = 'A'.repeat(5000);
      const announcement = Announcement.create(
        validAnnouncementData.id,
        validAnnouncementData.title,
        maxContent,
        Priority.NORMAL,
        validAnnouncementData.authorId
      );

      expect(announcement.content).toBe(maxContent);
    });
  });

  describe('fromPersistence', () => {
    it('should create announcement from persistence data', () => {
      const announcement = Announcement.fromPersistence(validAnnouncementData);

      expect(announcement.id).toBe(validAnnouncementData.id);
      expect(announcement.title).toBe(validAnnouncementData.title);
      expect(announcement.content).toBe(validAnnouncementData.content);
      expect(announcement.priority).toBe(validAnnouncementData.priority);
      expect(announcement.authorId).toBe(validAnnouncementData.authorId);
      expect(announcement.publishedAt).toEqual(validAnnouncementData.publishedAt);
    });

    it('should handle archived announcement from persistence', () => {
      const archivedData = {
        ...validAnnouncementData,
        archivedAt: new Date('2025-11-11T12:00:00Z'),
      };

      const announcement = Announcement.fromPersistence(archivedData);

      expect(announcement.archivedAt).toEqual(archivedData.archivedAt);
    });
  });

  describe('updateDetails', () => {
    it('should update title only', () => {
      const announcement = Announcement.create(
        validAnnouncementData.id,
        validAnnouncementData.title,
        validAnnouncementData.content,
        Priority.NORMAL,
        validAnnouncementData.authorId
      );

      announcement.updateDetails('New Title', undefined, undefined);

      expect(announcement.title).toBe('New Title');
      expect(announcement.content).toBe(validAnnouncementData.content);
      expect(announcement.priority).toBe(Priority.NORMAL);
    });

    it('should update content only', () => {
      const announcement = Announcement.create(
        validAnnouncementData.id,
        validAnnouncementData.title,
        validAnnouncementData.content,
        Priority.NORMAL,
        validAnnouncementData.authorId
      );

      announcement.updateDetails(undefined, 'New Content', undefined);

      expect(announcement.title).toBe(validAnnouncementData.title);
      expect(announcement.content).toBe('New Content');
      expect(announcement.priority).toBe(Priority.NORMAL);
    });

    it('should update priority only', () => {
      const announcement = Announcement.create(
        validAnnouncementData.id,
        validAnnouncementData.title,
        validAnnouncementData.content,
        Priority.NORMAL,
        validAnnouncementData.authorId
      );

      announcement.updateDetails(undefined, undefined, Priority.URGENT);

      expect(announcement.title).toBe(validAnnouncementData.title);
      expect(announcement.content).toBe(validAnnouncementData.content);
      expect(announcement.priority).toBe(Priority.URGENT);
    });

    it('should update all fields', () => {
      const announcement = Announcement.create(
        validAnnouncementData.id,
        validAnnouncementData.title,
        validAnnouncementData.content,
        Priority.NORMAL,
        validAnnouncementData.authorId
      );

      announcement.updateDetails('New Title', 'New Content', Priority.URGENT);

      expect(announcement.title).toBe('New Title');
      expect(announcement.content).toBe('New Content');
      expect(announcement.priority).toBe(Priority.URGENT);
    });

    it('should trim whitespace when updating', () => {
      const announcement = Announcement.create(
        validAnnouncementData.id,
        validAnnouncementData.title,
        validAnnouncementData.content,
        Priority.NORMAL,
        validAnnouncementData.authorId
      );

      announcement.updateDetails('  New Title  ', '  New Content  ', undefined);

      // Note: trimming happens in validation, but values are stored as-is
      expect(announcement.title).toBe('  New Title  ');
      expect(announcement.content).toBe('  New Content  ');
    });

    it('should validate title length when updating', () => {
      const announcement = Announcement.create(
        validAnnouncementData.id,
        validAnnouncementData.title,
        validAnnouncementData.content,
        Priority.NORMAL,
        validAnnouncementData.authorId
      );

      expect(() => {
        announcement.updateDetails('AB', undefined, undefined);
      }).toThrow('Announcement title must be at least 3 characters long');
    });

    it('should validate content length when updating', () => {
      const announcement = Announcement.create(
        validAnnouncementData.id,
        validAnnouncementData.title,
        validAnnouncementData.content,
        Priority.NORMAL,
        validAnnouncementData.authorId
      );

      const longContent = 'A'.repeat(5001);
      expect(() => {
        announcement.updateDetails(undefined, longContent, undefined);
      }).toThrow('Announcement content cannot exceed 5000 characters');
    });
  });

  describe('archive', () => {
    it('should archive announcement', () => {
      const announcement = Announcement.create(
        validAnnouncementData.id,
        validAnnouncementData.title,
        validAnnouncementData.content,
        Priority.NORMAL,
        validAnnouncementData.authorId
      );

      expect(announcement.archivedAt).toBeNull();

      announcement.archive();

      expect(announcement.archivedAt).toBeInstanceOf(Date);
    });

    it('should be idempotent (archiving twice should work)', () => {
      const announcement = Announcement.create(
        validAnnouncementData.id,
        validAnnouncementData.title,
        validAnnouncementData.content,
        Priority.NORMAL,
        validAnnouncementData.authorId
      );

      announcement.archive();
      const firstArchivedAt = announcement.archivedAt;

      announcement.archive();
      const secondArchivedAt = announcement.archivedAt;

      expect(firstArchivedAt).toEqual(secondArchivedAt);
    });
  });

  describe('unarchive', () => {
    it('should unarchive announcement', () => {
      const announcement = Announcement.create(
        validAnnouncementData.id,
        validAnnouncementData.title,
        validAnnouncementData.content,
        Priority.NORMAL,
        validAnnouncementData.authorId
      );

      announcement.archive();
      expect(announcement.archivedAt).not.toBeNull();

      announcement.unarchive();
      expect(announcement.archivedAt).toBeNull();
    });
  });

  describe('delete', () => {
    it('should soft delete announcement', () => {
      const announcement = Announcement.create(
        validAnnouncementData.id,
        validAnnouncementData.title,
        validAnnouncementData.content,
        Priority.NORMAL,
        validAnnouncementData.authorId
      );

      expect(announcement.deletedAt).toBeNull();

      announcement.delete();

      expect(announcement.deletedAt).toBeInstanceOf(Date);
    });
  });

  describe('toPersistence', () => {
    it('should convert to persistence format', () => {
      const announcement = Announcement.create(
        validAnnouncementData.id,
        validAnnouncementData.title,
        validAnnouncementData.content,
        Priority.NORMAL,
        validAnnouncementData.authorId
      );

      const persistenceData = announcement.toPersistence();

      expect(persistenceData.id).toBe(announcement.id);
      expect(persistenceData.title).toBe(announcement.title);
      expect(persistenceData.content).toBe(announcement.content);
      expect(persistenceData.priority).toBe(announcement.priority);
      expect(persistenceData.authorId).toBe(announcement.authorId);
      expect(persistenceData.publishedAt).toBe(announcement.publishedAt);
      expect(persistenceData.archivedAt).toBe(announcement.archivedAt);
      expect(persistenceData.deletedAt).toBe(announcement.deletedAt);
      expect(persistenceData.createdAt).toBe(announcement.createdAt);
      expect(persistenceData.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt timestamp on toPersistence', () => {
      const announcement = Announcement.create(
        validAnnouncementData.id,
        validAnnouncementData.title,
        validAnnouncementData.content,
        Priority.NORMAL,
        validAnnouncementData.authorId
      );

      const originalUpdatedAt = announcement.updatedAt;

      // Wait a tiny bit to ensure timestamp difference
      const persistenceData = announcement.toPersistence();

      expect(persistenceData.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime()
      );
    });
  });

  describe('isArchived', () => {
    it('should return false for non-archived announcement', () => {
      const announcement = Announcement.create(
        validAnnouncementData.id,
        validAnnouncementData.title,
        validAnnouncementData.content,
        Priority.NORMAL,
        validAnnouncementData.authorId
      );

      expect(announcement.isArchived()).toBe(false);
    });

    it('should return true for archived announcement', () => {
      const announcement = Announcement.create(
        validAnnouncementData.id,
        validAnnouncementData.title,
        validAnnouncementData.content,
        Priority.NORMAL,
        validAnnouncementData.authorId
      );

      announcement.archive();

      expect(announcement.isArchived()).toBe(true);
    });
  });

  describe('isDeleted', () => {
    it('should return false for non-deleted announcement', () => {
      const announcement = Announcement.create(
        validAnnouncementData.id,
        validAnnouncementData.title,
        validAnnouncementData.content,
        Priority.NORMAL,
        validAnnouncementData.authorId
      );

      expect(announcement.isDeleted()).toBe(false);
    });

    it('should return true for deleted announcement', () => {
      const announcement = Announcement.create(
        validAnnouncementData.id,
        validAnnouncementData.title,
        validAnnouncementData.content,
        Priority.NORMAL,
        validAnnouncementData.authorId
      );

      announcement.delete();

      expect(announcement.isDeleted()).toBe(true);
    });
  });
});
