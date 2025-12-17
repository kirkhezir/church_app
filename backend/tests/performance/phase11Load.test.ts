/**
 * Performance Tests for Health, Reports, and Push Notification APIs
 *
 * Tests backend performance under load for new Phase 11 features:
 * - Health check endpoint performance
 * - Report generation under load
 * - Push notification subscription handling
 *
 * NOTE: These tests require a running server
 * Run manually with: npm run test:perf
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import axios, { AxiosError } from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:3000';
const CONCURRENT_REQUESTS = 50;
const HEALTH_CHECK_ITERATIONS = 100;

// Skip in CI environment
const isCI = process.env.CI === 'true' || process.env.NODE_ENV === 'test';

// Test credentials
const ADMIN_EMAIL = 'admin@singburi-adventist.org';
const ADMIN_PASSWORD = 'Admin123!';

interface PerformanceMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  requestsPerSecond: number;
}

/**
 * Helper function to login and get auth token
 */
async function loginUser(email: string, password: string): Promise<string> {
  const response = await axios.post(`${API_URL}/api/v1/auth/login`, {
    email,
    password,
  });
  return response.data.accessToken;
}

/**
 * Helper function to measure request performance
 */
async function measureRequest(
  requestFn: () => Promise<unknown>
): Promise<{ success: boolean; responseTime: number; error?: string }> {
  const startTime = Date.now();
  try {
    await requestFn();
    const responseTime = Date.now() - startTime;
    return { success: true, responseTime };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    const axiosError = error as AxiosError;
    return {
      success: false,
      responseTime,
      error: axiosError.message,
    };
  }
}

/**
 * Calculate performance metrics from results
 */
function calculateMetrics(
  results: Array<{ success: boolean; responseTime: number }>,
  durationMs: number
): PerformanceMetrics {
  const responseTimes = results.map((r) => r.responseTime).sort((a, b) => a - b);
  const successfulRequests = results.filter((r) => r.success).length;

  return {
    totalRequests: results.length,
    successfulRequests,
    failedRequests: results.length - successfulRequests,
    averageResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
    minResponseTime: responseTimes[0] || 0,
    maxResponseTime: responseTimes[responseTimes.length - 1] || 0,
    p95ResponseTime: responseTimes[Math.floor(responseTimes.length * 0.95)] || 0,
    p99ResponseTime: responseTimes[Math.floor(responseTimes.length * 0.99)] || 0,
    requestsPerSecond: (results.length / durationMs) * 1000,
  };
}

/**
 * Print metrics report
 */
function printMetrics(name: string, metrics: PerformanceMetrics): void {
  console.log(`\n=== ${name} Performance Metrics ===`);
  console.log(`Total Requests: ${metrics.totalRequests}`);
  console.log(`Successful: ${metrics.successfulRequests}`);
  console.log(`Failed: ${metrics.failedRequests}`);
  console.log(
    `Success Rate: ${((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2)}%`
  );
  console.log(`Average Response Time: ${metrics.averageResponseTime.toFixed(2)}ms`);
  console.log(`Min Response Time: ${metrics.minResponseTime}ms`);
  console.log(`Max Response Time: ${metrics.maxResponseTime}ms`);
  console.log(`P95 Response Time: ${metrics.p95ResponseTime}ms`);
  console.log(`P99 Response Time: ${metrics.p99ResponseTime}ms`);
  console.log(`Requests/Second: ${metrics.requestsPerSecond.toFixed(2)}`);
}

describe('Health Check Performance', () => {
  const conditionalIt = isCI ? it.skip : it;

  conditionalIt(
    'should handle rapid health check requests',
    async () => {
      const results: Array<{ success: boolean; responseTime: number }> = [];
      const startTime = Date.now();

      // Sequential rapid requests
      for (let i = 0; i < HEALTH_CHECK_ITERATIONS; i++) {
        const result = await measureRequest(() => axios.get(`${API_URL}/health`));
        results.push(result);
      }

      const duration = Date.now() - startTime;
      const metrics = calculateMetrics(results, duration);
      printMetrics('Health Check (Sequential)', metrics);

      // Assertions
      expect(metrics.successfulRequests / metrics.totalRequests).toBeGreaterThan(0.99);
      expect(metrics.averageResponseTime).toBeLessThan(100); // Should be fast
      expect(metrics.p95ResponseTime).toBeLessThan(200);
    },
    60000
  );

  conditionalIt(
    'should handle concurrent health check requests',
    async () => {
      const startTime = Date.now();
      const requests = Array(CONCURRENT_REQUESTS)
        .fill(null)
        .map(() => measureRequest(() => axios.get(`${API_URL}/health`)));

      const results = await Promise.all(requests);
      const duration = Date.now() - startTime;
      const metrics = calculateMetrics(results, duration);
      printMetrics('Health Check (Concurrent)', metrics);

      expect(metrics.successfulRequests / metrics.totalRequests).toBeGreaterThan(0.99);
      expect(metrics.p95ResponseTime).toBeLessThan(500);
    },
    30000
  );

  conditionalIt(
    'should handle detailed health check under load',
    async () => {
      const results: Array<{ success: boolean; responseTime: number }> = [];
      const startTime = Date.now();

      for (let i = 0; i < 50; i++) {
        const result = await measureRequest(() => axios.get(`${API_URL}/health/detailed`));
        results.push(result);
      }

      const duration = Date.now() - startTime;
      const metrics = calculateMetrics(results, duration);
      printMetrics('Detailed Health Check', metrics);

      expect(metrics.successfulRequests / metrics.totalRequests).toBeGreaterThan(0.95);
      expect(metrics.averageResponseTime).toBeLessThan(500); // May include DB check
    },
    60000
  );
});

describe('Report Generation Performance', () => {
  const conditionalIt = isCI ? it.skip : it;
  let adminToken: string;

  beforeAll(async () => {
    if (!isCI) {
      try {
        adminToken = await loginUser(ADMIN_EMAIL, ADMIN_PASSWORD);
      } catch (error) {
        console.warn('Could not login admin for report tests:', error);
      }
    }
  });

  conditionalIt(
    'should handle member report generation',
    async () => {
      if (!adminToken) {
        console.log('Skipping - no admin token');
        return;
      }

      const results: Array<{ success: boolean; responseTime: number }> = [];
      const startTime = Date.now();

      // Generate 5 reports sequentially (reports are expensive)
      for (let i = 0; i < 5; i++) {
        const result = await measureRequest(() =>
          axios.get(`${API_URL}/api/v1/reports/members`, {
            headers: { Authorization: `Bearer ${adminToken}` },
            responseType: 'arraybuffer',
          })
        );
        results.push(result);
      }

      const duration = Date.now() - startTime;
      const metrics = calculateMetrics(results, duration);
      printMetrics('Member Report Generation', metrics);

      expect(metrics.successfulRequests).toBeGreaterThanOrEqual(4);
      expect(metrics.averageResponseTime).toBeLessThan(5000); // PDF gen can be slow
    },
    60000
  );

  conditionalIt(
    'should handle events report generation',
    async () => {
      if (!adminToken) {
        console.log('Skipping - no admin token');
        return;
      }

      const results: Array<{ success: boolean; responseTime: number }> = [];
      const startTime = Date.now();

      for (let i = 0; i < 5; i++) {
        const result = await measureRequest(() =>
          axios.get(`${API_URL}/api/v1/reports/events`, {
            headers: { Authorization: `Bearer ${adminToken}` },
            responseType: 'arraybuffer',
          })
        );
        results.push(result);
      }

      const duration = Date.now() - startTime;
      const metrics = calculateMetrics(results, duration);
      printMetrics('Events Report Generation', metrics);

      expect(metrics.successfulRequests).toBeGreaterThanOrEqual(4);
    },
    60000
  );
});

describe('Push Notification API Performance', () => {
  const conditionalIt = isCI ? it.skip : it;
  let userToken: string;

  beforeAll(async () => {
    if (!isCI) {
      try {
        userToken = await loginUser('john.doe@example.com', 'Member123!');
      } catch (error) {
        console.warn('Could not login user for push tests:', error);
      }
    }
  });

  conditionalIt(
    'should handle VAPID key requests efficiently',
    async () => {
      if (!userToken) {
        console.log('Skipping - no user token');
        return;
      }

      const results: Array<{ success: boolean; responseTime: number }> = [];
      const startTime = Date.now();

      for (let i = 0; i < 50; i++) {
        const result = await measureRequest(() =>
          axios.get(`${API_URL}/api/v1/push/vapid-key`, {
            headers: { Authorization: `Bearer ${userToken}` },
          })
        );
        results.push(result);
      }

      const duration = Date.now() - startTime;
      const metrics = calculateMetrics(results, duration);
      printMetrics('VAPID Key Requests', metrics);

      expect(metrics.successfulRequests / metrics.totalRequests).toBeGreaterThan(0.95);
      expect(metrics.averageResponseTime).toBeLessThan(100);
    },
    30000
  );

  conditionalIt(
    'should handle push status requests efficiently',
    async () => {
      if (!userToken) {
        console.log('Skipping - no user token');
        return;
      }

      const results: Array<{ success: boolean; responseTime: number }> = [];
      const startTime = Date.now();

      for (let i = 0; i < 50; i++) {
        const result = await measureRequest(() =>
          axios.get(`${API_URL}/api/v1/push/status`, {
            headers: { Authorization: `Bearer ${userToken}` },
          })
        );
        results.push(result);
      }

      const duration = Date.now() - startTime;
      const metrics = calculateMetrics(results, duration);
      printMetrics('Push Status Requests', metrics);

      expect(metrics.successfulRequests / metrics.totalRequests).toBeGreaterThan(0.95);
      expect(metrics.averageResponseTime).toBeLessThan(200);
    },
    30000
  );
});

describe('Database Query Optimization Verification', () => {
  const conditionalIt = isCI ? it.skip : it;
  let adminToken: string;

  beforeAll(async () => {
    if (!isCI) {
      try {
        adminToken = await loginUser(ADMIN_EMAIL, ADMIN_PASSWORD);
      } catch (error) {
        console.warn('Could not login for DB tests:', error);
      }
    }
  });

  conditionalIt(
    'should handle paginated member queries efficiently',
    async () => {
      if (!adminToken) {
        console.log('Skipping - no admin token');
        return;
      }

      const results: Array<{ success: boolean; responseTime: number }> = [];
      const startTime = Date.now();

      // Test pagination
      for (let page = 1; page <= 10; page++) {
        const result = await measureRequest(() =>
          axios.get(`${API_URL}/api/v1/members?page=${page}&limit=20`, {
            headers: { Authorization: `Bearer ${adminToken}` },
          })
        );
        results.push(result);
      }

      const duration = Date.now() - startTime;
      const metrics = calculateMetrics(results, duration);
      printMetrics('Paginated Member Queries', metrics);

      expect(metrics.successfulRequests / metrics.totalRequests).toBeGreaterThan(0.95);
      expect(metrics.averageResponseTime).toBeLessThan(300);
    },
    30000
  );

  conditionalIt(
    'should handle event listing with includes efficiently',
    async () => {
      const results: Array<{ success: boolean; responseTime: number }> = [];
      const startTime = Date.now();

      for (let i = 0; i < 30; i++) {
        const result = await measureRequest(() =>
          axios.get(`${API_URL}/api/v1/events?includeRsvpCount=true`)
        );
        results.push(result);
      }

      const duration = Date.now() - startTime;
      const metrics = calculateMetrics(results, duration);
      printMetrics('Event Listing with RSVP Counts', metrics);

      expect(metrics.successfulRequests / metrics.totalRequests).toBeGreaterThan(0.95);
      expect(metrics.averageResponseTime).toBeLessThan(500);
    },
    30000
  );

  conditionalIt(
    'should handle announcement queries efficiently',
    async () => {
      if (!adminToken) {
        console.log('Skipping - no admin token');
        return;
      }

      const results: Array<{ success: boolean; responseTime: number }> = [];
      const startTime = Date.now();

      for (let i = 0; i < 30; i++) {
        const result = await measureRequest(() =>
          axios.get(`${API_URL}/api/v1/announcements`, {
            headers: { Authorization: `Bearer ${adminToken}` },
          })
        );
        results.push(result);
      }

      const duration = Date.now() - startTime;
      const metrics = calculateMetrics(results, duration);
      printMetrics('Announcement Queries', metrics);

      expect(metrics.successfulRequests / metrics.totalRequests).toBeGreaterThan(0.95);
      expect(metrics.averageResponseTime).toBeLessThan(300);
    },
    30000
  );
});
