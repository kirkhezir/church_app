import { Priority } from '../valueObjects/Priority';

/**
 * Announcement Domain Entity
 *
 * Represents church announcements with priority levels and archiving capability.
 * Business Rules:
 * - Title must be between 3-150 characters
 * - Content cannot exceed 5000 characters
 * - URGENT announcements trigger email notifications
 * - Archived announcements are hidden from main feed but retrievable
 * - Announcements cannot be edited after archiving
 */
export class Announcement {
  private constructor(
    public readonly id: string,
    public title: string,
    public content: string,
    public priority: Priority,
    public readonly authorId: string,
    public readonly publishedAt: Date,
    public archivedAt: Date | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date | null
  ) {
    this.validateTitle(title);
    this.validateContent(content);
  }

  /**
   * Factory method to create a new announcement
   */
  static create(
    id: string,
    title: string,
    content: string,
    priority: Priority,
    authorId: string
  ): Announcement {
    const now = new Date();
    return new Announcement(
      id,
      title,
      content,
      priority,
      authorId,
      now, // publishedAt
      null, // archivedAt
      now, // createdAt
      now, // updatedAt
      null // deletedAt
    );
  }

  /**
   * Factory method to reconstitute announcement from database
   */
  static fromPersistence(data: {
    id: string;
    title: string;
    content: string;
    priority: string;
    authorId: string;
    publishedAt: Date;
    archivedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }): Announcement {
    return new Announcement(
      data.id,
      data.title,
      data.content,
      data.priority as Priority,
      data.authorId,
      data.publishedAt,
      data.archivedAt,
      data.createdAt,
      data.updatedAt,
      data.deletedAt
    );
  }

  /**
   * Validate title length
   */
  private validateTitle(title: string): void {
    if (!title || title.trim().length < 3) {
      throw new Error('Announcement title must be at least 3 characters long');
    }
    if (title.length > 150) {
      throw new Error('Announcement title cannot exceed 150 characters');
    }
  }

  /**
   * Validate content length
   */
  private validateContent(content: string): void {
    if (!content || content.trim().length === 0) {
      throw new Error('Announcement content cannot be empty');
    }
    if (content.length > 5000) {
      throw new Error('Announcement content cannot exceed 5000 characters');
    }
  }

  /**
   * Update announcement details
   * @throws Error if announcement is archived
   */
  updateDetails(title?: string, content?: string, priority?: Priority): void {
    if (this.isArchived()) {
      throw new Error('Cannot update an archived announcement');
    }

    if (title !== undefined) {
      this.validateTitle(title);
      this.title = title;
    }

    if (content !== undefined) {
      this.validateContent(content);
      this.content = content;
    }

    if (priority !== undefined) {
      this.priority = priority;
    }

    this.updatedAt = new Date();
  }

  /**
   * Archive the announcement
   */
  archive(): void {
    if (!this.isArchived()) {
      this.archivedAt = new Date();
      this.updatedAt = new Date();
    }
  }

  /**
   * Unarchive the announcement
   */
  unarchive(): void {
    if (this.isArchived()) {
      this.archivedAt = null;
      this.updatedAt = new Date();
    }
  }

  /**
   * Check if announcement is archived
   */
  isArchived(): boolean {
    return this.archivedAt !== null;
  }

  /**
   * Check if announcement is urgent
   */
  isUrgent(): boolean {
    return this.priority === Priority.URGENT;
  }

  /**
   * Check if announcement is active (not archived and not deleted)
   */
  isActive(): boolean {
    return !this.isArchived() && !this.isDeleted();
  }

  /**
   * Soft delete the announcement
   */
  delete(): void {
    this.deletedAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Check if announcement is deleted
   */
  isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  /**
   * Convert to database format
   */
  toPersistence(): {
    id: string;
    title: string;
    content: string;
    priority: Priority;
    authorId: string;
    publishedAt: Date;
    archivedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  } {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      priority: this.priority,
      authorId: this.authorId,
      publishedAt: this.publishedAt,
      archivedAt: this.archivedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }

  /**
   * Convert to public DTO format (for API responses)
   */
  toPublic(author?: { id: string; firstName: string; lastName: string; email: string }): {
    id: string;
    title: string;
    content: string;
    priority: Priority;
    publishedAt: Date;
    archivedAt: Date | null;
    createdAt: Date;
    author?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  } {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      priority: this.priority,
      publishedAt: this.publishedAt,
      archivedAt: this.archivedAt,
      createdAt: this.createdAt,
      author,
    };
  }
}
