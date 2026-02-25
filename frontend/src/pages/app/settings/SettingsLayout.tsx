/**
 * Settings Layout
 *
 * Unified settings page with horizontal tabs for Profile, Notifications, and Appearance.
 * Uses React Router nested routes with <Outlet /> for tab content.
 * Tab selection is synced with the URL path for deep-linking support.
 */

import { Outlet, useLocation, useNavigate } from 'react-router';
import { User, Bell, Palette } from 'lucide-react';
import { SidebarLayout } from '@/components/layout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SETTINGS_TABS = [
  { value: 'profile', label: 'Profile', icon: User },
  { value: 'notifications', label: 'Notifications', icon: Bell },
  { value: 'appearance', label: 'Appearance', icon: Palette },
] as const;

export default function SettingsLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  // Derive active tab from URL path
  const activeTab =
    SETTINGS_TABS.find((tab) => location.pathname.endsWith(`/${tab.value}`))?.value ?? 'profile';

  const activeLabel = SETTINGS_TABS.find((t) => t.value === activeTab)?.label ?? 'Settings';

  const breadcrumbs = [{ label: 'Settings', href: '/app/settings' }, { label: activeLabel }];

  return (
    <SidebarLayout breadcrumbs={breadcrumbs}>
      <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6 sm:px-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Tabs navigation */}
        <Tabs value={activeTab} onValueChange={(value) => navigate(`/app/settings/${value}`)}>
          <TabsList className="w-full">
            {SETTINGS_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="flex-1 gap-2">
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Tab content (rendered by React Router) — stable height avoids layout shifts */}
        <div className="min-h-[520px]">
          <Outlet />
        </div>
      </div>
    </SidebarLayout>
  );
}
