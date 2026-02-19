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

// Static navigation items — hoisted to avoid re-creation on every render
const SETTINGS_ITEMS = [
  { title: 'Profile', url: '/app/profile', icon: User },
  { title: 'Notifications', url: '/app/notifications', icon: Bell },
  { title: 'Settings', url: '/app/settings', icon: Settings },
];

const ADMIN_ITEMS = [
  { title: 'Admin Panel', url: '/app/admin/members', icon: Shield },
  { title: 'Analytics', url: '/app/admin/analytics', icon: BarChart3 },
  { title: 'Reports', url: '/app/admin/reports', icon: FileText },
  { title: 'System Health', url: '/app/admin/health', icon: Activity },
  { title: 'Audit Logs', url: '/app/admin/audit-logs', icon: FileText },
  { title: 'Data Export', url: '/app/admin/export', icon: Download },
];

const BASE_NAV = [
  { title: 'Dashboard', url: '/app/dashboard', icon: Home, isActive: true },
  { title: 'Events', url: '/app/events', icon: Calendar },
  { title: 'Announcements', url: '/app/announcements', icon: Megaphone },
  { title: 'Messages', url: '/app/messages', icon: Mail },
];

const MEMBERS_ITEM = { title: 'Members', url: '/app/members', icon: Users };

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  const isAdminOrStaff = user.role === 'ADMIN' || user.role === 'STAFF';
  const navMain = isAdminOrStaff ? [...BASE_NAV, MEMBERS_ITEM] : [...BASE_NAV];
  const adminItems = user.role === 'ADMIN' ? ADMIN_ITEMS : [];

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
              <a href="/app/dashboard">
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
        <NavMain items={SETTINGS_ITEMS} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
