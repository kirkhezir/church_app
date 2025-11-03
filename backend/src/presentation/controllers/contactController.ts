import { Request, Response } from 'express';
import { ContactService } from '../../application/services/contactService';
import { logger } from '../../infrastructure/logging/logger';

/**
 * Contact Controller
 * Handles HTTP requests for contact form submissions
 */
export class ContactController {
  private contactService: ContactService;

  constructor(contactService?: ContactService) {
    this.contactService = contactService || new ContactService();
  }

  /**
   * POST /api/v1/contact
   * Submit contact form
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
