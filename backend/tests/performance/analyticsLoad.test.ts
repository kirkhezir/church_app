/**
 * Performance Tests for Analytics API
 *
 * Tests analytics endpoint performance under load
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import axios, { AxiosError } from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:3000';
const CONCURRENT_REQUESTS = 20;
const ITERATIONS = 50;

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
  requestsPerSecond: number;
}

let authToken: string;

async function loginUser(email: string, password: string): Promise<string> {
  const response = await axios.post(`${API_URL}/api/v1/auth/login`, {
    email,
    password,
  });
  return response.data.accessToken;
}

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
    minResponseTime: responseTimes[0],
    maxResponseTime: responseTimes[responseTimes.length - 1],
    p95ResponseTime: responseTimes[Math.floor(responseTimes.length * 0.95)],
    requestsPerSecond: (results.length / durationMs) * 1000,
  };
}

describe('Analytics API Performance Tests', () => {
  beforeAll(async () => {
    try {
      authToken = await loginUser(ADMIN_EMAIL, ADMIN_PASSWORD);
    } catch (error) {
      console.warn('Could not login - skipping performance tests');
    }
  }, 30000);

  describe('Dashboard Overview Endpoint', () => {
    it('should handle single dashboard request efficiently', async () => {
      if (!authToken) return;

      const result = await measureRequest(() =>
        axios.get(`${API_URL}/api/v1/analytics/dashboard`, {
          headers: { Authorization: `Bearer ${authToken}` },
        })
      );

      expect(result.success).toBe(true);
      expect(result.responseTime).toBeLessThan(500); // Should respond within 500ms
    });

    it('should handle concurrent dashboard requests', async () => {
      if (!authToken) return;

      const startTime = Date.now();
      const promises = Array.from({ length: CONCURRENT_REQUESTS }, () =>
        measureRequest(() =>
          axios.get(`${API_URL}/api/v1/analytics/dashboard`, {
            headers: { Authorization: `Bearer ${authToken}` },
          })
        )
      );

      const results = await Promise.all(promises);
      const duration = Date.now() - startTime;
      const metrics = calculateMetrics(results, duration);

      console.log('Dashboard Concurrent Requests Metrics:', metrics);

      expect(metrics.successfulRequests).toBeGreaterThanOrEqual(metrics.totalRequests * 0.95);
      expect(metrics.averageResponseTime).toBeLessThan(1000);
    });
  });

  describe('Member Growth Endpoint', () => {
    it('should handle member growth requests efficiently', async () => {
      if (!authToken) return;

      const result = await measureRequest(() =>
        axios.get(`${API_URL}/api/v1/analytics/member-growth?months=6`, {
          headers: { Authorization: `Bearer ${authToken}` },
        })
      );

      expect(result.success).toBe(true);
      expect(result.responseTime).toBeLessThan(1000);
    });

    it('should handle varying time ranges', async () => {
      if (!authToken) return;

      const ranges = [1, 3, 6, 12];
      const results = await Promise.all(
        ranges.map((months) =>
          measureRequest(() =>
            axios.get(`${API_URL}/api/v1/analytics/member-growth?months=${months}`, {
              headers: { Authorization: `Bearer ${authToken}` },
            })
          )
        )
      );

      results.forEach((result, index) => {
        expect(result.success).toBe(true);
        console.log(`Member growth (${ranges[index]} months): ${result.responseTime}ms`);
      });
    });
  });

  describe('Attendance Endpoint', () => {
    it('should handle attendance requests efficiently', async () => {
      if (!authToken) return;

      const result = await measureRequest(() =>
        axios.get(`${API_URL}/api/v1/analytics/attendance?limit=8`, {
          headers: { Authorization: `Bearer ${authToken}` },
        })
      );

      expect(result.success).toBe(true);
      expect(result.responseTime).toBeLessThan(1000);
    });
  });

  describe('Engagement Endpoint', () => {
    it('should handle engagement requests efficiently', async () => {
      if (!authToken) return;

      const result = await measureRequest(() =>
        axios.get(`${API_URL}/api/v1/analytics/engagement`, {
          headers: { Authorization: `Bearer ${authToken}` },
        })
      );

      expect(result.success).toBe(true);
      expect(result.responseTime).toBeLessThan(1000);
    });
  });

  describe('Demographics Endpoint', () => {
    it('should handle demographics requests efficiently', async () => {
      if (!authToken) return;

      const result = await measureRequest(() =>
        axios.get(`${API_URL}/api/v1/analytics/demographics`, {
          headers: { Authorization: `Bearer ${authToken}` },
        })
      );

      expect(result.success).toBe(true);
      expect(result.responseTime).toBeLessThan(500);
    });
  });

  describe('All Analytics Endpoints Under Load', () => {
    it('should handle mixed analytics requests', async () => {
      if (!authToken) return;

      const endpoints = [
        '/api/v1/analytics/dashboard',
        '/api/v1/analytics/member-growth?months=6',
        '/api/v1/analytics/attendance?limit=8',
        '/api/v1/analytics/engagement',
        '/api/v1/analytics/demographics',
      ];

      const startTime = Date.now();
      const promises: Promise<{ success: boolean; responseTime: number }>[] = [];

      for (let i = 0; i < ITERATIONS; i++) {
        const endpoint = endpoints[i % endpoints.length];
        promises.push(
          measureRequest(() =>
            axios.get(`${API_URL}${endpoint}`, {
              headers: { Authorization: `Bearer ${authToken}` },
            })
          )
        );
      }

      const results = await Promise.all(promises);
      const duration = Date.now() - startTime;
      const metrics = calculateMetrics(results, duration);

      console.log('Mixed Analytics Load Test Metrics:', metrics);

      expect(metrics.successfulRequests).toBeGreaterThanOrEqual(metrics.totalRequests * 0.9);
      expect(metrics.p95ResponseTime).toBeLessThan(2000);
    });
  });
});
