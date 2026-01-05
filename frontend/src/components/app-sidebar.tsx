import * as React from 'react';
import {
  Calendar,
  Home,
  Megaphone,
  Mail,
  Users,
  User,
  Settings,
  Bell,
  Shield,
  FileText,
  Download,
  Activity,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  // Main navigation items for all authenticated users
  const navMain = [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: Home,
      isActive: true,
    },
    {
      title: 'Events',
      url: '/events',
      icon: Calendar,
    },
    {
      title: 'Announcements',
      url: '/announcements',
      icon: Megaphone,
    },
    {
      title: 'Messages',
      url: '/messages',
      icon: Mail,
    },
  ];

  // Add Members link for admin and staff
  if (user.role === 'ADMIN' || user.role === 'STAFF') {
    navMain.push({
      title: 'Members',
      url: '/members',
      icon: Users,
    });
  }

  // Admin-only navigation items
  const adminItems =
    user.role === 'ADMIN'
      ? [
          {
            title: 'Admin Panel',
            url: '/admin/members',
            icon: Shield,
          },
          {
            title: 'Analytics',
            url: '/admin/analytics',
            icon: BarChart3,
          },
          {
            title: 'Reports',
            url: '/admin/reports',
            icon: FileText,
          },
          {
            title: 'System Health',
            url: '/admin/health',
            icon: Activity,
          },
          {
            title: 'Audit Logs',
            url: '/admin/audit-logs',
            icon: FileText,
          },
          {
            title: 'Data Export',
            url: '/admin/export',
            icon: Download,
          },
        ]
      : [];

  // Profile and Settings items
  const settingsItems = [
    {
      title: 'Profile',
      url: '/profile',
      icon: User,
    },
    {
      title: 'Notifications',
      url: '/notifications',
      icon: Bell,
    },
    {
      title: 'Settings',
      url: '/settings',
      icon: Settings,
    },
  ];

  const userData = {
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    avatar: '', // Can be added later
    role: user.role,
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-white">
                  <img
                    src="/church-logo.png"
                    alt="Sing Buri Adventist Center"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Sing Buri Adventist</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        {adminItems.length > 0 && <NavMain items={adminItems} label="Administration" />}
        <NavMain items={settingsItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
