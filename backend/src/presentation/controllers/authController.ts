/**
 * Auth Controller
 *
 * Handles authentication endpoints:
 * - POST /api/v1/auth/login
 * - POST /api/v1/auth/refresh
 * - POST /api/v1/auth/logout
 */

import { Request, Response, NextFunction } from 'express';
import { AuthenticateUser } from '../../application/useCases/authenticateUser';
import { RefreshToken } from '../../application/useCases/refreshToken';
import { LogoutUser } from '../../application/useCases/logoutUser';
import { RequestPasswordReset } from '../../application/useCases/requestPasswordReset';
import { ResetPassword } from '../../application/useCases/resetPassword';
import { MemberRepository } from '../../infrastructure/database/repositories/memberRepository';
import { SessionRepository } from '../../infrastructure/database/repositories/sessionRepository';
import { PasswordService } from '../../infrastructure/auth/passwordService';
import { JWTService } from '../../infrastructure/auth/jwtService';
import { EmailService } from '../../infrastructure/email/emailService';
import { logger } from '../../infrastructure/logging/logger';

// Initialize dependencies
const memberRepository = new MemberRepository();
const sessionRepository = new SessionRepository();
const passwordService = new PasswordService();
const jwtService = new JWTService();
const emailService = new EmailService();

// Initialize use cases
const authenticateUser = new AuthenticateUser(
  memberRepository,
  passwordService,
  jwtService,
  sessionRepository
);
const refreshToken = new RefreshToken(jwtService, memberRepository);
const logoutUser = new LogoutUser(sessionRepository);
const requestPasswordReset = new RequestPasswordReset(memberRepository, emailService);
const resetPassword = new ResetPassword(memberRepository);

/**
 * POST /api/v1/auth/login
 * Authenticate member and return tokens
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({
        error: 'Email and password are required',
      });
      return;
    }

    // Execute authentication
    const result = await authenticateUser.execute({
      email,
      password,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip || req.socket.remoteAddress,
    });

    res.status(200).json(result);
  } catch (error: any) {
    logger.error('Login error', { error: error.message });

    // Handle specific errors
    if (error.message === 'Invalid credentials') {
      res.status(401).json({ error: error.message });
      return;
    }

    if (error.message.includes('locked')) {
      res.status(423).json({ error: error.message });
      return;
    }

    if (error.message.includes('required') || error.message.includes('Invalid email format')) {
      res.status(400).json({ error: error.message });
      return;
    }

    next(error);
  }
}

/**
 * POST /api/v1/auth/refresh
 * Exchange refresh token for new access token
 */
export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken: token } = req.body;

    // Validate required field
    if (!token) {
      res.status(400).json({
        error: 'Refresh token is required',
      });
      return;
    }

    // Execute refresh
    const result = await refreshToken.execute({ refreshToken: token });

    res.status(200).json(result);
  } catch (error: any) {
    logger.error('Token refresh error', { error: error.message });

    // Handle specific errors
    if (error.message.includes('Invalid') || error.message.includes('expired')) {
      res.status(401).json({ error: error.message });
      return;
    }

    if (error.message.includes('locked')) {
      res.status(423).json({ error: error.message });
      return;
    }

    next(error);
  }
}

/**
 * POST /api/v1/auth/logout
 * Logout user and invalidate refresh token
 */
export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken: token } = req.body;

    // Get user ID from authenticated request
    const userId = (req as any).user?.userId;

    // Validate authentication
    if (!userId) {
      res.status(401).json({
        error: 'Authentication required',
      });
      return;
    }

    // Validate required field
    if (!token) {
      res.status(400).json({
        error: 'Refresh token is required',
      });
      return;
    }

    // Execute logout
    const result = await logoutUser.execute({
      userId,
      refreshToken: token,
    });

    res.status(200).json(result);
  } catch (error: any) {
    logger.error('Logout error', { error: error.message });

    if (error.message.includes('required')) {
      res.status(400).json({ error: error.message });
      return;
    }

    next(error);
  }
}

/**
 * POST /api/v1/auth/password/reset-request
 * Request password reset email (T089)
 */
export async function requestPasswordResetHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email } = req.body;

    // Validate required fields
    if (!email) {
      res.status(400).json({
        error: 'Email is required',
      });
      return;
    }

    // Execute password reset request
    const result = await requestPasswordReset.execute({ email });

    res.status(200).json(result);
  } catch (error: any) {
    logger.error('Password reset request error', { error: error.message });
    next(error);
  }
}

/**
 * POST /api/v1/auth/password/reset
 * Reset password with token (T090)
 */
export async function resetPasswordHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { token, newPassword } = req.body;

    // Validate required fields
    if (!token || !newPassword) {
      res.status(400).json({
        error: 'Token and new password are required',
      });
      return;
    }

    // Execute password reset
    const result = await resetPassword.execute({ token, newPassword });

    if (!result.success) {
      res.status(400).json(result);
      return;
    }

    res.status(200).json(result);
  } catch (error: any) {
    logger.error('Password reset error', { error: error.message });
    next(error);
  }
}
