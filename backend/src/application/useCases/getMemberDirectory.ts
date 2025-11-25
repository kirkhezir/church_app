import { PrivacySettings } from '../../domain/entities/Member';

/**
 * GetMemberDirectory Use Case
 *
 * Returns a list of church members with privacy controls applied.
 * Members see only the information that other members have opted to share.
 */

interface MemberPublicProfile {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  membershipDate: Date;
}

interface GetMemberDirectoryInput {
  requesterId: string; // The member viewing the directory
  search?: string;
  page?: number;
  limit?: number;
}

interface GetMemberDirectoryOutput {
  data: MemberPublicProfile[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

/**
 * Apply privacy controls to member data
 */
function applyPrivacyControls(
  member: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    address: string | null;
    membershipDate: Date;
    privacySettings: PrivacySettings;
  },
  requesterId: string
): MemberPublicProfile {
  // Members can see their own full profile
  const isOwnProfile = member.id === requesterId;

  return {
    id: member.id,
    firstName: member.firstName,
    lastName: member.lastName,
    phone: isOwnProfile || member.privacySettings.showPhone ? member.phone : null,
    email: isOwnProfile || member.privacySettings.showEmail ? member.email : null,
    address: isOwnProfile || member.privacySettings.showAddress ? member.address : null,
    membershipDate: member.membershipDate,
  };
}

import prisma from '../../infrastructure/database/prismaClient';

export class GetMemberDirectory {
  /**
   * Execute the get member directory use case
   */
  async execute(input: GetMemberDirectoryInput): Promise<GetMemberDirectoryOutput> {
    const { requesterId, search, page = 1, limit = 20 } = input;
    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
      deletedAt: null,
      accountLocked: false,
    };

    if (search) {
      whereClause.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const totalItems = await prisma.member.count({ where: whereClause });

    // Get members
    const members = await prisma.member.findMany({
      where: whereClause,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        address: true,
        membershipDate: true,
        privacySettings: true,
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      skip,
      take: limit,
    });

    // Apply privacy controls
    const data = members.map((member) =>
      applyPrivacyControls(
        {
          ...member,
          privacySettings: member.privacySettings as unknown as PrivacySettings,
        },
        requesterId
      )
    );

    return {
      data,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
      },
    };
  }
}
