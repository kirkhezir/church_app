/**
 * Request Password Reset Use Case (T087)
 *
 * Generates a password reset token and sends reset email.
 * Token expires in 1 hour for security.
 */

import crypto from 'crypto';
import { IMemberRepository } from '../../domain/interfaces/IMemberRepository';
import { EmailService } from '../../infrastructure/email/emailService';
import logger from '../../infrastructure/logging/logger';

/**
 * Password reset request
 */
export interface RequestPasswordResetRequest {
  email: string;
}

/**
 * Password reset response
 */
export interface RequestPasswordResetResponse {
  success: boolean;
  message: string;
}

/**
 * Request Password Reset Use Case
 *
 * Business Rules:
 * - Email must exist in system
 * - Generate secure random token (32 bytes)
 * - Token expires in 1 hour
 * - Send email with reset link
 * - Always return success to prevent email enumeration
 */
export class RequestPasswordReset {
  constructor(
    private memberRepository: IMemberRepository,
    private emailService: EmailService
  ) {}

  async execute(request: RequestPasswordResetRequest): Promise<RequestPasswordResetResponse> {
    const { email } = request;

    try {
      // Find member by email
      const member = await this.memberRepository.findByEmail(email);

      // If member exists, generate token and send email
      if (member) {
        // Generate secure random token (32 bytes = 64 hex characters)
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Hash token before storing (defense in depth)
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Set token expiration to 1 hour from now
        const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Update member with reset token
        member.passwordResetToken = hashedToken;
        member.passwordResetExpires = resetExpires;
        await this.memberRepository.update(member);

        // Send password reset email (use plain token, not hashed)
        const emailSent = await this.emailService.sendPasswordResetEmail(email, resetToken);

        if (!emailSent) {
          logger.error('Failed to send password reset email', { email });
          // Don't expose email sending failure to user
        }

        logger.info('Password reset requested', { email, tokenExpires: resetExpires });
      } else {
        logger.warn('Password reset requested for non-existent email', { email });
        // Don't reveal that email doesn't exist (security best practice)
      }

      // Always return success to prevent email enumeration attacks
      return {
        success: true,
        message: 'If an account exists with that email, a password reset link has been sent.',
      };
    } catch (error) {
      logger.error('Error in RequestPasswordReset use case', { error, email });

      // Return generic success message even on error (prevent enumeration)
      return {
        success: true,
        message: 'If an account exists with that email, a password reset link has been sent.',
      };
    }
  }
}
