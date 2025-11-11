/**
 * AnnouncementsPage Component
 *
 * Main page for viewing church announcements
 * Features:
 * - List of active announcements
 * - Filter by archived/active
 * - Pagination
 * - Click to view full announcement
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { AnnouncementCard } from '@/components/features/announcements/AnnouncementCard';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { BellIcon, ArchiveIcon, SettingsIcon } from 'lucide-react';

export function AnnouncementsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showArchived, setShowArchived] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const { announcements, pagination, loading, error } = useAnnouncements(
    showArchived,
    currentPage,
    limit
  );

  // Check if user is admin or staff
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF';

  const handleViewDetails = (announcementId: string) => {
    navigate(`/announcements/${announcementId}`);
  };

  const handleToggleArchived = () => {
    setShowArchived(!showArchived);
    setCurrentPage(1); // Reset to first page when toggling
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < pagination.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Church Announcements</h1>
          <p className="text-gray-600">Stay updated with the latest news and information</p>
        </div>
        {isAdmin && (
          <Button onClick={() => navigate('/admin/announcements')} variant="default">
            <SettingsIcon className="mr-2 h-4 w-4" />
            Manage Announcements
          </Button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant={showArchived ? 'outline' : 'default'}
          onClick={() => !showArchived && handleToggleArchived()}
          disabled={loading}
        >
          <BellIcon className="mr-2 h-4 w-4" />
          Active
        </Button>
        <Button
          variant={showArchived ? 'default' : 'outline'}
          onClick={() => showArchived && handleToggleArchived()}
          disabled={loading}
        >
          <ArchiveIcon className="mr-2 h-4 w-4" />
          Archived
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      )}

      {/* Announcements List */}
      {!loading && !error && (
        <>
          {!announcements || announcements.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
              <BellIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                No {showArchived ? 'archived ' : ''}announcements
              </h3>
              <p className="text-gray-600">
                {showArchived
                  ? 'There are no archived announcements at this time.'
                  : 'There are no active announcements at this time.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handlePreviousPage} disabled={currentPage === 1}>
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={handleNextPage}
                  disabled={currentPage === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
