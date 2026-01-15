/**
 * MFA Middleware
 *
 * Enforces MFA requirements for admin and staff roles:
 * - Checks if the user's role requires MFA
 * - Verifies MFA is enabled for required roles
 * - Returns 428 (Precondition Required) if MFA setup is needed
 *
 * T291: Create MFA middleware for admin/staff role enforcement
 */

import { Request, Response, NextFunction } from 'express';
import prisma from '../../infrastructure/database/prismaClient';
import { logger } from '../../infrastructure/logging/logger';

/**
 * Roles that require MFA to be enabled
 */
const MFA_REQUIRED_ROLES = ['ADMIN', 'STAFF'];

/**
 * Middleware to check if MFA is required and enabled
 * Use this on routes that require MFA for admin/staff
 */
export async function requireMFA(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as any).user;

    if (!user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Check if role requires MFA
    if (!MFA_REQUIRED_ROLES.includes(user.role)) {
      // MFA not required for this role
      return next();
    }

    // Get member from database to check MFA status
    const member = await prisma.members.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        mfaEnabled: true,
        role: true,
      },
    });

    if (!member) {
      res.status(401).json({ error: 'Member not found' });
      return;
    }

    // Check if MFA is enabled
    if (!member.mfaEnabled) {
      logger.warn('MFA required but not enabled', {
        userId: user.userId,
        role: user.role,
      });

      res.status(428).json({
        error: 'MFA setup required',
        message:
          'Multi-factor authentication must be enabled for your account to access this resource. Please set up MFA in your security settings.',
        code: 'MFA_REQUIRED',
      });
      return;
    }

    // MFA is enabled, proceed
    return next();
  } catch (error) {
    logger.error('Error in MFA middleware', { error });
    next(error);
  }
}

/**
 * Middleware to check admin role
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const user = (req as any).user;

  if (!user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Admin role required' });
    return;
  }

  next();
}

/**
 * Middleware to check admin or staff role
 */
export function requireAdminOrStaff(req: Request, res: Response, next: NextFunction): void {
  const user = (req as any).user;

  if (!user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (!['ADMIN', 'STAFF'].includes(user.role)) {
    res.status(403).json({ error: 'Admin or staff role required' });
    return;
  }

  next();
}

/**
 * Combined middleware: requires both admin role and MFA
 */
export async function requireAdminWithMFA(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const user = (req as any).user;

  if (!user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Admin role required' });
    return;
  }

  // Check MFA status
  await requireMFA(req, res, next);
}


