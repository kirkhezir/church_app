/**
 * MFA Service
 *
 * Handles all MFA (Multi-Factor Authentication) related API calls:
 * - Enrollment initiation
 * - Enrollment verification
 * - Login MFA verification
 * - Backup codes regeneration
 * - MFA disable
 *
 * T299-T300: Create frontend MFA service
 */

import apiClient from '../api/apiClient';

export interface MFAEnrollmentResponse {
  secret: string;
  qrCodeUrl: string;
}

export interface MFAVerifyResponse {
  message: string;
  backupCodes: string[];
}

export interface MFALoginResponse {
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

export interface BackupCodesResponse {
  backupCodes: string[];
  message: string;
}

export const mfaService = {
  /**
   * Initiate MFA enrollment - get QR code for authenticator app
   */
  async enroll(): Promise<MFAEnrollmentResponse> {
    const response = await apiClient.post('/auth/mfa/enroll');
    return response as unknown as MFAEnrollmentResponse;
  },

  /**
   * Complete MFA enrollment by verifying TOTP code
   */
  async verify(token: string, secret: string): Promise<MFAVerifyResponse> {
    const response = await apiClient.post('/auth/mfa/verify', {
      token,
      secret,
    });
    return response as unknown as MFAVerifyResponse;
  },

  /**
   * Verify MFA code during login process
   */
  async verifyLogin(
    mfaToken: string,
    code?: string,
    backupCode?: string
  ): Promise<MFALoginResponse> {
    const payload: any = { mfaToken };
    if (code) payload.code = code;
    if (backupCode) payload.backupCode = backupCode;

    const response = await apiClient.post('/auth/mfa/verify-login', payload);
    return response as unknown as MFALoginResponse;
  },

  /**
   * Regenerate backup codes
   */
  async regenerateBackupCodes(): Promise<BackupCodesResponse> {
    const response = await apiClient.post('/auth/mfa/backup-codes');
    return response as unknown as BackupCodesResponse;
  },

  /**
   * Disable MFA (requires password verification)
   */
  async disable(password: string): Promise<{ message: string }> {
    const response = await apiClient.delete('/auth/mfa', {
      data: { password },
    });
    return response as unknown as { message: string };
  },

  /**
   * Check if MFA is required for the current user's role
   */
  isMFARequired(role: string): boolean {
    return ['ADMIN', 'STAFF'].includes(role);
  },
};
