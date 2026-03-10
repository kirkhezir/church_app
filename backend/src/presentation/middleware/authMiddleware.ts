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
 * Optional Auth Middleware
 * Extracts JWT user data if a valid Bearer token is present, but never rejects.
 * Use for routes that are public but can benefit from knowing who the caller is.
 */
export const optionalAuthMiddleware = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      req.user = jwtService.verifyAccessToken(authHeader.substring(7));
    } catch {
      // Invalid / expired token — treat request as anonymous
    }
  }
  next();
};
