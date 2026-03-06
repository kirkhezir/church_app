/**
 * Quick Actions Widget
 *
 * Compact, church-appropriate action tiles for common tasks.
 * Uses subtle tinted cards instead of garish full-coverage gradients.
 */

import { Link } from 'react-router';
import { memo } from 'react';
import {
  Calendar,
  MessageSquare,
  Video,
  Heart,
  Plus,
  Megaphone,
  Users,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';

interface QuickActionsWidgetProps {
  role: string;
}

const memberActions = [
  {
    label: 'Browse Events',
    description: 'Upcoming services',
    icon: Calendar,
    href: '/app/events',
    iconBg: 'bg-blue-100 dark:bg-blue-900/50',
    iconColor: 'text-blue-600 dark:text-blue-400',
    hover:
      'hover:border-blue-200 hover:bg-blue-50/70 dark:hover:border-blue-800/60 dark:hover:bg-blue-950/30',
  },
  {
    label: 'Send Message',
    description: 'Contact a member',
    icon: MessageSquare,
    href: '/app/messages',
    iconBg: 'bg-violet-100 dark:bg-violet-900/50',
    iconColor: 'text-violet-600 dark:text-violet-400',
    hover:
      'hover:border-violet-200 hover:bg-violet-50/70 dark:hover:border-violet-800/60 dark:hover:bg-violet-950/30',
  },
  {
    label: 'View Sermons',
    description: 'Messages & media',
    icon: Video,
    href: '/sermons',
    iconBg: 'bg-amber-100 dark:bg-amber-900/50',
    iconColor: 'text-amber-600 dark:text-amber-400',
    hover:
      'hover:border-amber-200 hover:bg-amber-50/70 dark:hover:border-amber-800/60 dark:hover:bg-amber-950/30',
  },
  {
    label: 'Submit Prayer',
    description: 'Share your request',
    icon: Heart,
    href: '/prayer',
    iconBg: 'bg-rose-100 dark:bg-rose-900/50',
    iconColor: 'text-rose-600 dark:text-rose-400',
    hover:
      'hover:border-rose-200 hover:bg-rose-50/70 dark:hover:border-rose-800/60 dark:hover:bg-rose-950/30',
  },
];

const adminActions = [
  {
    label: 'Create Event',
    icon: Plus,
    href: '/app/events/create',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconColor: 'text-emerald-700 dark:text-emerald-400',
    hover:
      'hover:border-emerald-200 hover:bg-emerald-50/70 dark:hover:border-emerald-800/50 dark:hover:bg-emerald-950/20',
  },
  {
    label: 'Post Announcement',
    icon: Megaphone,
    href: '/app/admin/announcements',
    iconBg: 'bg-orange-100 dark:bg-orange-900/40',
    iconColor: 'text-orange-700 dark:text-orange-400',
    hover:
      'hover:border-orange-200 hover:bg-orange-50/70 dark:hover:border-orange-800/50 dark:hover:bg-orange-950/20',
  },
  {
    label: 'Manage Members',
    icon: Users,
    href: '/app/admin/members',
    iconBg: 'bg-slate-100 dark:bg-slate-800/60',
    iconColor: 'text-slate-600 dark:text-slate-400',
    hover:
      'hover:border-slate-200 hover:bg-slate-50/70 dark:hover:border-slate-700/60 dark:hover:bg-slate-800/40',
  },
];

export const QuickActionsWidget = memo(function QuickActionsWidget({
  role,
}: QuickActionsWidgetProps) {
  const isAdmin = role === 'ADMIN' || role === 'STAFF';

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="h-5 w-5 text-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Member actions */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {memberActions.map((action) => (
            <Link
              key={action.label}
              to={action.href}
              className={`group flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3 transition-all duration-200 hover:-translate-y-px hover:shadow-sm ${action.hover}`}
            >
              <div
                className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${action.iconBg} transition-transform duration-200 group-hover:scale-105`}
              >
                <action.icon className={`h-4.5 w-4.5 ${action.iconColor}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-foreground">{action.label}</p>
                <p className="truncate text-[11px] text-muted-foreground">{action.description}</p>
              </div>
              <ArrowRight className="hidden h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/40 transition-opacity group-hover:text-muted-foreground/70 sm:block" />
            </Link>
          ))}
        </div>

        {/* Admin actions */}
        {isAdmin && (
          <>
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-border/60" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Admin
              </span>
              <div className="h-px flex-1 bg-border/60" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {adminActions.map((action) => (
                <Link
                  key={action.label}
                  to={action.href}
                  className={`group flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-card p-3 text-center transition-all duration-200 hover:-translate-y-px hover:shadow-sm ${action.hover}`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${action.iconBg} transition-transform duration-200 group-hover:scale-105`}
                  >
                    <action.icon className={`h-4 w-4 ${action.iconColor}`} />
                  </div>
                  <p className="line-clamp-2 text-xs font-semibold leading-tight text-foreground">
                    {action.label}
                  </p>
                </Link>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
});
