import { IPrayerRepository } from '../../domain/interfaces/IPrayerRepository';

/**
 * PrayForRequest Use Case - Increment the prayer count for a request
 */
export class PrayForRequest {
  constructor(private prayerRepository: IPrayerRepository) {}

  async execute(id: string): Promise<any> {
    const existing = await this.prayerRepository.findById(id);
    if (!existing) {
      const error: any = new Error('Prayer request not found');
      error.statusCode = 404;
      throw error;
    }
    return await this.prayerRepository.incrementPrayerCount(id);
  }
}
