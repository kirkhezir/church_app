/**
 * Reset Password Use Case (T088)
 *
 * Validates reset token and updates member password.
 * Token must be valid and not expired (1 hour limit).
 */

import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { IMemberRepository } from '../../domain/interfaces/IMemberRepository';
import logger from '../../infrastructure/logging/logger';

/**
 * Password reset request
 */
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

/**
 * Password reset response
 */
export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

/**
 * Reset Password Use Case
 *
 * Business Rules:
 * - Token must exist and match stored hashed token
 * - Token must not be expired (1 hour limit)
 * - Password must meet security requirements (8+ chars, mixed case, number, special)
 * - Clear reset token after successful reset
 * - Hash new password with bcrypt (10 rounds)
 */
export class ResetPassword {
  constructor(private memberRepository: IMemberRepository) {}

  async execute(request: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    const { token, newPassword } = request;

    try {
      // Validate password strength
      const passwordValidation = this.validatePassword(newPassword);
      if (!passwordValidation.valid) {
        return {
          success: false,
          message: passwordValidation.message!,
        };
      }

      // Hash the token to match stored format
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      // Find all members (we can't query by token directly without adding repository method)
      // TODO: Consider adding findByResetToken method for better performance
      const allMembers = await this.memberRepository.findAll();

      // Find member with matching token
      const member = allMembers.find(
        (m) =>
          m.passwordResetToken === hashedToken &&
          m.passwordResetExpires &&
          m.passwordResetExpires > new Date()
      );

      if (!member) {
        logger.warn('Invalid or expired password reset token');
        return {
          success: false,
          message: 'Password reset token is invalid or has expired.',
        };
      }

      // Hash new password
      const saltRounds = 10;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update member with new password and clear reset token
      member.passwordHash = newPasswordHash;
      member.passwordResetToken = undefined;
      member.passwordResetExpires = undefined;
      member.failedLoginAttempts = 0; // Reset failed attempts
      member.accountLocked = false; // Unlock account if locked
      member.lockedUntil = undefined;
      member.updatedAt = new Date();

      await this.memberRepository.update(member);

      logger.info('Password reset successful', { memberId: member.id, email: member.email });

      return {
        success: true,
        message: 'Password has been reset successfully. You can now log in with your new password.',
      };
    } catch (error) {
      logger.error('Error in ResetPassword use case', { error });

      return {
        success: false,
        message: 'An error occurred while resetting your password. Please try again.',
      };
    }
  }

  /**
   * Validate password strength
   */
  private validatePassword(password: string): { valid: boolean; message?: string } {
    if (!password || password.length < 8) {
      return {
        valid: false,
        message: 'Password must be at least 8 characters long.',
      };
    }

    if (!/[a-z]/.test(password)) {
      return {
        valid: false,
        message: 'Password must contain at least one lowercase letter.',
      };
    }

    if (!/[A-Z]/.test(password)) {
      return {
        valid: false,
        message: 'Password must contain at least one uppercase letter.',
      };
    }

    if (!/[0-9]/.test(password)) {
      return {
        valid: false,
        message: 'Password must contain at least one number.',
      };
    }

    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      return {
        valid: false,
        message: 'Password must contain at least one special character.',
      };
    }

    return { valid: true };
  }
}
