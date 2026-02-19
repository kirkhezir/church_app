import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { SearchIcon, XIcon, ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

export interface FilterState {
  search: string;
  priority?: 'URGENT' | 'NORMAL';
  authorId?: string;
  sortBy: 'date' | 'priority' | 'views';
  sortOrder: 'asc' | 'desc';
}

interface Author {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Props {
  onFiltersChange: (filters: FilterState) => void;
  authors: Author[];
  loading?: boolean;
}

/**
 * AnnouncementFilters Component
 *
 * Provides search, filtering, and sorting controls for announcements
 * - Real-time search that filters table instantly
 * - Debounced API calls (300ms) to reduce server load
 * - Priority filter dropdown
 * - Author filter dropdown
 * - Sort controls (field + order)
 * - Clear filters button
 */
export function AnnouncementFilters({ onFiltersChange, authors, loading = false }: Props) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    sortBy: 'date',
    sortOrder: 'desc',
  });

  // Very short debounce for true real-time feel (150ms - just enough to reduce API spam)
  const debouncedSearch = useDebounce(filters.search, 150);

  // Trigger callback when any filter changes (with debounced search)
  useEffect(() => {
    onFiltersChange({
      ...filters,
      search: debouncedSearch,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, filters.priority, filters.authorId, filters.sortBy, filters.sortOrder]);

  const handleClearFilters = () => {
    setFilters({
      search: '',
      sortBy: 'date',
      sortOrder: 'desc',
    });
  };

  const hasActiveFilters = filters.search || filters.priority || filters.authorId;

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Real-time Search Input */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search announcements"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          disabled={loading}
          className="pl-10 pr-10"
        />
        {filters.search && (
          <button
            type="button"
            onClick={() => setFilters({ ...filters, search: '' })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground"
            aria-label="Clear search"
          >
            <XIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Priority Filter */}
        <div className="w-full sm:w-auto sm:min-w-[140px]">
          <Select
            value={filters.priority || 'all'}
            onValueChange={(value) =>
              setFilters({
                ...filters,
                priority: value === 'all' ? undefined : (value as 'URGENT' | 'NORMAL'),
              })
            }
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
              <SelectItem value="NORMAL">Normal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Author Filter */}
        <div className="w-full sm:w-auto sm:min-w-[180px]">
          <Select
            value={filters.authorId || 'all'}
            onValueChange={(value) =>
              setFilters({
                ...filters,
                authorId: value === 'all' ? undefined : value,
              })
            }
            disabled={loading || authors.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Author" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Authors</SelectItem>
              {authors.map((author) => (
                <SelectItem key={author.id} value={author.id}>
                  {author.firstName} {author.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div className="w-full sm:w-auto sm:min-w-[120px]">
          <Select
            value={filters.sortBy}
            onValueChange={(value) =>
              setFilters({
                ...filters,
                sortBy: value as 'date' | 'priority' | 'views',
              })
            }
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="views">Views</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort Order Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setFilters({
              ...filters,
              sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
            })
          }
          disabled={loading}
          className="gap-1"
        >
          {filters.sortOrder === 'asc' ? (
            <>
              <ArrowUpIcon className="h-3 w-3" />
              <span className="hidden sm:inline">Ascending</span>
            </>
          ) : (
            <>
              <ArrowDownIcon className="h-3 w-3" />
              <span className="hidden sm:inline">Descending</span>
            </>
          )}
        </Button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            disabled={loading}
            className="gap-1"
          >
            <XIcon className="h-3 w-3" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
