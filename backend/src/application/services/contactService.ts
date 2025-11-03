import { EmailService } from '../../infrastructure/email/emailService';
import { logger } from '../../infrastructure/logging/logger';

/**
 * Contact form data interface
 */
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  errors?: string;
}

/**
 * Rate limit storage (in-memory for now, should use Redis in production)
 */
interface RateLimitEntry {
  count: number;
  firstRequest: number;
}

/**
 * ContactService
 * Handles contact form submissions including validation, sanitization, and email sending
 */
export class ContactService {
  private emailService: EmailService;
  private rateLimitMap: Map<string, RateLimitEntry>;
  private readonly RATE_LIMIT = 10; // Max requests per window
  private readonly RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
  private readonly MIN_MESSAGE_LENGTH = 20;

  constructor() {
    this.emailService = new EmailService();
    this.rateLimitMap = new Map();

    // Clean up old rate limit entries every 5 minutes
    setInterval(() => this.cleanupRateLimits(), 5 * 60 * 1000);
  }

  /**
   * Send contact email to church
   */
  async sendContactEmail(data: ContactFormData): Promise<void> {
    try {
      const sanitizedData = {
        name: this.sanitizeInput(data.name),
        email: this.sanitizeInput(data.email),
        subject: this.sanitizeInput(data.subject),
        message: this.sanitizeInput(data.message),
      };

      const emailContent = this.formatEmailContent(sanitizedData);

      await this.emailService.sendEmail({
        to: process.env.CHURCH_CONTACT_EMAIL || 'contact@singburi-adventist.org',
        subject: `Contact Form: ${sanitizedData.subject}`,
        text: emailContent.text,
        html: emailContent.html,
        replyTo: sanitizedData.email,
      });

      logger.info('Contact form email sent successfully', {
        from: sanitizedData.email,
        subject: sanitizedData.subject,
      });
    } catch (error) {
      logger.error('Failed to send contact form email', error);
      throw error;
    }
  }

  /**
   * Validate contact form data
   */
  validateContactData(data: Partial<ContactFormData>): ValidationResult {
    const errors: string[] = [];

    // Check required fields
    if (!data.name || data.name.trim() === '') {
      errors.push('name is required');
    }

    if (!data.email || data.email.trim() === '') {
      errors.push('email is required');
    } else if (!this.isValidEmail(data.email)) {
      errors.push('email format is invalid');
    }

    if (!data.subject || data.subject.trim() === '') {
      errors.push('subject is required');
    }

    if (!data.message || data.message.trim() === '') {
      errors.push('message is required');
    } else if (data.message.trim().length < this.MIN_MESSAGE_LENGTH) {
      errors.push(`message must be at least ${this.MIN_MESSAGE_LENGTH} characters`);
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors.join(', ') : undefined,
    };
  }

  /**
   * Sanitize input to prevent XSS attacks
   */
  sanitizeInput(input: string | null | undefined): string {
    if (!input) return '';

    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframes
      .trim();
  }

  /**
   * Check rate limit for IP address
   */
  async checkRateLimit(ipAddress: string): Promise<boolean> {
    const now = Date.now();
    const entry = this.rateLimitMap.get(ipAddress);

    if (!entry) {
      // First request from this IP
      this.rateLimitMap.set(ipAddress, {
        count: 1,
        firstRequest: now,
      });
      return true;
    }

    // Check if rate limit window has expired
    if (now - entry.firstRequest > this.RATE_LIMIT_WINDOW) {
      // Reset the window
      this.rateLimitMap.set(ipAddress, {
        count: 1,
        firstRequest: now,
      });
      return true;
    }

    // Check if limit exceeded
    if (entry.count >= this.RATE_LIMIT) {
      logger.warn('Rate limit exceeded', { ipAddress, count: entry.count });
      return false;
    }

    // Increment count
    entry.count++;
    return true;
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Format email content for sending
   */
  private formatEmailContent(data: ContactFormData): { text: string; html: string } {
    const text = `
Contact Form Submission

From: ${data.name}
Email: ${data.email}
Subject: ${data.subject}

Message:
${data.message}

---
This email was sent from the Sing Buri Adventist Center contact form.
Reply directly to this email to respond to ${data.name}.
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #1e40af; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
    .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #1f2937; }
    .message { background-color: white; padding: 15px; border-left: 4px solid #1e40af; margin-top: 10px; }
    .footer { background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 5px 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Contact Form Submission</h2>
    </div>
    <div class="content">
      <div class="field">
        <span class="label">From:</span> ${data.name}
      </div>
      <div class="field">
        <span class="label">Email:</span> <a href="mailto:${data.email}">${data.email}</a>
      </div>
      <div class="field">
        <span class="label">Subject:</span> ${data.subject}
      </div>
      <div class="field">
        <span class="label">Message:</span>
        <div class="message">${data.message.replace(/\n/g, '<br>')}</div>
      </div>
    </div>
    <div class="footer">
      This email was sent from the Sing Buri Adventist Center contact form.<br>
      Reply directly to this email to respond to ${data.name}.
    </div>
  </div>
</body>
</html>
    `.trim();

    return { text, html };
  }

  /**
   * Clean up old rate limit entries
   */
  private cleanupRateLimits(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.rateLimitMap.forEach((entry, key) => {
      if (now - entry.firstRequest > this.RATE_LIMIT_WINDOW) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach((key) => this.rateLimitMap.delete(key));

    if (expiredKeys.length > 0) {
      logger.debug('Cleaned up rate limit entries', { count: expiredKeys.length });
    }
  }

  /**
   * Reset rate limits (for testing purposes)
   */
  resetRateLimits(): void {
    this.rateLimitMap.clear();
    logger.debug('Rate limits reset');
  }
}
