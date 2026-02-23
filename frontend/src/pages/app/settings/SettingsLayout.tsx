/**
 * Settings Layout
 *
 * Unified settings page with side navigation for Profile, Notifications, and Appearance.
 * Uses React Router nested routes with <Outlet /> for tab content.
 */

import { Outlet, NavLink, useLocation } from 'react-router';
import { User, Bell, Palette } from 'lucide-react';
import { SidebarLayout } from '@/components/layout';
import { cn } from '@/lib/utils';

const SETTINGS_NAV = [
  {
    title: 'Profile',
    href: '/app/settings/profile',
    icon: User,
    description: 'Personal info & privacy',
  },
  {
    title: 'Notifications',
    href: '/app/settings/notifications',
    icon: Bell,
    description: 'Email & push preferences',
  },
  {
    title: 'Appearance',
    href: '/app/settings/appearance',
    icon: Palette,
    description: 'Display & regional',
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
      <div className="mx-auto max-w-5xl space-y-8 p-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Layout: side nav + content */}
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Side navigation */}
          <nav className="w-full shrink-0 lg:w-52">
            {/* Horizontal scroll on mobile, vertical on desktop */}
            <div className="flex gap-1 overflow-x-auto lg:flex-col lg:gap-1">
              {SETTINGS_NAV.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center gap-3 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.title}</span>
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
