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
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { AnnouncementCard } from '@/components/features/announcements/AnnouncementCard';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { SidebarLayout } from '@/components/layout';
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
    navigate(`/app/announcements/${announcementId}`);
  };

  const handleFilterChange = (archived: boolean) => {
    setShowArchived(archived);
    setCurrentPage(1); // Reset to first page when changing filter
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

  const announcementContent = (
    <div className="container mx-auto max-w-full px-4 py-4 sm:max-w-4xl sm:px-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <h1 className="mb-2 text-2xl font-bold sm:text-3xl">Church Announcements</h1>
          <p className="text-sm text-gray-600 sm:text-base">
            Stay updated with the latest news and information
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => navigate('/app/admin/announcements')}
            variant="default"
            className="w-full sm:w-auto"
          >
            <SettingsIcon className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Manage Announcements</span>
            <span className="sm:hidden">Manage</span>
          </Button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="mb-4 flex flex-wrap items-center gap-2 sm:mb-6 sm:gap-4">
        <Button
          variant={!showArchived ? 'default' : 'outline'}
          onClick={() => handleFilterChange(false)}
          disabled={loading}
          className="flex-1 sm:flex-none"
        >
          <BellIcon className="mr-2 h-4 w-4" />
          Active
        </Button>
        <Button
          variant={showArchived ? 'default' : 'outline'}
          onClick={() => handleFilterChange(true)}
          disabled={loading}
          className="flex-1 sm:flex-none"
        >
          <ArchiveIcon className="mr-2 h-4 w-4" />
          Archived
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive" className="mb-4 sm:mb-6">
          <AlertDescription className="text-sm sm:text-base">{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-3 sm:space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full sm:h-40 md:h-48" />
          ))}
        </div>
      )}

      {/* Announcements List */}
      {!loading && !error && (
        <>
          {!announcements || announcements.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center sm:p-12">
              <BellIcon className="mx-auto mb-3 h-10 w-10 text-gray-400 sm:mb-4 sm:h-12 sm:w-12" />
              <h3 className="mb-2 text-base font-medium text-gray-900 sm:text-lg">
                No {showArchived ? 'archived ' : ''}announcements
              </h3>
              <p className="text-sm text-gray-600 sm:text-base">
                {showArchived
                  ? 'There are no archived announcements at this time.'
                  : 'There are no active announcements at this time.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
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
            <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:mt-8 sm:flex-row sm:gap-0">
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

  // Wrap with SidebarLayout for authenticated users
  return (
    <SidebarLayout breadcrumbs={[{ label: 'Announcements' }]}>{announcementContent}</SidebarLayout>
  );
}
