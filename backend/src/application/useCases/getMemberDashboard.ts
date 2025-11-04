/**
 * Get Member Dashboard Use Case (T094)
 *
 * Aggregates dashboard data for authenticated member:
 * - Member profile summary
 * - Upcoming events (next 5)
 * - Recent announcements (last 5)
 * - Unread message count
 * - Quick stats
 */

import { IMemberRepository } from '../../domain/interfaces/IMemberRepository';
import { IEventRepository } from '../../domain/interfaces/IEventRepository';
import { IAnnouncementRepository } from '../../domain/interfaces/IAnnouncementRepository';
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
  };
}

/**
 * GetMemberDashboard Use Case
 */
export class GetMemberDashboard {
  constructor(
    private memberRepository: IMemberRepository,
    private eventRepository: IEventRepository,
    private announcementRepository: IAnnouncementRepository
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

    // 3. Map events to response format
    const upcomingEvents = allUpcomingEvents.map((event: any) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      category: event.category,
      startDate: event.startDateTime,
      endDate: event.endDateTime,
      location: event.location,
      rsvpStatus: undefined, // TODO: Add RSVP lookup in future iteration
    }));

    // 4. Get recent announcements (last 5)
    const allRecentAnnouncements = await this.announcementRepository.findRecent(5);

    // 5. Map announcements to response format
    const recentAnnouncements = allRecentAnnouncements.map((announcement: any) => ({
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      publishedAt: announcement.publishedAt,
      isRead: false, // TODO: Add view tracking in future iteration
    }));

    // 6. Calculate stats
    const unreadAnnouncements = recentAnnouncements.filter((a: any) => !a.isRead);

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
        myRsvpCount: 0, // TODO: Add RSVP count in future iteration
      },
    };

    logger.info('Dashboard data retrieved', {
      memberId,
      upcomingEvents: upcomingEvents.length,
      announcements: recentAnnouncements.length,
    });

    return response;
  }
}
