/**
 * Analytics Service
 *
 * Handles API calls for analytics data
 */

import { apiClient } from '../api/apiClient';

export interface DashboardOverview {
  totalMembers: number;
  newMembersThisMonth: number;
  upcomingEvents: number;
  totalRsvps: number;
  activeUsers: number;
  activeUsersPercentage: number;
  unreadMessages: number;
}

export interface MemberGrowthData {
  month: string;
  newMembers: number;
  totalMembers: number;
  churnedMembers: number;
  churnRate: number;
}

export interface AttendanceData {
  date: string;
  attendance: number;
  capacity: number;
  eventTitle: string;
}

export interface AttendanceSummary {
  averageAttendance: number;
  maxAttendance: number;
  minAttendance: number;
  totalServices: number;
  growthRate: number;
}

export interface AttendanceResponse {
  attendance: AttendanceData[];
  summary: AttendanceSummary;
}

export interface RoleDistribution {
  type: string;
  count: number;
  color: string;
}

export interface DemographicsData {
  roleDistribution: RoleDistribution[];
  securityStats: RoleDistribution[];
  totalMembers: number;
}

export interface EngagementData {
  activeUsersLast7Days: number;
  activeUsersLast30Days: number;
  totalUsers: number;
  eventRsvps: number;
  messagesSent: number;
  announcementsViewed: number;
  averageSessionDuration: number;
  peakUsageHour: number;
  mostActiveDay: string;
}

export const analyticsService = {
  /**
   * Get dashboard overview metrics
   */
  async getDashboard(): Promise<DashboardOverview> {
    const response = await apiClient.get<{ success: boolean; data: DashboardOverview }>(
      '/analytics/dashboard'
    );
    return response.data;
  },

  /**
   * Get member growth data
   */
  async getMemberGrowth(months: number = 6): Promise<MemberGrowthData[]> {
    const response = await apiClient.get<{ success: boolean; data: MemberGrowthData[] }>(
      `/analytics/member-growth?months=${months}`
    );
    return response.data;
  },

  /**
   * Get attendance data
   */
  async getAttendance(limit: number = 8): Promise<AttendanceResponse> {
    const response = await apiClient.get<{ success: boolean; data: AttendanceResponse }>(
      `/analytics/attendance?limit=${limit}`
    );
    return response.data;
  },

  /**
   * Get member demographics
   */
  async getDemographics(): Promise<DemographicsData> {
    const response = await apiClient.get<{ success: boolean; data: DemographicsData }>(
      '/analytics/demographics'
    );
    return response.data;
  },

  /**
   * Get engagement metrics
   */
  async getEngagement(): Promise<EngagementData> {
    const response = await apiClient.get<{ success: boolean; data: EngagementData }>(
      '/analytics/engagement'
    );
    return response.data;
  },
};
