/**
 * AdminAnalyticsPage Component
 *
 * Displays analytics dashboard with member growth, attendance,
 * and engagement metrics for admins
 */

import { useState, useEffect, useCallback } from 'react';
import { BarChart3, Users, Calendar, TrendingUp, RefreshCw, Download } from 'lucide-react';
import { SidebarLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AttendanceChart,
  AttendanceSummary,
} from '@/components/features/analytics/AttendanceChart';
import {
  MemberGrowthChart,
  MemberDemographics,
} from '@/components/features/analytics/MemberGrowthChart';
import {
  EngagementMetrics,
  ActivityHeatMap,
} from '@/components/features/analytics/EngagementMetrics';
import {
  analyticsService,
  DashboardOverview,
  MemberGrowthData,
  AttendanceData,
  EngagementData,
  HeatMapEntry,
} from '@/services/endpoints/analyticsService';

// Fallback heatmap data used only when the backend returns no activity data
const fallbackHeatMapData: HeatMapEntry[] = [{ day: 'Sun', hour: 10, count: 0 }];

// Mock demographics since backend doesn't have age data
const mockDemographics = [
  { label: 'Age 0-17', value: 52, color: '#3b82f6' },
  { label: 'Age 18-30', value: 78, color: '#22c55e' },
  { label: 'Age 31-45', value: 112, color: '#eab308' },
  { label: 'Age 46-60', value: 89, color: '#f97316' },
  { label: 'Age 61+', value: 54, color: '#a855f7' },
];

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('6months');
  const [activeTab, setActiveTab] = useState('overview');

  // Analytics data state
  const [dashboard, setDashboard] = useState<DashboardOverview | null>(null);
  const [growthData, setGrowthData] = useState<MemberGrowthData[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
  const [engagementData, setEngagementData] = useState<EngagementData | null>(null);

  const getMonthsFromRange = (range: string): number => {
    switch (range) {
      case '1month':
        return 1;
      case '3months':
        return 3;
      case '6months':
        return 6;
      case '1year':
        return 12;
      default:
        return 6;
    }
  };

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const months = getMonthsFromRange(timeRange);

      const [dashboardRes, growthRes, attendanceRes, engagementRes] = await Promise.all([
        analyticsService.getDashboard(),
        analyticsService.getMemberGrowth(months),
        analyticsService.getAttendance(8),
        analyticsService.getEngagement(),
      ]);

      setDashboard(dashboardRes);
      setGrowthData(growthRes);
      setAttendanceData(attendanceRes.attendance);
      setEngagementData(engagementRes);
    } catch (err: unknown) {
      console.error('Failed to fetch analytics:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleRefresh = () => {
    fetchAnalytics();
  };

  const handleExport = () => {
    // Create CSV content
    const csvContent = [
      'Metric,Value',
      `Total Members,${dashboard?.totalMembers || 0}`,
      `New Members This Month,${dashboard?.newMembersThisMonth || 0}`,
      `Active Users,${dashboard?.activeUsers || 0}`,
      `Active Users %,${dashboard?.activeUsersPercentage || 0}%`,
      `Upcoming Events,${dashboard?.upcomingEvents || 0}`,
      `Total RSVPs,${dashboard?.totalRsvps || 0}`,
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Transform data for charts
  const chartAttendanceData = attendanceData.map((d) => ({
    date: d.date,
    eventName: d.eventTitle,
    attendance: d.attendance,
    capacity: d.capacity,
  }));

  const chartGrowthData = growthData.map((d) => ({
    month: d.month,
    newMembers: d.newMembers,
    totalMembers: d.totalMembers,
    churnedMembers: d.churnedMembers,
  }));

  const chartEngagementData = engagementData
    ? {
        ...engagementData,
        profileUpdates: 0, // Not tracked in backend yet
      }
    : {
        activeUsersLast7Days: 0,
        activeUsersLast30Days: 0,
        totalUsers: 0,
        eventRsvps: 0,
        messagesSent: 0,
        announcementsViewed: 0,
        profileUpdates: 0,
        averageSessionDuration: 0,
        peakUsageHour: 0,
        mostActiveDay: 'Sunday',
      };

  const content = (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <BarChart3 className="h-8 w-8" />
            Analytics Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground">
            Track church growth, attendance, and member engagement
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>

          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Quick Stats */}
      {loading ? (
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard?.totalMembers || 0}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">+{dashboard?.newMembersThisMonth || 0}</span> from
                last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {attendanceData.length > 0
                  ? Math.round(
                      attendanceData.reduce((sum, d) => sum + d.attendance, 0) /
                        attendanceData.length
                    )
                  : 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Based on {attendanceData.length} recent events
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard?.activeUsersPercentage || 0}%</div>
              <p className="text-xs text-muted-foreground">
                {dashboard?.activeUsers || 0} active in last 30 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Events This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard?.upcomingEvents || 0}</div>
              <p className="text-xs text-muted-foreground">
                {dashboard?.totalRsvps || 0} total RSVPs
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="growth">Member Growth</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-80 w-full" />
              <Skeleton className="h-80 w-full" />
            </div>
          ) : (
            <>
              <div className="grid gap-6 lg:grid-cols-2">
                <AttendanceChart data={chartAttendanceData} />
                <MemberGrowthChart data={chartGrowthData} />
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <AttendanceSummary data={chartAttendanceData} />
                <MemberDemographics data={mockDemographics} />
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          {loading ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <>
              <AttendanceChart data={chartAttendanceData} />
              <AttendanceSummary data={chartAttendanceData} />
            </>
          )}
        </TabsContent>

        <TabsContent value="growth" className="space-y-6">
          {loading ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <>
              <MemberGrowthChart data={chartGrowthData} />
              <MemberDemographics data={mockDemographics} />
            </>
          )}
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          {loading ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <>
              <EngagementMetrics data={chartEngagementData} />
              <ActivityHeatMap
                data={
                  engagementData?.heatmapData?.length
                    ? engagementData.heatmapData
                    : fallbackHeatMapData
                }
              />
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <SidebarLayout breadcrumbs={[{ label: 'Admin', href: '/app/admin' }, { label: 'Analytics' }]}>
      {content}
    </SidebarLayout>
  );
}
