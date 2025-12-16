/**
 * Admin System Health Page
 *
 * Displays system health status for administrators
 */

import { HealthDashboard } from '@/components/features/admin/HealthDashboard';

export default function AdminHealthPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <HealthDashboard />
    </div>
  );
}
