/**
 * Profile Summary Widget (T098)
 *
 * Displays member profile information in dashboard with
 * gradient avatar ring, role badge, and warm visual treatment.
 */

import { Link } from 'react-router';
import { memo, useMemo } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { User, Mail, Phone, CalendarDays, Shield } from 'lucide-react';

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

const ROLE_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  ADMIN: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-700 dark:text-purple-300',
    dot: 'bg-purple-500',
  },
  STAFF: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-300',
    dot: 'bg-blue-500',
  },
  MEMBER: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-700 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
};

export const ProfileSummary = memo(function ProfileSummary({ profile }: ProfileSummaryProps) {
  const memberSince = new Date(profile.membershipDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });

  const initials = useMemo(
    () => `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase(),
    [profile.firstName, profile.lastName]
  );

  const roleStyle = ROLE_STYLES[profile.role] ?? ROLE_STYLES.MEMBER;

  return (
    <Card className="overflow-hidden">
      {/* Decorative header band */}
      <div className="h-20 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 dark:from-blue-600 dark:via-indigo-700 dark:to-purple-800" />

      <CardContent className="-mt-10 space-y-4 px-6 pb-6">
        {/* Avatar with gradient ring */}
        <div className="flex flex-col items-center">
          <div className="rounded-full bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-500 p-[3px] shadow-lg">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background text-xl font-bold text-foreground">
              {initials}
            </div>
          </div>

          <h3 className="mt-3 text-lg font-bold text-foreground">
            {profile.firstName} {profile.lastName}
          </h3>

          {/* Role badge */}
          <span
            className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${roleStyle.bg} ${roleStyle.text}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${roleStyle.dot}`} />
            {profile.role}
          </span>
        </div>

        {/* Contact details */}
        <div className="space-y-2.5 rounded-lg bg-muted/50 p-3 dark:bg-muted/30">
          <div className="flex items-center gap-2.5 text-sm">
            <Mail className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
            <span className="truncate text-foreground">{profile.email}</span>
          </div>

          {profile.phone && (
            <div className="flex items-center gap-2.5 text-sm">
              <Phone className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
              <span className="text-foreground">{profile.phone}</span>
            </div>
          )}

          <div className="flex items-center gap-2.5 text-sm">
            <CalendarDays className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">
              Member since <span className="font-medium text-foreground">{memberSince}</span>
            </span>
          </div>
        </div>

        <Link to="/app/profile" className="block">
          <Button variant="outline" className="w-full cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
});
