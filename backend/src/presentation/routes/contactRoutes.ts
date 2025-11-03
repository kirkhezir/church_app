import { Router } from 'express';
import { ContactController } from '../controllers/contactController';
import { ContactService } from '../../application/services/contactService';

/**
 * Contact Routes
 * Public endpoint for contact form submissions
 */
const router = Router();

// Shared ContactService instance for rate limiting
export const contactService = new ContactService();
const contactController = new ContactController(contactService);

/**
 * POST /api/v1/contact
 * Submit contact form (public endpoint, no authentication required)
 */
router.post('/', (req, res) => contactController.submitContactForm(req, res));

export default router;
