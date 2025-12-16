/**
 * Report Download Component
 *
 * Provides UI for downloading PDF reports
 */

import * as React from 'react';
import { Download, FileText, Users, Calendar, Megaphone, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  downloadMemberReport,
  downloadEventsReport,
  downloadAnnouncementsReport,
  downloadAttendanceReport,
} from '@/services/endpoints/reportService';

type ReportType = 'members' | 'events' | 'announcements' | 'attendance';

interface ReportCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  reportType: ReportType;
  requiresDateRange?: boolean;
  requiresEventId?: boolean;
}

function ReportCard({
  title,
  description,
  icon: Icon,
  reportType,
  requiresDateRange = false,
  requiresEventId = false,
}: ReportCardProps) {
  const [loading, setLoading] = React.useState(false);
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [eventId, setEventId] = React.useState('');
  const { toast } = useToast();

  const handleDownload = async () => {
    setLoading(true);
    try {
      switch (reportType) {
        case 'members':
          await downloadMemberReport();
          break;
        case 'events':
          await downloadEventsReport(startDate || undefined, endDate || undefined);
          break;
        case 'announcements':
          await downloadAnnouncementsReport(startDate || undefined, endDate || undefined);
          break;
        case 'attendance':
          if (!eventId) {
            toast({
              title: 'Event ID required',
              description: 'Please enter an event ID for the attendance report.',
              variant: 'destructive',
            });
            return;
          }
          await downloadAttendanceReport(eventId);
          break;
      }

      toast({
        title: 'Report downloaded',
        description: `Your ${title.toLowerCase()} has been downloaded.`,
      });
    } catch (error) {
      console.error('Failed to download report:', error);
      toast({
        title: 'Download failed',
        description: 'Failed to generate the report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {requiresDateRange && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`${reportType}-start`}>Start Date</Label>
              <Input
                id={`${reportType}-start`}
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${reportType}-end`}>End Date</Label>
              <Input
                id={`${reportType}-end`}
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        )}

        {requiresEventId && (
          <div className="space-y-2">
            <Label htmlFor="event-id">Event ID</Label>
            <Input
              id="event-id"
              placeholder="Enter event ID"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
            />
          </div>
        )}

        <Button onClick={handleDownload} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export function ReportDownloadPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Reports</h2>
        <p className="text-muted-foreground">Generate and download PDF reports for various data.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ReportCard
          title="Member Directory"
          description="Complete list of all active members with contact information"
          icon={Users}
          reportType="members"
        />

        <ReportCard
          title="Events Report"
          description="Summary of events with RSVP counts and details"
          icon={Calendar}
          reportType="events"
          requiresDateRange
        />

        <ReportCard
          title="Announcements Report"
          description="List of announcements with view counts"
          icon={Megaphone}
          reportType="announcements"
          requiresDateRange
        />

        <ReportCard
          title="Event Attendance"
          description="Detailed attendance list for a specific event"
          icon={FileText}
          reportType="attendance"
          requiresEventId
        />
      </div>
    </div>
  );
}

export { ReportCard };
