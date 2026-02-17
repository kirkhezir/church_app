import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import supertest from 'supertest';
import { server } from '../../src/presentation/server';
import { contactService } from '../../src/presentation/routes/contactRoutes';

// Set test environment
process.env.NODE_ENV = 'test';

/**
 * Test database client (separate from production)
 */
const testConnectionString = process.env.DATABASE_URL_TEST || process.env.DATABASE_URL;
const testAdapter = new PrismaPg({ connectionString: testConnectionString! });
export const testPrisma = new PrismaClient({
  adapter: testAdapter,
});

/**
 * Supertest agent for making HTTP requests
 * Uses the server.app instance from the Express Server class
 */
export const request = supertest(server.app);

/**
 * Export shared ContactService for testing
 */
export { contactService };

/**
 * Clean database tables
 * Truncates all tables in correct order (respecting foreign keys)
 */
export async function cleanDatabase(): Promise<void> {
  // Delete in order to respect foreign key constraints
  // Audit logs must be deleted first since they reference members
  await testPrisma.audit_logs.deleteMany();
  await testPrisma.member_announcement_views.deleteMany();
  await testPrisma.event_rsvps.deleteMany();
  await testPrisma.messages.deleteMany();
  await testPrisma.announcements.deleteMany();
  await testPrisma.events.deleteMany();
  await testPrisma.members.deleteMany();
}

/**
 * Reset database sequences
 * Not needed for UUID-based IDs, but kept for compatibility
 */
export async function resetSequences(): Promise<void> {
  // No-op for UUID-based schemas
  // If using auto-increment IDs in future, add sequence resets here
}

/**
 * Setup function to run before all tests
 */
export async function setupTestDatabase(): Promise<void> {
  await cleanDatabase();
  await resetSequences();
}

/**
 * Teardown function to run after all tests
 */
export async function teardownTestDatabase(): Promise<void> {
  await cleanDatabase();
  await testPrisma.$disconnect();
}

/**
 * Create authenticated request with JWT token
 * @param token JWT access token
 */
export function authenticatedRequest(token: string) {
  return {
    get: (url: string) => request.get(url).set('Authorization', `Bearer ${token}`),
    post: (url: string) => request.post(url).set('Authorization', `Bearer ${token}`),
    put: (url: string) => request.put(url).set('Authorization', `Bearer ${token}`),
    patch: (url: string) => request.patch(url).set('Authorization', `Bearer ${token}`),
    delete: (url: string) => request.delete(url).set('Authorization', `Bearer ${token}`),
  };
}

/**
 * Helper to login and get access token
 */
export async function loginAndGetToken(email: string, password: string): Promise<string> {
  const response = await request.post('/api/v1/auth/login').send({ email, password }).expect(200);

  return response.body.data.accessToken;
}

/**
 * Helper to create test member and get token
 */
export async function createTestMemberAndLogin(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'ADMIN' | 'STAFF' | 'MEMBER';
}): Promise<{ token: string; memberId: string }> {
  // Delete existing member with this email if exists (including related data)
  const existingMember = await testPrisma.members.findFirst({
    where: { email: data.email },
  });

  if (existingMember) {
    await testPrisma.audit_logs.deleteMany({ where: { userId: existingMember.id } });
    await testPrisma.member_announcement_views.deleteMany({ where: { memberId: existingMember.id } });
    await testPrisma.event_rsvps.deleteMany({ where: { memberId: existingMember.id } });
    await testPrisma.messages.deleteMany({
      where: { OR: [{ senderId: existingMember.id }, { recipientId: existingMember.id }] },
    });
    await testPrisma.events.deleteMany({ where: { createdById: existingMember.id } });
    await testPrisma.announcements.deleteMany({ where: { authorId: existingMember.id } });
    await testPrisma.members.delete({ where: { id: existingMember.id } });
  }

  // Register member
  const registerResponse = await request
    .post('/api/v1/auth/register')
    .send({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
    })
    .expect(201);

  const memberId = registerResponse.body.data.user.id;

  // Update role if needed (requires direct DB access)
  if (data.role && data.role !== 'MEMBER') {
    await testPrisma.members.update({
      where: { id: memberId },
      data: { role: data.role },
    });
  }

  // Login to get token
  const token = await loginAndGetToken(data.email, data.password);

  return { token, memberId };
}

/**
 * Wait for async operations to complete
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Jest global setup
 */
beforeAll(async () => {
  await setupTestDatabase();
});

/**
 * Jest global teardown
 */
afterAll(async () => {
  await teardownTestDatabase();
});

/**
 * Clean database before each test
 * TEMPORARILY DISABLED: Contract tests manage their own data lifecycle
 */
// beforeEach(async () => {
//   await cleanDatabase();
// });
