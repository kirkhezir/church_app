/**
 * Admin Dashboard Section
 *
 * Collapsible admin-only section showing member stats,
 * pending prayer requests, and system overview.
 */

import { useState } from 'react';
import { memo } from 'react';
import { Shield, Users, Heart, ChevronDown, BarChart2, Eye } from 'lucide-react';
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

export const AdminDashboardSection = memo(function AdminDashboardSection({
  stats,
}: AdminDashboardSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const loading = !stats;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
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
                  className="rounded-lg border border-border/50 p-4 transition-all hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-sm dark:hover:border-blue-800/30 dark:hover:bg-blue-950/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 dark:bg-blue-400/10">
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
                  className="rounded-lg border border-border/50 p-4 transition-all hover:border-rose-200 hover:bg-rose-50/50 hover:shadow-sm dark:hover:border-rose-800/30 dark:hover:bg-rose-950/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10 dark:bg-rose-400/10">
                      <Heart className="h-5 w-5 text-rose-600 dark:text-rose-400" />
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

                {/* System Status */}
                <Link
                  to="/app/admin/health"
                  className="rounded-lg border border-border/50 p-4 transition-all hover:border-emerald-200 hover:bg-emerald-50/50 hover:shadow-sm dark:hover:border-emerald-800/30 dark:hover:bg-emerald-950/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 dark:bg-emerald-400/10">
                      <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        All Systems Operational
                      </p>
                      <p className="text-xs text-muted-foreground">System Status</p>
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
