/**
 * Use Case: Authenticate User
 *
 * Handles member login with:
 * - Credential validation
 * - JWT token generation (access + refresh)
 * - Account lockout after 5 failed attempts (15-minute lock)
 * - Failed login attempt tracking
 * - Last login timestamp update
 */

import { IMemberRepository } from '../../domain/interfaces/IMemberRepository';
import { PasswordService } from '../../infrastructure/auth/passwordService';
import { JWTService } from '../../infrastructure/auth/jwtService';
import { logger } from '../../infrastructure/logging/logger';

interface AuthenticateUserRequest {
  email: string;
  password: string;
}

interface AuthenticateUserResponse {
  accessToken: string;
  refreshToken: string;
  member: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export class AuthenticateUser {
  constructor(
    private memberRepository: IMemberRepository,
    private passwordService: PasswordService,
    private jwtService: JWTService
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

    // 5. Successful login - generate tokens
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

    // 6. Update member: reset failed attempts, update last login
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

    // 7. Return tokens and member info (excluding sensitive data)
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(request.email)) {
      throw new Error('Invalid email format');
    }
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
