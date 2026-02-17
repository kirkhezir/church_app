// Backend test setup
// This file runs before all Jest tests

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-for-testing-only';
process.env.DATABASE_URL = 'postgresql://postgres:admin123@localhost:5432/church_app';

// Global test timeout
jest.setTimeout(10000);

// Mock console methods to reduce noise in test output
global.console = {
  ...console,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  log: jest.fn() as any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug: jest.fn() as any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info: jest.fn() as any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn: jest.fn() as any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: jest.fn() as any,
};
