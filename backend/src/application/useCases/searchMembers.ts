import { PrivacySettings } from '../../domain/entities/Member';
import prisma from '../../infrastructure/database/prismaClient';

/**
 * SearchMembers Use Case
 *
 * Searches for members by name with privacy controls applied.
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

interface SearchMembersInput {
  requesterId: string;
  query: string;
  limit?: number;
}

interface SearchMembersOutput {
  data: MemberPublicProfile[];
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

export class SearchMembers {
  /**
   * Execute the search members use case
   */
  async execute(input: SearchMembersInput): Promise<SearchMembersOutput> {
    const { requesterId, query, limit = 20 } = input;

    if (!query || query.trim().length === 0) {
      return { data: [] };
    }

    const searchTerm = query.trim();

    // Search by first name, last name, or full name
    const members = await prisma.member.findMany({
      where: {
        deletedAt: null,
        accountLocked: false,
        OR: [
          { firstName: { contains: searchTerm, mode: 'insensitive' } },
          { lastName: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
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
      take: limit,
    });

    // Apply privacy controls
    const data = members.map((member: (typeof members)[0]) =>
      applyPrivacyControls(
        {
          ...member,
          privacySettings: member.privacySettings as unknown as PrivacySettings,
        },
        requesterId
      )
    );

    return { data };
  }
}
