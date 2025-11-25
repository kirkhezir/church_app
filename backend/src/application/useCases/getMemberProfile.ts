import { PrivacySettings } from '../../domain/entities/Member';
import prisma from '../../infrastructure/database/prismaClient';

/**
 * GetMemberProfile Use Case
 *
 * Returns a member's profile with privacy controls applied.
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

interface GetMemberProfileInput {
  memberId: string;
  requesterId: string;
}

interface GetMemberProfileOutput {
  member: MemberPublicProfile;
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

export class GetMemberProfile {
  /**
   * Execute the get member profile use case
   */
  async execute(input: GetMemberProfileInput): Promise<GetMemberProfileOutput | null> {
    const { memberId, requesterId } = input;

    const member = await prisma.member.findFirst({
      where: {
        id: memberId,
        deletedAt: null,
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
    });

    if (!member) {
      return null;
    }

    return {
      member: applyPrivacyControls(
        {
          ...member,
          privacySettings: member.privacySettings as unknown as PrivacySettings,
        },
        requesterId
      ),
    };
  }
}
