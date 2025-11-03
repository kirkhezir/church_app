import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';
import { logger } from '../../infrastructure/logging/logger';

/**
 * Role-based Authorization Middleware Factory
 * Creates middleware that checks if user has required role(s)
 */
export const requireRole = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      // Check if user has required role
      if (!allowedRoles.includes(req.user.role)) {
        logger.warn('Unauthorized access attempt', {
          userId: req.user.userId,
          userRole: req.user.role,
          requiredRoles: allowedRoles,
          path: req.path,
        });

        res.status(403).json({
          error: 'Forbidden',
          message: 'You do not have permission to access this resource',
        });
        return;
      }

      // User has required role, proceed
      next();
    } catch (error) {
      logger.error('Role middleware error', error);
      res.status(500).json({
        error: 'InternalServerError',
        message: 'Authorization check failed',
      });
    }
  };
};

/**
 * Require admin role
 */
export const requireAdmin = requireRole('ADMIN');

/**
 * Require staff or admin role
 */
export const requireStaffOrAdmin = requireRole('ADMIN', 'STAFF');

/**
 * Require member role (any authenticated user)
 */
export const requireMember = requireRole('ADMIN', 'STAFF', 'MEMBER');

/**
 * Check if user owns the resource or is admin/staff
 * Used for endpoints where users can only access their own data unless they're admin/staff
 */
export const requireOwnerOrStaff = (
  getUserIdFromRequest: (req: AuthenticatedRequest) => string
) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      const targetUserId = getUserIdFromRequest(req);
      const isOwner = req.user.userId === targetUserId;
      const isStaffOrAdmin = req.user.role === 'ADMIN' || req.user.role === 'STAFF';

      if (!isOwner && !isStaffOrAdmin) {
        logger.warn('Unauthorized resource access attempt', {
          userId: req.user.userId,
          targetUserId,
          path: req.path,
        });

        res.status(403).json({
          error: 'Forbidden',
          message: 'You can only access your own resources',
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('Owner/staff check error', error);
      res.status(500).json({
        error: 'InternalServerError',
        message: 'Authorization check failed',
      });
    }
  };
};
