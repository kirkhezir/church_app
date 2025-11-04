/**
 * Update Profile Use Case (T104)
 *
 * Allows members to update their profile information.
 * Business rules:
 * - Members can only update their own profile
 * - Email changes require verification (future enhancement)
 * - Phone must be in E.164 format if provided
 * - Privacy settings control what other members can see
 */

import { IMemberRepository } from '../../domain/interfaces/IMemberRepository';
import logger from '../../infrastructure/logging/logger';

/**
 * Update profile request
 */
export interface UpdateProfileRequest {
  memberId: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  privacySettings?: {
    showPhone?: boolean;
    showEmail?: boolean;
    showAddress?: boolean;
  };
}

/**
 * Update profile response
 */
export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  profile?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
    role: string;
    membershipDate: Date;
    privacySettings: {
      showPhone: boolean;
      showEmail: boolean;
      showAddress: boolean;
    };
  };
}

/**
 * Update Profile Use Case
 */
export class UpdateProfile {
  constructor(private memberRepository: IMemberRepository) {}

  async execute(request: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    const { memberId, firstName, lastName, phone, address, privacySettings } = request;

    try {
      // Find member
      const member = await this.memberRepository.findById(memberId);

      if (!member) {
        logger.warn('Profile update attempted for non-existent member', { memberId });
        return {
          success: false,
          message: 'Member not found',
        };
      }

      // Validate phone format if provided
      if (phone !== undefined && phone !== null && phone !== '') {
        if (!this.isValidPhone(phone)) {
          return {
            success: false,
            message: 'Invalid phone format. Please use E.164 format (e.g., +66812345678)',
          };
        }
      }

      // Update fields if provided
      if (firstName !== undefined) {
        if (firstName.trim().length < 2) {
          return {
            success: false,
            message: 'First name must be at least 2 characters',
          };
        }
        member.firstName = firstName.trim();
      }

      if (lastName !== undefined) {
        if (lastName.trim().length < 2) {
          return {
            success: false,
            message: 'Last name must be at least 2 characters',
          };
        }
        member.lastName = lastName.trim();
      }

      if (phone !== undefined) {
        member.phone = phone.trim() || undefined;
      }

      if (address !== undefined) {
        member.address = address.trim() || undefined;
      }

      if (privacySettings !== undefined) {
        // Merge privacy settings (keep existing values if not provided)
        member.privacySettings = {
          showPhone: privacySettings.showPhone ?? member.privacySettings.showPhone,
          showEmail: privacySettings.showEmail ?? member.privacySettings.showEmail,
          showAddress: privacySettings.showAddress ?? member.privacySettings.showAddress,
        };
      }

      // Update timestamp
      member.updatedAt = new Date();

      // Save changes
      const updatedMember = await this.memberRepository.update(member);

      logger.info('Profile updated successfully', {
        memberId: updatedMember.id,
        email: updatedMember.email,
      });

      return {
        success: true,
        message: 'Profile updated successfully',
        profile: {
          id: updatedMember.id,
          email: updatedMember.email,
          firstName: updatedMember.firstName,
          lastName: updatedMember.lastName,
          phone: updatedMember.phone,
          address: updatedMember.address,
          role: updatedMember.role,
          membershipDate: updatedMember.membershipDate,
          privacySettings: updatedMember.privacySettings,
        },
      };
    } catch (error) {
      logger.error('Error in UpdateProfile use case', { error, memberId });

      return {
        success: false,
        message: 'An error occurred while updating your profile. Please try again.',
      };
    }
  }

  /**
   * Validate phone number (E.164 format)
   */
  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  }
}
