/**
 * Prayer Service
 *
 * Handles all prayer request-related API calls:
 * - Public prayer request listing
 * - Prayer request submission
 * - Pray for a request (increment count)
 * - Moderation (admin/staff)
 */

import apiClient from '../api/apiClient';

// ============================================================================
// TYPES
// ============================================================================

export interface PrayerRequest {
  id: string;
  name: string;
  email?: string;
  request: string;
  requestThai?: string;
  category: string;
  categoryThai?: string;
  status: 'PENDING' | 'APPROVED' | 'ARCHIVED';
  prayerCount: number;
  isPublic: boolean;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SubmitPrayerRequestInput {
  name: string;
  email?: string;
  request: string;
  requestThai?: string;
  category?: string;
  categoryThai?: string;
  isAnonymous?: boolean;
}

interface PrayerListResponse {
  success: boolean;
  data: PrayerRequest[];
}

interface PrayerDetailResponse {
  success: boolean;
  data: PrayerRequest;
}

// ============================================================================
// PRAYER SERVICE
// ============================================================================

export const prayerService = {
  /**
   * Get public approved prayer requests
   */
  async getPrayerRequests(): Promise<PrayerRequest[]> {
    const response = (await apiClient.get('/prayer')) as PrayerListResponse;
    return response.data;
  },

  /**
   * Get all prayer requests including pending (admin/staff)
   */
  async getAllPrayerRequests(): Promise<PrayerRequest[]> {
    const response = (await apiClient.get('/prayer/all')) as PrayerListResponse;
    return response.data;
  },

  /**
   * Submit a new prayer request
   */
  async submitPrayerRequest(data: SubmitPrayerRequestInput): Promise<PrayerRequest> {
    const response = (await apiClient.post('/prayer', data)) as PrayerDetailResponse;
    return response.data;
  },

  /**
   * Pray for a request (increment prayer count)
   */
  async prayForRequest(id: string): Promise<PrayerRequest> {
    const response = (await apiClient.post(`/prayer/${id}/pray`)) as PrayerDetailResponse;
    return response.data;
  },

  /**
   * Unpray / toggle off a request (decrement prayer count)
   */
  async unprayForRequest(id: string): Promise<PrayerRequest> {
    const response = (await apiClient.delete(`/prayer/${id}/pray`)) as PrayerDetailResponse;
    return response.data;
  },

  /**
   * Moderate a prayer request - approve or archive (admin/staff)
   */
  async moderatePrayerRequest(id: string, status: 'APPROVED' | 'ARCHIVED'): Promise<PrayerRequest> {
    const response = (await apiClient.patch(`/prayer/${id}/moderate`, {
      status,
    })) as PrayerDetailResponse;
    return response.data;
  },
};

export default prayerService;
