/**
 * Delete Own Account Use Case
 *
 * Allows members to soft-delete their own account.
 * Business rules:
 * - Admin members cannot delete their own account (must be done by another admin)
 * - Sets deletedAt timestamp and locks the account
 * - Logs the action for audit trail
 */

import { IMemberRepository } from '../../domain/interfaces/IMemberRepository';
import logger from '../../infrastructure/logging/logger';

export interface DeleteOwnAccountRequest {
  memberId: string;
}

export class DeleteOwnAccount {
  constructor(private memberRepository: IMemberRepository) {}

  async execute(input: DeleteOwnAccountRequest): Promise<void> {
    const member = await this.memberRepository.findById(input.memberId);

    if (!member) {
      throw new Error('Member not found');
    }

    if (member.role === 'ADMIN') {
      throw new Error('Admin accounts cannot be self-deleted. Contact another administrator.');
    }

    await this.memberRepository.delete(input.memberId);

    logger.info('Member self-deleted account', {
      memberId: input.memberId,
      email: member.email,
    });
  }
}
