import { Button } from '@/components/ui/button';
import { ArchiveIcon, TrashIcon, XIcon } from 'lucide-react';

interface Props {
  selectedCount: number;
  onArchive: () => void;
  onDelete: () => void;
  onClearSelection: () => void;
  isArchived?: boolean;
}

/**
 * BulkActionBar Component
 *
 * Floating action bar that appears when announcements are selected
 * Provides bulk actions: Archive, Delete, and Clear Selection
 * Positioned at the bottom center of the screen
 */
export function BulkActionBar({
  selectedCount,
  onArchive,
  onDelete,
  onClearSelection,
  isArchived = false,
}: Props) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 animate-in slide-in-from-bottom-5">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 shadow-lg sm:gap-3 sm:p-4">
        {/* Selection Count */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground sm:text-base">
            {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
          </span>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-muted" />

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Archive Button - Only show for active announcements */}
          {!isArchived && (
            <Button size="sm" variant="outline" onClick={onArchive} className="gap-1">
              <ArchiveIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Archive</span>
            </Button>
          )}

          {/* Delete Button */}
          <Button size="sm" variant="destructive" onClick={onDelete} className="gap-1">
            <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Delete</span>
          </Button>

          {/* Clear Selection Button */}
          <Button size="sm" variant="ghost" onClick={onClearSelection} className="gap-1">
            <XIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Clear</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
