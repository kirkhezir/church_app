/**
 * Admin Dashboard Section
 *
 * Collapsible admin-only section showing member stats,
 * pending prayer requests, and system overview.
 */

import { useState } from 'react';
import { memo } from 'react';
import { Shield, Users, Heart, ChevronDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../ui/collapsible';

interface AdminStats {
  totalMembers: number;
  newMembersThisMonth: number;
  pendingPrayerRequests: number;
}

interface AdminDashboardSectionProps {
  stats: AdminStats;
}

export const AdminDashboardSection = memo(function AdminDashboardSection({
  stats,
}: AdminDashboardSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-amber-200/50 dark:border-amber-800/30">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer select-none transition-colors hover:bg-accent/50">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-base">
                <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                Admin Overview
              </span>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {/* Total Members */}
              <div className="rounded-lg border border-border/50 p-4 transition-colors hover:bg-accent/30">
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
                  <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                    +{stats.newMembersThisMonth} new this month
                  </p>
                )}
              </div>

              {/* Pending Prayer Requests */}
              <div className="rounded-lg border border-border/50 p-4 transition-colors hover:bg-accent/30">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10 dark:bg-rose-400/10">
                    <Heart className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold tabular-nums">{stats.pendingPrayerRequests}</p>
                    <p className="text-xs text-muted-foreground">Pending Prayers</p>
                  </div>
                </div>
                {stats.pendingPrayerRequests > 0 && (
                  <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                    Requires moderation
                  </p>
                )}
              </div>

              {/* System Status */}
              <div className="rounded-lg border border-border/50 p-4 transition-colors hover:bg-accent/30">
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
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
});
