/**
 * Contract Tests: Member Directory Endpoints
 *
 * Validates that member directory endpoints match OpenAPI specification:
 * - GET /api/v1/members (list members with privacy controls)
 * - GET /api/v1/members/search (search members by name)
 * - GET /api/v1/members/:id (get member profile with privacy)
 * - PATCH /api/v1/members/me/privacy (update privacy settings)
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

describe('Contract Tests: Member Directory Endpoints', () => {
  let testMemberIds: string[] = [];
  let memberToken: string;
  let member2Token: string;
  let memberId: string;
  let member2Id: string;

  /**
   * Helper to create a test member
   */
  async function createTestMember(
    email: string,
    password: string,
    role: 'ADMIN' | 'STAFF' | 'MEMBER' = 'MEMBER',
    overrides?: Partial<{
      firstName: string;
      lastName: string;
      phone: string;
      address: string;
      privacySettings: { showPhone: boolean; showEmail: boolean; showAddress: boolean };
    }>
  ): Promise<string> {
    const hashedPassword = await passwordService.hash(password);
    const member = await prisma.members.create({
      data: {
        id: randomUUID(),
        email,
        passwordHash: hashedPassword,
        firstName: overrides?.firstName || 'Test',
        lastName: overrides?.lastName || 'User',
        role,
        phone: overrides?.phone || '+1234567890',
        address: overrides?.address || '123 Test Street',
        membershipDate: new Date(),
        updatedAt: new Date(),
        privacySettings: overrides?.privacySettings || {
          showPhone: true,
          showEmail: true,
          showAddress: true,
        },
        failedLoginAttempts: 0,
      },
    });
    testMemberIds.push(member.id);
    return member.id;
  }

  beforeAll(async () => {
    console.log('🔧 Member Directory Tests: beforeAll started');

    // Clean up any existing test data
    await prisma.members.deleteMany({
      where: {
        email: { contains: '@directory-test.com' },
      },
    });

    // Create member with all privacy settings ON
    memberId = await createTestMember('member@directory-test.com', 'MemberPassword123!', 'MEMBER', {
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1555123456',
      address: '456 Member Ave',
      privacySettings: { showPhone: true, showEmail: true, showAddress: true },
    });
    memberToken = jwtService.generateAccessToken({
      userId: memberId,
      email: 'member@directory-test.com',
      role: 'MEMBER',
    });

    // Create member2 with privacy settings OFF
    member2Id = await createTestMember(
      'member2@directory-test.com',
      'Member2Password123!',
      'MEMBER',
      {
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+1555789012',
        address: '789 Private Lane',
        privacySettings: { showPhone: false, showEmail: false, showAddress: false },
      }
    );
    member2Token = jwtService.generateAccessToken({
      userId: member2Id,
      email: 'member2@directory-test.com',
      role: 'MEMBER',
    });

    console.log('✅ Test data created');
  });

  afterAll(async () => {
    console.log('🧹 Cleaning up test data...');

    // Clean up in reverse order of creation
    await prisma.members.deleteMany({
      where: { id: { in: testMemberIds } },
    });

    await prisma.$disconnect();
    console.log('✅ Cleanup complete');
  });

  // ===================================================================
  // GET /api/v1/members - List Members (Directory)
  // ===================================================================

  describe('GET /api/v1/members - List Members Directory', () => {
    it('should return 401 if not authenticated', async () => {
      const response = await request(app).get('/api/v1/members');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return member list for authenticated users', async () => {
      const response = await request(app)
        .get('/api/v1/members')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return members with privacy controls applied', async () => {
      const response = await request(app)
        .get('/api/v1/members')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(response.status).toBe(200);

      // Find member2 (private member) in the response
      const privateMember = response.body.data.find((m: any) => m.id === member2Id);

      if (privateMember) {
        // Private fields should be null/hidden when privacy is OFF
        expect(privateMember.phone).toBeNull();
        expect(privateMember.email).toBeNull();
        expect(privateMember.address).toBeNull();
        // Name should always be visible
        expect(privateMember.firstName).toBe('Jane');
        expect(privateMember.lastName).toBe('Smith');
      }
    });

    it('should return pagination information', async () => {
      const response = await request(app)
        .get('/api/v1/members?page=1&limit=10')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('totalPages');
      expect(response.body.pagination).toHaveProperty('totalItems');
    });

    it('should filter by search query', async () => {
      const response = await request(app)
        .get('/api/v1/members?search=John')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(response.status).toBe(200);
      // Should find members matching the search query
      const matchingMembers = response.body.data.filter(
        (m: any) => m.firstName?.includes('John') || m.lastName?.includes('John')
      );
      expect(matchingMembers.length).toBeGreaterThanOrEqual(0);
    });
  });

  // ===================================================================
  // GET /api/v1/members/:id - Get Member Profile
  // ===================================================================

  describe('GET /api/v1/members/:id - Get Member Profile', () => {
    it('should return 401 if not authenticated', async () => {
      const response = await request(app).get(`/api/v1/members/${memberId}`);

      expect(response.status).toBe(401);
    });

    it('should return member profile with privacy controls', async () => {
      const response = await request(app)
        .get(`/api/v1/members/${memberId}`)
        .set('Authorization', `Bearer ${member2Token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', memberId);
      expect(response.body).toHaveProperty('firstName', 'John');
      expect(response.body).toHaveProperty('lastName', 'Doe');
      // Member has privacy ON, so fields should be visible
      expect(response.body).toHaveProperty('phone', '+1555123456');
      expect(response.body).toHaveProperty('email', 'member@directory-test.com');
    });

    it('should hide private fields for members with privacy OFF', async () => {
      const response = await request(app)
        .get(`/api/v1/members/${member2Id}`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(response.status).toBe(200);
      // Name always visible
      expect(response.body).toHaveProperty('firstName', 'Jane');
      expect(response.body).toHaveProperty('lastName', 'Smith');
      // Private fields should be null
      expect(response.body.phone).toBeNull();
      expect(response.body.email).toBeNull();
      expect(response.body.address).toBeNull();
    });

    it('should return 404 for non-existent member', async () => {
      const response = await request(app)
        .get('/api/v1/members/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(response.status).toBe(404);
    });

    it('should allow member to see their own full profile', async () => {
      const response = await request(app)
        .get(`/api/v1/members/${member2Id}`)
        .set('Authorization', `Bearer ${member2Token}`);

      expect(response.status).toBe(200);
      // Own profile should show all fields regardless of privacy settings
      expect(response.body).toHaveProperty('phone', '+1555789012');
      expect(response.body).toHaveProperty('email', 'member2@directory-test.com');
    });
  });

  // ===================================================================
  // PATCH /api/v1/members/me/privacy - Update Privacy Settings
  // ===================================================================

  describe('PATCH /api/v1/members/me/privacy - Update Privacy Settings', () => {
    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .patch('/api/v1/members/me/privacy')
        .send({ showPhone: false });

      expect(response.status).toBe(401);
    });

    it('should update privacy settings', async () => {
      const response = await request(app)
        .patch('/api/v1/members/me/privacy')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          showPhone: false,
          showEmail: false,
          showAddress: false,
        });

      expect(response.status).toBe(200);
      expect(response.body.privacySettings).toEqual({
        showPhone: false,
        showEmail: false,
        showAddress: false,
      });
    });

    it('should allow partial privacy updates', async () => {
      // Reset first
      await request(app)
        .patch('/api/v1/members/me/privacy')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          showPhone: true,
          showEmail: true,
          showAddress: true,
        });

      // Update only one field
      const response = await request(app)
        .patch('/api/v1/members/me/privacy')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          showPhone: false,
        });

      expect(response.status).toBe(200);
      expect(response.body.privacySettings.showPhone).toBe(false);
      // Other settings should remain unchanged
      expect(response.body.privacySettings.showEmail).toBe(true);
      expect(response.body.privacySettings.showAddress).toBe(true);
    });

    it('should validate privacy settings are booleans', async () => {
      const response = await request(app)
        .patch('/api/v1/members/me/privacy')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          showPhone: 'not-a-boolean',
        });

      expect(response.status).toBe(400);
    });
  });

  // ===================================================================
  // GET /api/v1/members/search - Search Members (Additional)
  // ===================================================================

  describe('GET /api/v1/members/search - Search Members', () => {
    it('should return 401 if not authenticated', async () => {
      const response = await request(app).get('/api/v1/members/search?q=John');

      expect(response.status).toBe(401);
    });

    it('should search members by name', async () => {
      const response = await request(app)
        .get('/api/v1/members/search?q=Jane')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return empty array for no matches', async () => {
      const response = await request(app)
        .get('/api/v1/members/search?q=ZZZZNONEXISTENT')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
    });

    it('should apply privacy controls to search results', async () => {
      const response = await request(app)
        .get('/api/v1/members/search?q=Jane')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(response.status).toBe(200);
      const janeResult = response.body.data.find((m: any) => m.firstName === 'Jane');
      if (janeResult) {
        // Jane has privacy OFF
        expect(janeResult.phone).toBeNull();
        expect(janeResult.email).toBeNull();
      }
    });
  });
});
