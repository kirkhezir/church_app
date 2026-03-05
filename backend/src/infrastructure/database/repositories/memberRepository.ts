import { members as PrismaMember } from '@prisma/client';
import prisma from '../prismaClient';
import { IMemberRepository } from '../../../domain/interfaces/IMemberRepository';
import { Member } from '../../../domain/entities/Member';
import { Role } from '../../../domain/valueObjects/Role';

/**
 * Member Repository Implementation
 * Implements repository interface using Prisma ORM
 */
export class MemberRepository implements IMemberRepository {
  /**
   * Convert Prisma member to Domain Member entity
   */
  private toDomain(prismaMember: PrismaMember): Member {
    const privacySettings = prismaMember.privacySettings as {
      showPhone?: boolean;
      showEmail?: boolean;
      showAddress?: boolean;
    };

    return new Member(
      prismaMember.id,
      prismaMember.email,
      prismaMember.passwordHash,
      prismaMember.firstName,
      prismaMember.lastName,
      Role[prismaMember.role as keyof typeof Role],
      prismaMember.membershipDate,
      {
        showPhone: privacySettings.showPhone ?? true,
        showEmail: privacySettings.showEmail ?? true,
        showAddress: privacySettings.showAddress ?? true,
      },
      prismaMember.emailNotifications,
      prismaMember.phone || undefined,
      prismaMember.address || undefined,
      prismaMember.accountLocked,
      prismaMember.lockedUntil || undefined,
      prismaMember.failedLoginAttempts,
      prismaMember.lastLoginAt || undefined,
      prismaMember.mfaEnabled,
      prismaMember.mfaSecret || undefined,
      prismaMember.backupCodes ? (prismaMember.backupCodes as string[]) : undefined,
      prismaMember.passwordResetToken || undefined,
      prismaMember.passwordResetExpires || undefined,
      prismaMember.createdAt,
      prismaMember.updatedAt,
      prismaMember.deletedAt || undefined
    );
  }

  /**
   * Find member by ID
   */
  async findById(id: string): Promise<Member | null> {
    const member = await prisma.members.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    return member ? this.toDomain(member) : null;
  }

  /**
   * Find member by email
   */
  async findByEmail(email: string): Promise<Member | null> {
    const member = await prisma.members.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });

    return member ? this.toDomain(member) : null;
  }

  /**
   * Find all members with pagination
   */
  async findAll(options?: {
    skip?: number;
    take?: number;
    includeInactive?: boolean;
  }): Promise<Member[]> {
    const { skip = 0, take = 50, includeInactive = false } = options || {};

    const members = await prisma.members.findMany({
      where: {
        deletedAt: null,
        ...(includeInactive ? {} : { isActive: true }),
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      skip,
      take,
    });

    return members.map((member: PrismaMember) => this.toDomain(member));
  }

  /**
   * Find members by role
   */
  async findByRole(role: string): Promise<Member[]> {
    const members = await prisma.members.findMany({
      where: {
        role: role as never,
        deletedAt: null,
        accountLocked: false,
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });

    return members.map((member: PrismaMember) => this.toDomain(member));
  }

  /**
   * Search members by name
   */
  async searchByName(query: string): Promise<Member[]> {
    const members = await prisma.members.findMany({
      where: {
        deletedAt: null,
        accountLocked: false,
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          {
            AND: [
              { firstName: { contains: query.split(' ')[0], mode: 'insensitive' } },
              { lastName: { contains: query.split(' ')[1] || '', mode: 'insensitive' } },
            ],
          },
        ],
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      take: 50,
    });

    return members.map((member: PrismaMember) => this.toDomain(member));
  }

  /**
   * Create new member
   */
  async create(member: Member): Promise<Member> {
    const created = await prisma.members.create({
      data: {
        id: member.id,
        email: member.email,
        passwordHash: member.passwordHash,
        firstName: member.firstName,
        lastName: member.lastName,
        role: member.role as never,
        phone: member.phone,
        address: member.address,
        membershipDate: member.membershipDate,
        privacySettings: member.privacySettings as never,
        emailNotifications: member.emailNotifications,
        accountLocked: member.accountLocked,
        lockedUntil: member.lockedUntil,
        failedLoginAttempts: member.failedLoginAttempts,
        lastLoginAt: member.lastLoginAt,
        mfaEnabled: member.mfaEnabled,
        mfaSecret: member.mfaSecret,
        backupCodes: member.backupCodes as never,
        updatedAt: new Date(),
      },
    });

    return this.toDomain(created);
  }

  /**
   * Update member
   */
  async update(member: Member): Promise<Member> {
    const updated = await prisma.members.update({
      where: { id: member.id },
      data: {
        email: member.email,
        passwordHash: member.passwordHash,
        firstName: member.firstName,
        lastName: member.lastName,
        role: member.role as never,
        phone: member.phone,
        address: member.address,
        membershipDate: member.membershipDate,
        privacySettings: member.privacySettings as never,
        emailNotifications: member.emailNotifications,
        accountLocked: member.accountLocked,
        lockedUntil: member.lockedUntil,
        failedLoginAttempts: member.failedLoginAttempts,
        lastLoginAt: member.lastLoginAt,
        mfaEnabled: member.mfaEnabled,
        mfaSecret: member.mfaSecret,
        backupCodes: member.backupCodes as never,
        updatedAt: new Date(),
      },
    });

    return this.toDomain(updated);
  }

  /**
   * Soft delete member
   */
  async delete(id: string): Promise<void> {
    await prisma.members.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        accountLocked: true,
      },
    });
  }

  /**
   * Count total members
   */
  async count(): Promise<number> {
    return prisma.members.count({
      where: {
        deletedAt: null,
        accountLocked: false,
      },
    });
  }

  /**
   * Hard delete member (for testing only)
   */
  async hardDelete(id: string): Promise<void> {
    await prisma.members.delete({
      where: { id },
    });
  }

  /**
   * Find members with birthdays this week
   */
  async findBirthdaysThisWeek(): Promise<
    Array<{ id: string; firstName: string; lastName: string; dateOfBirth: Date }>
  > {
    const today = new Date();
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + 7);

    // Get all non-deleted members with dateOfBirth
    const members = await prisma.members.findMany({
      where: {
        deletedAt: null,
        dateOfBirth: { not: null },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
      },
    });

    const todayMonth = today.getMonth();
    const todayDate = today.getDate();
    const endMonth = endOfWeek.getMonth();
    const endDate = endOfWeek.getDate();

    return members.filter((m) => {
      if (!m.dateOfBirth) return false;
      const bMonth = m.dateOfBirth.getMonth();
      const bDate = m.dateOfBirth.getDate();

      if (todayMonth === endMonth) {
        // Same month — simple range
        return bMonth === todayMonth && bDate >= todayDate && bDate <= endDate;
      }
      // Spans month boundary
      return (
        (bMonth === todayMonth && bDate >= todayDate) || (bMonth === endMonth && bDate <= endDate)
      );
    }) as Array<{ id: string; firstName: string; lastName: string; dateOfBirth: Date }>;
  }

  /**
   * Count members created this month
   */
  async countNewThisMonth(): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    return prisma.members.count({
      where: {
        deletedAt: null,
        createdAt: { gte: startOfMonth },
      },
    });
  }
}

// Export singleton instance
export const memberRepository = new MemberRepository();
