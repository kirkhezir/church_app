/**
 * MemberDirectoryPage Component
 *
 * Displays a searchable, paginated list of church members
 * with privacy-controlled contact information and advanced filtering
 */

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Users, Search, Mail, Phone, Calendar, Download } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  AdvancedMemberFilters,
  MemberFilters,
} from '@/components/features/members/AdvancedMemberFilters';
import { MemberBulkActions } from '@/components/features/members/MemberBulkActions';
import { DataExportDialog } from '@/components/features/export/DataExportDialog';
import { adminService } from '@/services/endpoints/adminService';
import { useToast } from '@/hooks/use-toast';

export function MemberDirectoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Advanced filters state
  const [filters, setFilters] = useState<MemberFilters>({});
  const [selectedMembers, setSelectedMembers] = useState<
    Array<{ id: string; firstName: string; lastName: string; email: string }>
  >([]);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF';

  const { members, loading, error, pagination, setPage } = useMembers({
    search: debouncedSearch || undefined,
    page: 1,
    limit: 12,
  });

  // Selection handlers
  const handleSelectMember = (member: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }) => {
    setSelectedMembers((prev) =>
      prev.some((m) => m.id === member.id)
        ? prev.filter((m) => m.id !== member.id)
        : [...prev, member]
    );
  };

  const handleSelectAll = () => {
    if (selectedMembers.length === members.length) {
      setSelectedMembers([]);
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
  };

  // Bulk action handlers
  const handleBulkEmail = async (memberIds: string[], _subject: string, _message: string) => {
    // Bulk email requires a dedicated backend endpoint — notify with selected count for now
    toast({
      title: 'Email feature coming soon',
      description: `${memberIds.length} members selected. Bulk email is not yet supported.`,
      variant: 'default',
    });
  };

  const handleBulkStatusChange = async (memberIds: string[], _status: 'ACTIVE' | 'INACTIVE') => {
    // Bulk status change requires a dedicated backend endpoint
    toast({
      title: 'Status change coming soon',
      description: `${memberIds.length} members selected. Bulk status change is not yet supported.`,
      variant: 'default',
    });
  };

  const handleBulkExport = async (_memberIds: string[]) => {
    try {
      const blob = await adminService.exportMembers({ format: 'csv' });
      adminService.downloadFile(
        blob,
        `members-export-${new Date().toISOString().split('T')[0]}.csv`
      );
      toast({ title: 'Export complete', description: 'Member data downloaded successfully' });
    } catch {
      toast({
        title: 'Export failed',
        description: 'Could not export member data',
        variant: 'destructive',
      });
    }
  };

  const handleExport = async (format: 'csv' | 'xlsx' | 'pdf', _fields: string[]) => {
    const exportFormat = format === 'csv' ? 'csv' : 'json';
    const blob = await adminService.exportMembers({ format: exportFormat });
    return blob;
  };

  const handleResetFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const handleViewProfile = (memberId: string) => {
    navigate(`/app/members/${memberId}`);
  };

  const handleSendMessage = (memberId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/app/messages/compose?to=${memberId}`);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const content = (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-balance text-3xl font-bold">
            <Users className="h-8 w-8" />
            Member Directory
          </h1>
          <p className="mt-2 text-muted-foreground">Connect with fellow church members</p>
        </div>

        {isAdmin && (
          <DataExportDialog
            dataType="members"
            onExport={handleExport}
            trigger={
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            }
          />
        )}
      </div>

      {/* Bulk Actions Bar */}
      {isAdmin && (
        <MemberBulkActions
          selectedMembers={selectedMembers}
          onClearSelection={() => setSelectedMembers([])}
          onBulkEmail={handleBulkEmail}
          onBulkStatusChange={handleBulkStatusChange}
          onBulkExport={handleBulkExport}
        />
      )}

      {/* Search and Advanced Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {isAdmin && (
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              {selectedMembers.length === members.length ? 'Deselect All' : 'Select All'}
            </Button>
          )}
        </div>

        <AdvancedMemberFilters
          filters={filters}
          onChange={setFilters}
          onReset={handleResetFilters}
        />
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Members Grid */}
      {!loading && members.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <Card
              key={member.id}
              className={`cursor-pointer transition-shadow hover:shadow-md ${
                selectedMembers.some((m) => m.id === member.id) ? 'ring-2 ring-primary' : ''
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
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {isAdmin && (
                    <Checkbox
                      checked={selectedMembers.some((m) => m.id === member.id)}
                      onCheckedChange={() =>
                        handleSelectMember({
                          id: member.id,
                          firstName: member.firstName,
                          lastName: member.lastName,
                          email: member.email || '',
                        })
                      }
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1"
                    />
                  )}
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {getInitials(member.firstName, member.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold">
                      {member.firstName} {member.lastName}
                    </h3>

                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      {member.email && (
                        <div className="flex items-center gap-2 truncate">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{member.email}</span>
                        </div>
                      )}

                      {member.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 flex-shrink-0" />
                          <span>{member.phone}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        <span>Member since {formatDate(member.membershipDate)}</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => handleSendMessage(member.id, e)}
                      >
                        <Mail className="mr-2 h-3 w-3" />
                        Message
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && members.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No members found</h3>
            <p className="mt-2 text-muted-foreground">
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'No members are available in the directory'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );

  return <SidebarLayout>{content}</SidebarLayout>;
}
