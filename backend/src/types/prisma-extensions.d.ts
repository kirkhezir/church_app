// Type aliases to map snake_case Prisma types to camelCase names used in code
import { Prisma, PrismaClient } from '@prisma/client';

// Type aliases for model types (used in imports like: import { Member } from '@prisma/client')
export type Member = Prisma.membersGetPayload<{}>;
export type Event = Prisma.eventsGetPayload<{}>;
export type Announcement = Prisma.announcementsGetPayload<{}>;
export type Message = Prisma.messagesGetPayload<{}>;
export type EventRSVP = Prisma.event_rsvpsGetPayload<{}>;
export type AuditLog = Prisma.audit_logsGetPayload<{}>;
export type PushSubscription = Prisma.push_subscriptionsGetPayload<{}>;
export type MemberAnnouncementView = Prisma.member_announcement_viewsGetPayload<{}>;

// Extended PrismaClient type with camelCase model accessors
export type ExtendedPrismaClient = PrismaClient & {
  member: PrismaClient['members'];
  event: PrismaClient['events'];
  announcement: PrismaClient['announcements'];
  message: PrismaClient['messages'];
  eventRSVP: PrismaClient['event_rsvps'];
  auditLog: PrismaClient['audit_logs'];
  pushSubscription: PrismaClient['push_subscriptions'];
  memberAnnouncementView: PrismaClient['member_announcement_views'];
};
