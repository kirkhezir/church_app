import { IPrayerRepository } from '../../domain/interfaces/IPrayerRepository';

/**
 * PrayForRequest Use Case - Increment the prayer count for a request
 * If memberId is supplied, records the supporter and only increments when
 * the member has not already prayed for this request.
 */
export class PrayForRequest {
  constructor(private prayerRepository: IPrayerRepository) {}

  async execute(id: string, memberId?: string): Promise<any> {
    const existing = await this.prayerRepository.findById(id);
    if (!existing) {
      const error: any = new Error('Prayer request not found');
      error.statusCode = 404;
      throw error;
    }
    if (memberId) {
      const alreadyPrayed = await this.prayerRepository.hasMemberPrayed(id, memberId);
      if (alreadyPrayed) {
        // Idempotent — return current state without double-counting
        return existing;
      }
      await this.prayerRepository.addSupporter(id, memberId);
    }
    return await this.prayerRepository.incrementPrayerCount(id);
  }
}
