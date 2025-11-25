/**
 * useMembers Hook
 *
 * Custom hook for managing member directory data fetching and state
 * Handles loading, error states, and data caching
 */

import { useState, useEffect, useCallback } from 'react';
import memberService, { MemberPublic } from '../services/endpoints/memberService';

interface UseMembersOptions {
  search?: string;
  page?: number;
  limit?: number;
  autoFetch?: boolean;
}

interface UseMembersReturn {
  members: MemberPublic[];
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
}

/**
 * Hook for fetching and managing members list
 */
export function useMembers(options: UseMembersOptions = {}): UseMembersReturn {
  const { search, page: initialPage = 1, limit = 20, autoFetch = true } = options;

  const [members, setMembers] = useState<MemberPublic[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(initialPage);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  } | null>(null);

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await memberService.listMembers({
        search,
        page,
        limit,
      });

      setMembers(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch members');
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  }, [search, page, limit]);

  useEffect(() => {
    if (autoFetch) {
      fetchMembers();
    }
  }, [autoFetch, fetchMembers]);

  return {
    members,
    loading,
    error,
    pagination,
    refetch: fetchMembers,
    setPage,
  };
}

interface UseMemberSearchOptions {
  query: string;
  limit?: number;
  debounceMs?: number;
}

interface UseMemberSearchReturn {
  results: MemberPublic[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook for searching members with debounce
 */
export function useMemberSearch(options: UseMemberSearchOptions): UseMemberSearchReturn {
  const { query, limit = 20 } = options;

  const [results, setResults] = useState<MemberPublic[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await memberService.searchMembers(query, limit);
        setResults(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to search members');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, limit]);

  return {
    results,
    loading,
    error,
  };
}

interface UseMemberProfileOptions {
  memberId: string;
  autoFetch?: boolean;
}

interface UseMemberProfileReturn {
  member: MemberPublic | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching a single member's profile
 */
export function useMemberProfile(options: UseMemberProfileOptions): UseMemberProfileReturn {
  const { memberId, autoFetch = true } = options;

  const [member, setMember] = useState<MemberPublic | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMember = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await memberService.getMemberProfile(memberId);
      setMember(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch member profile');
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    if (autoFetch && memberId) {
      fetchMember();
    }
  }, [autoFetch, memberId, fetchMember]);

  return {
    member,
    loading,
    error,
    refetch: fetchMember,
  };
}

interface UsePrivacySettingsReturn {
  updatePrivacySettings: (settings: {
    showPhone?: boolean;
    showEmail?: boolean;
    showAddress?: boolean;
  }) => Promise<void>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for updating privacy settings
 */
export function usePrivacySettings(): UsePrivacySettingsReturn {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updatePrivacySettings = useCallback(
    async (settings: { showPhone?: boolean; showEmail?: boolean; showAddress?: boolean }) => {
      try {
        setLoading(true);
        setError(null);

        await memberService.updatePrivacySettings(settings);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update privacy settings');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    updatePrivacySettings,
    loading,
    error,
  };
}
