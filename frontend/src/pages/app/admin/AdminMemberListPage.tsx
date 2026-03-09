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

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Users,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  CheckCircle2,
  Loader2,
  User,
  Shield,
  Phone,
} from 'lucide-react';
import { TableSkeleton } from '@/components/ui/skeletons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { adminService, Member, CreateMemberResponse } from '@/services/endpoints/adminService';
import { useDebounce } from '@/hooks/useDebounce';
import { ConfirmDialog } from '@/components/features/shared/ConfirmDialog';
import { getErrorMessage } from '@/lib/errorReporting';
import { SidebarLayout } from '@/components/layout';
import { gooeyToast } from 'goey-toast';

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
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Add Member Sheet state
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [addFormData, setAddFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'MEMBER' as 'MEMBER' | 'STAFF' | 'ADMIN',
    phone: '',
    address: '',
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState<CreateMemberResponse | null>(null);

  const resetAddForm = () => {
    setAddFormData({
      email: '',
      firstName: '',
      lastName: '',
      role: 'MEMBER',
      phone: '',
      address: '',
    });
    setAddError('');
    setAddSuccess(null);
  };

  const openAddSheet = () => {
    resetAddForm();
    setShowAddSheet(true);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setAddLoading(true);
    try {
      const response = await adminService.createMember({
        ...addFormData,
        phone: addFormData.phone || undefined,
        address: addFormData.address || undefined,
      });
      setAddSuccess(response);
      gooeyToast.success('Member created successfully!', {
        description: `${response.firstName} ${response.lastName} has been added.`,
      });
      await loadMembers();
    } catch (err: unknown) {
      setAddError(getErrorMessage(err, 'Failed to create member'));
    } finally {
      setAddLoading(false);
    }
  };

  const ITEMS_PER_PAGE = 10;

  const loadMembers = useCallback(async () => {
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
  }, [page, debouncedSearch, roleFilter]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleDelete = async (memberId: string) => {
    try {
      setDeleteLoading(true);
      await adminService.deleteMember(memberId);
      setMembers(members.filter((m) => m.id !== memberId));
      setDeleteConfirm(null);
      gooeyToast.success('Member removed');
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Failed to delete member');
      gooeyToast.error('Failed to delete member');
    } finally {
      setDeleteLoading(false);
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
      <div className="container mx-auto flex flex-1 flex-col gap-6 px-4 py-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Member Management</h1>
            <p className="text-sm text-muted-foreground">View and manage all church members</p>
          </div>
          <Button onClick={openAddSheet}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
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
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search members..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="w-full pl-9 sm:w-[220px]"
                  />
                </div>
                <Select
                  value={roleFilter}
                  onValueChange={(val) => {
                    setRoleFilter(val);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[140px]">
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
          <CardContent className="min-h-[540px] px-0">
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
              <>
                {/* Desktop table */}
                <div className="hidden md:block">
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
                          <TableCell className="max-w-[200px] truncate text-muted-foreground">
                            {member.email}
                          </TableCell>
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
                                className="border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400"
                              >
                                Enabled
                              </Badge>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="pr-6 text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => setDeleteConfirm(member.id)}
                              aria-label={`Delete ${member.firstName} ${member.lastName}`}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile card view */}
                <div className="divide-y md:hidden">
                  {members.map((member) => (
                    <div key={member.id} className="space-y-2 px-4 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {member.firstName} {member.lastName}
                          </span>
                          <Badge variant={getRoleBadgeVariant(member.role)} className="text-[10px]">
                            {member.role}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setDeleteConfirm(member.id)}
                          aria-label={`Delete ${member.firstName} ${member.lastName}`}
                        >
                          Delete
                        </Button>
                      </div>
                      <p className="truncate text-sm text-muted-foreground">{member.email}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Since {formatDate(member.membershipDate)}</span>
                        {member.mfaEnabled && (
                          <Badge
                            variant="outline"
                            className="border-green-200 bg-green-50 text-[10px] text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400"
                          >
                            MFA
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Pagination */}
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
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={!!deleteConfirm}
          onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
          title="Remove Member"
          description="Are you sure you want to remove this member? This action cannot be undone."
          confirmLabel="Remove"
          variant="destructive"
          loading={deleteLoading}
        />

        {/* Add Member Sheet */}
        <Sheet
          open={showAddSheet}
          onOpenChange={(open) => {
            if (!open && !addLoading) {
              setShowAddSheet(false);
              resetAddForm();
            }
          }}
        >
          <SheetContent
            side="right"
            className="flex w-full flex-col p-0 sm:max-w-lg"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            {/* Accent strip */}
            <div className="h-1 shrink-0 bg-gradient-to-r from-blue-500 to-indigo-600" />
            {/* Sheet header */}
            <div className="shrink-0 border-b bg-card px-6 pb-5 pt-4">
              <div className="flex items-start gap-4 pr-12">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-300/50 dark:shadow-blue-900/40">
                  {addSuccess ? (
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  ) : (
                    <UserPlus className="h-6 w-6 text-white" />
                  )}
                </div>
                <div className="min-w-0 flex-1 pt-1">
                  <SheetTitle className="text-xl font-bold tracking-tight">
                    {addSuccess ? 'Member Created!' : 'Add New Member'}
                  </SheetTitle>
                  <SheetDescription className="mt-1 text-sm">
                    {addSuccess
                      ? 'The member has been added to the directory.'
                      : 'Invite a new congregation member'}
                  </SheetDescription>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-muted/20 py-4">
              {addSuccess ? (
                /* ── Success State ── */
                <div className="flex flex-col items-center gap-6 px-6 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/30">
                    <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {addSuccess.firstName} {addSuccess.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">{addSuccess.email}</p>
                    <Badge variant={getRoleBadgeVariant(addSuccess.role)} className="mt-2">
                      {addSuccess.role}
                    </Badge>
                  </div>

                  <div className="w-full rounded-xl border border-amber-200 bg-amber-50 p-4 text-left dark:border-amber-800 dark:bg-amber-900/20">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                      Temporary Password
                    </p>
                    <code className="block rounded bg-white px-3 py-2 font-mono text-sm text-amber-900 shadow-sm dark:bg-black/30 dark:text-amber-200">
                      {addSuccess.temporaryPassword}
                    </code>
                    <p className="mt-2 text-xs text-amber-700 dark:text-amber-400/80">
                      Included in the invitation email. Member should change on first login.
                    </p>
                  </div>
                </div>
              ) : (
                /* ── Add Form ── */
                <form
                  id="add-member-form"
                  onSubmit={handleAddMember}
                  className="space-y-3 px-4 pb-2"
                >
                  {addError && (
                    <Alert variant="destructive">
                      <AlertDescription>{addError}</AlertDescription>
                    </Alert>
                  )}

                  {/* Personal Information Card */}
                  <div className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm">
                    <div className="flex items-center gap-3 border-b border-border/40 bg-muted/40 px-4 py-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <User className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-none">Personal Information</p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          Name and contact email
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3 p-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label
                            htmlFor="add-first-name"
                            className="text-xs font-medium text-muted-foreground"
                          >
                            First Name <span className="text-destructive">*</span>
                          </label>
                          <Input
                            id="add-first-name"
                            name="firstName"
                            autoComplete="given-name"
                            value={addFormData.firstName}
                            onChange={(e) =>
                              setAddFormData({ ...addFormData, firstName: e.target.value })
                            }
                            required
                            placeholder="Somchai"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label
                            htmlFor="add-last-name"
                            className="text-xs font-medium text-muted-foreground"
                          >
                            Last Name <span className="text-destructive">*</span>
                          </label>
                          <Input
                            id="add-last-name"
                            name="lastName"
                            autoComplete="family-name"
                            value={addFormData.lastName}
                            onChange={(e) =>
                              setAddFormData({ ...addFormData, lastName: e.target.value })
                            }
                            required
                            placeholder="Srisuk"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label
                          htmlFor="add-email"
                          className="text-xs font-medium text-muted-foreground"
                        >
                          Email Address <span className="text-destructive">*</span>
                        </label>
                        <Input
                          id="add-email"
                          type="email"
                          name="email"
                          autoComplete="email"
                          spellCheck={false}
                          autoCapitalize="none"
                          value={addFormData.email}
                          onChange={(e) =>
                            setAddFormData({ ...addFormData, email: e.target.value })
                          }
                          required
                          placeholder="somchai@example.com"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Access & Role Card */}
                  <div className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm">
                    <div className="flex items-center gap-3 border-b border-border/40 bg-muted/40 px-4 py-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                        <Shield className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-none">Access &amp; Role</p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          Permissions level
                        </p>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="space-y-1.5">
                        <label
                          htmlFor="add-role"
                          className="text-xs font-medium text-muted-foreground"
                        >
                          Role <span className="text-destructive">*</span>
                        </label>
                        <Select
                          value={addFormData.role}
                          onValueChange={(value: 'MEMBER' | 'STAFF' | 'ADMIN') =>
                            setAddFormData({ ...addFormData, role: value })
                          }
                        >
                          <SelectTrigger id="add-role">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MEMBER">
                              Member — Standard congregation member
                            </SelectItem>
                            <SelectItem value="STAFF">
                              Staff — Church staff with extra access
                            </SelectItem>
                            <SelectItem value="ADMIN">
                              Admin — Full administrative access
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Contact Details Card */}
                  <div className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm">
                    <div className="flex items-center gap-3 border-b border-border/40 bg-muted/40 px-4 py-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                        <Phone className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-none">Contact Details</p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          Optional phone and address
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3 p-4">
                      <div className="space-y-1.5">
                        <label
                          htmlFor="add-phone"
                          className="text-xs font-medium text-muted-foreground"
                        >
                          Phone{' '}
                          <span className="font-normal text-muted-foreground/70">(optional)</span>
                        </label>
                        <Input
                          id="add-phone"
                          type="tel"
                          name="phone"
                          autoComplete="tel"
                          inputMode="tel"
                          value={addFormData.phone}
                          onChange={(e) =>
                            setAddFormData({ ...addFormData, phone: e.target.value })
                          }
                          placeholder="+66 81 234 5678"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label
                          htmlFor="add-address"
                          className="text-xs font-medium text-muted-foreground"
                        >
                          Address{' '}
                          <span className="font-normal text-muted-foreground/70">(optional)</span>
                        </label>
                        <Textarea
                          id="add-address"
                          name="address"
                          autoComplete="street-address"
                          value={addFormData.address}
                          onChange={(e) =>
                            setAddFormData({ ...addFormData, address: e.target.value })
                          }
                          placeholder="123 Moo 4, Sing Buri"
                          rows={2}
                          className="resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </div>

            <SheetFooter className="shrink-0 border-t bg-card px-4 py-3 shadow-[0_-1px_8px_rgba(0,0,0,0.06)]">
              {addSuccess ? (
                <div className="flex w-full gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => resetAddForm()}>
                    Add Another
                  </Button>
                  <Button
                    className="flex-1 shadow-md shadow-primary/20"
                    onClick={() => {
                      setShowAddSheet(false);
                      resetAddForm();
                    }}
                  >
                    Done
                  </Button>
                </div>
              ) : (
                <div className="flex w-full gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowAddSheet(false);
                      resetAddForm();
                    }}
                    disabled={addLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    form="add-member-form"
                    className="flex-1 shadow-md shadow-primary/20"
                    disabled={addLoading}
                  >
                    {addLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating…
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Create Member
                      </>
                    )}
                  </Button>
                </div>
              )}
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </SidebarLayout>
  );
}
