/**
 * Recent Announcements Widget (T100)
 *
 * Displays recent church announcements in dashboard
 */

import { Link } from 'react-router';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  publishedAt: string;
  isRead: boolean;
}

interface RecentAnnouncementsWidgetProps {
  announcements: Announcement[];
}

export function RecentAnnouncementsWidget({ announcements }: RecentAnnouncementsWidgetProps) {
  if (announcements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No recent announcements</p>
        </CardContent>
      </Card>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toUpperCase()) {
      case 'URGENT':
        return 'bg-red-100 text-red-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'NORMAL':
        return 'bg-blue-100 text-blue-800';
      case 'LOW':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Recent Announcements</CardTitle>
        <Link to="/app/announcements">
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {announcements.map((announcement) => {
            const publishedDate = new Date(announcement.publishedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={announcement.id}
                className={`rounded-lg border p-4 transition-colors hover:bg-gray-50 ${
                  !announcement.isRead ? 'border-blue-300 bg-blue-50/50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">{announcement.title}</h3>
                      {!announcement.isRead && (
                        <span className="flex h-2 w-2 rounded-full bg-blue-600" title="Unread" />
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                      {announcement.content}
                    </p>
                    <div className="mt-2 flex items-center space-x-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getPriorityColor(
                          announcement.priority
                        )}`}
                      >
                        {announcement.priority}
                      </span>
                      <span className="text-xs text-gray-500">{publishedDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
