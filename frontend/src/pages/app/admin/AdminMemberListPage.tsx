/**
 * Admin Member List Page
 *
 * Admin dashboard for member management:
 * - List all members with pagination
 * - Search and filter
 * - Create new members
 * - Delete members
 *
 * T308-T309: Create admin member list page
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Search, Users, ChevronLeft, ChevronRight, UserPlus } from 'lucide-react';
import { TableSkeleton } from '@/components/ui/skeletons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { adminService, Member } from '@/services/endpoints/adminService';
import { useDebounce } from '@/hooks/useDebounce';
import { SidebarLayout } from '@/components/layout';

export default function AdminMemberListPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    loadMembers();
  }, [page, roleFilter, debouncedSearch]);

  // Reset to page 1 when search or role filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, roleFilter]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminService.listMembers({
        page,
        limit: ITEMS_PER_PAGE,
        search: debouncedSearch || undefined,
        role: roleFilter === 'ALL' ? undefined : roleFilter,
      });
      setMembers(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (memberId: string) => {
    try {
      await adminService.deleteMember(memberId);
      setMembers(members.filter((m) => m.id !== memberId));
      setDeleteConfirm(null);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to delete member');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'destructive' as const;
      case 'STAFF':
        return 'default' as const;
      default:
        return 'secondary' as const;
    }
  };

  return (
    <SidebarLayout breadcrumbs={[{ label: 'Administration' }, { label: 'Members' }]}>
      <div className="container mx-auto space-y-6 px-4 py-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Member Management</h1>
            <p className="text-sm text-muted-foreground">View and manage all church members</p>
          </div>
          <Link to="/app/admin/members/create">
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </Link>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Members card with integrated toolbar */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle className="text-lg">Members</CardTitle>
                  <CardDescription>
                    {!loading &&
                      `${members.length} member${members.length !== 1 ? 's' : ''} on this page`}
                  </CardDescription>
                </div>
              </div>
              {/* Search & Filter toolbar */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search members..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-[220px] pl-9"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Roles</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="STAFF">Staff</SelectItem>
                    <SelectItem value="MEMBER">Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0">
            {loading ? (
              <div className="px-6">
                <TableSkeleton rows={5} columns={6} />
              </div>
            ) : members.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="mb-3 h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm font-medium text-muted-foreground">No members found</p>
                <p className="text-xs text-muted-foreground/70">
                  Try adjusting your search or filter
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Member Since</TableHead>
                    <TableHead>MFA</TableHead>
                    <TableHead className="pr-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="pl-6 font-medium">
                        {member.firstName} {member.lastName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{member.email}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(member.role)}>{member.role}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(member.membershipDate)}
                      </TableCell>
                      <TableCell>
                        {member.mfaEnabled ? (
                          <Badge
                            variant="outline"
                            className="border-green-200 bg-green-50 text-green-700"
                          >
                            Enabled
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        {deleteConfirm === member.id ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(member.id)}
                            >
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDeleteConfirm(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteConfirm(member.id)}
                          >
                            Delete
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Pagination — always visible */}
            {!loading && members.length > 0 && (
              <div className="flex items-center justify-between border-t px-6 py-4">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
