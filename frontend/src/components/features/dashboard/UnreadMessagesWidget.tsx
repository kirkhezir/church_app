/**
 * Unread Messages Widget
 *
 * Shows the last 3 unread messages with sender name, subject preview, and time.
 */

import { Link } from 'react-router';
import { memo } from 'react';
import { MessageSquare, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';

interface RecentMessage {
  id: string;
  senderId: string;
  subject: string;
  sentAt: string;
  isRead: boolean;
}

interface UnreadMessagesWidgetProps {
  messages: RecentMessage[];
  unreadCount: number;
}

export const UnreadMessagesWidget = memo(function UnreadMessagesWidget({
  messages = [],
  unreadCount,
}: UnreadMessagesWidgetProps) {
  if (!messages || messages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-6 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <MessageSquare className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No unread messages</p>
            <Link to="/app/messages" className="mt-2">
              <Button variant="link" size="sm">
                Go to Messages
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          Messages
          {unreadCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-purple-600 px-1.5 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </CardTitle>
        <Link to="/app/messages">
          <Button variant="ghost" size="sm" className="gap-1">
            View All
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {messages.map((message) => {
            const sentDate = new Date(message.sentAt);
            const timeAgo = getRelativeTime(sentDate);

            return (
              <Link
                key={message.id}
                to="/app/messages"
                className="block rounded-lg border border-border/50 p-3 transition-all duration-200 hover:-translate-y-px hover:border-primary/20 hover:bg-accent/50 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">{message.subject}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{timeAgo}</p>
                  </div>
                  {!message.isRead && (
                    <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-purple-500" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
});

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
