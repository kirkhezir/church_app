/**
 * Admin Reports Page
 *
 * Allows administrators to generate and download reports
 */

import { ReportDownloadPanel } from '@/components/features/reports/ReportDownloadPanel';
import { SidebarLayout } from '@/components/layout';

export default function AdminReportsPage() {
  const breadcrumbs = [{ label: 'Admin', href: '/app/admin/members' }, { label: 'Reports' }];

  return (
    <SidebarLayout breadcrumbs={breadcrumbs}>
      <ReportDownloadPanel />
    </SidebarLayout>
  );
}
