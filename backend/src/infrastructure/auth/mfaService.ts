/**
 * MFA Service
 *
 * Handles Multi-Factor Authentication using TOTP (Time-based One-Time Password):
 * - Secret generation for authenticator apps
 * - QR code generation for easy enrollment
 * - TOTP token verification
 * - Backup code generation and verification
 *
 * Compatible with Google Authenticator, Authy, and other TOTP apps
 */

import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

export interface MFAEnrollment {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
  hashedBackupCodes: string[];
}

export interface BackupCodeVerification {
  valid: boolean;
  index?: number;
}

export interface BackupCodesWithHashes {
  plainCodes: string[];
  hashedCodes: string[];
}

export class MFAService {
  private readonly issuer: string;
  private readonly backupCodeCount: number;
  private readonly backupCodeLength: number;

  constructor() {
    this.issuer = process.env.MFA_ISSUER || 'Sing Buri Adventist Center';
    this.backupCodeCount = 10;
    this.backupCodeLength = 8;

    // Configure authenticator options
    authenticator.options = {
      step: 30, // 30 second time step (standard)
      window: 1, // Allow 1 step before/after for clock skew
    };
  }

  /**
   * Generate a new TOTP secret for MFA enrollment
   */
  async generateSecret(): Promise<string> {
    return authenticator.generateSecret();
  }

  /**
   * Generate the otpauth URI for authenticator apps
   */
  generateOtpauthUri(secret: string, email: string, issuer?: string): string {
    return authenticator.keyuri(email, issuer || this.issuer, secret);
  }

  /**
   * Generate QR code data URL for the authenticator app
   */
  async generateQRCodeUrl(secret: string, email: string, issuer?: string): Promise<string> {
    const otpauthUri = this.generateOtpauthUri(secret, email, issuer);
    return QRCode.toDataURL(otpauthUri, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
  }

  /**
   * Generate a TOTP token for a given secret (for testing)
   */
  generateToken(secret: string): string {
    return authenticator.generate(secret);
  }

  /**
   * Verify a TOTP token against a secret
   */
  async verifyToken(
    token: string,
    secret: string,
    options?: { window?: number }
  ): Promise<boolean> {
    // Validate token format
    if (!this.isValidTokenFormat(token)) {
      return false;
    }

    try {
      // Use custom window if provided
      if (options?.window !== undefined) {
        const originalWindow = authenticator.options.window;
        authenticator.options.window = options.window;
        const result = authenticator.verify({ token, secret });
        authenticator.options.window = originalWindow;
        return result;
      }

      return authenticator.verify({ token, secret });
    } catch (_error) {
      return false;
    }
  }

  /**
   * Check if token has valid format (6 digits)
   */
  private isValidTokenFormat(token: string): boolean {
    return /^\d{6}$/.test(token);
  }

  /**
   * Generate backup codes for recovery
   */
  async generateBackupCodes(count?: number): Promise<string[]> {
    const numCodes = count || this.backupCodeCount;
    const codes: string[] = [];

    for (let i = 0; i < numCodes; i++) {
      const code = this.generateSingleBackupCode();
      codes.push(code);
    }

    return codes;
  }

  /**
   * Generate backup codes with their hashed versions for storage
   */
  async generateBackupCodesWithHashes(): Promise<BackupCodesWithHashes> {
    const plainCodes = await this.generateBackupCodes();
    const hashedCodes: string[] = [];

    for (const code of plainCodes) {
      const hash = await this.hashBackupCode(code);
      hashedCodes.push(hash);
    }

    return { plainCodes, hashedCodes };
  }

  /**
   * Generate a single backup code in format XXXX-XXXX
   */
  private generateSingleBackupCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';

    for (let i = 0; i < this.backupCodeLength; i++) {
      const randomIndex = crypto.randomInt(chars.length);
      code += chars[randomIndex];
    }

    // Format as XXXX-XXXX
    return `${code.slice(0, 4)}-${code.slice(4)}`;
  }

  /**
   * Hash a backup code for secure storage
   */
  async hashBackupCode(code: string): Promise<string> {
    // Normalize code (uppercase, remove dashes)
    const normalizedCode = code.toUpperCase().replace(/-/g, '');
    return bcrypt.hash(normalizedCode, 10);
  }

  /**
   * Verify a backup code against stored hashes
   */
  async verifyBackupCode(code: string, hashedCodes: string[]): Promise<BackupCodeVerification> {
    // Normalize code (uppercase, remove dashes)
    const normalizedCode = code.toUpperCase().replace(/-/g, '');

    for (let i = 0; i < hashedCodes.length; i++) {
      const isMatch = await bcrypt.compare(normalizedCode, hashedCodes[i]);
      if (isMatch) {
        return { valid: true, index: i };
      }
    }

    return { valid: false };
  }

  /**
   * Create complete MFA enrollment data
   */
  async createEnrollment(email: string, issuer?: string): Promise<MFAEnrollment> {
    const secret = await this.generateSecret();
    const qrCodeUrl = await this.generateQRCodeUrl(secret, email, issuer);
    const { plainCodes, hashedCodes } = await this.generateBackupCodesWithHashes();

    return {
      secret,
      qrCodeUrl,
      backupCodes: plainCodes,
      hashedBackupCodes: hashedCodes,
    };
  }

  /**
   * Mark a backup code as used (return updated array with code removed)
   */
  markBackupCodeAsUsed(hashedCodes: string[], usedIndex: number): string[] {
    return hashedCodes.filter((_, index) => index !== usedIndex);
  }

  /**
   * Check if MFA should be required for a given role
   */
  isMFARequired(role: string): boolean {
    // MFA is required for ADMIN and STAFF roles
    return ['ADMIN', 'STAFF'].includes(role);
  }
}

export const mfaService = new MFAService();
