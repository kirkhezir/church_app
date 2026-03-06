/**
 * Admin Dashboard Section
 *
 * Collapsible admin-only section showing member stats,
 * pending prayer requests, and system overview.
 */

import { useState, useEffect, memo } from 'react';
import {
  Shield,
  Users,
  HeartHandshake,
  ChevronDown,
  BarChart2,
  Eye,
  ArrowUpRight,
} from 'lucide-react';
import { Link } from 'react-router';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../ui/collapsible';
import { Skeleton } from '../../ui/skeleton';

interface AdminStats {
  totalMembers: number;
  newMembersThisMonth: number;
  pendingPrayerRequests: number;
}

interface AdminDashboardSectionProps {
  stats?: AdminStats;
}

type SystemStatus = 'operational' | 'degraded' | 'down' | 'loading';

export const AdminDashboardSection = memo(function AdminDashboardSection({
  stats,
}: AdminDashboardSectionProps) {
  const [isOpen, setIsOpen] = useState(
    () => localStorage.getItem('adminOverviewExpanded') !== 'false'
  );
  const [systemStatus, setSystemStatus] = useState<SystemStatus>('loading');
  const loading = !stats;

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    localStorage.setItem('adminOverviewExpanded', String(open));
  };

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const healthUrl = apiBase.replace('/api/v1', '') + '/health';
    const controller = new AbortController();
    fetch(healthUrl, { signal: controller.signal })
      .then((r) => {
        if (r.status === 200) setSystemStatus('operational');
        else if (r.status === 503) setSystemStatus('down');
        else setSystemStatus('degraded');
      })
      .catch(() => setSystemStatus('down'));
    return () => controller.abort();
  }, []);

  return (
    <Collapsible open={isOpen} onOpenChange={handleOpenChange}>
      <Card className="border-amber-200/50 dark:border-amber-800/30">
        {/* Amber header accent bar */}
        <div className="h-1 w-full rounded-t-lg bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500" />
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer select-none transition-colors hover:bg-accent/50">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-base">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-100 dark:bg-amber-900/40">
                  <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                Admin Overview
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                  Admin
                </span>
              </span>
              <div className="flex items-center gap-3">
                <Link
                  to="/app/admin/analytics"
                  className="hidden items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground sm:flex"
                  onClick={(e) => e.stopPropagation()}
                >
                  <BarChart2 className="h-3 w-3" />
                  Analytics
                </Link>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            {loading ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-lg border border-border/50 p-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div>
                        <Skeleton className="h-6 w-12" />
                        <Skeleton className="mt-1 h-3 w-24" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {/* Total Members */}
                <Link
                  to="/app/admin/members"
                  className="group relative rounded-lg border border-border/50 p-4 transition-all hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-sm dark:hover:border-blue-800/30 dark:hover:bg-blue-950/20"
                >
                  <ArrowUpRight className="absolute right-3 top-3 h-3.5 w-3.5 text-muted-foreground/0 transition-all group-hover:text-blue-400 group-hover:text-muted-foreground/60" />
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 transition-colors group-hover:bg-blue-500/20 dark:bg-blue-400/10">
                      <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold tabular-nums">{stats.totalMembers}</p>
                      <p className="text-xs text-muted-foreground">Total Members</p>
                    </div>
                  </div>
                  {stats.newMembersThisMonth > 0 && (
                    <p className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      <Eye className="h-3 w-3" />+{stats.newMembersThisMonth} new this month
                    </p>
                  )}
                </Link>

                {/* Pending Prayer Requests */}
                <Link
                  to="/app/admin/prayer"
                  className="group relative rounded-lg border border-border/50 p-4 transition-all hover:border-rose-200 hover:bg-rose-50/50 hover:shadow-sm dark:hover:border-rose-800/30 dark:hover:bg-rose-950/20"
                >
                  <ArrowUpRight className="absolute right-3 top-3 h-3.5 w-3.5 text-muted-foreground/0 transition-all group-hover:text-rose-400" />
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10 transition-colors group-hover:bg-rose-500/20 dark:bg-rose-400/10">
                      <HeartHandshake className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold tabular-nums">
                        {stats.pendingPrayerRequests}
                      </p>
                      <p className="text-xs text-muted-foreground">Pending Prayers</p>
                    </div>
                  </div>
                  {stats.pendingPrayerRequests > 0 && (
                    <p className="mt-2 text-xs font-medium text-amber-600 dark:text-amber-400">
                      Requires moderation
                    </p>
                  )}
                </Link>

                {/* System Status — fetched dynamically from /health */}
                <Link
                  to="/app/admin/health"
                  className="group relative rounded-lg border border-border/50 p-4 transition-all hover:border-emerald-200 hover:bg-emerald-50/50 hover:shadow-sm dark:hover:border-emerald-800/30 dark:hover:bg-emerald-950/20"
                >
                  <ArrowUpRight className="absolute right-3 top-3 h-3.5 w-3.5 text-muted-foreground/0 transition-all group-hover:text-emerald-400" />
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                        systemStatus === 'operational'
                          ? 'bg-emerald-500/10 group-hover:bg-emerald-500/20 dark:bg-emerald-400/10'
                          : systemStatus === 'degraded'
                            ? 'bg-amber-500/10 group-hover:bg-amber-500/20 dark:bg-amber-400/10'
                            : systemStatus === 'down'
                              ? 'bg-red-500/10 group-hover:bg-red-500/20 dark:bg-red-400/10'
                              : 'bg-muted/50'
                      }`}
                    >
                      <Shield
                        className={`h-5 w-5 ${
                          systemStatus === 'operational'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : systemStatus === 'degraded'
                              ? 'text-amber-600 dark:text-amber-400'
                              : systemStatus === 'down'
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-muted-foreground'
                        }`}
                      />
                    </div>
                    <div>
                      {systemStatus === 'loading' ? (
                        <>
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="mt-1 h-3 w-20" />
                        </>
                      ) : (
                        <>
                          <p
                            className={`text-sm font-semibold ${
                              systemStatus === 'operational'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : systemStatus === 'degraded'
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {systemStatus === 'operational'
                              ? 'All Systems Operational'
                              : systemStatus === 'degraded'
                                ? 'Degraded Performance'
                                : 'Service Disruption'}
                          </p>
                          <p className="text-xs text-muted-foreground">System Status</p>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
});
