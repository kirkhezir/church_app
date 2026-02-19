/**
 * Integration Tests for Auth API Endpoints (T070)
 *
 * Tests the complete authentication flow through HTTP:
 * - POST /api/v1/auth/login
 * - POST /api/v1/auth/password/reset-request
 * - POST /api/v1/auth/password/reset
 *
 * Creates members directly in DB (register endpoint not yet implemented).
 */

import { randomUUID } from 'crypto';
import { testPrisma, request, cleanDatabase } from './setup';
import { PasswordService } from '../../src/infrastructure/auth/passwordService';
import { JWTService } from '../../src/infrastructure/auth/jwtService';

const passwordService = new PasswordService();
const jwtService = new JWTService();

describe('Auth API Integration Tests', () => {
  const testPassword = 'TestPass123!';
  let testMemberId: string;

  beforeAll(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await cleanDatabase();
  });

  /**
   * Helper to insert a test member directly into the database.
   */
  async function createMemberInDB(
    overrides: Partial<{
      email: string;
      password: string;
      role: 'ADMIN' | 'STAFF' | 'MEMBER';
      firstName: string;
      lastName: string;
    }> = {}
  ) {
    const email = overrides.email ?? `auth-test-${randomUUID().slice(0, 8)}@example.com`;
    const hashedPassword = await passwordService.hash(overrides.password ?? testPassword);
    const id = randomUUID();

    await testPrisma.members.create({
      data: {
        id,
        email,
        passwordHash: hashedPassword,
        firstName: overrides.firstName ?? 'Auth',
        lastName: overrides.lastName ?? 'Test',
        role: overrides.role ?? ('MEMBER' as const),
        membershipDate: new Date(),
        updatedAt: new Date(),
        privacySettings: { showPhone: true, showEmail: true, showAddress: true },
      },
    });

    return { id, email };
  }

  // ─── LOGIN ─────────────────────────────────────────────────────────────────

  describe('POST /api/v1/auth/login', () => {
    let memberEmail: string;

    beforeAll(async () => {
      const member = await createMemberInDB({ email: 'login-test@example.com' });
      testMemberId = member.id;
      memberEmail = member.email;
    });

    it('should return 200 and tokens with valid credentials', async () => {
      const response = await request
        .post('/api/v1/auth/login')
        .send({ email: memberEmail, password: testPassword });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.member).toHaveProperty('id');
      expect(response.body.member.email).toBe(memberEmail);
    });

    it('should return 401 for invalid password', async () => {
      const response = await request
        .post('/api/v1/auth/login')
        .send({ email: memberEmail, password: 'WrongPassword123!' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 for non-existent email', async () => {
      const response = await request
        .post('/api/v1/auth/login')
        .send({ email: 'nobody@example.com', password: testPassword });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when email is missing', async () => {
      const response = await request.post('/api/v1/auth/login').send({ password: testPassword });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when password is missing', async () => {
      const response = await request.post('/api/v1/auth/login').send({ email: memberEmail });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  // ─── PASSWORD RESET REQUEST ────────────────────────────────────────────────

  describe('POST /api/v1/auth/password/reset-request', () => {
    it('should return 200 for existing email (no enumeration leak)', async () => {
      await createMemberInDB({ email: 'reset-request-test@example.com' });

      const response = await request
        .post('/api/v1/auth/password/reset-request')
        .send({ email: 'reset-request-test@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 200 even for non-existent email', async () => {
      const response = await request
        .post('/api/v1/auth/password/reset-request')
        .send({ email: 'nonexistent-user@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 when email is missing', async () => {
      const response = await request.post('/api/v1/auth/password/reset-request').send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  // ─── PASSWORD RESET ────────────────────────────────────────────────────────

  describe('POST /api/v1/auth/password/reset', () => {
    it('should return 400 with invalid token', async () => {
      const response = await request
        .post('/api/v1/auth/password/reset')
        .send({ token: 'invalid-token', newPassword: 'NewPass123!' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 when token is missing', async () => {
      const response = await request
        .post('/api/v1/auth/password/reset')
        .send({ newPassword: 'NewPass123!' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when newPassword is missing', async () => {
      const response = await request
        .post('/api/v1/auth/password/reset')
        .send({ token: 'some-token' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for weak password', async () => {
      const response = await request
        .post('/api/v1/auth/password/reset')
        .send({ token: 'some-token', newPassword: 'weak' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
