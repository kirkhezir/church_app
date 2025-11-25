import { MessageRepository } from '../../infrastructure/database/repositories/messageRepository';

/**
 * GetMessageById Use Case
 *
 * Returns a specific message by ID.
 * Automatically marks the message as read when viewed by recipient.
 */

interface GetMessageByIdInput {
  messageId: string;
  userId: string;
}

interface GetMessageByIdOutput {
  id: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
  };
  recipient: {
    id: string;
    firstName: string;
    lastName: string;
  };
  subject: string;
  body: string;
  isRead: boolean;
  readAt: Date | null;
  sentAt: Date;
}

export class GetMessageById {
  private messageRepository: MessageRepository;

  constructor() {
    this.messageRepository = new MessageRepository();
  }

  /**
   * Execute the get message by id use case
   */
  async execute(input: GetMessageByIdInput): Promise<GetMessageByIdOutput | null> {
    const { messageId, userId } = input;

    // Find message with participants
    const result = await this.messageRepository.findByIdWithParticipants(messageId);

    if (!result) {
      return null;
    }

    const { message, sender, recipient } = result;

    // Check if user is a participant
    if (!message.isParticipant(userId)) {
      throw new Error('Access denied');
    }

    // Check if message is deleted for this user
    if (message.isDeletedFor(userId)) {
      return null;
    }

    // Auto-mark as read if viewer is recipient
    if (message.isRecipient(userId) && !message.isRead) {
      await this.messageRepository.markAsRead(messageId);
      message.markAsRead();
    }

    return {
      id: message.id,
      sender: {
        id: sender.id,
        firstName: sender.firstName,
        lastName: sender.lastName,
      },
      recipient: {
        id: recipient.id,
        firstName: recipient.firstName,
        lastName: recipient.lastName,
      },
      subject: message.subject,
      body: message.body,
      isRead: message.isRead,
      readAt: message.readAt || null,
      sentAt: message.sentAt,
    };
  }
}
