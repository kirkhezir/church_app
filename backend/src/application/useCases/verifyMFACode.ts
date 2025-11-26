/**
 * Verify MFA Code Use Case
 *
 * Verifies a TOTP code to complete MFA enrollment:
 * - Validates the provided token against the stored secret
 * - Enables MFA on successful verification
 * - Generates and returns backup codes
 *
 * T289: Create VerifyMFACode use case
 */

import { MFAService } from '../../infrastructure/auth/mfaService';

export interface VerifyMFACodeRequest {
  memberId: string;
  token: string;
  secret: string;
}

export interface VerifyMFACodeResponse {
  success: boolean;
  backupCodes?: string[];
  message: string;
}

export interface IMemberRepository {
  findById(id: string): Promise<any>;
  update(id: string, data: any): Promise<any>;
}

export class VerifyMFACode {
  constructor(
    private memberRepository: IMemberRepository,
    private mfaService: MFAService
  ) {}

  async execute(request: VerifyMFACodeRequest): Promise<VerifyMFACodeResponse> {
    // Find member
    const member = await this.memberRepository.findById(request.memberId);
    if (!member) {
      throw new Error('Member not found');
    }

    // Verify the token
    const isValid = await this.mfaService.verifyToken(request.token, request.secret);
    if (!isValid) {
      throw new Error('Invalid verification code');
    }

    // Generate backup codes
    const { plainCodes, hashedCodes } = await this.mfaService.generateBackupCodesWithHashes();

    // Enable MFA and store backup codes
    await this.memberRepository.update(request.memberId, {
      mfaEnabled: true,
      mfaSecret: request.secret,
      backupCodes: hashedCodes.map((hash, index) => ({
        code: hash,
        used: false,
        index,
      })),
    });

    return {
      success: true,
      backupCodes: plainCodes,
      message: 'MFA enabled successfully',
    };
  }
}
