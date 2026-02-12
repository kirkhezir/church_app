/**
 * Use Case: Authenticate User
 *
 * Handles member login with:
 * - Credential validation
 * - JWT token generation (access + refresh)
 * - Account lockout after 5 failed attempts (15-minute lock)
 * - Failed login attempt tracking
 * - Last login timestamp update
 * - MFA verification when enabled
 */

import { IMemberRepository } from '../../domain/interfaces/IMemberRepository';
import { ISessionRepository } from '../../domain/interfaces/ISessionRepository';
import { PasswordService } from '../../infrastructure/auth/passwordService';
import { JWTService } from '../../infrastructure/auth/jwtService';
import { logger } from '../../infrastructure/logging/logger';

interface AuthenticateUserRequest {
  email: string;
  password: string;
  userAgent?: string;
  ipAddress?: string;
}

interface AuthenticateUserResponse {
  accessToken?: string;
  refreshToken?: string;
  member?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  // MFA fields when MFA is enabled
  mfaRequired?: boolean;
  mfaToken?: string;
}

export class AuthenticateUser {
  constructor(
    private memberRepository: IMemberRepository,
    private passwordService: PasswordService,
    private jwtService: JWTService,
    private sessionRepository?: ISessionRepository
  ) {}

  async execute(request: AuthenticateUserRequest): Promise<AuthenticateUserResponse> {
    // 1. Validate input
    this.validateInput(request);

    // 2. Find member by email
    const member = await this.memberRepository.findByEmail(request.email);

    if (!member) {
      logger.warn('Login attempt with non-existent email', { email: request.email });
      throw new Error('Invalid credentials');
    }

    // 3. Check if account is locked
    if (member.accountLocked && member.lockedUntil) {
      const now = new Date();

      if (now < member.lockedUntil) {
        const minutesRemaining = Math.ceil((member.lockedUntil.getTime() - now.getTime()) / 60000);
        logger.warn('Login attempt on locked account', {
          email: request.email,
          lockedUntil: member.lockedUntil,
        });
        throw new Error(`Account is locked. Please try again in ${minutesRemaining} minute(s).`);
      }

      // Lock period expired - unlock account
      member.accountLocked = false;
      member.failedLoginAttempts = 0;
      member.lockedUntil = undefined;
      await this.memberRepository.update(member);

      logger.info('Account unlocked after lock period expired', { memberId: member.id });
    }

    // 4. Verify password
    const isValidPassword = await this.passwordService.verify(
      request.password,
      member.passwordHash
    );

    if (!isValidPassword) {
      // Increment failed attempts
      await this.handleFailedLogin(member);

      logger.warn('Failed login attempt - invalid password', {
        email: request.email,
        failedAttempts: member.failedLoginAttempts + 1,
      });

      throw new Error('Invalid credentials');
    }

    // 5. Check if MFA is enabled
    if (member.mfaEnabled) {
      // Generate MFA token instead of access tokens
      const mfaToken = this.jwtService.generateMFAToken({
        userId: member.id,
        email: member.email,
        role: member.role,
      });

      logger.info('MFA required for login', {
        memberId: member.id,
        email: member.email,
      });

      return {
        mfaRequired: true,
        mfaToken,
      };
    }

    // 6. Successful login (no MFA) - generate tokens
    const accessToken = this.jwtService.generateAccessToken({
      userId: member.id,
      email: member.email,
      role: member.role,
    });

    const refreshToken = this.jwtService.generateRefreshToken({
      userId: member.id,
      email: member.email,
      role: member.role,
    });

    // 7. Update member: reset failed attempts, update last login
    member.failedLoginAttempts = 0;
    member.lastLoginAt = new Date();
    member.accountLocked = false;
    member.lockedUntil = undefined;
    await this.memberRepository.update(member);

    logger.info('Successful login', {
      memberId: member.id,
      email: member.email,
      role: member.role,
    });

    // 9. Create session record
    if (this.sessionRepository) {
      try {
        await this.sessionRepository.create({
          id: crypto.randomUUID(),
          memberId: member.id,
          userAgent: request.userAgent,
          ipAddress: request.ipAddress,
        });
      } catch (err) {
        // Session tracking is non-critical — log and continue
        logger.warn('Failed to create session record', {
          memberId: member.id,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    // 10. Return tokens and member info (excluding sensitive data)
    return {
      accessToken,
      refreshToken,
      member: {
        id: member.id,
        email: member.email,
        firstName: member.firstName,
        lastName: member.lastName,
        role: member.role,
      },
    };
  }

  /**
   * Validate input data
   */
  private validateInput(request: AuthenticateUserRequest): void {
    if (!request.email || request.email.trim() === '') {
      throw new Error('Email is required');
    }

    if (!request.password || request.password.trim() === '') {
      throw new Error('Password is required');
    }

    // Use safe linear-time email validation to avoid ReDoS
    if (!this.isValidEmail(request.email)) {
      throw new Error('Invalid email format');
    }
  }

  /**
   * Safe email validation using linear-time algorithm
   * Avoids ReDoS by checking format without nested quantifiers
   */
  private isValidEmail(email: string): boolean {
    // Length check to prevent long input attacks
    if (email.length > 254) return false;

    // Simple structural validation without backtracking
    const atIndex = email.indexOf('@');
    if (atIndex < 1 || atIndex === email.length - 1) return false;

    const localPart = email.substring(0, atIndex);
    const domainPart = email.substring(atIndex + 1);

    // Local part cannot be empty
    if (localPart.length === 0 || localPart.length > 64) return false;

    // Domain must have at least one dot and valid TLD
    const lastDotIndex = domainPart.lastIndexOf('.');
    if (lastDotIndex < 1 || lastDotIndex === domainPart.length - 1) return false;

    // No spaces allowed
    if (email.includes(' ')) return false;

    return true;
  }

  /**
   * Handle failed login attempt
   * Locks account after 5 failed attempts
   */
  private async handleFailedLogin(member: any): Promise<void> {
    member.failedLoginAttempts += 1;

    if (member.failedLoginAttempts >= 5) {
      // Lock account for 15 minutes
      member.accountLocked = true;
      member.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);

      logger.warn('Account locked due to failed login attempts', {
        memberId: member.id,
        attempts: member.failedLoginAttempts,
        lockedUntil: member.lockedUntil,
      });
    }

    await this.memberRepository.update(member);
  }
}
