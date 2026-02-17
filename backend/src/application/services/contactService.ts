import { EmailService } from '../../infrastructure/email/emailService';
import { logger } from '../../infrastructure/logging/logger';
import xss from 'xss';

/**
 * Contact form data interface
 * @interface ContactFormData
 * @property {string} name - Full name of the person submitting the form
 * @property {string} email - Valid email address for replies
 * @property {string} subject - Brief subject line for the inquiry
 * @property {string} message - Detailed message content (minimum 20 characters)
 */
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * Validation result interface
 * @interface ValidationResult
 * @property {boolean} valid - Whether the validation passed
 * @property {string} [errors] - Comma-separated list of validation errors (if any)
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
 *
 * Handles contact form submissions including validation, sanitization, and email sending.
 * Implements rate limiting to prevent abuse and XSS protection through input sanitization.
 *
 * @class ContactService
 * @example
 * ```typescript
 * const contactService = new ContactService();
 *
 * // Validate contact data
 * const validation = contactService.validateContactData({
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   subject: 'Inquiry',
 *   message: 'I would like to visit your church.'
 * });
 *
 * if (validation.valid) {
 *   // Check rate limit
 *   const allowed = await contactService.checkRateLimit('192.168.1.1');
 *
 *   if (allowed) {
 *     // Send email
 *     await contactService.sendContactEmail(contactData);
 *   }
 * }
 * ```
 */
export class ContactService {
  private emailService: EmailService;
  private rateLimitMap: Map<string, RateLimitEntry>;
  private cleanupInterval?: NodeJS.Timeout;

  /** Maximum number of requests allowed per IP address within the rate limit window */
  private readonly RATE_LIMIT = 10;

  /** Rate limit time window in milliseconds (1 minute) */
  private readonly RATE_LIMIT_WINDOW = 60 * 1000;

  /** Minimum required message length in characters */
  private readonly MIN_MESSAGE_LENGTH = 20;

  /** Cleanup interval in milliseconds (5 minutes) */
  private readonly CLEANUP_INTERVAL = 5 * 60 * 1000;

  /**
   * Creates an instance of ContactService
   * Initializes email service and rate limiting with automatic cleanup
   */
  constructor() {
    this.emailService = new EmailService();
    this.rateLimitMap = new Map();

    // Clean up old rate limit entries periodically
    this.cleanupInterval = setInterval(() => this.cleanupRateLimits(), this.CLEANUP_INTERVAL);
    // Allow the process to exit even if this interval is running
    this.cleanupInterval.unref();
  }

  /**
   * Send contact form email to church
   *
   * Sanitizes all input fields, formats email content, and sends via SMTP.
   * Logs success or failure for auditing purposes.
   *
   * @param {ContactFormData} data - Contact form submission data
   * @returns {Promise<void>} Resolves when email is sent successfully
   * @throws {Error} If email service fails or SMTP connection issues occur
   *
   * @example
   * ```typescript
   * await contactService.sendContactEmail({
   *   name: 'Jane Smith',
   *   email: 'jane@example.com',
   *   subject: 'Church Visit Inquiry',
   *   message: 'I would like to attend your Sabbath service next week.'
   * });
   * ```
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
   *
   * Checks all required fields, email format, and message length requirements.
   * Returns a validation result with specific error messages for each failed validation.
   *
   * @param {Partial<ContactFormData>} data - Contact form data to validate (may be incomplete)
   * @returns {ValidationResult} Object containing validation status and error messages
   *
   * @example
   * ```typescript
   * const result = contactService.validateContactData({
   *   name: 'John',
   *   email: 'invalid-email',
   *   subject: 'Test',
   *   message: 'Hi' // Too short
   * });
   *
   * if (!result.valid) {
   *   console.log(result.errors); // "email format is invalid, message must be at least 20 characters"
   * }
   * ```
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
   *
   * Removes potentially malicious HTML/JavaScript content including:
   * - Script tags and their contents
   * - JavaScript protocol handlers (javascript:, vbscript:, data:)
   * - Event handlers (onclick, onerror, etc.)
   * - iframes
   * - Various XSS vectors and obfuscation attempts
   *
   * @param {string | null | undefined} input - Raw user input to sanitize
   * @returns {string} Sanitized string safe for display/storage
   *
   * @example
   * ```typescript
   * const clean = contactService.sanitizeInput('<script>alert("XSS")</script>Hello');
   * console.log(clean); // "Hello"
   *
   * const safe = contactService.sanitizeInput('<img src=x onerror="alert(1)">');
   * console.log(safe); // ""
   * ```
   */
  sanitizeInput(input: string | null | undefined): string {
    if (!input) return '';

    // Limit input length to prevent ReDoS attacks
    const maxLength = 10000;
    const limited = input.length > maxLength ? input.substring(0, maxLength) : input;

    // Remove null bytes and other control characters (eslint-disable no-control-regex)
    // eslint-disable-next-line no-control-regex
    const withoutControlChars = limited.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    const sanitized = xss(withoutControlChars, {
      whiteList: {},
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script', 'style', 'iframe', 'object', 'embed', 'svg', 'form'],
      onTagAttr: () => '',
    });

    return sanitized.trim();
  }

  /**
   * Check rate limit for IP address
   *
   * Enforces rate limiting to prevent abuse. Tracks requests per IP address
   * within a sliding time window. Automatically resets after window expires.
   *
   * @param {string} ipAddress - Client IP address to check
   * @returns {Promise<boolean>} True if request is allowed, false if rate limit exceeded
   *
   * @example
   * ```typescript
   * const ipAddress = req.ip || '127.0.0.1';
   * const allowed = await contactService.checkRateLimit(ipAddress);
   *
   * if (!allowed) {
   *   return res.status(429).json({ error: 'Too many requests' });
   * }
   * ```
   */
  async checkRateLimit(ipAddress: string): Promise<boolean> {
    // In test environment, only bypass for actual HTTP requests (localhost IPs)
    // This allows unit tests to verify rate limiting logic directly
    if (
      process.env.NODE_ENV === 'test' &&
      (ipAddress.includes('127.0.0.1') || ipAddress.includes('::1') || ipAddress === 'unknown')
    ) {
      return true;
    }

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
   *
   * Checks if email address matches standard email format requirements.
   * Uses linear-time algorithm to prevent ReDoS attacks.
   *
   * @param {string} email - Email address to validate
   * @returns {boolean} True if email format is valid, false otherwise
   * @private
   *
   * @example
   * ```typescript
   * this.isValidEmail('user@example.com'); // Returns: true
   * this.isValidEmail('invalid-email');     // Returns: false
   * this.isValidEmail('missing@domain');    // Returns: false
   * ```
   */
  private isValidEmail(email: string): boolean {
    // Length check to prevent long input attacks
    if (!email || email.length > 254) return false;

    // Simple structural validation without backtracking (ReDoS-safe)
    const atIndex = email.indexOf('@');
    if (atIndex < 1 || atIndex === email.length - 1) return false;

    const localPart = email.substring(0, atIndex);
    const domainPart = email.substring(atIndex + 1);

    // Local part validation
    if (localPart.length === 0 || localPart.length > 64) return false;

    // Domain must have at least one dot and valid TLD
    const lastDotIndex = domainPart.lastIndexOf('.');
    if (lastDotIndex < 1 || lastDotIndex === domainPart.length - 1) return false;

    // No spaces allowed anywhere
    if (email.includes(' ')) return false;

    // TLD must be at least 2 characters
    const tld = domainPart.substring(lastDotIndex + 1);
    if (tld.length < 2) return false;

    return true;
  }

  /**
   * Format email content for sending
   *
   * Creates both plain text and HTML versions of the contact form email.
   * HTML version includes styled formatting with blue header, field labels,
   * and responsive design. Text version provides clean fallback.
   *
   * @param {ContactFormData} data - Sanitized contact form data
   * @returns {{ text: string; html: string }} Email content with both formats
   * @private
   *
   * @example
   * ```typescript
   * const emailContent = this.formatEmailContent({
   *   name: 'John Doe',
   *   email: 'john@example.com',
   *   subject: 'Question about services',
   *   message: 'I would like to learn more...'
   * });
   *
   * // emailContent.text: Plain text version
   * // emailContent.html: Styled HTML version with header and formatting
   * ```
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
   *
   * Automatically runs every minute to remove expired rate limit entries.
   * Prevents memory leaks by deleting IP entries that have exceeded the
   * rate limit window (60 seconds). Called by setInterval in constructor.
   *
   * @private
   *
   * @example
   * ```typescript
   * // Called automatically every 60 seconds
   * // Checks each IP entry and removes if:
   * // now - entry.firstRequest > RATE_LIMIT_WINDOW (60000ms)
   * ```
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
   *
   * Clears all rate limit entries from the map. Used in test suites
   * to ensure test isolation - prevents rate limit state from one test
   * affecting another. Should only be called in testing environments.
   *
   * @example
   * ```typescript
   * // In test setup:
   * beforeEach(() => {
   *   contactService.resetRateLimits();
   * });
   *
   * // Now each test starts with clean rate limit state
   * ```
   */
  resetRateLimits(): void {
    this.rateLimitMap.clear();
    logger.debug('Rate limits reset');
  }

  /**
   * Cleanup resources (for testing purposes)
   *
   * Properly disposes of the cleanup interval timer to prevent test hanging.
   * Clears the interval and sets to undefined to allow garbage collection.
   * Should be called in test teardown to ensure Jest exits cleanly.
   *
   * @example
   * ```typescript
   * // In test teardown:
   * afterEach(() => {
   *   contactService.destroy();
   * });
   *
   * // Prevents "Jest did not exit one second after test run completed"
   * ```
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
  }

  /**
   * Send prayer request email to prayer team
   *
   * @param {object} data - Prayer request data
   * @returns {Promise<void>}
   */
  async sendPrayerRequestEmail(data: {
    name: string;
    email: string;
    request: string;
    isPrivate: boolean;
    wantFollowUp: boolean;
  }): Promise<void> {
    try {
      const sanitizedData = {
        name: this.sanitizeInput(data.name),
        email: this.sanitizeInput(data.email),
        request: this.sanitizeInput(data.request),
      };

      const recipient = data.isPrivate
        ? process.env.CHURCH_PASTOR_EMAIL ||
          process.env.CHURCH_CONTACT_EMAIL ||
          'pastor@singburi-adventist.org'
        : process.env.CHURCH_PRAYER_EMAIL ||
          process.env.CHURCH_CONTACT_EMAIL ||
          'prayer@singburi-adventist.org';

      const text = `
Prayer Request from ${sanitizedData.name}

${data.email ? `Email: ${sanitizedData.email}` : 'No email provided'}
Private: ${data.isPrivate ? 'Yes (pastoral team only)' : 'No'}
Follow-up requested: ${data.wantFollowUp ? 'Yes' : 'No'}

Prayer Request:
${sanitizedData.request}

---
This prayer request was submitted via the church website.
      `.trim();

      const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #e11d48, #be123c); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #475569; }
    .request { background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #e11d48; margin-top: 10px; white-space: pre-wrap; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
    .private { background: #fef2f2; color: #dc2626; }
    .public { background: #f0fdf4; color: #16a34a; }
    .footer { padding: 15px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">🙏 Prayer Request</h2>
      <p style="margin: 5px 0 0; opacity: 0.9;">From the church website</p>
    </div>
    <div class="content">
      <div class="field">
        <span class="label">From:</span> ${sanitizedData.name}
        <span class="badge ${data.isPrivate ? 'private' : 'public'}" style="margin-left: 10px;">
          ${data.isPrivate ? '🔒 Private' : '👥 Share with prayer team'}
        </span>
      </div>
      ${sanitizedData.email ? `<div class="field"><span class="label">Email:</span> <a href="mailto:${sanitizedData.email}">${sanitizedData.email}</a></div>` : ''}
      ${data.wantFollowUp ? '<div class="field"><span class="label">📞 Follow-up requested</span></div>' : ''}
      <div class="field">
        <span class="label">Prayer Request:</span>
        <div class="request">${sanitizedData.request.replace(/\n/g, '<br>')}</div>
      </div>
    </div>
    <div class="footer">
      This prayer request was submitted from the Sing Buri Adventist Center website.
    </div>
  </div>
</body>
</html>
      `.trim();

      await this.emailService.sendEmail({
        to: recipient,
        subject: `Prayer Request from ${sanitizedData.name}${data.isPrivate ? ' (Private)' : ''}`,
        text,
        html,
        replyTo: sanitizedData.email || undefined,
      });

      logger.info('Prayer request email sent', {
        name: sanitizedData.name,
        isPrivate: data.isPrivate,
        wantFollowUp: data.wantFollowUp,
      });
    } catch (error) {
      logger.error('Failed to send prayer request email', error);
      throw error;
    }
  }

  /**
   * Send volunteer interest email to ministry leader
   *
   * @param {object} data - Volunteer interest data
   * @returns {Promise<void>}
   */
  async sendVolunteerEmail(data: {
    name: string;
    email: string;
    phone: string;
    ministry: string;
    ministryId: string;
    message: string;
  }): Promise<void> {
    try {
      const sanitizedData = {
        name: this.sanitizeInput(data.name),
        email: this.sanitizeInput(data.email),
        phone: this.sanitizeInput(data.phone),
        ministry: this.sanitizeInput(data.ministry),
        message: this.sanitizeInput(data.message),
      };

      const text = `
New Volunteer Interest - ${sanitizedData.ministry}

Name: ${sanitizedData.name}
Email: ${sanitizedData.email}
${sanitizedData.phone ? `Phone: ${sanitizedData.phone}` : ''}

Ministry: ${sanitizedData.ministry}

${sanitizedData.message ? `Message:\n${sanitizedData.message}` : ''}

---
This volunteer interest form was submitted via the church website.
      `.trim();

      const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #475569; }
    .ministry-badge { display: inline-block; padding: 8px 16px; background: #dbeafe; color: #1d4ed8; border-radius: 8px; font-weight: bold; }
    .message { background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb; margin-top: 10px; white-space: pre-wrap; }
    .footer { padding: 15px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">🙋 New Volunteer Interest</h2>
      <p style="margin: 5px 0 0; opacity: 0.9;">Someone wants to serve!</p>
    </div>
    <div class="content">
      <div class="field">
        <span class="ministry-badge">${sanitizedData.ministry}</span>
      </div>
      <div class="field">
        <span class="label">Name:</span> ${sanitizedData.name}
      </div>
      <div class="field">
        <span class="label">Email:</span> <a href="mailto:${sanitizedData.email}">${sanitizedData.email}</a>
      </div>
      ${sanitizedData.phone ? `<div class="field"><span class="label">Phone:</span> ${sanitizedData.phone}</div>` : ''}
      ${
        sanitizedData.message
          ? `
      <div class="field">
        <span class="label">Message:</span>
        <div class="message">${sanitizedData.message.replace(/\n/g, '<br>')}</div>
      </div>
      `
          : ''
      }
    </div>
    <div class="footer">
      This volunteer form was submitted from the Sing Buri Adventist Center website.<br>
      Please follow up with ${sanitizedData.name} to discuss their interest in ${sanitizedData.ministry}.
    </div>
  </div>
</body>
</html>
      `.trim();

      await this.emailService.sendEmail({
        to:
          process.env.CHURCH_VOLUNTEER_EMAIL ||
          process.env.CHURCH_CONTACT_EMAIL ||
          'volunteer@singburi-adventist.org',
        subject: `Volunteer Interest: ${sanitizedData.ministry} - ${sanitizedData.name}`,
        text,
        html,
        replyTo: sanitizedData.email,
      });

      logger.info('Volunteer interest email sent', {
        name: sanitizedData.name,
        ministry: sanitizedData.ministry,
      });
    } catch (error) {
      logger.error('Failed to send volunteer interest email', error);
      throw error;
    }
  }
}
