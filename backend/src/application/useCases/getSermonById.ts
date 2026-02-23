import { ISermonRepository } from '../../domain/interfaces/ISermonRepository';

/**
 * GetSermonById Use Case - Retrieve a single sermon by ID
 */
export class GetSermonById {
  constructor(private sermonRepository: ISermonRepository) {}

  async execute(id: string): Promise<any> {
    const sermon = await this.sermonRepository.findById(id);
    if (!sermon) {
      const error = new Error('Sermon not found');
      (error as any).statusCode = 404;
      throw error;
    }
    return sermon;
  }
}
