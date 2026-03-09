import { ISermonRepository } from '../../domain/interfaces/ISermonRepository';

/**
 * DeleteSermon Use Case - Admin deletes a sermon
 */
export class DeleteSermon {
  constructor(private sermonRepository: ISermonRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.sermonRepository.findById(id);
    if (!existing) {
      const error = Object.assign(new Error('Sermon not found'), { statusCode: 404 });
      throw error;
    }
    await this.sermonRepository.delete(id);
  }
}
