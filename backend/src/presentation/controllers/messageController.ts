/**
 * Message Controller (T247-T251)
 *
 * Handles message-related HTTP requests:
 * - POST /api/v1/messages - Send a message
 * - GET /api/v1/messages - List messages (inbox/sent)
 * - GET /api/v1/messages/:id - Get message details
 * - PATCH /api/v1/messages/:id/read - Mark message as read
 * - DELETE /api/v1/messages/:id - Delete message (soft delete)
 */

import { Request, Response } from 'express';
import { SendMessage } from '../../application/useCases/sendMessage';
import { GetMessages } from '../../application/useCases/getMessages';
import { GetMessageById } from '../../application/useCases/getMessageById';
import { MarkMessageAsRead } from '../../application/useCases/markMessageAsRead';
import { DeleteMessage } from '../../application/useCases/deleteMessage';
import logger from '../../infrastructure/logging/logger';

/**
 * Message Controller
 */
export class MessageController {
  private sendMessageUseCase: SendMessage;
  private getMessagesUseCase: GetMessages;
  private getMessageByIdUseCase: GetMessageById;
  private markMessageAsReadUseCase: MarkMessageAsRead;
  private deleteMessageUseCase: DeleteMessage;

  constructor() {
    this.sendMessageUseCase = new SendMessage();
    this.getMessagesUseCase = new GetMessages();
    this.getMessageByIdUseCase = new GetMessageById();
    this.markMessageAsReadUseCase = new MarkMessageAsRead();
    this.deleteMessageUseCase = new DeleteMessage();
  }

  /**
   * POST /api/v1/messages
   * Send a message to another member
   */
  sendMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const senderId = (req as any).user?.userId;

      if (!senderId) {
        res.status(401).json({
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        });
        return;
      }

      const { recipientId, subject, body } = req.body;

      // Validate required fields
      if (!recipientId) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'recipientId is required',
            field: 'recipientId',
          },
        });
        return;
      }

      if (!subject || subject.trim().length < 3) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Subject must be at least 3 characters',
            field: 'subject',
          },
        });
        return;
      }

      if (!body || body.trim().length === 0) {
        res.status(400).json({
          error: { code: 'VALIDATION_ERROR', message: 'Message body is required', field: 'body' },
        });
        return;
      }

      const result = await this.sendMessageUseCase.execute({
        senderId,
        recipientId,
        subject: subject.trim(),
        body: body.trim(),
      });

      res.status(201).json(result);
    } catch (error) {
      logger.error('Error sending message', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      if (error instanceof Error) {
        if (error.message === 'Recipient not found') {
          res.status(404).json({
            error: { code: 'NOT_FOUND', message: 'Recipient not found' },
          });
          return;
        }
        if (error.message === 'Cannot send message to yourself') {
          res.status(400).json({
            error: { code: 'VALIDATION_ERROR', message: 'Cannot send message to yourself' },
          });
          return;
        }
      }

      res.status(500).json({
        error: { code: 'INTERNAL_ERROR', message: 'Failed to send message' },
      });
    }
  };

  /**
   * GET /api/v1/messages
   * List messages (inbox or sent)
   */
  listMessages = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        });
        return;
      }

      const { folder = 'inbox', unreadOnly = 'false', page = '1', limit = '20' } = req.query;

      // Validate folder
      if (folder !== 'inbox' && folder !== 'sent') {
        res.status(400).json({
          error: { code: 'VALIDATION_ERROR', message: 'folder must be inbox or sent' },
        });
        return;
      }

      const result = await this.getMessagesUseCase.execute({
        userId,
        folder: folder as 'inbox' | 'sent',
        unreadOnly: unreadOnly === 'true',
        page: parseInt(page as string, 10),
        limit: Math.min(parseInt(limit as string, 10), 100),
      });

      res.status(200).json(result);
    } catch (error) {
      logger.error('Error listing messages', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      res.status(500).json({
        error: { code: 'INTERNAL_ERROR', message: 'Failed to list messages' },
      });
    }
  };

  /**
   * GET /api/v1/messages/:id
   * Get message details
   */
  getMessageById = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        });
        return;
      }

      const { id } = req.params;

      const result = await this.getMessageByIdUseCase.execute({
        messageId: id,
        userId,
      });

      if (!result) {
        res.status(404).json({
          error: { code: 'NOT_FOUND', message: 'Message not found' },
        });
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      logger.error('Error getting message', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      if (error instanceof Error && error.message === 'Access denied') {
        res.status(403).json({
          error: { code: 'FORBIDDEN', message: 'Access denied' },
        });
        return;
      }

      res.status(500).json({
        error: { code: 'INTERNAL_ERROR', message: 'Failed to get message' },
      });
    }
  };

  /**
   * PATCH /api/v1/messages/:id/read
   * Mark message as read
   */
  markAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        });
        return;
      }

      const { id } = req.params;

      const result = await this.markMessageAsReadUseCase.execute({
        messageId: id,
        userId,
      });

      res.status(200).json(result);
    } catch (error) {
      logger.error('Error marking message as read', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      if (error instanceof Error) {
        if (error.message === 'Message not found') {
          res.status(404).json({
            error: { code: 'NOT_FOUND', message: 'Message not found' },
          });
          return;
        }
        if (error.message === 'Access denied') {
          res.status(403).json({
            error: { code: 'FORBIDDEN', message: 'Only recipient can mark message as read' },
          });
          return;
        }
      }

      res.status(500).json({
        error: { code: 'INTERNAL_ERROR', message: 'Failed to mark message as read' },
      });
    }
  };

  /**
   * DELETE /api/v1/messages/:id
   * Delete message (soft delete)
   */
  deleteMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        });
        return;
      }

      const { id } = req.params;

      const result = await this.deleteMessageUseCase.execute({
        messageId: id,
        userId,
      });

      res.status(200).json(result);
    } catch (error) {
      logger.error('Error deleting message', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      if (error instanceof Error) {
        if (error.message === 'Message not found') {
          res.status(404).json({
            error: { code: 'NOT_FOUND', message: 'Message not found' },
          });
          return;
        }
        if (error.message === 'Access denied') {
          res.status(403).json({
            error: { code: 'FORBIDDEN', message: 'Access denied' },
          });
          return;
        }
      }

      res.status(500).json({
        error: { code: 'INTERNAL_ERROR', message: 'Failed to delete message' },
      });
    }
  };
}
