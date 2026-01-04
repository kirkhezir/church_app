/**
 * Advanced Member Filters Component
 *
 * Provides comprehensive filtering options for member directory
 */

import { useState } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../../../components/ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { Calendar } from '../../../components/ui/calendar';
import { format } from 'date-fns';

export interface MemberFilters {
  search?: string;
  role?: string;
  status?: string;
  memberSince?: {
    from?: Date;
    to?: Date;
  };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface AdvancedMemberFiltersProps {
  filters: MemberFilters;
  onChange: (filters: MemberFilters) => void;
  onReset: () => void;
}

export function AdvancedMemberFilters({ filters, onChange, onReset }: AdvancedMemberFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => value && key !== 'sortBy' && key !== 'sortOrder'
  ).length;

  const handleRoleChange = (value: string) => {
    onChange({ ...filters, role: value === 'all' ? undefined : value });
  };

  const handleStatusChange = (value: string) => {
    onChange({ ...filters, status: value === 'all' ? undefined : value });
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-') as [string, 'asc' | 'desc'];
    onChange({ ...filters, sortBy, sortOrder });
  };

  const handleDateFromChange = (date: Date | undefined) => {
    onChange({
      ...filters,
      memberSince: { ...filters.memberSince, from: date },
    });
  };

  const handleDateToChange = (date: Date | undefined) => {
    onChange({
      ...filters,
      memberSince: { ...filters.memberSince, to: date },
    });
  };

  return (
    <div className="space-y-4">
      {/* Filter Toggle Button */}
      <div className="flex items-center gap-4">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFilterCount}
                </Badge>
              )}
              <ChevronDown
                className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="mt-4">
            <div className="rounded-lg border bg-card p-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Role Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Select value={filters.role || 'all'} onValueChange={handleRoleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="STAFF">Staff</SelectItem>
                      <SelectItem value="MEMBER">Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Member Since From */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Member Since (From)</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        {filters.memberSince?.from ? (
                          format(filters.memberSince.from, 'PPP')
                        ) : (
                          <span className="text-muted-foreground">Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.memberSince?.from}
                        onSelect={handleDateFromChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Member Since To */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Member Since (To)</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        {filters.memberSince?.to ? (
                          format(filters.memberSince.to, 'PPP')
                        ) : (
                          <span className="text-muted-foreground">Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.memberSince?.to}
                        onSelect={handleDateToChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Sort Options */}
              <div className="mt-4 flex items-center gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort By</label>
                  <Select
                    value={`${filters.sortBy || 'lastName'}-${filters.sortOrder || 'asc'}`}
                    onValueChange={handleSortChange}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lastName-asc">Name (A-Z)</SelectItem>
                      <SelectItem value="lastName-desc">Name (Z-A)</SelectItem>
                      <SelectItem value="membershipDate-desc">Newest First</SelectItem>
                      <SelectItem value="membershipDate-asc">Oldest First</SelectItem>
                      <SelectItem value="role-asc">Role</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="ml-auto">
                  <Button variant="ghost" onClick={onReset} className="gap-2">
                    <X className="h-4 w-4" />
                    Reset Filters
                  </Button>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Active Filter Badges */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {filters.role && (
              <Badge variant="secondary" className="gap-1">
                Role: {filters.role}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => onChange({ ...filters, role: undefined })}
                />
              </Badge>
            )}
            {filters.status && (
              <Badge variant="secondary" className="gap-1">
                Status: {filters.status}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => onChange({ ...filters, status: undefined })}
                />
              </Badge>
            )}
            {filters.memberSince?.from && (
              <Badge variant="secondary" className="gap-1">
                From: {format(filters.memberSince.from, 'MMM d, yyyy')}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() =>
                    onChange({
                      ...filters,
                      memberSince: { ...filters.memberSince, from: undefined },
                    })
                  }
                />
              </Badge>
            )}
            {filters.memberSince?.to && (
              <Badge variant="secondary" className="gap-1">
                To: {format(filters.memberSince.to, 'MMM d, yyyy')}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() =>
                    onChange({
                      ...filters,
                      memberSince: { ...filters.memberSince, to: undefined },
                    })
                  }
                />
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
