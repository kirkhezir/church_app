/**
 * Export Event Data Use Case
 *
 * Exports event data in CSV or JSON format:
 * - Includes RSVP count
 * - Supports filtering by category and date range
 * - Option to include/exclude cancelled events
 *
 * T320: Create ExportEventData use case
 */

export interface ExportEventDataRequest {
  format: 'json' | 'csv';
  category?: string;
  startDate?: Date;
  endDate?: Date;
  includeCancelled?: boolean;
}

export interface ExportEventDataResponse {
  data: any;
  format: 'json' | 'csv';
  contentType: string;
  filename: string;
}

export interface IEventRepository {
  findMany(options: { where?: any; include?: any }): Promise<any[]>;
}

/** Default CSV column order */
const CSV_COLUMNS = [
  'id',
  'title',
  'description',
  'startDateTime',
  'endDateTime',
  'location',
  'category',
  'maxCapacity',
  'rsvpCount',
];

function escapeCSVValue(value: any): string {
  if (value === null || value === undefined) return '';
  const str = value instanceof Date ? value.toISOString() : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export class ExportEventData {
  constructor(private eventRepository: IEventRepository) {}

  async execute(request: ExportEventDataRequest): Promise<ExportEventDataResponse> {
    const where: any = {};

    if (!request.includeCancelled) {
      where.cancelledAt = null;
    }

    if (request.category) {
      where.category = request.category;
    }

    if (request.startDate || request.endDate) {
      where.startDateTime = {};
      if (request.startDate) where.startDateTime.gte = request.startDate;
      if (request.endDate) where.startDateTime.lte = request.endDate;
    }

    const events = await this.eventRepository.findMany({ where });

    // Transform: map _count.rsvps → rsvpCount, keep all other fields
    const transformed = events.map((event) => {
      const { _count, ...rest } = event;
      return {
        ...rest,
        rsvpCount: _count?.rsvps ?? 0,
      };
    });

    const dateStr = new Date().toISOString().split('T')[0];
    const ext = request.format === 'csv' ? 'csv' : 'json';
    const filename = `events_${dateStr}.${ext}`;

    if (request.format === 'csv') {
      return {
        data: this.toCSV(transformed),
        format: 'csv',
        contentType: 'text/csv',
        filename,
      };
    }

    return {
      data: transformed,
      format: 'json',
      contentType: 'application/json',
      filename,
    };
  }

  private toCSV(data: Record<string, any>[]): string {
    const columns =
      data.length > 0
        ? CSV_COLUMNS.filter((c) => c in data[0]).concat(
            Object.keys(data[0]).filter((k) => !CSV_COLUMNS.includes(k))
          )
        : CSV_COLUMNS;

    const header = columns.join(',');
    const rows = data.map((item) => columns.map((col) => escapeCSVValue(item[col])).join(','));

    return [header, ...rows].join('\n');
  }
}
