/**
 * AnnouncementForm Component
 *
 * Reusable form for creating and editing announcements
 * Features:
 * - Title input with validation
 * - Rich text editor for content
 * - Priority selection (NORMAL/URGENT)
 * - Draft toggle
 * - Character counters
 * - Error handling
 */

import { useState, FormEvent } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Switch } from '../../ui/switch';
import { Alert, AlertDescription } from '../../ui/alert';
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';
import { AlertCircleIcon, BellIcon, SaveIcon } from 'lucide-react';
import { SimpleTextEditor } from '../../editor/SimpleTextEditor';

interface AnnouncementFormProps {
  initialData?: {
    title: string;
    content: string;
    priority: 'URGENT' | 'NORMAL';
    isDraft?: boolean;
  };
  onSubmit: (data: {
    title: string;
    content: string;
    priority: 'URGENT' | 'NORMAL';
    isDraft: boolean;
  }) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  isLoading?: boolean;
}

export function AnnouncementForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Create Announcement',
  isLoading = false,
}: AnnouncementFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [priority, setPriority] = useState<'URGENT' | 'NORMAL'>(initialData?.priority || 'NORMAL');
  const [isDraft, setIsDraft] = useState(initialData?.isDraft || false);
  const [error, setError] = useState<string | null>(null);

  const titleMaxLength = 150;
  const titleMinLength = 3;

  const titleCharsRemaining = titleMaxLength - title.length;

  const isTitleValid = title.length >= titleMinLength && title.length <= titleMaxLength;
  const isContentValid = content.trim().length > 0;
  const isFormValid = isTitleValid && isContentValid && !isLoading;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate
    if (!isTitleValid) {
      setError(`Title must be between ${titleMinLength} and ${titleMaxLength} characters`);
      return;
    }

    if (!isContentValid) {
      setError('Content is required');
      return;
    }

    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        priority,
        isDraft,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save announcement');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Title Input */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter announcement title"
          maxLength={titleMaxLength}
          disabled={isLoading}
          className={!isTitleValid && title.length > 0 ? 'border-red-500' : ''}
        />
        <div className="flex justify-between text-sm">
          <span className={title.length < titleMinLength ? 'text-red-500' : 'text-muted-foreground'}>
            {title.length < titleMinLength
              ? `Minimum ${titleMinLength} characters`
              : 'Title looks good'}
          </span>
          <span className={titleCharsRemaining < 20 ? 'text-orange-500' : 'text-muted-foreground'}>
            {titleCharsRemaining} characters remaining
          </span>
        </div>
      </div>

      {/* Priority Selection */}
      <div className="space-y-2">
        <Label>
          Priority <span className="text-red-500">*</span>
        </Label>
        <RadioGroup
          value={priority}
          onValueChange={(value) => setPriority(value as 'URGENT' | 'NORMAL')}
          disabled={isLoading}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="NORMAL" id="normal" />
            <Label htmlFor="normal" className="flex items-center gap-2 font-normal">
              <BellIcon className="h-4 w-4 text-blue-600" />
              Normal - Regular announcement
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="URGENT" id="urgent" />
            <Label htmlFor="urgent" className="flex items-center gap-2 font-normal">
              <AlertCircleIcon className="h-4 w-4 text-red-600" />
              Urgent - Email all members immediately
            </Label>
          </div>
        </RadioGroup>
        {priority === 'URGENT' && (
          <Alert>
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>
              This announcement will trigger immediate email notifications to all members with email
              notifications enabled.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Content Editor */}
      <div className="space-y-2">
        <Label htmlFor="content">
          Content <span className="text-red-500">*</span>
        </Label>
        <SimpleTextEditor
          content={content}
          onChange={setContent}
          placeholder="Write your announcement here..."
          disabled={isLoading}
        />
        <p className={`text-sm ${content.trim().length === 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
          {content.trim().length === 0
            ? 'Content is required'
            : 'Write your announcement in plain text'}
        </p>
      </div>

      {/* Draft Toggle */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
        <div className="flex items-center gap-3">
          <SaveIcon className="h-5 w-5 text-muted-foreground" />
          <div>
            <Label htmlFor="draft-toggle" className="cursor-pointer font-medium">
              Save as Draft
            </Label>
            <p className="text-sm text-muted-foreground">
              Draft announcements won&apos;t be published or trigger notifications
            </p>
          </div>
        </div>
        <Switch
          id="draft-toggle"
          checked={isDraft}
          onCheckedChange={setIsDraft}
          disabled={isLoading}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button type="submit" disabled={!isFormValid} className="flex-1">
          {isLoading ? 'Saving…' : isDraft ? 'Save Draft' : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
