/**
 * EventFilters Component
 *
 * Provides filtering options for events list:
 * - Category filter
 * - Date range filter
 */

import { EventCategory } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, FilterIcon, XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventFiltersProps {
  selectedCategory?: EventCategory;
  startDate?: string;
  endDate?: string;
  onCategoryChange: (category?: EventCategory) => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onClear: () => void;
}

const categories: { value: EventCategory; label: string; dot: string; activeBg: string }[] = [
  {
    value: EventCategory.WORSHIP,
    label: 'Worship',
    dot: 'bg-blue-500',
    activeBg: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  {
    value: EventCategory.BIBLE_STUDY,
    label: 'Bible Study',
    dot: 'bg-emerald-500',
    activeBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  },
  {
    value: EventCategory.COMMUNITY,
    label: 'Community',
    dot: 'bg-purple-500',
    activeBg: 'bg-purple-600 hover:bg-purple-700 text-white',
  },
  {
    value: EventCategory.FELLOWSHIP,
    label: 'Fellowship',
    dot: 'bg-amber-500',
    activeBg: 'bg-amber-600 hover:bg-amber-700 text-white',
  },
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
    <div className="space-y-5 rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FilterIcon className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Filters
          </h3>
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onClear} className="h-7 gap-1 px-2 text-xs">
            <XIcon className="h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      <Separator />

      {/* Category Filter */}
      <div className="space-y-3">
        <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Category
        </Label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          <Button
            variant={selectedCategory === undefined ? 'default' : 'outline'}
            size="sm"
            onClick={() => onCategoryChange(undefined)}
            aria-pressed={selectedCategory === undefined}
            className="h-8 rounded-full px-3 text-xs"
          >
            All Events
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.value}
              variant="outline"
              size="sm"
              onClick={() => onCategoryChange(cat.value)}
              aria-pressed={selectedCategory === cat.value}
              className={cn(
                'h-8 gap-1.5 rounded-full px-3 text-xs transition-colors',
                selectedCategory === cat.value && cat.activeBg
              )}
            >
              <span
                className={cn(
                  'h-2 w-2 shrink-0 rounded-full',
                  cat.dot,
                  selectedCategory === cat.value && 'bg-white'
                )}
              />
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Date Range Filter */}
      <div className="space-y-3">
        <Label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <CalendarIcon className="h-3.5 w-3.5" />
          Date Range
        </Label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="start-date" className="text-xs text-muted-foreground">
              From
            </Label>
            <Input
              id="start-date"
              type="date"
              value={startDate || ''}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="end-date" className="text-xs text-muted-foreground">
              To
            </Label>
            <Input
              id="end-date"
              type="date"
              value={endDate || ''}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
