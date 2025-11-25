import prisma from '../../infrastructure/database/prismaClient';

/**
 * UpdatePrivacySettings Use Case
 *
 * Allows members to update their privacy settings
 */

interface UpdatePrivacySettingsInput {
  memberId: string;
  showPhone?: boolean;
  showEmail?: boolean;
  showAddress?: boolean;
}

interface UpdatePrivacySettingsOutput {
  id: string;
  privacySettings: {
    showPhone: boolean;
    showEmail: boolean;
    showAddress: boolean;
  };
}

export class UpdatePrivacySettings {
  /**
   * Execute the update privacy settings use case
   */
  async execute(input: UpdatePrivacySettingsInput): Promise<UpdatePrivacySettingsOutput> {
    const { memberId, showPhone, showEmail, showAddress } = input;

    // Get current privacy settings
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      select: { privacySettings: true },
    });

    if (!member) {
      throw new Error('Member not found');
    }

    const currentSettings = member.privacySettings as {
      showPhone: boolean;
      showEmail: boolean;
      showAddress: boolean;
    };

    // Merge with new settings
    const newSettings = {
      showPhone: showPhone !== undefined ? showPhone : currentSettings.showPhone,
      showEmail: showEmail !== undefined ? showEmail : currentSettings.showEmail,
      showAddress: showAddress !== undefined ? showAddress : currentSettings.showAddress,
    };

    // Update member
    const updated = await prisma.member.update({
      where: { id: memberId },
      data: { privacySettings: newSettings },
      select: { id: true, privacySettings: true },
    });

    return {
      id: updated.id,
      privacySettings: updated.privacySettings as {
        showPhone: boolean;
        showEmail: boolean;
        showAddress: boolean;
      },
    };
  }
}
