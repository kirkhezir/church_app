import { Message } from '../entities/Message';

/**
 * Repository interface for Message entity
 * Follows dependency inversion principle - domain defines interface, infrastructure implements
 */
export interface IMessageRepository {
  /**
   * Find message by ID
   */
  findById(id: string): Promise<Message | null>;

  /**
   * Find inbox messages for a user (received messages)
   */
  findInbox(
    userId: string,
    options?: {
      unreadOnly?: boolean;
      skip?: number;
      take?: number;
    }
  ): Promise<Message[]>;

  /**
   * Find sent messages for a user
   */
  findSent(
    userId: string,
    options?: {
      skip?: number;
      take?: number;
    }
  ): Promise<Message[]>;

  /**
   * Count inbox messages for a user
   */
  countInbox(userId: string, unreadOnly?: boolean): Promise<number>;

  /**
   * Count sent messages for a user
   */
  countSent(userId: string): Promise<number>;

  /**
   * Count unread messages for a user
   */
  countUnread(userId: string): Promise<number>;

  /**
   * Create new message
   */
  create(message: Message): Promise<Message>;

  /**
   * Update message (for marking read, soft delete)
   */
  update(message: Message): Promise<Message>;

  /**
   * Mark message as read
   */
  markAsRead(id: string): Promise<Message | null>;

  /**
   * Soft delete message for user
   * @param id - Message ID
   * @param userId - User ID requesting deletion
   */
  softDelete(id: string, userId: string): Promise<Message | null>;
}
