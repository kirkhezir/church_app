/**
 * Settings Page
 *
 * User settings including push notifications and preferences
 */

import { PushNotificationSettings } from '@/components/features/settings/PushNotificationSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings, Palette, Globe, Bell } from 'lucide-react';
import { SidebarLayout } from '@/components/layout';

export default function SettingsPage() {
  const breadcrumbs = [{ label: 'Settings' }];

  return (
    <SidebarLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <Settings className="h-8 w-8" />
            Settings
          </h1>
          <p className="text-muted-foreground">Manage your account preferences and notifications</p>
        </div>

        {/* Notifications Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Notifications</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <PushNotificationSettings />

            {/* Email Notifications Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Email Notifications</CardTitle>
                <CardDescription>Choose what notifications you receive via email</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-events">Event Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about upcoming events you've RSVP'd to
                    </p>
                  </div>
                  <Switch id="email-events" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-announcements">Announcements</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive important church announcements
                    </p>
                  </div>
                  <Switch id="email-announcements" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-messages">Direct Messages</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when someone sends you a message
                    </p>
                  </div>
                  <Switch id="email-messages" defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Appearance Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Appearance</h2>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Display Preferences</CardTitle>
              <CardDescription>Customize how the app appears to you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="compact-mode">Compact Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Use a more condensed layout with smaller elements
                  </p>
                </div>
                <Switch id="compact-mode" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="reduce-motion">Reduce Motion</Label>
                  <p className="text-sm text-muted-foreground">
                    Minimize animations throughout the app
                  </p>
                </div>
                <Switch id="reduce-motion" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Language & Region Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Language & Region</h2>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Regional Settings</CardTitle>
              <CardDescription>Set your preferred language and date format</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Language and regional settings will be available in a future update.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
}
