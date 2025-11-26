/**
 * Admin Service
 *
 * Handles all admin-related API calls:
 * - Member management (create, list, delete)
 * - Audit logs
 * - Data export
 *
 * T312-T314, T318, T324: Create frontend admin service
 */

import apiClient from '../api/apiClient';

export interface CreateMemberRequest {
  email: string;
  firstName: string;
  lastName: string;
  role?: 'MEMBER' | 'STAFF' | 'ADMIN';
  phone?: string;
  address?: string;
}

export interface CreateMemberResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  membershipDate: string;
  temporaryPassword: string;
}

export interface Member {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  membershipDate: string;
  emailNotifications: boolean;
  accountLocked: boolean;
  mfaEnabled: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface MemberListResponse {
  data: Member[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: any;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface AuditLogResponse {
  data: AuditLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ListMembersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

export interface GetAuditLogsParams {
  action?: string;
  entityType?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ExportParams {
  format?: 'json' | 'csv';
  role?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  includeCancelled?: boolean;
}

export const adminService = {
  /**
   * Create a new member account
   */
  async createMember(data: CreateMemberRequest): Promise<CreateMemberResponse> {
    const response = await apiClient.post('/admin/members', data);
    return response as unknown as CreateMemberResponse;
  },

  /**
   * List all members with filtering and pagination
   */
  async listMembers(params?: ListMembersParams): Promise<MemberListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.search) queryParams.set('search', params.search);
    if (params?.role) queryParams.set('role', params.role);

    const url = `/admin/members${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get(url);
    return response as unknown as MemberListResponse;
  },

  /**
   * Delete (soft) a member
   */
  async deleteMember(memberId: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/admin/members/${memberId}`);
    return response as unknown as { message: string };
  },

  /**
   * Get audit logs with filtering
   */
  async getAuditLogs(params?: GetAuditLogsParams): Promise<AuditLogResponse> {
    const queryParams = new URLSearchParams();
    if (params?.action) queryParams.set('action', params.action);
    if (params?.entityType) queryParams.set('entityType', params.entityType);
    if (params?.userId) queryParams.set('userId', params.userId);
    if (params?.startDate) queryParams.set('startDate', params.startDate);
    if (params?.endDate) queryParams.set('endDate', params.endDate);
    if (params?.page) queryParams.set('page', params.page.toString());
    if (params?.limit) queryParams.set('limit', params.limit.toString());

    const url = `/admin/audit-logs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get(url);
    return response as unknown as AuditLogResponse;
  },

  /**
   * Export member data
   */
  async exportMembers(params?: ExportParams): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.format) queryParams.set('format', params.format);
    if (params?.role) queryParams.set('role', params.role);
    if (params?.startDate) queryParams.set('startDate', params.startDate);
    if (params?.endDate) queryParams.set('endDate', params.endDate);

    const url = `/admin/export/members${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    if (params?.format === 'csv') {
      // For CSV, we need to handle the blob response differently
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      return response.blob();
    }

    const response = await apiClient.get(url);
    return response;
  },

  /**
   * Export event data
   */
  async exportEvents(params?: ExportParams): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.format) queryParams.set('format', params.format);
    if (params?.category) queryParams.set('category', params.category);
    if (params?.startDate) queryParams.set('startDate', params.startDate);
    if (params?.endDate) queryParams.set('endDate', params.endDate);
    if (params?.includeCancelled) queryParams.set('includeCancelled', 'true');

    const url = `/admin/export/events${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    if (params?.format === 'csv') {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      return response.blob();
    }

    const response = await apiClient.get(url);
    return response;
  },

  /**
   * Download exported data as file
   */
  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
