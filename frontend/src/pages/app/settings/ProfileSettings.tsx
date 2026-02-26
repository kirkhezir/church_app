/**
 * Profile Settings
 *
 * Allows members to update their personal information and privacy settings.
 * Rendered inside SettingsLayout as a nested route.
 */

import { useState, useEffect, FormEvent } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { apiClient } from '@/services/api/apiClient';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');

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
        toast({ title: 'Profile updated successfully!' });
        if (response.profile) {
          setFormData((prev) => ({
            ...prev,
            ...response.profile,
          }));
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
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={formData.email} disabled />
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
              />
              <p className="text-xs text-muted-foreground">Use E.164 format (e.g., +66812345678)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="Your address"
                value={formData.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                disabled={loading}
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
    </div>
  );
}
