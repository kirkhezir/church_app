import { IPrayerRepository } from '../../domain/interfaces/IPrayerRepository';
import { randomUUID } from 'crypto';

/**
 * SubmitPrayerRequest Use Case - Submit a new prayer request (public)
 */
export class SubmitPrayerRequest {
  constructor(private prayerRepository: IPrayerRepository) {}

  async execute(input: {
    name: string;
    email?: string;
    request: string;
    requestThai?: string;
    category?: string;
    categoryThai?: string;
    isAnonymous?: boolean;
  }): Promise<any> {
    if (!input.request || input.request.trim().length < 10) {
      throw new Error('Prayer request must be at least 10 characters');
    }

    return await this.prayerRepository.create({
      id: randomUUID(),
      updatedAt: new Date(),
      name: input.isAnonymous ? 'Anonymous' : input.name,
      email: input.email ?? null,
      category: input.category ?? 'General',
      categoryThai: input.categoryThai ?? null,
      request: input.request,
      requestThai: input.requestThai ?? null,
      isPublic: true,
      isAnonymous: input.isAnonymous ?? false,
    });
  }
}
