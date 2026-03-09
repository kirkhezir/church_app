/**
 * Admin Audit Logs Page
 *
 * View system audit logs with filtering:
 * - Filter by action type
 * - Filter by entity type
 * - Filter by date range
 * - Pagination
 *
 * T317: Create admin audit logs page
 */

import { useState, useEffect, useCallback } from 'react';
import { TableSkeleton } from '@/components/ui/skeletons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { adminService, AuditLog } from '@/services/endpoints/adminService';
import { getErrorMessage } from '@/lib/errorReporting';
import { SidebarLayout } from '@/components/layout';
import { ClipboardList } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [entityTypeFilter, setEntityTypeFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminService.getAuditLogs({
        page,
        limit: 20,
        action: actionFilter === 'ALL' ? undefined : actionFilter,
        entityType: entityTypeFilter === 'ALL' ? undefined : entityTypeFilter,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setLogs(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load audit logs'));
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter, entityTypeFilter, startDate, endDate]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleFilter = () => {
    setPage(1);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getActionBadgeClass = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'UPDATE':
        return 'bg-accent text-primary';
      case 'DELETE':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-muted text-foreground';
    }
  };

  return (
    <SidebarLayout
      breadcrumbs={[
        { label: 'Administration', href: '/app/admin/members' },
        { label: 'Monitoring' },
        { label: 'Audit Logs' },
      ]}
    >
      <div className="container mx-auto flex flex-1 flex-col px-4 py-4">
        <h1 className="mb-6 text-balance text-2xl font-bold">Audit Logs</h1>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Actions</SelectItem>
                  <SelectItem value="CREATE">Create</SelectItem>
                  <SelectItem value="UPDATE">Update</SelectItem>
                  <SelectItem value="DELETE">Delete</SelectItem>
                </SelectContent>
              </Select>

              <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="MEMBER">Member</SelectItem>
                  <SelectItem value="EVENT">Event</SelectItem>
                  <SelectItem value="ANNOUNCEMENT">Announcement</SelectItem>
                  <SelectItem value="MESSAGE">Message</SelectItem>
                </SelectContent>
              </Select>

              <div className="space-y-1">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div className="self-end">
                <Button onClick={handleFilter} className="w-full md:w-auto">
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[540px]">
            {loading ? (
              <TableSkeleton rows={5} columns={6} />
            ) : logs.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <ClipboardList className="mx-auto mb-2 h-8 w-8 opacity-30" />
                <p>No audit logs found</p>
                <p className="mt-1 text-xs opacity-70">Try adjusting your filters or date range.</p>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full table-fixed">
                    <thead>
                      <tr className="border-b">
                        <th className="w-[18%] px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                          Timestamp
                        </th>
                        <th className="w-[18%] px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                          User
                        </th>
                        <th className="w-[12%] px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                          Action
                        </th>
                        <th className="w-[14%] px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                          Type
                        </th>
                        <th className="w-[20%] px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                          Entity ID
                        </th>
                        <th className="w-[18%] px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                          IP Address
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log.id} className="border-b hover:bg-background">
                          <td className="px-4 py-3 text-sm">{formatDateTime(log.timestamp)}</td>
                          <td className="px-4 py-3">
                            {log.user ? (
                              <span>
                                {log.user.firstName} {log.user.lastName}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">System</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded px-2 py-1 text-xs font-medium ${getActionBadgeClass(
                                log.action
                              )}`}
                            >
                              {log.action}
                            </span>
                          </td>
                          <td className="px-4 py-3">{log.entityType}</td>
                          <td className="px-4 py-3 font-mono text-sm">
                            {log.entityId.substring(0, 8)}&hellip;
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {log.ipAddress}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="divide-y md:hidden">
                  {logs.map((log) => (
                    <div key={log.id} className="space-y-1.5 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-medium ${getActionBadgeClass(log.action)}`}
                        >
                          {log.action}
                        </span>
                        <span className="text-xs text-muted-foreground">{log.entityType}</span>
                      </div>
                      <p className="text-sm">
                        {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatDateTime(log.timestamp)}</span>
                        <span className="font-mono">{log.entityId.substring(0, 8)}&hellip;</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="px-4 py-2">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
