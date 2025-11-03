import { Router } from 'express';
import { ContactController } from '../controllers/contactController';
import { ContactService } from '../../application/services/contactService';

/**
 * Contact Routes Module
 *
 * Defines public API endpoints for contact form functionality.
 * Uses shared ContactService instance to maintain consistent rate limiting
 * across all requests. No authentication required for public access.
 *
 * @module contactRoutes
 *
 * @example
 * ```typescript
 * // In main app.ts:
 * import contactRoutes from './presentation/routes/contactRoutes';
 * app.use('/api/v1/contact', contactRoutes);
 *
 * // Available endpoint:
 * // POST /api/v1/contact - Submit contact form
 * ```
 */
const router = Router();

/**
 * Shared ContactService instance
 *
 * Exported for testing purposes to allow rate limit state management.
 * Using a singleton ensures rate limiting works correctly across all
 * controller instances - the same rate limit map is checked for every request.
 *
 * @type {ContactService}
 *
 * @example
 * ```typescript
 * // In tests, reset rate limits between test cases:
 * import { contactService } from '../routes/contactRoutes';
 *
 * beforeEach(() => {
 *   contactService.resetRateLimits();
 * });
 * ```
 */
export const contactService = new ContactService();
const contactController = new ContactController(contactService);

/**
 * POST /api/v1/contact - Submit contact form
 *
 * Public endpoint for website visitors to send messages.
 * Rate limited to 10 requests per minute per IP address.
 *
 * Request body:
 * - name: string (required, 2-100 chars)
 * - email: string (required, valid email format)
 * - subject: string (required, 5-200 chars)
 * - message: string (required, 20-2000 chars)
 *
 * @name POST /contact
 * @function
 *
 * @example
 * ```bash
 * curl -X POST http://localhost:3000/api/v1/contact \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "name": "John Doe",
 *     "email": "john@example.com",
 *     "subject": "Website Question",
 *     "message": "I would like to know more about your services..."
 *   }'
 * ```
 */
router.post('/', (req, res) => contactController.submitContactForm(req, res));

export default router;
