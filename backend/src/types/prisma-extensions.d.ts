// Type aliases to map snake_case Prisma types to camelCase names used in code
import { Prisma, PrismaClient } from '@prisma/client';

// Type aliases for model types (used in imports like: import { Member } from '@prisma/client')
// eslint-disable-next-line @typescript-eslint/ban-types
export type Member = Prisma.membersGetPayload<{}>;
// eslint-disable-next-line @typescript-eslint/ban-types
export type Event = Prisma.eventsGetPayload<{}>;
// eslint-disable-next-line @typescript-eslint/ban-types
export type Announcement = Prisma.announcementsGetPayload<{}>;
// eslint-disable-next-line @typescript-eslint/ban-types
export type Message = Prisma.messagesGetPayload<{}>;
// eslint-disable-next-line @typescript-eslint/ban-types
export type EventRSVP = Prisma.event_rsvpsGetPayload<{}>;
// eslint-disable-next-line @typescript-eslint/ban-types
export type AuditLog = Prisma.audit_logsGetPayload<{}>;
// eslint-disable-next-line @typescript-eslint/ban-types
export type PushSubscription = Prisma.push_subscriptionsGetPayload<{}>;
// eslint-disable-next-line @typescript-eslint/ban-types
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
