import React from 'react';
import { Link } from 'react-router-dom';
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
import { MobileBottomNav } from '@/components/features/mobile/MobileBottomNav';

interface SidebarLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

/**
 * Sidebar Layout Component
 * Main layout with collapsible sidebar navigation and mobile bottom nav
 */
export const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children, breadcrumbs }) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4">
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
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 pb-20 md:pb-4">{children}</main>

        {/* Mobile Bottom Navigation - only visible on small screens */}
        <MobileBottomNav />
      </SidebarInset>
    </SidebarProvider>
  );
};
