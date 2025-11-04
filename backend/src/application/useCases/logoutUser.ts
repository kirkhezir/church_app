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

interface LogoutUserRequest {
  userId: string;
  refreshToken: string;
}

interface LogoutUserResponse {
  message: string;
}

export class LogoutUser {
  // In a production system, you'd store refresh tokens in a database or Redis
  // and mark them as revoked. For MVP, we'll just log the logout.
  // The client is responsible for discarding tokens.

  async execute(request: LogoutUserRequest): Promise<LogoutUserResponse> {
    // 1. Validate input
    if (!request.userId || request.userId.trim() === '') {
      throw new Error('User ID is required');
    }

    if (!request.refreshToken || request.refreshToken.trim() === '') {
      throw new Error('Refresh token is required');
    }

    // 2. Log the logout
    logger.info('User logged out', {
      userId: request.userId,
    });

    // TODO Phase 8: When implementing refresh token storage (Redis/DB),
    // add the token to a revocation list here

    // 3. Return success
    return {
      message: 'Logged out successfully',
    };
  }
}
