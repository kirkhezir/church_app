/**
 * Export Member Data Use Case
 *
 * Exports member data in CSV or JSON format:
 * - Excludes sensitive fields (passwordHash, mfaSecret, backupCodes)
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

/** Fields that must never appear in exports */
const SENSITIVE_FIELDS = ['passwordHash', 'mfaSecret', 'backupCodes'];

/** Default CSV column order when members have these fields */
const CSV_COLUMNS = ['id', 'email', 'firstName', 'lastName', 'role', 'membershipDate', 'phone'];

function stripSensitive(member: Record<string, any>): Record<string, any> {
  const cleaned = { ...member };
  for (const field of SENSITIVE_FIELDS) {
    delete cleaned[field];
  }
  return cleaned;
}

function escapeCSVValue(value: any): string {
  if (value === null || value === undefined) return '';
  const str = value instanceof Date ? value.toISOString() : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export class ExportMemberData {
  constructor(private memberRepository: IMemberRepository) {}

  async execute(request: ExportMemberDataRequest): Promise<ExportMemberDataResponse> {
    const where: any = {};

    if (request.role) {
      where.role = request.role;
    }

    if (request.startDate || request.endDate) {
      where.membershipDate = {};
      if (request.startDate) where.membershipDate.gte = request.startDate;
      if (request.endDate) where.membershipDate.lte = request.endDate;
    }

    const members = await this.memberRepository.findMany({ where });
    const sanitized = members.map(stripSensitive);

    const dateStr = new Date().toISOString().split('T')[0];
    const ext = request.format === 'csv' ? 'csv' : 'json';
    const filename = `members_${dateStr}.${ext}`;

    if (request.format === 'csv') {
      return {
        data: this.toCSV(sanitized),
        format: 'csv',
        contentType: 'text/csv',
        filename,
      };
    }

    return {
      data: sanitized,
      format: 'json',
      contentType: 'application/json',
      filename,
    };
  }

  private toCSV(data: Record<string, any>[]): string {
    // Determine columns: use CSV_COLUMNS for known fields, then anything extra
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
