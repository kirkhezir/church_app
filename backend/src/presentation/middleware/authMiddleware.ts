import { Request, Response, NextFunction } from 'express';
import { jwtService, JWTPayload } from '../../infrastructure/auth/jwtService';
import { logger } from '../../infrastructure/logging/logger';

/**
 * Extend Express Request to include user data
 */
export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

/**
 * Authentication Middleware
 * Validates JWT token and attaches user data to request
 */
export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      // Verify token
      const decoded = jwtService.verifyAccessToken(token);

      // Attach user data to request
      req.user = decoded;

      logger.info('User authenticated', {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      });

      next();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Access token expired') {
          res.status(401).json({
            error: 'TokenExpired',
            message: 'Access token has expired. Please refresh your token.',
          });
          return;
        }
        if (error.message === 'Invalid access token') {
          res.status(401).json({
            error: 'InvalidToken',
            message: 'Invalid token provided',
          });
          return;
        }
      }

      res.status(401).json({
        error: 'Unauthorized',
        message: 'Token verification failed',
      });
    }
  } catch (error) {
    logger.error('Auth middleware error', error);
    res.status(500).json({
      error: 'InternalServerError',
      message: 'Authentication failed',
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user data if token is valid, but doesn't require authentication
 */
export const optionalAuthMiddleware = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      try {
        const decoded = jwtService.verifyAccessToken(token);
        req.user = decoded;
      } catch {
        // Token invalid or expired, but we don't fail the request
        // Just continue without user data
      }
    }

    next();
  } catch (_error) {
    // Silently fail and continue
    next();
  }
};
