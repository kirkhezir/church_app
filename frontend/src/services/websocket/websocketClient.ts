import { io, Socket } from 'socket.io-client';
import {
  NewMessageEvent,
  MessageReadEvent,
  TypingEvent,
  AnnouncementEvent,
  EventUpdateEvent,
} from '../../types/api';

/**
 * WebSocket Client
 * Manages real-time communication using Socket.io
 */
class WebSocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  /**
   * Connect to WebSocket server
   */
  connect(token: string): void {
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

    this.socket = io(wsUrl, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventListeners();
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.reconnectAttempts = 0;
    }
  }

  /**
   * Setup Socket.io event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.disconnect();
      }
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Emit event to server
   */
  emit(event: string, data: unknown): void {
    if (!this.socket?.connected) {
      console.error('Cannot emit event - WebSocket not connected');
      return;
    }

    this.socket.emit(event, data);
  }

  /**
   * Listen for event from server
   */
  on<T = unknown>(event: string, callback: (data: T) => void): void {
    if (!this.socket) {
      console.error('Cannot listen to event - WebSocket not initialized');
      return;
    }

    this.socket.on(event, callback);
  }

  /**
   * Remove event listener
   */
  off(event: string, callback?: (...args: unknown[]) => void): void {
    if (!this.socket) return;

    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
  }

  // ============================================================================
  // MESSAGING EVENTS
  // ============================================================================

  /**
   * Listen for new messages
   */
  onNewMessage(callback: (message: NewMessageEvent) => void): void {
    this.on<NewMessageEvent>('message:new', callback);
  }

  /**
   * Listen for message read receipts
   */
  onMessageRead(callback: (data: MessageReadEvent) => void): void {
    this.on<MessageReadEvent>('message:read', callback);
  }

  /**
   * Send typing indicator start
   */
  startTyping(recipientId: string): void {
    this.emit('typing:start', { recipientId });
  }

  /**
   * Send typing indicator stop
   */
  stopTyping(recipientId: string): void {
    this.emit('typing:stop', { recipientId });
  }

  /**
   * Listen for typing indicator start
   */
  onTypingStart(callback: (data: TypingEvent) => void): void {
    this.on<TypingEvent>('typing:start', callback);
  }

  /**
   * Listen for typing indicator stop
   */
  onTypingStop(callback: (data: TypingEvent) => void): void {
    this.on<TypingEvent>('typing:stop', callback);
  }

  /**
   * Mark message as read
   */
  markMessageAsRead(messageId: string, senderId: string): void {
    this.emit('message:read', { messageId, senderId });
  }

  // ============================================================================
  // ANNOUNCEMENT EVENTS
  // ============================================================================

  /**
   * Listen for new announcements
   */
  onNewAnnouncement(callback: (announcement: AnnouncementEvent) => void): void {
    this.on<AnnouncementEvent>('announcement:new', callback);
  }

  /**
   * Listen for urgent announcements
   */
  onUrgentAnnouncement(callback: (announcement: AnnouncementEvent) => void): void {
    this.on<AnnouncementEvent>('announcement:urgent', callback);
  }

  // ============================================================================
  // EVENT UPDATE EVENTS
  // ============================================================================

  /**
   * Listen for event updates
   */
  onEventUpdate(callback: (update: EventUpdateEvent) => void): void {
    this.on<EventUpdateEvent>('event:update', callback);
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  /**
   * Remove all message event listeners
   */
  offMessageEvents(): void {
    this.off('message:new');
    this.off('message:read');
    this.off('typing:start');
    this.off('typing:stop');
  }

  /**
   * Remove all announcement event listeners
   */
  offAnnouncementEvents(): void {
    this.off('announcement:new');
    this.off('announcement:urgent');
  }

  /**
   * Remove all event update listeners
   */
  offEventUpdateEvents(): void {
    this.off('event:update');
  }

  /**
   * Remove all event listeners
   */
  offAll(): void {
    this.offMessageEvents();
    this.offAnnouncementEvents();
    this.offEventUpdateEvents();
  }
}

// Export singleton instance
export const websocketClient = new WebSocketClient();
export default websocketClient;
