/**
 * useMessages Hook
 *
 * Custom hook for managing message data fetching and state
 * Handles loading, error states, and data caching
 */

import { useState, useEffect, useCallback } from 'react';
import messageService from '../services/endpoints/messageService';
import { Message } from '../types/api';

interface UseMessagesOptions {
  folder?: 'inbox' | 'sent';
  unreadOnly?: boolean;
  page?: number;
  limit?: number;
  autoFetch?: boolean;
}

interface UseMessagesReturn {
  messages: Message[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  } | null;
  refetch: () => Promise<void>;
  setPage: (page: number) => void;
  setFolder: (folder: 'inbox' | 'sent') => void;
}

/**
 * Hook for fetching and managing messages list
 */
export function useMessages(options: UseMessagesOptions = {}): UseMessagesReturn {
  const {
    folder: initialFolder = 'inbox',
    unreadOnly = false,
    page: initialPage = 1,
    limit = 20,
    autoFetch = true,
  } = options;

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(initialPage);
  const [folder, setFolder] = useState<'inbox' | 'sent'>(initialFolder);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  } | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await messageService.listMessages({
        folder,
        unreadOnly,
        page,
        limit,
      });

      setMessages(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, [folder, unreadOnly, page, limit]);

  useEffect(() => {
    if (autoFetch) {
      fetchMessages();
    }
  }, [autoFetch, fetchMessages]);

  const handleSetFolder = useCallback((newFolder: 'inbox' | 'sent') => {
    setFolder(newFolder);
    setPage(1); // Reset to first page when changing folder
  }, []);

  return {
    messages,
    loading,
    error,
    pagination,
    refetch: fetchMessages,
    setPage,
    setFolder: handleSetFolder,
  };
}

interface UseMessageDetailOptions {
  messageId: string;
  autoFetch?: boolean;
}

interface UseMessageDetailReturn {
  message: Message | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching a single message's details
 */
export function useMessageDetail(options: UseMessageDetailOptions): UseMessageDetailReturn {
  const { messageId, autoFetch = true } = options;

  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessage = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await messageService.getMessageById(messageId);
      setMessage(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch message');
    } finally {
      setLoading(false);
    }
  }, [messageId]);

  useEffect(() => {
    if (autoFetch && messageId) {
      fetchMessage();
    }
  }, [autoFetch, messageId, fetchMessage]);

  return {
    message,
    loading,
    error,
    refetch: fetchMessage,
  };
}

interface UseSendMessageReturn {
  sendMessage: (input: { recipientId: string; subject: string; body: string }) => Promise<Message>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for sending messages
 */
export function useSendMessage(): UseSendMessageReturn {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (input: { recipientId: string; subject: string; body: string }): Promise<Message> => {
      try {
        setLoading(true);
        setError(null);

        const response = await messageService.sendMessage(input);
        return response;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to send message';
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    sendMessage,
    loading,
    error,
  };
}

interface UseDeleteMessageReturn {
  deleteMessage: (messageId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for deleting messages
 */
export function useDeleteMessage(): UseDeleteMessageReturn {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      setLoading(true);
      setError(null);

      await messageService.deleteMessage(messageId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete message');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    deleteMessage,
    loading,
    error,
  };
}

interface UseUnreadCountReturn {
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for getting unread message count
 */
export function useUnreadCount(autoFetch: boolean = true): UseUnreadCountReturn {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCount = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const count = await messageService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch unread count');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchCount();
    }
  }, [autoFetch, fetchCount]);

  return {
    unreadCount,
    loading,
    error,
    refetch: fetchCount,
  };
}
