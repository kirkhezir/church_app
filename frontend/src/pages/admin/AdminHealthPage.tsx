/**
 * Admin System Health Page
 *
 * Displays system health status for administrators
 */

import { HealthDashboard } from '@/components/features/admin/HealthDashboard';
import { SidebarLayout } from '@/components/layout';

export default function AdminHealthPage() {
  const breadcrumbs = [{ label: 'Admin', href: '/app/admin/members' }, { label: 'System Health' }];

  return (
    <SidebarLayout breadcrumbs={breadcrumbs}>
      <HealthDashboard />
    </SidebarLayout>
  );
}
