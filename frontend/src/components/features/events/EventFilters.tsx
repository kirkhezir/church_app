/**
 * EventFilters Component
 *
 * Provides filtering options for events list:
 * - Category filter
 * - Date range filter
 */

import { EventCategory } from '../../../types/api';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';

interface EventFiltersProps {
  selectedCategory?: EventCategory;
  startDate?: string;
  endDate?: string;
  onCategoryChange: (category?: EventCategory) => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onClear: () => void;
}

const categories: { value: EventCategory; label: string }[] = [
  { value: EventCategory.WORSHIP, label: 'Worship Service' },
  { value: EventCategory.BIBLE_STUDY, label: 'Bible Study' },
  { value: EventCategory.COMMUNITY, label: 'Community' },
  { value: EventCategory.FELLOWSHIP, label: 'Fellowship' },
];

export function EventFilters({
  selectedCategory,
  startDate,
  endDate,
  onCategoryChange,
  onStartDateChange,
  onEndDateChange,
  onClear,
}: EventFiltersProps) {
  const hasFilters = selectedCategory || startDate || endDate;

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear All
          </Button>
        )}
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
        <Label>Category</Label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === undefined ? 'default' : 'outline'}
            size="sm"
            onClick={() => onCategoryChange(undefined)}
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onCategoryChange(cat.value)}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="space-y-3">
        <Label>Date Range</Label>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="start-date" className="text-xs text-muted-foreground">
              From
            </Label>
            <Input
              id="start-date"
              type="date"
              value={startDate || ''}
              onChange={(e) => onStartDateChange(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="end-date" className="text-xs text-muted-foreground">
              To
            </Label>
            <Input
              id="end-date"
              type="date"
              value={endDate || ''}
              onChange={(e) => onEndDateChange(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
