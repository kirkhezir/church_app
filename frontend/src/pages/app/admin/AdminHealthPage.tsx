/**
 * Admin System Health Page
 *
 * Displays system health status for administrators
 */

import { HealthDashboard } from '@/components/features/admin/HealthDashboard';
import { SidebarLayout } from '@/components/layout';

const breadcrumbs = [{ label: 'Admin', href: '/app/admin/members' }, { label: 'System Health' }];

export default function AdminHealthPage() {
  return (
    <SidebarLayout breadcrumbs={breadcrumbs}>
      <HealthDashboard />
    </SidebarLayout>
  );
}
