/**
 * MemberProfilePage Component
 *
 * Displays a member's profile with privacy-controlled information
 */

import { useParams, useNavigate, Link } from 'react-router';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, User, MessageSquare } from 'lucide-react';
import { useMemberProfile } from '@/hooks/useMembers';
import { SidebarLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Module-level utility functions (no re-creation on each render)
function formatProfileDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateStr));
}

function getProfileInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function MemberProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { member, loading, error } = useMemberProfile({
    memberId: id || '',
  });

  const handleSendMessage = () => {
    navigate(`/app/messages/compose?to=${id}`);
  };

  const content = (
    <div className="container mx-auto max-w-4xl px-4 py-6 sm:py-8">
      {/* Back Navigation — uses proper <Link> for navigation */}
      <Link
        to="/app/members"
        className="mb-6 inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Directory
      </Link>

      {/* Error Alert */}
      {error ? (
        <Alert variant="destructive" className="mb-6" role="alert">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {/* Loading State */}
      {loading ? (
        <Card>
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <Skeleton className="h-24 w-24 shrink-0 rounded-full" />
              <div className="w-full space-y-3 text-center sm:text-left">
                <Skeleton className="mx-auto h-6 w-48 sm:mx-0" />
                <Skeleton className="mx-auto h-4 w-32 sm:mx-0" />
                <Skeleton className="mx-auto h-10 w-36 rounded-md sm:mx-0" />
              </div>
            </div>
            <div className="mt-8 space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Member Profile */}
      {!loading && member ? (
        <Card>
          <CardContent className="p-6 sm:p-8">
            {/* Header */}
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <Avatar className="h-24 w-24 shrink-0 ring-4 ring-primary/10">
                <AvatarFallback className="bg-primary/5 text-2xl font-bold text-primary">
                  {getProfileInitials(member.firstName, member.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left">
                <h1 className="text-balance text-2xl font-bold">
                  {member.firstName} {member.lastName}
                </h1>
                <p className="mt-1 text-muted-foreground">Church Member</p>
                <Button className="mt-4 gap-2" onClick={handleSendMessage}>
                  <MessageSquare className="h-4 w-4" aria-hidden="true" />
                  Send Message
                </Button>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mt-8 border-t pt-8">
              <h2 className="mb-4 text-balance text-lg font-semibold">Contact Information</h2>
              <div className="space-y-4">
                {member.email ? (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Mail className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground">Email</p>
                      <a
                        href={`mailto:${member.email}`}
                        className="truncate font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {member.email}
                      </a>
                    </div>
                  </div>
                ) : null}

                {member.phone ? (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Phone className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <a
                        href={`tel:${member.phone}`}
                        className="font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {member.phone}
                      </a>
                    </div>
                  </div>
                ) : null}

                {member.address ? (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">{member.address}</p>
                    </div>
                  </div>
                ) : null}

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <time dateTime={member.membershipDate} className="font-medium">
                      {formatProfileDate(member.membershipDate)}
                    </time>
                  </div>
                </div>
              </div>

              {/* Privacy Notice */}
              {!member.email && !member.phone && !member.address ? (
                <div className="mt-6 rounded-lg bg-muted p-4">
                  <p className="text-sm text-muted-foreground">
                    This member has chosen to keep their contact information private. You can still
                    send them a message through the church messaging system.
                  </p>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Not Found */}
      {!loading && !member && !error ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4">
              <User className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
            </div>
            <h2 className="mt-6 text-lg font-semibold">Member Not Found</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              The member you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Button variant="outline" className="mt-4" onClick={() => navigate('/app/members')}>
              Back to Directory
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );

  return (
    <SidebarLayout breadcrumbs={[{ label: 'Members', href: '/app/members' }, { label: 'Profile' }]}>
      {content}
    </SidebarLayout>
  );
}
