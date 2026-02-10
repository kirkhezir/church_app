/**
 * Edit Profile Page (T108)
 *
 * Allows members to update their profile information and privacy settings.
 */

import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarLayout } from '@/components/layout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { apiClient } from '@/services/api/apiClient';

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

export default function EditProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
      const response = (await apiClient.get('/app/members/me')) as ProfileData;
      setFormData(response);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load profile');
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
      const response = (await apiClient.patch('/app/members/me', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        privacySettings: formData.privacySettings,
      })) as { success: boolean; message: string; profile: ProfileData };

      if (response.success) {
        setSuccess(true);
        // Update form with returned data
        if (response.profile) {
          setFormData((prev) => ({
            ...prev,
            ...response.profile,
          }));
        }
      } else {
        setError(response.message || 'Failed to update profile');
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
      <SidebarLayout breadcrumbs={[{ label: 'Profile' }]}>
        <Card className="w-full max-w-2xl">
          <CardContent className="py-8">
            <p className="text-center text-gray-600">Loading profile...</p>
          </CardContent>
        </Card>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout breadcrumbs={[{ label: 'Profile' }]}>
      <div className="mx-auto w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Update your personal information and privacy settings</CardDescription>
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
                  <AlertDescription>Profile updated successfully!</AlertDescription>
                </Alert>
              )}

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>

                <div className="grid gap-4 md:grid-cols-2">
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
                  <p className="text-xs text-gray-500">
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
                  <p className="text-xs text-gray-500">Use E.164 format (e.g., +66812345678)</p>
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
              </div>

              {/* Privacy Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Privacy Settings</h3>
                <p className="text-sm text-gray-600">
                  Control what other members can see about you
                </p>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showPhone"
                      checked={formData.privacySettings.showPhone}
                      onCheckedChange={(checked: boolean) =>
                        handlePrivacyChange('showPhone', checked)
                      }
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
                      onCheckedChange={(checked: boolean) =>
                        handlePrivacyChange('showEmail', checked)
                      }
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
                      onCheckedChange={(checked: boolean) =>
                        handlePrivacyChange('showAddress', checked)
                      }
                      disabled={loading}
                    />
                    <Label htmlFor="showAddress" className="cursor-pointer font-normal">
                      Show my address to other members
                    </Label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/app/dashboard')}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
