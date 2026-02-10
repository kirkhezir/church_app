/**
 * MessageDetailPage Component
 *
 * Displays a single message with full content and reply options
 */

import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Reply, Trash2, Clock, Mail } from 'lucide-react';
import { useMessageDetail, useDeleteMessage } from '@/hooks/useMessages';
import { useAuth } from '@/hooks/useAuth';
import { SidebarLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export function MessageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { message, loading, error } = useMessageDetail({
    messageId: id || '',
  });

  const { deleteMessage, loading: deleteLoading } = useDeleteMessage();

  const handleReply = () => {
    if (message && message.sender) {
      navigate(`/app/messages/compose?to=${message.sender.id}&subject=Re: ${message.subject}`);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this message?')) {
      try {
        await deleteMessage(id || '');
        navigate('/app/messages');
      } catch (err) {
        console.error('Failed to delete message:', err);
      }
    }
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const isSender = user?.id === message?.senderId;

  const content = (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate('/app/messages')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Messages
      </Button>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
            <Skeleton className="mt-6 h-6 w-3/4" />
            <div className="mt-6 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Message Content */}
      {!loading && message && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    {message.sender
                      ? getInitials(message.sender.firstName, message.sender.lastName)
                      : '??'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {message.sender
                        ? `${message.sender.firstName} ${message.sender.lastName}`
                        : 'Unknown Sender'}
                    </span>
                    {isSender && (
                      <Badge variant="secondary" className="text-xs">
                        You
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    To:{' '}
                    {message.recipient
                      ? `${message.recipient.firstName} ${message.recipient.lastName}`
                      : 'Unknown'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isSender && (
                  <Button variant="outline" size="sm" onClick={handleReply}>
                    <Reply className="mr-2 h-4 w-4" />
                    Reply
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{formatDateTime(message.sentAt)}</span>
                {message.isRead && message.readAt && (
                  <>
                    <span className="mx-2">•</span>
                    <span>Read {formatDateTime(message.readAt)}</span>
                  </>
                )}
              </div>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="pt-6">
            <h2 className="mb-4 text-xl font-semibold">{message.subject}</h2>
            <div className="whitespace-pre-wrap text-foreground">{message.body}</div>
          </CardContent>
        </Card>
      )}

      {/* Not Found */}
      {!loading && !message && !error && (
        <Card>
          <CardContent className="py-12 text-center">
            <Mail className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Message not found</h3>
            <p className="mt-2 text-muted-foreground">
              This message doesn&apos;t exist or has been deleted.
            </p>
            <Button variant="outline" className="mt-4" onClick={() => navigate('/app/messages')}>
              Back to Messages
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return <SidebarLayout>{content}</SidebarLayout>;
}
