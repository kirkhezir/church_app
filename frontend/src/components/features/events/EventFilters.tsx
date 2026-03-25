/**
 * EventFilters Component
 *
 * Provides filtering options for events list:
 * - Category filter with colored pill buttons
 * - Date range filter
 * Sticky sidebar on desktop with polished card design
 */

import { EventCategory } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarIcon, FilterIcon, SparklesIcon, XIcon } from 'lucide-react';
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
    activeBg: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600',
  },
  {
    value: EventCategory.BIBLE_STUDY,
    label: 'Bible Study',
    dot: 'bg-emerald-500',
    activeBg: 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600',
  },
  {
    value: EventCategory.COMMUNITY,
    label: 'Community',
    dot: 'bg-purple-500',
    activeBg: 'bg-purple-600 hover:bg-purple-700 text-white border-purple-600',
  },
  {
    value: EventCategory.FELLOWSHIP,
    label: 'Fellowship',
    dot: 'bg-amber-500',
    activeBg: 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600',
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
    <aside className="sticky top-6" aria-label="Event filters">
      <div className="space-y-1">
        {/* Filter Header Card */}
        <div className="rounded-xl border bg-gradient-to-br from-primary/5 via-card to-accent/5 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FilterIcon className="h-4 w-4" />
              </span>
              <h3 className="font-heading text-sm font-semibold tracking-tight">Filter Events</h3>
            </div>
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-destructive"
              >
                <XIcon className="h-3 w-3" />
                Clear all
              </Button>
            )}
          </div>
        </div>

        {/* Category Filter Card */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <Label className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <SparklesIcon className="h-3.5 w-3.5" />
            Category
          </Label>
          <div className="flex flex-col gap-1.5" role="group" aria-label="Filter by category">
            <Button
              variant={selectedCategory === undefined ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onCategoryChange(undefined)}
              aria-pressed={selectedCategory === undefined}
              className={cn(
                'h-9 justify-start rounded-lg px-3 text-sm font-medium',
                selectedCategory === undefined
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              All Events
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.value}
                variant="ghost"
                size="sm"
                onClick={() => onCategoryChange(cat.value)}
                aria-pressed={selectedCategory === cat.value}
                className={cn(
                  'h-9 justify-start gap-2.5 rounded-lg px-3 text-sm font-medium transition-all',
                  selectedCategory === cat.value
                    ? cat.activeBg
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <span
                  className={cn(
                    'h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-offset-1',
                    cat.dot,
                    selectedCategory === cat.value
                      ? 'ring-white/30 ring-offset-transparent'
                      : 'ring-transparent ring-offset-transparent'
                  )}
                />
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Date Range Filter Card */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <Label className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <CalendarIcon className="h-3.5 w-3.5" />
            Date Range
          </Label>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="start-date" className="text-xs text-muted-foreground">
                From
              </Label>
              <Input
                id="start-date"
                type="date"
                value={startDate || ''}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="h-9 rounded-lg text-sm"
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
                className="h-9 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
