/**
 * Member Bulk Actions Component
 *
 * Provides bulk operations for selected members
 */

import { useState } from 'react';
import {
  CheckSquare,
  Mail,
  UserX,
  UserCheck,
  Download,
  Trash2,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Textarea } from '../../../components/ui/textarea';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface MemberBulkActionsProps {
  selectedMembers: Member[];
  onClearSelection: () => void;
  onBulkEmail: (memberIds: string[], subject: string, message: string) => Promise<void>;
  onBulkStatusChange: (memberIds: string[], status: 'ACTIVE' | 'INACTIVE') => Promise<void>;
  onBulkExport: (memberIds: string[]) => Promise<void>;
  onBulkDelete?: (memberIds: string[]) => Promise<void>;
}

export function MemberBulkActions({
  selectedMembers,
  onClearSelection,
  onBulkEmail,
  onBulkStatusChange,
  onBulkExport,
  onBulkDelete,
}: MemberBulkActionsProps) {
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleBulkEmail = async () => {
    if (!emailSubject || !emailMessage) return;

    setIsLoading(true);
    try {
      await onBulkEmail(
        selectedMembers.map((m) => m.id),
        emailSubject,
        emailMessage
      );
      setIsEmailDialogOpen(false);
      setEmailSubject('');
      setEmailMessage('');
      onClearSelection();
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDeactivate = async () => {
    setIsLoading(true);
    try {
      await onBulkStatusChange(
        selectedMembers.map((m) => m.id),
        'INACTIVE'
      );
      setIsDeactivateDialogOpen(false);
      onClearSelection();
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkActivate = async () => {
    setIsLoading(true);
    try {
      await onBulkStatusChange(
        selectedMembers.map((m) => m.id),
        'ACTIVE'
      );
      onClearSelection();
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkExport = async () => {
    setIsLoading(true);
    try {
      await onBulkExport(selectedMembers.map((m) => m.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!onBulkDelete) return;

    setIsLoading(true);
    try {
      await onBulkDelete(selectedMembers.map((m) => m.id));
      setIsDeleteDialogOpen(false);
      onClearSelection();
    } finally {
      setIsLoading(false);
    }
  };

  if (selectedMembers.length === 0) {
    return null;
  }

  return (
    <>
      {/* Bulk Actions Bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between rounded-lg bg-primary/10 p-4">
        <div className="flex items-center gap-4">
          <CheckSquare className="h-5 w-5 text-primary" />
          <span className="font-medium">
            {selectedMembers.length} member{selectedMembers.length > 1 ? 's' : ''} selected
          </span>
          <Button variant="ghost" size="sm" onClick={onClearSelection}>
            Clear Selection
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEmailDialogOpen(true)}>
            <Mail className="mr-2 h-4 w-4" />
            Send Email
          </Button>

          <Button variant="outline" size="sm" onClick={handleBulkExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleBulkActivate}>
                <UserCheck className="mr-2 h-4 w-4" />
                Activate Selected
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsDeactivateDialogOpen(true)}>
                <UserX className="mr-2 h-4 w-4" />
                Deactivate Selected
              </DropdownMenuItem>
              {onBulkDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Selected
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Email Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Bulk Email</DialogTitle>
            <DialogDescription>
              Send an email to {selectedMembers.length} selected member
              {selectedMembers.length > 1 ? 's' : ''}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Recipients</Label>
              <div className="flex flex-wrap gap-1 rounded-md border p-2">
                {selectedMembers.slice(0, 5).map((member) => (
                  <Badge key={member.id} variant="secondary">
                    {member.firstName} {member.lastName}
                  </Badge>
                ))}
                {selectedMembers.length > 5 && (
                  <Badge variant="outline">+{selectedMembers.length - 5} more</Badge>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Email subject..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                placeholder="Type your message..."
                rows={6}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBulkEmail}
              disabled={!emailSubject || !emailMessage || isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate Confirmation Dialog */}
      <AlertDialog open={isDeactivateDialogOpen} onOpenChange={setIsDeactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Members</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate {selectedMembers.length} member
              {selectedMembers.length > 1 ? 's' : ''}? They will no longer be able to log in to the
              system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDeactivate} disabled={isLoading}>
              {isLoading ? 'Deactivating...' : 'Deactivate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Members</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {selectedMembers.length}{' '}
              member
              {selectedMembers.length > 1 ? 's' : ''} and all their associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
