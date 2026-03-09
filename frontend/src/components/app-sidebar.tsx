import { useMemo } from 'react';
import {
  Calendar,
  Home,
  Megaphone,
  Mail,
  Users,
  Settings,
  Shield,
  FileText,
  Download,
  Activity,
  BarChart3,
  BookOpen,
  Newspaper,
  Image,
  HeartHandshake,
  PenSquare,
  Monitor,
  ClipboardList,
} from 'lucide-react';
import { Link } from 'react-router';
import { useAuth } from '@/hooks/useAuth';

import { NavMain } from '@/components/nav-main';
import { NavMainCollapsible, type NavCollapsibleItem } from '@/components/nav-main-collapsible';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

// ─── Static navigation items — hoisted outside render ──────────────────────

/** Core app navigation visible to all authenticated members. */
const BASE_NAV = [
  { title: 'Home', url: '/app/dashboard', icon: Home },
  { title: 'Events', url: '/app/events', icon: Calendar },
  { title: 'Announcements', url: '/app/announcements', icon: Megaphone },
  { title: 'Messages', url: '/app/messages', icon: Mail },
  { title: 'Sermons', url: '/app/sermons', icon: BookOpen },
  { title: 'Prayer Wall', url: '/app/prayer', icon: HeartHandshake },
  { title: 'Blog', url: '/app/blog', icon: Newspaper },
  { title: 'Gallery', url: '/app/gallery', icon: Image },
];

const MEMBERS_ITEM = { title: 'Members', url: '/app/members', icon: Users };
const SETTINGS_ITEM = { title: 'Settings', url: '/app/settings', icon: Settings };

/** Admin-only navigation with collapsible sub-groups. */
const ADMIN_NAV: NavCollapsibleItem[] = [
  { title: 'Members', url: '/app/admin/members', icon: Shield },
  {
    title: 'Content',
    url: '#',
    icon: PenSquare,
    items: [
      { title: 'Sermons', url: '/app/admin/sermons', icon: BookOpen },
      { title: 'Blog', url: '/app/admin/blog', icon: Newspaper },
      { title: 'Gallery', url: '/app/admin/gallery', icon: Image },
      { title: 'Prayer', url: '/app/admin/prayer', icon: HeartHandshake },
    ],
  },
  {
    title: 'Monitoring',
    url: '#',
    icon: Monitor,
    items: [
      { title: 'Analytics', url: '/app/admin/analytics', icon: BarChart3 },
      { title: 'Reports', url: '/app/admin/reports', icon: FileText },
      { title: 'System Health', url: '/app/admin/health', icon: Activity },
      { title: 'Audit Logs', url: '/app/admin/audit-logs', icon: ClipboardList },
      { title: 'Data Export', url: '/app/admin/export', icon: Download },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isAuthenticated } = useAuth();

  // Memoize computed nav arrays to avoid re-creation on every render
  const navMain = useMemo(() => {
    if (!user) return BASE_NAV;
    const isAdminOrStaff = user.role === 'ADMIN' || user.role === 'STAFF';
    return isAdminOrStaff ? [...BASE_NAV, MEMBERS_ITEM] : BASE_NAV;
  }, [user]);

  const showAdmin = user?.role === 'ADMIN';

  const userData = useMemo(
    () =>
      user
        ? {
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            avatar: '',
            role: user.role,
          }
        : null,
    [user]
  );

  if (!isAuthenticated || !userData) {
    return null;
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/app/dashboard">
                <img
                  src="/church-logo.png"
                  alt="Sing Buri Adventist Center"
                  className="h-8 w-8 shrink-0 rounded-lg object-contain"
                />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Sing Buri Adventist</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMain} />

        {showAdmin && (
          <>
            <SidebarSeparator />
            <NavMainCollapsible items={ADMIN_NAV} label="Administration" />
          </>
        )}

        <SidebarSeparator />
        <NavMain items={[SETTINGS_ITEM]} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
