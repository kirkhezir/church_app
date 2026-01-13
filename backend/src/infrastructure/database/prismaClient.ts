import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Extended PrismaClient type with camelCase aliases
type ExtendedPrismaClient = PrismaClient & {
  member: PrismaClient['members'];
  event: PrismaClient['events'];
  announcement: PrismaClient['announcements'];
  message: PrismaClient['messages'];
  eventRSVP: PrismaClient['event_rsvps'];
  auditLog: PrismaClient['audit_logs'];
  pushSubscription: PrismaClient['push_subscriptions'];
  memberAnnouncementView: PrismaClient['member_announcement_views'];
};

/**
 * Prisma Client Singleton
 * Ensures only one instance of Prisma Client exists throughout the application lifecycle
 */
class PrismaClientSingleton {
  private static instance: ExtendedPrismaClient | null = null;

  /**
   * Get Prisma Client instance with camelCase aliases
   */
  static getInstance(): ExtendedPrismaClient {
    if (!this.instance) {
      const connectionString = process.env.DATABASE_URL;

      if (!connectionString) {
        throw new Error('DATABASE_URL environment variable is not set');
      }

      const adapter = new PrismaPg({ connectionString });
      const client = new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      }) as ExtendedPrismaClient;
      
      // Add camelCase aliases for snake_case model names
      client.member = client.members;
      client.event = client.events;
      client.announcement = client.announcements;
      client.message = client.messages;
      client.eventRSVP = client.event_rsvps;
      client.auditLog = client.audit_logs;
      client.pushSubscription = client.push_subscriptions;
      client.memberAnnouncementView = client.member_announcement_views;
      
      this.instance = client;
    }
    return this.instance;
  }

  /**
   * Disconnect Prisma Client
   */
  static async disconnect(): Promise<void> {
    if (this.instance) {
      await this.instance.$disconnect();
      this.instance = null;
    }
  }
}

export { PrismaClientSingleton };
export const prisma = PrismaClientSingleton.getInstance();
export default prisma;
