/**
 * AdminAnnouncementsPage Component
 *
 * Admin/Staff page for managing all announcements
 * Features:
 * - List all announcements (active + archived)
 * - Quick actions: Edit, Archive, Delete
 * - Create new announcement button
 * - Filtering, search, sorting, and pagination
 * - Bulk actions (archive/delete multiple)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAnnouncements, AnnouncementFilters as FilterState } from '@/hooks/useAnnouncements';
import { announcementService, Author } from '@/services/endpoints/announcementService';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { SidebarLayout } from '@/components/layout';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AnnouncementFilters } from '@/components/announcements/AnnouncementFilters';
import { BulkActionBar } from '@/components/announcements/BulkActionBar';
import {
  PlusIcon,
  EditIcon,
  ArchiveIcon,
  TrashIcon,
  AlertCircleIcon,
  BellIcon,
  BarChart3Icon,
  ArchiveRestoreIcon,
  SaveIcon,
} from 'lucide-react';
import { format } from 'date-fns';

export function AdminAnnouncementsPage() {
  const navigate = useNavigate();
  const [showArchived, setShowArchived] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeCount, setActiveCount] = useState(0);
  const [archivedCount, setArchivedCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    sortBy: 'date',
    sortOrder: 'desc',
  });
  const [authors, setAuthors] = useState<Author[]>([]);
  const limit = 10;

  const {
    announcements,
    pagination,
    loading,
    error: fetchError,
  } = useAnnouncements(showArchived, currentPage, limit, refreshKey, filters);

  // Fetch counts for both active and archived - independent of main list
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
  }, [refreshKey]); // Only refetch when refreshKey changes

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Fetch authors list for filter dropdown
  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const authorList = await announcementService.getAuthors();
        setAuthors(authorList);
      } catch (err) {
        console.error('Failed to fetch authors:', err);
      }
    };
    fetchAuthors();
  }, []);

  // Clear selection when changing between active/archived or changing pages
  useEffect(() => {
    setSelectedIds([]);
  }, [showArchived, currentPage]);

  const handleCreate = () => {
    navigate('/app/admin/announcements/create');
  };

  const handleEdit = (id: string) => {
    navigate(`/app/admin/announcements/${id}/edit`);
  };

  const handleArchive = async (id: string) => {
    if (!confirm('Are you sure you want to archive this announcement?')) return;

    setActionLoading(id);
    setError(null);
    setSuccessMessage(null);

    try {
      await announcementService.archiveAnnouncement(id);
      setSuccessMessage('Announcement archived successfully');
      // Trigger refetch by incrementing refreshKey
      setRefreshKey((prev) => prev + 1);
      // If we're on a page that becomes empty, go to previous page
      if (announcements.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
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
    setSuccessMessage(null);

    try {
      await announcementService.deleteAnnouncement(id);
      setSuccessMessage('Announcement deleted successfully');
      // Trigger refetch by incrementing refreshKey
      setRefreshKey((prev) => prev + 1);
      // If we're on a page that becomes empty, go to previous page
      if (announcements.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete announcement');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnarchive = async (id: string) => {
    if (!confirm('Restore this announcement from archive?')) return;

    setActionLoading(id);
    setError(null);
    setSuccessMessage(null);

    try {
      await announcementService.unarchiveAnnouncement(id);
      setSuccessMessage('Announcement restored successfully');
      setRefreshKey((prev) => prev + 1);
      // If we're on a page that becomes empty, go to previous page
      if (announcements.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to restore announcement');
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

  // Bulk action handlers
  const handleBulkArchive = async () => {
    if (!confirm(`Archive ${selectedIds.length} announcement(s)?`)) return;

    setError(null);
    setSuccessMessage(null);

    try {
      const result = await announcementService.bulkArchive(selectedIds);
      setSuccessMessage(result.message);
      setSelectedIds([]);
      setRefreshKey((prev) => prev + 1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Bulk archive failed');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.length} announcement(s)? This cannot be undone.`)) return;

    setError(null);
    setSuccessMessage(null);

    try {
      const result = await announcementService.bulkDelete(selectedIds);
      setSuccessMessage(result.message);
      setSelectedIds([]);
      setRefreshKey((prev) => prev + 1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Bulk delete failed');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(announcements.map((a) => a.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
    }
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const adminContent = (
    <div className="container mx-auto max-w-full px-4 py-4 sm:max-w-6xl sm:px-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <h1 className="text-balance text-2xl font-bold sm:text-3xl">Manage Announcements</h1>
          <p className="mt-1 text-sm text-muted-foreground sm:mt-2 sm:text-base">
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
      <div className="mb-4 flex flex-wrap items-center gap-2 sm:mb-6 sm:gap-4">
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

      {/* Advanced Filters */}
      <div className="mb-6">
        <AnnouncementFilters
          onFiltersChange={handleFiltersChange}
          authors={authors}
          loading={loading}
        />
      </div>

      {/* Success Message */}
      {successMessage && (
        <Alert className="mb-4 border-green-500 bg-green-50 sm:mb-6">
          <AlertDescription className="text-sm text-green-800 sm:text-base">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {(error || fetchError) && (
        <Alert variant="destructive" className="mb-4 sm:mb-6">
          <AlertDescription className="text-sm sm:text-base">
            {error || fetchError}
          </AlertDescription>
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
            <div className="rounded-lg border border-dashed border-border bg-background p-8 text-center sm:p-12">
              <BellIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground sm:mb-4 sm:h-12 sm:w-12" />
              <h3 className="mb-2 text-base font-medium text-foreground sm:text-lg">
                No {showArchived ? 'archived ' : ''}announcements
              </h3>
              <p className="mb-4 text-sm text-muted-foreground sm:text-base">
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
              <div className="hidden md:block">
                <div className="overflow-x-auto rounded-lg border bg-white shadow">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-background">
                      <tr>
                        <th className="w-12 px-4 py-3">
                          <Checkbox
                            checked={
                              selectedIds.length === announcements.length &&
                              announcements.length > 0
                            }
                            onCheckedChange={handleSelectAll}
                          />
                        </th>
                        <th className="min-w-[200px] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Title
                        </th>
                        <th className="w-24 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Priority
                        </th>
                        <th className="w-32 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Author
                        </th>
                        <th className="w-28 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Status
                        </th>
                        <th className="w-32 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Published
                        </th>
                        <th className="w-40 px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {announcements.map((announcement) => (
                        <tr key={announcement.id} className="hover:bg-background">
                          <td className="px-4 py-4">
                            <Checkbox
                              checked={selectedIds.includes(announcement.id)}
                              onCheckedChange={(checked) =>
                                handleSelectOne(announcement.id, checked as boolean)
                              }
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="max-w-[250px] truncate font-medium text-foreground">
                              {announcement.title}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {announcement.priority === 'URGENT' ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                                <AlertCircleIcon className="h-3 w-3" />
                                Urgent
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-primary">
                                <BellIcon className="h-3 w-3" />
                                Normal
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            <div className="truncate">
                              {announcement.author.firstName} {announcement.author.lastName}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {announcement.isDraft ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                                <SaveIcon className="h-3 w-3" />
                                Draft
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                ✓ Published
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {format(new Date(announcement.publishedAt), 'MMM d, yyyy')}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() =>
                                        navigate(
                                          `/app/admin/announcements/${announcement.id}/analytics`
                                        )
                                      }
                                    >
                                      <BarChart3Icon className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>View analytics</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
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
                                        size="icon"
                                        className="h-8 w-8"
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
                              {announcement.archivedAt && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-green-600 hover:text-green-700"
                                        onClick={() => handleUnarchive(announcement.id)}
                                        disabled={actionLoading === announcement.id}
                                      >
                                        <ArchiveRestoreIcon className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Restore from archive</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-red-600 hover:text-red-700"
                                      onClick={() => handleDelete(announcement.id)}
                                      disabled={actionLoading === announcement.id}
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
              </div>

              {/* Mobile Card View */}
              <div className="space-y-3 md:hidden">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="rounded-lg border bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="mb-1 font-medium text-foreground">{announcement.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          By {announcement.author.firstName} {announcement.author.lastName}
                        </p>
                      </div>
                      {announcement.priority === 'URGENT' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                          <AlertCircleIcon className="h-3 w-3" />
                          Urgent
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-primary">
                          <BellIcon className="h-3 w-3" />
                          Normal
                        </span>
                      )}
                    </div>
                    <p className="mb-3 text-xs text-muted-foreground">
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
              <div className="text-xs text-muted-foreground sm:text-sm">
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
      breadcrumbs={[{ label: 'Announcements', href: '/app/announcements' }, { label: 'Manage' }]}
    >
      {adminContent}

      {/* Bulk Action Bar - Floats at bottom when items are selected */}
      <BulkActionBar
        selectedCount={selectedIds.length}
        onArchive={handleBulkArchive}
        onDelete={handleBulkDelete}
        onClearSelection={() => setSelectedIds([])}
        isArchived={showArchived}
      />
    </SidebarLayout>
  );
}
