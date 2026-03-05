/**
 * Quick Actions Widget
 *
 * Visually distinct action tiles for common tasks.
 * Member actions use the app's public pages; admin actions link to management pages.
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
    gradient: 'from-blue-500 to-blue-600',
    glow: 'group-hover:shadow-blue-500/25',
    text: 'text-blue-50',
  },
  {
    label: 'Send Message',
    icon: MessageSquare,
    href: '/app/messages',
    gradient: 'from-purple-500 to-purple-600',
    glow: 'group-hover:shadow-purple-500/25',
    text: 'text-purple-50',
  },
  {
    label: 'View Sermons',
    icon: Video,
    href: '/sermons',
    gradient: 'from-amber-500 to-orange-500',
    glow: 'group-hover:shadow-amber-500/25',
    text: 'text-amber-50',
  },
  {
    label: 'Submit Prayer',
    icon: Heart,
    href: '/prayer',
    gradient: 'from-rose-500 to-pink-500',
    glow: 'group-hover:shadow-rose-500/25',
    text: 'text-rose-50',
  },
];

const adminActions = [
  {
    label: 'Create Event',
    icon: Plus,
    href: '/app/events/create',
    gradient: 'from-emerald-500 to-teal-500',
    glow: 'group-hover:shadow-emerald-500/25',
    text: 'text-emerald-50',
  },
  {
    label: 'Post Announcement',
    icon: Megaphone,
    href: '/app/admin/announcements',
    gradient: 'from-orange-500 to-red-500',
    glow: 'group-hover:shadow-orange-500/25',
    text: 'text-orange-50',
  },
  {
    label: 'Manage Members',
    icon: Users,
    href: '/app/admin/members',
    gradient: 'from-cyan-500 to-sky-500',
    glow: 'group-hover:shadow-cyan-500/25',
    text: 'text-cyan-50',
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
              className={`group flex flex-col items-center gap-2.5 rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${action.glow} bg-gradient-to-br ${action.gradient}`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm transition-transform duration-200 group-hover:scale-110">
                <action.icon className={`h-5 w-5 ${action.text}`} />
              </div>
              <span className={`text-center text-xs font-semibold ${action.text}`}>
                {action.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Admin actions (with subtle separator) */}
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
                  className={`group flex flex-col items-center gap-2.5 rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${action.glow} bg-gradient-to-br ${action.gradient}`}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm transition-transform duration-200 group-hover:scale-110">
                    <action.icon className={`h-5 w-5 ${action.text}`} />
                  </div>
                  <span className={`text-center text-xs font-semibold ${action.text}`}>
                    {action.label}
                  </span>
                </Link>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
});
