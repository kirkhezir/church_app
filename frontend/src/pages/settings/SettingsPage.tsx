/**
 * Settings Page
 *
 * User settings including push notifications and preferences
 */

import { PushNotificationSettings } from '@/components/features/settings/PushNotificationSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <Settings className="h-8 w-8" />
          Settings
        </h1>
        <p className="text-muted-foreground">Manage your account preferences and notifications</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PushNotificationSettings />

        {/* Placeholder for future settings */}
        <Card>
          <CardHeader>
            <CardTitle>Display Preferences</CardTitle>
            <CardDescription>Customize how the app appears to you</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Additional display settings coming soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
