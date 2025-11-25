/**
 * Message Domain Entity
 *
 * Represents an internal message between church members.
 * Supports soft deletion for both sender and recipient.
 */
export class Message {
  constructor(
    public readonly id: string,
    public readonly senderId: string,
    public readonly recipientId: string,
    public subject: string,
    public body: string,
    public isRead: boolean = false,
    public readAt: Date | undefined = undefined,
    public readonly sentAt: Date = new Date(),
    public deletedBySender: boolean = false,
    public deletedByRecipient: boolean = false
  ) {
    this.validate();
  }

  /**
   * Validate message data
   */
  private validate(): void {
    if (!this.senderId) {
      throw new Error('Sender ID is required');
    }

    if (!this.recipientId) {
      throw new Error('Recipient ID is required');
    }

    if (this.senderId === this.recipientId) {
      throw new Error('Cannot send message to yourself');
    }

    if (!this.subject || this.subject.trim().length < 3) {
      throw new Error('Subject must be at least 3 characters');
    }

    if (this.subject.length > 100) {
      throw new Error('Subject must not exceed 100 characters');
    }

    if (!this.body || this.body.trim().length === 0) {
      throw new Error('Message body is required');
    }

    if (this.body.length > 2000) {
      throw new Error('Message body must not exceed 2000 characters');
    }
  }

  /**
   * Mark message as read
   */
  markAsRead(): void {
    if (!this.isRead) {
      this.isRead = true;
      this.readAt = new Date();
    }
  }

  /**
   * Mark message as unread
   */
  markAsUnread(): void {
    this.isRead = false;
    this.readAt = undefined;
  }

  /**
   * Soft delete message for sender
   */
  deleteForSender(): void {
    this.deletedBySender = true;
  }

  /**
   * Soft delete message for recipient
   */
  deleteForRecipient(): void {
    this.deletedByRecipient = true;
  }

  /**
   * Check if message is deleted for a specific user
   */
  isDeletedFor(userId: string): boolean {
    if (userId === this.senderId) {
      return this.deletedBySender;
    }
    if (userId === this.recipientId) {
      return this.deletedByRecipient;
    }
    return false;
  }

  /**
   * Check if message is completely deleted (by both parties)
   */
  isFullyDeleted(): boolean {
    return this.deletedBySender && this.deletedByRecipient;
  }

  /**
   * Check if user is a participant in this message
   */
  isParticipant(userId: string): boolean {
    return userId === this.senderId || userId === this.recipientId;
  }

  /**
   * Check if user is the sender
   */
  isSender(userId: string): boolean {
    return userId === this.senderId;
  }

  /**
   * Check if user is the recipient
   */
  isRecipient(userId: string): boolean {
    return userId === this.recipientId;
  }

  /**
   * Get a preview of the message body (first 100 characters)
   */
  get bodyPreview(): string {
    if (this.body.length <= 100) {
      return this.body;
    }
    return this.body.substring(0, 97) + '...';
  }

  /**
   * Create a new Message instance
   */
  static create(
    id: string,
    senderId: string,
    recipientId: string,
    subject: string,
    body: string
  ): Message {
    return new Message(
      id,
      senderId,
      recipientId,
      subject.trim(),
      body.trim(),
      false,
      undefined,
      new Date(),
      false,
      false
    );
  }
}
