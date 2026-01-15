import { messages as PrismaMessage } from '@prisma/client';
import prisma from '../prismaClient';
import { IMessageRepository } from '../../../domain/interfaces/IMessageRepository';
import { Message } from '../../../domain/entities/Message';

/**
 * Message Repository Implementation
 * Implements repository interface using Prisma ORM
 */
export class MessageRepository implements IMessageRepository {
  /**
   * Convert Prisma message to Domain Message entity
   */
  private toDomain(prismaMessage: PrismaMessage): Message {
    return new Message(
      prismaMessage.id,
      prismaMessage.senderId,
      prismaMessage.recipientId,
      prismaMessage.subject,
      prismaMessage.body,
      prismaMessage.isRead,
      prismaMessage.readAt || undefined,
      prismaMessage.sentAt,
      prismaMessage.deletedBySender,
      prismaMessage.deletedByRecipient
    );
  }

  /**
   * Find message by ID
   */
  async findById(id: string): Promise<Message | null> {
    const message = await prisma.messages.findUnique({
      where: { id },
    });

    return message ? this.toDomain(message) : null;
  }

  /**
   * Find inbox messages for a user (received messages not deleted by recipient)
   */
  async findInbox(
    userId: string,
    options?: {
      unreadOnly?: boolean;
      skip?: number;
      take?: number;
    }
  ): Promise<Message[]> {
    const { unreadOnly = false, skip = 0, take = 20 } = options || {};

    const messages = await prisma.messages.findMany({
      where: {
        recipientId: userId,
        deletedByRecipient: false,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: { sentAt: 'desc' },
      skip,
      take,
    });

    return messages.map((m: PrismaMessage) => this.toDomain(m));
  }

  /**
   * Find sent messages for a user (sent messages not deleted by sender)
   */
  async findSent(
    userId: string,
    options?: {
      skip?: number;
      take?: number;
    }
  ): Promise<Message[]> {
    const { skip = 0, take = 20 } = options || {};

    const messages = await prisma.messages.findMany({
      where: {
        senderId: userId,
        deletedBySender: false,
      },
      orderBy: { sentAt: 'desc' },
      skip,
      take,
    });

    return messages.map((m: PrismaMessage) => this.toDomain(m));
  }

  /**
   * Count inbox messages for a user
   */
  async countInbox(userId: string, unreadOnly?: boolean): Promise<number> {
    return prisma.messages.count({
      where: {
        recipientId: userId,
        deletedByRecipient: false,
        ...(unreadOnly ? { isRead: false } : {}),
      },
    });
  }

  /**
   * Count sent messages for a user
   */
  async countSent(userId: string): Promise<number> {
    return prisma.messages.count({
      where: {
        senderId: userId,
        deletedBySender: false,
      },
    });
  }

  /**
   * Count unread messages for a user
   */
  async countUnread(userId: string): Promise<number> {
    return prisma.messages.count({
      where: {
        recipientId: userId,
        deletedByRecipient: false,
        isRead: false,
      },
    });
  }

  /**
   * Create new message
   */
  async create(message: Message): Promise<Message> {
    const created = await prisma.messages.create({
      data: {
        id: message.id,
        senderId: message.senderId,
        recipientId: message.recipientId,
        subject: message.subject,
        body: message.body,
        isRead: message.isRead,
        readAt: message.readAt,
        sentAt: message.sentAt,
        deletedBySender: message.deletedBySender,
        deletedByRecipient: message.deletedByRecipient,
      },
    });

    return this.toDomain(created);
  }

  /**
   * Update message
   */
  async update(message: Message): Promise<Message> {
    const updated = await prisma.messages.update({
      where: { id: message.id },
      data: {
        isRead: message.isRead,
        readAt: message.readAt,
        deletedBySender: message.deletedBySender,
        deletedByRecipient: message.deletedByRecipient,
      },
    });

    return this.toDomain(updated);
  }

  /**
   * Mark message as read
   */
  async markAsRead(id: string): Promise<Message | null> {
    const message = await prisma.messages.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return message ? this.toDomain(message) : null;
  }

  /**
   * Soft delete message for user
   */
  async softDelete(id: string, userId: string): Promise<Message | null> {
    const message = await prisma.messages.findUnique({
      where: { id },
    });

    if (!message) {
      return null;
    }

    const updateData: { deletedBySender?: boolean; deletedByRecipient?: boolean } = {};

    if (message.senderId === userId) {
      updateData.deletedBySender = true;
    }
    if (message.recipientId === userId) {
      updateData.deletedByRecipient = true;
    }

    if (Object.keys(updateData).length === 0) {
      return null; // User is not a participant
    }

    const updated = await prisma.messages.update({
      where: { id },
      data: updateData,
    });

    return this.toDomain(updated);
  }

  /**
   * Find message with sender and recipient details
   */
  async findByIdWithParticipants(id: string): Promise<{
    message: Message;
    sender: { id: string; firstName: string; lastName: string };
    recipient: { id: string; firstName: string; lastName: string };
  } | null> {
    const result = await prisma.messages.findUnique({
      where: { id },
      include: {
        members_messages_senderIdTomembers: {
          select: { id: true, firstName: true, lastName: true },
        },
        members_messages_recipientIdTomembers: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    if (!result) {
      return null;
    }

    return {
      message: this.toDomain(result),
      sender: result.members_messages_senderIdTomembers,
      recipient: result.members_messages_recipientIdTomembers,
    };
  }

  /**
   * Find inbox messages with sender details
   */
  async findInboxWithSenders(
    userId: string,
    options?: {
      unreadOnly?: boolean;
      skip?: number;
      take?: number;
    }
  ): Promise<
    Array<{
      message: Message;
      sender: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string | null;
        privacySettings: { showPhone: boolean; showEmail: boolean; showAddress: boolean };
      };
    }>
  > {
    const { unreadOnly = false, skip = 0, take = 20 } = options || {};

    const messages = await prisma.messages.findMany({
      where: {
        recipientId: userId,
        deletedByRecipient: false,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      include: {
        members_messages_senderIdTomembers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            privacySettings: true,
          },
        },
      },
      orderBy: { sentAt: 'desc' },
      skip,
      take,
    });

    return messages.map((m: (typeof messages)[0]) => ({
      message: this.toDomain(m),
      sender: {
        id: m.members_messages_senderIdTomembers.id,
        firstName: m.members_messages_senderIdTomembers.firstName,
        lastName: m.members_messages_senderIdTomembers.lastName,
        email: m.members_messages_senderIdTomembers.email,
        phone: m.members_messages_senderIdTomembers.phone,
        privacySettings: m.members_messages_senderIdTomembers.privacySettings as {
          showPhone: boolean;
          showEmail: boolean;
          showAddress: boolean;
        },
      },
    }));
  }

  /**
   * Find sent messages with recipient details
   */
  async findSentWithRecipients(
    userId: string,
    options?: {
      skip?: number;
      take?: number;
    }
  ): Promise<
    Array<{
      message: Message;
      recipient: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string | null;
        privacySettings: { showPhone: boolean; showEmail: boolean; showAddress: boolean };
      };
    }>
  > {
    const { skip = 0, take = 20 } = options || {};

    const messages = await prisma.messages.findMany({
      where: {
        senderId: userId,
        deletedBySender: false,
      },
      include: {
        members_messages_recipientIdTomembers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            privacySettings: true,
          },
        },
      },
      orderBy: { sentAt: 'desc' },
      skip,
      take,
    });

    return messages.map((m: (typeof messages)[0]) => ({
      message: this.toDomain(m),
      recipient: {
        id: m.members_messages_recipientIdTomembers.id,
        firstName: m.members_messages_recipientIdTomembers.firstName,
        lastName: m.members_messages_recipientIdTomembers.lastName,
        email: m.members_messages_recipientIdTomembers.email,
        phone: m.members_messages_recipientIdTomembers.phone,
        privacySettings: m.members_messages_recipientIdTomembers.privacySettings as {
          showPhone: boolean;
          showEmail: boolean;
          showAddress: boolean;
        },
      },
    }));
  }
}
