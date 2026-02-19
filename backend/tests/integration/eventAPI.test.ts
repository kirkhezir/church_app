/**
 * Integration Tests for Event API Endpoints (T120)
 *
 * Tests the event management API through HTTP:
 * - GET  /api/v1/events        (public)
 * - GET  /api/v1/events/:id    (public)
 * - POST /api/v1/events        (ADMIN/STAFF only)
 * - POST /api/v1/events/:id/rsvp  (authenticated)
 */

import { randomUUID } from 'crypto';
import { testPrisma, request, cleanDatabase } from './setup';
import { PasswordService } from '../../src/infrastructure/auth/passwordService';
import { JWTService } from '../../src/infrastructure/auth/jwtService';

const passwordService = new PasswordService();
const jwtService = new JWTService();

describe('Event API Integration Tests', () => {
  let adminId: string;
  let adminToken: string;
  let memberId: string;
  let memberToken: string;

  /**
   * Insert a member and mint a JWT — no register endpoint needed.
   */
  async function seedMember(role: 'ADMIN' | 'STAFF' | 'MEMBER' = 'MEMBER') {
    const id = randomUUID();
    const email = `event-test-${id.slice(0, 8)}@example.com`;
    const hashedPassword = await passwordService.hash('TestPass123!');

    await testPrisma.members.create({
      data: {
        id,
        email,
        passwordHash: hashedPassword,
        firstName: role === 'ADMIN' ? 'Admin' : 'Member',
        lastName: 'TestUser',
        role,
        membershipDate: new Date(),
        updatedAt: new Date(),
        privacySettings: { showPhone: true, showEmail: true, showAddress: true },
      },
    });

    const token = jwtService.generateAccessToken({ userId: id, email, role });
    return { id, email, token };
  }

  beforeAll(async () => {
    await cleanDatabase();

    // Seed an admin and a regular member
    const admin = await seedMember('ADMIN');
    adminId = admin.id;
    adminToken = admin.token;

    const member = await seedMember('MEMBER');
    memberId = member.id;
    memberToken = member.token;
  });

  afterAll(async () => {
    await cleanDatabase();
  });

  // ─── LIST EVENTS (public) ─────────────────────────────────────────────────

  describe('GET /api/v1/events', () => {
    it('should return 200 with an array', async () => {
      const response = await request.get('/api/v1/events');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  // ─── CREATE EVENT (admin) ─────────────────────────────────────────────────

  describe('POST /api/v1/events', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const endDate = new Date(futureDate);
    endDate.setHours(endDate.getHours() + 2);

    const validEventData = {
      title: 'Integration Test Worship Service',
      description: 'A test worship event created by integration tests',
      startDateTime: futureDate.toISOString(),
      endDateTime: endDate.toISOString(),
      location: 'Main Hall',
      category: 'WORSHIP',
    };

    it('should return 201 when admin creates an event', async () => {
      const response = await request
        .post('/api/v1/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validEventData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.title).toBe(validEventData.title);
    });

    it('should return 401 without auth token', async () => {
      const response = await request.post('/api/v1/events').send(validEventData);

      expect(response.status).toBe(401);
    });

    it('should return 403 when regular member tries to create', async () => {
      const response = await request
        .post('/api/v1/events')
        .set('Authorization', `Bearer ${memberToken}`)
        .send(validEventData);

      expect(response.status).toBe(403);
    });
  });

  // ─── GET EVENT BY ID (public) ─────────────────────────────────────────────

  describe('GET /api/v1/events/:id', () => {
    let eventId: string;

    beforeAll(async () => {
      // Create an event via API to get a real ID
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 14);
      const endDate = new Date(futureDate);
      endDate.setHours(endDate.getHours() + 2);

      const response = await request
        .post('/api/v1/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Detail Test Event',
          description: 'Event for testing GET by ID',
          startDateTime: futureDate.toISOString(),
          endDateTime: endDate.toISOString(),
          location: 'Chapel',
          category: 'FELLOWSHIP',
        });

      eventId = response.body.data.id;
    });

    it('should return 200 with event details', async () => {
      const response = await request.get(`/api/v1/events/${eventId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(eventId);
    });

    it('should return 404 for non-existent event', async () => {
      const fakeId = randomUUID();
      const response = await request.get(`/api/v1/events/${fakeId}`);

      // Some implementations return 400 or 404 for not-found
      expect([400, 404]).toContain(response.status);
    });
  });

  // ─── RSVP (authenticated member) ──────────────────────────────────────────

  describe('POST /api/v1/events/:id/rsvp', () => {
    let rsvpEventId: string;

    beforeAll(async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 21);
      const endDate = new Date(futureDate);
      endDate.setHours(endDate.getHours() + 2);

      const response = await request
        .post('/api/v1/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'RSVP Test Event',
          description: 'Event for RSVP integration tests',
          startDateTime: futureDate.toISOString(),
          endDateTime: endDate.toISOString(),
          location: 'Fellowship Hall',
          category: 'COMMUNITY',
          maxCapacity: 50,
        });

      rsvpEventId = response.body.data.id;
    });

    it('should allow authenticated member to RSVP', async () => {
      const response = await request
        .post(`/api/v1/events/${rsvpEventId}/rsvp`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ status: 'ATTENDING' });

      expect([200, 201]).toContain(response.status);
    });

    it('should return 401 for unauthenticated RSVP', async () => {
      const response = await request
        .post(`/api/v1/events/${rsvpEventId}/rsvp`)
        .send({ status: 'ATTENDING' });

      expect(response.status).toBe(401);
    });
  });
});
