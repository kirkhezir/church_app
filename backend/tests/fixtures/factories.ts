import { Prisma, Role, EventCategory, RSVPStatus, Priority } from '@prisma/client';
import { randomUUID } from 'crypto';
import { testPrisma } from '../integration/setup';
import * as bcrypt from 'bcrypt';

/**
 * Member Factory
 * Create test members with default or custom data
 */
export class MemberFactory {
  private static counter = 0;

  /**
   * Create a member in the database
   */
  static async create(overrides?: Partial<Prisma.MemberCreateInput>): Promise<any> {
    const counter = ++MemberFactory.counter;

    const defaultData: Prisma.MemberCreateInput = {
      id: randomUUID(),
      email: `member${counter}@test.com`,
      passwordHash: await bcrypt.hash('Test123!', 10),
      firstName: `FirstName${counter}`,
      lastName: `LastName${counter}`,
      phone: `+1234567${String(counter).padStart(4, '0')}`,
      address: `${counter} Test Street`,
      role: Role.MEMBER,
      membershipDate: new Date(),
      updatedAt: new Date(),
      accountLocked: false,
      emailNotifications: true,
      privacySettings: {
        showEmail: true,
        showPhone: true,
        showAddress: false,
      },
    };

    const data = { ...defaultData, ...overrides };
    return await testPrisma.members.create({ data });
  }

  /**
   * Create multiple members
   */
  static async createMany(
    count: number,
    overrides?: Partial<Prisma.MemberCreateInput>
  ): Promise<any[]> {
    const members = [];
    for (let i = 0; i < count; i++) {
      members.push(await this.create(overrides));
    }
    return members;
  }

  /**
   * Create admin member
   */
  static async createAdmin(overrides?: Partial<Prisma.MemberCreateInput>): Promise<any> {
    return await this.create({
      ...overrides,
      role: Role.ADMIN,
      email: overrides?.email || `admin${++MemberFactory.counter}@test.com`,
    });
  }

  /**
   * Create staff member
   */
  static async createStaff(overrides?: Partial<Prisma.MemberCreateInput>): Promise<any> {
    return await this.create({
      ...overrides,
      role: Role.STAFF,
      email: overrides?.email || `staff${++MemberFactory.counter}@test.com`,
    });
  }

  /**
   * Build member data without saving to database
   */
  static build(overrides?: Partial<Prisma.MemberCreateInput>): Prisma.MemberCreateInput {
    const counter = ++MemberFactory.counter;

    const defaultData: Prisma.MemberCreateInput = {
      id: randomUUID(),
      email: `member${counter}@test.com`,
      passwordHash: '$2b$10$hashedpassword',
      firstName: `FirstName${counter}`,
      lastName: `LastName${counter}`,
      phone: `+1234567${String(counter).padStart(4, '0')}`,
      address: `${counter} Test Street`,
      role: Role.MEMBER,
      membershipDate: new Date(),
      updatedAt: new Date(),
      accountLocked: false,
      emailNotifications: true,
      privacySettings: {
        showEmail: true,
        showPhone: true,
        showAddress: false,
      },
    };

    return { ...defaultData, ...overrides };
  }

  /**
   * Reset counter (useful for test isolation)
   */
  static resetCounter(): void {
    MemberFactory.counter = 0;
  }
}

/**
 * Event Factory
 * Create test events with default or custom data
 */
export class EventFactory {
  private static counter = 0;

  /**
   * Create an event in the database
   */
  static async create(
    creatorId: string,
    overrides?: Partial<Prisma.EventCreateInput>
  ): Promise<any> {
    const counter = ++EventFactory.counter;

    const startDateTime = new Date();
    startDateTime.setDate(startDateTime.getDate() + counter); // Future dates

    const endDateTime = new Date(startDateTime);
    endDateTime.setHours(endDateTime.getHours() + 2);

    const defaultData: Prisma.EventCreateInput = {
      id: randomUUID(),
      title: `Test Event ${counter}`,
      description: `Description for test event ${counter}`,
      category: EventCategory.COMMUNITY,
      startDateTime,
      endDateTime,
      location: `Test Location ${counter}`,
      maxCapacity: 50,
      updatedAt: new Date(),
      creator: { connect: { id: creatorId } },
    };

    const data = { ...defaultData, ...overrides };
    return await testPrisma.events.create({
      data,
      include: {
        creator: true,
        rsvps: true,
      },
    });
  }

  /**
   * Create multiple events
   */
  static async createMany(
    creatorId: string,
    count: number,
    overrides?: Partial<Prisma.EventCreateInput>
  ): Promise<any[]> {
    const events = [];
    for (let i = 0; i < count; i++) {
      events.push(await this.create(creatorId, overrides));
    }
    return events;
  }

  /**
   * Create worship event
   */
  static async createWorship(
    creatorId: string,
    overrides?: Partial<Prisma.EventCreateInput>
  ): Promise<any> {
    return await this.create(creatorId, {
      ...overrides,
      category: EventCategory.WORSHIP,
      title: overrides?.title || `Worship Service ${++EventFactory.counter}`,
    });
  }

  /**
   * Create Bible study event
   */
  static async createBibleStudy(
    creatorId: string,
    overrides?: Partial<Prisma.EventCreateInput>
  ): Promise<any> {
    return await this.create(creatorId, {
      ...overrides,
      category: EventCategory.BIBLE_STUDY,
      title: overrides?.title || `Bible Study ${++EventFactory.counter}`,
    });
  }

  /**
   * Build event data without saving to database
   */
  static build(
    creatorId: string,
    overrides?: Partial<Prisma.EventCreateInput>
  ): Prisma.EventCreateInput {
    const counter = ++EventFactory.counter;

    const startDateTime = new Date();
    startDateTime.setDate(startDateTime.getDate() + counter);

    const endDateTime = new Date(startDateTime);
    endDateTime.setHours(endDateTime.getHours() + 2);

    const defaultData: Prisma.EventCreateInput = {
      id: randomUUID(),
      title: `Test Event ${counter}`,
      description: `Description for test event ${counter}`,
      category: EventCategory.COMMUNITY,
      startDateTime,
      endDateTime,
      location: `Test Location ${counter}`,
      maxCapacity: 50,
      updatedAt: new Date(),
      creator: { connect: { id: creatorId } },
    };

    return { ...defaultData, ...overrides };
  }

  /**
   * Reset counter
   */
  static resetCounter(): void {
    EventFactory.counter = 0;
  }
}

/**
 * Announcement Factory
 * Create test announcements with default or custom data
 */
export class AnnouncementFactory {
  private static counter = 0;

  /**
   * Create an announcement in the database
   */
  static async create(
    authorId: string,
    overrides?: Partial<Prisma.AnnouncementCreateInput>
  ): Promise<any> {
    const counter = ++AnnouncementFactory.counter;

    const defaultData: Prisma.AnnouncementCreateInput = {
      id: randomUUID(),
      title: `Test Announcement ${counter}`,
      content: `Content for test announcement ${counter}`,
      priority: Priority.NORMAL,
      publishedAt: new Date(),
      updatedAt: new Date(),
      author: { connect: { id: authorId } },
    };

    const data = { ...defaultData, ...overrides };
    return await testPrisma.announcements.create({
      data,
      include: {
        author: true,
        views: true,
      },
    });
  }

  /**
   * Create multiple announcements
   */
  static async createMany(
    authorId: string,
    count: number,
    overrides?: Partial<Prisma.AnnouncementCreateInput>
  ): Promise<any[]> {
    const announcements = [];
    for (let i = 0; i < count; i++) {
      announcements.push(await this.create(authorId, overrides));
    }
    return announcements;
  }

  /**
   * Create urgent announcement
   */
  static async createUrgent(
    authorId: string,
    overrides?: Partial<Prisma.AnnouncementCreateInput>
  ): Promise<any> {
    return await this.create(authorId, {
      ...overrides,
      priority: Priority.URGENT,
      title: overrides?.title || `Urgent: ${++AnnouncementFactory.counter}`,
    });
  }

  /**
   * Create archived announcement
   */
  static async createArchived(
    authorId: string,
    overrides?: Partial<Prisma.AnnouncementCreateInput>
  ): Promise<any> {
    return await this.create(authorId, {
      ...overrides,
      archivedAt: new Date(),
    });
  }

  /**
   * Build announcement data without saving to database
   */
  static build(
    authorId: string,
    overrides?: Partial<Prisma.AnnouncementCreateInput>
  ): Prisma.AnnouncementCreateInput {
    const counter = ++AnnouncementFactory.counter;

    const defaultData: Prisma.AnnouncementCreateInput = {
      id: randomUUID(),
      title: `Test Announcement ${counter}`,
      content: `Content for test announcement ${counter}`,
      priority: Priority.NORMAL,
      publishedAt: new Date(),
      updatedAt: new Date(),
      author: { connect: { id: authorId } },
    };

    return { ...defaultData, ...overrides };
  }

  /**
   * Reset counter
   */
  static resetCounter(): void {
    AnnouncementFactory.counter = 0;
  }
}

/**
 * EventRSVP Factory
 * Create test RSVPs
 */
export class EventRSVPFactory {
  /**
   * Create RSVP in the database
   */
  static async create(
    eventId: string,
    memberId: string,
    overrides?: Partial<Prisma.EventRSVPCreateInput>
  ): Promise<any> {
    const defaultData: Prisma.EventRSVPCreateInput = {
      id: randomUUID(),
      status: RSVPStatus.CONFIRMED,
      updatedAt: new Date(),
      event: { connect: { id: eventId } },
      member: { connect: { id: memberId } },
    };

    const data = { ...defaultData, ...overrides };
    return await testPrisma.event_rsvps.create({
      data,
      include: {
        event: true,
        member: true,
      },
    });
  }

  /**
   * Create confirmed RSVP
   */
  static async createConfirmed(eventId: string, memberId: string): Promise<any> {
    return await this.create(eventId, memberId, {
      status: RSVPStatus.CONFIRMED,
    });
  }

  /**
   * Create waitlisted RSVP
   */
  static async createWaitlisted(eventId: string, memberId: string): Promise<any> {
    return await this.create(eventId, memberId, {
      status: RSVPStatus.WAITLISTED,
    });
  }
}

/**
 * Reset all factory counters
 * Useful in beforeEach hooks
 */
export function resetAllFactories(): void {
  MemberFactory.resetCounter();
  EventFactory.resetCounter();
  AnnouncementFactory.resetCounter();
}
