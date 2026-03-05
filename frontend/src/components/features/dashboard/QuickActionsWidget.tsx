/**
 * Quick Actions Widget
 *
 * Grid of icon+label action buttons for common tasks.
 * Shows admin-specific actions when user has ADMIN/STAFF role.
 */

import { Link } from 'react-router';
import { memo } from 'react';
import { Calendar, MessageSquare, Video, Heart, Plus, Megaphone, Users, Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';

interface QuickActionsWidgetProps {
  role: string;
}

const memberActions = [
  {
    label: 'Browse Events',
    icon: Calendar,
    href: '/app/events',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500/10 dark:bg-blue-400/10',
  },
  {
    label: 'Send Message',
    icon: MessageSquare,
    href: '/app/messages',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-500/10 dark:bg-purple-400/10',
  },
  {
    label: 'View Sermons',
    icon: Video,
    href: '/app/sermons',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10 dark:bg-amber-400/10',
  },
  {
    label: 'Submit Prayer',
    icon: Heart,
    href: '/app/prayer',
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-500/10 dark:bg-rose-400/10',
  },
];

const adminActions = [
  {
    label: 'Create Event',
    icon: Plus,
    href: '/app/admin/events',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10 dark:bg-emerald-400/10',
  },
  {
    label: 'Post Announcement',
    icon: Megaphone,
    href: '/app/admin/announcements',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-500/10 dark:bg-orange-400/10',
  },
  {
    label: 'Manage Members',
    icon: Users,
    href: '/app/admin/members',
    color: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-500/10 dark:bg-cyan-400/10',
  },
];

export const QuickActionsWidget = memo(function QuickActionsWidget({
  role,
}: QuickActionsWidgetProps) {
  const isAdmin = role === 'ADMIN' || role === 'STAFF';
  const actions = isAdmin ? [...memberActions, ...adminActions] : memberActions;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="h-5 w-5 text-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-4">
          {actions.map((action) => (
            <Link
              key={action.label}
              to={action.href}
              className="group flex flex-col items-center gap-2 rounded-xl border border-border/50 p-3 transition-all duration-200 hover:-translate-y-px hover:border-primary/20 hover:bg-accent/50 hover:shadow-sm"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.bg} transition-colors group-hover:scale-110`}
              >
                <action.icon className={`h-5 w-5 ${action.color}`} />
              </div>
              <span className="text-center text-xs font-medium text-muted-foreground group-hover:text-foreground">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});
