/**
 * Report Service
 *
 * Handles PDF report generation and download
 */

import { apiClient } from '../api/apiClient';

export type ReportType = 'members' | 'events' | 'announcements' | 'attendance';

interface ReportOptions {
  startDate?: string;
  endDate?: string;
  eventId?: string;
}

/**
 * Download member directory report
 */
export async function downloadMemberReport(): Promise<void> {
  const blob: Blob = await apiClient.get('/reports/members', {
    responseType: 'blob',
  });

  downloadBlob(blob, 'member-directory.pdf');
}

/**
 * Download events report
 */
export async function downloadEventsReport(startDate?: string, endDate?: string): Promise<void> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const blob: Blob = await apiClient.get(`/reports/events?${params.toString()}`, {
    responseType: 'blob',
  });

  const filename = `events-report-${startDate || 'all'}-${endDate || 'all'}.pdf`;
  downloadBlob(blob, filename);
}

/**
 * Download event attendance report
 */
export async function downloadAttendanceReport(eventId: string): Promise<void> {
  const blob: Blob = await apiClient.get(`/reports/events/${eventId}/attendance`, {
    responseType: 'blob',
  });

  downloadBlob(blob, `event-${eventId}-attendance.pdf`);
}

/**
 * Download announcements report
 */
export async function downloadAnnouncementsReport(
  startDate?: string,
  endDate?: string
): Promise<void> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const blob: Blob = await apiClient.get(`/reports/announcements?${params.toString()}`, {
    responseType: 'blob',
  });

  const filename = `announcements-report-${startDate || 'all'}-${endDate || 'all'}.pdf`;
  downloadBlob(blob, filename);
}

/**
 * Generic report download function
 */
export async function downloadReport(type: ReportType, options?: ReportOptions): Promise<void> {
  switch (type) {
    case 'members':
      await downloadMemberReport();
      break;
    case 'events':
      await downloadEventsReport(options?.startDate, options?.endDate);
      break;
    case 'attendance':
      if (!options?.eventId) {
        throw new Error('Event ID is required for attendance report');
      }
      await downloadAttendanceReport(options.eventId);
      break;
    case 'announcements':
      await downloadAnnouncementsReport(options?.startDate, options?.endDate);
      break;
    default:
      throw new Error(`Unknown report type: ${type}`);
  }
}

/**
 * Helper function to download a blob as a file
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
