/**
 * MessagesListPage Component
 *
 * Displays inbox/sent messages with folder navigation and pagination
 */

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Inbox, Send, Mail, Trash2 } from 'lucide-react';
import { useMessages, useDeleteMessage } from '@/hooks/useMessages';
import { SidebarLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfirmDialog } from '@/components/features/shared/ConfirmDialog';
import { reportError } from '@/lib/errorReporting';
import { gooeyToast } from 'goey-toast';

const MSG_SKELETON_KEYS = ['msg-0', 'msg-1', 'msg-2', 'msg-3', 'msg-4'];

export function MessagesListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialFolder = (searchParams.get('folder') as 'inbox' | 'sent') || 'inbox';

  const { messages, loading, error, pagination, setPage, setFolder } = useMessages({
    folder: initialFolder,
    page: 1,
    limit: 20,
  });

  const { deleteMessage, loading: deleteLoading } = useDeleteMessage();
  const [activeFolder, setActiveFolder] = useState<'inbox' | 'sent'>(initialFolder);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string } | null>(null);

  const handleFolderChange = (folder: string) => {
    const newFolder = folder as 'inbox' | 'sent';
    setActiveFolder(newFolder);
    setFolder(newFolder);
  };

  const handleViewMessage = (messageId: string) => {
    navigate(`/app/messages/${messageId}`);
  };

  const handleCompose = () => {
    navigate('/app/messages/compose');
  };

  const handleDeleteClick = (messageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTarget({ id: messageId });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMessage(deleteTarget.id);
      gooeyToast.success('Message deleted');
      setFolder(activeFolder);
    } catch (err) {
      gooeyToast.error('Failed to delete message');
      reportError('Failed to delete message', err);
    } finally {
      setDeleteTarget(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getOtherPerson = (message: any) => {
    if (activeFolder === 'inbox') {
      return message.sender;
    }
    return message.recipient;
  };

  const content = (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-balance text-2xl font-bold sm:text-3xl">
            <Mail className="h-7 w-7 sm:h-8 sm:w-8" />
            Messages
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your private messages with church members
          </p>
        </div>
        <Button onClick={handleCompose} className="w-full sm:w-auto">
          <Mail className="mr-2 h-4 w-4" />
          Compose
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Tabs for Inbox/Sent */}
      <Tabs
        value={activeFolder}
        onValueChange={handleFolderChange}
        className="flex flex-1 flex-col"
      >
        <TabsList className="mb-4 w-fit">
          <TabsTrigger value="inbox" className="flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            Inbox
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Sent
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeFolder} className="flex-1">
          {/* Loading State */}
          {loading && (
            <Card>
              <CardContent className="p-0">
                {MSG_SKELETON_KEYS.map((key) => (
                  <div key={key} className="flex items-center gap-4 border-b p-4 last:border-b-0">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                    <Skeleton className="h-3 w-16" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Messages List */}
          {!loading && messages.length > 0 && (
            <Card>
              <CardContent className="p-0" role="list">
                {messages.map((message) => {
                  const person = getOtherPerson(message);
                  const isUnread = !message.isRead && activeFolder === 'inbox';
                  return (
                    <div
                      key={message.id}
                      className={`flex cursor-pointer items-start gap-3 border-b p-4 transition-colors last:border-b-0 hover:bg-muted/50 sm:items-center sm:gap-4 ${
                        isUnread ? 'border-l-2 border-l-primary bg-primary/5' : ''
                      }`}
                      onClick={() => handleViewMessage(message.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleViewMessage(message.id);
                        }
                      }}
                      role="listitem"
                      tabIndex={0}
                      aria-label={`Message from ${person ? `${person.firstName} ${person.lastName}` : 'Unknown'}: ${message.subject}`}
                    >
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarFallback>
                          {person ? getInitials(person.firstName, person.lastName) : '??'}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`truncate text-sm font-medium sm:text-base ${
                              isUnread ? 'font-semibold' : ''
                            }`}
                          >
                            {person ? `${person.firstName} ${person.lastName}` : 'Unknown'}
                          </span>
                          {isUnread && (
                            <Badge variant="secondary" className="text-xs">
                              New
                            </Badge>
                          )}
                          <span className="ml-auto hidden text-xs text-muted-foreground sm:inline">
                            {formatDate(message.sentAt)}
                          </span>
                        </div>
                        <p
                          className={`truncate text-sm ${
                            isUnread ? 'font-medium text-foreground' : 'text-muted-foreground'
                          }`}
                        >
                          {message.subject}
                        </p>
                        <span className="mt-1 block text-xs text-muted-foreground sm:hidden">
                          {formatDate(message.sentAt)}
                        </span>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete message"
                        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={(e) => handleDeleteClick(message.id, e)}
                        disabled={deleteLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!loading && messages.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                {activeFolder === 'inbox' ? (
                  <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
                ) : (
                  <Send className="mx-auto h-12 w-12 text-muted-foreground" />
                )}
                <h3 className="mt-4 text-lg font-semibold">
                  No {activeFolder === 'inbox' ? 'inbox' : 'sent'} messages
                </h3>
                <p className="mt-2 text-muted-foreground">
                  {activeFolder === 'inbox'
                    ? 'You don\u2019t have any messages yet'
                    : 'You haven\u2019t sent any messages yet'}
                </p>
                {activeFolder === 'inbox' && (
                  <Button className="mt-4" onClick={handleCompose}>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Your First Message
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
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
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <SidebarLayout breadcrumbs={[{ label: 'Messages' }]}>
      {content}
      <ConfirmDialog
        open={!!deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        title="Delete Message"
        description="Are you sure you want to delete this message? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        loading={deleteLoading}
      />
    </SidebarLayout>
  );
}
