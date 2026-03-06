/**
 * Activity Feed Widget
 *
 * Compact timeline showing recent community activity.
 */

import { memo } from 'react';
import { Activity, UserPlus, CalendarCheck, Megaphone, Heart } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';

interface ActivityItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
}

interface ActivityFeedWidgetProps {
  activities: ActivityItem[];
}

const entityIcons: Record<string, typeof Activity> = {
  member: UserPlus,
  event_rsvp: CalendarCheck,
  announcement: Megaphone,
  prayer_request: Heart,
};

const entityColors: Record<string, string> = {
  member: 'text-blue-600 dark:text-blue-400',
  event_rsvp: 'text-emerald-600 dark:text-emerald-400',
  announcement: 'text-amber-600 dark:text-amber-400',
  prayer_request: 'text-rose-600 dark:text-rose-400',
};

function formatAction(action: string, entityType: string): string {
  const actionMap: Record<string, string> = {
    CREATE_member: 'New member joined',
    CREATE_event_rsvp: 'New event RSVP',
    CREATE_announcement: 'New announcement posted',
    CREATE_prayer_request: 'New prayer request submitted',
    UPDATE_event: 'Event updated',
    CREATE_event: 'New event created',
    CREATE_message: 'New message sent',
  };
  return actionMap[`${action}_${entityType}`] || `${action} ${entityType}`;
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const ActivityFeedWidget = memo(function ActivityFeedWidget({
  activities = [],
}: ActivityFeedWidgetProps) {
  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-6 text-center">
            <div className="bg-primary/8 mb-3 flex h-12 w-12 items-center justify-center rounded-full dark:bg-primary/15">
              <Activity className="h-6 w-6 text-primary/50" />
            </div>
            <p className="text-sm font-medium text-foreground/70">Quiet right now</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Community activity will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-5 w-5 text-primary" />
          Activity Feed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          {activities.map((item, index) => {
            const Icon = entityIcons[item.entityType] || Activity;
            const color = entityColors[item.entityType] || 'text-muted-foreground';
            const timestamp = new Date(item.timestamp);
            const isLast = index === activities.length - 1;

            return (
              <div key={item.id} className="flex gap-3">
                {/* Timeline line + dot */}
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-muted ${color}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  {!isLast && <div className="w-px flex-1 bg-border" />}
                </div>
                {/* Content */}
                <div className={`pb-4 ${isLast ? 'pb-0' : ''}`}>
                  <p className="text-sm text-foreground">
                    {formatAction(item.action, item.entityType)}
                  </p>
                  <p className="text-xs text-muted-foreground">{getRelativeTime(timestamp)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
});
