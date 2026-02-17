/**
 * Admin Data Export Page
 *
 * Export data in CSV or JSON format:
 * - Member data export
 * - Event data export
 * - Filter options
 *
 * T323: Create admin data export page
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { adminService } from '@/services/endpoints/adminService';
import { SidebarLayout } from '@/components/layout';

export default function AdminDataExportPage() {
  const [exportType, setExportType] = useState<'members' | 'events'>('members');
  const [format, setFormat] = useState<'json' | 'csv'>('csv');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleExport = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const dateStr = new Date().toISOString().split('T')[0];

      if (exportType === 'members') {
        const data = await adminService.exportMembers({
          format,
          role: roleFilter === 'ALL' ? undefined : roleFilter,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        });

        if (format === 'csv' && data instanceof Blob) {
          adminService.downloadFile(data, `members_${dateStr}.csv`);
        } else {
          // JSON download
          const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json',
          });
          adminService.downloadFile(blob, `members_${dateStr}.json`);
        }
        setSuccess('Member data exported successfully!');
      } else {
        const data = await adminService.exportEvents({
          format,
          category: categoryFilter === 'ALL' ? undefined : categoryFilter,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        });

        if (format === 'csv' && data instanceof Blob) {
          adminService.downloadFile(data, `events_${dateStr}.csv`);
        } else {
          const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json',
          });
          adminService.downloadFile(blob, `events_${dateStr}.json`);
        }
        setSuccess('Event data exported successfully!');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarLayout breadcrumbs={[{ label: 'Admin' }, { label: 'Data Export' }]}>
      <div className="container mx-auto max-w-2xl px-4 py-4">
        <h1 className="mb-6 text-2xl font-bold">Data Export</h1>

        <Card>
          <CardHeader>
            <CardTitle>Export Data</CardTitle>
            <CardDescription>
              Export church data in CSV or JSON format for reporting and backup
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-500 bg-green-50">
                <AlertDescription className="text-green-700">{success}</AlertDescription>
              </Alert>
            )}

            {/* Export Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Type</label>
              <Select
                value={exportType}
                onValueChange={(v: 'members' | 'events') => setExportType(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="members">Members</SelectItem>
                  <SelectItem value="events">Events</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Format */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Format</label>
              <Select value={format} onValueChange={(v: 'json' | 'csv') => setFormat(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Excel compatible)</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter by role (members only) */}
            {exportType === 'members' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Filter by Role (optional)</label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Roles</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="STAFF">Staff</SelectItem>
                    <SelectItem value="MEMBER">Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Filter by category (events only) */}
            {exportType === 'events' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Filter by Category (optional)</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Categories</SelectItem>
                    <SelectItem value="WORSHIP">Worship</SelectItem>
                    <SelectItem value="YOUTH">Youth</SelectItem>
                    <SelectItem value="COMMUNITY">Community</SelectItem>
                    <SelectItem value="TRAINING">Training</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date (optional)</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date (optional)</label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>

            {/* Export Button */}
            <Button onClick={handleExport} disabled={loading} className="w-full">
              {loading
                ? 'Exporting...'
                : `Export ${exportType === 'members' ? 'Members' : 'Events'}`}
            </Button>

            {/* Info */}
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>Note:</strong>
              </p>
              <ul className="list-inside list-disc space-y-1">
                <li>Sensitive data (passwords, MFA secrets) is never exported</li>
                <li>CSV format can be opened directly in Excel or Google Sheets</li>
                <li>JSON format is suitable for data backups and API integrations</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
