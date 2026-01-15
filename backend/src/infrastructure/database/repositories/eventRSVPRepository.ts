import { event_rsvps as PrismaEventRSVP } from '@prisma/client';
import prisma from '../prismaClient';
import { IEventRSVPRepository } from '../../../domain/interfaces/IEventRSVPRepository';

/**
 * event_rsvps Repository Implementation
 * Implements repository interface using Prisma ORM
 */
export class EventRSVPRepository implements IEventRSVPRepository {
  /**
   * Find RSVP by ID
   */
  async findById(id: string): Promise<PrismaEventRSVP | null> {
    return (await prisma.event_rsvps.findUnique({
      where: { id },
      include: {
        events: true,
        members: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })) as never;
  }

  /**
   * Find RSVP by events and members
   */
  async findByEventAndMember(eventId: string, memberId: string): Promise<PrismaEventRSVP | null> {
    return (await prisma.event_rsvps.findUnique({
      where: {
        eventId_memberId: {
          eventId,
          memberId,
        },
      },
      include: {
        events: true,
        members: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })) as never;
  }

  /**
   * Find all RSVPs for an events
   */
  async findByEventId(eventId: string): Promise<PrismaEventRSVP[]> {
    return (await prisma.event_rsvps.findMany({
      where: { eventId },
      include: {
        members: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { rsvpedAt: 'asc' },
    })) as never[];
  }

  /**
   * Find all RSVPs for a members
   */
  async findByMemberId(memberId: string): Promise<PrismaEventRSVP[]> {
    return (await prisma.event_rsvps.findMany({
      where: { memberId },
      include: {
        events: {
          include: {
            members: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { rsvpedAt: 'desc' },
    })) as never[];
  }

  /**
   * Get count of confirmed RSVPs for an events
   */
  async getConfirmedCount(eventId: string): Promise<number> {
    return await prisma.event_rsvps.count({
      where: {
        eventId,
        status: 'CONFIRMED',
      },
    });
  }

  /**
   * Create new RSVP
   */
  async create(data: {
    id: string;
    eventId: string;
    memberId: string;
    status: 'CONFIRMED' | 'WAITLISTED' | 'CANCELLED';
  }): Promise<PrismaEventRSVP> {
    return (await prisma.event_rsvps.create({
      data: {
        id: data.id,
        eventId: data.eventId,
        memberId: data.memberId,
        status: data.status,
        updatedAt: new Date(),
      },
      include: {
        events: true,
        members: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })) as never;
  }

  /**
   * Update RSVP status
   */
  async updateStatus(
    id: string,
    status: 'CONFIRMED' | 'WAITLISTED' | 'CANCELLED'
  ): Promise<PrismaEventRSVP> {
    return (await prisma.event_rsvps.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
      },
      include: {
        events: true,
        members: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })) as never;
  }

  /**
   * Delete RSVP
   */
  async delete(id: string): Promise<void> {
    await prisma.event_rsvps.delete({
      where: { id },
    });
  }

  /**
   * Delete RSVP by events and members
   */
  async deleteByEventAndMember(eventId: string, memberId: string): Promise<void> {
    await prisma.event_rsvps.deleteMany({
      where: {
        eventId,
        memberId,
      },
    });
  }
}



