/**
 * Push Notification Settings Component
 *
 * Allows users to enable/disable push notifications
 */

import * as React from 'react';
import { Bell, BellOff, Loader2, Smartphone, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();

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
          getPushStatus().catch(() => ({ enabled: false, subscriptionCount: 0 })),
        ]);
        setEnabled(pushEnabled);
        setSubscriptionCount(status.subscriptionCount);
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
          toast({
            title: 'Push notifications enabled',
            description: 'You will now receive notifications on this device.',
          });
        } else {
          toast({
            title: 'Permission denied',
            description: 'Please allow notifications in your browser settings.',
            variant: 'destructive',
          });
        }
      } else {
        await unsubscribeFromPush();
        setEnabled(false);
        setSubscriptionCount((prev) => Math.max(0, prev - 1));
        toast({
          title: 'Push notifications disabled',
          description: 'You will no longer receive notifications on this device.',
        });
      }
    } catch (error) {
      console.error('Failed to toggle push notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notification settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setToggling(false);
    }
  };

  const handleUnsubscribeAll = async () => {
    setToggling(true);
    try {
      await unsubscribeAllDevices();
      setEnabled(false);
      setSubscriptionCount(0);
      toast({
        title: 'All devices unsubscribed',
        description: 'Push notifications disabled on all your devices.',
      });
    } catch (error) {
      console.error('Failed to unsubscribe all devices:', error);
      toast({
        title: 'Error',
        description: 'Failed to unsubscribe all devices. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setToggling(false);
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
          Receive instant notifications about events, announcements, and messages.
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
              Get notified about new events and announcements
            </p>
          </div>
          <Switch
            id="push-notifications"
            checked={enabled}
            onCheckedChange={handleToggle}
            disabled={toggling}
          />
        </div>

        {/* Device count */}
        {subscriptionCount > 0 && (
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
        )}

        {/* Info alert */}
        <Alert>
          <Bell className="h-4 w-4" />
          <AlertTitle>Stay Updated</AlertTitle>
          <AlertDescription>
            Push notifications will alert you about:
            <ul className="mt-2 list-disc pl-4 text-sm">
              <li>New events and RSVP reminders</li>
              <li>Important announcements</li>
              <li>New messages from other members</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
