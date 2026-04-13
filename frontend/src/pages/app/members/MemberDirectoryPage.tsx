/**
 * MemberDirectoryPage Component
 *
 * Displays a searchable, paginated list of church members
 * with privacy-controlled contact information and advanced filtering
 */

import { useState, useTransition, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
  Users,
  Search,
  Mail,
  Phone,
  Calendar,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  UserSearch,
} from 'lucide-react';
import { useMembers } from '@/hooks/useMembers';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/hooks/useAuth';
import { SidebarLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AdvancedMemberFilters,
  MemberFilters,
} from '@/components/features/members/AdvancedMemberFilters';
import { MemberBulkActions } from '@/components/features/members/MemberBulkActions';
import { DataExportDialog } from '@/components/features/export/DataExportDialog';
import { adminService } from '@/services/endpoints/adminService';
import { gooeyToast } from 'goey-toast';

// Hoisted constants — stable references across renders
const MEMBER_SKELETON_KEYS = [
  'mem-0',
  'mem-1',
  'mem-2',
  'mem-3',
  'mem-4',
  'mem-5',
  'mem-6',
  'mem-7',
  'mem-8',
];
const EMPTY_SELECTION: Array<{ id: string; firstName: string; lastName: string; email: string }> =
  [];
const MEMBERS_PER_PAGE = 12;

// Module-level utility functions (no re-creation on each render)
function formatMemberDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
  }).format(new Date(dateStr));
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function MemberDirectoryPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();

  // URL-synced state for search and page
  const initialSearch = searchParams.get('q') || '';
  const initialPage = Number(searchParams.get('page')) || 1;

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Advanced filters state
  const [filters, setFilters] = useState<MemberFilters>({});
  const [selectedMembers, setSelectedMembers] = useState(EMPTY_SELECTION);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF';

  const { members, loading, error, pagination, setPage } = useMembers({
    search: debouncedSearch || undefined,
    page: initialPage,
    limit: MEMBERS_PER_PAGE,
  });

  // Derive selected member IDs as a Set (O(1) lookups)
  const selectedMemberIds = useMemo(
    () => new Set(selectedMembers.map((m) => m.id)),
    [selectedMembers]
  );

  // Update URL search params when search/page changes
  const updateSearchParams = useCallback(
    (query: string, page?: number) => {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (page && page > 1) params.set('page', String(page));
      setSearchParams(params, { replace: true });
    },
    [setSearchParams]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);
      startTransition(() => {
        updateSearchParams(value, 1);
        setPage(1);
      });
    },
    [updateSearchParams, setPage]
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    startTransition(() => {
      updateSearchParams('', 1);
      setPage(1);
    });
  }, [updateSearchParams, setPage]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      startTransition(() => {
        updateSearchParams(searchQuery, newPage);
      });
      // Scroll to top of list on page change
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [setPage, updateSearchParams, searchQuery]
  );

  // Selection handlers
  const handleSelectMember = useCallback(
    (member: { id: string; firstName: string; lastName: string; email: string }) => {
      setSelectedMembers((prev) =>
        prev.some((m) => m.id === member.id)
          ? prev.filter((m) => m.id !== member.id)
          : [...prev, member]
      );
    },
    []
  );

  const handleSelectAll = useCallback(() => {
    if (selectedMembers.length === members.length) {
      setSelectedMembers(EMPTY_SELECTION);
    } else {
      setSelectedMembers(
        members.map((m) => ({
          id: m.id,
          firstName: m.firstName,
          lastName: m.lastName,
          email: m.email || '',
        }))
      );
    }
  }, [selectedMembers.length, members]);

  // Bulk action handlers
  const handleBulkEmail = useCallback(
    async (memberIds: string[], _subject: string, _message: string) => {
      gooeyToast.info('Email feature coming soon', {
        description: `${memberIds.length} members selected. Bulk email is not yet supported.`,
      });
    },
    []
  );

  const handleBulkStatusChange = useCallback(
    async (memberIds: string[], _status: 'ACTIVE' | 'INACTIVE') => {
      gooeyToast.info('Status change coming soon', {
        description: `${memberIds.length} members selected. Bulk status change is not yet supported.`,
      });
    },
    []
  );

  const handleBulkExport = useCallback(async (_memberIds: string[]) => {
    try {
      const blob = await adminService.exportMembers({ format: 'csv' });
      adminService.downloadFile(
        blob,
        `members-export-${new Date().toISOString().split('T')[0]}.csv`
      );
      gooeyToast.success('Export complete', { description: 'Member data downloaded successfully' });
    } catch {
      gooeyToast.error('Export failed', {
        description: 'Could not export member data',
      });
    }
  }, []);

  const handleExport = useCallback(async (format: 'csv' | 'xlsx' | 'pdf', _fields: string[]) => {
    const exportFormat = format === 'csv' ? 'csv' : 'json';
    const blob = await adminService.exportMembers({ format: exportFormat });
    return blob;
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({});
    setSearchQuery('');
    startTransition(() => {
      updateSearchParams('', 1);
      setPage(1);
    });
  }, [updateSearchParams, setPage]);

  const handleViewProfile = useCallback(
    (memberId: string) => {
      navigate(`/app/members/${memberId}`);
    },
    [navigate]
  );

  const handleSendMessage = useCallback(
    (memberId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      navigate(`/app/messages/compose?to=${memberId}`);
    },
    [navigate]
  );

  // Pagination page numbers
  const pageNumbers = useMemo(() => {
    if (!pagination || pagination.totalPages <= 1) return [];
    const total = pagination.totalPages;
    const current = pagination.page;
    const pages: (number | 'ellipsis')[] = [];

    // Always show first page
    pages.push(1);

    if (current > 3) pages.push('ellipsis');

    // Show pages around current
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i);
    }

    if (current < total - 2) pages.push('ellipsis');

    // Always show last page
    if (total > 1) pages.push(total);

    return pages;
  }, [pagination]);

  const content = (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight sm:text-3xl">
            <Users className="h-6 w-6 text-primary" aria-hidden="true" />
            Member Directory
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Connect with fellow church members</p>
        </div>

        {isAdmin ? (
          <DataExportDialog
            dataType="members"
            onExport={handleExport}
            trigger={
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" aria-hidden="true" />
                Export Members
              </Button>
            }
          />
        ) : null}
      </header>

      {/* Bulk Actions Bar */}
      {isAdmin ? (
        <MemberBulkActions
          selectedMembers={selectedMembers}
          onClearSelection={() => setSelectedMembers(EMPTY_SELECTION)}
          onBulkEmail={handleBulkEmail}
          onBulkStatusChange={handleBulkStatusChange}
          onBulkExport={handleBulkExport}
        />
      ) : null}

      {/* Search and Advanced Filters */}
      <section className="space-y-4" aria-label="Search and filters">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4" role="search">
          <div className="relative max-w-md flex-1">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 pr-10"
              aria-label="Search members by name"
              spellCheck={false}
              autoComplete="off"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : null}
          </div>

          {isAdmin ? (
            <Button variant="outline" size="sm" onClick={handleSelectAll} className="shrink-0">
              {selectedMembers.length === members.length && members.length > 0
                ? 'Deselect All'
                : 'Select All'}
            </Button>
          ) : null}
        </div>

        <AdvancedMemberFilters
          filters={filters}
          onChange={setFilters}
          onReset={handleResetFilters}
        />
      </section>

      {/* Results Summary */}
      <div className="flex items-center justify-between" aria-live="polite" aria-atomic="true">
        {pagination ? (
          <p className="text-sm text-muted-foreground">
            {pagination.totalItems > 0 ? (
              <>
                Showing{' '}
                <span className="font-medium text-foreground">
                  {(pagination.page - 1) * pagination.limit + 1}
                  &ndash;
                  {Math.min(pagination.page * pagination.limit, pagination.totalItems)}
                </span>{' '}
                of <span className="font-medium text-foreground">{pagination.totalItems}</span>{' '}
                members
              </>
            ) : (
              'No members found'
            )}
            {debouncedSearch ? (
              <span>
                {' '}
                for &ldquo;<span className="font-medium">{debouncedSearch}</span>&rdquo;
              </span>
            ) : null}
          </p>
        ) : null}
        {isPending ? (
          <span className="animate-pulse text-xs text-muted-foreground">Updating...</span>
        ) : null}
      </div>

      {/* Error Alert */}
      {error ? (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {/* Loading State */}
      {loading ? (
        <div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          aria-label="Loading members"
          role="status"
        >
          {MEMBER_SKELETON_KEYS.map((key) => (
            <Card key={key} className="overflow-hidden">
              <div className="h-0.5 bg-muted" aria-hidden="true" />
              <CardContent className="p-5">
                <div className="flex items-center gap-3.5">
                  <Skeleton className="h-11 w-11 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <div className="my-3.5 h-px bg-border" />
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="h-6 w-6 rounded-md" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="h-6 w-6 rounded-md" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Skeleton className="h-8 flex-1 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {/* Members Grid */}
      {!loading && members.length > 0 ? (
        <ul className="grid flex-1 list-none grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member, index) => {
            const isSelected = selectedMemberIds.has(member.id);
            return (
              <li
                key={member.id}
                className={`animate-fade-in-up ${index < 10 ? `stagger-${index + 1}` : ''}`}
              >
                <Card
                  className={`group relative h-full cursor-pointer overflow-hidden transition-all duration-200 hover:shadow-md ${
                    isSelected ? 'shadow-md ring-2 ring-primary' : 'hover:border-primary/20'
                  }`}
                  onClick={() => handleViewProfile(member.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleViewProfile(member.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`View profile of ${member.firstName} ${member.lastName}`}
                >
                  {/* Subtle accent line */}
                  <div
                    className="h-0.5 bg-gradient-to-r from-primary/40 via-primary/20 to-transparent"
                    aria-hidden="true"
                  />

                  {isAdmin ? (
                    <div className="absolute right-3 top-3 z-10">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() =>
                          handleSelectMember({
                            id: member.id,
                            firstName: member.firstName,
                            lastName: member.lastName,
                            email: member.email || '',
                          })
                        }
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Select ${member.firstName} ${member.lastName}`}
                      />
                    </div>
                  ) : null}

                  <CardContent className="flex h-full flex-col p-5">
                    {/* Profile header — horizontal layout */}
                    <div className="flex items-center gap-3.5">
                      <Avatar className="h-11 w-11 shrink-0 ring-2 ring-primary/10 transition-shadow duration-200 group-hover:ring-primary/25">
                        <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                          {getInitials(member.firstName, member.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <h2 className="truncate text-sm font-semibold leading-snug text-foreground">
                          {member.firstName} {member.lastName}
                        </h2>
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 shrink-0" aria-hidden="true" />
                          <time dateTime={member.membershipDate}>
                            Since {formatMemberDate(member.membershipDate)}
                          </time>
                        </p>
                      </div>
                    </div>

                    {/* Separator */}
                    <div className="my-3.5 h-px bg-border" aria-hidden="true" />

                    {/* Contact details */}
                    <div className="flex flex-1 flex-col gap-2 text-xs text-muted-foreground">
                      {member.email ? (
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted">
                            <Mail className="h-3 w-3 text-muted-foreground/70" aria-hidden="true" />
                          </div>
                          <span className="truncate">{member.email}</span>
                        </div>
                      ) : null}

                      {member.phone ? (
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted">
                            <Phone
                              className="h-3 w-3 text-muted-foreground/70"
                              aria-hidden="true"
                            />
                          </div>
                          <span>{member.phone}</span>
                        </div>
                      ) : null}
                    </div>

                    {/* Action buttons */}
                    <div className="mt-auto flex gap-2 pt-4">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 flex-1 gap-1.5 text-xs font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewProfile(member.id);
                        }}
                        aria-label={`View profile of ${member.firstName}`}
                      >
                        View Profile
                      </Button>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 shrink-0 p-0"
                              onClick={(e) => handleSendMessage(member.id, e)}
                              aria-label={`Send message to ${member.firstName} ${member.lastName}`}
                            >
                              <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Message {member.firstName}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      ) : null}

      {/* Empty State */}
      {!loading && members.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4">
              <UserSearch className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
            </div>
            <h2 className="mt-6 text-lg font-semibold">No Members Found</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              {searchQuery
                ? `No results for "${searchQuery}". Try different keywords or clear your search.`
                : 'No members are available in the directory yet.'}
            </p>
            {searchQuery ? (
              <Button variant="outline" className="mt-4 gap-2" onClick={handleClearSearch}>
                <X className="h-4 w-4" aria-hidden="true" />
                Clear Search
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 ? (
        <nav
          className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between"
          aria-label="Pagination"
        >
          <p className="text-xs text-muted-foreground sm:text-sm">
            Page {pagination.page} of {pagination.totalPages}
          </p>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              aria-label="Go to previous page"
              className="h-9 w-9 p-0 sm:h-9 sm:w-auto sm:px-3"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only sm:not-sr-only sm:ml-1">Previous</span>
            </Button>

            <div className="hidden items-center gap-1 sm:flex">
              {pageNumbers.map((pageNum, i) =>
                pageNum === 'ellipsis' ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="flex h-9 w-9 items-center justify-center text-sm text-muted-foreground"
                    aria-hidden="true"
                  >
                    &hellip;
                  </span>
                ) : (
                  <Button
                    key={pageNum}
                    variant={pageNum === pagination.page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="h-9 w-9 p-0 font-medium tabular-nums"
                    aria-label={`Go to page ${pageNum}`}
                    aria-current={pageNum === pagination.page ? 'page' : undefined}
                  >
                    {pageNum}
                  </Button>
                )
              )}
            </div>

            {/* Mobile: simple page indicator */}
            <Badge variant="outline" className="tabular-nums sm:hidden">
              {pagination.page} / {pagination.totalPages}
            </Badge>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              aria-label="Go to next page"
              className="h-9 w-9 p-0 sm:h-9 sm:w-auto sm:px-3"
            >
              <span className="sr-only sm:not-sr-only sm:mr-1">Next</span>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </nav>
      ) : null}
    </div>
  );

  return <SidebarLayout breadcrumbs={[{ label: 'Members' }]}>{content}</SidebarLayout>;
}
