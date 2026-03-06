/**
 * Get Notification Counts Use Case
 *
 * Lightweight use case that returns only the notification badges
 * counts needed by the frontend bell icon. Much cheaper than the
 * full dashboard use case — three simple DB COUNT queries.
 *
 * - unreadAnnouncements: active announcements the member has not viewed
 * - unreadMessages     : unread inbox messages
 * - pendingPrayer      : prayer requests awaiting moderation (admin/staff only)
 */

import { IAnnouncementRepository } from '../../domain/interfaces/IAnnouncementRepository';
import { IMessageRepository } from '../../domain/interfaces/IMessageRepository';
import { IPrayerRepository } from '../../domain/interfaces/IPrayerRepository';

export interface GetNotificationCountsRequest {
  memberId: string;
  role: string;
}

export interface GetNotificationCountsResponse {
  unreadAnnouncements: number;
  unreadMessages: number;
  pendingPrayer: number; // non-zero only for admin/staff
}

export class GetNotificationCounts {
  constructor(
    private announcementRepository: IAnnouncementRepository,
    private messageRepository: IMessageRepository,
    private prayerRepository: IPrayerRepository
  ) {}

  async execute(request: GetNotificationCountsRequest): Promise<GetNotificationCountsResponse> {
    const { memberId, role } = request;
    const isAdminOrStaff = role === 'ADMIN' || role === 'STAFF';

    const [unreadAnnouncements, unreadMessages, pendingPrayer] = await Promise.all([
      this.announcementRepository.countUnreadForMember(memberId),
      this.messageRepository.countUnread(memberId),
      isAdminOrStaff ? this.prayerRepository.countPending() : Promise.resolve(0),
    ]);

    return { unreadAnnouncements, unreadMessages, pendingPrayer };
  }
}
