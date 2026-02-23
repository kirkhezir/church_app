import { IPrayerRepository } from '../../domain/interfaces/IPrayerRepository';

/**
 * ModeratePrayerRequest Use Case - Approve or archive a prayer request (Admin/Staff)
 */
export class ModeratePrayerRequest {
  constructor(private prayerRepository: IPrayerRepository) {}

  async execute(input: { id: string; status: 'APPROVED' | 'ARCHIVED' }): Promise<any> {
    const existing = await this.prayerRepository.findById(input.id);
    if (!existing) {
      const error: any = new Error('Prayer request not found');
      error.statusCode = 404;
      throw error;
    }

    if (!['APPROVED', 'ARCHIVED'].includes(input.status)) {
      const error: any = new Error('Invalid status. Must be APPROVED or ARCHIVED');
      error.statusCode = 400;
      throw error;
    }

    return await this.prayerRepository.updateStatus(input.id, input.status);
  }
}
