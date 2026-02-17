/**
 * Contract Tests: Announcement Endpoints
 *
 * Validates that announcement endpoints match OpenAPI specification:
 * - POST /api/v1/announcements (create announcement - admin/staff only)
 * - GET /api/v1/announcements (list announcements with filters)
 * - GET /api/v1/announcements/:id (get announcement details)
 * - PUT /api/v1/announcements/:id (update announcement - admin/staff only)
 * - POST /api/v1/announcements/:id/archive (archive announcement - admin/staff only)
 *
 * RED PHASE: These tests should FAIL until implementation is complete
 */

import request from 'supertest';
import { randomUUID } from 'crypto';
import { Server } from '../../src/presentation/server';
import prisma from '../../src/infrastructure/database/prismaClient';
import { PasswordService } from '../../src/infrastructure/auth/passwordService';
import { JWTService } from '../../src/infrastructure/auth/jwtService';

const passwordService = new PasswordService();
const jwtService = new JWTService();
const server = new Server();
const app = server.app;

describe('Contract Tests: Announcement Endpoints', () => {
  let testMemberIds: string[] = [];
  let testAnnouncementIds: string[] = [];
  let adminToken: string;
  let staffToken: string;
  let memberToken: string;
  let adminId: string;
  let staffId: string;
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
    const member = await prisma.members.create({
      data: {
        id: randomUUID(),
        email,
        passwordHash: hashedPassword,
        firstName: 'Announcement',
        lastName: 'Test',
        role,
        phone: '+1234567890',
        membershipDate: new Date(),
        updatedAt: new Date(),
        privacySettings: { showPhone: true, showEmail: true, showAddress: true },
        failedLoginAttempts: 0,
      },
    });
    testMemberIds.push(member.id);
    return member.id;
  }

  /**
   * Helper to create a test announcement
   */
  async function createTestAnnouncement(
    authorId: string,
    overrides?: Partial<{
      title: string;
      content: string;
      priority: 'URGENT' | 'NORMAL';
      archivedAt: Date | null;
    }>
  ): Promise<string> {
    const announcement = await prisma.announcements.create({
      data: {
        id: randomUUID(),
        title: overrides?.title || 'Test Announcement',
        content: overrides?.content || 'This is a test announcement for contract testing',
        priority: overrides?.priority || 'NORMAL',
        authorId,
        publishedAt: new Date(),
        updatedAt: new Date(),
        archivedAt: overrides?.archivedAt || null,
      },
    });
    testAnnouncementIds.push(announcement.id);
    return announcement.id;
  }

  beforeAll(async () => {
    console.log('🔧 Announcement Contract Tests: Setup started');

    // Create test users with different roles (strong passwords)
    adminId = await createTestMember('announcement-admin@test.com', 'Admin123!', 'ADMIN');
    staffId = await createTestMember('announcement-staff@test.com', 'Staff123!', 'STAFF');
    memberId = await createTestMember('announcement-member@test.com', 'Member123!', 'MEMBER');

    // Generate tokens
    adminToken = jwtService.generateAccessToken({
      userId: adminId,
      email: 'announcement-admin@test.com',
      role: 'ADMIN',
    });
    staffToken = jwtService.generateAccessToken({
      userId: staffId,
      email: 'announcement-staff@test.com',
      role: 'STAFF',
    });
    memberToken = jwtService.generateAccessToken({
      userId: memberId,
      email: 'announcement-member@test.com',
      role: 'MEMBER',
    });

    console.log('✅ Announcement Contract Tests: Setup complete');
  });

  afterAll(async () => {
    console.log('🧹 Announcement Contract Tests: Cleanup started');

    // Clean up test data
    if (testAnnouncementIds.length > 0) {
      await prisma.announcements.deleteMany({
        where: { id: { in: testAnnouncementIds } },
      });
    }

    if (testMemberIds.length > 0) {
      await prisma.members.deleteMany({
        where: { id: { in: testMemberIds } },
      });
    }

    await prisma.$disconnect();
    console.log('✅ Announcement Contract Tests: Cleanup complete');
  });

  describe('POST /api/v1/announcements', () => {
    it('should create announcement with valid data (admin)', async () => {
      const response = await request(app)
        .post('/api/v1/announcements')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'New Church Announcement',
          content: 'This is an important announcement for all members.',
          priority: 'NORMAL',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('New Church Announcement');
      expect(response.body.content).toBe('This is an important announcement for all members.');
      expect(response.body.priority).toBe('NORMAL');
      expect(response.body).toHaveProperty('publishedAt');
      expect(response.body.archivedAt).toBeNull();
      expect(response.body.author).toHaveProperty('id', adminId);

      testAnnouncementIds.push(response.body.id);
    });

    it('should create urgent announcement (staff)', async () => {
      const response = await request(app)
        .post('/api/v1/announcements')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          title: 'Urgent: Weather Alert',
          content: 'Service cancelled due to severe weather.',
          priority: 'URGENT',
        });

      expect(response.status).toBe(201);
      expect(response.body.priority).toBe('URGENT');
      testAnnouncementIds.push(response.body.id);
    });

    it('should reject announcement from regular member', async () => {
      const response = await request(app)
        .post('/api/v1/announcements')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          title: 'Member Announcement',
          content: 'This should not be allowed.',
          priority: 'NORMAL',
        });

      expect(response.status).toBe(403);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/announcements')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          priority: 'NORMAL',
        });

      expect(response.status).toBe(400);
    });

    it('should validate title length (min 3 chars)', async () => {
      const response = await request(app)
        .post('/api/v1/announcements')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'AB',
          content: 'Valid content',
          priority: 'NORMAL',
        });

      expect(response.status).toBe(400);
    });

    it('should validate title length (max 150 chars)', async () => {
      const response = await request(app)
        .post('/api/v1/announcements')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'A'.repeat(151),
          content: 'Valid content',
          priority: 'NORMAL',
        });

      expect(response.status).toBe(400);
    });

    it('should validate content length (max 5000 chars)', async () => {
      const response = await request(app)
        .post('/api/v1/announcements')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Valid Title',
          content: 'A'.repeat(5001),
          priority: 'NORMAL',
        });

      expect(response.status).toBe(400);
    });

    it('should validate priority enum', async () => {
      const response = await request(app)
        .post('/api/v1/announcements')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Valid Title',
          content: 'Valid content',
          priority: 'CRITICAL', // Invalid priority
        });

      expect(response.status).toBe(400);
    });

    it('should default priority to NORMAL when not provided', async () => {
      const response = await request(app)
        .post('/api/v1/announcements')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Default Priority Test',
          content: 'No priority specified',
        });

      expect(response.status).toBe(201);
      expect(response.body.priority).toBe('NORMAL');
      testAnnouncementIds.push(response.body.id);
    });

    it('should require authentication', async () => {
      const response = await request(app).post('/api/v1/announcements').send({
        title: 'Unauthenticated Test',
        content: 'This should fail',
      });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/announcements', () => {
    beforeAll(async () => {
      // Create test announcements
      await createTestAnnouncement(adminId, {
        title: 'Active Announcement 1',
        priority: 'NORMAL',
      });
      await createTestAnnouncement(adminId, {
        title: 'Active Announcement 2',
        priority: 'URGENT',
      });
      await createTestAnnouncement(adminId, {
        title: 'Archived Announcement',
        priority: 'NORMAL',
        archivedAt: new Date(),
      });
    });

    it('should list active announcements (no archived)', async () => {
      const response = await request(app)
        .get('/api/v1/announcements')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('pagination');

      // Should not include archived announcements by default
      const archivedCount = response.body.data.filter((a: any) => a.archivedAt !== null).length;
      expect(archivedCount).toBe(0);
    });

    it('should include archived announcements when archived=true', async () => {
      const response = await request(app)
        .get('/api/v1/announcements?archived=true')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);

      // Should include at least one archived announcement
      const hasArchived = response.body.data.some((a: any) => a.archivedAt !== null);
      expect(hasArchived).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/v1/announcements?page=1&limit=2')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pagination).toHaveProperty('page', 1);
      expect(response.body.pagination).toHaveProperty('limit', 2);
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('totalPages');
    });

    it('should include author information', async () => {
      const response = await request(app)
        .get('/api/v1/announcements')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(response.status).toBe(200);
      if (response.body.data.length > 0) {
        expect(response.body.data[0].author).toHaveProperty('id');
        expect(response.body.data[0].author).toHaveProperty('firstName');
        expect(response.body.data[0].author).toHaveProperty('lastName');
      }
    });

    it('should require authentication', async () => {
      const response = await request(app).get('/api/v1/announcements');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/announcements/:id', () => {
    let testAnnouncementId: string;

    beforeAll(async () => {
      testAnnouncementId = await createTestAnnouncement(adminId, {
        title: 'Detailed Announcement',
        content: 'This announcement has detailed content.',
        priority: 'NORMAL',
      });
    });

    it('should get announcement by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/announcements/${testAnnouncementId}`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(testAnnouncementId);
      expect(response.body.title).toBe('Detailed Announcement');
      expect(response.body.content).toBe('This announcement has detailed content.');
      expect(response.body).toHaveProperty('author');
    });

    it('should return 404 for non-existent announcement', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/v1/announcements/${fakeId}`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid UUID', async () => {
      const response = await request(app)
        .get('/api/v1/announcements/invalid-id')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(response.status).toBe(400);
    });

    it('should require authentication', async () => {
      const response = await request(app).get(`/api/v1/announcements/${testAnnouncementId}`);

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/v1/announcements/:id', () => {
    let testAnnouncementId: string;

    beforeEach(async () => {
      testAnnouncementId = await createTestAnnouncement(adminId, {
        title: 'Original Title',
        content: 'Original content',
        priority: 'NORMAL',
      });
    });

    it('should update announcement (admin)', async () => {
      const response = await request(app)
        .put(`/api/v1/announcements/${testAnnouncementId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated Title',
          content: 'Updated content',
          priority: 'URGENT',
        });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated Title');
      expect(response.body.content).toBe('Updated content');
      expect(response.body.priority).toBe('URGENT');
    });

    it('should update announcement (staff)', async () => {
      const response = await request(app)
        .put(`/api/v1/announcements/${testAnnouncementId}`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          title: 'Staff Updated Title',
        });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Staff Updated Title');
    });

    it('should reject update from regular member', async () => {
      const response = await request(app)
        .put(`/api/v1/announcements/${testAnnouncementId}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          title: 'Member Update Attempt',
        });

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent announcement', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .put(`/api/v1/announcements/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated Title',
        });

      expect(response.status).toBe(404);
    });

    it('should allow partial updates', async () => {
      const response = await request(app)
        .put(`/api/v1/announcements/${testAnnouncementId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          priority: 'URGENT',
        });

      expect(response.status).toBe(200);
      expect(response.body.priority).toBe('URGENT');
      expect(response.body.title).toBe('Original Title'); // Should remain unchanged
    });

    it('should require authentication', async () => {
      const response = await request(app).put(`/api/v1/announcements/${testAnnouncementId}`).send({
        title: 'Unauthenticated Update',
      });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/v1/announcements/:id/archive', () => {
    let testAnnouncementId: string;

    beforeEach(async () => {
      testAnnouncementId = await createTestAnnouncement(adminId, {
        title: 'Announcement to Archive',
        priority: 'NORMAL',
      });
    });

    it('should archive announcement (admin)', async () => {
      const response = await request(app)
        .post(`/api/v1/announcements/${testAnnouncementId}/archive`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);

      // Verify announcement is archived
      const announcement = await prisma.announcements.findUnique({
        where: { id: testAnnouncementId },
      });
      expect(announcement?.archivedAt).not.toBeNull();
    });

    it('should archive announcement (staff)', async () => {
      const response = await request(app)
        .post(`/api/v1/announcements/${testAnnouncementId}/archive`)
        .set('Authorization', `Bearer ${staffToken}`);

      expect(response.status).toBe(200);
    });

    it('should reject archive from regular member', async () => {
      const response = await request(app)
        .post(`/api/v1/announcements/${testAnnouncementId}/archive`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent announcement', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .post(`/api/v1/announcements/${fakeId}/archive`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });

    it('should be idempotent (archiving twice should work)', async () => {
      // First archive
      await request(app)
        .post(`/api/v1/announcements/${testAnnouncementId}/archive`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Second archive
      const response = await request(app)
        .post(`/api/v1/announcements/${testAnnouncementId}/archive`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });

    it('should require authentication', async () => {
      const response = await request(app).post(
        `/api/v1/announcements/${testAnnouncementId}/archive`
      );

      expect(response.status).toBe(401);
    });
  });
});
