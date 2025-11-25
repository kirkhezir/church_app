/**
 * Message Service
 *
 * Handles all message-related API calls:
 * - List messages (inbox/sent)
 * - Get message details
 * - Send message
 * - Mark as read
 * - Delete message
 */

import apiClient from '../api/apiClient';
import { Message } from '../../types/api';

// ============================================================================
// REQUEST TYPES
// ============================================================================

interface ListMessagesParams {
  folder?: 'inbox' | 'sent';
  unreadOnly?: boolean;
  page?: number;
  limit?: number;
}

interface SendMessageInput {
  recipientId: string;
  subject: string;
  body: string;
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

interface MessageListResponse {
  data: Message[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

interface MessageDetailResponse extends Message {}

interface SendMessageResponse extends Message {}

interface MarkAsReadResponse {
  id: string;
  isRead: boolean;
  readAt: string | null;
}

interface DeleteMessageResponse {
  success: boolean;
  message: string;
}

// ============================================================================
// API CALLS
// ============================================================================

/**
 * List messages (inbox or sent)
 */
export async function listMessages(params: ListMessagesParams = {}): Promise<MessageListResponse> {
  const queryParams = new URLSearchParams();
  if (params.folder) queryParams.append('folder', params.folder);
  if (params.unreadOnly) queryParams.append('unreadOnly', 'true');
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  const queryString = queryParams.toString();
  const url = queryString ? `/messages?${queryString}` : '/messages';

  return await apiClient.get<MessageListResponse>(url);
}

/**
 * Get message details by ID
 */
export async function getMessageById(messageId: string): Promise<MessageDetailResponse> {
  return await apiClient.get<MessageDetailResponse>(`/messages/${messageId}`);
}

/**
 * Send a message
 */
export async function sendMessage(input: SendMessageInput): Promise<SendMessageResponse> {
  return await apiClient.post<SendMessageResponse>('/messages', input);
}

/**
 * Mark message as read
 */
export async function markMessageAsRead(messageId: string): Promise<MarkAsReadResponse> {
  return await apiClient.patch<MarkAsReadResponse>(`/messages/${messageId}/read`);
}

/**
 * Delete message (soft delete)
 */
export async function deleteMessage(messageId: string): Promise<DeleteMessageResponse> {
  return await apiClient.delete<DeleteMessageResponse>(`/messages/${messageId}`);
}

/**
 * Get unread message count
 */
export async function getUnreadCount(): Promise<number> {
  const response = await listMessages({ folder: 'inbox', unreadOnly: true, limit: 1 });
  return response.pagination.totalItems;
}

// ============================================================================
// EXPORTS
// ============================================================================

const messageService = {
  listMessages,
  getMessageById,
  sendMessage,
  markMessageAsRead,
  deleteMessage,
  getUnreadCount,
};

export default messageService;
