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

  const handleDelete = async (messageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this message?')) {
      try {
        await deleteMessage(messageId);
        // Refresh the list
        setFolder(activeFolder);
      } catch (err) {
        console.error('Failed to delete message:', err);
      }
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
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-balance text-3xl font-bold">
            <Mail className="h-8 w-8" />
            Messages
          </h1>
          <p className="mt-2 text-muted-foreground">Your private messages with church members</p>
        </div>
        <Button onClick={handleCompose}>
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
      <Tabs value={activeFolder} onValueChange={handleFolderChange} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="inbox" className="flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            Inbox
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Sent
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeFolder}>
          {/* Loading State */}
          {loading && (
            <Card>
              <CardContent className="p-0">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 border-b p-4 last:border-b-0">
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
              <CardContent className="p-0">
                {messages.map((message) => {
                  const person = getOtherPerson(message);
                  return (
                    <div
                      key={message.id}
                      className={`flex cursor-pointer items-center gap-4 border-b p-4 transition-colors last:border-b-0 hover:bg-muted/50 ${
                        !message.isRead && activeFolder === 'inbox' ? 'bg-primary/5' : ''
                      }`}
                      onClick={() => handleViewMessage(message.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleViewMessage(message.id);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {person ? getInitials(person.firstName, person.lastName) : '??'}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`truncate font-medium ${
                              !message.isRead && activeFolder === 'inbox' ? 'font-semibold' : ''
                            }`}
                          >
                            {person ? `${person.firstName} ${person.lastName}` : 'Unknown'}
                          </span>
                          {!message.isRead && activeFolder === 'inbox' && (
                            <Badge variant="default" className="text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                        <p
                          className={`truncate text-sm ${
                            !message.isRead && activeFolder === 'inbox'
                              ? 'font-medium text-foreground'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {message.subject}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(message.sentAt)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={(e) => handleDelete(message.id, e)}
                          disabled={deleteLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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

  return <SidebarLayout>{content}</SidebarLayout>;
}
