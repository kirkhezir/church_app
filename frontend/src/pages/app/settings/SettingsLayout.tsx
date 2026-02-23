/**
 * Settings Layout
 *
 * Unified settings page with side navigation for Profile, Notifications, and Appearance.
 * Uses React Router nested routes with <Outlet /> for tab content.
 */

import { Outlet, NavLink, useLocation } from 'react-router';
import { User, Bell, Palette, Settings } from 'lucide-react';
import { SidebarLayout } from '@/components/layout';
import { cn } from '@/lib/utils';

const SETTINGS_NAV = [
  {
    title: 'Profile',
    href: '/app/settings/profile',
    icon: User,
    description: 'Personal information & privacy',
  },
  {
    title: 'Notifications',
    href: '/app/settings/notifications',
    icon: Bell,
    description: 'Email & push notification preferences',
  },
  {
    title: 'Appearance',
    href: '/app/settings/appearance',
    icon: Palette,
    description: 'Display and regional settings',
  },
] as const;

export default function SettingsLayout() {
  const location = useLocation();

  const activeTab = SETTINGS_NAV.find((item) => location.pathname === item.href);

  const breadcrumbs = [
    { label: 'Settings', href: '/app/settings' },
    ...(activeTab ? [{ label: activeTab.title }] : []),
  ];

  return (
    <SidebarLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <Settings className="h-8 w-8" />
            Settings
          </h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        {/* Layout: side nav + content */}
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Side navigation — horizontal on mobile, vertical on desktop */}
          <nav className="w-full shrink-0 lg:w-56">
            <div className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:gap-0.5 lg:overflow-x-visible lg:pb-0">
              {SETTINGS_NAV.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <div className="min-w-0">
                    <div>{item.title}</div>
                    <div className="hidden text-xs font-normal text-muted-foreground lg:block">
                      {item.description}
                    </div>
                  </div>
                </NavLink>
              ))}
            </div>
          </nav>

          {/* Content area */}
          <div className="min-w-0 flex-1">
            <Outlet />
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
