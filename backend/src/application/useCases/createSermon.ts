import { randomUUID } from 'crypto';
import { ISermonRepository } from '../../domain/interfaces/ISermonRepository';

interface CreateSermonInput {
  title: string;
  titleThai?: string;
  speaker: string;
  speakerThai?: string;
  series?: string;
  scripture?: string;
  date: Date;
  youtubeUrl?: string;
  audioUrl?: string;
  thumbnailUrl?: string;
  duration?: string;
  description: string;
  descriptionThai?: string;
  isPublished?: boolean;
}

/**
 * CreateSermon Use Case - Admin creates a new sermon entry
 */
export class CreateSermon {
  constructor(private sermonRepository: ISermonRepository) {}

  async execute(input: CreateSermonInput): Promise<any> {
    if (!input.title || input.title.trim().length < 3) {
      throw new Error('Sermon title must be at least 3 characters');
    }
    if (!input.speaker || input.speaker.trim().length < 2) {
      throw new Error('Speaker name is required');
    }
    if (!input.description || input.description.trim().length < 10) {
      throw new Error('Description must be at least 10 characters');
    }

    return this.sermonRepository.create({
      id: randomUUID(),
      updatedAt: new Date(),
      title: input.title,
      titleThai: input.titleThai || null,
      speaker: input.speaker,
      speakerThai: input.speakerThai || null,
      series: input.series || null,
      scripture: input.scripture || null,
      date: input.date,
      youtubeUrl: input.youtubeUrl || null,
      audioUrl: input.audioUrl || null,
      thumbnailUrl: input.thumbnailUrl || null,
      duration: input.duration || null,
      description: input.description,
      descriptionThai: input.descriptionThai || null,
      isPublished: input.isPublished ?? true,
    });
  }
}
