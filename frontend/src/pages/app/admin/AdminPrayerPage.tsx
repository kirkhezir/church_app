/**
 * AdminPrayerPage
 *
 * Admin page for moderating prayer requests
 * - List all prayer requests (all statuses)
 * - Approve/archive requests
 * - View requester details
 */

import { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle,
  Archive,
  Loader2,
  SearchIcon,
  Heart,
  Mail,
  Clock,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { SidebarLayout } from '@/components/layout';
import { prayerService, type PrayerRequest } from '@/services/endpoints/prayerService';
import { gooeyToast } from 'goey-toast';

type StatusFilter = 'all' | 'PENDING' | 'APPROVED' | 'ARCHIVED';

export function AdminPrayerPage() {
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await prayerService.getAllPrayerRequests();
      setRequests(data);
    } catch {
      setError('Failed to load prayer requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = useMemo(
    () =>
      requests.filter((r) => {
        const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
        const matchesSearch =
          searchQuery === '' ||
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.request.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
      }),
    [requests, statusFilter, searchQuery]
  );

  const counts = useMemo(() => {
    const c = { all: requests.length, PENDING: 0, APPROVED: 0, ARCHIVED: 0 };
    for (const r of requests) {
      c[r.status]++;
    }
    return c;
  }, [requests]);

  const handleModerate = async (id: string, status: 'APPROVED' | 'ARCHIVED') => {
    setActionLoading(id);
    try {
      await prayerService.moderatePrayerRequest(id, status);
      gooeyToast.success(`Prayer request ${status.toLowerCase()}`);
      await fetchRequests();
    } catch {
      setError('Failed to moderate prayer request');
    } finally {
      setActionLoading(null);
    }
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      ARCHIVED: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    };
    return (
      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? ''}`}>
        {status}
      </span>
    );
  };

  return (
    <SidebarLayout
      breadcrumbs={[
        { label: 'Administration', href: '/app/admin/members' },
        { label: 'Content' },
        { label: 'Prayer' },
      ]}
    >
      <div className="flex flex-1 flex-col gap-6">
        {/* Header */}
        <header>
          <h1 className="text-2xl font-bold">Moderate Prayer Requests</h1>
          <p className="text-muted-foreground">{requests.length} total requests</p>
        </header>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {/* Filters */}
        <nav
          aria-label="Filter prayer requests"
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex flex-wrap gap-2">
            {(['all', 'PENDING', 'APPROVED', 'ARCHIVED'] as StatusFilter[]).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {status === 'all' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()} (
                {counts[status]})
              </Button>
            ))}
          </div>
          <div className="relative w-full max-w-xs">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </nav>

        {/* Requests List */}
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex-1 space-y-4">
            {filteredRequests.map((prayer) => (
              <Card key={prayer.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        {statusBadge(prayer.status)}
                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                          {prayer.category.charAt(0).toUpperCase() + prayer.category.slice(1)}
                        </span>
                        {prayer.isPublic && (
                          <span className="text-xs text-muted-foreground">(Public)</span>
                        )}
                        {prayer.isAnonymous && (
                          <span className="text-xs text-muted-foreground">(Anonymous)</span>
                        )}
                      </div>
                      <p className="mb-2 text-foreground">{prayer.request}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Shield className="h-3 w-3" /> {prayer.name}
                        </span>
                        {prayer.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {prayer.email}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />{' '}
                          {new Date(prayer.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" /> {prayer.prayerCount} prayers
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 flex-col gap-2 sm:flex-row sm:gap-1">
                      {prayer.status !== 'APPROVED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600"
                          disabled={actionLoading === prayer.id}
                          onClick={() => handleModerate(prayer.id, 'APPROVED')}
                        >
                          {actionLoading === prayer.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="mr-1 h-4 w-4" />
                          )}
                          Approve
                        </Button>
                      )}
                      {prayer.status !== 'ARCHIVED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actionLoading === prayer.id}
                          onClick={() => handleModerate(prayer.id, 'ARCHIVED')}
                        >
                          {actionLoading === prayer.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Archive className="mr-1 h-4 w-4" />
                          )}
                          Archive
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredRequests.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                <Heart className="mx-auto mb-2 h-8 w-8 opacity-30" />
                <p>No prayer requests found</p>
                <p className="mt-1 text-xs opacity-70">
                  Prayer requests from members will appear here.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}

export default AdminPrayerPage;
