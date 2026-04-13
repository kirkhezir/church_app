import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '../logging/logger';
import { jwtService } from '../auth/jwtService';
import { pushNotificationService } from '../notifications/pushNotificationService';

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
    const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
      .split(',')
      .map((s) => s.trim());
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: corsOrigins,
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

      // Join role-based room for targeted broadcasts (admin/staff notifications)
      const role = socket.data.role as string | undefined;
      if (role === 'ADMIN' || role === 'STAFF') {
        socket.join('role:staff-admin');
      }

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

    // Fire push notification for offline users (fire-and-forget)
    if (!this.isUserConnected(recipientId)) {
      pushNotificationService
        .notifyNewMessage(recipientId, {
          id: message.id,
          senderName: message.senderName,
          subject: message.content,
        })
        .catch((err) => logger.error('Push: message notification failed', { err }));
    }
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

    // Fire push notification to all subscribers (fire-and-forget)
    pushNotificationService
      .sendToAll({
        title:
          announcement.priority === 'URGENT' ? '🚨 Urgent Announcement' : '📢 New Announcement',
        body: announcement.title,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: `announcement-${announcement.id}`,
        data: { type: 'announcement', announcementId: announcement.id },
        requireInteraction: announcement.priority === 'URGENT',
      })
      .then((count) => {
        if (count > 0) logger.info('Push: announcement sent', { count });
      })
      .catch((err) => logger.error('Push: announcement notification failed', { err }));
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

    // Fire push notification for event updates (fire-and-forget)
    const label =
      update.type === 'cancelled'
        ? '❌ Event Cancelled'
        : update.type === 'created'
          ? '📅 New Event'
          : '📅 Event Updated';
    pushNotificationService
      .sendToAll({
        title: label,
        body: update.event.title,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: `event-${eventId}-${update.type}`,
        data: { type: 'event', eventId },
        requireInteraction: update.type === 'cancelled',
      })
      .then((count) => {
        if (count > 0) logger.info('Push: event update sent', { count, type: update.type });
      })
      .catch((err) => logger.error('Push: event notification failed', { err }));
  }

  /**
   * Notify admin/staff of a new pending prayer request
   */
  sendPrayerPendingNotification(prayer: { id: string; name: string; category: string }): void {
    this.io?.to('role:staff-admin').emit('prayer:pending', prayer);

    // Fire push notification to admin/staff (fire-and-forget)
    pushNotificationService
      .sendToAdminStaff({
        title: '🙏 Prayer Request Needs Review',
        body: `From ${prayer.name} · ${prayer.category}`,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: `prayer-pending-${prayer.id}`,
        data: { type: 'prayer', prayerId: prayer.id },
        requireInteraction: true,
      })
      .catch((err) => logger.error('Push: prayer pending notification failed', { err }));
  }

  /**
   * Broadcast to all members when a prayer request is approved (added to wall)
   */
  sendPrayerApprovedNotification(prayer: { id: string; category: string; request: string }): void {
    this.broadcast('prayer:approved', prayer);

    // Fire push notification for approved prayer (fire-and-forget)
    pushNotificationService
      .sendToAll({
        title: '🙏 New Prayer Request',
        body: 'A new prayer has been added to the community wall.',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: `prayer-${prayer.id}`,
        data: { type: 'prayer', prayerId: prayer.id },
      })
      .catch((err) => logger.error('Push: prayer notification failed', { err }));
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
