/**
 * Member Dashboard Page (T097)
 *
 * Main dashboard view for authenticated members showing:
 * - Time-aware welcome banner with decorative pattern
 * - Quick stats with colored icon backgrounds
 * - Profile summary widget
 * - Upcoming events + announcements widgets
 *
 * Design System: design-system/pages/dashboard.md
 */

import { useState, useEffect, useMemo } from 'react';
import { Calendar, Bell, CheckCircle, Sparkles } from 'lucide-react';
import { SidebarLayout } from '@/components/layout';
import { reportError } from '@/lib/errorReporting';
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

/** Time-of-day greeting */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
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
        reportError('Failed to fetch dashboard', err);
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
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <AlertDescription className="text-red-800 dark:text-red-300">{error}</AlertDescription>
        </Alert>
      </SidebarLayout>
    );
  }

  if (!dashboard) {
    return null;
  }

  return (
    <SidebarLayout breadcrumbs={[{ label: 'Dashboard' }]}>
      {/* Welcome Header — warm gradient with decorative pattern */}
      <Card className="animate-fade-in-up relative overflow-hidden border-0 shadow-lg">
        {/* Animated gradient background */}
        <div className="animate-gradient absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 dark:from-blue-700 dark:via-indigo-800 dark:to-slate-900" />
        {/* Decorative dot pattern overlay */}
        <div className="dot-pattern absolute inset-0 text-white opacity-[0.06]" />
        {/* Decorative shimmer streak */}
        <div className="animate-shimmer absolute inset-0" />
        {/* Floating decorative circle */}
        <div className="animate-float absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/[0.06]" />
        <div
          className="animate-float absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-white/[0.04]"
          style={{ animationDelay: '1s' }}
        />

        <CardContent className="relative z-10 p-6 sm:p-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="mb-1 flex items-center gap-2 text-sm font-medium text-white/70">
                <Sparkles className="h-4 w-4" />
                <span>{getGreeting()}</span>
              </p>
              <h1 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {dashboard.profile.firstName}
              </h1>
              <p className="mt-2 max-w-md text-sm text-white/60">
                Here&apos;s what&apos;s happening in your church community today
              </p>
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-white/60">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview — colored accent cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="animate-fade-in-up stagger-1 card-hover-lift accent-top group overflow-hidden [--accent-color:hsl(222,70%,55%)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming Events
            </CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 transition-colors group-hover:bg-blue-500/20 dark:bg-blue-400/10 dark:text-blue-400">
              <Calendar className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="animate-number-pop text-3xl font-bold tabular-nums tracking-tight">
              {dashboard.stats.upcomingEventsCount}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">this week</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up stagger-2 card-hover-lift accent-top group overflow-hidden [--accent-color:hsl(38,92%,50%)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unread Announcements
            </CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 transition-colors group-hover:bg-amber-500/20 dark:bg-amber-400/10 dark:text-amber-400">
              <Bell className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div
              className="animate-number-pop text-3xl font-bold tabular-nums tracking-tight"
              style={{ animationDelay: '0.1s' }}
            >
              {dashboard.stats.unreadAnnouncementsCount}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">to review</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up stagger-3 card-hover-lift accent-top group overflow-hidden [--accent-color:hsl(142,71%,45%)]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">My RSVPs</CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 transition-colors group-hover:bg-emerald-500/20 dark:bg-emerald-400/10 dark:text-emerald-400">
              <CheckCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div
              className="animate-number-pop text-3xl font-bold tabular-nums tracking-tight"
              style={{ animationDelay: '0.2s' }}
            >
              {dashboard.stats.myRsvpCount}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">confirmed</p>
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
