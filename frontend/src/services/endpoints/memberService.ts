/**
 * Member Directory Service
 *
 * Handles all member directory-related API calls:
 * - Member listing with pagination and search
 * - Member profile viewing
 * - Privacy settings management
 */

import apiClient from '../api/apiClient';

// ============================================================================
// REQUEST TYPES
// ============================================================================

interface ListMembersParams {
  search?: string;
  page?: number;
  limit?: number;
}

interface UpdatePrivacySettingsInput {
  showPhone?: boolean;
  showEmail?: boolean;
  showAddress?: boolean;
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface MemberPublic {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  membershipDate: string;
}

interface MemberListResponse {
  data: MemberPublic[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

interface MemberProfileResponse extends MemberPublic {}

interface PrivacySettingsResponse {
  id: string;
  privacySettings: {
    showPhone: boolean;
    showEmail: boolean;
    showAddress: boolean;
  };
}

interface SearchMembersResponse {
  data: MemberPublic[];
}

// ============================================================================
// API CALLS
// ============================================================================

/**
 * List members with pagination and search
 */
export async function listMembers(params: ListMembersParams = {}): Promise<MemberListResponse> {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append('search', params.search);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  const queryString = queryParams.toString();
  const url = queryString ? `/members?${queryString}` : '/members';

  return await apiClient.get<MemberListResponse>(url);
}

/**
 * Search members by name
 */
export async function searchMembers(query: string, limit?: number): Promise<SearchMembersResponse> {
  const queryParams = new URLSearchParams();
  queryParams.append('q', query);
  if (limit) queryParams.append('limit', limit.toString());

  return await apiClient.get<SearchMembersResponse>(`/members/search?${queryParams.toString()}`);
}

/**
 * Get member profile by ID
 */
export async function getMemberProfile(memberId: string): Promise<MemberProfileResponse> {
  return await apiClient.get<MemberProfileResponse>(`/members/${memberId}`);
}

/**
 * Update privacy settings
 */
export async function updatePrivacySettings(
  settings: UpdatePrivacySettingsInput
): Promise<PrivacySettingsResponse> {
  return await apiClient.patch<PrivacySettingsResponse>('/members/me/privacy', settings);
}

// ============================================================================
// EXPORTS
// ============================================================================

const memberService = {
  listMembers,
  searchMembers,
  getMemberProfile,
  updatePrivacySettings,
};

export default memberService;
