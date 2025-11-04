/**
 * Update Notification Preferences Use Case (T105)
 *
 * Allows members to control their email notification settings.
 * Business rules:
 * - Members can enable/disable email notifications
 * - Changes take effect immediately
 * - Future: Could be extended for specific notification types
 */

import { IMemberRepository } from '../../domain/interfaces/IMemberRepository';
import logger from '../../infrastructure/logging/logger';

/**
 * Update notification preferences request
 */
export interface UpdateNotificationPreferencesRequest {
  memberId: string;
  emailNotifications: boolean;
}

/**
 * Update notification preferences response
 */
export interface UpdateNotificationPreferencesResponse {
  success: boolean;
  message: string;
  preferences?: {
    emailNotifications: boolean;
  };
}

/**
 * Update Notification Preferences Use Case
 */
export class UpdateNotificationPreferences {
  constructor(private memberRepository: IMemberRepository) {}

  async execute(
    request: UpdateNotificationPreferencesRequest
  ): Promise<UpdateNotificationPreferencesResponse> {
    const { memberId, emailNotifications } = request;

    try {
      // Find member
      const member = await this.memberRepository.findById(memberId);

      if (!member) {
        logger.warn('Notification preferences update attempted for non-existent member', {
          memberId,
        });
        return {
          success: false,
          message: 'Member not found',
        };
      }

      // Update notification preferences
      member.emailNotifications = emailNotifications;
      member.updatedAt = new Date();

      // Save changes
      await this.memberRepository.update(member);

      logger.info('Notification preferences updated', {
        memberId: member.id,
        email: member.email,
        emailNotifications,
      });

      return {
        success: true,
        message: 'Notification preferences updated successfully',
        preferences: {
          emailNotifications: member.emailNotifications,
        },
      };
    } catch (error) {
      logger.error('Error in UpdateNotificationPreferences use case', { error, memberId });

      return {
        success: false,
        message: 'An error occurred while updating notification preferences. Please try again.',
      };
    }
  }
}
