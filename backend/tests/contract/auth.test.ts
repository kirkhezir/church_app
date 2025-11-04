/**
 * Contract Tests: Authentication Endpoints
 *
 * Validates that auth endpoints match OpenAPI specification:
 * - POST /api/v1/auth/login
 * - POST /api/v1/auth/refresh
 * - POST /api/v1/auth/logout
 *
 * RED PHASE: These tests should FAIL until implementation is complete
 */

import request from 'supertest';
import { Server } from '../../src/presentation/server';
import prisma from '../../src/infrastructure/database/prismaClient';
import { PasswordService } from '../../src/infrastructure/auth/passwordService';

const passwordService = new PasswordService();
const server = new Server();
const app = server.app;

describe('Contract Tests: Authentication Endpoints', () => {
  let testMemberId: string;

  beforeAll(async () => {
    // Clean up any existing test data
    await prisma.member.deleteMany({
      where: {
        email: {
          in: ['auth-test@example.com', 'lockout-test@example.com'],
        },
      },
    });

    // Create test member for authentication
    const hashedPassword = await passwordService.hash('TestPassword123!');
    const member = await prisma.member.create({
      data: {
        email: 'auth-test@example.com',
        passwordHash: hashedPassword,
        firstName: 'Auth',
        lastName: 'Test',
        role: 'MEMBER',
        phone: '+1234567890',
        membershipDate: new Date(),
        privacySettings: { showPhone: true, showEmail: true, showAddress: true },
        failedLoginAttempts: 0,
      },
    });
    testMemberId = member.id;
    console.log('Test member created:', member.id, member.email);
  });

  afterAll(async () => {
    // Cleanup
    await prisma.member.delete({ where: { id: testMemberId } }).catch(() => {});
    await prisma.$disconnect();
  });

  describe('POST /api/v1/auth/login', () => {
    it('should return 200 with access and refresh tokens for valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'auth-test@example.com',
          password: 'TestPassword123!',
        })
        .expect('Content-Type', /json/);

      if (response.status !== 200) {
        console.log('Login failed:', response.status, response.body);
      }

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('member');
      expect(response.body.member).toHaveProperty('id');
      expect(response.body.member).toHaveProperty('email', 'auth-test@example.com');
      expect(response.body.member).toHaveProperty('role', 'MEMBER');
      expect(response.body.member).not.toHaveProperty('passwordHash');
    });

    it('should return 401 for invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'TestPassword123!',
        })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid credentials');
    });

    it('should return 401 for invalid password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'auth-test@example.com',
          password: 'WrongPassword123!',
        })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid credentials');
    });

    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          password: 'TestPassword123!',
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for missing password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'auth-test@example.com',
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'invalid-email',
          password: 'TestPassword123!',
        })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should lock account after 5 failed login attempts', async () => {
      // Create a new test user for lockout testing
      const hashedPassword = await passwordService.hash('TestPassword123!');
      const lockoutMember = await prisma.member.create({
        data: {
          email: 'lockout-test@example.com',
          passwordHash: hashedPassword,
          firstName: 'Lockout',
          lastName: 'Test',
          role: 'MEMBER',
          phone: '+9876543210',
          membershipDate: new Date(),
          privacySettings: { showPhone: true, showEmail: true, showAddress: true },
          failedLoginAttempts: 0,
        },
      });

      // Attempt 5 failed logins
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/v1/auth/login')
          .send({
            email: 'lockout-test@example.com',
            password: 'WrongPassword!',
          })
          .expect(401);
      }

      // 6th attempt should return 423 (Locked)
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'lockout-test@example.com',
          password: 'TestPassword123!',
        })
        .expect('Content-Type', /json/)
        .expect(423);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('locked');

      // Cleanup
      await prisma.member.delete({ where: { id: lockoutMember.id } });
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should return 200 with new access token for valid refresh token', async () => {
      // First login to get tokens
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'auth-test@example.com',
          password: 'TestPassword123!',
        })
        .expect(200);

      const refreshToken = loginResponse.body.refreshToken;

      // Use refresh token to get new access token
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(typeof response.body.accessToken).toBe('string');
      expect(response.body.accessToken.length).toBeGreaterThan(0);
    });

    it('should return 401 for invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: 'invalid-token',
        })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid');
    });

    it('should return 400 for missing refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({})
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should return 200 and invalidate refresh token', async () => {
      // First login to get tokens
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'auth-test@example.com',
          password: 'TestPassword123!',
        })
        .expect(200);

      const refreshToken = loginResponse.body.refreshToken;
      const accessToken = loginResponse.body.accessToken;

      // Logout
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          refreshToken,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('success');

      // Try to use the refresh token - should fail
      await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken,
        })
        .expect(401);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .post('/api/v1/auth/logout')
        .send({
          refreshToken: 'some-token',
        })
        .expect(401);
    });

    it('should return 400 for missing refresh token', async () => {
      // Login first
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'auth-test@example.com',
          password: 'TestPassword123!',
        })
        .expect(200);

      const accessToken = loginResponse.body.accessToken;

      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({})
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
});
