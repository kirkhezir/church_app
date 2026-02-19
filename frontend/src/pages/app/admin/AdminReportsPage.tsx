/**
 * Admin Reports Page
 *
 * Allows administrators to generate and download reports
 */

import { ReportDownloadPanel } from '@/components/features/reports/ReportDownloadPanel';
import { SidebarLayout } from '@/components/layout';

const breadcrumbs = [{ label: 'Admin', href: '/app/admin/members' }, { label: 'Reports' }];

export default function AdminReportsPage() {
  return (
    <SidebarLayout breadcrumbs={breadcrumbs}>
      <ReportDownloadPanel />
    </SidebarLayout>
  );
}
