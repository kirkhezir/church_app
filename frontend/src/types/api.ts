/**
 * Shared TypeScript types for API requests and responses
 * Matching backend DTOs and entities
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum Role {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  MEMBER = 'MEMBER',
}

export enum EventCategory {
  WORSHIP = 'WORSHIP',
  BIBLE_STUDY = 'BIBLE_STUDY',
  COMMUNITY = 'COMMUNITY',
  FELLOWSHIP = 'FELLOWSHIP',
}

export enum RSVPStatus {
  CONFIRMED = 'CONFIRMED',
  WAITLISTED = 'WAITLISTED',
  CANCELLED = 'CANCELLED',
}

export enum Priority {
  URGENT = 'URGENT',
  NORMAL = 'NORMAL',
}

// ============================================================================
// MEMBER TYPES
// ============================================================================

export interface Member {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  role: Role;
  membershipDate: string;
  privacySettings: {
    showPhone: boolean;
    showEmail: boolean;
    showAddress: boolean;
  };
  emailNotifications: boolean;
  accountLocked: boolean;
  lockedUntil?: string;
  failedLoginAttempts: number;
  lastLoginAt?: string;
  mfaEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MemberProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  role: Role;
  membershipDate: string;
  privacySettings: {
    showPhone: boolean;
    showEmail: boolean;
    showAddress: boolean;
  };
}

// ============================================================================
// EVENT TYPES
// ============================================================================

export interface Event {
  id: string;
  title: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  location: string;
  category: EventCategory;
  maxCapacity?: number;
  imageUrl?: string;
  createdById: string;
  creator?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  rsvpCount?: number;
  hasUserRSVPd?: boolean;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventRSVP {
  id: string;
  eventId: string;
  memberId: string;
  status: RSVPStatus;
  rsvpedAt: string;
  updatedAt: string;
  member?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// ============================================================================
// ANNOUNCEMENT TYPES
// ============================================================================

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: Priority;
  authorId: string;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  publishedAt: string;
  archivedAt?: string;
  viewCount?: number;
  hasViewed?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// MESSAGE TYPES
// ============================================================================

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  subject: string;
  body: string;
  isRead: boolean;
  readAt?: string;
  sentAt: string;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  recipient?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// ============================================================================
// AUTH TYPES
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
}

// ============================================================================
// WEBSOCKET EVENT TYPES
// ============================================================================

export interface WebSocketMessage {
  event: string;
  data: unknown;
}

export interface NewMessageEvent {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  sentAt: string;
}

export interface MessageReadEvent {
  messageId: string;
  readBy: string;
  readAt: string;
}

export interface TypingEvent {
  userId: string;
}

export interface AnnouncementEvent {
  id: string;
  title: string;
  content: string;
  priority: Priority;
  createdAt: string;
}

export interface EventUpdateEvent {
  eventId: string;
  type: 'created' | 'updated' | 'cancelled' | 'deleted';
  event: {
    id: string;
    title: string;
    startDateTime: string;
  };
}
