import { IPrayerRepository } from '../../domain/interfaces/IPrayerRepository';

/**
 * UpdatePrayerRequest Use Case
 *
 * Allows the original submitter to edit their prayer request within 24 hours,
 * as long as it is still PENDING. Edited requests are reset to PENDING.
 */
export class UpdatePrayerRequest {
  private static readonly EDIT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

  constructor(private prayerRepository: IPrayerRepository) {}

  async execute(input: {
    id: string;
    request: string;
    category?: string;
    categoryThai?: string;
    /** Email or name used to verify original submitter for anonymous users */
    email?: string;
    /** Authenticated member ID (if logged in) */
    memberId?: string;
  }): Promise<any> {
    if (!input.request || input.request.trim().length < 10) {
      throw new Error('Prayer request must be at least 10 characters');
    }
    if (input.request.trim().length > 500) {
      throw new Error('Prayer request must be 500 characters or less');
    }

    const existing = await this.prayerRepository.findById(input.id);
    if (!existing) {
      throw new Error('Prayer request not found');
    }

    // Only allow editing within the edit window
    const elapsed = Date.now() - new Date(existing.createdAt).getTime();
    if (elapsed > UpdatePrayerRequest.EDIT_WINDOW_MS) {
      throw new Error('Edit window has expired (24 hours)');
    }

    // Only allow editing PENDING requests (approved ones are already visible)
    if (existing.status !== 'PENDING') {
      throw new Error('Only pending prayer requests can be edited');
    }

    // Verify ownership: match by email for anonymous or member ID for authenticated
    if (input.memberId) {
      // Authenticated users: match by email
      if (existing.email && existing.email !== input.email) {
        throw new Error('You can only edit your own prayer requests');
      }
    } else if (input.email) {
      // Anonymous users: match by email
      if (existing.email !== input.email) {
        throw new Error('You can only edit your own prayer requests');
      }
    } else {
      throw new Error('Unable to verify ownership of this prayer request');
    }

    return await this.prayerRepository.update(input.id, {
      request: input.request.trim(),
      category: input.category ?? existing.category,
      categoryThai: input.categoryThai ?? existing.categoryThai,
      status: 'PENDING', // Reset to pending after edit
    });
  }
}
