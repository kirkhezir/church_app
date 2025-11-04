/**
 * Contract Tests: Event Endpoints
 *
 * Validates that event endpoints match OpenAPI specification:
 * - POST /api/v1/events (create event - admin/staff only)
 * - GET /api/v1/events (list events with filters)
 * - GET /api/v1/events/:id (get event details)
 * - PATCH /api/v1/events/:id (update event - admin/staff only)
 * - DELETE /api/v1/events/:id (cancel event - admin/staff only)
 * - POST /api/v1/events/:id/rsvp (RSVP to event)
 * - DELETE /api/v1/events/:id/rsvp (cancel RSVP)
 * - GET /api/v1/events/:id/rsvps (get RSVP list - admin/staff only)
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

describe('Contract Tests: Event Endpoints', () => {
  let testMemberIds: string[] = [];
  let testEventIds: string[] = [];
  let adminToken: string;
  let memberToken: string;
  let adminId: string;
  let memberId: string;

  /**
   * Helper to create a test member
   */
  async function createTestMember(
    email: string,
    password: string,
    role: 'ADMIN' | 'STAFF' | 'MEMBER' = 'MEMBER'
  ): Promise<string> {
    const hashedPassword = await passwordService.hash(password);
    const member = await prisma.member.create({
      data: {
        email,
        passwordHash: hashedPassword,
        firstName: 'Event',
        lastName: 'Test',
        role,
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
   * Helper to create a test event
   */
  async function createTestEvent(
    createdById: string,
    overrides?: Partial<{
      title: string;
      startDateTime: Date;
      endDateTime: Date;
      maxCapacity: number;
      category: 'WORSHIP' | 'BIBLE_STUDY' | 'COMMUNITY' | 'FELLOWSHIP';
    }>
  ): Promise<string> {
    const startDateTime =
      overrides?.startDateTime || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    const endDateTime =
      overrides?.endDateTime || new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

    console.log('📝 Creating test event with createdById:', createdById);

    const event = await prisma.event.create({
      data: {
        title: overrides?.title || 'Test Event',
        description: 'This is a test event for contract testing',
        startDateTime,
        endDateTime,
        location: 'Test Location',
        category: overrides?.category || 'WORSHIP',
        maxCapacity: overrides?.maxCapacity,
        createdById,
      },
    });
    testEventIds.push(event.id);
    return event.id;
  }

  beforeAll(async () => {
    console.log('🔧 beforeAll started');

    // Ensure Prisma is connected
    await prisma.$connect();

    // Clean up any existing test data
    await prisma.member.deleteMany({
      where: {
        email: {
          in: ['event-admin@example.com', 'event-member@example.com'],
        },
      },
    });

    // Clean up any existing events
    await prisma.eventRSVP.deleteMany({});
    await prisma.event.deleteMany({
      where: {
        title: {
          contains: 'Test Event',
        },
      },
    });

    // Create test members using raw SQL to bypass any transaction issues
    const adminPassword = await passwordService.hash('AdminPass123!');
    const memberPassword = await passwordService.hash('MemberPass123!');

    // Use raw SQL to ensure immediate commit
    const [admin] = await prisma.$queryRaw<Array<{ id: string }>>`
      INSERT INTO members (id, email, "passwordHash", "firstName", "lastName", role, phone, "membershipDate", "privacySettings", "failedLoginAttempts", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), 'event-admin@example.com', ${adminPassword}, 'Event', 'Admin', 'ADMIN', '+1234567890', NOW(), '{"showPhone": true, "showEmail": true, "showAddress": true}'::jsonb, 0, NOW(), NOW())
      RETURNING id
    `;

    const [member] = await prisma.$queryRaw<Array<{ id: string }>>`
      INSERT INTO members (id, email, "passwordHash", "firstName", "lastName", role, phone, "membershipDate", "privacySettings", "failedLoginAttempts", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), 'event-member@example.com', ${memberPassword}, 'Event', 'Member', 'MEMBER', '+1234567891', NOW(), '{"showPhone": true, "showEmail": true, "showAddress": true}'::jsonb, 0, NOW(), NOW())
      RETURNING id
    `;

    adminId = admin.id;
    memberId = member.id;
    testMemberIds.push(adminId, memberId);

    console.log('✅ Test members created via raw SQL:', { adminId, memberId });

    // Generate tokens
    adminToken = jwtService.generateAccessToken({
      userId: adminId,
      email: 'event-admin@example.com',
      role: 'ADMIN',
    });
    memberToken = jwtService.generateAccessToken({
      userId: memberId,
      email: 'event-member@example.com',
      role: 'MEMBER',
    });
  });

  afterAll(async () => {
    // Cleanup RSVPs first (foreign key constraint)
    if (testEventIds.length > 0) {
      await prisma.eventRSVP
        .deleteMany({
          where: { eventId: { in: testEventIds } },
        })
        .catch(() => {});
    }

    // Cleanup events
    if (testEventIds.length > 0) {
      await prisma.event
        .deleteMany({
          where: { id: { in: testEventIds } },
        })
        .catch(() => {});
    }

    // Cleanup members
    if (testMemberIds.length > 0) {
      await prisma.member
        .deleteMany({
          where: { id: { in: testMemberIds } },
        })
        .catch(() => {});
    }

    await prisma.$disconnect();
  });

  describe('POST /api/v1/events', () => {
    it('should return 201 and create event for admin', async () => {
      // DEBUG: Check if admin member exists before making the request
      const adminExists = await prisma.member.findUnique({ where: { id: adminId } });
      console.log('🔍 [TEST START] Admin member exists:', !!adminExists, 'ID:', adminId);

      const eventData = {
        title: 'Sabbath Worship Service',
        description: 'Weekly worship service for the church community',
        startDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDateTime: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000
        ).toISOString(),
        location: 'Main Sanctuary',
        category: 'WORSHIP',
        maxCapacity: 100,
      };

      const response = await request(app)
        .post('/api/v1/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(eventData)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('title', eventData.title);
      expect(response.body.data).toHaveProperty('description', eventData.description);
      expect(response.body.data).toHaveProperty('category', eventData.category);
      expect(response.body.data).toHaveProperty('maxCapacity', eventData.maxCapacity);
      expect(response.body.data).toHaveProperty('createdById', adminId);

      // Store for cleanup
      if (response.body.id) {
        testEventIds.push(response.body.id);
      }
    });

    it('should return 403 for non-admin/staff member', async () => {
      const eventData = {
        title: 'Unauthorized Event',
        description: 'This should not be created',
        startDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDateTime: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000
        ).toISOString(),
        location: 'Test Location',
        category: 'WORSHIP',
      };

      const response = await request(app)
        .post('/api/v1/events')
        .set('Authorization', `Bearer ${memberToken}`)
        .send(eventData)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(403);
    });

    it('should return 400 for invalid event data (missing required fields)', async () => {
      const invalidData = {
        title: 'Incomplete Event',
        // missing required fields
      };

      const response = await request(app)
        .post('/api/v1/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid dates (end before start)', async () => {
      const invalidData = {
        title: 'Invalid Date Event',
        description: 'Event with invalid dates',
        startDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDateTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(), // Before start
        location: 'Test Location',
        category: 'WORSHIP',
      };

      const response = await request(app)
        .post('/api/v1/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
    });

    it('should return 401 for unauthenticated request', async () => {
      const eventData = {
        title: 'Unauthorized Event',
        description: 'This should not be created',
        startDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDateTime: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000
        ).toISOString(),
        location: 'Test Location',
        category: 'WORSHIP',
      };

      const response = await request(app)
        .post('/api/v1/events')
        .send(eventData)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/events', () => {
    it('should return 200 with list of events', async () => {
      // Create test events
      await createTestEvent(adminId, {
        title: 'Sunday Worship',
        category: 'WORSHIP',
        startDateTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      });
      await createTestEvent(adminId, {
        title: 'Bible Study',
        category: 'BIBLE_STUDY',
        startDateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      });

      const response = await request(app).get('/api/v1/events').expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      // Verify event structure
      const event = response.body.data[0];
      expect(event).toHaveProperty('id');
      expect(event).toHaveProperty('title');
      expect(event).toHaveProperty('description');
      expect(event).toHaveProperty('startDateTime');
      expect(event).toHaveProperty('endDateTime');
      expect(event).toHaveProperty('location');
      expect(event).toHaveProperty('category');
    });

    it('should filter events by category', async () => {
      const response = await request(app)
        .get('/api/v1/events')
        .query({ category: 'WORSHIP' })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      // All returned events should be WORSHIP category
      response.body.data.forEach((event: any) => {
        expect(event.category).toBe('WORSHIP');
      });
    });

    it('should filter events by date range', async () => {
      const startDate = new Date(Date.now()).toISOString();
      const endDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();

      const response = await request(app)
        .get('/api/v1/events')
        .query({ startDate, endDate })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should work without authentication for public access', async () => {
      const response = await request(app).get('/api/v1/events').expect('Content-Type', /json/);

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/v1/events/:id', () => {
    let testEventId: string;

    it('should return 200 with event details', async () => {
      testEventId = await createTestEvent(adminId, {
        title: 'Detailed Event Test',
        maxCapacity: 50,
      });

      const response = await request(app)
        .get(`/api/v1/events/${testEventId}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('id', testEventId);
      expect(response.body.data).toHaveProperty('title', 'Detailed Event Test');
      expect(response.body.data).toHaveProperty('description');
      expect(response.body.data).toHaveProperty('startDateTime');
      expect(response.body.data).toHaveProperty('endDateTime');
      expect(response.body.data).toHaveProperty('location');
      expect(response.body.data).toHaveProperty('category');
      expect(response.body.data).toHaveProperty('maxCapacity', 50);
      expect(response.body.data).toHaveProperty('rsvpCount');
    });

    it('should return 404 for non-existent event', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app)
        .get(`/api/v1/events/${fakeId}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(404);
    });

    it('should work without authentication for public access', async () => {
      const response = await request(app)
        .get(`/api/v1/events/${testEventId}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
    });
  });

  describe('PATCH /api/v1/events/:id', () => {
    let testEventId: string;

    beforeEach(async () => {
      testEventId = await createTestEvent(adminId, {
        title: 'Event to Update',
      });
    });

    it('should return 200 and update event for admin', async () => {
      const updateData = {
        title: 'Updated Event Title',
        description: 'Updated description',
        maxCapacity: 75,
      };

      const response = await request(app)
        .patch(`/api/v1/events/${testEventId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('id', testEventId);
      expect(response.body.data).toHaveProperty('title', updateData.title);
      expect(response.body.data).toHaveProperty('description', updateData.description);
      expect(response.body.data).toHaveProperty('maxCapacity', updateData.maxCapacity);
    });

    it('should return 403 for non-admin/staff member', async () => {
      const updateData = {
        title: 'Unauthorized Update',
      };

      const response = await request(app)
        .patch(`/api/v1/events/${testEventId}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send(updateData)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent event', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app)
        .patch(`/api/v1/events/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Updated' })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(404);
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .patch(`/api/v1/events/${testEventId}`)
        .send({ title: 'Unauthorized' })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/v1/events/:id', () => {
    let testEventId: string;

    beforeEach(async () => {
      testEventId = await createTestEvent(adminId, {
        title: 'Event to Cancel',
      });
    });

    it('should return 200 and cancel event for admin', async () => {
      const response = await request(app)
        .delete(`/api/v1/events/${testEventId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('message');

      // Verify event is cancelled
      const event = await prisma.event.findUnique({
        where: { id: testEventId },
      });
      expect(event?.cancelledAt).toBeTruthy();
    });

    it('should return 403 for non-admin/staff member', async () => {
      const response = await request(app)
        .delete(`/api/v1/events/${testEventId}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent event', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app)
        .delete(`/api/v1/events/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(404);
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .delete(`/api/v1/events/${testEventId}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/v1/events/:id/rsvp', () => {
    let testEventId: string;

    beforeEach(async () => {
      testEventId = await createTestEvent(adminId, {
        title: 'Event for RSVP',
        maxCapacity: 2,
      });
    });

    it('should return 201 and create RSVP for authenticated member', async () => {
      const response = await request(app)
        .post(`/api/v1/events/${testEventId}/rsvp`)
        .set('Authorization', `Bearer ${memberToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('eventId', testEventId);
      expect(response.body.data).toHaveProperty('memberId', memberId);
      expect(response.body.data).toHaveProperty('status', 'CONFIRMED');
    });

    it('should return 409 for duplicate RSVP', async () => {
      // First RSVP
      await request(app)
        .post(`/api/v1/events/${testEventId}/rsvp`)
        .set('Authorization', `Bearer ${memberToken}`);

      // Duplicate RSVP
      const response = await request(app)
        .post(`/api/v1/events/${testEventId}/rsvp`)
        .set('Authorization', `Bearer ${memberToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(409);
    });

    it('should return WAITLISTED status when event is at capacity', async () => {
      // Create 2 more members and fill capacity
      const member2Id = await createTestMember('member2@example.com', 'Pass123!');
      const member3Id = await createTestMember('member3@example.com', 'Pass123!');

      const token2 = jwtService.generateAccessToken({
        userId: member2Id,
        email: 'member2@example.com',
        role: 'MEMBER',
      });
      const token3 = jwtService.generateAccessToken({
        userId: member3Id,
        email: 'member3@example.com',
        role: 'MEMBER',
      });

      // Fill capacity
      await request(app)
        .post(`/api/v1/events/${testEventId}/rsvp`)
        .set('Authorization', `Bearer ${token2}`);

      await request(app)
        .post(`/api/v1/events/${testEventId}/rsvp`)
        .set('Authorization', `Bearer ${token3}`);

      // This should be waitlisted
      const response = await request(app)
        .post(`/api/v1/events/${testEventId}/rsvp`)
        .set('Authorization', `Bearer ${memberToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('status', 'WAITLISTED');
    });

    it('should return 404 for non-existent event', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app)
        .post(`/api/v1/events/${fakeId}/rsvp`)
        .set('Authorization', `Bearer ${memberToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(404);
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .post(`/api/v1/events/${testEventId}/rsvp`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/v1/events/:id/rsvp', () => {
    let testEventId: string;

    beforeEach(async () => {
      testEventId = await createTestEvent(adminId, {
        title: 'Event for RSVP Cancellation',
      });

      // Create RSVP
      await prisma.eventRSVP.create({
        data: {
          eventId: testEventId,
          memberId: memberId,
          status: 'CONFIRMED',
        },
      });
    });

    it('should return 200 and cancel RSVP for authenticated member', async () => {
      const response = await request(app)
        .delete(`/api/v1/events/${testEventId}/rsvp`)
        .set('Authorization', `Bearer ${memberToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('message');

      // Verify RSVP is deleted or cancelled
      const rsvp = await prisma.eventRSVP.findFirst({
        where: {
          eventId: testEventId,
          memberId: memberId,
        },
      });
      expect(rsvp).toBeNull();
    });

    it('should return 404 when no RSVP exists', async () => {
      // Delete existing RSVP first
      await prisma.eventRSVP.deleteMany({
        where: {
          eventId: testEventId,
          memberId: memberId,
        },
      });

      const response = await request(app)
        .delete(`/api/v1/events/${testEventId}/rsvp`)
        .set('Authorization', `Bearer ${memberToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(404);
    });

    it('should return 404 for non-existent event', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app)
        .delete(`/api/v1/events/${fakeId}/rsvp`)
        .set('Authorization', `Bearer ${memberToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(404);
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .delete(`/api/v1/events/${testEventId}/rsvp`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/events/:id/rsvps', () => {
    let testEventId: string;

    beforeAll(async () => {
      testEventId = await createTestEvent(adminId, {
        title: 'Event with RSVPs',
      });

      // Create multiple RSVPs
      await prisma.eventRSVP.create({
        data: {
          eventId: testEventId,
          memberId: memberId,
          status: 'CONFIRMED',
        },
      });
    });

    it('should return 200 with RSVP list for admin', async () => {
      const response = await request(app)
        .get(`/api/v1/events/${testEventId}/rsvps`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('rsvps');
      expect(Array.isArray(response.body.data.rsvps)).toBe(true);
      expect(response.body.data.rsvps.length).toBeGreaterThan(0);

      // Verify RSVP structure
      const rsvp = response.body.data.rsvps[0];
      expect(rsvp).toHaveProperty('id');
      expect(rsvp).toHaveProperty('eventId', testEventId);
      expect(rsvp).toHaveProperty('memberId');
      expect(rsvp).toHaveProperty('status');
      expect(rsvp).toHaveProperty('member');
      expect(rsvp.member).toHaveProperty('firstName');
      expect(rsvp.member).toHaveProperty('lastName');
    });

    it('should return 403 for non-admin/staff member', async () => {
      const response = await request(app)
        .get(`/api/v1/events/${testEventId}/rsvps`)
        .set('Authorization', `Bearer ${memberToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent event', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app)
        .get(`/api/v1/events/${fakeId}/rsvps`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(404);
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .get(`/api/v1/events/${testEventId}/rsvps`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(401);
    });
  });
});
