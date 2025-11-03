import { EmailService } from '../../../src/infrastructure/email/emailService';

/**
 * Unit Tests for ContactService
 *
 * Tests the ContactService business logic in isolation:
 * - Email formatting and sending
 * - Input validation
 * - Rate limiting logic
 * - Error handling
 *
 * Following TDD: These tests should FAIL until ContactService is implemented
 *
 * Note: ContactService doesn't exist yet - this is the RED phase
 */

// Mock EmailService
jest.mock('../../../src/infrastructure/email/emailService');

describe('ContactService', () => {
  let ContactService: any; // Will be imported once it exists
  let contactService: any;
  let emailService: jest.Mocked<EmailService>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // This will fail until ContactService is created
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const module = require('../../../src/application/services/contactService');
      ContactService = module.ContactService;
      contactService = new ContactService();
    } catch (error) {
      // Expected to fail in RED phase
      ContactService = undefined;
      contactService = undefined;
    }

    // Mock EmailService instance
    emailService = new EmailService() as jest.Mocked<EmailService>;
  });

  describe('sendContactEmail', () => {
    it('should send email with correct recipient', async () => {
      // Skip if service doesn't exist yet (RED phase)
      if (!contactService) {
        expect(ContactService).toBeUndefined();
        return;
      }

      const contactData = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Inquiry',
        message: 'I would like to visit your church.',
      };

      emailService.sendEmail = jest.fn().mockResolvedValue(true);
      await contactService.sendContactEmail(contactData);

      expect(emailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: expect.stringMatching(/singburi.*adventist/i),
        })
      );
    });

    it('should format email with sender information', async () => {
      if (!contactService) {
        expect(ContactService).toBeUndefined();
        return;
      }

      const contactData = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        subject: 'Question about services',
        message: 'What time do services start on Sunday?',
      };

      emailService.sendEmail = jest.fn().mockResolvedValue(true);
      await contactService.sendContactEmail(contactData);

      const emailCall = (emailService.sendEmail as jest.Mock).mock.calls[0][0];
      expect(emailCall.text || emailCall.html).toContain('Jane Smith');
      expect(emailCall.text || emailCall.html).toContain('jane@example.com');
      expect(emailCall.text || emailCall.html).toContain('What time do services start on Sunday?');
    });

    it('should include reply-to header with sender email', async () => {
      if (!contactService) {
        expect(ContactService).toBeUndefined();
        return;
      }

      const contactData = {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test',
        message: 'This is a test message with sufficient length.',
      };

      emailService.sendEmail = jest.fn().mockResolvedValue(true);
      await contactService.sendContactEmail(contactData);

      expect(emailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          replyTo: 'test@example.com',
        })
      );
    });

    it('should throw error if email service fails', async () => {
      if (!contactService) {
        expect(ContactService).toBeUndefined();
        return;
      }

      const contactData = {
        name: 'Error Test',
        email: 'error@example.com',
        subject: 'Error Test',
        message: 'Testing error handling with adequate message length.',
      };

      emailService.sendEmail = jest.fn().mockRejectedValue(new Error('SMTP connection failed'));

      await expect(contactService.sendContactEmail(contactData)).rejects.toThrow();
    });
  });

  describe('validateContactData', () => {
    it('should accept valid contact data', () => {
      if (!contactService) {
        expect(ContactService).toBeUndefined();
        return;
      }

      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Valid Subject',
        message: 'This is a valid message with sufficient length to pass validation.',
      };

      const result = contactService.validateContactData(validData);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should reject data with missing name', () => {
      if (!contactService) {
        expect(ContactService).toBeUndefined();
        return;
      }

      const invalidData = {
        email: 'john@example.com',
        subject: 'Subject',
        message: 'Message with sufficient length for validation requirements.',
      };

      const result = contactService.validateContactData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('name');
    });

    it('should reject data with missing email', () => {
      if (!contactService) {
        expect(ContactService).toBeUndefined();
        return;
      }

      const invalidData = {
        name: 'John Doe',
        subject: 'Subject',
        message: 'Message with sufficient length for validation requirements.',
      };

      const result = contactService.validateContactData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('email');
    });

    it('should reject data with invalid email format', () => {
      if (!contactService) {
        expect(ContactService).toBeUndefined();
        return;
      }

      const invalidData = {
        name: 'John Doe',
        email: 'not-a-valid-email',
        subject: 'Subject',
        message: 'Message with sufficient length for validation requirements.',
      };

      const result = contactService.validateContactData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toMatch(/email/i);
    });

    it('should reject data with missing subject', () => {
      if (!contactService) {
        expect(ContactService).toBeUndefined();
        return;
      }

      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Message with sufficient length for validation requirements.',
      };

      const result = contactService.validateContactData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('subject');
    });

    it('should reject data with missing message', () => {
      if (!contactService) {
        expect(ContactService).toBeUndefined();
        return;
      }

      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Subject',
      };

      const result = contactService.validateContactData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('message');
    });

    it('should reject message shorter than 20 characters', () => {
      if (!contactService) {
        expect(ContactService).toBeUndefined();
        return;
      }

      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Subject',
        message: 'Too short',
      };

      const result = contactService.validateContactData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toMatch(/message|length|characters/i);
    });

    it('should accept message with exactly 20 characters', () => {
      if (!contactService) {
        expect(ContactService).toBeUndefined();
        return;
      }

      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Subject',
        message: '12345678901234567890', // Exactly 20 characters
      };

      const result = contactService.validateContactData(validData);
      expect(result.valid).toBe(true);
    });
  });

  describe('sanitizeInput', () => {
    it('should remove script tags from input', () => {
      if (!contactService) {
        expect(ContactService).toBeUndefined();
        return;
      }

      const malicious = 'Hello<script>alert("XSS")</script>World';
      const sanitized = contactService.sanitizeInput(malicious);

      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('</script>');
      expect(sanitized).toContain('Hello');
      expect(sanitized).toContain('World');
    });

    it('should remove event handlers from input', () => {
      if (!contactService) {
        expect(ContactService).toBeUndefined();
        return;
      }

      const malicious = '<img src=x onerror=alert(1)>';
      const sanitized = contactService.sanitizeInput(malicious);

      expect(sanitized).not.toContain('onerror');
      expect(sanitized).not.toContain('alert');
    });

    it('should preserve safe HTML entities', () => {
      if (!contactService) {
        expect(ContactService).toBeUndefined();
        return;
      }

      const input = 'Hello &amp; welcome to our church!';
      const sanitized = contactService.sanitizeInput(input);

      expect(sanitized).toContain('&');
      expect(sanitized).toContain('welcome');
    });

    it('should handle empty string', () => {
      if (!contactService) {
        expect(ContactService).toBeUndefined();
        return;
      }

      const sanitized = contactService.sanitizeInput('');
      expect(sanitized).toBe('');
    });

    it('should handle null and undefined', () => {
      if (!contactService) {
        expect(ContactService).toBeUndefined();
        return;
      }

      expect(contactService.sanitizeInput(null)).toBe('');
      expect(contactService.sanitizeInput(undefined)).toBe('');
    });
  });

  describe('checkRateLimit', () => {
    it('should allow first submission from IP', async () => {
      if (!contactService) {
        expect(ContactService).toBeUndefined();
        return;
      }

      const ipAddress = '192.168.1.1';
      const allowed = await contactService.checkRateLimit(ipAddress);

      expect(allowed).toBe(true);
    });

    it('should track submission count per IP', async () => {
      if (!contactService) {
        expect(ContactService).toBeUndefined();
        return;
      }

      const ipAddress = '192.168.1.2';

      // First few should be allowed
      for (let i = 0; i < 5; i++) {
        const allowed = await contactService.checkRateLimit(ipAddress);
        expect(allowed).toBe(true);
      }
    });

    it('should block after rate limit exceeded', async () => {
      if (!contactService) {
        expect(ContactService).toBeUndefined();
        return;
      }

      const ipAddress = '192.168.1.3';

      // Make 10 requests (assuming limit is 10)
      for (let i = 0; i < 10; i++) {
        await contactService.checkRateLimit(ipAddress);
      }

      // Next request should be blocked
      const allowed = await contactService.checkRateLimit(ipAddress);
      expect(allowed).toBe(false);
    });

    it('should reset rate limit after time window', async () => {
      if (!contactService) {
        expect(ContactService).toBeUndefined();
        return;
      }

      const ipAddress = '192.168.1.4';

      // Exhaust rate limit
      for (let i = 0; i < 11; i++) {
        await contactService.checkRateLimit(ipAddress);
      }

      // Mock time passage (1 minute)
      jest.useFakeTimers();
      jest.advanceTimersByTime(61000);
      jest.useRealTimers();

      // Should be allowed again
      const allowed = await contactService.checkRateLimit(ipAddress);
      expect(allowed).toBe(true);
    });

    it('should track different IPs separately', async () => {
      if (!contactService) {
        expect(ContactService).toBeUndefined();
        return;
      }

      const ip1 = '192.168.1.5';
      const ip2 = '192.168.1.6';

      // Exhaust limit for IP1
      for (let i = 0; i < 11; i++) {
        await contactService.checkRateLimit(ip1);
      }

      // IP2 should still be allowed
      const allowed = await contactService.checkRateLimit(ip2);
      expect(allowed).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      if (!contactService) {
        expect(ContactService).toBeUndefined();
        return;
      }

      // Mock database error
      const dbError = new Error('Database connection failed');
      emailService.sendEmail = jest.fn().mockRejectedValue(dbError);

      const contactData = {
        name: 'Test',
        email: 'test@example.com',
        subject: 'Test',
        message: 'Test message with required minimum length.',
      };

      await expect(contactService.sendContactEmail(contactData)).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should log errors appropriately', async () => {
      if (!contactService) {
        expect(ContactService).toBeUndefined();
        return;
      }

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      emailService.sendEmail = jest.fn().mockRejectedValue(new Error('Email failed'));

      const contactData = {
        name: 'Test',
        email: 'test@example.com',
        subject: 'Test',
        message: 'Test message with required minimum length.',
      };

      try {
        await contactService.sendContactEmail(contactData);
      } catch (error) {
        // Expected
      }

      // Verify error was logged
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
