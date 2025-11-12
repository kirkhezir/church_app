import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { announcementService, ViewAnalytics } from '@/services/endpoints/announcementService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SidebarLayout } from '@/components/layout';
import { ArrowLeftIcon, EyeIcon, CalendarIcon, UsersIcon } from 'lucide-react';
import { format } from 'date-fns';

/**
 * AnnouncementAnalyticsPage Component
 *
 * Displays detailed analytics for a specific announcement:
 * - Total unique views
 * - First and last view dates
 * - List of recent viewers with timestamps
 * - View history
 */
export function AnnouncementAnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<ViewAnalytics | null>(null);
  const [announcementTitle, setAnnouncementTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch both analytics and announcement details
        const [analyticsData, announcement] = await Promise.all([
          announcementService.getAnalytics(id),
          announcementService.getAnnouncementById(id),
        ]);

        setAnalytics(analyticsData);
        setAnnouncementTitle(announcement.title);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <SidebarLayout
        breadcrumbs={[
          { label: 'Announcements', href: '/announcements' },
          { label: 'Manage', href: '/admin/announcements' },
          { label: 'Analytics' },
        ]}
      >
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <Skeleton className="mb-8 h-12 w-3/4" />
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="mt-8 h-96" />
        </div>
      </SidebarLayout>
    );
  }

  if (error || !analytics) {
    return (
      <SidebarLayout
        breadcrumbs={[
          { label: 'Announcements', href: '/announcements' },
          { label: 'Manage', href: '/admin/announcements' },
          { label: 'Analytics' },
        ]}
      >
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <Alert variant="destructive">
            <AlertDescription>{error || 'Analytics data not available'}</AlertDescription>
          </Alert>
          <Button className="mt-4" onClick={() => navigate('/admin/announcements')}>
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Announcements
          </Button>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout
      breadcrumbs={[
        { label: 'Announcements', href: '/announcements' },
        { label: 'Manage', href: '/admin/announcements' },
        { label: 'Analytics' },
      ]}
    >
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/announcements')}
            className="mb-4"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Announcements
          </Button>
          <h1 className="text-3xl font-bold">Announcement Analytics</h1>
          <p className="mt-2 text-gray-600">{announcementTitle}</p>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid gap-6 md:grid-cols-3">
          {/* Total Views Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <EyeIcon className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalViews}</div>
              <p className="mt-1 text-xs text-gray-600">Unique member views</p>
            </CardContent>
          </Card>

          {/* First Viewed Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">First Viewed</CardTitle>
              <CalendarIcon className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium">
                {analytics.firstViewed
                  ? format(new Date(analytics.firstViewed), 'MMM d, yyyy')
                  : 'N/A'}
              </div>
              <p className="mt-1 text-xs text-gray-600">
                {analytics.firstViewed
                  ? format(new Date(analytics.firstViewed), 'h:mm a')
                  : 'No views yet'}
              </p>
            </CardContent>
          </Card>

          {/* Last Viewed Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Viewed</CardTitle>
              <UsersIcon className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium">
                {analytics.lastViewed
                  ? format(new Date(analytics.lastViewed), 'MMM d, yyyy')
                  : 'N/A'}
              </div>
              <p className="mt-1 text-xs text-gray-600">
                {analytics.lastViewed
                  ? format(new Date(analytics.lastViewed), 'h:mm a')
                  : 'No views yet'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Views List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Views</CardTitle>
            <p className="text-sm text-gray-600">
              Latest {analytics.recentViews.length} member
              {analytics.recentViews.length !== 1 ? 's' : ''} who viewed this announcement
            </p>
          </CardHeader>
          <CardContent>
            {analytics.recentViews.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <EyeIcon className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                <p>No views yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.recentViews.map((view) => (
                  <div
                    key={view.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar Circle */}
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-700">
                        {view.member.firstName.charAt(0)}
                        {view.member.lastName.charAt(0)}
                      </div>
                      {/* Member Name */}
                      <div>
                        <p className="font-medium">
                          {view.member.firstName} {view.member.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(view.viewedAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    {/* Time */}
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {format(new Date(view.viewedAt), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <Link to={`/announcements/${id}`}>
            <Button variant="outline">View Announcement</Button>
          </Link>
          <Link to={`/admin/announcements/${id}/edit`}>
            <Button variant="outline">Edit Announcement</Button>
          </Link>
        </div>
      </div>
    </SidebarLayout>
  );
}
