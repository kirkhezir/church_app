/**
 * Data Export Component
 *
 * Provides data export functionality (CSV, Excel, PDF)
 */

import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/dialog';
import { Checkbox } from '../../../components/ui/checkbox';
import { Label } from '../../../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../../components/ui/radio-group';
import { useToast } from '../../../hooks/use-toast';

type ExportFormat = 'csv' | 'xlsx' | 'pdf';
type DataType = 'members' | 'events' | 'announcements' | 'attendance';

interface ExportField {
  key: string;
  label: string;
  default: boolean;
}

interface DataExportDialogProps {
  dataType: DataType;
  onExport: (format: ExportFormat, fields: string[]) => Promise<Blob>;
  trigger?: React.ReactNode;
}

const fieldsByDataType: Record<DataType, ExportField[]> = {
  members: [
    { key: 'firstName', label: 'First Name', default: true },
    { key: 'lastName', label: 'Last Name', default: true },
    { key: 'email', label: 'Email', default: true },
    { key: 'phone', label: 'Phone', default: true },
    { key: 'role', label: 'Role', default: true },
    { key: 'status', label: 'Status', default: true },
    { key: 'membershipDate', label: 'Membership Date', default: true },
    { key: 'address', label: 'Address', default: false },
    { key: 'birthDate', label: 'Birth Date', default: false },
    { key: 'baptismDate', label: 'Baptism Date', default: false },
    { key: 'notes', label: 'Notes', default: false },
  ],
  events: [
    { key: 'title', label: 'Title', default: true },
    { key: 'description', label: 'Description', default: true },
    { key: 'startDate', label: 'Start Date', default: true },
    { key: 'endDate', label: 'End Date', default: true },
    { key: 'location', label: 'Location', default: true },
    { key: 'type', label: 'Type', default: true },
    { key: 'rsvpCount', label: 'RSVP Count', default: true },
    { key: 'maxAttendees', label: 'Max Attendees', default: false },
    { key: 'createdBy', label: 'Created By', default: false },
  ],
  announcements: [
    { key: 'title', label: 'Title', default: true },
    { key: 'content', label: 'Content', default: true },
    { key: 'priority', label: 'Priority', default: true },
    { key: 'publishDate', label: 'Publish Date', default: true },
    { key: 'expiryDate', label: 'Expiry Date', default: true },
    { key: 'author', label: 'Author', default: true },
    { key: 'status', label: 'Status', default: true },
  ],
  attendance: [
    { key: 'eventTitle', label: 'Event', default: true },
    { key: 'eventDate', label: 'Date', default: true },
    { key: 'memberName', label: 'Member Name', default: true },
    { key: 'status', label: 'Status', default: true },
    { key: 'checkInTime', label: 'Check-in Time', default: false },
    { key: 'notes', label: 'Notes', default: false },
  ],
};

const dataTypeLabels: Record<DataType, string> = {
  members: 'Members',
  events: 'Events',
  announcements: 'Announcements',
  attendance: 'Attendance',
};

export function DataExportDialog({ dataType, onExport, trigger }: DataExportDialogProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [selectedFields, setSelectedFields] = useState<string[]>(
    fieldsByDataType[dataType].filter((f) => f.default).map((f) => f.key)
  );

  const fields = fieldsByDataType[dataType];

  const handleFieldToggle = (fieldKey: string) => {
    setSelectedFields((prev) =>
      prev.includes(fieldKey) ? prev.filter((f) => f !== fieldKey) : [...prev, fieldKey]
    );
  };

  const handleSelectAll = () => {
    setSelectedFields(fields.map((f) => f.key));
  };

  const handleSelectNone = () => {
    setSelectedFields([]);
  };

  const handleExport = async () => {
    if (selectedFields.length === 0) {
      toast({
        title: 'No fields selected',
        description: 'Please select at least one field to export.',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    try {
      const blob = await onExport(format, selectedFields);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${dataType}_export_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Export successful',
        description: `${dataTypeLabels[dataType]} data exported successfully.`,
      });
      setIsOpen(false);
    } catch (_error) {
      toast({
        title: 'Export failed',
        description: 'An error occurred while exporting data.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export {dataTypeLabels[dataType]}</DialogTitle>
          <DialogDescription>Choose the format and fields you want to export.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label>Export Format</Label>
            <RadioGroup
              value={format}
              onValueChange={(value) => setFormat(value as ExportFormat)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="flex cursor-pointer items-center gap-2">
                  <FileText className="h-4 w-4" />
                  CSV
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="xlsx" id="xlsx" />
                <Label htmlFor="xlsx" className="flex cursor-pointer items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Excel
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf" className="flex cursor-pointer items-center gap-2">
                  <FileText className="h-4 w-4" />
                  PDF
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Field Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Fields to Export</Label>
              <div className="flex gap-2">
                <Button variant="link" size="sm" className="h-auto p-0" onClick={handleSelectAll}>
                  Select All
                </Button>
                <span className="text-muted-foreground">/</span>
                <Button variant="link" size="sm" className="h-auto p-0" onClick={handleSelectNone}>
                  None
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-md border p-4">
              {fields.map((field) => (
                <div key={field.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={field.key}
                    checked={selectedFields.includes(field.key)}
                    onCheckedChange={() => handleFieldToggle(field.key)}
                  />
                  <Label htmlFor={field.key} className="cursor-pointer text-sm font-normal">
                    {field.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-md bg-muted p-3 text-sm">
            <strong>{selectedFields.length}</strong> fields selected for export as{' '}
            <strong>{format.toUpperCase()}</strong>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
