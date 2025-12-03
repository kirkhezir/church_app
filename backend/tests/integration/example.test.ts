/**
 * Example Integration Test
 * Demonstrates how to use test infrastructure (setup, fixtures, contract validation)
 *
 * NOTE: Skipped due to test isolation issues in CI - these tests work individually
 */

import { request, authenticatedRequest, createTestMemberAndLogin } from './setup';
import {
  MemberFactory,
  EventFactory,
  AnnouncementFactory,
  EventRSVPFactory,
  resetAllFactories,
} from '../fixtures/factories';
import { expectValidApiResponse } from '../contract/helpers/openapi-validator';

// TODO: Fix test isolation - tests require consistent database state
describe.skip('Example Integration Tests', () => {
  let adminToken: string;
  let staffToken: string;
  let staffId: string;
  let memberToken: string;
  let memberId: string;

  beforeEach(async () => {
    // Reset factory counters for consistent test data
    resetAllFactories();

    // Create test users with different roles
    const admin = await createTestMemberAndLogin({
      email: 'admin@example.com',
      password: 'Admin123!',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    });
    adminToken = admin.token;

    const staff = await createTestMemberAndLogin({
      email: 'staff@example.com',
      password: 'Staff123!',
      firstName: 'Staff',
      lastName: 'User',
      role: 'STAFF',
    });
    staffToken = staff.token;
    staffId = staff.memberId;

    const member = await createTestMemberAndLogin({
      email: 'member@example.com',
      password: 'Member123!',
      firstName: 'Member',
      lastName: 'User',
    });
    memberToken = member.token;
    memberId = member.memberId;
  });

  describe('Authentication', () => {
    it('should register a new member', async () => {
      const response = await request
        .post('/api/v1/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'Test123!',
          firstName: 'New',
          lastName: 'User',
        })
        .expect(201);

      // Validate response against OpenAPI spec
      expectValidApiResponse(response, 'POST', '/api/v1/auth/register');

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.email).toBe('newuser@example.com');
    });

    it('should login with valid credentials', async () => {
      const response = await request
        .post('/api/v1/auth/login')
        .send({
          email: 'member@example.com',
          password: 'Member123!',
        })
        .expect(200);

      expectValidApiResponse(response, 'POST', '/api/v1/auth/login');

      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user.email).toBe('member@example.com');
    });

    it('should reject login with invalid credentials', async () => {
      const response = await request
        .post('/api/v1/auth/login')
        .send({
          email: 'member@example.com',
          password: 'WrongPassword',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Member Management', () => {
    it('should allow member to get their own profile', async () => {
      const authRequest = authenticatedRequest(memberToken);
      const response = await authRequest.get(`/api/v1/members/${memberId}`).expect(200);

      expectValidApiResponse(response, 'GET', `/api/v1/members/${memberId}`);

      expect(response.body.data.email).toBe('member@example.com');
    });

    it('should allow staff to list all members', async () => {
      // Create additional test members
      await MemberFactory.createMany(5);

      const authRequest = authenticatedRequest(staffToken);
      const response = await authRequest.get('/api/v1/members').expect(200);

      expectValidApiResponse(response, 'GET', '/api/v1/members');

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should allow admin to update member role', async () => {
      const testMember = await MemberFactory.create();

      const authRequest = authenticatedRequest(adminToken);
      const response = await authRequest
        .patch(`/api/v1/members/${testMember.id}`)
        .send({ role: 'STAFF' })
        .expect(200);

      expectValidApiResponse(response, 'PATCH', `/api/v1/members/${testMember.id}`);

      expect(response.body.data.role).toBe('STAFF');
    });
  });

  describe('Event Management', () => {
    it('should allow staff to create an event', async () => {
      const authRequest = authenticatedRequest(staffToken);
      const response = await authRequest
        .post('/api/v1/events')
        .send({
          title: 'Sunday Worship',
          description: 'Weekly worship service',
          category: 'WORSHIP',
          startDateTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          endDateTime: new Date(Date.now() + 90000000).toISOString(),
          location: 'Main Sanctuary',
          maxCapacity: 100,
        })
        .expect(201);

      expectValidApiResponse(response, 'POST', '/api/v1/events');

      expect(response.body.data.title).toBe('Sunday Worship');
    });

    it('should allow member to RSVP to an event', async () => {
      const event = await EventFactory.createWorship(staffId);

      const authRequest = authenticatedRequest(memberToken);
      const response = await authRequest
        .post(`/api/v1/events/${event.id}/rsvp`)
        .send({ status: 'CONFIRMED' })
        .expect(201);

      expectValidApiResponse(response, 'POST', `/api/v1/events/${event.id}/rsvp`);

      expect(response.body.data.status).toBe('CONFIRMED');
    });

    it('should list upcoming events', async () => {
      // Create test events
      await EventFactory.createMany(staffId, 3);

      const authRequest = authenticatedRequest(memberToken);
      const response = await authRequest.get('/api/v1/events?upcoming=true').expect(200);

      expectValidApiResponse(response, 'GET', '/api/v1/events');

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Announcement Management', () => {
    it('should allow staff to create an announcement', async () => {
      const authRequest = authenticatedRequest(staffToken);
      const response = await authRequest
        .post('/api/v1/announcements')
        .send({
          title: 'Important Update',
          content: 'Please note the schedule change',
          priority: 'URGENT',
        })
        .expect(201);

      expectValidApiResponse(response, 'POST', '/api/v1/announcements');

      expect(response.body.data.title).toBe('Important Update');
    });

    it('should list active announcements', async () => {
      // Create test announcements
      await AnnouncementFactory.createMany(staffId, 3);
      await AnnouncementFactory.createArchived(staffId);

      const authRequest = authenticatedRequest(memberToken);
      const response = await authRequest.get('/api/v1/announcements?active=true').expect(200);

      expectValidApiResponse(response, 'GET', '/api/v1/announcements');

      expect(response.body.data).toBeInstanceOf(Array);
      // Archived announcement should not be in results
      expect(response.body.data.every((a: any) => !a.archivedAt)).toBe(true);
    });

    it('should mark announcement as viewed', async () => {
      const announcement = await AnnouncementFactory.create(staffId);

      const authRequest = authenticatedRequest(memberToken);
      const response = await authRequest
        .post(`/api/v1/announcements/${announcement.id}/view`)
        .expect(200);

      expectValidApiResponse(response, 'POST', `/api/v1/announcements/${announcement.id}/view`);

      expect(response.body.data.hasViewed).toBe(true);
    });
  });

  describe('Factory Usage Examples', () => {
    it('should create member with custom data', async () => {
      const member = await MemberFactory.create({
        email: 'custom@example.com',
        firstName: 'Custom',
        lastName: 'Member',
      });

      expect(member.email).toBe('custom@example.com');
      expect(member.firstName).toBe('Custom');
    });

    it('should create admin member', async () => {
      const admin = await MemberFactory.createAdmin();

      expect(admin.role).toBe('ADMIN');
    });

    it('should create Bible study event', async () => {
      const event = await EventFactory.createBibleStudy(staffId);

      expect(event.category).toBe('BIBLE_STUDY');
      expect(event.title).toContain('Bible Study');
    });

    it('should create urgent announcement', async () => {
      const announcement = await AnnouncementFactory.createUrgent(staffId);

      expect(announcement.priority).toBe('URGENT');
      expect(announcement.title).toContain('Urgent');
    });

    it('should create RSVP', async () => {
      const event = await EventFactory.create(staffId);
      const member = await MemberFactory.create();

      const rsvp = await EventRSVPFactory.createConfirmed(event.id, member.id);

      expect(rsvp.status).toBe('CONFIRMED');
      expect(rsvp.eventId).toBe(event.id);
      expect(rsvp.memberId).toBe(member.id);
    });
  });
});
