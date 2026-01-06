/**
 * Analytics Routes
 *
 * Handles analytics data endpoints for dashboard metrics
 */

import { Router, Response, NextFunction } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';
import { logger } from '../../infrastructure/logging/logger';
import prisma from '../../infrastructure/database/prismaClient';

const router = Router();

/**
 * GET /analytics/dashboard
 * Get dashboard overview metrics
 */
router.get(
  '/dashboard',
  authMiddleware,
  requireRole('ADMIN', 'STAFF'),
  async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      logger.info('Fetching dashboard analytics');

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get total members count (non-deleted)
      const totalMembers = await prisma.member.count({
        where: { deletedAt: null },
      });

      // Get new members this month
      const newMembersThisMonth = await prisma.member.count({
        where: {
          createdAt: { gte: startOfMonth },
          deletedAt: null,
        },
      });

      // Get upcoming events count
      const upcomingEvents = await prisma.event.count({
        where: {
          startDateTime: { gte: now },
          deletedAt: null,
          cancelledAt: null,
        },
      });

      // Get total RSVPs this month
      const totalRsvps = await prisma.eventRSVP.count({
        where: {
          rsvpedAt: { gte: startOfMonth },
          status: 'CONFIRMED',
        },
      });

      // Get active users (logged in last 30 days)
      const activeUsers = await prisma.member.count({
        where: {
          deletedAt: null,
          lastLoginAt: { gte: thirtyDaysAgo },
        },
      });

      // Get unread messages count
      const unreadMessages = await prisma.message.count({
        where: {
          isRead: false,
        },
      });

      return res.json({
        success: true,
        data: {
          totalMembers,
          newMembersThisMonth,
          upcomingEvents,
          totalRsvps,
          activeUsers,
          activeUsersPercentage:
            totalMembers > 0 ? Math.round((activeUsers / totalMembers) * 100) : 0,
          unreadMessages,
        },
      });
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * GET /analytics/member-growth
 * Get member growth data over time
 */
router.get(
  '/member-growth',
  authMiddleware,
  requireRole('ADMIN', 'STAFF'),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const months = parseInt(req.query.months as string) || 6;
      logger.info(`Fetching member growth data for ${months} months`);

      const data = [];
      const now = new Date();

      for (let i = months - 1; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

        const newMembers = await prisma.member.count({
          where: {
            createdAt: {
              gte: monthStart,
              lt: monthEnd,
            },
            deletedAt: null,
          },
        });

        const totalAtMonth = await prisma.member.count({
          where: {
            createdAt: { lt: monthEnd },
            deletedAt: null,
          },
        });

        // Calculate deleted members for churn
        const deletedThisMonth = await prisma.member.count({
          where: {
            deletedAt: {
              gte: monthStart,
              lt: monthEnd,
            },
          },
        });

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

      return res.json({
        success: true,
        data,
      });
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * GET /analytics/attendance
 * Get attendance data (based on event RSVPs)
 */
router.get(
  '/attendance',
  authMiddleware,
  requireRole('ADMIN', 'STAFF'),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const limit = parseInt(req.query.limit as string) || 8;
      logger.info(`Fetching attendance data for ${limit} events`);

      // Get recent worship events with RSVP counts
      const worshipEvents = await prisma.event.findMany({
        where: {
          category: 'WORSHIP',
          startDateTime: { lte: new Date() },
          deletedAt: null,
        },
        include: {
          _count: {
            select: { rsvps: true },
          },
        },
        orderBy: { startDateTime: 'desc' },
        take: limit,
      });

      const data = worshipEvents.reverse().map((event) => ({
        date: event.startDateTime.toISOString().split('T')[0],
        attendance: event._count.rsvps,
        capacity: event.maxCapacity || 200,
        eventTitle: event.title,
      }));

      // Calculate summary stats
      const attendances = data.map((d) => d.attendance);
      const avgAttendance =
        attendances.length > 0
          ? Math.round(attendances.reduce((a, b) => a + b, 0) / attendances.length)
          : 0;
      const maxAttendance = attendances.length > 0 ? Math.max(...attendances) : 0;
      const minAttendance = attendances.length > 0 ? Math.min(...attendances) : 0;

      // Calculate growth rate
      const firstHalf = attendances.slice(0, Math.floor(attendances.length / 2));
      const secondHalf = attendances.slice(Math.floor(attendances.length / 2));
      const firstAvg =
        firstHalf.length > 0 ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length : 0;
      const secondAvg =
        secondHalf.length > 0 ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length : 0;
      const growthRate = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;

      return res.json({
        success: true,
        data: {
          attendance: data,
          summary: {
            averageAttendance: avgAttendance,
            maxAttendance,
            minAttendance,
            totalServices: data.length,
            growthRate: Math.round(growthRate * 10) / 10,
          },
        },
      });
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * GET /analytics/demographics
 * Get member demographics data
 */
router.get(
  '/demographics',
  authMiddleware,
  requireRole('ADMIN', 'STAFF'),
  async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      logger.info('Fetching member demographics');

      // Get total active member count
      const totalMembers = await prisma.member.count({
        where: { deletedAt: null },
      });

      // Get member role distribution
      const adminCount = await prisma.member.count({ where: { role: 'ADMIN', deletedAt: null } });
      const staffCount = await prisma.member.count({ where: { role: 'STAFF', deletedAt: null } });
      const memberCount = await prisma.member.count({ where: { role: 'MEMBER', deletedAt: null } });

      const roleDistribution = [
        { type: 'Admin', count: adminCount, color: '#ef4444' },
        { type: 'Staff', count: staffCount, color: '#3b82f6' },
        { type: 'Member', count: memberCount, color: '#22c55e' },
      ];

      // MFA enabled stats
      const mfaEnabled = await prisma.member.count({
        where: { mfaEnabled: true, deletedAt: null },
      });
      const mfaDisabled = totalMembers - mfaEnabled;

      const securityStats = [
        { type: 'MFA Enabled', count: mfaEnabled, color: '#22c55e' },
        { type: 'MFA Disabled', count: mfaDisabled, color: '#94a3b8' },
      ];

      // Age demographics (if dateOfBirth available)
      const membersWithDob = await prisma.member.findMany({
        where: { deletedAt: null, dateOfBirth: { not: null } },
        select: { dateOfBirth: true },
      });

      const now = new Date();
      const ageGroups = {
        '0-17': 0,
        '18-30': 0,
        '31-45': 0,
        '46-60': 0,
        '61+': 0,
      };

      membersWithDob.forEach((member) => {
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

      return res.json({
        success: true,
        data: {
          roleDistribution,
          securityStats,
          ageDistribution,
          totalMembers,
          membersWithDobCount: membersWithDob.length,
        },
      });
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * GET /analytics/engagement
 * Get user engagement metrics
 */
router.get(
  '/engagement',
  authMiddleware,
  requireRole('ADMIN', 'STAFF'),
  async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      logger.info('Fetching engagement metrics');

      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Active users
      const activeUsersLast7Days = await prisma.member.count({
        where: {
          deletedAt: null,
          lastLoginAt: { gte: sevenDaysAgo },
        },
      });

      const activeUsersLast30Days = await prisma.member.count({
        where: {
          deletedAt: null,
          lastLoginAt: { gte: thirtyDaysAgo },
        },
      });

      const totalUsers = await prisma.member.count({
        where: { deletedAt: null },
      });

      // Event RSVPs this month
      const eventRsvps = await prisma.eventRSVP.count({
        where: {
          rsvpedAt: { gte: startOfMonth },
          status: 'CONFIRMED',
        },
      });

      // Messages sent this month
      const messagesSent = await prisma.message.count({
        where: {
          sentAt: { gte: startOfMonth },
        },
      });

      // Announcements viewed (count views)
      const announcementViews = await prisma.memberAnnouncementView.count({
        where: {
          viewedAt: { gte: startOfMonth },
        },
      });

      // Calculate activity heatmap data from audit logs
      const activityLogs = await prisma.auditLog.findMany({
        where: {
          timestamp: { gte: thirtyDaysAgo },
        },
        select: {
          timestamp: true,
        },
      });

      // Group by day and hour
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const heatmapData: { day: string; hour: number; count: number }[] = [];
      const activityMap = new Map<string, number>();

      activityLogs.forEach((log) => {
        const date = new Date(log.timestamp);
        const day = dayNames[date.getDay()];
        const hour = date.getHours();
        const key = `${day}-${hour}`;
        activityMap.set(key, (activityMap.get(key) || 0) + 1);
      });

      activityMap.forEach((count, key) => {
        const [day, hour] = key.split('-');
        heatmapData.push({ day, hour: parseInt(hour), count });
      });

      // Find peak usage hour and most active day
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

      let mostActiveDay = 'Sunday';
      let maxDayActivity = 0;
      dayActivity.forEach((count, day) => {
        if (count > maxDayActivity) {
          maxDayActivity = count;
          mostActiveDay =
            day === 'Sun'
              ? 'Sunday'
              : day === 'Mon'
                ? 'Monday'
                : day === 'Tue'
                  ? 'Tuesday'
                  : day === 'Wed'
                    ? 'Wednesday'
                    : day === 'Thu'
                      ? 'Thursday'
                      : day === 'Fri'
                        ? 'Friday'
                        : 'Saturday';
        }
      });

      return res.json({
        success: true,
        data: {
          activeUsersLast7Days,
          activeUsersLast30Days,
          totalUsers,
          eventRsvps,
          messagesSent,
          announcementsViewed: announcementViews,
          averageSessionDuration: 12, // Would need session tracking table
          peakUsageHour: peakHour,
          mostActiveDay,
          heatmapData,
        },
      });
    } catch (error) {
      return next(error);
    }
  }
);

export default router;
