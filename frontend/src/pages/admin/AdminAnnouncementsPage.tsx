/**
 * AdminAnnouncementsPage Component
 *
 * Admin/Staff page for managing all announcements
 * Features:
 * - List all announcements (active + archived)
 * - Quick actions: Edit, Archive, Delete
 * - Create new announcement button
 * - Filtering and pagination
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { announcementService } from '@/services/endpoints/announcementService';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { SidebarLayout } from '@/components/layout';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  PlusIcon,
  EditIcon,
  ArchiveIcon,
  TrashIcon,
  AlertCircleIcon,
  BellIcon,
} from 'lucide-react';
import { format } from 'date-fns';

export function AdminAnnouncementsPage() {
  const navigate = useNavigate();
  const [showArchived, setShowArchived] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeCount, setActiveCount] = useState(0);
  const [archivedCount, setArchivedCount] = useState(0);
  const limit = 10;

  const {
    announcements,
    pagination,
    loading,
    error: fetchError,
  } = useAnnouncements(showArchived, currentPage, limit);

  // Fetch counts for both active and archived
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [activeData, archivedData] = await Promise.all([
          announcementService.getAnnouncements(false, 1, 1),
          announcementService.getAnnouncements(true, 1, 1),
        ]);
        setActiveCount(activeData.pagination.total);
        setArchivedCount(archivedData.pagination.total);
      } catch (err) {
        console.error('Failed to fetch counts:', err);
      }
    };
    fetchCounts();
  }, [announcements]); // Refetch counts when announcements change

  const handleCreate = () => {
    navigate('/admin/announcements/create');
  };

  const handleEdit = (id: string) => {
    navigate(`/admin/announcements/${id}/edit`);
  };

  const handleArchive = async (id: string) => {
    if (!confirm('Are you sure you want to archive this announcement?')) return;

    setActionLoading(id);
    setError(null);

    try {
      await announcementService.archiveAnnouncement(id);
      // Refresh the list by resetting to page 1 and toggling state
      setCurrentPage(1);
      // Force a re-render by briefly toggling and back
      const wasArchived = showArchived;
      setShowArchived(!wasArchived);
      setTimeout(() => setShowArchived(wasArchived), 50);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to archive announcement');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement? This cannot be undone.'))
      return;

    setActionLoading(id);
    setError(null);

    try {
      await announcementService.deleteAnnouncement(id);
      // Refresh the list by resetting to page 1 and toggling state
      setCurrentPage(1);
      // Force a re-render by briefly toggling and back
      const wasArchived = showArchived;
      setShowArchived(!wasArchived);
      setTimeout(() => setShowArchived(wasArchived), 50);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete announcement');
    } finally {
      setActionLoading(null);
    }
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

  const adminContent = (
    <div className="container mx-auto max-w-full px-4 py-4 sm:max-w-6xl sm:px-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-bold sm:text-3xl">Manage Announcements</h1>
          <p className="mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base">
            Create, edit, and manage church announcements
          </p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <PlusIcon className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Create Announcement</span>
          <span className="sm:hidden">Create</span>
        </Button>
      </div>

      {/* Filter Controls */}
      <div className="mb-6 flex flex-wrap items-center gap-2 sm:gap-4">
        <Button
          variant={!showArchived ? 'default' : 'outline'}
          onClick={() => setShowArchived(false)}
          disabled={loading}
          className="flex-1 sm:flex-none"
        >
          <BellIcon className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Active</span>
          <span className="sm:hidden">Active</span>
          {!loading && ` (${activeCount})`}
        </Button>
        <Button
          variant={showArchived ? 'default' : 'outline'}
          onClick={() => setShowArchived(true)}
          disabled={loading}
          className="flex-1 sm:flex-none"
        >
          <ArchiveIcon className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Archived</span>
          <span className="sm:hidden">Archived</span>
          {!loading && ` (${archivedCount})`}
        </Button>
      </div>

      {/* Error Alert */}
      {(error || fetchError) && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error || fetchError}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      )}

      {/* Announcements Table/Cards */}
      {!loading && (
        <>
          {announcements.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center sm:p-12">
              <BellIcon className="mx-auto mb-3 h-10 w-10 text-gray-400 sm:mb-4 sm:h-12 sm:w-12" />
              <h3 className="mb-2 text-base font-medium text-gray-900 sm:text-lg">
                No {showArchived ? 'archived ' : ''}announcements
              </h3>
              <p className="mb-4 text-sm text-gray-600 sm:text-base">
                {showArchived
                  ? 'There are no archived announcements.'
                  : 'Get started by creating your first announcement.'}
              </p>
              {!showArchived && (
                <Button onClick={handleCreate}>
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Create Announcement
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden overflow-hidden rounded-lg border bg-white shadow md:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Author
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Published
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {announcements.map((announcement) => (
                      <tr key={announcement.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="max-w-md truncate font-medium text-gray-900">
                            {announcement.title}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {announcement.priority === 'URGENT' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                              <AlertCircleIcon className="h-3 w-3" />
                              Urgent
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                              <BellIcon className="h-3 w-3" />
                              Normal
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {announcement.author.firstName} {announcement.author.lastName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {format(new Date(announcement.publishedAt), 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(announcement.id)}
                                    disabled={actionLoading === announcement.id}
                                  >
                                    <EditIcon className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Edit announcement</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            {!announcement.archivedAt && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleArchive(announcement.id)}
                                      disabled={actionLoading === announcement.id}
                                    >
                                      <ArchiveIcon className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Archive announcement</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(announcement.id)}
                                    disabled={actionLoading === announcement.id}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Delete announcement</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="space-y-3 md:hidden">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="rounded-lg border bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="mb-1 font-medium text-gray-900">{announcement.title}</h3>
                        <p className="text-xs text-gray-500">
                          By {announcement.author.firstName} {announcement.author.lastName}
                        </p>
                      </div>
                      {announcement.priority === 'URGENT' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                          <AlertCircleIcon className="h-3 w-3" />
                          Urgent
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                          <BellIcon className="h-3 w-3" />
                          Normal
                        </span>
                      )}
                    </div>
                    <p className="mb-3 text-xs text-gray-600">
                      {format(new Date(announcement.publishedAt), 'MMM d, yyyy')}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(announcement.id)}
                        disabled={actionLoading === announcement.id}
                        className="flex-1"
                      >
                        <EditIcon className="mr-1 h-3 w-3" />
                        Edit
                      </Button>
                      {!announcement.archivedAt && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleArchive(announcement.id)}
                          disabled={actionLoading === announcement.id}
                          className="flex-1"
                        >
                          <ArchiveIcon className="mr-1 h-3 w-3" />
                          Archive
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(announcement.id)}
                        disabled={actionLoading === announcement.id}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row sm:gap-0">
              <div className="text-xs text-gray-600 sm:text-sm">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="sm:size-default"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === pagination.totalPages}
                  className="sm:size-default"
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

  return (
    <SidebarLayout
      breadcrumbs={[{ label: 'Announcements', href: '/announcements' }, { label: 'Manage' }]}
    >
      {adminContent}
    </SidebarLayout>
  );
}
