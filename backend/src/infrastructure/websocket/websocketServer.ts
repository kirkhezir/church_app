import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '../logging/logger';
import { jwtService } from '../auth/jwtService';

/**
 * WebSocket Server
 * Handles real-time communication using Socket.io
 */
export class WebSocketServer {
  private io: SocketIOServer | null = null;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  /**
   * Initialize WebSocket server
   */
  initialize(httpServer: HTTPServer): void {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        credentials: true,
      },
    });

    this.setupAuthenticationMiddleware();
    this.setupConnectionHandlers();

    logger.info('🔌 WebSocket server initialized');
  }

  /**
   * Setup authentication middleware
   */
  private setupAuthenticationMiddleware(): void {
    this.io?.use(async (socket, next) => {
      try {
        const token =
          socket.handshake.auth.token ||
          socket.handshake.headers.authorization?.replace('Bearer ', '');

        if (!token) {
          return next(new Error('Authentication token missing'));
        }

        // Verify JWT token
        const payload = await jwtService.verifyAccessToken(token);

        // Attach user data to socket
        socket.data.userId = payload.userId;
        socket.data.email = payload.email;
        socket.data.role = payload.role;

        next();
      } catch (error) {
        logger.error('WebSocket authentication failed', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  /**
   * Setup connection handlers
   */
  private setupConnectionHandlers(): void {
    this.io?.on('connection', (socket: Socket) => {
      const userId = socket.data.userId;

      logger.info('WebSocket client connected', {
        socketId: socket.id,
        userId,
      });

      // Track connected user
      this.connectedUsers.set(userId, socket.id);

      // Join user to their personal room
      socket.join(`user:${userId}`);

      // Handle disconnection
      socket.on('disconnect', () => {
        logger.info('WebSocket client disconnected', {
          socketId: socket.id,
          userId,
        });

        this.connectedUsers.delete(userId);
      });

      // Handle typing indicator for messages
      socket.on('typing:start', (data: { recipientId: string }) => {
        this.sendToUser(data.recipientId, 'typing:start', {
          userId,
        });
      });

      socket.on('typing:stop', (data: { recipientId: string }) => {
        this.sendToUser(data.recipientId, 'typing:stop', {
          userId,
        });
      });

      // Handle message read receipts
      socket.on('message:read', (data: { messageId: string; senderId: string }) => {
        this.sendToUser(data.senderId, 'message:read', {
          messageId: data.messageId,
          readBy: userId,
          readAt: new Date().toISOString(),
        });
      });
    });
  }

  /**
   * Send event to specific user
   */
  sendToUser(userId: string, event: string, data: unknown): void {
    this.io?.to(`user:${userId}`).emit(event, data);
  }

  /**
   * Send event to all connected users
   */
  broadcast(event: string, data: unknown): void {
    this.io?.emit(event, data);
  }

  /**
   * Send event to all users except specific user
   */
  broadcastExcept(userId: string, event: string, data: unknown): void {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io?.except(socketId).emit(event, data);
    } else {
      this.broadcast(event, data);
    }
  }

  /**
   * Send new message notification
   */
  sendMessageNotification(
    recipientId: string,
    message: {
      id: string;
      senderId: string;
      senderName: string;
      content: string;
      sentAt: string;
    }
  ): void {
    this.sendToUser(recipientId, 'message:new', message);
  }

  /**
   * Send new announcement notification
   */
  sendAnnouncementNotification(announcement: {
    id: string;
    title: string;
    content: string;
    priority: string;
    createdAt: string;
  }): void {
    this.broadcast('announcement:new', announcement);
  }

  /**
   * Send urgent announcement to specific user
   */
  sendUrgentAnnouncementToUser(
    userId: string,
    announcement: {
      id: string;
      title: string;
      content: string;
      createdAt: string;
    }
  ): void {
    this.sendToUser(userId, 'announcement:urgent', announcement);
  }

  /**
   * Send event update notification
   */
  sendEventUpdateNotification(
    eventId: string,
    update: {
      type: 'created' | 'updated' | 'cancelled' | 'deleted';
      event: {
        id: string;
        title: string;
        startDateTime: string;
      };
    }
  ): void {
    this.broadcast('event:update', {
      eventId,
      ...update,
    });
  }

  /**
   * Check if user is connected
   */
  isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  /**
   * Get count of connected users
   */
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  /**
   * Get Socket.IO server instance
   */
  getIO(): SocketIOServer | null {
    return this.io;
  }
}

// Export singleton instance
export const websocketServer = new WebSocketServer();
