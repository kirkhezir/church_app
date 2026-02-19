/**
 * Unit Tests for SendMessage Use Case
 *
 * Tests internal messaging functionality:
 * - Successful message sending between members
 * - Sender/recipient validation
 * - Message entity validation (subject length, body required, self-send)
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

// Use manual mock approach: define mock fn, then mock module with auto-mock,
// then override the prototype after import.

// Mock prisma before importing the use case
const mockFindFirst = jest.fn();
jest.mock('../../../src/infrastructure/database/prismaClient', () => ({
  __esModule: true,
  default: {
    member: {
      findFirst: mockFindFirst,
    },
  },
}));

// Auto-mock the repository module
jest.mock('../../../src/infrastructure/database/repositories/messageRepository');

import { SendMessage } from '../../../src/application/useCases/sendMessage';
import { MessageRepository } from '../../../src/infrastructure/database/repositories/messageRepository';

// Get the mock constructor and set up the create method on its prototype
const MockMessageRepository = MessageRepository as jest.MockedClass<typeof MessageRepository>;
MockMessageRepository.prototype.create = jest.fn().mockResolvedValue(undefined);

describe('SendMessage Use Case', () => {
  let sendMessage: SendMessage;

  const sender = {
    id: 'sender-1',
    firstName: 'John',
    lastName: 'Doe',
  };

  const recipient = {
    id: 'recipient-1',
    firstName: 'Jane',
    lastName: 'Smith',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    sendMessage = new SendMessage();

    // Default: both sender and recipient exist
    mockFindFirst.mockImplementation(async ({ where }: any) => {
      if (where.id === 'sender-1') return sender;
      if (where.id === 'recipient-1') return recipient;
      return null;
    });
  });

  describe('successful message sending', () => {
    it('should send a message and return enriched output', async () => {
      const result = await sendMessage.execute({
        senderId: 'sender-1',
        recipientId: 'recipient-1',
        subject: 'Hello!',
        body: 'How are you?',
      });

      expect(result.sender.id).toBe('sender-1');
      expect(result.sender.firstName).toBe('John');
      expect(result.recipient.id).toBe('recipient-1');
      expect(result.recipient.firstName).toBe('Jane');
      expect(result.subject).toBe('Hello!');
      expect(result.body).toBe('How are you?');
      expect(result.isRead).toBe(false);
      expect(result.readAt).toBeNull();
      expect(result.sentAt).toBeInstanceOf(Date);
    });

    it('should validate sender and recipient exist', async () => {
      await sendMessage.execute({
        senderId: 'sender-1',
        recipientId: 'recipient-1',
        subject: 'Test',
        body: 'Test body',
      });

      expect(mockFindFirst).toHaveBeenCalledTimes(2);
      expect(mockFindFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id: 'sender-1' }),
        })
      );
    });
  });

  describe('validation errors', () => {
    it('should throw if sender not found', async () => {
      mockFindFirst.mockImplementation(async ({ where }: any) => {
        if (where.id === 'sender-1') return null;
        return recipient;
      });

      await expect(
        sendMessage.execute({
          senderId: 'sender-1',
          recipientId: 'recipient-1',
          subject: 'Hello',
          body: 'Body text',
        })
      ).rejects.toThrow('Sender not found');
    });

    it('should throw if recipient not found', async () => {
      mockFindFirst.mockImplementation(async ({ where }: any) => {
        if (where.id === 'sender-1') return sender;
        return null;
      });

      await expect(
        sendMessage.execute({
          senderId: 'sender-1',
          recipientId: 'recipient-1',
          subject: 'Hello',
          body: 'Body text',
        })
      ).rejects.toThrow('Recipient not found');
    });

    it('should throw if sending to yourself', async () => {
      mockFindFirst.mockResolvedValue(sender);

      await expect(
        sendMessage.execute({
          senderId: 'sender-1',
          recipientId: 'sender-1',
          subject: 'Hello self',
          body: 'This should fail',
        })
      ).rejects.toThrow('Cannot send message to yourself');
    });

    it('should throw if subject is too short', async () => {
      await expect(
        sendMessage.execute({
          senderId: 'sender-1',
          recipientId: 'recipient-1',
          subject: 'Hi',
          body: 'Body text',
        })
      ).rejects.toThrow('Subject must be at least 3 characters');
    });

    it('should throw if body is empty', async () => {
      await expect(
        sendMessage.execute({
          senderId: 'sender-1',
          recipientId: 'recipient-1',
          subject: 'Valid Subject',
          body: '',
        })
      ).rejects.toThrow('Message body is required');
    });
  });
});
