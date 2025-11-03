import { Router } from 'express';
import { ContactController } from '../controllers/contactController';

/**
 * Contact Routes
 * Public endpoint for contact form submissions
 */
const router = Router();
const contactController = new ContactController();

/**
 * POST /api/v1/contact
 * Submit contact form (public endpoint, no authentication required)
 */
router.post('/', (req, res) => contactController.submitContactForm(req, res));

export default router;
