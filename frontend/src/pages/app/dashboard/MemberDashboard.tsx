/**
 * Member Dashboard Page (T097)
 *
 * Main dashboard view for authenticated members showing:
 * - Time-aware welcome banner with decorative pattern
 * - Quick stats with colored icon backgrounds
 * - Quick actions grid
 * - Messages, content, and prayer widgets
 * - Activity feed and birthdays
 * - Profile summary widget
 * - Upcoming events + announcements widgets
 * - Admin overview section (admin/staff only)
 *
 * Design System: design-system/pages/dashboard.md
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Calendar, Bell, CheckCircle, Sparkles, MessageSquare, HeartHandshake } from 'lucide-react';
import { SidebarLayout } from '@/components/layout';
import { reportError } from '@/lib/errorReporting';
import { useNotificationCounts } from '@/hooks/useNotificationCounts';

import { UpcomingEventsWidget } from '@/components/features/dashboard/UpcomingEventsWidget';
import { RecentAnnouncementsWidget } from '@/components/features/dashboard/RecentAnnouncementsWidget';
import { QuickActionsWidget } from '@/components/features/dashboard/QuickActionsWidget';
import { UnreadMessagesWidget } from '@/components/features/dashboard/UnreadMessagesWidget';
import { LatestContentWidget } from '@/components/features/dashboard/LatestContentWidget';
import { PrayerRequestsWidget } from '@/components/features/dashboard/PrayerRequestsWidget';
import { BirthdayCelebrationWidget } from '@/components/features/dashboard/BirthdayCelebrationWidget';
import { BibleVerseWidget } from '@/components/features/dashboard/BibleVerseWidget';
import { ActivityFeedWidget } from '@/components/features/dashboard/ActivityFeedWidget';
import { AdminDashboardSection } from '@/components/features/dashboard/AdminDashboardSection';
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
    unreadMessagesCount: number;
    prayerRequestsCount: number;
  };
  recentMessages: Array<{
    id: string;
    senderId: string;
    subject: string;
    sentAt: string;
    isRead: boolean;
  }>;
  recentSermon: {
    id: string;
    title: string;
    speaker: string;
    date: string;
    thumbnailUrl?: string;
    youtubeUrl?: string;
  } | null;
  recentBlogPost: {
    id: string;
    title: string;
    excerpt: string;
    slug: string;
    publishedAt: string;
    thumbnailUrl?: string;
  } | null;
  recentPrayerRequests: Array<{
    id: string;
    name: string;
    category: string;
    request: string;
    isAnonymous: boolean;
    prayerCount: number;
    createdAt: string;
  }>;
  birthdayMembers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
  }>;
  activityFeed: Array<{
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    timestamp: string;
  }>;
  adminStats?: {
    totalMembers: number;
    newMembersThisMonth: number;
    pendingPrayerRequests: number;
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
  const { refresh: refreshNotifications } = useNotificationCounts();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get('/members/dashboard');
        setDashboard(response as unknown as DashboardData);
        // Ensure bell counts are in sync with freshly loaded dashboard data
        refreshNotifications();
      } catch (err) {
        reportError('Failed to fetch dashboard', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [refreshNotifications]);

  if (loading) {
    return (
      <SidebarLayout breadcrumbs={[{ label: 'Home' }]}>
        <div className="space-y-6">
          {/* Welcome header skeleton */}
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="mt-2 h-4 w-80" />
            </CardContent>
          </Card>
          {/* Stats skeleton */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
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
          {/* Quick actions skeleton */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
              </div>
            </CardContent>
          </Card>
          {/* Widgets skeleton */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="space-y-3 p-6">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (error) {
    return (
      <SidebarLayout breadcrumbs={[{ label: 'Home' }]}>
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <AlertDescription className="text-red-800 dark:text-red-300">{error}</AlertDescription>
        </Alert>
      </SidebarLayout>
    );
  }

  if (!dashboard) {
    return null;
  }

  const isAdmin = dashboard.profile.role === 'ADMIN' || dashboard.profile.role === 'STAFF';

  return (
    <SidebarLayout breadcrumbs={[{ label: 'Home' }]}>
      {/* Welcome Header — warm gradient with decorative pattern */}
      <Card className="animate-fade-in-up relative overflow-hidden border-0 shadow-xl">
        {/* Animated gradient background */}
        <div className="motion-safe:animate-gradient absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 dark:from-blue-900 dark:via-blue-800 dark:to-indigo-900" />
        {/* Decorative dot pattern overlay */}
        <div className="dot-pattern absolute inset-0 text-white opacity-[0.06]" />
        {/* Decorative shimmer streak */}
        <div className="absolute inset-0 motion-safe:animate-shimmer" />
        {/* Floating decorative circles */}
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/[0.06] motion-safe:animate-float" />
        <div className="absolute -bottom-6 left-1/3 h-24 w-24 rounded-full bg-white/[0.04] [animation-delay:1.2s] motion-safe:animate-float" />
        <div className="absolute right-1/4 top-1/2 h-14 w-14 rounded-full bg-white/[0.03] [animation-delay:0.7s] motion-safe:animate-float" />

        <CardContent className="relative z-10 p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            {/* Left side: avatar + user info */}
            <div className="flex min-w-0 items-start gap-4">
              {/* Avatar with initials */}
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-white/15 text-sm font-bold text-white ring-2 ring-white/25 backdrop-blur-sm sm:h-14 sm:w-14 sm:text-lg"
                aria-hidden="true"
              >
                {dashboard.profile.firstName[0]}
                {dashboard.profile.lastName?.[0] ?? ''}
              </div>

              <div className="min-w-0">
                {/* Greeting line */}
                <p className="mb-0.5 flex items-center gap-1.5 text-sm font-medium text-white/70">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{getGreeting()}</span>
                </p>
                {/* Full name */}
                <h1 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  {dashboard.profile.firstName} {dashboard.profile.lastName}
                </h1>
                <p className="mt-1.5 text-sm text-white/65">
                  Welcome back to Sing Buri Adventist Center
                </p>
                {/* Badges row */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold text-white/95 backdrop-blur-sm">
                    {dashboard.profile.role.charAt(0) +
                      dashboard.profile.role.slice(1).toLowerCase()}
                  </span>
                  {dashboard.profile.membershipDate && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white/75">
                      <Calendar className="h-3 w-3" />
                      Member since {new Date(dashboard.profile.membershipDate).getFullYear()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right side: prominent date display */}
            <div className="hidden flex-shrink-0 text-right sm:block">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/50">
                Today
              </p>
              <p className="mt-0.5 text-sm font-medium text-white/70">
                {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
              </p>
              <p className="text-3xl font-bold tabular-nums leading-tight text-white">
                {new Date().toLocaleDateString('en-US', { day: 'numeric' })}
              </p>
              <p className="text-sm font-semibold text-white/80">
                {new Date().toLocaleDateString('en-US', { month: 'long' })}
              </p>
              <p className="mt-0.5 text-xs text-white/45">{new Date().getFullYear()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview — 5 colored accent cards, each linking to the relevant page */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 [&>*:last-child]:col-span-2 sm:[&>*:last-child]:col-span-1">
        <Link to="/app/events" className="group block">
          <Card className="animate-fade-in-up stagger-1 card-hover-lift accent-top h-full cursor-pointer overflow-hidden transition-shadow [--accent-color:hsl(222,70%,55%)] hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Upcoming Events
              </CardTitle>
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 transition-colors group-hover:bg-blue-500/20 dark:bg-blue-400/10 dark:text-blue-400"
                aria-hidden="true"
              >
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
        </Link>

        <Link to="/app/announcements" className="group block">
          <Card className="animate-fade-in-up stagger-2 card-hover-lift accent-top h-full cursor-pointer overflow-hidden transition-shadow [--accent-color:hsl(38,92%,50%)] hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Announcements
              </CardTitle>
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 transition-colors group-hover:bg-amber-500/20 dark:bg-amber-400/10 dark:text-amber-400"
                aria-hidden="true"
              >
                <Bell className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="animate-number-pop text-3xl font-bold tabular-nums tracking-tight [animation-delay:0.1s]">
                {dashboard.stats.unreadAnnouncementsCount}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">unread</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/app/events" className="group block">
          <Card className="animate-fade-in-up stagger-3 card-hover-lift accent-top h-full cursor-pointer overflow-hidden transition-shadow [--accent-color:hsl(142,71%,45%)] hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">My RSVPs</CardTitle>
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 transition-colors group-hover:bg-emerald-500/20 dark:bg-emerald-400/10 dark:text-emerald-400"
                aria-hidden="true"
              >
                <CheckCircle className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="animate-number-pop text-3xl font-bold tabular-nums tracking-tight [animation-delay:0.2s]">
                {dashboard.stats.myRsvpCount}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">confirmed</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/app/messages" className="group block">
          <Card className="animate-fade-in-up stagger-4 card-hover-lift accent-top h-full cursor-pointer overflow-hidden transition-shadow [--accent-color:hsl(270,70%,55%)] hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Messages</CardTitle>
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 transition-colors group-hover:bg-purple-500/20 dark:bg-purple-400/10 dark:text-purple-400"
                aria-hidden="true"
              >
                <MessageSquare className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="animate-number-pop text-3xl font-bold tabular-nums tracking-tight [animation-delay:0.3s]">
                {dashboard.stats.unreadMessagesCount ?? 0}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">unread</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/app/prayer" className="group block">
          <Card className="animate-fade-in-up stagger-5 card-hover-lift accent-top h-full cursor-pointer overflow-hidden transition-shadow [--accent-color:hsl(350,70%,55%)] hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Prayer Requests
              </CardTitle>
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 transition-colors group-hover:bg-rose-500/20 dark:bg-rose-400/10 dark:text-rose-400"
                aria-hidden="true"
              >
                <HeartHandshake className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="animate-number-pop text-3xl font-bold tabular-nums tracking-tight [animation-delay:0.4s]">
                {dashboard.stats.prayerRequestsCount ?? 0}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">active</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="animate-fade-in-up stagger-6">
        <QuickActionsWidget role={dashboard.profile.role} />
      </div>

      {/* ─── Stay Connected ─────────────────────────────────────────── */}
      <section aria-labelledby="stay-connected-heading">
        <div className="flex items-center gap-3 pt-1">
          <div className="h-px flex-1 bg-border/50" />
          <h2
            id="stay-connected-heading"
            className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70"
          >
            Stay Connected
          </h2>
          <div className="h-px flex-1 bg-border/50" />
        </div>

        {/* Content Widgets Row: Messages | Latest Content | Prayer Requests */}
        <div className="animate-fade-in-up stagger-7 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <UnreadMessagesWidget
            messages={dashboard.recentMessages ?? []}
            unreadCount={dashboard.stats.unreadMessagesCount ?? 0}
          />
          <LatestContentWidget
            sermon={dashboard.recentSermon ?? null}
            blogPost={dashboard.recentBlogPost ?? null}
          />
          <PrayerRequestsWidget requests={dashboard.recentPrayerRequests ?? []} />
        </div>
      </section>

      {/* ─── Community Life ─────────────────────────────────────────── */}
      <section aria-labelledby="community-life-heading">
        <div className="flex items-center gap-3 pt-1">
          <div className="h-px flex-1 bg-border/50" />
          <h2
            id="community-life-heading"
            className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70"
          >
            Community Life
          </h2>
          <div className="h-px flex-1 bg-border/50" />
        </div>

        {/* Activity Feed + Birthdays & Bible Verse */}
        <div className="animate-fade-in-up stagger-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ActivityFeedWidget activities={dashboard.activityFeed ?? []} />
          <div className="space-y-4">
            <BirthdayCelebrationWidget members={dashboard.birthdayMembers ?? []} />
            <BibleVerseWidget />
          </div>
        </div>
      </section>

      {/* ─── What's Coming ──────────────────────────────────────────── */}
      <section aria-labelledby="whats-coming-heading">
        <div className="flex items-center gap-3 pt-1">
          <div className="h-px flex-1 bg-border/50" />
          <h2
            id="whats-coming-heading"
            className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70"
          >
            What&apos;s Coming
          </h2>
          <div className="h-px flex-1 bg-border/50" />
        </div>

        {/* Events and Announcements */}
        <div className="animate-fade-in-up stagger-9 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <UpcomingEventsWidget events={dashboard.upcomingEvents} />
          <RecentAnnouncementsWidget announcements={dashboard.recentAnnouncements} />
        </div>
      </section>

      {/* Admin Section (admin/staff only) */}
      {isAdmin && (
        <div className="animate-fade-in-up stagger-10">
          <AdminDashboardSection stats={dashboard.adminStats} />
        </div>
      )}
    </SidebarLayout>
  );
}
