/**
 * Notification Settings
 *
 * Allows members to manage their email and push notification preferences.
 * Rendered inside SettingsLayout as a nested route.
 * Merges content from the old NotificationSettingsPage and SettingsPage notification section.
 */

import { useState, useEffect, FormEvent } from 'react';
import { PushNotificationSettings } from '@/components/features/settings/PushNotificationSettings';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { apiClient } from '@/services/api/apiClient';
import { gooeyToast } from 'goey-toast';

export default function NotificationSettings() {
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [emailEvents, setEmailEvents] = useState(true);
  const [emailAnnouncements, setEmailAnnouncements] = useState(true);
  const [emailMessages, setEmailMessages] = useState(true);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = (await apiClient.get('/members/me')) as {
        emailNotifications: boolean;
        emailEvents?: boolean;
        emailAnnouncements?: boolean;
        emailMessages?: boolean;
      };
      setEmailNotifications(response.emailNotifications);
      setEmailEvents(response.emailEvents ?? true);
      setEmailAnnouncements(response.emailAnnouncements ?? true);
      setEmailMessages(response.emailMessages ?? true);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load notification preferences');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = (await apiClient.patch('/members/me/notifications', {
        emailNotifications,
        emailEvents,
        emailAnnouncements,
        emailMessages,
      })) as { success: boolean; message: string };

      if (response.success) {
        gooeyToast.success('Notification preferences updated successfully!');
      } else {
        setError(response.message || 'Failed to update notification preferences');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; error?: string } } };
      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          'An error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">Loading preferences...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Push Notifications */}
      <PushNotificationSettings />

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Email Notifications</CardTitle>
          <CardDescription>Manage how you receive email updates from the church</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="emailNotifications"
                    className="cursor-pointer text-base font-medium"
                  >
                    Enable Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications for announcements, events, and messages
                  </p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                  disabled={loading}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-events">Event Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about upcoming events you&apos;ve RSVP&apos;d to
                  </p>
                </div>
                <Switch
                  id="email-events"
                  checked={emailEvents}
                  onCheckedChange={setEmailEvents}
                  disabled={loading || !emailNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-announcements">Announcements</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive important church announcements
                  </p>
                </div>
                <Switch
                  id="email-announcements"
                  checked={emailAnnouncements}
                  onCheckedChange={setEmailAnnouncements}
                  disabled={loading || !emailNotifications}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-messages">Direct Messages</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when someone sends you a message
                  </p>
                </div>
                <Switch
                  id="email-messages"
                  checked={emailMessages}
                  onCheckedChange={setEmailMessages}
                  disabled={loading || !emailNotifications}
                />
              </div>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Critical security notifications (password resets, account
                changes) will always be sent regardless of these settings.
              </p>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Preferences'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
