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
}
