import { ISermonRepository } from '../../domain/interfaces/ISermonRepository';

/**
 * GetSermons Use Case - Retrieve list of sermons with optional filtering
 * Public access - no authentication required.
 */
export class GetSermons {
  constructor(private sermonRepository: ISermonRepository) {}

  async execute(input: { speaker?: string; series?: string } = {}): Promise<any[]> {
    return this.sermonRepository.findAll({
      isPublished: true,
      speaker: input.speaker,
      series: input.series,
    });
  }
}
