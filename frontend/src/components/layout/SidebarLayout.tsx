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
import { useNotificationCounts } from '@/hooks/useNotificationCounts';
import { Sun, Moon, Bell, MessageSquare, Megaphone, HeartHandshake } from 'lucide-react';

interface SidebarLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

/**
 * Sidebar Layout Component
 * Main layout with collapsible sidebar navigation and mobile bottom nav.
 * The notification bell fetches its own count internally — no prop required.
 */
export const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children, breadcrumbs }) => {
  const { resolvedTheme, setTheme } = useTheme();
  const counts = useNotificationCounts();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Sticky header — stays visible as page scrolls */}
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
            {/* Notification bell — opens a mini-panel with all notification sources */}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label={
                    counts.total > 0
                      ? `${counts.total} notification${counts.total === 1 ? '' : 's'}`
                      : 'Notifications'
                  }
                >
                  <Bell className="h-4 w-4" />
                  {counts.total > 0 && (
                    <span
                      className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white"
                      aria-hidden="true"
                    >
                      {counts.total > 99 ? '99+' : counts.total}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72 p-0">
                <div className="border-b px-4 py-3">
                  <p className="text-sm font-semibold">Notifications</p>
                </div>
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
                </div>
                {counts.total === 0 && (
                  <p className="px-4 py-4 text-center text-xs text-muted-foreground">
                    You&apos;re all caught up!
                  </p>
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
        <main className="flex flex-1 flex-col gap-4 p-4 pb-20 md:pb-4">{children}</main>

        {/* Mobile Bottom Navigation - only visible on small screens */}
        <MobileBottomNav />
      </SidebarInset>
    </SidebarProvider>
  );
};
