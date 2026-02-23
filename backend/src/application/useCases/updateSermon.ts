import { ISermonRepository } from '../../domain/interfaces/ISermonRepository';

/**
 * UpdateSermon Use Case - Admin updates an existing sermon
 */
export class UpdateSermon {
  constructor(private sermonRepository: ISermonRepository) {}

  async execute(id: string, data: Record<string, any>): Promise<any> {
    const existing = await this.sermonRepository.findById(id);
    if (!existing) {
      const error = new Error('Sermon not found');
      (error as any).statusCode = 404;
      throw error;
    }
    return this.sermonRepository.update(id, data);
  }
}
