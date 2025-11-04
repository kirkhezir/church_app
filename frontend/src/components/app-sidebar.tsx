import * as React from 'react';
import { Calendar, Home, Megaphone, Mail, Users, User, Settings, Bell } from 'lucide-react';
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

  // Profile and Settings items
  const settingsItems = [
    {
      title: 'Profile',
      url: '/profile/edit',
      icon: User,
    },
    {
      title: 'Notifications',
      url: '/profile/notifications',
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
              <a href="/">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                  <span className="text-sm font-bold text-white">SB</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Sing Buri Adventist</span>
                  <span className="truncate text-xs">ศูนย์แอดเวนตีสต์สิงห์บุรี</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavMain items={settingsItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
