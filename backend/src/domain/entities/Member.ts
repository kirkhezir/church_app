import { Role } from '../valueObjects/Role';

/**
 * Privacy settings for member profile visibility
 */
export interface PrivacySettings {
  showPhone: boolean;
  showEmail: boolean;
  showAddress: boolean;
}

/**
 * Member domain entity
 * Represents a church member with authentication and profile data
 */
export class Member {
  constructor(
    public readonly id: string,
    public email: string,
    public passwordHash: string,
    public firstName: string,
    public lastName: string,
    public role: Role,
    public membershipDate: Date,
    public privacySettings: PrivacySettings,
    public emailNotifications: boolean,
    public phone?: string,
    public address?: string,
    public accountLocked: boolean = false,
    public lockedUntil?: Date,
    public failedLoginAttempts: number = 0,
    public lastLoginAt?: Date,
    public mfaEnabled: boolean = false,
    public mfaSecret?: string,
    public backupCodes?: string[],
    public passwordResetToken?: string,
    public passwordResetExpires?: Date,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public deletedAt?: Date
  ) {
    this.validate();
  }

  /**
   * Validate member data
   */
  private validate(): void {
    if (!this.email || !this.isValidEmail(this.email)) {
      throw new Error('Invalid email format');
    }
    if (!this.firstName || this.firstName.trim().length < 2) {
      throw new Error('First name must be at least 2 characters');
    }
    if (!this.lastName || this.lastName.trim().length < 2) {
      throw new Error('Last name must be at least 2 characters');
    }
    if (this.phone && !this.isValidPhone(this.phone)) {
      throw new Error('Invalid phone format (E.164 required)');
    }
  }

  /**
   * Validate email format using linear-time algorithm (ReDoS-safe)
   */
  private isValidEmail(email: string): boolean {
    // Length check to prevent long input attacks
    if (!email || email.length > 254) return false;

    // Simple structural validation without backtracking
    const atIndex = email.indexOf('@');
    if (atIndex < 1 || atIndex === email.length - 1) return false;

    const localPart = email.substring(0, atIndex);
    const domainPart = email.substring(atIndex + 1);

    // Local part validation
    if (localPart.length === 0 || localPart.length > 64) return false;

    // Domain must have at least one dot and valid TLD
    const lastDotIndex = domainPart.lastIndexOf('.');
    if (lastDotIndex < 1 || lastDotIndex === domainPart.length - 1) return false;

    // No spaces allowed anywhere
    if (email.includes(' ')) return false;

    return true;
  }

  /**
   * Validate phone number (E.164 format)
   */
  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Get full name
   */
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  /**
   * Check if account is currently locked
   */
  isAccountLocked(): boolean {
    if (!this.accountLocked) {
      return false;
    }

    // Check if lock has expired (15 minutes)
    if (this.lockedUntil && new Date() > this.lockedUntil) {
      return false;
    }

    return true;
  }

  /**
   * Record failed login attempt
   * Returns true if account should be locked
   */
  recordFailedLogin(): boolean {
    this.failedLoginAttempts += 1;
    this.updatedAt = new Date();

    // Lock account after 5 failed attempts
    if (this.failedLoginAttempts >= 5) {
      this.lockAccount();
      return true;
    }

    return false;
  }

  /**
   * Lock account for 15 minutes
   */
  lockAccount(): void {
    this.accountLocked = true;
    this.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    this.updatedAt = new Date();
  }

  /**
   * Unlock account and reset failed login attempts
   */
  unlockAccount(): void {
    this.accountLocked = false;
    this.lockedUntil = undefined;
    this.failedLoginAttempts = 0;
    this.updatedAt = new Date();
  }

  /**
   * Record successful login
   */
  recordSuccessfulLogin(): void {
    this.lastLoginAt = new Date();
    this.failedLoginAttempts = 0;
    this.accountLocked = false;
    this.lockedUntil = undefined;
    this.updatedAt = new Date();
  }

  /**
   * Check if member has admin privileges
   */
  isAdmin(): boolean {
    return this.role === Role.ADMIN;
  }

  /**
   * Check if member has staff privileges (includes admin)
   */
  isStaffOrAdmin(): boolean {
    return this.role === Role.ADMIN || this.role === Role.STAFF;
  }

  /**
   * Check if member is a regular member (not staff or admin)
   */
  isRegularMember(): boolean {
    return this.role === Role.MEMBER;
  }

  /**
   * Update profile information
   */
  updateProfile(data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
  }): void {
    if (data.firstName) {
      if (data.firstName.trim().length < 2) {
        throw new Error('First name must be at least 2 characters');
      }
      this.firstName = data.firstName;
    }

    if (data.lastName) {
      if (data.lastName.trim().length < 2) {
        throw new Error('Last name must be at least 2 characters');
      }
      this.lastName = data.lastName;
    }

    if (data.phone !== undefined) {
      if (data.phone && !this.isValidPhone(data.phone)) {
        throw new Error('Invalid phone format (E.164 required)');
      }
      this.phone = data.phone || undefined;
    }

    if (data.address !== undefined) {
      this.address = data.address || undefined;
    }

    this.updatedAt = new Date();
  }

  /**
   * Update privacy settings
   */
  updatePrivacySettings(settings: Partial<PrivacySettings>): void {
    this.privacySettings = {
      ...this.privacySettings,
      ...settings,
    };
    this.updatedAt = new Date();
  }

  /**
   * Update notification preferences
   */
  updateEmailNotifications(enabled: boolean): void {
    this.emailNotifications = enabled;
    this.updatedAt = new Date();
  }

  /**
   * Soft delete member
   */
  softDelete(): void {
    this.deletedAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Check if member is deleted
   */
  isDeleted(): boolean {
    return this.deletedAt !== undefined;
  }

  /**
   * Enable MFA with secret
   */
  enableMFA(secret: string, backupCodes: string[]): void {
    this.mfaEnabled = true;
    this.mfaSecret = secret;
    this.backupCodes = backupCodes;
    this.updatedAt = new Date();
  }

  /**
   * Disable MFA
   */
  disableMFA(): void {
    this.mfaEnabled = false;
    this.mfaSecret = undefined;
    this.backupCodes = undefined;
    this.updatedAt = new Date();
  }

  /**
   * Regenerate backup codes
   */
  regenerateBackupCodes(newBackupCodes: string[]): void {
    if (!this.mfaEnabled) {
      throw new Error('MFA must be enabled to regenerate backup codes');
    }
    this.backupCodes = newBackupCodes;
    this.updatedAt = new Date();
  }
}
