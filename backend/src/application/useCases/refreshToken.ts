/**
 * Use Case: Refresh Token
 *
 * Handles JWT refresh token exchange:
 * - Validates refresh token
 * - Generates new access token
 * - Maintains user session
 */

import { JWTService } from '../../infrastructure/auth/jwtService';
import { IMemberRepository } from '../../domain/interfaces/IMemberRepository';
import { logger } from '../../infrastructure/logging/logger';

interface RefreshTokenRequest {
  refreshToken: string;
}

interface RefreshTokenResponse {
  accessToken: string;
}

export class RefreshToken {
  constructor(
    private jwtService: JWTService,
    private memberRepository: IMemberRepository
  ) {}

  async execute(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    // 1. Validate input
    if (!request.refreshToken || request.refreshToken.trim() === '') {
      throw new Error('Refresh token is required');
    }

    try {
      // 2. Verify refresh token
      const payload = this.jwtService.verifyRefreshToken(request.refreshToken);

      // 3. Verify member still exists and is active
      const member = await this.memberRepository.findById(payload.userId);

      if (!member) {
        logger.warn('Refresh token used for non-existent member', {
          memberId: payload.userId,
        });
        throw new Error('Invalid refresh token');
      }

      if (member.accountLocked) {
        logger.warn('Refresh token used for locked account', {
          memberId: member.id,
          email: member.email,
        });
        throw new Error('Account is locked');
      }

      // 4. Generate new access token
      const accessToken = this.jwtService.generateAccessToken({
        userId: member.id,
        email: member.email,
        role: member.role,
      });

      logger.info('Access token refreshed', {
        memberId: member.id,
        email: member.email,
      });

      return { accessToken };
    } catch (error: any) {
      logger.warn('Invalid refresh token', { error: error.message });
      throw new Error('Invalid or expired refresh token');
    }
  }
}
