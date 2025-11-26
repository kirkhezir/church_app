/**
 * Generate Backup Codes Use Case
 *
 * Regenerates backup codes for a member with MFA enabled:
 * - Validates MFA is enabled
 * - Generates new backup codes
 * - Replaces existing backup codes
 *
 * T290: Create GenerateBackupCodes use case
 */

import { MFAService } from '../../infrastructure/auth/mfaService';

export interface GenerateBackupCodesRequest {
  memberId: string;
}

export interface GenerateBackupCodesResponse {
  backupCodes: string[];
  message: string;
}

export interface IMemberRepository {
  findById(id: string): Promise<any>;
  update(id: string, data: any): Promise<any>;
}

export class GenerateBackupCodes {
  constructor(
    private memberRepository: IMemberRepository,
    private mfaService: MFAService
  ) {}

  async execute(request: GenerateBackupCodesRequest): Promise<GenerateBackupCodesResponse> {
    // Find member
    const member = await this.memberRepository.findById(request.memberId);
    if (!member) {
      throw new Error('Member not found');
    }

    // Check if MFA is enabled
    if (!member.mfaEnabled) {
      throw new Error('MFA not enabled for this account');
    }

    // Generate new backup codes
    const { plainCodes, hashedCodes } = await this.mfaService.generateBackupCodesWithHashes();

    // Replace existing backup codes
    await this.memberRepository.update(request.memberId, {
      backupCodes: hashedCodes.map((hash, index) => ({
        code: hash,
        used: false,
        index,
      })),
    });

    return {
      backupCodes: plainCodes,
      message: 'Backup codes regenerated successfully',
    };
  }
}
