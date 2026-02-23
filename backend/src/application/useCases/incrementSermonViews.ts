import { ISermonRepository } from '../../domain/interfaces/ISermonRepository';

/**
 * IncrementSermonViews Use Case - Increments the view count for a sermon
 */
export class IncrementSermonViews {
  constructor(private sermonRepository: ISermonRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.sermonRepository.findById(id);
    if (!existing) {
      const error = new Error('Sermon not found');
      (error as any).statusCode = 404;
      throw error;
    }
    await this.sermonRepository.incrementViews(id);
  }
}
