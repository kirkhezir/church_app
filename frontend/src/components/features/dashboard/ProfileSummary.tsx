/**
 * Profile Summary Widget (T098)
 *
 * Displays member profile information in dashboard
 */

import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';

interface ProfileSummaryProps {
  profile: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    membershipDate: string;
    phone?: string;
  };
}

export function ProfileSummary({ profile }: ProfileSummaryProps) {
  const memberSince = new Date(profile.membershipDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-2xl font-bold text-gray-900">
            {profile.firstName} {profile.lastName}
          </div>
          <div className="text-sm text-gray-500">{profile.role}</div>
        </div>

        <div className="space-y-2">
          <div>
            <div className="text-xs font-medium text-gray-500">Email</div>
            <div className="text-sm text-gray-900">{profile.email}</div>
          </div>

          {profile.phone && (
            <div>
              <div className="text-xs font-medium text-gray-500">Phone</div>
              <div className="text-sm text-gray-900">{profile.phone}</div>
            </div>
          )}

          <div>
            <div className="text-xs font-medium text-gray-500">Member Since</div>
            <div className="text-sm text-gray-900">{memberSince}</div>
          </div>
        </div>

        <Link to="/profile">
          <Button variant="outline" className="w-full">
            Edit Profile
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
