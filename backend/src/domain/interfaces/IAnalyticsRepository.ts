/**
 * Repository interface for Analytics data access
 *
 * Defines contracts for querying analytics data from the database.
 * Concrete implementations live in infrastructure/database/repositories.
 */

export interface DashboardOverview {
  totalMembers: number;
  newMembersThisMonth: number;
  upcomingEvents: number;
  totalRsvps: number;
  activeUsers: number;
  activeUsersPercentage: number;
  unreadMessages: number;
}

export interface MemberGrowthEntry {
  month: string;
  newMembers: number;
  totalMembers: number;
  churnedMembers: number;
  churnRate: number;
}

export interface AttendanceEntry {
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

export interface AttendanceData {
  attendance: AttendanceEntry[];
  summary: AttendanceSummary;
}

export interface RoleDistribution {
  type: string;
  count: number;
  color: string;
}

export interface AgeDemographic {
  label: string;
  value: number;
  color: string;
}

export interface DemographicsData {
  roleDistribution: RoleDistribution[];
  securityStats: RoleDistribution[];
  ageDistribution: AgeDemographic[];
  totalMembers: number;
  membersWithDobCount: number;
}

export interface HeatMapEntry {
  day: string;
  hour: number;
  count: number;
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
  heatmapData: HeatMapEntry[];
}

export interface IAnalyticsRepository {
  getDashboard(): Promise<DashboardOverview>;
  getMemberGrowth(months: number): Promise<MemberGrowthEntry[]>;
  getAttendance(limit: number): Promise<AttendanceData>;
  getDemographics(): Promise<DemographicsData>;
  getEngagement(): Promise<EngagementData>;
}
