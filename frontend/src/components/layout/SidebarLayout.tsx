import React from 'react';
import { Link } from 'react-router';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MobileBottomNav } from '@/components/features/mobile/MobileBottomNav';
import { useTheme } from '@/hooks/useTheme';
import { useNotifications } from '@/contexts/NotificationContext';
import {
  Sun,
  Moon,
  Bell,
  MessageSquare,
  Megaphone,
  HeartHandshake,
  Heart,
  Calendar,
  AlertTriangle,
  CheckCheck,
} from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const TYPE_META: Record<string, { icon: React.ElementType; color: string; badgeColor: string }> = {
  message: { icon: MessageSquare, color: 'text-sky-500', badgeColor: 'bg-sky-500' },
  announcement: { icon: Megaphone, color: 'text-blue-500', badgeColor: 'bg-blue-500' },
  announcement_urgent: { icon: AlertTriangle, color: 'text-red-500', badgeColor: 'bg-red-500' },
  prayer_approved: { icon: Heart, color: 'text-rose-500', badgeColor: 'bg-rose-500' },
  prayer_pending: { icon: HeartHandshake, color: 'text-amber-500', badgeColor: 'bg-amber-500' },
  event_update: { icon: Calendar, color: 'text-emerald-500', badgeColor: 'bg-emerald-500' },
};

const FALLBACK_META = {
  icon: Bell,
  color: 'text-muted-foreground',
  badgeColor: 'bg-muted-foreground',
};

// ─── Component ────────────────────────────────────────────────────────────────

interface SidebarLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

/**
 * Sidebar Layout Component
 * Main layout with collapsible sidebar navigation and mobile bottom nav.
 * The notification bell uses NotificationContext for real-time items + counts.
 */
export const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children, breadcrumbs }) => {
  const { resolvedTheme, setTheme } = useTheme();
  const { items, counts, unreadCount, markAllRead, markRead } = useNotifications();

  // Total badge = WS unread items OR DB total, whichever is higher
  const badgeCount = Math.max(unreadCount, counts.total);

  return (
    <SidebarProvider>
      {/* Skip-to-content link — first focusable element for keyboard/screen-reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:shadow-md focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>
      <AppSidebar />
      <SidebarInset>
        {/* Sticky header */}
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          {breadcrumbs && breadcrumbs.length > 0 && (
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((breadcrumb, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {breadcrumb.href ? (
                        <BreadcrumbLink asChild>
                          <Link to={breadcrumb.href}>{breadcrumb.label}</Link>
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          )}

          {/* Right-side controls */}
          <div className="ml-auto flex items-center gap-1">
            {/* Notification bell */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label={
                    badgeCount > 0
                      ? `${badgeCount} unread notification${badgeCount === 1 ? '' : 's'}`
                      : 'Notifications'
                  }
                >
                  <Bell className="h-4 w-4" />
                  {badgeCount > 0 && (
                    <span
                      className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white"
                      aria-hidden="true"
                    >
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </span>
                  )}
                </button>
              </PopoverTrigger>

              <PopoverContent align="end" className="w-80 p-0" sideOffset={8}>
                {/* Header */}
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <p className="text-sm font-semibold">Notifications</p>
                  {items.some((i) => !i.read) && (
                    <button
                      onClick={markAllRead}
                      className="flex items-center gap-1 rounded px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      aria-label="Mark all notifications as read"
                    >
                      <CheckCheck className="h-3 w-3" />
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notification items (WS-driven, session-scoped) */}
                {items.length > 0 ? (
                  <div className="max-h-[360px] overflow-y-auto">
                    {items.slice(0, 12).map((item) => {
                      const meta = TYPE_META[item.type] ?? FALLBACK_META;
                      const Icon = meta.icon;
                      return (
                        <Link
                          key={item.id}
                          to={item.href}
                          onClick={() => markRead(item.id)}
                          className={`flex items-start gap-3 border-b px-4 py-3 text-sm transition-colors last:border-0 hover:bg-muted/60 ${
                            item.read ? 'opacity-60' : ''
                          }`}
                        >
                          {/* Icon bubble */}
                          <span
                            className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-muted ${meta.color}`}
                            aria-hidden="true"
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </span>

                          <div className="min-w-0 flex-1">
                            <p
                              className={`truncate text-[13px] leading-snug ${
                                item.read
                                  ? 'font-normal text-foreground/70'
                                  : 'font-medium text-foreground'
                              }`}
                            >
                              {item.title}
                            </p>
                            {item.body && (
                              <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                                {item.body}
                              </p>
                            )}
                            <p className="mt-1 text-[10px] text-muted-foreground/70">
                              {formatRelativeTime(item.createdAt)}
                            </p>
                          </div>

                          {/* Unread dot */}
                          {!item.read && (
                            <span
                              className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${meta.badgeColor}`}
                              aria-hidden="true"
                            />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  /* Fallback: category rows when no WS items yet (e.g., first load) */
                  <div className="flex flex-col py-1">
                    {/* Messages */}
                    <Link
                      to="/app/messages"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-muted"
                    >
                      <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="flex-1 text-foreground">Messages</span>
                      {counts.messages > 0 ? (
                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                          {counts.messages > 99 ? '99+' : counts.messages}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">0</span>
                      )}
                    </Link>

                    {/* Announcements */}
                    <Link
                      to="/app/announcements"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-muted"
                    >
                      <Megaphone className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="flex-1 text-foreground">Announcements</span>
                      {counts.announcements > 0 ? (
                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-500 px-1.5 text-[10px] font-bold text-white">
                          {counts.announcements > 99 ? '99+' : counts.announcements}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">0</span>
                      )}
                    </Link>

                    {/* Prayer Requests — admin/staff only */}
                    {counts.prayerRequests > 0 && (
                      <Link
                        to="/app/admin/prayer"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-muted"
                      >
                        <HeartHandshake className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="flex-1 text-foreground">Prayer Requests</span>
                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white">
                          {counts.prayerRequests > 99 ? '99+' : counts.prayerRequests}
                        </span>
                      </Link>
                    )}

                    {counts.total === 0 && (
                      <p className="px-4 py-5 text-center text-xs text-muted-foreground">
                        You&apos;re all caught up!
                      </p>
                    )}
                  </div>
                )}
              </PopoverContent>
            </Popover>

            {/* Theme toggle */}
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          </div>
        </header>
        <main id="main-content" className="flex flex-1 flex-col gap-4 p-4 pb-20 md:pb-4">
          {children}
        </main>

        {/* Mobile Bottom Navigation - only visible on small screens */}
        <MobileBottomNav />
      </SidebarInset>
    </SidebarProvider>
  );
};
