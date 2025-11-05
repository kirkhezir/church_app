/**
 * Performance Tests for Event Management API
 *
 * Tests backend performance under load:
 * - 100+ concurrent users browsing events
 * - Concurrent RSVP operations
 * - Database query performance
 * - API response times
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:3000';
const TEST_DURATION_MS = 30000; // 30 seconds
const CONCURRENT_USERS = 100;

// Test credentials
const MEMBER_EMAIL = 'john.doe@example.com';
const MEMBER_PASSWORD = 'Member123!';

interface PerformanceMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalTime: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  requestsPerSecond: number;
}

/**
 * Helper function to login and get auth token
 */
async function loginUser(email: string, password: string): Promise<string> {
  const response = await axios.post(`${API_URL}/auth/login`, {
    email,
    password,
  });
  return response.data.token;
}

/**
 * Helper function to measure request performance
 */
async function measureRequest(
  requestFn: () => Promise<any>
): Promise<{ success: boolean; responseTime: number }> {
  const startTime = Date.now();
  try {
    await requestFn();
    const responseTime = Date.now() - startTime;
    return { success: true, responseTime };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return { success: false, responseTime };
  }
}

/**
 * Calculate performance metrics from results
 */
function calculateMetrics(
  results: Array<{ success: boolean; responseTime: number }>,
  totalTime: number
): PerformanceMetrics {
  const successfulRequests = results.filter((r) => r.success).length;
  const failedRequests = results.filter((r) => !r.success).length;
  const responseTimes = results.map((r) => r.responseTime);

  return {
    totalRequests: results.length,
    successfulRequests,
    failedRequests,
    totalTime,
    averageResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
    minResponseTime: Math.min(...responseTimes),
    maxResponseTime: Math.max(...responseTimes),
    requestsPerSecond: (results.length / totalTime) * 1000,
  };
}

describe('Event Management Performance Tests', () => {
  let authToken: string;

  beforeAll(async () => {
    // Login once to get auth token for authenticated requests
    try {
      authToken = await loginUser(MEMBER_EMAIL, MEMBER_PASSWORD);
    } catch (error) {
      console.error('Failed to login for performance tests:', error);
      throw error;
    }
  }, 15000);

  it('should handle 100+ concurrent users browsing events', async () => {
    const results: Array<{ success: boolean; responseTime: number }> = [];
    const startTime = Date.now();

    // Create 100 concurrent requests to GET /events
    const requests = Array(CONCURRENT_USERS)
      .fill(null)
      .map(() =>
        measureRequest(async () => {
          const response = await axios.get(`${API_URL}/events`, {
            params: {
              page: 1,
              limit: 10,
            },
          });
          expect(response.status).toBe(200);
          expect(Array.isArray(response.data.events)).toBe(true);
        })
      );

    const requestResults = await Promise.all(requests);
    results.push(...requestResults);

    const totalTime = Date.now() - startTime;
    const metrics = calculateMetrics(results, totalTime);

    // Log metrics
    console.log('\n=== Browse Events Performance ===');
    console.log(`Total Requests: ${metrics.totalRequests}`);
    console.log(
      `Successful: ${metrics.successfulRequests} (${((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2)}%)`
    );
    console.log(
      `Failed: ${metrics.failedRequests} (${((metrics.failedRequests / metrics.totalRequests) * 100).toFixed(2)}%)`
    );
    console.log(`Total Time: ${metrics.totalTime.toFixed(2)}ms`);
    console.log(`Average Response Time: ${metrics.averageResponseTime.toFixed(2)}ms`);
    console.log(`Min Response Time: ${metrics.minResponseTime}ms`);
    console.log(`Max Response Time: ${metrics.maxResponseTime}ms`);
    console.log(`Requests/Second: ${metrics.requestsPerSecond.toFixed(2)}`);

    // Assertions
    expect(metrics.successfulRequests).toBeGreaterThan(95); // At least 95% success rate
    expect(metrics.averageResponseTime).toBeLessThan(1000); // Average < 1 second
  }, 60000);

  it('should handle concurrent RSVP operations', async () => {
    const results: Array<{ success: boolean; responseTime: number }> = [];

    // First, get list of events
    const eventsResponse = await axios.get(`${API_URL}/events`, {
      params: { page: 1, limit: 10 },
    });

    const events = eventsResponse.data.events;
    expect(events.length).toBeGreaterThan(0);

    const eventId = events[0].id;
    const startTime = Date.now();

    // Create 50 concurrent RSVP requests (simulating multiple users RSVPing to same event)
    const rsvpRequests = Array(50)
      .fill(null)
      .map(() =>
        measureRequest(async () => {
          const response = await axios.post(
            `${API_URL}/events/${eventId}/rsvp`,
            {},
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );
          // Expect either success or "already RSVP'd" error
          expect([200, 201, 400, 409]).toContain(response.status);
        })
      );

    const requestResults = await Promise.all(rsvpRequests);
    results.push(...requestResults);

    const totalTime = Date.now() - startTime;
    const metrics = calculateMetrics(results, totalTime);

    // Log metrics
    console.log('\n=== Concurrent RSVP Performance ===');
    console.log(`Total Requests: ${metrics.totalRequests}`);
    console.log(
      `Successful: ${metrics.successfulRequests} (${((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2)}%)`
    );
    console.log(
      `Failed: ${metrics.failedRequests} (${((metrics.failedRequests / metrics.totalRequests) * 100).toFixed(2)}%)`
    );
    console.log(`Total Time: ${metrics.totalTime.toFixed(2)}ms`);
    console.log(`Average Response Time: ${metrics.averageResponseTime.toFixed(2)}ms`);
    console.log(`Min Response Time: ${metrics.minResponseTime}ms`);
    console.log(`Max Response Time: ${metrics.maxResponseTime}ms`);
    console.log(`Requests/Second: ${metrics.requestsPerSecond.toFixed(2)}`);

    // Assertions
    expect(metrics.successfulRequests).toBeGreaterThan(45); // At least 90% success rate (some may fail due to duplicates)
    expect(metrics.averageResponseTime).toBeLessThan(2000); // Average < 2 seconds
  }, 60000);

  it('should handle sustained load over time', async () => {
    const results: Array<{ success: boolean; responseTime: number }> = [];
    const startTime = Date.now();
    const endTime = startTime + TEST_DURATION_MS;

    console.log('\n=== Starting 30-second sustained load test ===');

    // Continuously send requests for 30 seconds
    while (Date.now() < endTime) {
      const batchPromises = Array(10)
        .fill(null)
        .map(() =>
          measureRequest(async () => {
            const response = await axios.get(`${API_URL}/events`, {
              params: { page: 1, limit: 10 },
            });
            expect(response.status).toBe(200);
          })
        );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Small delay between batches to simulate realistic traffic
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const totalTime = Date.now() - startTime;
    const metrics = calculateMetrics(results, totalTime);

    // Log metrics
    console.log('\n=== Sustained Load Performance ===');
    console.log(`Test Duration: ${(totalTime / 1000).toFixed(2)}s`);
    console.log(`Total Requests: ${metrics.totalRequests}`);
    console.log(
      `Successful: ${metrics.successfulRequests} (${((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2)}%)`
    );
    console.log(
      `Failed: ${metrics.failedRequests} (${((metrics.failedRequests / metrics.totalRequests) * 100).toFixed(2)}%)`
    );
    console.log(`Average Response Time: ${metrics.averageResponseTime.toFixed(2)}ms`);
    console.log(`Min Response Time: ${metrics.minResponseTime}ms`);
    console.log(`Max Response Time: ${metrics.maxResponseTime}ms`);
    console.log(`Requests/Second: ${metrics.requestsPerSecond.toFixed(2)}`);

    // Assertions
    expect(metrics.successfulRequests).toBeGreaterThan(metrics.totalRequests * 0.95); // 95% success rate
    expect(metrics.averageResponseTime).toBeLessThan(1000); // Average < 1 second
    expect(metrics.requestsPerSecond).toBeGreaterThan(5); // At least 5 req/s
  }, 90000);

  it('should handle complex query operations efficiently', async () => {
    const results: Array<{ success: boolean; responseTime: number }> = [];
    const startTime = Date.now();

    // Test various query combinations
    const queryVariations = [
      { category: 'WORSHIP' },
      { category: 'BIBLE_STUDY' },
      { startDate: new Date().toISOString().split('T')[0] },
      { limit: 5 },
      { limit: 20 },
      { page: 1, limit: 10 },
      { page: 2, limit: 10 },
    ];

    const requests = queryVariations.flatMap((params) =>
      Array(10)
        .fill(null)
        .map(() =>
          measureRequest(async () => {
            const response = await axios.get(`${API_URL}/events`, { params });
            expect(response.status).toBe(200);
            expect(Array.isArray(response.data.events)).toBe(true);
          })
        )
    );

    const requestResults = await Promise.all(requests);
    results.push(...requestResults);

    const totalTime = Date.now() - startTime;
    const metrics = calculateMetrics(results, totalTime);

    // Log metrics
    console.log('\n=== Complex Query Performance ===');
    console.log(`Total Requests: ${metrics.totalRequests}`);
    console.log(
      `Successful: ${metrics.successfulRequests} (${((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2)}%)`
    );
    console.log(
      `Failed: ${metrics.failedRequests} (${((metrics.failedRequests / metrics.totalRequests) * 100).toFixed(2)}%)`
    );
    console.log(`Average Response Time: ${metrics.averageResponseTime.toFixed(2)}ms`);
    console.log(`Min Response Time: ${metrics.minResponseTime}ms`);
    console.log(`Max Response Time: ${metrics.maxResponseTime}ms`);
    console.log(`Requests/Second: ${metrics.requestsPerSecond.toFixed(2)}`);

    // Assertions
    expect(metrics.successfulRequests).toBe(metrics.totalRequests); // 100% success rate
    expect(metrics.averageResponseTime).toBeLessThan(500); // Average < 500ms for queries
  }, 60000);
});
