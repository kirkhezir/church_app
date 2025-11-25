import { MessageRepository } from '../../infrastructure/database/repositories/messageRepository';

/**
 * GetMessages Use Case
 *
 * Returns inbox or sent messages for a member with pagination.
 */

interface GetMessagesInput {
  userId: string;
  folder: 'inbox' | 'sent';
  unreadOnly?: boolean;
  page?: number;
  limit?: number;
}

interface MessageItem {
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

interface GetMessagesOutput {
  data: MessageItem[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

export class GetMessages {
  private messageRepository: MessageRepository;

  constructor() {
    this.messageRepository = new MessageRepository();
  }

  /**
   * Execute the get messages use case
   */
  async execute(input: GetMessagesInput): Promise<GetMessagesOutput> {
    const { userId, folder, unreadOnly = false, page = 1, limit = 20 } = input;
    const skip = (page - 1) * limit;

    let data: MessageItem[] = [];
    let totalItems = 0;

    if (folder === 'inbox') {
      const messages = await this.messageRepository.findInboxWithSenders(userId, {
        unreadOnly,
        skip,
        take: limit,
      });

      totalItems = await this.messageRepository.countInbox(userId, unreadOnly);

      data = messages.map(({ message, sender }) => ({
        id: message.id,
        sender: {
          id: sender.id,
          firstName: sender.firstName,
          lastName: sender.lastName,
        },
        recipient: {
          id: userId,
          firstName: '', // Will be filled by controller with user's own info
          lastName: '',
        },
        subject: message.subject,
        body: message.body,
        isRead: message.isRead,
        readAt: message.readAt || null,
        sentAt: message.sentAt,
      }));
    } else {
      const messages = await this.messageRepository.findSentWithRecipients(userId, {
        skip,
        take: limit,
      });

      totalItems = await this.messageRepository.countSent(userId);

      data = messages.map(({ message, recipient }) => ({
        id: message.id,
        sender: {
          id: userId,
          firstName: '', // Will be filled by controller with user's own info
          lastName: '',
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
      }));
    }

    return {
      data,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
      },
    };
  }
}
