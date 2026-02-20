/**
 * Member Dashboard Page (T097)
 *
 * Main dashboard view for authenticated members showing:
 * - Welcome banner with greeting
 * - Quick stats (events, announcements, RSVPs) in shadcn Cards
 * - Profile summary widget
 * - Upcoming events + announcements widgets
 *
 * Design System: design-system/pages/dashboard.md
 */

import { useState, useEffect } from 'react';
import { Calendar, Bell, CheckCircle } from 'lucide-react';
import { SidebarLayout } from '@/components/layout';
import { ProfileSummary } from '@/components/features/dashboard/ProfileSummary';
import { UpcomingEventsWidget } from '@/components/features/dashboard/UpcomingEventsWidget';
import { RecentAnnouncementsWidget } from '@/components/features/dashboard/RecentAnnouncementsWidget';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import apiClient from '@/services/api/apiClient';

interface DashboardData {
  profile: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    membershipDate: string;
    phone?: string;
  };
  upcomingEvents: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    startDate: string;
    endDate: string;
    location: string;
    rsvpStatus?: string;
  }>;
  recentAnnouncements: Array<{
    id: string;
    title: string;
    content: string;
    priority: string;
    publishedAt: string;
    isRead: boolean;
  }>;
  stats: {
    upcomingEventsCount: number;
    unreadAnnouncementsCount: number;
    myRsvpCount: number;
  };
}

export default function MemberDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get('/members/dashboard');
        setDashboard(response as unknown as DashboardData);
      } catch (err) {
        console.error('Failed to fetch dashboard:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <SidebarLayout breadcrumbs={[{ label: 'Dashboard' }]}>
        <div className="space-y-6">
          {/* Welcome header skeleton */}
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="mt-2 h-4 w-80" />
            </CardContent>
          </Card>
          {/* Stats skeleton */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-12" />
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Widgets skeleton */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <Skeleton className="mx-auto h-20 w-20 rounded-full" />
                <Skeleton className="mx-auto mt-4 h-5 w-32" />
                <Skeleton className="mx-auto mt-2 h-4 w-24" />
              </CardContent>
            </Card>
            <div className="space-y-4 lg:col-span-2">
              <Card>
                <CardContent className="space-y-3 p-6">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (error) {
    return (
      <SidebarLayout breadcrumbs={[{ label: 'Dashboard' }]}>
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      </SidebarLayout>
    );
  }

  if (!dashboard) {
    return null;
  }

  return (
    <SidebarLayout breadcrumbs={[{ label: 'Dashboard' }]}>
      {/* Welcome Header */}
      <Card className="animate-fade-in-up border-0 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg">
        <CardContent className="p-6">
          <h1 className="text-balance text-3xl font-bold">
            Welcome back, {dashboard.profile.firstName}!
          </h1>
          <p className="mt-1 text-sm text-primary-foreground/70">
            Here&apos;s what&apos;s happening in your church community
          </p>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="animate-fade-in-up stagger-1 transition-shadow duration-200 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming Events
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums tracking-tight">
              {dashboard.stats.upcomingEventsCount}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up stagger-2 transition-shadow duration-200 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unread Announcements
            </CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums tracking-tight">
              {dashboard.stats.unreadAnnouncementsCount}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up stagger-3 transition-shadow duration-200 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">My RSVPs</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums tracking-tight">
              {dashboard.stats.myRsvpCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Widgets */}
      <div className="animate-fade-in-up stagger-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Profile Summary - Left Column */}
        <div className="lg:col-span-1">
          <ProfileSummary profile={dashboard.profile} />
        </div>

        {/* Events and Announcements - Right Columns */}
        <div className="space-y-4 lg:col-span-2">
          <UpcomingEventsWidget events={dashboard.upcomingEvents} />
          <RecentAnnouncementsWidget announcements={dashboard.recentAnnouncements} />
        </div>
      </div>
    </SidebarLayout>
  );
}
