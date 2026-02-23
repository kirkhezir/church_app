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
import { Search } from 'lucide-react';
import { TableSkeleton } from '@/components/ui/skeletons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
        limit: 20,
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

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'STAFF':
        return 'bg-accent text-primary';
      default:
        return 'bg-muted text-foreground';
    }
  };

  return (
    <SidebarLayout breadcrumbs={[{ label: 'Administration' }, { label: 'Members' }]}>
      <div className="container mx-auto px-4 py-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-balance text-2xl font-bold">Member Management</h1>
          <Link to="/app/admin/members/create">
            <Button>+ Add Member</Button>
          </Link>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]">
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

        {/* Member Table */}
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[400px]">
            {loading ? (
              <TableSkeleton rows={5} columns={6} />
            ) : members.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">No members found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">Role</th>
                      <th className="px-4 py-3 text-left">Member Since</th>
                      <th className="px-4 py-3 text-left">MFA</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => (
                      <tr key={member.id} className="border-b hover:bg-background">
                        <td className="px-4 py-3">
                          {member.firstName} {member.lastName}
                        </td>
                        <td className="px-4 py-3">{member.email}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded px-2 py-1 text-xs font-medium ${getRoleBadgeClass(
                              member.role
                            )}`}
                          >
                            {member.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">{formatDate(member.membershipDate)}</td>
                        <td className="px-4 py-3">
                          {member.mfaEnabled ? (
                            <span className="text-green-600">✓ Enabled</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {deleteConfirm === member.id ? (
                            <div className="flex gap-2">
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
                              className="text-red-600 hover:text-red-800"
                              onClick={() => setDeleteConfirm(member.id)}
                            >
                              Delete
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex justify-center gap-2">
                <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>
                  Previous
                </Button>
                <span className="px-4 py-2">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
