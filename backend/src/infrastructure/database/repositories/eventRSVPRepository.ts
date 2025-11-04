import { EventRSVP as PrismaEventRSVP } from '@prisma/client';
import prisma from '../prismaClient';
import { IEventRSVPRepository } from '../../../domain/interfaces/IEventRSVPRepository';

/**
 * EventRSVP Repository Implementation
 * Implements repository interface using Prisma ORM
 */
export class EventRSVPRepository implements IEventRSVPRepository {
  /**
   * Find RSVP by ID
   */
  async findById(id: string): Promise<PrismaEventRSVP | null> {
    return (await prisma.eventRSVP.findUnique({
      where: { id },
      include: {
        event: true,
        member: {
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
   * Find RSVP by event and member
   */
  async findByEventAndMember(eventId: string, memberId: string): Promise<PrismaEventRSVP | null> {
    return (await prisma.eventRSVP.findUnique({
      where: {
        eventId_memberId: {
          eventId,
          memberId,
        },
      },
      include: {
        event: true,
        member: {
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
   * Find all RSVPs for an event
   */
  async findByEventId(eventId: string): Promise<PrismaEventRSVP[]> {
    return (await prisma.eventRSVP.findMany({
      where: { eventId },
      include: {
        member: {
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
   * Find all RSVPs for a member
   */
  async findByMemberId(memberId: string): Promise<PrismaEventRSVP[]> {
    return (await prisma.eventRSVP.findMany({
      where: { memberId },
      include: {
        event: {
          include: {
            creator: {
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
   * Get count of confirmed RSVPs for an event
   */
  async getConfirmedCount(eventId: string): Promise<number> {
    return await prisma.eventRSVP.count({
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
    return (await prisma.eventRSVP.create({
      data: {
        id: data.id,
        eventId: data.eventId,
        memberId: data.memberId,
        status: data.status,
      },
      include: {
        event: true,
        member: {
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
    return (await prisma.eventRSVP.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
      },
      include: {
        event: true,
        member: {
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
    await prisma.eventRSVP.delete({
      where: { id },
    });
  }

  /**
   * Delete RSVP by event and member
   */
  async deleteByEventAndMember(eventId: string, memberId: string): Promise<void> {
    await prisma.eventRSVP.deleteMany({
      where: {
        eventId,
        memberId,
      },
    });
  }
}
