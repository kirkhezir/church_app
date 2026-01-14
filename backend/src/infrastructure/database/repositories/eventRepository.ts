import { Event as PrismaEvent } from '@prisma/client';
import prisma from '../prismaClient';
import { IEventRepository } from '../../../domain/interfaces/IEventRepository';

/**
 * Transform Prisma event result to API format
 * Renames 'members' to 'creator' and '_count.event_rsvps' to '_count.rsvps'
 */
function transformEvent(event: any): any {
  if (!event) return null;
  const { members, event_rsvps, _count, ...rest } = event;
  return {
    ...rest,
    creator: members,
    rsvps: event_rsvps,
    _count: _count ? { rsvps: _count.event_rsvps ?? 0 } : undefined,
  };
}

/**
 * Event Repository Implementation
 * Implements repository interface using Prisma ORM
 */
export class EventRepository implements IEventRepository {
  /**
   * Find event by ID
   */
  async findById(id: string): Promise<PrismaEvent | null> {
    const event = await prisma.events.findUnique({
      where: { id, deletedAt: null },
      include: {
        members: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        event_rsvps: {
          where: { status: 'CONFIRMED' },
          include: {
            member: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return transformEvent(event);
  }

  /**
   * Find all events (excluding deleted)
   */
  async findAll(): Promise<PrismaEvent[]> {
    const events = await prisma.events.findMany({
      where: { deletedAt: null },
      include: {
        members: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            event_rsvps: {
              where: { status: 'CONFIRMED' },
            },
          },
        },
      },
      orderBy: { startDateTime: 'asc' },
    });

    return events.map(transformEvent) as never[];
  }

  /**
   * Find events by category
   */
  async findByCategory(category: string): Promise<PrismaEvent[]> {
    const events = await prisma.events.findMany({
      where: {
        category: category as never,
        deletedAt: null,
        cancelledAt: null,
      },
      include: {
        members: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            event_rsvps: {
              where: { status: 'CONFIRMED' },
            },
          },
        },
      },
      orderBy: { startDateTime: 'asc' },
    });

    return events.map(transformEvent) as never[];
  }

  /**
   * Find upcoming events
   */
  async findUpcoming(limit: number = 10): Promise<PrismaEvent[]> {
    const now = new Date();

    const events = await prisma.events.findMany({
      where: {
        startDateTime: { gte: now },
        deletedAt: null,
        cancelledAt: null,
      },
      include: {
        members: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            event_rsvps: {
              where: { status: 'CONFIRMED' },
            },
          },
        },
      },
      orderBy: { startDateTime: 'asc' },
      take: limit,
    });

    return events.map(transformEvent) as never[];
  }

  /**
   * Find events by creator
   */
  async findByCreator(creatorId: string): Promise<PrismaEvent[]> {
    const events = await prisma.events.findMany({
      where: {
        createdById: creatorId,
        deletedAt: null,
      },
      include: {
        _count: {
          select: {
            event_rsvps: {
              where: { status: 'CONFIRMED' },
            },
          },
        },
      },
      orderBy: { startDateTime: 'desc' },
    });

    return events.map(transformEvent) as never[];
  }

  /**
   * Create new event
   */
  async create(event: any): Promise<PrismaEvent> {
    const created = await prisma.events.create({
      data: {
        id: event.id,
        title: event.title,
        description: event.description,
        startDateTime: event.startDateTime,
        endDateTime: event.endDateTime,
        location: event.location,
        category: event.category as never,
        maxCapacity: event.maxCapacity,
        imageUrl: event.imageUrl,
        createdById: event.createdById,
      },
      include: {
        members: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return transformEvent(created) as never;
  }

  /**
   * Update existing event
   */
  async update(event: any): Promise<PrismaEvent> {
    const updated = await prisma.events.update({
      where: { id: event.id },
      data: {
        title: event.title,
        description: event.description,
        startDateTime: event.startDateTime,
        endDateTime: event.endDateTime,
        location: event.location,
        category: event.category as never,
        maxCapacity: event.maxCapacity,
        imageUrl: event.imageUrl,
        updatedAt: new Date(),
      },
      include: {
        members: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return transformEvent(updated) as never;
  }

  /**
   * Cancel event (soft cancel)
   */
  async cancel(id: string): Promise<void> {
    await prisma.events.update({
      where: { id },
      data: {
        cancelledAt: new Date(),
      },
    });
  }

  /**
   * Delete event (soft delete)
   */
  async delete(id: string): Promise<void> {
    await prisma.events.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Get RSVP count for event
   */
  async getRSVPCount(eventId: string): Promise<number> {
    return prisma.eventRSVP.count({
      where: {
        eventId,
        status: 'CONFIRMED',
      },
    });
  }

  /**
   * Check if member has RSVP'd to event
   */
  async hasMemberRSVPd(eventId: string, memberId: string): Promise<boolean> {
    const rsvp = await prisma.eventRSVP.findFirst({
      where: {
        eventId,
        memberId,
        status: 'CONFIRMED',
      },
    });

    return rsvp !== null;
  }

  /**
   * Add RSVP to event
   */
  async addRSVP(eventId: string, memberId: string): Promise<void> {
    await prisma.eventRSVP.upsert({
      where: {
        eventId_memberId: {
          eventId,
          memberId,
        },
      },
      update: {
        status: 'CONFIRMED',
        updatedAt: new Date(),
      },
      create: {
        eventId,
        memberId,
        status: 'CONFIRMED',
      },
    });
  }

  /**
   * Remove RSVP from event
   */
  async removeRSVP(eventId: string, memberId: string): Promise<void> {
    await prisma.eventRSVP.update({
      where: {
        eventId_memberId: {
          eventId,
          memberId,
        },
      },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date(),
      },
    });
  }
}

// Export singleton instance
export const eventRepository = new EventRepository();
