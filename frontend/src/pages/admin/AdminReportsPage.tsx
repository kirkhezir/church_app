/**
 * Admin Reports Page
 *
 * Allows administrators to generate and download reports
 */

import { ReportDownloadPanel } from '@/components/features/reports/ReportDownloadPanel';

export default function AdminReportsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ReportDownloadPanel />
    </div>
  );
}
