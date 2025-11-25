import { v4 as uuidv4 } from 'uuid';
import { Message } from '../../domain/entities/Message';
import { MessageRepository } from '../../infrastructure/database/repositories/messageRepository';
import prisma from '../../infrastructure/database/prismaClient';

/**
 * SendMessage Use Case
 *
 * Allows members to send internal messages to other members.
 */

interface SendMessageInput {
  senderId: string;
  recipientId: string;
  subject: string;
  body: string;
}

interface SendMessageOutput {
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

export class SendMessage {
  private messageRepository: MessageRepository;

  constructor() {
    this.messageRepository = new MessageRepository();
  }

  /**
   * Execute the send message use case
   */
  async execute(input: SendMessageInput): Promise<SendMessageOutput> {
    const { senderId, recipientId, subject, body } = input;

    // Validate sender exists
    const sender = await prisma.member.findFirst({
      where: { id: senderId, deletedAt: null },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!sender) {
      throw new Error('Sender not found');
    }

    // Validate recipient exists
    const recipient = await prisma.member.findFirst({
      where: { id: recipientId, deletedAt: null },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!recipient) {
      throw new Error('Recipient not found');
    }

    // Create message entity (includes validation)
    const message = Message.create(uuidv4(), senderId, recipientId, subject, body);

    // Persist message
    await this.messageRepository.create(message);

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
