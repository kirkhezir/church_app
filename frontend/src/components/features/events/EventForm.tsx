import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Event, EventCategory } from '@/types/api';
import { ImageUploader } from '../upload/ImageUploader';

const categoryOptions = [
  { value: EventCategory.WORSHIP, label: 'Worship Service' },
  { value: EventCategory.BIBLE_STUDY, label: 'Bible Study' },
  { value: EventCategory.COMMUNITY, label: 'Community Service' },
  { value: EventCategory.FELLOWSHIP, label: 'Fellowship' },
];

interface EventFormData {
  title: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  location: string;
  category: EventCategory;
  maxCapacity?: number;
  imageUrl?: string;
}

interface EventFormProps {
  event?: Event;
  onSubmit: (data: EventFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const EventForm: React.FC<EventFormProps> = ({
  event,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    startDateTime: '',
    endDateTime: '',
    location: '',
    category: EventCategory.WORSHIP,
    maxCapacity: undefined,
    imageUrl: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof EventFormData, string>>>({});
  const [submitError, setSubmitError] = useState<string>('');

  // Format datetime for input field (YYYY-MM-DDTHH:MM)
  const formatDateTimeForInput = (dateString: string): string => {
    return format(new Date(dateString), "yyyy-MM-dd'T'HH:mm");
  };

  // Initialize form data when editing an existing event
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description,
        startDateTime: formatDateTimeForInput(event.startDateTime),
        endDateTime: formatDateTimeForInput(event.endDateTime),
        location: event.location,
        category: event.category,
        maxCapacity: event.maxCapacity || undefined,
        imageUrl: event.imageUrl || '',
      });
    }
  }, [event]);

  const handleChange = (field: keyof EventFormData, value: string | number | EventCategory) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof EventFormData, string>> = {};

    // Required fields
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.startDateTime) {
      newErrors.startDateTime = 'Start date and time is required';
    }

    if (!formData.endDateTime) {
      newErrors.endDateTime = 'End date and time is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    } else if (formData.location.length < 3) {
      newErrors.location = 'Location must be at least 3 characters';
    }

    // Date validation
    if (formData.startDateTime && formData.endDateTime) {
      const startDate = new Date(formData.startDateTime);
      const endDate = new Date(formData.endDateTime);
      const now = new Date();

      // Start date must be in the future (for new events)
      if (!event && startDate < now) {
        newErrors.startDateTime = 'Start date must be in the future';
      }

      // End date must be after start date
      if (endDate <= startDate) {
        newErrors.endDateTime = 'End date must be after start date';
      }

      // Event duration should be reasonable (max 7 days)
      const durationInHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
      if (durationInHours > 168) {
        // 7 days
        newErrors.endDateTime = 'Event duration cannot exceed 7 days';
      }
    }

    // Capacity validation
    if (formData.maxCapacity !== undefined && formData.maxCapacity !== null) {
      if (formData.maxCapacity < 1) {
        newErrors.maxCapacity = 'Capacity must be at least 1';
      } else if (formData.maxCapacity > 10000) {
        newErrors.maxCapacity = 'Capacity cannot exceed 10,000';
      }
    }

    // Image URL validation (optional but must be valid if provided)
    if (formData.imageUrl && formData.imageUrl.trim()) {
      try {
        new URL(formData.imageUrl);
      } catch {
        newErrors.imageUrl = 'Invalid URL format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!validate()) {
      return;
    }

    try {
      await onSubmit({
        ...formData,
        maxCapacity:
          formData.maxCapacity && formData.maxCapacity > 0 ? formData.maxCapacity : undefined,
        imageUrl: formData.imageUrl?.trim() || undefined,
      });
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to save event. Please try again.'
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Event Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Enter event title"
          disabled={isLoading}
          className={errors.title ? 'border-destructive' : ''}
        />
        {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">
          Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Describe the event..."
          rows={5}
          disabled={isLoading}
          className={errors.description ? 'border-destructive' : ''}
        />
        {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Start Date and Time */}
        <div className="space-y-2">
          <Label htmlFor="startDateTime">
            Start Date & Time <span className="text-destructive">*</span>
          </Label>
          <Input
            id="startDateTime"
            type="datetime-local"
            value={formData.startDateTime}
            onChange={(e) => handleChange('startDateTime', e.target.value)}
            disabled={isLoading}
            className={errors.startDateTime ? 'border-destructive' : ''}
          />
          {errors.startDateTime && (
            <p className="text-sm text-destructive">{errors.startDateTime}</p>
          )}
        </div>

        {/* End Date and Time */}
        <div className="space-y-2">
          <Label htmlFor="endDateTime">
            End Date & Time <span className="text-destructive">*</span>
          </Label>
          <Input
            id="endDateTime"
            type="datetime-local"
            value={formData.endDateTime}
            onChange={(e) => handleChange('endDateTime', e.target.value)}
            disabled={isLoading}
            className={errors.endDateTime ? 'border-destructive' : ''}
          />
          {errors.endDateTime && <p className="text-sm text-destructive">{errors.endDateTime}</p>}
        </div>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location">
          Location <span className="text-destructive">*</span>
        </Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => handleChange('location', e.target.value)}
          placeholder="Enter event location"
          disabled={isLoading}
          className={errors.location ? 'border-destructive' : ''}
        />
        {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">
            Category <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleChange('category', value as EventCategory)}
            disabled={isLoading}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
        </div>

        {/* Max Capacity */}
        <div className="space-y-2">
          <Label htmlFor="maxCapacity">Max Capacity (Optional)</Label>
          <Input
            id="maxCapacity"
            type="number"
            min="1"
            max="10000"
            value={formData.maxCapacity || ''}
            onChange={(e) =>
              handleChange('maxCapacity', e.target.value ? parseInt(e.target.value) : 0)
            }
            placeholder="Leave empty for unlimited"
            disabled={isLoading}
            className={errors.maxCapacity ? 'border-destructive' : ''}
          />
          {errors.maxCapacity && <p className="text-sm text-destructive">{errors.maxCapacity}</p>}
        </div>
      </div>

      {/* Event Image */}
      <div className="space-y-2">
        <Label>Event Image (Optional)</Label>
        <ImageUploader
          uploadType="event"
          currentImageUrl={formData.imageUrl}
          onUploadComplete={(url) => handleChange('imageUrl', url)}
          disabled={isLoading}
          maxSizeMB={10}
        />
        {errors.imageUrl && <p className="text-sm text-destructive">{errors.imageUrl}</p>}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : event ? (
            'Update Event'
          ) : (
            'Create Event'
          )}
        </Button>
      </div>
    </form>
  );
};

export default EventForm;
