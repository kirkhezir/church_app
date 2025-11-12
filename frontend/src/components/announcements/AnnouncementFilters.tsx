import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { SearchIcon, XIcon, ArrowUpIcon, ArrowDownIcon, LoaderIcon } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { announcementService, Announcement } from '@/services/endpoints/announcementService';

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
 * - Live search with instant suggestions dropdown
 * - Debounced API calls to reduce server load
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

  const [searchSuggestions, setSearchSuggestions] = useState<Announcement[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounce(filters.search, 500);

  // Fetch search suggestions as user types (instant feedback)
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (filters.search.length < 2) {
        setSearchSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setLoadingSuggestions(true);
      try {
        const response = await announcementService.getAnnouncements(false, 1, 5, {
          search: filters.search,
        });
        setSearchSuggestions(response.data);
        setShowSuggestions(response.data.length > 0);
      } catch (err) {
        console.error('Failed to fetch suggestions:', err);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    // Don't fetch suggestions immediately, wait a bit for better UX
    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [filters.search]);

  // Trigger callback when any filter changes (with debounced search)
  useEffect(() => {
    onFiltersChange({
      ...filters,
      search: debouncedSearch,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, filters.priority, filters.authorId, filters.sortBy, filters.sortOrder]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClearFilters = () => {
    setFilters({
      search: '',
      sortBy: 'date',
      sortOrder: 'desc',
    });
    setSearchSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSelectSuggestion = (title: string) => {
    setFilters({ ...filters, search: title });
    setShowSuggestions(false);
  };

  const hasActiveFilters = filters.search || filters.priority || filters.authorId;

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Search Input with Live Suggestions */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          ref={searchInputRef}
          placeholder="Search by title or content..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          onFocus={() => {
            if (searchSuggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          disabled={loading}
          className="pl-10 pr-10"
        />
        {loadingSuggestions && (
          <LoaderIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
        )}
        {filters.search && !loadingSuggestions && (
          <button
            type="button"
            onClick={() => {
              setFilters({ ...filters, search: '' });
              setSearchSuggestions([]);
              setShowSuggestions(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <XIcon className="h-4 w-4" />
          </button>
        )}

        {/* Suggestions Dropdown */}
        {showSuggestions && searchSuggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg"
          >
            <div className="max-h-96 overflow-y-auto py-1">
              {searchSuggestions.map((announcement) => (
                <button
                  key={announcement.id}
                  type="button"
                  onClick={() => handleSelectSuggestion(announcement.title)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                >
                  <div className="font-medium text-gray-900">
                    {highlightMatch(announcement.title, filters.search)}
                  </div>
                  <div className="mt-1 line-clamp-2 text-sm text-gray-600">
                    {highlightMatch(announcement.content.replace(/<[^>]*>/g, ''), filters.search)}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                    <span
                      className={`rounded-full px-2 py-0.5 ${
                        announcement.priority === 'URGENT'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {announcement.priority}
                    </span>
                    <span>
                      {announcement.author.firstName} {announcement.author.lastName}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
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
