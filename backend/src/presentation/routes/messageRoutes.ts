/**
 * Message Routes (T252)
 *
 * Routes for message-related endpoints:
 * - POST /api/v1/messages - Send a message
 * - GET /api/v1/messages - List messages (inbox/sent)
 * - GET /api/v1/messages/:id - Get message details
 * - PATCH /api/v1/messages/:id/read - Mark message as read
 * - DELETE /api/v1/messages/:id - Delete message
 *
 * All routes require authentication
 */

import { Router } from 'express';
import { MessageController } from '../controllers/messageController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const messageController = new MessageController();

/**
 * POST /api/v1/messages
 * Send a message to another member
 * Requires authentication
 */
router.post('/', authMiddleware, messageController.sendMessage);

/**
 * GET /api/v1/messages
 * List messages (inbox or sent)
 * Query params: folder (inbox|sent), unreadOnly, page, limit
 * Requires authentication
 */
router.get('/', authMiddleware, messageController.listMessages);

/**
 * GET /api/v1/messages/:id
 * Get message details
 * Requires authentication
 */
router.get('/:id', authMiddleware, messageController.getMessageById);

/**
 * PATCH /api/v1/messages/:id/read
 * Mark message as read
 * Requires authentication
 */
router.patch('/:id/read', authMiddleware, messageController.markAsRead);

/**
 * DELETE /api/v1/messages/:id
 * Delete message (soft delete)
 * Requires authentication
 */
router.delete('/:id', authMiddleware, messageController.deleteMessage);

export default router;
