/**
 * ImageUploader Component
 *
 * Reusable image upload component with preview, drag-and-drop,
 * and progress indication. Uploads to Cloudinary via backend API.
 */

import { useState, useCallback, useRef } from 'react';
import { Upload, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Props for ImageUploader component
 */
interface ImageUploaderProps {
  /** Callback when upload completes successfully */
  onUploadComplete: (url: string, publicId: string) => void;
  /** Callback when upload fails */
  onUploadError?: (error: string) => void;
  /** Upload type for appropriate endpoint */
  uploadType?: 'general' | 'event' | 'profile' | 'announcement';
  /** Current image URL for editing */
  currentImageUrl?: string;
  /** Custom folder for general uploads */
  folder?: string;
  /** Additional class names */
  className?: string;
  /** Disable the uploader */
  disabled?: boolean;
  /** Max file size in MB */
  maxSizeMB?: number;
  /** Accepted file types */
  accept?: string;
  /** Show remove button */
  showRemove?: boolean;
}

/**
 * Upload endpoints mapping
 */
const UPLOAD_ENDPOINTS: Record<string, string> = {
  general: '/api/v1/upload/image',
  event: '/api/v1/upload/event-image',
  profile: '/api/v1/upload/profile-picture',
  announcement: '/api/v1/upload/announcement-image',
};

/**
 * ImageUploader Component
 */
export function ImageUploader({
  onUploadComplete,
  onUploadError,
  uploadType = 'general',
  currentImageUrl,
  folder,
  className,
  disabled = false,
  maxSizeMB = 10,
  accept = 'image/jpeg,image/png,image/gif,image/webp',
  showRemove = true,
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Validate file before upload
   */
  const validateFile = (file: File): string | null => {
    // Check file type
    const allowedTypes = accept.split(',').map((t) => t.trim());
    if (!allowedTypes.includes(file.type)) {
      return 'Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.';
    }

    // Check file size
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return `File too large. Maximum size is ${maxSizeMB}MB.`;
    }

    return null;
  };

  /**
   * Handle file upload
   */
  const handleUpload = useCallback(
    async (file: File) => {
      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        onUploadError?.(validationError);
        return;
      }

      setError(null);
      setSuccess(false);
      setUploading(true);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);

      try {
        // Prepare form data
        const formData = new FormData();
        formData.append('image', file);
        if (folder && uploadType === 'general') {
          formData.append('folder', folder);
        }

        // Get auth token
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication required');
        }

        // Upload to backend
        const endpoint = UPLOAD_ENDPOINTS[uploadType];
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Upload failed');
        }

        const data = await response.json();

        if (data.success) {
          setSuccess(true);
          onUploadComplete(data.data.url, data.data.publicId);

          // Reset success indicator after 3 seconds
          setTimeout(() => setSuccess(false), 3000);
        } else {
          throw new Error(data.message || 'Upload failed');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Upload failed';
        setError(errorMessage);
        setPreview(currentImageUrl || null);
        onUploadError?.(errorMessage);
      } finally {
        setUploading(false);
      }
    },
    [uploadType, folder, currentImageUrl, onUploadComplete, onUploadError, maxSizeMB, accept]
  );

  /**
   * Handle file input change
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  /**
   * Handle drag and drop
   */
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled || uploading) return;

      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleUpload(file);
      }
    },
    [disabled, uploading, handleUpload]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled && !uploading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  /**
   * Handle remove image
   */
  const handleRemove = () => {
    setPreview(null);
    setError(null);
    setSuccess(false);
    onUploadComplete('', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Trigger file input click
   */
  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Upload Zone */}
      {preview ? (
        <div className="relative">
          <img src={preview} alt="Preview" className="h-48 w-full rounded-lg border object-cover" />
          {/* Status Overlay */}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
              <div className="flex flex-col items-center text-white">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="mt-2 text-sm">Uploading…</span>
              </div>
            </div>
          )}
          {success && (
            <div className="absolute bottom-2 right-2">
              <div className="flex items-center gap-1 rounded bg-green-500 px-2 py-1 text-xs text-white">
                <CheckCircle2 className="h-3 w-3" />
                Uploaded
              </div>
            </div>
          )}
          {/* Remove Button */}
          {showRemove && !uploading && (
            <Button
              size="icon"
              variant="destructive"
              className="absolute right-2 top-2 h-8 w-8"
              onClick={handleRemove}
              type="button"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div
          role="button"
          tabIndex={disabled || uploading ? -1 : 0}
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleClick();
            }
          }}
          className={cn(
            'flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors',
            isDragOver && 'border-primary bg-primary/5',
            !isDragOver && !disabled && 'hover:border-primary hover:bg-muted/50',
            disabled && 'cursor-not-allowed opacity-50',
            uploading && 'pointer-events-none'
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="mb-3 h-12 w-12 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Uploading…</p>
            </>
          ) : (
            <>
              <Upload className="mb-3 h-12 w-12 text-muted-foreground" />
              <p className="mb-1 text-sm text-muted-foreground">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, GIF, WebP up to {maxSizeMB}MB
              </p>
            </>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        disabled={disabled || uploading}
        className="hidden"
      />

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}

export default ImageUploader;
