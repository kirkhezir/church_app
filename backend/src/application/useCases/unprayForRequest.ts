import { IPrayerRepository } from '../../domain/interfaces/IPrayerRepository';

/**
 * UnprayForRequest Use Case - Decrement the prayer count for a request (toggle off)
 * If memberId is supplied, removes the supporter record and only decrements when
 * the member had actually prayed for this request.
 */
export class UnprayForRequest {
  constructor(private prayerRepository: IPrayerRepository) {}

  async execute(id: string, memberId?: string): Promise<any> {
    const existing = await this.prayerRepository.findById(id);
    if (!existing) {
      const error: any = new Error('Prayer request not found');
      error.statusCode = 404;
      throw error;
    }
    if (memberId) {
      const hadPrayed = await this.prayerRepository.hasMemberPrayed(id, memberId);
      if (!hadPrayed) {
        // Idempotent — nothing to remove
        return existing;
      }
      await this.prayerRepository.removeSupporter(id, memberId);
    }
    return await this.prayerRepository.decrementPrayerCount(id);
  }
}
