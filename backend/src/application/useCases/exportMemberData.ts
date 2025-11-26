/**
 * Export Member Data Use Case
 *
 * Exports member data in CSV or JSON format:
 * - Excludes sensitive fields (passwordHash, mfaSecret, etc.)
 * - Supports filtering by role and date range
 * - Generates proper CSV with escaping
 *
 * T319: Create ExportMemberData use case
 */

export interface ExportMemberDataRequest {
  format: 'json' | 'csv';
  role?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface ExportMemberDataResponse {
  data: any;
  format: 'json' | 'csv';
  contentType: string;
  filename: string;
}

export interface IMemberRepository {
  findMany(options: { where?: any; select?: any }): Promise<any[]>;
}

export class ExportMemberData {
  // Fields that should not be exported (for documentation purposes)
  // private readonly sensitiveFields = [
  //   'passwordHash', 'mfaSecret', 'backupCodes',
  //   'passwordResetToken', 'passwordResetExpires',
  // ];

  private readonly exportFields = [
    'id',
    'email',
    'firstName',
    'lastName',
    'role',
    'phone',
    'address',
    'membershipDate',
    'emailNotifications',
    'createdAt',
  ];

  constructor(private memberRepository: IMemberRepository) {}

  async execute(request: ExportMemberDataRequest): Promise<ExportMemberDataResponse> {
    // Build filter conditions
    const where: any = {
      deletedAt: null,
    };

    if (request.role) {
      where.role = request.role;
    }

    if (request.startDate || request.endDate) {
      where.membershipDate = {};
      if (request.startDate) {
        where.membershipDate.gte = request.startDate;
      }
      if (request.endDate) {
        where.membershipDate.lte = request.endDate;
      }
    }

    // Get members
    const members = await this.memberRepository.findMany({ where });

    // Remove sensitive fields
    const sanitizedMembers = members.map((member) => {
      const sanitized: any = {};
      for (const field of this.exportFields) {
        if (member[field] !== undefined) {
          sanitized[field] = member[field];
        }
      }
      return sanitized;
    });

    // Generate filename with date
    const dateStr = new Date().toISOString().split('T')[0];
    const extension = request.format === 'csv' ? 'csv' : 'json';
    const filename = `members_${dateStr}.${extension}`;

    if (request.format === 'csv') {
      return {
        data: this.toCSV(sanitizedMembers),
        format: 'csv',
        contentType: 'text/csv',
        filename,
      };
    }

    return {
      data: sanitizedMembers,
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
