/**
 * Contract Tests for Admin Endpoints
 *
 * Validates that admin endpoints match OpenAPI specification:
 * - POST /api/v1/admin/members - Create member account (admin only)
 * - GET /api/v1/admin/members - List all members (admin only)
 * - DELETE /api/v1/admin/members/:id - Soft delete member (admin only)
 * - GET /api/v1/admin/audit-logs - View audit logs (admin only)
 * - GET /api/v1/admin/export/members - Export member data (admin only)
 * - GET /api/v1/admin/export/events - Export event data (admin only)
 *
 * T276: Write contract tests for admin member management endpoints
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

describe('Contract Tests: Admin Endpoints', () => {
  let adminToken: string;
  let staffToken: string;
  let memberToken: string;
  let adminId: string;
  let staffId: string;
  let memberId: string;
  let createdMemberIds: string[] = [];

  beforeAll(async () => {
    // Clean up existing test data
    await prisma.member.deleteMany({
      where: {
        email: {
          in: [
            'admin-test@singburi.church',
            'staff-test@singburi.church',
            'member-test@singburi.church',
            'new-member@example.com',
            'created-member@example.com',
          ],
        },
      },
    });

    // Create admin user
    const adminPassword = await passwordService.hash('AdminPass123!');
    const admin = await prisma.member.create({
      data: {
        email: 'admin-test@singburi.church',
        passwordHash: adminPassword,
        firstName: 'Admin',
        lastName: 'Test',
        role: 'ADMIN',
        membershipDate: new Date(),
        privacySettings: { showPhone: true, showEmail: true, showAddress: true },
      },
    });
    adminId = admin.id;
    adminToken = jwtService.generateAccessToken({
      userId: admin.id,
      email: admin.email,
      role: admin.role,
    });

    // Create staff user
    const staffPassword = await passwordService.hash('StaffPass123!');
    const staff = await prisma.member.create({
      data: {
        email: 'staff-test@singburi.church',
        passwordHash: staffPassword,
        firstName: 'Staff',
        lastName: 'Test',
        role: 'STAFF',
        membershipDate: new Date(),
        privacySettings: { showPhone: true, showEmail: true, showAddress: true },
      },
    });
    staffId = staff.id;
    staffToken = jwtService.generateAccessToken({
      userId: staff.id,
      email: staff.email,
      role: staff.role,
    });

    // Create regular member user
    const memberPassword = await passwordService.hash('MemberPass123!');
    const member = await prisma.member.create({
      data: {
        email: 'member-test@singburi.church',
        passwordHash: memberPassword,
        firstName: 'Member',
        lastName: 'Test',
        role: 'MEMBER',
        membershipDate: new Date(),
        privacySettings: { showPhone: true, showEmail: true, showAddress: true },
      },
    });
    memberId = member.id;
    memberToken = jwtService.generateAccessToken({
      userId: member.id,
      email: member.email,
      role: member.role,
    });
  });

  afterAll(async () => {
    // Cleanup all created members (delete related records first)
    const allIds = [adminId, staffId, memberId, ...createdMemberIds].filter(Boolean);
    if (allIds.length > 0) {
      // Delete audit logs first (foreign key constraint)
      await prisma.auditLog.deleteMany({
        where: { userId: { in: allIds } },
      });
      await prisma.member.deleteMany({
        where: { id: { in: allIds } },
      });
    }
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Cleanup members created during tests
    if (createdMemberIds.length > 0) {
      // Delete audit logs first
      await prisma.auditLog.deleteMany({
        where: { userId: { in: createdMemberIds } },
      });
      await prisma.member.deleteMany({
        where: { id: { in: createdMemberIds } },
      });
      createdMemberIds = [];
    }
  });

  describe('POST /api/v1/admin/members - Create Member', () => {
    it('should create member with valid admin token', async () => {
      const newMemberData = {
        email: 'new-member@example.com',
        firstName: 'New',
        lastName: 'Member',
        role: 'MEMBER',
        phone: '+66812345678',
      };

      const response = await request(app)
        .post('/api/v1/admin/members')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newMemberData)
        .expect('Content-Type', /json/);

      if (response.status === 201) {
        createdMemberIds.push(response.body.id);
      }

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email', newMemberData.email);
      expect(response.body).toHaveProperty('firstName', newMemberData.firstName);
      expect(response.body).toHaveProperty('lastName', newMemberData.lastName);
      expect(response.body).toHaveProperty('role', newMemberData.role);
      expect(response.body).not.toHaveProperty('passwordHash');
      expect(response.body).toHaveProperty('temporaryPassword');
    });

    it('should return 403 for staff attempting to create member', async () => {
      const newMemberData = {
        email: 'staff-attempt@example.com',
        firstName: 'Staff',
        lastName: 'Attempt',
        role: 'MEMBER',
      };

      const response = await request(app)
        .post('/api/v1/admin/members')
        .set('Authorization', `Bearer ${staffToken}`)
        .send(newMemberData);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 403 for regular member attempting to create member', async () => {
      const newMemberData = {
        email: 'member-attempt@example.com',
        firstName: 'Member',
        lastName: 'Attempt',
        role: 'MEMBER',
      };

      const response = await request(app)
        .post('/api/v1/admin/members')
        .set('Authorization', `Bearer ${memberToken}`)
        .send(newMemberData);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 without authentication', async () => {
      const newMemberData = {
        email: 'noauth@example.com',
        firstName: 'No',
        lastName: 'Auth',
        role: 'MEMBER',
      };

      const response = await request(app).post('/api/v1/admin/members').send(newMemberData);

      expect(response.status).toBe(401);
    });

    it('should return 400 for missing required fields', async () => {
      const invalidData = {
        email: 'incomplete@example.com',
        // Missing firstName, lastName
      };

      const response = await request(app)
        .post('/api/v1/admin/members')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid email format', async () => {
      const invalidData = {
        email: 'not-an-email',
        firstName: 'Test',
        lastName: 'User',
        role: 'MEMBER',
      };

      const response = await request(app)
        .post('/api/v1/admin/members')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 409 for duplicate email', async () => {
      // Create first member
      const firstMember = await request(app)
        .post('/api/v1/admin/members')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'duplicate@example.com',
          firstName: 'First',
          lastName: 'Member',
          role: 'MEMBER',
        });

      if (firstMember.status === 201) {
        createdMemberIds.push(firstMember.body.id);
      }

      // Try to create second member with same email
      const response = await request(app)
        .post('/api/v1/admin/members')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'duplicate@example.com',
          firstName: 'Second',
          lastName: 'Member',
          role: 'MEMBER',
        });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/admin/members - List Members', () => {
    it('should return list of members for admin', async () => {
      const response = await request(app)
        .get('/api/v1/admin/members')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
    });

    it('should include all member details for admin (including sensitive data)', async () => {
      const response = await request(app)
        .get('/api/v1/admin/members')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      if (response.body.data.length > 0) {
        const member = response.body.data[0];
        expect(member).toHaveProperty('id');
        expect(member).toHaveProperty('email');
        expect(member).toHaveProperty('firstName');
        expect(member).toHaveProperty('lastName');
        expect(member).toHaveProperty('role');
        expect(member).toHaveProperty('membershipDate');
        expect(member).not.toHaveProperty('passwordHash');
      }
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/v1/admin/members?page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });

    it('should support search by name', async () => {
      const response = await request(app)
        .get('/api/v1/admin/members?search=Admin')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(
        response.body.data.some(
          (m: any) => m.firstName.includes('Admin') || m.lastName.includes('Admin')
        )
      ).toBe(true);
    });

    it('should support filtering by role', async () => {
      const response = await request(app)
        .get('/api/v1/admin/members?role=ADMIN')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.every((m: any) => m.role === 'ADMIN')).toBe(true);
    });

    it('should return 403 for staff user', async () => {
      const response = await request(app)
        .get('/api/v1/admin/members')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(response.status).toBe(403);
    });

    it('should return 403 for regular member', async () => {
      const response = await request(app)
        .get('/api/v1/admin/members')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(response.status).toBe(403);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app).get('/api/v1/admin/members');

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/v1/admin/members/:id - Delete Member', () => {
    let deletableMemberId: string;

    beforeEach(async () => {
      // Create a member to delete
      const member = await prisma.member.create({
        data: {
          email: 'to-delete@example.com',
          passwordHash: await passwordService.hash('DeleteMe123!'),
          firstName: 'To',
          lastName: 'Delete',
          role: 'MEMBER',
          membershipDate: new Date(),
          privacySettings: { showPhone: true, showEmail: true, showAddress: true },
        },
      });
      deletableMemberId = member.id;
    });

    afterEach(async () => {
      // Cleanup
      await prisma.member.deleteMany({
        where: { email: 'to-delete@example.com' },
      });
    });

    it('should soft delete member with admin token', async () => {
      const response = await request(app)
        .delete(`/api/v1/admin/members/${deletableMemberId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');

      // Verify soft delete
      const deletedMember = await prisma.member.findUnique({
        where: { id: deletableMemberId },
      });
      expect(deletedMember?.deletedAt).not.toBeNull();
    });

    it('should return 403 for staff attempting to delete', async () => {
      const response = await request(app)
        .delete(`/api/v1/admin/members/${deletableMemberId}`)
        .set('Authorization', `Bearer ${staffToken}`);

      expect(response.status).toBe(403);
    });

    it('should return 403 for regular member attempting to delete', async () => {
      const response = await request(app)
        .delete(`/api/v1/admin/members/${deletableMemberId}`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(response.status).toBe(403);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app).delete(`/api/v1/admin/members/${deletableMemberId}`);

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent member', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .delete(`/api/v1/admin/members/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });

    it('should prevent deleting own account', async () => {
      const response = await request(app)
        .delete(`/api/v1/admin/members/${adminId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Cannot delete your own account');
    });
  });

  describe('GET /api/v1/admin/audit-logs - Audit Logs', () => {
    it('should return audit logs for admin', async () => {
      const response = await request(app)
        .get('/api/v1/admin/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('pagination');
    });

    it('should support filtering by action', async () => {
      const response = await request(app)
        .get('/api/v1/admin/audit-logs?action=CREATE')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      if (response.body.data.length > 0) {
        expect(response.body.data.every((log: any) => log.action === 'CREATE')).toBe(true);
      }
    });

    it('should support filtering by entityType', async () => {
      const response = await request(app)
        .get('/api/v1/admin/audit-logs?entityType=MEMBER')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      if (response.body.data.length > 0) {
        expect(response.body.data.every((log: any) => log.entityType === 'MEMBER')).toBe(true);
      }
    });

    it('should support date range filtering', async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();

      const response = await request(app)
        .get(`/api/v1/admin/audit-logs?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });

    it('should return 403 for staff user', async () => {
      const response = await request(app)
        .get('/api/v1/admin/audit-logs')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(response.status).toBe(403);
    });

    it('should return 403 for regular member', async () => {
      const response = await request(app)
        .get('/api/v1/admin/audit-logs')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/v1/admin/export/members - Export Members', () => {
    it('should export members as JSON by default', async () => {
      const response = await request(app)
        .get('/api/v1/admin/export/members')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.header['content-type']).toMatch(/json/);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should export members as CSV when requested', async () => {
      const response = await request(app)
        .get('/api/v1/admin/export/members?format=csv')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.header['content-type']).toMatch(/csv|text/);
      expect(response.header['content-disposition']).toMatch(/attachment/);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/api/v1/admin/export/members')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/v1/admin/export/events - Export Events', () => {
    it('should export events as JSON by default', async () => {
      const response = await request(app)
        .get('/api/v1/admin/export/events')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.header['content-type']).toMatch(/json/);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should export events as CSV when requested', async () => {
      const response = await request(app)
        .get('/api/v1/admin/export/events?format=csv')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.header['content-type']).toMatch(/csv|text/);
      expect(response.header['content-disposition']).toMatch(/attachment/);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/api/v1/admin/export/events')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(response.status).toBe(403);
    });
  });
});
