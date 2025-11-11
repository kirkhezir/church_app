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

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { announcementService } from '@/services/endpoints/announcementService';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
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
  const limit = 10;

  const {
    announcements,
    pagination,
    loading,
    error: fetchError,
  } = useAnnouncements(showArchived, currentPage, limit);

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
      window.location.reload(); // Refresh to show updated list
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
      window.location.reload(); // Refresh to show updated list
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete announcement');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleArchived = () => {
    setShowArchived(!showArchived);
    setCurrentPage(1);
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
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Announcements</h1>
          <p className="mt-2 text-gray-600">Create, edit, and manage church announcements</p>
        </div>
        <Button onClick={handleCreate}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Create Announcement
        </Button>
      </div>

      {/* Filter Controls */}
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant={showArchived ? 'outline' : 'default'}
          onClick={() => !showArchived && handleToggleArchived()}
          disabled={loading}
        >
          <BellIcon className="mr-2 h-4 w-4" />
          Active ({pagination.total})
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

      {/* Announcements Table */}
      {!loading && (
        <>
          {announcements.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
              <BellIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                No {showArchived ? 'archived ' : ''}announcements
              </h3>
              <p className="mb-4 text-gray-600">
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
            <div className="overflow-hidden rounded-lg border bg-white shadow">
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(announcement.id)}
                            disabled={actionLoading === announcement.id}
                          >
                            <EditIcon className="h-4 w-4" />
                          </Button>
                          {!announcement.archivedAt && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleArchive(announcement.id)}
                              disabled={actionLoading === announcement.id}
                            >
                              <ArchiveIcon className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(announcement.id)}
                            disabled={actionLoading === announcement.id}
                            className="text-red-600 hover:text-red-700"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
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
