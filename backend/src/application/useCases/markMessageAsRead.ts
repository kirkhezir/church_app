import { MessageRepository } from '../../infrastructure/database/repositories/messageRepository';

/**
 * MarkMessageAsRead Use Case
 *
 * Marks a message as read. Only the recipient can mark messages as read.
 */

interface MarkMessageAsReadInput {
  messageId: string;
  userId: string;
}

interface MarkMessageAsReadOutput {
  id: string;
  isRead: boolean;
  readAt: Date | null;
}

export class MarkMessageAsRead {
  private messageRepository: MessageRepository;

  constructor() {
    this.messageRepository = new MessageRepository();
  }

  /**
   * Execute the mark message as read use case
   */
  async execute(input: MarkMessageAsReadInput): Promise<MarkMessageAsReadOutput> {
    const { messageId, userId } = input;

    // Find message
    const message = await this.messageRepository.findById(messageId);

    if (!message) {
      throw new Error('Message not found');
    }

    // Only recipient can mark as read
    if (!message.isRecipient(userId)) {
      throw new Error('Access denied');
    }

    // Mark as read
    const updated = await this.messageRepository.markAsRead(messageId);

    if (!updated) {
      throw new Error('Failed to mark message as read');
    }

    return {
      id: updated.id,
      isRead: updated.isRead,
      readAt: updated.readAt || null,
    };
  }
}
