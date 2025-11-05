/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/performance'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  verbose: true,
  testTimeout: 90000,
  // NO setupFilesAfterEnv - performance tests connect to running server
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  // Disable coverage for performance tests
  collectCoverage: false,
};
