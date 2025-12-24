/**
 * Engagement Metrics Component
 *
 * Displays member engagement statistics
 */

import { useMemo } from 'react';
import { Activity, MessageSquare, Calendar, Bell, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Progress } from '../../../components/ui/progress';
import { cn } from '../../../lib/utils';

interface EngagementData {
  // Activity metrics
  activeUsersLast7Days: number;
  activeUsersLast30Days: number;
  totalUsers: number;

  // Feature usage
  eventRsvps: number;
  messagesSent: number;
  announcementsViewed: number;
  profileUpdates: number;

  // Time-based
  averageSessionDuration: number; // minutes
  peakUsageHour: number;
  mostActiveDay: string;
}

interface EngagementMetricsProps {
  data: EngagementData;
}

export function EngagementMetrics({ data }: EngagementMetricsProps) {
  const weeklyEngagement = useMemo(() => {
    return data.totalUsers > 0
      ? Math.round((data.activeUsersLast7Days / data.totalUsers) * 100)
      : 0;
  }, [data]);

  const monthlyEngagement = useMemo(() => {
    return data.totalUsers > 0
      ? Math.round((data.activeUsersLast30Days / data.totalUsers) * 100)
      : 0;
  }, [data]);

  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h = hour % 12 || 12;
    return `${h}:00 ${ampm}`;
  };

  return (
    <div className="space-y-6">
      {/* Engagement Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Weekly Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold">{weeklyEngagement}%</span>
                <span className="mb-1 text-muted-foreground">of members active</span>
              </div>
              <Progress value={weeklyEngagement} className="h-3" />
              <div className="text-sm text-muted-foreground">
                {data.activeUsersLast7Days} out of {data.totalUsers} members
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold">{monthlyEngagement}%</span>
                <span className="mb-1 text-muted-foreground">of members active</span>
              </div>
              <Progress value={monthlyEngagement} className="h-3" />
              <div className="text-sm text-muted-foreground">
                {data.activeUsersLast30Days} out of {data.totalUsers} members
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Event RSVPs</span>
              </div>
              <div className="text-2xl font-bold">{data.eventRsvps}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm">Messages Sent</span>
              </div>
              <div className="text-2xl font-bold">{data.messagesSent}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Bell className="h-4 w-4" />
                <span className="text-sm">Announcements Viewed</span>
              </div>
              <div className="text-2xl font-bold">{data.announcementsViewed}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="text-sm">Profile Updates</span>
              </div>
              <div className="text-2xl font-bold">{data.profileUpdates}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Average Session Duration</div>
              <div className="text-2xl font-bold">{data.averageSessionDuration} min</div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Peak Usage Time</div>
              <div className="text-2xl font-bold">{formatHour(data.peakUsageHour)}</div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Most Active Day</div>
              <div className="text-2xl font-bold">{data.mostActiveDay}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Activity Heat Map
 */
interface ActivityHeatMapProps {
  data: { day: string; hour: number; count: number }[];
}

export function ActivityHeatMap({ data }: ActivityHeatMapProps) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const maxCount = useMemo(() => Math.max(...data.map((d) => d.count), 1), [data]);

  const getActivityLevel = (day: string, hour: number) => {
    const activity = data.find((d) => d.day === day && d.hour === hour);
    if (!activity) return 0;
    return activity.count / maxCount;
  };

  const getColor = (level: number) => {
    if (level === 0) return 'bg-muted';
    if (level < 0.25) return 'bg-primary/20';
    if (level < 0.5) return 'bg-primary/40';
    if (level < 0.75) return 'bg-primary/60';
    return 'bg-primary';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Heat Map</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Hour labels */}
            <div className="mb-2 ml-12 flex">
              {hours
                .filter((h) => h % 3 === 0)
                .map((hour) => (
                  <div key={hour} className="w-12 text-center text-xs text-muted-foreground">
                    {hour}:00
                  </div>
                ))}
            </div>

            {/* Grid */}
            {days.map((day) => (
              <div key={day} className="flex items-center gap-2">
                <div className="w-10 text-sm text-muted-foreground">{day}</div>
                <div className="flex gap-0.5">
                  {hours.map((hour) => {
                    const level = getActivityLevel(day, hour);
                    return (
                      <div
                        key={hour}
                        className={cn('h-4 w-4 rounded-sm transition-colors', getColor(level))}
                        title={`${day} ${hour}:00 - Activity: ${Math.round(level * 100)}%`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Legend */}
            <div className="mt-4 flex items-center justify-end gap-2 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-0.5">
                <div className="h-3 w-3 rounded-sm bg-muted" />
                <div className="h-3 w-3 rounded-sm bg-primary/20" />
                <div className="h-3 w-3 rounded-sm bg-primary/40" />
                <div className="h-3 w-3 rounded-sm bg-primary/60" />
                <div className="h-3 w-3 rounded-sm bg-primary" />
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
