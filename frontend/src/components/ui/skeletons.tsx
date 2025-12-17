import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton for Member Card
 */
export function MemberCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  );
}

/**
 * Skeleton for Member Directory Grid
 */
export function MemberDirectorySkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <MemberCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton for Event Card
 */
export function EventCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <Skeleton className="h-40 w-full" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-5 w-3/4" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 w-20 rounded" />
          <Skeleton className="h-8 w-20 rounded" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for Events List
 */
export function EventsListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton for Announcement Card
 */
export function AnnouncementCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-3/4" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-8 w-24 rounded" />
      </div>
    </div>
  );
}

/**
 * Skeleton for Announcements List
 */
export function AnnouncementsListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <AnnouncementCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton for Message Item
 */
export function MessageItemSkeleton() {
  return (
    <div className="flex items-start gap-4 border-b p-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  );
}

/**
 * Skeleton for Messages List
 */
export function MessagesListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="divide-y">
      {Array.from({ length: count }).map((_, i) => (
        <MessageItemSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton for Dashboard Statistics
 */
export function DashboardStatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
          <Skeleton className="mt-4 h-8 w-16" />
          <Skeleton className="mt-2 h-3 w-32" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for Table Row
 */
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

/**
 * Skeleton for Data Table
 */
export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="rounded-lg border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-4 py-3 text-left">
                <Skeleton className="h-4 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Skeleton for Detail Page
 */
export function DetailPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-8 w-64" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Skeleton className="h-64 w-full rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for Profile Page
 */
export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
