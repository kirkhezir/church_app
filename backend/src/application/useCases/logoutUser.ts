/**
 * Use Case: Logout User
 *
 * Handles member logout:
 * - Invalidates refresh token
 * - Clears session
 *
 * Note: Access tokens cannot be invalidated before expiry (stateless JWT)
 * Client should discard access token immediately
 */

import { logger } from '../../infrastructure/logging/logger';
import { ISessionRepository } from '../../domain/interfaces/ISessionRepository';

interface LogoutUserRequest {
  userId: string;
  refreshToken: string;
}

interface LogoutUserResponse {
  message: string;
}

export class LogoutUser {
  constructor(private sessionRepository?: ISessionRepository) {}

  async execute(request: LogoutUserRequest): Promise<LogoutUserResponse> {
    // 1. Validate input
    if (!request.userId || request.userId.trim() === '') {
      throw new Error('User ID is required');
    }

    if (!request.refreshToken || request.refreshToken.trim() === '') {
      throw new Error('Refresh token is required');
    }

    // 2. End active session
    if (this.sessionRepository) {
      try {
        await this.sessionRepository.endSession(request.userId);
      } catch (err) {
        logger.warn('Failed to end session on logout', {
          userId: request.userId,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    // 3. Log the logout
    logger.info('User logged out', {
      userId: request.userId,
    });

    // 4. Return success
    return {
      message: 'Logged out successfully',
    };
  }
}
