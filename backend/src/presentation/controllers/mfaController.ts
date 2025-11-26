/**
 * MFA Controller
 *
 * Handles MFA-related endpoints:
 * - POST /api/v1/auth/mfa/enroll - Initiate MFA enrollment
 * - POST /api/v1/auth/mfa/verify - Complete MFA enrollment
 * - POST /api/v1/auth/mfa/verify-login - Verify MFA during login
 * - POST /api/v1/auth/mfa/backup-codes - Regenerate backup codes
 * - DELETE /api/v1/auth/mfa - Disable MFA
 *
 * T292-T294: Create MFA controller
 */

import { Request, Response, NextFunction } from 'express';
import { MFAService } from '../../infrastructure/auth/mfaService';
import { MemberRepository } from '../../infrastructure/database/repositories/memberRepository';
import { PasswordService } from '../../infrastructure/auth/passwordService';
import { JWTService } from '../../infrastructure/auth/jwtService';
import { logger } from '../../infrastructure/logging/logger';

// Initialize dependencies
const mfaService = new MFAService();
const memberRepository = new MemberRepository();
const passwordService = new PasswordService();
const jwtService = new JWTService();

/**
 * POST /api/v1/auth/mfa/enroll
 * Initiate MFA enrollment - returns secret and QR code
 */
export async function enrollMFA(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as any).user;

    if (!user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Check if MFA is already enabled
    const member = await memberRepository.findById(user.userId);
    if (!member) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }

    if (member.mfaEnabled) {
      res.status(400).json({ error: 'MFA already enabled for this account' });
      return;
    }

    // Generate enrollment data
    const enrollment = await mfaService.createEnrollment(user.email);

    // Store secret temporarily (will be confirmed on verification)
    member.mfaSecret = enrollment.secret;
    await memberRepository.update(member);

    res.status(200).json({
      secret: enrollment.secret,
      qrCodeUrl: enrollment.qrCodeUrl,
    });
  } catch (error: any) {
    logger.error('MFA enrollment error', { error: error.message });
    next(error);
  }
}

/**
 * POST /api/v1/auth/mfa/verify
 * Complete MFA enrollment with TOTP verification
 */
export async function verifyMFAEnrollment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = (req as any).user;
    const { token, secret } = req.body;

    if (!user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!token || !secret) {
      res.status(400).json({ error: 'Token and secret are required' });
      return;
    }

    // Verify the token
    const isValid = await mfaService.verifyToken(token, secret);
    if (!isValid) {
      res.status(400).json({ error: 'Invalid verification code' });
      return;
    }

    // Get member
    const member = await memberRepository.findById(user.userId);
    if (!member) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }

    // Generate backup codes
    const { plainCodes, hashedCodes } = await mfaService.generateBackupCodesWithHashes();

    // Enable MFA and store backup codes (just store the hashes)
    member.mfaEnabled = true;
    member.mfaSecret = secret;
    member.backupCodes = hashedCodes;
    await memberRepository.update(member);

    logger.info('MFA enabled for user', { userId: user.userId });

    res.status(200).json({
      message: 'MFA enabled successfully',
      backupCodes: plainCodes,
    });
  } catch (error: any) {
    logger.error('MFA verification error', { error: error.message });
    next(error);
  }
}

/**
 * POST /api/v1/auth/mfa/verify-login
 * Verify MFA code during login process
 */
export async function verifyMFALogin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { mfaToken, code, backupCode } = req.body;

    if (!mfaToken) {
      res.status(400).json({ error: 'MFA token is required' });
      return;
    }

    if (!code && !backupCode) {
      res.status(400).json({ error: 'Either code or backup code is required' });
      return;
    }

    // Verify the MFA token
    let tokenPayload;
    try {
      tokenPayload = jwtService.verifyMFAToken(mfaToken);
    } catch (error) {
      res.status(401).json({ error: 'Invalid or expired MFA token' });
      return;
    }

    // Get member
    const member = await memberRepository.findById(tokenPayload.userId);
    if (!member) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }

    let isValid = false;

    if (code) {
      // Verify TOTP code
      if (member.mfaSecret) {
        isValid = await mfaService.verifyToken(code, member.mfaSecret);
      }
    } else if (backupCode) {
      // Verify backup code - backupCodes is now just string[] of hashed codes
      const backupCodes = member.backupCodes || [];

      const result = await mfaService.verifyBackupCode(backupCode, backupCodes);
      isValid = result.valid;

      if (isValid && result.index !== undefined) {
        // Remove used backup code from the list
        const updatedBackupCodes = backupCodes.filter((_, idx) => idx !== result.index);
        member.backupCodes = updatedBackupCodes;
        await memberRepository.update(member);
      }
    }

    if (!isValid) {
      logger.warn('Failed MFA verification attempt', { userId: member.id });
      res.status(401).json({ error: 'Invalid verification code' });
      return;
    }

    // Generate tokens
    const tokens = jwtService.generateTokenPair({
      userId: member.id,
      email: member.email,
      role: member.role,
    });

    // Update last login
    member.lastLoginAt = new Date();
    member.failedLoginAttempts = 0;
    await memberRepository.update(member);

    logger.info('Successful MFA login', { userId: member.id });

    res.status(200).json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      member: {
        id: member.id,
        email: member.email,
        firstName: member.firstName,
        lastName: member.lastName,
        role: member.role,
      },
    });
  } catch (error: any) {
    logger.error('MFA login verification error', { error: error.message });
    next(error);
  }
}

/**
 * POST /api/v1/auth/mfa/backup-codes
 * Regenerate backup codes
 */
export async function regenerateBackupCodes(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = (req as any).user;

    if (!user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Get member
    const member = await memberRepository.findById(user.userId);
    if (!member) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }

    // Check if MFA is enabled
    if (!member.mfaEnabled) {
      res.status(400).json({ error: 'MFA not enabled for this account' });
      return;
    }

    // Generate new backup codes
    const { plainCodes, hashedCodes } = await mfaService.generateBackupCodesWithHashes();

    // Update backup codes (just store the hashes)
    member.backupCodes = hashedCodes;
    await memberRepository.update(member);

    logger.info('Backup codes regenerated', { userId: user.userId });

    res.status(200).json({
      backupCodes: plainCodes,
      message: 'Backup codes regenerated successfully',
    });
  } catch (error: any) {
    logger.error('Backup code regeneration error', { error: error.message });
    next(error);
  }
}

/**
 * DELETE /api/v1/auth/mfa
 * Disable MFA (requires password verification)
 */
export async function disableMFA(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = (req as any).user;
    const { password } = req.body;

    if (!user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!password) {
      res.status(400).json({ error: 'Password is required to disable MFA' });
      return;
    }

    // Get member
    const member = await memberRepository.findById(user.userId);
    if (!member) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }

    // Verify password
    const isValidPassword = await passwordService.verify(password, member.passwordHash);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid password' });
      return;
    }

    // Disable MFA
    member.mfaEnabled = false;
    member.mfaSecret = undefined;
    member.backupCodes = undefined;
    await memberRepository.update(member);

    logger.info('MFA disabled for user', { userId: user.userId });

    res.status(200).json({
      message: 'MFA has been disabled successfully',
    });
  } catch (error: any) {
    logger.error('MFA disable error', { error: error.message });
    next(error);
  }
}
