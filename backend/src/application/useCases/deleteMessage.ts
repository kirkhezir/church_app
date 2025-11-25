import { MessageRepository } from '../../infrastructure/database/repositories/messageRepository';

/**
 * DeleteMessage Use Case
 *
 * Soft deletes a message for the requesting user.
 * Messages are only fully deleted when both sender and recipient delete them.
 */

interface DeleteMessageInput {
  messageId: string;
  userId: string;
}

interface DeleteMessageOutput {
  success: boolean;
  message: string;
}

export class DeleteMessage {
  private messageRepository: MessageRepository;

  constructor() {
    this.messageRepository = new MessageRepository();
  }

  /**
   * Execute the delete message use case
   */
  async execute(input: DeleteMessageInput): Promise<DeleteMessageOutput> {
    const { messageId, userId } = input;

    // Find message
    const message = await this.messageRepository.findById(messageId);

    if (!message) {
      throw new Error('Message not found');
    }

    // Check if user is a participant
    if (!message.isParticipant(userId)) {
      throw new Error('Access denied');
    }

    // Soft delete for user
    const updated = await this.messageRepository.softDelete(messageId, userId);

    if (!updated) {
      throw new Error('Failed to delete message');
    }

    return {
      success: true,
      message: 'Message deleted successfully',
    };
  }
}
