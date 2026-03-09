/**
 * Profile Settings
 *
 * Allows members to update their personal information and privacy settings.
 * Rendered inside SettingsLayout as a nested route.
 */

import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { apiClient } from '@/services/api/apiClient';
import { deleteAccount } from '@/services/endpoints/memberService';
import { useAuth } from '@/contexts/AuthContext';
import { gooeyToast } from 'goey-toast';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  membershipDate: string;
  privacySettings: {
    showPhone: boolean;
    showEmail: boolean;
    showAddress: boolean;
  };
}

export default function ProfileSettings() {
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const { logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    role: '',
    membershipDate: '',
    privacySettings: {
      showPhone: true,
      showEmail: true,
      showAddress: true,
    },
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = (await apiClient.get('/members/me')) as ProfileData;
      setFormData(response);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to load profile');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = (await apiClient.patch('/members/me', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        privacySettings: formData.privacySettings,
      })) as { success: boolean; message: string; profile: ProfileData };

      if (response.success) {
        gooeyToast.success('Profile updated successfully!');
        if (response.profile) {
          setFormData((prev) => ({
            ...prev,
            ...response.profile,
          }));
          // Keep sidebar + header in sync without requiring a re-login
          updateUser({
            firstName: response.profile.firstName,
            lastName: response.profile.lastName,
          });
        }
      } else {
        setError(response.message || 'Failed to update profile');
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

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePrivacyChange = (field: keyof ProfileData['privacySettings'], checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      privacySettings: {
        ...prev.privacySettings,
        [field]: checked,
      },
    }));
  };

  if (fetchLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">Loading profile...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Information</CardTitle>
            <CardDescription>Your personal contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="given-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                spellCheck={false}
                autoCorrect="off"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed. Contact admin to update.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+66812345678"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={loading}
                autoComplete="tel"
                inputMode="tel"
              />
              <p className="text-xs text-muted-foreground">Use E.164 format (e.g., +66812345678)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="Your address"
                value={formData.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                disabled={loading}
                autoComplete="street-address"
                rows={2}
                className="resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Privacy</CardTitle>
            <CardDescription>Control what other members can see about you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showPhone"
                checked={formData.privacySettings.showPhone}
                onCheckedChange={(checked: boolean) => handlePrivacyChange('showPhone', checked)}
                disabled={loading}
              />
              <Label htmlFor="showPhone" className="cursor-pointer font-normal">
                Show my phone number to other members
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="showEmail"
                checked={formData.privacySettings.showEmail}
                onCheckedChange={(checked: boolean) => handlePrivacyChange('showEmail', checked)}
                disabled={loading}
              />
              <Label htmlFor="showEmail" className="cursor-pointer font-normal">
                Show my email address to other members
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="showAddress"
                checked={formData.privacySettings.showAddress}
                onCheckedChange={(checked: boolean) => handlePrivacyChange('showAddress', checked)}
                disabled={loading}
              />
              <Label htmlFor="showAddress" className="cursor-pointer font-normal">
                Show my address to other members
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Save */}
        <div className="flex">
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete your account, messages, RSVPs, and all associated
                  data. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-2 py-2">
                <Label htmlFor="deleteConfirm" className="text-sm">
                  Type <span className="font-semibold">DELETE</span> to confirm
                </Label>
                <Input
                  id="deleteConfirm"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  disabled={deleting}
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleteConfirmText('')} disabled={deleting}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  disabled={deleteConfirmText !== 'DELETE' || deleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={async (e) => {
                    e.preventDefault();
                    setDeleting(true);
                    try {
                      await deleteAccount();
                      await logout();
                      navigate('/login');
                      gooeyToast.success('Account deleted successfully.');
                    } catch (err: unknown) {
                      const error = err as {
                        response?: { data?: { message?: string } };
                      };
                      gooeyToast.error(
                        error.response?.data?.message || 'Failed to delete account.'
                      );
                    } finally {
                      setDeleting(false);
                      setDeleteConfirmText('');
                    }
                  }}
                >
                  {deleting ? 'Deleting...' : 'Delete Account'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
