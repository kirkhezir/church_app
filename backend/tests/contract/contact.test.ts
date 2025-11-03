/**
 * Contract Tests for Contact Endpoint
 * Validates POST /api/v1/contact against OpenAPI specification
 * 
 * TDD: This test should FAIL initially until the endpoint is implemented
 */

import { request } from '../integration/setup';
import { expectValidApiResponse } from './helpers/openapi-validator';

describe('POST /api/v1/contact - Contract Tests', () => {
  describe('Valid contact form submission', () => {
    it('should match OpenAPI spec for successful submission', async () => {
      const contactData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        subject: 'Inquiry about worship times',
        message: 'I would like to know more about your Sabbath services.',
      };

      const response = await request
        .post('/api/v1/contact')
        .send(contactData)
        .expect(201);

      // Validate response structure matches OpenAPI spec
      expectValidApiResponse(response, 'POST', '/api/v1/contact');

      // Verify response contains expected fields
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Invalid contact form submissions', () => {
    it('should return 400 for missing required fields', async () => {
      const invalidData = {
        name: 'John Doe',
        // Missing email, subject, and message
      };

      const response = await request
        .post('/api/v1/contact')
        .send(invalidData)
        .expect(400);

      // Validate error response matches OpenAPI spec
      expectValidApiResponse(response, 'POST', '/api/v1/contact');

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid email format', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email',
        subject: 'Test',
        message: 'Test message',
      };

      const response = await request
        .post('/api/v1/contact')
        .send(invalidData)
        .expect(400);

      expectValidApiResponse(response, 'POST', '/api/v1/contact');

      expect(response.body.error).toContain('email');
    });

    it('should return 400 for message too short', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test',
        message: 'Hi', // Too short (< 10 characters)
      };

      const response = await request
        .post('/api/v1/contact')
        .send(invalidData)
        .expect(400);

      expectValidApiResponse(response, 'POST', '/api/v1/contact');

      expect(response.body.error).toContain('message');
    });
  });

  describe('Rate limiting', () => {
    it('should enforce rate limit after multiple submissions', async () => {
      const contactData = {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test',
        message: 'This is a test message for rate limiting.',
      };

      // Submit multiple requests rapidly
      const requests = Array(10)
        .fill(null)
        .map(() => request.post('/api/v1/contact').send(contactData));

      const responses = await Promise.all(requests);

      // At least one should be rate limited (429)
      const rateLimited = responses.some((r) => r.status === 429);
      expect(rateLimited).toBe(true);
    });
  });

  describe('Response time', () => {
    it('should respond within acceptable time limit (< 2 seconds)', async () => {
      const contactData = {
        name: 'Performance Test',
        email: 'perf@example.com',
        subject: 'Performance test',
        message: 'Testing response time for contact form submission.',
      };

      const startTime = Date.now();

      await request
        .post('/api/v1/contact')
        .send(contactData)
        .expect(201);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(2000); // Less than 2 seconds
    });
  });
});
