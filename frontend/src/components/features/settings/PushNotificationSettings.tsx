/**
 * Push Notification Settings Component
 *
 * Allows users to enable/disable push notifications with per-category controls
 */

import * as React from 'react';
import {
  Bell,
  BellOff,
  Loader2,
  Smartphone,
  Trash2,
  TestTube,
  Calendar,
  Megaphone,
  MessageSquare,
  Heart,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { gooeyToast } from 'goey-toast';
import {
  requestPushPermission,
  isPushEnabled,
  unsubscribeFromPush,
  unsubscribeAllDevices,
  getPushStatus,
} from '@/services/endpoints/pushService';

export function PushNotificationSettings() {
  const [enabled, setEnabled] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [toggling, setToggling] = React.useState(false);
  const [subscriptionCount, setSubscriptionCount] = React.useState(0);
  const [isSupported, setIsSupported] = React.useState(true);
  const [testing, setTesting] = React.useState(false);

  // Per-category push preferences (stored in localStorage per device)
  const [pushEvents, setPushEvents] = React.useState(
    () => localStorage.getItem('push_pref_events') !== 'false'
  );
  const [pushAnnouncements, setPushAnnouncements] = React.useState(
    () => localStorage.getItem('push_pref_announcements') !== 'false'
  );
  const [pushMessages, setPushMessages] = React.useState(
    () => localStorage.getItem('push_pref_messages') !== 'false'
  );
  const [pushPrayer, setPushPrayer] = React.useState(
    () => localStorage.getItem('push_pref_prayer') !== 'false'
  );

  // Persist preferences to localStorage
  const savePref = (key: string, value: boolean) => {
    localStorage.setItem(key, String(value));
  };

  // Check initial state
  React.useEffect(() => {
    const checkStatus = async () => {
      // Check browser support
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setIsSupported(false);
        setLoading(false);
        return;
      }

      try {
        const [pushEnabled, status] = await Promise.all([
          isPushEnabled(),
          getPushStatus().catch(() => ({ enabled: false, message: '' })),
        ]);
        setEnabled(pushEnabled);
        // Backend status tells us if server-side push is configured
        // Use local subscription presence to infer this device is subscribed
        setSubscriptionCount(pushEnabled && status.enabled ? 1 : 0);
      } catch (error) {
        console.error('Failed to check push status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, []);

  const handleToggle = async (checked: boolean) => {
    setToggling(true);
    try {
      if (checked) {
        const subscription = await requestPushPermission();
        if (subscription) {
          setEnabled(true);
          setSubscriptionCount((prev) => prev + 1);
          gooeyToast.success('Push notifications enabled', {
            description: 'You will now receive notifications on this device.',
          });
        } else {
          gooeyToast.error('Permission denied', {
            description: 'Please allow notifications in your browser settings.',
          });
        }
      } else {
        await unsubscribeFromPush();
        setEnabled(false);
        setSubscriptionCount((prev) => Math.max(0, prev - 1));
        gooeyToast.success('Push notifications disabled', {
          description: 'You will no longer receive notifications on this device.',
        });
      }
    } catch (error) {
      console.error('Failed to toggle push notifications:', error);
      gooeyToast.error('Error', {
        description: 'Failed to update notification settings. Please try again.',
      });
    } finally {
      setToggling(false);
    }
  };

  const handleUnsubscribeAll = async () => {
    setToggling(true);
    try {
      await unsubscribeAllDevices();

      // Also unsubscribe locally from browser push manager
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
        }
      }

      setEnabled(false);
      setSubscriptionCount(0);
      gooeyToast.success('All devices unsubscribed', {
        description: 'Push notifications disabled on all your devices.',
      });
    } catch (error) {
      console.error('Failed to unsubscribe all devices:', error);
      gooeyToast.error('Error', {
        description: 'Failed to unsubscribe all devices. Please try again.',
      });
    } finally {
      setToggling(false);
    }
  };

  const handleTestNotification = async () => {
    setTesting(true);
    try {
      if (!('serviceWorker' in navigator)) return;
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification('Test Notification', {
        body: 'Push notifications are working correctly on this device!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'test-notification',
        data: { type: 'test' },
      });
      gooeyToast.success('Test sent!', {
        description: 'Check your notification tray.',
      });
    } catch (error) {
      console.error('Test notification failed:', error);
      gooeyToast.error('Test failed', {
        description: 'Could not show test notification.',
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Push Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Push Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <BellOff className="h-4 w-4" />
            <AlertTitle>Not Supported</AlertTitle>
            <AlertDescription>
              Push notifications are not supported in your browser. Please use a modern browser like
              Chrome, Firefox, or Edge to enable this feature.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Receive instant notifications even when the app is closed — works on desktop and mobile
          (PWA).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="push-notifications" className="text-base">
              Enable on this device
            </Label>
            <p className="text-sm text-muted-foreground">
              Get notified about events, announcements, and messages
            </p>
          </div>
          <Switch
            id="push-notifications"
            checked={enabled}
            onCheckedChange={handleToggle}
            disabled={toggling}
          />
        </div>

        {/* Per-category preferences (only visible when enabled) */}
        {enabled && (
          <>
            <Separator />
            <div className="space-y-4">
              <p className="text-sm font-medium">Notification Categories</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="push-events">Events</Label>
                    <p className="text-xs text-muted-foreground">New events, updates & reminders</p>
                  </div>
                </div>
                <Switch
                  id="push-events"
                  checked={pushEvents}
                  onCheckedChange={(v) => {
                    setPushEvents(v);
                    savePref('push_pref_events', v);
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Megaphone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="push-announcements">Announcements</Label>
                    <p className="text-xs text-muted-foreground">
                      Church announcements & urgent alerts
                    </p>
                  </div>
                </div>
                <Switch
                  id="push-announcements"
                  checked={pushAnnouncements}
                  onCheckedChange={(v) => {
                    setPushAnnouncements(v);
                    savePref('push_pref_announcements', v);
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="push-messages">Messages</Label>
                    <p className="text-xs text-muted-foreground">
                      Direct messages from other members
                    </p>
                  </div>
                </div>
                <Switch
                  id="push-messages"
                  checked={pushMessages}
                  onCheckedChange={(v) => {
                    setPushMessages(v);
                    savePref('push_pref_messages', v);
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="push-prayer">Prayer Requests</Label>
                    <p className="text-xs text-muted-foreground">Community prayer wall updates</p>
                  </div>
                </div>
                <Switch
                  id="push-prayer"
                  checked={pushPrayer}
                  onCheckedChange={(v) => {
                    setPushPrayer(v);
                    savePref('push_pref_prayer', v);
                  }}
                />
              </div>
            </div>
          </>
        )}

        {/* Device count */}
        {subscriptionCount > 0 && (
          <>
            <Separator />
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {subscriptionCount} device{subscriptionCount !== 1 ? 's' : ''} subscribed
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Notifications are sent to all subscribed devices
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {subscriptionCount > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUnsubscribeAll}
                    disabled={toggling}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Unsubscribe all
                  </Button>
                )}
              </div>
            </div>
          </>
        )}

        {/* Test + Info */}
        {enabled && (
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleTestNotification} disabled={testing}>
              <TestTube className="mr-2 h-4 w-4" />
              {testing ? 'Sending...' : 'Send Test Notification'}
            </Button>
            <p className="text-xs text-muted-foreground">
              Verify notifications work on this device
            </p>
          </div>
        )}

        {/* Info alert */}
        <Alert>
          <Bell className="h-4 w-4" />
          <AlertTitle>How Push Notifications Work</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 list-disc pl-4 text-sm">
              <li>
                <strong>Desktop:</strong> Notifications appear in your system tray even when the
                browser is minimized
              </li>
              <li>
                <strong>Mobile (PWA):</strong> Install the app via your browser's "Add to Home
                Screen" to receive notifications like a native app
              </li>
              <li>
                <strong>App Badge:</strong> On supported devices, a badge count appears on the app
                icon
              </li>
              <li>Notifications are delivered even when the app is closed</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
