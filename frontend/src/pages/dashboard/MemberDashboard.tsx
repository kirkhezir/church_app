/**
 * Member Dashboard Page (T097)
 *
 * Main dashboard view for authenticated members showing:
 * - Profile summary widget
 * - Upcoming events widget
 * - Recent announcements widget
 * - Quick stats
 */

import { useState, useEffect } from 'react';
import { SidebarLayout } from '../../components/layout';
import { ProfileSummary } from '../../components/features/dashboard/ProfileSummary';
import { UpcomingEventsWidget } from '../../components/features/dashboard/UpcomingEventsWidget';
import { RecentAnnouncementsWidget } from '../../components/features/dashboard/RecentAnnouncementsWidget';
import { Alert, AlertDescription } from '../../components/ui/alert';
import apiClient from '../../services/api/apiClient';

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

        const response = await apiClient.get('/app/members/dashboard');
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
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
            <p className="mt-4 text-sm text-gray-600">Loading dashboard...</p>
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
      <div className="rounded-lg bg-white p-6 shadow">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {dashboard.profile.firstName}!
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Here&apos;s what&apos;s happening in your church community
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <div className="truncate text-sm font-medium text-gray-500">Upcoming Events</div>
          <div className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {dashboard.stats.upcomingEventsCount}
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <div className="truncate text-sm font-medium text-gray-500">Unread Announcements</div>
          <div className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {dashboard.stats.unreadAnnouncementsCount}
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
          <div className="truncate text-sm font-medium text-gray-500">My RSVPs</div>
          <div className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {dashboard.stats.myRsvpCount}
          </div>
        </div>
      </div>

      {/* Dashboard Widgets */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
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
