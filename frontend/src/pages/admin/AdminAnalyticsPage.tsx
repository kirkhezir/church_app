/**
 * AdminAnalyticsPage Component
 *
 * Displays analytics dashboard with member growth, attendance,
 * and engagement metrics for admins
 */

import { useState, useEffect } from 'react';
import { BarChart3, Users, Calendar, TrendingUp, RefreshCw, Download } from 'lucide-react';
import { SidebarLayout } from '../../components/layout';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Skeleton } from '../../components/ui/skeleton';
import { Alert, AlertDescription } from '../../components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  AttendanceChart,
  AttendanceSummary,
} from '../../components/features/analytics/AttendanceChart';
import {
  MemberGrowthChart,
  MemberDemographics,
} from '../../components/features/analytics/MemberGrowthChart';
import {
  EngagementMetrics,
  ActivityHeatMap,
} from '../../components/features/analytics/EngagementMetrics';

// Mock data for initial implementation
const mockAttendanceData = [
  { date: '2025-12-01', eventName: 'Sunday Worship', attendance: 145, capacity: 200 },
  { date: '2025-12-08', eventName: 'Sunday Worship', attendance: 158, capacity: 200 },
  { date: '2025-12-15', eventName: 'Sunday Worship', attendance: 162, capacity: 200 },
  { date: '2025-12-22', eventName: 'Sunday Worship', attendance: 189, capacity: 200 },
  { date: '2025-12-29', eventName: 'Sunday Worship', attendance: 134, capacity: 200 },
  { date: '2026-01-05', eventName: 'Sunday Worship', attendance: 171, capacity: 200 },
];

const mockGrowthData = [
  { month: '2025-08', newMembers: 8, totalMembers: 342, churnedMembers: 4 },
  { month: '2025-09', newMembers: 12, totalMembers: 352, churnedMembers: 3 },
  { month: '2025-10', newMembers: 6, totalMembers: 356, churnedMembers: 4 },
  { month: '2025-11', newMembers: 15, totalMembers: 369, churnedMembers: 2 },
  { month: '2025-12', newMembers: 11, totalMembers: 378, churnedMembers: 3 },
  { month: '2026-01', newMembers: 9, totalMembers: 385, churnedMembers: 3 },
];

const mockDemographics = [
  { label: 'Age 0-17', value: 52, color: '#3b82f6' },
  { label: 'Age 18-30', value: 78, color: '#22c55e' },
  { label: 'Age 31-45', value: 112, color: '#eab308' },
  { label: 'Age 46-60', value: 89, color: '#f97316' },
  { label: 'Age 61+', value: 54, color: '#a855f7' },
];

const mockEngagementData = {
  activeUsersLast7Days: 198,
  activeUsersLast30Days: 312,
  totalUsers: 385,
  eventRsvps: 89,
  messagesSent: 234,
  announcementsViewed: 1567,
  profileUpdates: 45,
  averageSessionDuration: 12,
  peakUsageHour: 10,
  mostActiveDay: 'Sunday',
};

const mockHeatMapData = [
  { day: 'Sun', hour: 9, count: 45 },
  { day: 'Sun', hour: 10, count: 89 },
  { day: 'Sun', hour: 11, count: 156 },
  { day: 'Sun', hour: 12, count: 78 },
  { day: 'Mon', hour: 19, count: 34 },
  { day: 'Wed', hour: 19, count: 67 },
  { day: 'Fri', hour: 18, count: 45 },
  { day: 'Sat', hour: 10, count: 23 },
];

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('6months');
  const [activeTab, setActiveTab] = useState('overview');

  // In a real implementation, this would fetch from the API
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        // In real implementation:
        // const response = await api.get('/api/v1/analytics/dashboard');
        setError(null);
      } catch (err: any) {
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting analytics data...');
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
              <div className="text-2xl font-bold">385</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">+9</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">160</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">+5%</span> vs last quarter
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">81%</div>
              <p className="text-xs text-muted-foreground">312 active in last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Events This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">89 total RSVPs</p>
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
                <AttendanceChart data={mockAttendanceData} />
                <MemberGrowthChart data={mockGrowthData} />
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <AttendanceSummary data={mockAttendanceData} />
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
              <AttendanceChart data={mockAttendanceData} />
              <AttendanceSummary data={mockAttendanceData} />
            </>
          )}
        </TabsContent>

        <TabsContent value="growth" className="space-y-6">
          {loading ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <>
              <MemberGrowthChart data={mockGrowthData} />
              <MemberDemographics data={mockDemographics} />
            </>
          )}
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          {loading ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <>
              <EngagementMetrics data={mockEngagementData} />
              <ActivityHeatMap data={mockHeatMapData} />
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <SidebarLayout breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Analytics' }]}>
      {content}
    </SidebarLayout>
  );
}
