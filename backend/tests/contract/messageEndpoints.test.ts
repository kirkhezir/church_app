/**
 * Contract Tests: Message Endpoints
 *
 * Validates that message endpoints match OpenAPI specification:
 * - POST /api/v1/messages (send message)
 * - GET /api/v1/messages (list messages - inbox/sent)
 * - GET /api/v1/messages/:id (get message details)
 * - PATCH /api/v1/messages/:id/read (mark as read)
 * - DELETE /api/v1/messages/:id (soft delete)
 *
 * RED PHASE: These tests should FAIL until implementation is complete
 */

import request from 'supertest';
import { Server } from '../../src/presentation/server';
import prisma from '../../src/infrastructure/database/prismaClient';
import { PasswordService } from '../../src/infrastructure/auth/passwordService';
import { JWTService } from '../../src/infrastructure/auth/jwtService';

const passwordService = new PasswordService();
const jwtService = new JWTService();
const server = new Server();
const app = server.app;

describe('Contract Tests: Message Endpoints', () => {
  let testMemberIds: string[] = [];
  let testMessageIds: string[] = [];
  let member1Token: string;
  let member2Token: string;
  let member3Token: string;
  let member1Id: string;
  let member2Id: string;
  let member3Id: string;

  /**
   * Helper to create a test member
   */
  async function createTestMember(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<string> {
    const hashedPassword = await passwordService.hash(password);
    const member = await prisma.member.create({
      data: {
        email,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        role: 'MEMBER',
        phone: '+1234567890',
        membershipDate: new Date(),
        privacySettings: { showPhone: true, showEmail: true, showAddress: true },
        failedLoginAttempts: 0,
      },
    });
    testMemberIds.push(member.id);
    return member.id;
  }

  /**
   * Helper to create a test message
   */
  async function createTestMessage(
    senderId: string,
    recipientId: string,
    subject: string,
    body: string,
    isRead: boolean = false
  ): Promise<string> {
    const message = await prisma.message.create({
      data: {
        senderId,
        recipientId,
        subject,
        body,
        isRead,
        readAt: isRead ? new Date() : null,
      },
    });
    testMessageIds.push(message.id);
    return message.id;
  }

  beforeAll(async () => {
    console.log('🔧 Message Endpoints Tests: beforeAll started');

    // Clean up any existing test data
    await prisma.message.deleteMany({
      where: {
        OR: [
          { sender: { email: { contains: '@message-test.com' } } },
          { recipient: { email: { contains: '@message-test.com' } } },
        ],
      },
    });
    await prisma.member.deleteMany({
      where: { email: { contains: '@message-test.com' } },
    });

    // Create test members
    member1Id = await createTestMember(
      'member1@message-test.com',
      'Member1Password123!',
      'Alice',
      'Johnson'
    );
    member1Token = jwtService.generateAccessToken({
      userId: member1Id,
      email: 'member1@message-test.com',
      role: 'MEMBER',
    });

    member2Id = await createTestMember(
      'member2@message-test.com',
      'Member2Password123!',
      'Bob',
      'Williams'
    );
    member2Token = jwtService.generateAccessToken({
      userId: member2Id,
      email: 'member2@message-test.com',
      role: 'MEMBER',
    });

    member3Id = await createTestMember(
      'member3@message-test.com',
      'Member3Password123!',
      'Charlie',
      'Brown'
    );
    member3Token = jwtService.generateAccessToken({
      userId: member3Id,
      email: 'member3@message-test.com',
      role: 'MEMBER',
    });

    // Create some test messages
    await createTestMessage(
      member1Id,
      member2Id,
      'Hello Bob!',
      'This is a test message from Alice to Bob.'
    );
    await createTestMessage(
      member2Id,
      member1Id,
      'Re: Hello Bob!',
      'Thanks for your message, Alice!',
      true
    );
    await createTestMessage(
      member3Id,
      member1Id,
      'Church Event',
      'Are you coming to the event this weekend?'
    );

    console.log('✅ Test data created');
  });

  afterAll(async () => {
    console.log('🧹 Cleaning up test data...');

    // Clean up in reverse order
    await prisma.message.deleteMany({
      where: { id: { in: testMessageIds } },
    });
    await prisma.member.deleteMany({
      where: { id: { in: testMemberIds } },
    });

    await prisma.$disconnect();
    console.log('✅ Cleanup complete');
  });

  // ===================================================================
  // POST /api/v1/messages - Send Message
  // ===================================================================

  describe('POST /api/v1/messages - Send Message', () => {
    it('should return 401 if not authenticated', async () => {
      const response = await request(app).post('/api/v1/messages').send({
        recipientId: member2Id,
        subject: 'Test Subject',
        body: 'Test message body',
      });

      expect(response.status).toBe(401);
    });

    it('should send a message successfully', async () => {
      const response = await request(app)
        .post('/api/v1/messages')
        .set('Authorization', `Bearer ${member1Token}`)
        .send({
          recipientId: member2Id,
          subject: 'New Test Message',
          body: 'This is a new test message from Alice.',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('subject', 'New Test Message');
      expect(response.body).toHaveProperty('body', 'This is a new test message from Alice.');
      expect(response.body).toHaveProperty('sender');
      expect(response.body).toHaveProperty('recipient');
      expect(response.body.sender.id).toBe(member1Id);
      expect(response.body.recipient.id).toBe(member2Id);
      expect(response.body.isRead).toBe(false);

      // Clean up
      if (response.body.id) {
        testMessageIds.push(response.body.id);
      }
    });

    it('should return 400 if recipientId is missing', async () => {
      const response = await request(app)
        .post('/api/v1/messages')
        .set('Authorization', `Bearer ${member1Token}`)
        .send({
          subject: 'Test Subject',
          body: 'Test message body',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 if subject is too short', async () => {
      const response = await request(app)
        .post('/api/v1/messages')
        .set('Authorization', `Bearer ${member1Token}`)
        .send({
          recipientId: member2Id,
          subject: 'Hi', // Less than 3 characters
          body: 'Test message body',
        });

      expect(response.status).toBe(400);
    });

    it('should return 404 if recipient does not exist', async () => {
      const response = await request(app)
        .post('/api/v1/messages')
        .set('Authorization', `Bearer ${member1Token}`)
        .send({
          recipientId: '00000000-0000-0000-0000-000000000000',
          subject: 'Test Subject',
          body: 'Test message body',
        });

      expect(response.status).toBe(404);
    });

    it('should not allow sending message to self', async () => {
      const response = await request(app)
        .post('/api/v1/messages')
        .set('Authorization', `Bearer ${member1Token}`)
        .send({
          recipientId: member1Id,
          subject: 'Message to myself',
          body: 'This should not be allowed.',
        });

      expect(response.status).toBe(400);
    });
  });

  // ===================================================================
  // GET /api/v1/messages - List Messages (Inbox/Sent)
  // ===================================================================

  describe('GET /api/v1/messages - List Messages', () => {
    it('should return 401 if not authenticated', async () => {
      const response = await request(app).get('/api/v1/messages');

      expect(response.status).toBe(401);
    });

    it('should return inbox messages by default', async () => {
      const response = await request(app)
        .get('/api/v1/messages')
        .set('Authorization', `Bearer ${member1Token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);

      // All messages should be received by member1
      response.body.data.forEach((msg: any) => {
        expect(msg.recipient.id).toBe(member1Id);
      });
    });

    it('should return sent messages when folder=sent', async () => {
      const response = await request(app)
        .get('/api/v1/messages?folder=sent')
        .set('Authorization', `Bearer ${member1Token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');

      // All messages should be sent by member1
      response.body.data.forEach((msg: any) => {
        expect(msg.sender.id).toBe(member1Id);
      });
    });

    it('should filter unread messages only', async () => {
      const response = await request(app)
        .get('/api/v1/messages?folder=inbox&unreadOnly=true')
        .set('Authorization', `Bearer ${member1Token}`);

      expect(response.status).toBe(200);

      // All messages should be unread
      response.body.data.forEach((msg: any) => {
        expect(msg.isRead).toBe(false);
      });
    });

    it('should return paginated results', async () => {
      const response = await request(app)
        .get('/api/v1/messages?page=1&limit=10')
        .set('Authorization', `Bearer ${member1Token}`);

      expect(response.status).toBe(200);
      expect(response.body.pagination).toHaveProperty('page', 1);
      expect(response.body.pagination).toHaveProperty('limit', 10);
      expect(response.body.pagination).toHaveProperty('totalPages');
      expect(response.body.pagination).toHaveProperty('totalItems');
    });

    it('should not return messages deleted by recipient', async () => {
      // First, create and delete a message
      const msgId = await createTestMessage(
        member2Id,
        member1Id,
        'To be deleted',
        'This message will be deleted'
      );

      // Delete the message
      await prisma.message.update({
        where: { id: msgId },
        data: { deletedByRecipient: true },
      });

      const response = await request(app)
        .get('/api/v1/messages?folder=inbox')
        .set('Authorization', `Bearer ${member1Token}`);

      expect(response.status).toBe(200);

      // The deleted message should not appear
      const deletedMsg = response.body.data.find((m: any) => m.id === msgId);
      expect(deletedMsg).toBeUndefined();
    });
  });

  // ===================================================================
  // GET /api/v1/messages/:id - Get Message Details
  // ===================================================================

  describe('GET /api/v1/messages/:id - Get Message Details', () => {
    let testMsgId: string;

    beforeAll(async () => {
      testMsgId = await createTestMessage(
        member2Id,
        member1Id,
        'Detail Test Message',
        'This is a test message for detail testing.'
      );
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app).get(`/api/v1/messages/${testMsgId}`);

      expect(response.status).toBe(401);
    });

    it('should return message details for recipient', async () => {
      const response = await request(app)
        .get(`/api/v1/messages/${testMsgId}`)
        .set('Authorization', `Bearer ${member1Token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testMsgId);
      expect(response.body).toHaveProperty('subject', 'Detail Test Message');
      expect(response.body).toHaveProperty('body');
      expect(response.body).toHaveProperty('sender');
      expect(response.body).toHaveProperty('recipient');
    });

    it('should mark message as read when recipient views it', async () => {
      // Create unread message
      const unreadMsgId = await createTestMessage(
        member2Id,
        member1Id,
        'Unread Message',
        'This message should be marked as read.'
      );

      const response = await request(app)
        .get(`/api/v1/messages/${unreadMsgId}`)
        .set('Authorization', `Bearer ${member1Token}`);

      expect(response.status).toBe(200);
      expect(response.body.isRead).toBe(true);
      expect(response.body.readAt).toBeDefined();
    });

    it('should return message details for sender', async () => {
      const response = await request(app)
        .get(`/api/v1/messages/${testMsgId}`)
        .set('Authorization', `Bearer ${member2Token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testMsgId);
    });

    it('should return 403 for non-participant', async () => {
      const response = await request(app)
        .get(`/api/v1/messages/${testMsgId}`)
        .set('Authorization', `Bearer ${member3Token}`);

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent message', async () => {
      const response = await request(app)
        .get('/api/v1/messages/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${member1Token}`);

      expect(response.status).toBe(404);
    });
  });

  // ===================================================================
  // PATCH /api/v1/messages/:id/read - Mark Message as Read
  // ===================================================================

  describe('PATCH /api/v1/messages/:id/read - Mark as Read', () => {
    let unreadMsgId: string;

    beforeEach(async () => {
      unreadMsgId = await createTestMessage(
        member2Id,
        member1Id,
        'Mark Read Test',
        'This message will be marked as read.'
      );
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app).patch(`/api/v1/messages/${unreadMsgId}/read`);

      expect(response.status).toBe(401);
    });

    it('should mark message as read', async () => {
      const response = await request(app)
        .patch(`/api/v1/messages/${unreadMsgId}/read`)
        .set('Authorization', `Bearer ${member1Token}`);

      expect(response.status).toBe(200);
      expect(response.body.isRead).toBe(true);
      expect(response.body.readAt).toBeDefined();
    });

    it('should return 403 if not the recipient', async () => {
      const response = await request(app)
        .patch(`/api/v1/messages/${unreadMsgId}/read`)
        .set('Authorization', `Bearer ${member2Token}`);

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent message', async () => {
      const response = await request(app)
        .patch('/api/v1/messages/00000000-0000-0000-0000-000000000000/read')
        .set('Authorization', `Bearer ${member1Token}`);

      expect(response.status).toBe(404);
    });
  });

  // ===================================================================
  // DELETE /api/v1/messages/:id - Delete Message (Soft Delete)
  // ===================================================================

  describe('DELETE /api/v1/messages/:id - Delete Message', () => {
    it('should return 401 if not authenticated', async () => {
      const msgId = await createTestMessage(
        member2Id,
        member1Id,
        'Delete Test',
        'This message will be deleted.'
      );

      const response = await request(app).delete(`/api/v1/messages/${msgId}`);

      expect(response.status).toBe(401);
    });

    it('should soft delete message for recipient', async () => {
      const msgId = await createTestMessage(
        member2Id,
        member1Id,
        'Delete as Recipient',
        'This message will be deleted by recipient.'
      );

      const response = await request(app)
        .delete(`/api/v1/messages/${msgId}`)
        .set('Authorization', `Bearer ${member1Token}`);

      expect(response.status).toBe(200);

      // Verify message is soft deleted for recipient
      const deletedMsg = await prisma.message.findUnique({
        where: { id: msgId },
      });
      expect(deletedMsg?.deletedByRecipient).toBe(true);
      expect(deletedMsg?.deletedBySender).toBe(false);
    });

    it('should soft delete message for sender', async () => {
      const msgId = await createTestMessage(
        member1Id,
        member2Id,
        'Delete as Sender',
        'This message will be deleted by sender.'
      );

      const response = await request(app)
        .delete(`/api/v1/messages/${msgId}`)
        .set('Authorization', `Bearer ${member1Token}`);

      expect(response.status).toBe(200);

      // Verify message is soft deleted for sender
      const deletedMsg = await prisma.message.findUnique({
        where: { id: msgId },
      });
      expect(deletedMsg?.deletedBySender).toBe(true);
      expect(deletedMsg?.deletedByRecipient).toBe(false);
    });

    it('should return 403 for non-participant', async () => {
      const msgId = await createTestMessage(
        member1Id,
        member2Id,
        'Cannot Delete',
        'Member3 should not be able to delete this.'
      );

      const response = await request(app)
        .delete(`/api/v1/messages/${msgId}`)
        .set('Authorization', `Bearer ${member3Token}`);

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent message', async () => {
      const response = await request(app)
        .delete('/api/v1/messages/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${member1Token}`);

      expect(response.status).toBe(404);
    });
  });
});
