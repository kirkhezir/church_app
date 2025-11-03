# Test Infrastructure Guide

This document explains how to use the test infrastructure for the Church Management Application.

## Overview

The test infrastructure provides three key components:

1. **Contract Test Helpers** - Validate API responses against OpenAPI specification
2. **Integration Test Utilities** - Setup, database management, and authentication helpers
3. **Test Fixtures (Factories)** - Generate test data for entities

## Quick Start

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- example.test.ts
```

## 1. Contract Test Helpers

### OpenAPIValidator

Validates HTTP responses against the OpenAPI spec in `specs/001-full-stack-web/contracts/openapi.yaml`.

```typescript
import { expectValidApiResponse } from '../contract/helpers/openapi-validator';

// In your test
const response = await request.post('/api/v1/auth/register').send(data).expect(201);

// Validate response matches OpenAPI spec
expectValidApiResponse(response, 'POST', '/api/v1/auth/register');
```

**Features:**

- Path parameter matching (e.g., `/api/v1/members/{id}`)
- Schema reference resolution (`$ref`)
- Detailed error reporting
- Automatic status code validation

## 2. Integration Test Utilities

### Database Management

```typescript
import { testPrisma, cleanDatabase, resetSequences } from '../integration/setup';

// Clean all tables (respects foreign keys)
await cleanDatabase();

// Reset auto-increment sequences (no-op for UUID schema)
await resetSequences();

// Direct database access
const members = await testPrisma.member.findMany();
```

**Auto-cleanup:** The `beforeEach` hook automatically cleans the database before each test.

### HTTP Requests

```typescript
import { request, authenticatedRequest } from '../integration/setup';

// Unauthenticated request
const response = await request.post('/api/v1/auth/login').send({
  email: 'test@example.com',
  password: 'Test123!',
});

// Authenticated request
const authRequest = authenticatedRequest(token);
const profile = await authRequest.get('/api/v1/members/123');
```

### Authentication Helpers

```typescript
import { loginAndGetToken, createTestMemberAndLogin } from '../integration/setup';

// Login existing user
const token = await loginAndGetToken('admin@example.com', 'Admin123!');

// Create member and login
const { token, memberId } = await createTestMemberAndLogin({
  email: 'newuser@example.com',
  password: 'Test123!',
  firstName: 'Test',
  lastName: 'User',
  role: 'ADMIN', // Optional: 'ADMIN', 'STAFF', or 'MEMBER' (default)
});
```

## 3. Test Fixtures (Factories)

### MemberFactory

```typescript
import { MemberFactory, resetAllFactories } from '../fixtures/factories';

// Create member with defaults
const member = await MemberFactory.create();

// Create member with custom data
const admin = await MemberFactory.create({
  email: 'custom@example.com',
  firstName: 'Custom',
  role: 'ADMIN',
});

// Create multiple members
const members = await MemberFactory.createMany(5);

// Create specific role
const admin = await MemberFactory.createAdmin();
const staff = await MemberFactory.createStaff();

// Build data without saving (for request bodies)
const data = MemberFactory.build({ email: 'test@example.com' });
```

### EventFactory

```typescript
import { EventFactory } from '../fixtures/factories';

// Create event (requires creator ID)
const event = await EventFactory.create(creatorId);

// Create specific category
const worship = await EventFactory.createWorship(creatorId);
const bibleStudy = await EventFactory.createBibleStudy(creatorId);

// Create multiple events
const events = await EventFactory.createMany(creatorId, 3);

// Custom event
const event = await EventFactory.create(creatorId, {
  title: 'Special Event',
  category: 'FELLOWSHIP',
  maxCapacity: 200,
});
```

### AnnouncementFactory

```typescript
import { AnnouncementFactory } from '../fixtures/factories';

// Create announcement (requires author ID)
const announcement = await AnnouncementFactory.create(authorId);

// Create urgent announcement
const urgent = await AnnouncementFactory.createUrgent(authorId);

// Create archived announcement
const archived = await AnnouncementFactory.createArchived(authorId);

// Create multiple
const announcements = await AnnouncementFactory.createMany(authorId, 5);
```

### EventRSVPFactory

```typescript
import { EventRSVPFactory } from '../fixtures/factories';

// Create RSVP
const rsvp = await EventRSVPFactory.create(eventId, memberId);

// Create confirmed RSVP
const confirmed = await EventRSVPFactory.createConfirmed(eventId, memberId);

// Create waitlisted RSVP
const waitlisted = await EventRSVPFactory.createWaitlisted(eventId, memberId);
```

### Reset Factories

Always reset factory counters in `beforeEach` for consistent test data:

```typescript
import { resetAllFactories } from '../fixtures/factories';

beforeEach(async () => {
  resetAllFactories();
});
```

## Complete Test Example

```typescript
import { request, authenticatedRequest, createTestMemberAndLogin } from './setup';
import { MemberFactory, EventFactory, resetAllFactories } from '../fixtures/factories';
import { expectValidApiResponse } from '../contract/helpers/openapi-validator';

describe('Event Management', () => {
  let staffToken: string;
  let staffId: string;
  let memberToken: string;
  let memberId: string;

  beforeEach(async () => {
    // Reset factories for clean data
    resetAllFactories();

    // Create test users
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

  it('should allow staff to create event', async () => {
    const authRequest = authenticatedRequest(staffToken);

    const response = await authRequest
      .post('/api/v1/events')
      .send({
        title: 'Sunday Worship',
        description: 'Weekly service',
        category: 'WORSHIP',
        startDateTime: new Date(Date.now() + 86400000).toISOString(),
        endDateTime: new Date(Date.now() + 90000000).toISOString(),
        location: 'Main Sanctuary',
        maxCapacity: 100,
      })
      .expect(201);

    // Validate response
    expectValidApiResponse(response, 'POST', '/api/v1/events');

    expect(response.body.data.title).toBe('Sunday Worship');
  });

  it('should allow member to RSVP', async () => {
    // Create test event
    const event = await EventFactory.createWorship(staffId);

    const authRequest = authenticatedRequest(memberToken);

    const response = await authRequest
      .post(`/api/v1/events/${event.id}/rsvp`)
      .send({ status: 'CONFIRMED' })
      .expect(201);

    expectValidApiResponse(response, 'POST', `/api/v1/events/${event.id}/rsvp`);

    expect(response.body.data.status).toBe('CONFIRMED');
  });
});
```

## Test Organization

```
backend/tests/
├── contract/
│   └── helpers/
│       └── openapi-validator.ts    # OpenAPI validation
├── integration/
│   ├── setup.ts                    # Test utilities & database setup
│   └── example.test.ts             # Example tests
└── fixtures/
    └── factories.ts                # Test data factories
```

## Best Practices

### 1. Use Factories for Test Data

❌ **Don't:**

```typescript
await testPrisma.member.create({
  data: {
    email: 'test@example.com',
    passwordHash: await bcrypt.hash('Test123!', 10),
    firstName: 'Test',
    lastName: 'User',
    // ... 15 more fields
  },
});
```

✅ **Do:**

```typescript
await MemberFactory.create({ email: 'test@example.com' });
```

### 2. Reset Factories in beforeEach

```typescript
beforeEach(async () => {
  resetAllFactories(); // Ensures consistent counter-based data
});
```

### 3. Use Contract Validation

Always validate API responses against OpenAPI spec:

```typescript
const response = await request.get('/api/v1/members');
expectValidApiResponse(response, 'GET', '/api/v1/members');
```

### 4. Organize Tests by Feature

```typescript
describe('Authentication', () => {
  describe('Registration', () => {
    it('should register new member', async () => {
      /* ... */
    });
    it('should reject duplicate email', async () => {
      /* ... */
    });
  });

  describe('Login', () => {
    it('should login with valid credentials', async () => {
      /* ... */
    });
    it('should reject invalid password', async () => {
      /* ... */
    });
  });
});
```

### 5. Test Role-Based Access

```typescript
it('should allow admin to delete member', async () => {
  const authRequest = authenticatedRequest(adminToken);
  await authRequest.delete(`/api/v1/members/${memberId}`).expect(204);
});

it('should prevent member from deleting others', async () => {
  const authRequest = authenticatedRequest(memberToken);
  await authRequest.delete(`/api/v1/members/${otherMemberId}`).expect(403);
});
```

## Debugging Tests

### Enable Verbose Logging

```typescript
import { logger } from '../../src/infrastructure/logging/logger';

// In your test
logger.debug('Test data', { member, event });
```

### Inspect Database State

```typescript
// Check database state during test
const members = await testPrisma.member.findMany();
console.log('Current members:', members);
```

### Run Single Test

```bash
npm test -- -t "should allow staff to create event"
```

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Run Tests
  env:
    DATABASE_URL: postgresql://postgres:postgres@localhost:5432/church_app_test
  run: |
    npm test
    npm run test:coverage
```

### Test Database Setup

Create separate test database:

```sql
CREATE DATABASE church_app_test;
```

Set in `.env.test`:

```
DATABASE_URL_TEST=postgresql://postgres:password@localhost:5432/church_app_test
```

## Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open coverage/index.html
```

**Coverage Targets:**

- Global: 80%
- Domain layer: 90%
- Application layer: 90%

## Common Issues

### 1. Database Not Cleaned

**Symptom:** Tests fail with "unique constraint violation"

**Solution:** Ensure `beforeEach` calls `cleanDatabase()` or uses the setup file.

### 2. Factory Counter Collision

**Symptom:** Tests work individually but fail when run together

**Solution:** Call `resetAllFactories()` in `beforeEach`.

### 3. OpenAPI Validation Fails

**Symptom:** Contract test fails with "Path not found"

**Solution:** Verify OpenAPI spec path in `openapi-validator.ts` and ensure spec is up-to-date.

### 4. Timeout Errors

**Symptom:** Tests timeout after 5 seconds

**Solution:** Increase timeout in jest.config.js:

```javascript
testTimeout: 30000, // 30 seconds
```

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/ladjs/supertest)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Prisma Testing Best Practices](https://www.prisma.io/docs/guides/testing)

---

For questions or issues, check the example tests in `tests/integration/example.test.ts`.
