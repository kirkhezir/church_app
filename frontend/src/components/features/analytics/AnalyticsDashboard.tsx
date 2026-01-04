/**
 * Analytics Dashboard Component
 *
 * Comprehensive analytics dashboard with charts and KPIs
 */

import { useMemo } from 'react';
import {
  Users,
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  UserPlus,
  Clock,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';

interface AnalyticsData {
  totalMembers: number;
  memberGrowth: number;
  activeMembers: number;
  newMembersThisMonth: number;
  totalEvents: number;
  upcomingEvents: number;
  averageAttendance: number;
  attendanceGrowth: number;
  engagementRate: number;
  messagesSent: number;
  announcementsViewed: number;
  rsvpRate: number;
}

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
}

function KPICard({ title, value, change, icon, trend, subtitle }: KPICardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-lg bg-primary/10 p-2 text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(change !== undefined || subtitle) && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {change !== undefined && (
              <span
                className={`flex items-center gap-1 ${
                  trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : ''
                }`}
              >
                {trend === 'up' && <TrendingUp className="h-3 w-3" />}
                {trend === 'down' && <TrendingDown className="h-3 w-3" />}
                {change > 0 ? '+' : ''}
                {change}%
              </span>
            )}
            {subtitle && <span>{subtitle}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface AnalyticsDashboardProps {
  data: AnalyticsData;
  isLoading?: boolean;
}

export function AnalyticsDashboard({ data, isLoading }: AnalyticsDashboardProps) {
  const kpis = useMemo(
    () => [
      {
        title: 'Total Members',
        value: data.totalMembers,
        change: data.memberGrowth,
        icon: <Users className="h-4 w-4" />,
        trend: data.memberGrowth > 0 ? 'up' : data.memberGrowth < 0 ? 'down' : 'neutral',
        subtitle: 'from last month',
      },
      {
        title: 'Active Members',
        value: data.activeMembers,
        icon: <Activity className="h-4 w-4" />,
        subtitle: `${Math.round((data.activeMembers / data.totalMembers) * 100)}% of total`,
      },
      {
        title: 'New This Month',
        value: data.newMembersThisMonth,
        icon: <UserPlus className="h-4 w-4" />,
        subtitle: 'new members',
      },
      {
        title: 'Upcoming Events',
        value: data.upcomingEvents,
        icon: <Calendar className="h-4 w-4" />,
        subtitle: 'scheduled',
      },
      {
        title: 'Avg. Attendance',
        value: data.averageAttendance,
        change: data.attendanceGrowth,
        icon: <BarChart3 className="h-4 w-4" />,
        trend: data.attendanceGrowth > 0 ? 'up' : data.attendanceGrowth < 0 ? 'down' : 'neutral',
        subtitle: 'per event',
      },
      {
        title: 'Engagement Rate',
        value: `${data.engagementRate}%`,
        icon: <TrendingUp className="h-4 w-4" />,
        subtitle: 'member activity',
      },
      {
        title: 'RSVP Rate',
        value: `${data.rsvpRate}%`,
        icon: <Clock className="h-4 w-4" />,
        subtitle: 'event responses',
      },
      {
        title: 'Messages Sent',
        value: data.messagesSent,
        icon: <Activity className="h-4 w-4" />,
        subtitle: 'this month',
      },
    ],
    [data]
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 w-24 rounded bg-muted" />
                <div className="h-8 w-16 rounded bg-muted" />
                <div className="h-3 w-20 rounded bg-muted" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <KPICard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            icon={kpi.icon}
            trend={kpi.trend as 'up' | 'down' | 'neutral'}
            subtitle={kpi.subtitle}
          />
        ))}
      </div>
    </div>
  );
}
