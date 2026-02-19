/**
 * Profile Summary Widget (T098)
 *
 * Displays member profile information in dashboard
 */

import { Link } from 'react-router';
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
          <div className="text-2xl font-bold text-foreground">
            {profile.firstName} {profile.lastName}
          </div>
          <div className="text-sm text-muted-foreground">{profile.role}</div>
        </div>

        <div className="space-y-2">
          <div>
            <div className="text-xs font-medium text-muted-foreground">Email</div>
            <div className="text-sm text-foreground">{profile.email}</div>
          </div>

          {profile.phone && (
            <div>
              <div className="text-xs font-medium text-muted-foreground">Phone</div>
              <div className="text-sm text-foreground">{profile.phone}</div>
            </div>
          )}

          <div>
            <div className="text-xs font-medium text-muted-foreground">Member Since</div>
            <div className="text-sm text-foreground">{memberSince}</div>
          </div>
        </div>

        <Link to="/app/profile">
          <Button variant="outline" className="w-full">
            Edit Profile
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
