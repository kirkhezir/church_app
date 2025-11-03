import { request, setupTestDatabase, teardownTestDatabase } from './setup';
import { EmailService } from '../../src/infrastructure/email/emailService';

/**
 * Integration Tests for Contact Form Flow
 *
 * Tests the complete contact form submission process including:
 * - Request handling
 * - Input validation
 * - Email sending
 * - Rate limiting
 * - Error handling
 *
 * Following TDD: These tests should FAIL until the contact endpoint is implemented
 */

describe('Contact Form Integration Tests', () => {
  // Mock EmailService to avoid sending real emails during tests
  let emailServiceSpy: jest.SpyInstance;

  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(() => {
    // Mock the email sending to prevent actual SMTP calls
    emailServiceSpy = jest.spyOn(EmailService.prototype, 'sendEmail').mockResolvedValue(true);
  });

  afterEach(() => {
    emailServiceSpy.mockRestore();
  });

  describe('POST /api/v1/contact - Full Flow', () => {
    it('should successfully process valid contact form submission', async () => {
      const contactData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        subject: 'Inquiry about Worship Times',
        message: 'I would like to know more about your worship schedule and community activities.',
      };

      const response = await request.post('/api/v1/contact').send(contactData).expect(201);

      // Verify response structure
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('received');

      // Verify email was sent
      expect(emailServiceSpy).toHaveBeenCalledTimes(1);
      expect(emailServiceSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining(contactData.subject),
        })
      );
    });

    it('should send email to configured church contact address', async () => {
      const contactData = {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        subject: 'Visitor Information',
        message: 'I am planning to visit your church next Sunday. What time do services start?',
      };

      await request.post('/api/v1/contact').send(contactData).expect(201);

      // Verify email recipient
      const emailCall = emailServiceSpy.mock.calls[0][0];
      expect(emailCall.to).toMatch(/singburi.*adventist/i); // Should send to church email
    });

    it('should include sender information in email body', async () => {
      const contactData = {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'Test message content',
      };

      await request.post('/api/v1/contact').send(contactData).expect(201);

      // Verify email content includes sender info
      const emailCall = emailServiceSpy.mock.calls[0][0];
      expect(emailCall.text || emailCall.html).toContain(contactData.name);
      expect(emailCall.text || emailCall.html).toContain(contactData.email);
      expect(emailCall.text || emailCall.html).toContain(contactData.message);
    });

    it('should reject submission with missing required fields', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        // Missing subject and message
      };

      const response = await request.post('/api/v1/contact').send(invalidData).expect(400);

      // Verify error response
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/validation|required|missing/i);

      // Verify no email was sent
      expect(emailServiceSpy).not.toHaveBeenCalled();
    });

    it('should reject submission with invalid email format', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'not-a-valid-email',
        subject: 'Test Subject',
        message: 'This is a test message with at least 20 characters.',
      };

      const response = await request.post('/api/v1/contact').send(invalidData).expect(400);

      // Verify error response mentions email
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/email/i);

      // Verify no email was sent
      expect(emailServiceSpy).not.toHaveBeenCalled();
    });

    it('should reject submission with message too short', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test',
        message: 'Too short', // Less than 20 characters
      };

      const response = await request.post('/api/v1/contact').send(invalidData).expect(400);

      // Verify error response mentions message length
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/message|length|characters/i);

      // Verify no email was sent
      expect(emailServiceSpy).not.toHaveBeenCalled();
    });

    it('should sanitize input to prevent XSS attacks', async () => {
      const xssData = {
        name: 'John<script>alert("XSS")</script>Doe',
        email: 'john@example.com',
        subject: 'Test<img src=x onerror=alert(1)>',
        message: 'This is a test message with <b>HTML tags</b> and scripts.',
      };

      await request.post('/api/v1/contact').send(xssData).expect(201);

      // Verify email content is sanitized
      const emailCall = emailServiceSpy.mock.calls[0][0];
      const emailContent = emailCall.text || emailCall.html || '';
      expect(emailContent).not.toContain('<script>');
      expect(emailContent).not.toContain('onerror');
    });

    it('should handle email service failures gracefully', async () => {
      // Mock email service to fail
      emailServiceSpy.mockRejectedValue(new Error('SMTP connection failed'));

      const contactData = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'This is a test message with sufficient length for validation.',
      };

      const response = await request.post('/api/v1/contact').send(contactData).expect(500);

      // Verify error response
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/email|send|failed/i);
    });
  });

  describe('Rate Limiting Integration', () => {
    it('should enforce rate limit after multiple rapid submissions', async () => {
      const contactData = {
        name: 'Rate Test User',
        email: 'ratetest@example.com',
        subject: 'Rate Limit Test',
        message: 'Testing rate limiting functionality with sufficient message length.',
      };

      // Make 10 rapid requests
      const requests = Array(10)
        .fill(null)
        .map(() => request.post('/api/v1/contact').send(contactData));

      const responses = await Promise.all(requests);

      // At least one should be rate limited (429)
      const rateLimitedCount = responses.filter((r) => r.status === 429).length;
      expect(rateLimitedCount).toBeGreaterThan(0);

      // Successful requests should be less than total
      const successfulCount = responses.filter((r) => r.status === 201).length;
      expect(successfulCount).toBeLessThan(10);
    });

    it('should allow requests after rate limit window expires', async () => {
      const contactData = {
        name: 'Time Window Test',
        email: 'timewindow@example.com',
        subject: 'Time Window Test',
        message: 'Testing rate limit time window functionality with adequate length.',
      };

      // First request should succeed
      await request.post('/api/v1/contact').send(contactData).expect(201);

      // Wait for rate limit window (adjust based on implementation)
      // Assuming 1 minute window in implementation
      jest.useFakeTimers();
      jest.advanceTimersByTime(61000); // 61 seconds
      jest.useRealTimers();

      // Request after window should succeed
      await request.post('/api/v1/contact').send(contactData).expect(201);
    });
  });

  describe('Security and Performance', () => {
    it('should complete request within acceptable time', async () => {
      const contactData = {
        name: 'Performance Test',
        email: 'performance@example.com',
        subject: 'Performance Test',
        message: 'Testing endpoint response time with appropriate message content length.',
      };

      const startTime = Date.now();
      await request.post('/api/v1/contact').send(contactData).expect(201);
      const endTime = Date.now();

      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(2000); // Should complete within 2 seconds
    });

    it('should not expose sensitive server information in errors', async () => {
      const invalidData = {
        name: 'Security Test',
        // Intentionally malformed to trigger error
      };

      const response = await request.post('/api/v1/contact').send(invalidData).expect(400);

      // Verify error response doesn't leak sensitive info
      const responseText = JSON.stringify(response.body).toLowerCase();
      expect(responseText).not.toContain('password');
      expect(responseText).not.toContain('secret');
      expect(responseText).not.toContain('token');
      expect(responseText).not.toContain('env');
      expect(responseText).not.toContain('stack');
    });

    it('should set appropriate security headers in response', async () => {
      const contactData = {
        name: 'Header Test',
        email: 'header@example.com',
        subject: 'Security Headers',
        message: 'Testing security headers with appropriate message length requirement.',
      };

      const response = await request.post('/api/v1/contact').send(contactData);

      // Verify security headers are present
      expect(response.headers['content-type']).toContain('application/json');
      // Add more header checks based on security requirements
    });
  });
});
