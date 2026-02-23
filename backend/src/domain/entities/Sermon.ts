/**
 * Sermon Domain Entity
 *
 * Represents a church sermon with metadata for display and playback.
 * Business Rules:
 * - Title must be between 3-200 characters
 * - Speaker name is required
 * - Date must be valid
 * - At least one media source (youtubeUrl or audioUrl) is recommended
 */
export class Sermon {
  private constructor(
    public readonly id: string,
    public title: string,
    public titleThai: string | null,
    public speaker: string,
    public speakerThai: string | null,
    public series: string | null,
    public scripture: string | null,
    public date: Date,
    public youtubeUrl: string | null,
    public audioUrl: string | null,
    public thumbnailUrl: string | null,
    public duration: string | null,
    public description: string,
    public descriptionThai: string | null,
    public views: number,
    public isPublished: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {
    this.validateTitle(title);
    this.validateSpeaker(speaker);
  }

  static create(
    id: string,
    title: string,
    speaker: string,
    date: Date,
    description: string,
    options: {
      titleThai?: string;
      speakerThai?: string;
      series?: string;
      scripture?: string;
      youtubeUrl?: string;
      audioUrl?: string;
      thumbnailUrl?: string;
      duration?: string;
      descriptionThai?: string;
      isPublished?: boolean;
    } = {}
  ): Sermon {
    const now = new Date();
    return new Sermon(
      id,
      title,
      options.titleThai ?? null,
      speaker,
      options.speakerThai ?? null,
      options.series ?? null,
      options.scripture ?? null,
      date,
      options.youtubeUrl ?? null,
      options.audioUrl ?? null,
      options.thumbnailUrl ?? null,
      options.duration ?? null,
      description,
      options.descriptionThai ?? null,
      0,
      options.isPublished ?? true,
      now,
      now
    );
  }

  static fromPersistence(data: {
    id: string;
    title: string;
    titleThai: string | null;
    speaker: string;
    speakerThai: string | null;
    series: string | null;
    scripture: string | null;
    date: Date;
    youtubeUrl: string | null;
    audioUrl: string | null;
    thumbnailUrl: string | null;
    duration: string | null;
    description: string;
    descriptionThai: string | null;
    views: number;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): Sermon {
    return new Sermon(
      data.id,
      data.title,
      data.titleThai,
      data.speaker,
      data.speakerThai,
      data.series,
      data.scripture,
      data.date,
      data.youtubeUrl,
      data.audioUrl,
      data.thumbnailUrl,
      data.duration,
      data.description,
      data.descriptionThai,
      data.views,
      data.isPublished,
      data.createdAt,
      data.updatedAt
    );
  }

  incrementViews(): void {
    this.views += 1;
    this.updatedAt = new Date();
  }

  publish(): void {
    this.isPublished = true;
    this.updatedAt = new Date();
  }

  unpublish(): void {
    this.isPublished = false;
    this.updatedAt = new Date();
  }

  private validateTitle(title: string): void {
    if (!title || title.trim().length < 3) {
      throw new Error('Sermon title must be at least 3 characters');
    }
    if (title.length > 200) {
      throw new Error('Sermon title cannot exceed 200 characters');
    }
  }

  private validateSpeaker(speaker: string): void {
    if (!speaker || speaker.trim().length < 2) {
      throw new Error('Speaker name must be at least 2 characters');
    }
  }
}
