/**
 * Enroll MFA Use Case
 *
 * Initiates MFA enrollment for a member:
 * - Generates TOTP secret
 * - Creates QR code for authenticator apps
 * - Returns enrollment data (not yet activated)
 *
 * T288: Create EnrollMFA use case
 */

import { MFAService } from '../../infrastructure/auth/mfaService';

export interface EnrollMFARequest {
  memberId: string;
  email: string;
}

export interface EnrollMFAResponse {
  secret: string;
  qrCodeUrl: string;
}

export interface IMemberRepository {
  findById(id: string): Promise<any>;
  update(id: string, data: any): Promise<any>;
}

export class EnrollMFA {
  constructor(
    private memberRepository: IMemberRepository,
    private mfaService: MFAService
  ) {}

  async execute(request: EnrollMFARequest): Promise<EnrollMFAResponse> {
    // Find member
    const member = await this.memberRepository.findById(request.memberId);
    if (!member) {
      throw new Error('Member not found');
    }

    // Check if MFA is already enabled
    if (member.mfaEnabled) {
      throw new Error('MFA already enabled for this account');
    }

    // Create enrollment data
    const enrollment = await this.mfaService.createEnrollment(request.email);

    // Store the secret temporarily (not yet enabled)
    // The secret will only be confirmed when user verifies with a valid token
    await this.memberRepository.update(request.memberId, {
      mfaSecret: enrollment.secret,
      // Don't enable MFA yet - it will be enabled after verification
    });

    return {
      secret: enrollment.secret,
      qrCodeUrl: enrollment.qrCodeUrl,
    };
  }
}
