/**
 * AdminEnglishTutorialEnrollmentsPage
 *
 * Admin page for managing English Tutorial Ministry enrollments
 * - List all enrollments
 * - Mark enrollments as reviewed once contacted
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CheckCircle,
  Loader2,
  SearchIcon,
  Languages,
  Mail,
  Phone,
  Clock,
  Cake,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { SidebarLayout } from '@/components/layout';
import {
  englishTutorialService,
  type EnglishTutorialEnrollment,
} from '@/services/endpoints/englishTutorialService';
import { gooeyToast } from 'goey-toast';
import { websocketClient } from '@/services/websocket/websocketClient';
import { useNotifications } from '@/contexts/NotificationContext';

type StatusFilter = 'all' | 'PENDING' | 'REVIEWED';

export function AdminEnglishTutorialEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<EnglishTutorialEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { refresh: refreshNotifications } = useNotifications();

  const fetchEnrollments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await englishTutorialService.getAllEnrollments();
      setEnrollments(data);
    } catch {
      setError('Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  // Listen for new enrollments in real-time
  useEffect(() => {
    const handlePending = () => {
      fetchEnrollments();
    };
    websocketClient.onEnrollmentPending(handlePending);
    return () => {
      websocketClient.off('enrollment:pending', handlePending);
    };
  }, [fetchEnrollments]);

  const filteredEnrollments = useMemo(
    () =>
      enrollments.filter((e) => {
        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'PENDING' && !e.reviewedAt) ||
          (statusFilter === 'REVIEWED' && !!e.reviewedAt);
        const matchesSearch =
          searchQuery === '' ||
          e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.nickname.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
      }),
    [enrollments, statusFilter, searchQuery]
  );

  const counts = useMemo(() => {
    const c = { all: enrollments.length, PENDING: 0, REVIEWED: 0 };
    for (const e of enrollments) {
      if (e.reviewedAt) c.REVIEWED++;
      else c.PENDING++;
    }
    return c;
  }, [enrollments]);

  const handleMarkReviewed = async (id: string) => {
    setActionLoading(id);
    try {
      await englishTutorialService.markReviewed(id);
      gooeyToast.success('Enrollment marked as reviewed');
      await fetchEnrollments();
      refreshNotifications();
    } catch {
      setError('Failed to update enrollment');
    } finally {
      setActionLoading(null);
    }
  };

  const statusBadge = (reviewedAt?: string) => {
    const styles = reviewedAt
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    return (
      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles}`}>
        {reviewedAt ? 'Reviewed' : 'Pending'}
      </span>
    );
  };

  return (
    <SidebarLayout
      breadcrumbs={[
        { label: 'Administration', href: '/app/admin/members' },
        { label: 'Content' },
        { label: 'English Tutorial' },
      ]}
    >
      <div className="flex flex-1 flex-col gap-6">
        {/* Header */}
        <header>
          <h1 className="text-2xl font-bold">English Tutorial Enrollments</h1>
          <p className="text-muted-foreground">{enrollments.length} total enrollments</p>
        </header>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <nav
          aria-label="Filter enrollments"
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex flex-wrap gap-2">
            {(['all', 'PENDING', 'REVIEWED'] as StatusFilter[]).map((status) => (
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
              placeholder="Search by name or nickname..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </nav>

        {/* Enrollments List */}
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex-1 space-y-4">
            {filteredEnrollments.map((enrollment) => (
              <Card key={enrollment.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        {statusBadge(enrollment.reviewedAt)}
                        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                          {enrollment.gender === 'MALE' ? 'Male' : 'Female'}
                        </span>
                        <span className="text-xs text-muted-foreground">Age {enrollment.age}</span>
                      </div>
                      <p className="mb-2 font-medium text-foreground">
                        {enrollment.name}{' '}
                        <span className="font-normal text-muted-foreground">
                          &ldquo;{enrollment.nickname}&rdquo;
                        </span>
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Cake className="h-3 w-3" />{' '}
                          {new Date(enrollment.birthDate).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        {enrollment.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {enrollment.phone}
                          </span>
                        )}
                        {enrollment.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {enrollment.email}
                          </span>
                        )}
                        <span
                          className="flex items-center gap-1"
                          title={new Date(enrollment.enrolledAt).toISOString()}
                        >
                          <Clock className="h-3 w-3" />{' '}
                          {new Date(enrollment.enrolledAt).toLocaleString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 flex-col gap-2 sm:flex-row sm:gap-1">
                      {!enrollment.reviewedAt && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600"
                          disabled={actionLoading === enrollment.id}
                          onClick={() => handleMarkReviewed(enrollment.id)}
                        >
                          {actionLoading === enrollment.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="mr-1 h-4 w-4" />
                          )}
                          Mark Reviewed
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredEnrollments.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                <Languages className="mx-auto mb-2 h-8 w-8 opacity-30" />
                <p>No enrollments found</p>
                <p className="mt-1 text-xs opacity-70">
                  Enrollments submitted from the English Tutorial Ministry page will appear here.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}

export default AdminEnglishTutorialEnrollmentsPage;
