/**
 * Analytics Repository
 *
 * Concrete implementation of IAnalyticsRepository using Prisma.
 * Extracts all database queries that were previously inline in analyticsRoutes.ts.
 */

import prisma from '../prismaClient';
import { SessionRepository } from './sessionRepository';
import type {
  IAnalyticsRepository,
  DashboardOverview,
  MemberGrowthEntry,
  AttendanceData,
  AttendanceEntry,
  DemographicsData,
  EngagementData,
  HeatMapEntry,
} from '../../../domain/interfaces/IAnalyticsRepository';

export class AnalyticsRepository implements IAnalyticsRepository {
  private sessionRepository: SessionRepository;

  constructor() {
    this.sessionRepository = new SessionRepository();
  }

  async getDashboard(): Promise<DashboardOverview> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalMembers,
      newMembersThisMonth,
      upcomingEvents,
      totalRsvps,
      activeUsers,
      unreadMessages,
    ] = await Promise.all([
      prisma.members.count({ where: { deletedAt: null } }),
      prisma.members.count({
        where: { createdAt: { gte: startOfMonth }, deletedAt: null },
      }),
      prisma.events.count({
        where: { startDateTime: { gte: now }, deletedAt: null, cancelledAt: null },
      }),
      prisma.event_rsvps.count({
        where: { rsvpedAt: { gte: startOfMonth }, status: 'CONFIRMED' },
      }),
      prisma.members.count({
        where: { deletedAt: null, lastLoginAt: { gte: thirtyDaysAgo } },
      }),
      prisma.messages.count({ where: { isRead: false } }),
    ]);

    return {
      totalMembers,
      newMembersThisMonth,
      upcomingEvents,
      totalRsvps,
      activeUsers,
      activeUsersPercentage: totalMembers > 0 ? Math.round((activeUsers / totalMembers) * 100) : 0,
      unreadMessages,
    };
  }

  async getMemberGrowth(months: number): Promise<MemberGrowthEntry[]> {
    const now = new Date();
    const data: MemberGrowthEntry[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const [newMembers, totalAtMonth, deletedThisMonth] = await Promise.all([
        prisma.members.count({
          where: { createdAt: { gte: monthStart, lt: monthEnd }, deletedAt: null },
        }),
        prisma.members.count({
          where: { createdAt: { lt: monthEnd }, deletedAt: null },
        }),
        prisma.members.count({
          where: { deletedAt: { gte: monthStart, lt: monthEnd } },
        }),
      ]);

      const churnRate = totalAtMonth > 0 ? (deletedThisMonth / totalAtMonth) * 100 : 0;
      const monthName = monthStart.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });

      data.push({
        month: monthName,
        newMembers,
        totalMembers: totalAtMonth,
        churnedMembers: deletedThisMonth,
        churnRate: Math.round(churnRate * 10) / 10,
      });
    }

    return data;
  }

  async getAttendance(limit: number): Promise<AttendanceData> {
    const worshipEvents = await prisma.events.findMany({
      where: {
        category: 'WORSHIP',
        startDateTime: { lte: new Date() },
        deletedAt: null,
      },
      include: {
        _count: { select: { event_rsvps: true } },
      },
      orderBy: { startDateTime: 'desc' },
      take: limit,
    });

    const attendance: AttendanceEntry[] = worshipEvents
      .reverse()
      .map(
        (event: {
          startDateTime: Date;
          _count: { event_rsvps: number };
          maxCapacity: number | null;
          title: string;
        }) => ({
          date: event.startDateTime.toISOString().split('T')[0],
          attendance: event._count.event_rsvps,
          capacity: event.maxCapacity || 200,
          eventTitle: event.title,
        })
      );

    const attendances = attendance.map((d) => d.attendance);
    const avgAttendance =
      attendances.length > 0
        ? Math.round(attendances.reduce((a, b) => a + b, 0) / attendances.length)
        : 0;
    const maxAttendance = attendances.length > 0 ? Math.max(...attendances) : 0;
    const minAttendance = attendances.length > 0 ? Math.min(...attendances) : 0;

    const firstHalf = attendances.slice(0, Math.floor(attendances.length / 2));
    const secondHalf = attendances.slice(Math.floor(attendances.length / 2));
    const firstAvg =
      firstHalf.length > 0 ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length : 0;
    const secondAvg =
      secondHalf.length > 0 ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length : 0;
    const growthRate = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;

    return {
      attendance,
      summary: {
        averageAttendance: avgAttendance,
        maxAttendance,
        minAttendance,
        totalServices: attendance.length,
        growthRate: Math.round(growthRate * 10) / 10,
      },
    };
  }

  async getDemographics(): Promise<DemographicsData> {
    const [totalMembers, adminCount, staffCount, memberCount, mfaEnabled, membersWithDob] =
      await Promise.all([
        prisma.members.count({ where: { deletedAt: null } }),
        prisma.members.count({ where: { role: 'ADMIN', deletedAt: null } }),
        prisma.members.count({ where: { role: 'STAFF', deletedAt: null } }),
        prisma.members.count({ where: { role: 'MEMBER', deletedAt: null } }),
        prisma.members.count({ where: { mfaEnabled: true, deletedAt: null } }),
        prisma.members.findMany({
          where: { deletedAt: null, dateOfBirth: { not: null } },
          select: { dateOfBirth: true },
        }),
      ]);

    const roleDistribution = [
      { type: 'Admin', count: adminCount, color: '#ef4444' },
      { type: 'Staff', count: staffCount, color: '#3b82f6' },
      { type: 'Member', count: memberCount, color: '#22c55e' },
    ];

    const mfaDisabled = totalMembers - mfaEnabled;
    const securityStats = [
      { type: 'MFA Enabled', count: mfaEnabled, color: '#22c55e' },
      { type: 'MFA Disabled', count: mfaDisabled, color: '#94a3b8' },
    ];

    const now = new Date();
    const ageGroups = { '0-17': 0, '18-30': 0, '31-45': 0, '46-60': 0, '61+': 0 };

    membersWithDob.forEach((member: { dateOfBirth: Date | null }) => {
      if (member.dateOfBirth) {
        const age = Math.floor(
          (now.getTime() - member.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
        );
        if (age < 18) ageGroups['0-17']++;
        else if (age <= 30) ageGroups['18-30']++;
        else if (age <= 45) ageGroups['31-45']++;
        else if (age <= 60) ageGroups['46-60']++;
        else ageGroups['61+']++;
      }
    });

    const ageDistribution = [
      { label: 'Age 0-17', value: ageGroups['0-17'], color: '#3b82f6' },
      { label: 'Age 18-30', value: ageGroups['18-30'], color: '#22c55e' },
      { label: 'Age 31-45', value: ageGroups['31-45'], color: '#eab308' },
      { label: 'Age 46-60', value: ageGroups['46-60'], color: '#f97316' },
      { label: 'Age 61+', value: ageGroups['61+'], color: '#a855f7' },
    ];

    return {
      roleDistribution,
      securityStats,
      ageDistribution,
      totalMembers,
      membersWithDobCount: membersWithDob.length,
    };
  }

  async getEngagement(): Promise<EngagementData> {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      activeUsersLast7Days,
      activeUsersLast30Days,
      totalUsers,
      eventRsvps,
      messagesSent,
      announcementViews,
      activityLogs,
    ] = await Promise.all([
      prisma.members.count({
        where: { deletedAt: null, lastLoginAt: { gte: sevenDaysAgo } },
      }),
      prisma.members.count({
        where: { deletedAt: null, lastLoginAt: { gte: thirtyDaysAgo } },
      }),
      prisma.members.count({ where: { deletedAt: null } }),
      prisma.event_rsvps.count({
        where: { rsvpedAt: { gte: startOfMonth }, status: 'CONFIRMED' },
      }),
      prisma.messages.count({ where: { sentAt: { gte: startOfMonth } } }),
      prisma.member_announcement_views.count({
        where: { viewedAt: { gte: startOfMonth } },
      }),
      prisma.audit_logs.findMany({
        where: { timestamp: { gte: thirtyDaysAgo } },
        select: { timestamp: true },
      }),
    ]);

    // Build activity heatmap
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const activityMap = new Map<string, number>();

    activityLogs.forEach((log: { timestamp: Date }) => {
      const date = new Date(log.timestamp);
      const day = dayNames[date.getDay()];
      const hour = date.getHours();
      const key = `${day}-${hour}`;
      activityMap.set(key, (activityMap.get(key) || 0) + 1);
    });

    const heatmapData: HeatMapEntry[] = [];
    activityMap.forEach((count, key) => {
      const [day, hour] = key.split('-');
      heatmapData.push({ day, hour: parseInt(hour), count });
    });

    // Peak usage & most active day
    let peakHour = 10;
    let peakCount = 0;
    const dayActivity = new Map<string, number>();

    activityMap.forEach((count, key) => {
      const [day, hour] = key.split('-');
      dayActivity.set(day, (dayActivity.get(day) || 0) + count);
      if (count > peakCount) {
        peakCount = count;
        peakHour = parseInt(hour);
      }
    });

    const dayFullNames: Record<string, string> = {
      Sun: 'Sunday',
      Mon: 'Monday',
      Tue: 'Tuesday',
      Wed: 'Wednesday',
      Thu: 'Thursday',
      Fri: 'Friday',
      Sat: 'Saturday',
    };

    let mostActiveDay = 'Sunday';
    let maxDayActivity = 0;
    dayActivity.forEach((count, day) => {
      if (count > maxDayActivity) {
        maxDayActivity = count;
        mostActiveDay = dayFullNames[day] || 'Sunday';
      }
    });

    const avgSessionDuration = await this.sessionRepository.getAverageSessionDuration(30);

    return {
      activeUsersLast7Days,
      activeUsersLast30Days,
      totalUsers,
      eventRsvps,
      messagesSent,
      announcementsViewed: announcementViews,
      averageSessionDuration: avgSessionDuration,
      peakUsageHour: peakHour,
      mostActiveDay,
      heatmapData,
    };
  }
}
