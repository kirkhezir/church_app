import { Request, Response } from 'express';
import { ContactService } from '../../application/services/contactService';
import { logger } from '../../infrastructure/logging/logger';

/**
 * Contact Controller
 *
 * Handles HTTP requests for contact form submissions at POST /api/v1/contact.
 * Orchestrates validation, rate limiting, and email sending through ContactService.
 * Implements proper error handling and structured JSON responses for all scenarios.
 *
 * @class
 *
 * @example
 * ```typescript
 * // Create controller with default service
 * const controller = new ContactController();
 *
 * // Or inject service for testing
 * const mockService = new ContactService();
 * const controller = new ContactController(mockService);
 *
 * // Use in Express route
 * router.post('/contact', (req, res) => controller.submitContactForm(req, res));
 * ```
 */
export class ContactController {
  private contactService: ContactService;

  /**
   * Creates a new ContactController instance
   *
   * Supports dependency injection for testing. If no service is provided,
   * creates a new ContactService instance automatically.
   *
   * @param {ContactService} [contactService] - Optional ContactService instance for testing
   *
   * @example
   * ```typescript
   * // Production: use default service
   * const controller = new ContactController();
   *
   * // Testing: inject mocked service
   * const mockService = {
   *   validateContactData: jest.fn(),
   *   checkRateLimit: jest.fn(),
   *   sendContactEmail: jest.fn()
   * };
   * const controller = new ContactController(mockService as any);
   * ```
   */
  constructor(contactService?: ContactService) {
    this.contactService = contactService || new ContactService();
  }

  /**
   * Submit contact form
   *
   * Handles POST /api/v1/contact endpoint. Performs three-step process:
   * 1. Validates all required fields and formats
   * 2. Checks rate limit (10 requests per minute per IP)
   * 3. Sanitizes input and sends email
   *
   * Returns appropriate HTTP status codes:
   * - 201: Success - Message sent
   * - 400: Validation Error - Invalid input data
   * - 429: Rate Limit Exceeded - Too many requests
   * - 500: Server Error - Email sending failed
   *
   * @param {Request} req - Express request with contact form data in body
   * @param {Response} res - Express response for JSON response
   * @returns {Promise<void>}
   *
   * @example
   * ```typescript
   * // Success case (201)
   * POST /api/v1/contact
   * {
   *   "name": "John Doe",
   *   "email": "john@example.com",
   *   "subject": "Question",
   *   "message": "Hello, I have a question about..."
   * }
   *
   * Response:
   * {
   *   "success": true,
   *   "message": "Your message has been received. We will get back to you soon!"
   * }
   *
   * // Validation error (400)
   * {
   *   "error": "Validation failed",
   *   "message": ["Email format is invalid", "Message must be at least 20 characters"]
   * }
   *
   * // Rate limit (429)
   * {
   *   "error": "Too many requests",
   *   "message": "Please wait a moment before submitting another message."
   * }
   * ```
   */
  async submitContactForm(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, subject, message } = req.body;

      // Validate input
      const validation = this.contactService.validateContactData({
        name,
        email,
        subject,
        message,
      });

      if (!validation.valid) {
        res.status(400).json({
          error: 'Validation failed',
          message: validation.errors,
        });
        return;
      }

      // Check rate limit
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
      const rateLimitOk = await this.contactService.checkRateLimit(ipAddress);

      if (!rateLimitOk) {
        res.status(429).json({
          error: 'Too many requests',
          message: 'Please wait a moment before submitting another message.',
        });
        return;
      }

      // Send email
      await this.contactService.sendContactEmail({
        name,
        email,
        subject,
        message,
      });

      logger.info('Contact form submitted successfully', {
        name,
        email: email.replace(/(?<=.{2}).*(?=@)/, '***'), // Mask email for privacy
        ipAddress,
      });

      res.status(201).json({
        success: true,
        message: 'Your message has been received. We will get back to you soon!',
      });
    } catch (error) {
      logger.error('Error processing contact form', error);

      res.status(500).json({
        error: 'Failed to send message',
        message: 'An error occurred while processing your request. Please try again later.',
      });
    }
  }

  /**
   * Submit prayer request
   *
   * Handles POST /api/v1/contact/prayer-request endpoint.
   * Processes prayer requests from website visitors.
   *
   * @param {Request} req - Express request with prayer request data in body
   * @param {Response} res - Express response for JSON response
   * @returns {Promise<void>}
   */
  async submitPrayerRequest(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, request, isPrivate, wantFollowUp } = req.body;

      // Basic validation
      if (!name || typeof name !== 'string' || name.trim().length < 1) {
        res.status(400).json({
          error: 'Validation failed',
          message: ['Name is required'],
        });
        return;
      }

      if (!request || typeof request !== 'string' || request.trim().length < 10) {
        res.status(400).json({
          error: 'Validation failed',
          message: ['Prayer request must be at least 10 characters'],
        });
        return;
      }

      if (wantFollowUp && (!email || typeof email !== 'string')) {
        res.status(400).json({
          error: 'Validation failed',
          message: ['Email is required for follow-up'],
        });
        return;
      }

      // Check rate limit
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
      const rateLimitOk = await this.contactService.checkRateLimit(ipAddress);

      if (!rateLimitOk) {
        res.status(429).json({
          error: 'Too many requests',
          message: 'Please wait a moment before submitting another request.',
        });
        return;
      }

      // Send notification email to prayer team
      await this.contactService.sendPrayerRequestEmail({
        name: name.trim(),
        email: email?.trim() || '',
        request: request.trim(),
        isPrivate: Boolean(isPrivate),
        wantFollowUp: Boolean(wantFollowUp),
      });

      logger.info('Prayer request submitted', {
        name,
        isPrivate,
        wantFollowUp,
        ipAddress,
      });

      res.status(201).json({
        success: true,
        message: 'Your prayer request has been received. We are praying for you.',
      });
    } catch (error) {
      logger.error('Error processing prayer request', error);

      res.status(500).json({
        error: 'Failed to submit prayer request',
        message: 'An error occurred. Please try again later.',
      });
    }
  }

  /**
   * Submit volunteer interest
   *
   * Handles POST /api/v1/contact/volunteer endpoint.
   * Processes volunteer interest forms from website visitors.
   *
   * @param {Request} req - Express request with volunteer data in body
   * @param {Response} res - Express response for JSON response
   * @returns {Promise<void>}
   */
  async submitVolunteerInterest(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, phone, ministry, ministryId, message } = req.body;

      // Basic validation
      if (!name || typeof name !== 'string' || name.trim().length < 1) {
        res.status(400).json({
          error: 'Validation failed',
          message: ['Name is required'],
        });
        return;
      }

      if (!email || typeof email !== 'string' || !email.includes('@')) {
        res.status(400).json({
          error: 'Validation failed',
          message: ['Valid email is required'],
        });
        return;
      }

      if (!ministry || typeof ministry !== 'string') {
        res.status(400).json({
          error: 'Validation failed',
          message: ['Ministry selection is required'],
        });
        return;
      }

      // Check rate limit
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
      const rateLimitOk = await this.contactService.checkRateLimit(ipAddress);

      if (!rateLimitOk) {
        res.status(429).json({
          error: 'Too many requests',
          message: 'Please wait a moment before submitting another request.',
        });
        return;
      }

      // Send notification email to ministry leader
      await this.contactService.sendVolunteerEmail({
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || '',
        ministry: ministry.trim(),
        ministryId: ministryId || '',
        message: message?.trim() || '',
      });

      logger.info('Volunteer interest submitted', {
        name,
        ministry,
        ipAddress,
      });

      res.status(201).json({
        success: true,
        message: 'Thank you for your interest! A ministry leader will contact you soon.',
      });
    } catch (error) {
      logger.error('Error processing volunteer interest', error);

      res.status(500).json({
        error: 'Failed to submit volunteer interest',
        message: 'An error occurred. Please try again later.',
      });
    }
  }
}
