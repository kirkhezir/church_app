/**
 * Get Member Dashboard Use Case (T094)
 *
 * Aggregates dashboard data for authenticated member:
 * - Member profile summary
 * - Upcoming events (next 5)
 * - Recent announcements (last 5)
 * - Unread messages count + recent messages
 * - Recent sermons and blog posts
 * - Prayer requests
 * - Birthday celebrations
 * - Activity feed
 * - Admin stats (admin/staff only)
 */

import { IMemberRepository } from '../../domain/interfaces/IMemberRepository';
import { IEventRepository } from '../../domain/interfaces/IEventRepository';
import { IAnnouncementRepository } from '../../domain/interfaces/IAnnouncementRepository';
import { IEventRSVPRepository } from '../../domain/interfaces/IEventRSVPRepository';
import { IMessageRepository } from '../../domain/interfaces/IMessageRepository';
import { ISermonRepository } from '../../domain/interfaces/ISermonRepository';
import { IBlogRepository } from '../../domain/interfaces/IBlogRepository';
import { IPrayerRepository } from '../../domain/interfaces/IPrayerRepository';
import { auditLogService } from '../../application/services/auditLogService';
import logger from '../../infrastructure/logging/logger';

/**
 * Dashboard request
 */
export interface GetMemberDashboardRequest {
  memberId: string;
}

/**
 * Dashboard response with aggregated data
 */
export interface GetMemberDashboardResponse {
  profile: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    membershipDate: Date;
    phone?: string;
  };
  upcomingEvents: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    startDate: Date;
    endDate: Date;
    location: string;
    rsvpStatus?: string;
  }>;
  recentAnnouncements: Array<{
    id: string;
    title: string;
    content: string;
    priority: string;
    publishedAt: Date;
    isRead: boolean;
  }>;
  stats: {
    upcomingEventsCount: number;
    unreadAnnouncementsCount: number;
    myRsvpCount: number;
    unreadMessagesCount: number;
    prayerRequestsCount: number;
  };
  recentMessages: Array<{
    id: string;
    senderId: string;
    subject: string;
    sentAt: Date;
    isRead: boolean;
  }>;
  recentSermon: {
    id: string;
    title: string;
    speaker: string;
    date: Date;
    thumbnailUrl?: string;
    youtubeUrl?: string;
  } | null;
  recentBlogPost: {
    id: string;
    title: string;
    excerpt: string;
    slug: string;
    publishedAt: Date;
    thumbnailUrl?: string;
  } | null;
  recentPrayerRequests: Array<{
    id: string;
    name: string;
    category: string;
    request: string;
    isAnonymous: boolean;
    prayerCount: number;
    createdAt: Date;
  }>;
  birthdayMembers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
  }>;
  activityFeed: Array<{
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    timestamp: Date;
  }>;
  adminStats?: {
    totalMembers: number;
    newMembersThisMonth: number;
    pendingPrayerRequests: number;
  };
}

/**
 * GetMemberDashboard Use Case
 */
export class GetMemberDashboard {
  constructor(
    private memberRepository: IMemberRepository,
    private eventRepository: IEventRepository,
    private announcementRepository: IAnnouncementRepository,
    private eventRSVPRepository: IEventRSVPRepository,
    private messageRepository?: IMessageRepository,
    private sermonRepository?: ISermonRepository,
    private blogRepository?: IBlogRepository,
    private prayerRepository?: IPrayerRepository
  ) {}

  async execute(request: GetMemberDashboardRequest): Promise<GetMemberDashboardResponse> {
    const { memberId } = request;

    // 1. Validate member exists
    const member = await this.memberRepository.findById(memberId);
    if (!member) {
      logger.warn('Dashboard requested for non-existent member', { memberId });
      throw new Error('Member not found');
    }

    // 2. Get upcoming events (next 5)
    const allUpcomingEvents = await this.eventRepository.findUpcoming(5);

    // 3. Look up member's RSVPs for these events
    const memberRsvps = await this.eventRSVPRepository.findByMemberId(memberId);
    const rsvpByEventId = new Map(memberRsvps.map((rsvp: any) => [rsvp.eventId, rsvp.status]));

    // 4. Map events to response format with real RSVP status
    const upcomingEvents = allUpcomingEvents.map((event: any) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      category: event.category,
      startDate: event.startDateTime,
      endDate: event.endDateTime,
      location: event.location,
      rsvpStatus: rsvpByEventId.get(event.id) || undefined,
    }));

    // 5. Get recent announcements (last 5)
    const allRecentAnnouncements = await this.announcementRepository.findRecent(5);

    // 6. Check view status for each announcement
    const recentAnnouncements = await Promise.all(
      allRecentAnnouncements.map(async (announcement: any) => ({
        id: announcement.id,
        title: announcement.title,
        content: announcement.content,
        priority: announcement.priority,
        publishedAt: announcement.publishedAt,
        isRead: await this.announcementRepository.hasViewed(announcement.id, memberId),
      }))
    );

    // 7. Calculate base stats
    const unreadAnnouncements = recentAnnouncements.filter((a: any) => !a.isRead);
    const confirmedRsvpCount = memberRsvps.filter(
      (rsvp: any) => rsvp.status === 'CONFIRMED'
    ).length;

    // 8. Fetch messages data
    let recentMessages: GetMemberDashboardResponse['recentMessages'] = [];
    let unreadMessagesCount = 0;
    if (this.messageRepository) {
      const [messages, unreadCount] = await Promise.all([
        this.messageRepository.findInbox(memberId, { unreadOnly: true, take: 3 }),
        this.messageRepository.countUnread(memberId),
      ]);
      recentMessages = messages.map((m: any) => ({
        id: m.id,
        senderId: m.senderId,
        subject: m.subject,
        sentAt: m.sentAt,
        isRead: m.isRead,
      }));
      unreadMessagesCount = unreadCount;
    }

    // 9. Fetch latest sermon
    let recentSermon: GetMemberDashboardResponse['recentSermon'] = null;
    if (this.sermonRepository) {
      const sermons = await this.sermonRepository.findRecent(1);
      if (sermons.length > 0) {
        const s = sermons[0];
        recentSermon = {
          id: s.id,
          title: s.title,
          speaker: s.speaker,
          date: s.date,
          thumbnailUrl: s.thumbnailUrl || undefined,
          youtubeUrl: s.youtubeUrl || undefined,
        };
      }
    }

    // 10. Fetch latest blog post
    let recentBlogPost: GetMemberDashboardResponse['recentBlogPost'] = null;
    if (this.blogRepository) {
      const posts = await this.blogRepository.findRecent(1);
      if (posts.length > 0) {
        const p = posts[0];
        recentBlogPost = {
          id: p.id,
          title: p.title,
          excerpt: p.excerpt,
          slug: p.slug,
          publishedAt: p.publishedAt,
          thumbnailUrl: p.thumbnailUrl || undefined,
        };
      }
    }

    // 11. Fetch prayer requests
    let recentPrayerRequests: GetMemberDashboardResponse['recentPrayerRequests'] = [];
    let prayerRequestsCount = 0;
    if (this.prayerRepository) {
      const prayers = await this.prayerRepository.findRecentPublic(3);
      recentPrayerRequests = prayers.map((p: any) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        request: p.request,
        isAnonymous: p.isAnonymous,
        prayerCount: p.prayerCount,
        createdAt: p.createdAt,
      }));
      prayerRequestsCount = await this.prayerRepository.countPublicApproved();
    }

    // 12. Fetch birthday members
    let birthdayMembers: GetMemberDashboardResponse['birthdayMembers'] = [];
    if ('findBirthdaysThisWeek' in this.memberRepository) {
      birthdayMembers = await (this.memberRepository as any).findBirthdaysThisWeek();
    }

    // 13. Build activity feed from recent audit logs
    let activityFeed: GetMemberDashboardResponse['activityFeed'] = [];
    try {
      const recentLogs = await auditLogService.getRecentLogs({ limit: 10 });
      activityFeed = recentLogs.map((log: any) => ({
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        timestamp: log.timestamp,
      }));
    } catch (_err) {
      logger.warn('Failed to load activity feed', { error: (_err as Error).message });
    }

    // 14. Admin stats (admin/staff only)
    let adminStats: GetMemberDashboardResponse['adminStats'] = undefined;
    if (member.role === 'ADMIN' || member.role === 'STAFF') {
      const [totalMembers, newMembersThisMonth, pendingPrayers] = await Promise.all([
        this.memberRepository.count(),
        'countNewThisMonth' in this.memberRepository
          ? (this.memberRepository as any).countNewThisMonth()
          : Promise.resolve(0),
        this.prayerRepository
          ? this.prayerRepository.findAll({ status: 'PENDING' }).then((p: any[]) => p.length)
          : Promise.resolve(0),
      ]);
      adminStats = { totalMembers, newMembersThisMonth, pendingPrayerRequests: pendingPrayers };
    }

    const response: GetMemberDashboardResponse = {
      profile: {
        id: member.id,
        email: member.email,
        firstName: member.firstName,
        lastName: member.lastName,
        role: member.role,
        membershipDate: member.membershipDate,
        phone: member.phone,
      },
      upcomingEvents,
      recentAnnouncements,
      stats: {
        upcomingEventsCount: upcomingEvents.length,
        unreadAnnouncementsCount: unreadAnnouncements.length,
        myRsvpCount: confirmedRsvpCount,
        unreadMessagesCount,
        prayerRequestsCount,
      },
      recentMessages,
      recentSermon,
      recentBlogPost,
      recentPrayerRequests,
      birthdayMembers,
      activityFeed,
      adminStats,
    };

    logger.info('Dashboard data retrieved', {
      memberId,
      upcomingEvents: upcomingEvents.length,
      announcements: recentAnnouncements.length,
    });

    return response;
  }
}
