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

export class ExportEventData {
  private readonly exportFields = [
    'id',
    'title',
    'description',
    'startDateTime',
    'endDateTime',
    'location',
    'category',
    'maxCapacity',
    'rsvpCount',
    'createdAt',
    'cancelledAt',
  ];

  constructor(private eventRepository: IEventRepository) {}

  async execute(request: ExportEventDataRequest): Promise<ExportEventDataResponse> {
    // Build filter conditions
    const where: any = {
      deletedAt: null,
    };

    if (!request.includeCancelled) {
      where.cancelledAt = null;
    }

    if (request.category) {
      where.category = request.category;
    }

    if (request.startDate || request.endDate) {
      where.startDateTime = {};
      if (request.startDate) {
        where.startDateTime.gte = request.startDate;
      }
      if (request.endDate) {
        where.startDateTime.lte = request.endDate;
      }
    }

    // Get events with RSVP count
    const events = await this.eventRepository.findMany({
      where,
      include: {
        _count: {
          select: { event_rsvps: true },
        },
      },
    });

    // Transform data
    const transformedEvents = events.map((event) => {
      const result: any = {};
      for (const field of this.exportFields) {
        if (field === 'rsvpCount') {
          result.rsvpCount = event._count?.event_rsvps || 0;
        } else if (event[field] !== undefined) {
          result[field] = event[field];
        }
      }
      return result;
    });

    // Generate filename with date
    const dateStr = new Date().toISOString().split('T')[0];
    const extension = request.format === 'csv' ? 'csv' : 'json';
    const filename = `events_${dateStr}.${extension}`;

    if (request.format === 'csv') {
      return {
        data: this.toCSV(transformedEvents),
        format: 'csv',
        contentType: 'text/csv',
        filename,
      };
    }

    return {
      data: transformedEvents,
      format: 'json',
      contentType: 'application/json',
      filename,
    };
  }

  private toCSV(data: any[]): string {
    if (data.length === 0) {
      return this.exportFields.join(',');
    }

    // Header row
    const headers = this.exportFields;
    const rows = [headers.join(',')];

    // Data rows
    for (const item of data) {
      const row = headers.map((header) => {
        const value = item[header];
        return this.escapeCSVValue(value);
      });
      rows.push(row.join(','));
    }

    return rows.join('\n');
  }

  private escapeCSVValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }

    // Convert dates to ISO string
    if (value instanceof Date) {
      return value.toISOString();
    }

    const stringValue = String(value);

    // Check if escaping is needed
    if (
      stringValue.includes(',') ||
      stringValue.includes('"') ||
      stringValue.includes('\n') ||
      stringValue.includes('\r')
    ) {
      // Escape double quotes by doubling them
      const escaped = stringValue.replace(/"/g, '""');
      return `"${escaped}"`;
    }

    return stringValue;
  }
}
