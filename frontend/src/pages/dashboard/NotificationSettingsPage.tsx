/**
 * Notification Settings Page (T109)
 *
 * Allows members to manage their email notification preferences.
 */

import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { apiClient } from '@/services/api/apiClient';

export default function NotificationSettingsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [emailNotifications, setEmailNotifications] = useState(true);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = (await apiClient.get('/members/me')) as {
        emailNotifications: boolean;
      };
      setEmailNotifications(response.emailNotifications);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load notification preferences');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const response = (await apiClient.patch('/members/me/notifications', {
        emailNotifications,
      })) as { success: boolean; message: string };

      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.message || 'Failed to update notification preferences');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'An error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-full max-w-2xl">
          <CardContent className="py-8">
            <p className="text-center text-gray-600">Loading preferences...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Manage how you receive updates from the church</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <AlertDescription>
                    Notification preferences updated successfully!
                  </AlertDescription>
                </Alert>
              )}

              {/* Email Notifications */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Email Notifications</h3>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label
                      htmlFor="emailNotifications"
                      className="cursor-pointer text-base font-medium"
                    >
                      Enable Email Notifications
                    </Label>
                    <p className="text-sm text-gray-500">
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

                <div className="rounded-lg bg-blue-50 p-4">
                  <h4 className="mb-2 text-sm font-semibold text-blue-900">What you'll receive:</h4>
                  <ul className="space-y-1 text-sm text-blue-800">
                    <li>• Urgent announcements from church leadership</li>
                    <li>• Event reminders and updates</li>
                    <li>• New message notifications</li>
                    <li>• Weekly church newsletter (if enabled)</li>
                  </ul>
                </div>

                <div className="rounded-lg bg-gray-100 p-4">
                  <p className="text-sm text-gray-600">
                    <strong>Note:</strong> Critical security notifications (password resets, account
                    changes) will always be sent regardless of this setting.
                  </p>
                </div>
              </div>

              {/* Future Enhancement Section */}
              <div className="space-y-4 rounded-lg border border-dashed p-4">
                <h3 className="text-lg font-semibold text-gray-400">Coming Soon</h3>
                <p className="text-sm text-gray-500">
                  Additional notification preferences will be available in future updates:
                </p>
                <ul className="space-y-1 text-sm text-gray-500">
                  <li>• Separate controls for different notification types</li>
                  <li>• SMS/text message notifications</li>
                  <li>• Notification frequency preferences</li>
                  <li>• Digest email options (daily/weekly summaries)</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Preferences'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
