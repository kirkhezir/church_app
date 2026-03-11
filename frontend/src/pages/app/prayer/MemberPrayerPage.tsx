/**
 * Member Prayer Wall Page
 *
 * Community prayer request form + prayer wall for authenticated members.
 * Features: category colour accents, member identity, filter chips, stats strip.
 *
 * Icon choice:
 *   HeartHandshake — page/section icon representing intercession & mutual care
 *   Heart (filled)  — "I Prayed" button: personal affirmation action
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  HeartHandshake,
  Heart,
  Send,
  Lock,
  Users,
  CheckCircle,
  Calendar,
  Loader2,
  Sparkles,
  EyeOff,
  ChevronDown,
  ArrowUpDown,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SidebarLayout } from '@/components/layout';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationCounts } from '@/hooks/useNotificationCounts';
import { prayerService, type PrayerRequest } from '@/services/endpoints/prayerService';
import { websocketClient } from '@/services/websocket/websocketClient';
import { gooeyToast } from 'goey-toast';

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_REQUEST_LENGTH = 500;
const PAGE_SIZE = 9; // cards per "Load More" step

const CATEGORIES = [
  { id: 'health', name: 'Health' },
  { id: 'family', name: 'Family' },
  { id: 'guidance', name: 'Guidance' },
  { id: 'financial', name: 'Financial' },
  { id: 'spiritual', name: 'Spiritual Growth' },
  { id: 'relationships', name: 'Relationships' },
  { id: 'thanksgiving', name: 'Thanksgiving' },
  { id: 'other', name: 'Other' },
] as const;

// Full Tailwind class strings are required so purgecss keeps them
const CATEGORY_STYLES: Record<string, { badge: string; border: string; bg: string; dot: string }> =
  {
    health: {
      badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
      border: 'border-l-rose-400',
      bg: 'bg-rose-50/60 dark:bg-rose-950/20',
      dot: 'bg-rose-400',
    },
    family: {
      badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
      border: 'border-l-blue-400',
      bg: 'bg-blue-50/60 dark:bg-blue-950/20',
      dot: 'bg-blue-400',
    },
    guidance: {
      badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
      border: 'border-l-amber-400',
      bg: 'bg-amber-50/60 dark:bg-amber-950/20',
      dot: 'bg-amber-400',
    },
    financial: {
      badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
      border: 'border-l-emerald-400',
      bg: 'bg-emerald-50/60 dark:bg-emerald-950/20',
      dot: 'bg-emerald-400',
    },
    spiritual: {
      badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
      border: 'border-l-purple-400',
      bg: 'bg-purple-50/60 dark:bg-purple-950/20',
      dot: 'bg-purple-400',
    },
    relationships: {
      badge: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
      border: 'border-l-pink-400',
      bg: 'bg-pink-50/60 dark:bg-pink-950/20',
      dot: 'bg-pink-400',
    },
    thanksgiving: {
      badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
      border: 'border-l-orange-400',
      bg: 'bg-orange-50/60 dark:bg-orange-950/20',
      dot: 'bg-orange-400',
    },
    other: {
      badge: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
      border: 'border-l-slate-400',
      bg: 'bg-slate-50/60 dark:bg-slate-900/20',
      dot: 'bg-slate-400',
    },
  };
const FALLBACK_STYLE = {
  badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  border: 'border-l-violet-400',
  bg: 'bg-violet-50/60 dark:bg-violet-950/20',
  dot: 'bg-violet-400',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getCategoryStyle(category: string) {
  return CATEGORY_STYLES[category.toLowerCase()] ?? FALLBACK_STYLE;
}

function getCategoryName(category: string): string {
  const match = CATEGORIES.find(
    (c) => c.id === category.toLowerCase() || c.name.toLowerCase() === category.toLowerCase()
  );
  return match ? match.name : category.charAt(0).toUpperCase() + category.slice(1);
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ─── Component ───────────────────────────────────────────────────────────────

export function MemberPrayerPage() {
  const { user } = useAuth();
  const { refresh: refreshNotifications } = useNotificationCounts();
  const memberName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Member';
  const memberInitials = getInitials(memberName);

  const [category, setCategory] = useState('');
  const [request, setRequest] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [prayedFor, setPrayedFor] = useState<Set<string>>(new Set());
  const [prayingId, setPrayingId] = useState<string | null>(null);
  const [publicPrayers, setPublicPrayers] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'most_prayed'>('recent');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Reset pagination when filter or sort changes
  const prevFilterRef = useRef(activeFilter);
  const prevSortRef = useRef(sortBy);
  useEffect(() => {
    if (prevFilterRef.current !== activeFilter || prevSortRef.current !== sortBy) {
      setVisibleCount(PAGE_SIZE);
      prevFilterRef.current = activeFilter;
      prevSortRef.current = sortBy;
    }
  }, [activeFilter, sortBy]);

  const loadPrayers = useCallback(async () => {
    try {
      const prayers = await prayerService.getPrayerRequests();
      setPublicPrayers(prayers);
      // Sync server-side pray state (source of truth for authenticated users)
      setPrayedFor(new Set(prayers.filter((p) => p.hasPrayed).map((p) => p.id)));
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const prayers = await prayerService.getPrayerRequests();
        setPublicPrayers(prayers);
        setPrayedFor(new Set(prayers.filter((p) => p.hasPrayed).map((p) => p.id)));
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Refresh prayer wall in real-time when admin approves a new prayer
  useEffect(() => {
    const handler = () => {
      loadPrayers();
    };
    websocketClient.onPrayerApproved(handler);
    return () => {
      websocketClient.off('prayer:approved', handler);
    };
  }, [loadPrayers]);

  const sortedPrayers = useMemo(() => {
    const copy = [...publicPrayers];
    if (sortBy === 'most_prayed') {
      copy.sort((a, b) => b.prayerCount - a.prayerCount);
    } else {
      copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return copy;
  }, [publicPrayers, sortBy]);

  const filteredPrayers = useMemo(
    () =>
      activeFilter === 'all'
        ? sortedPrayers
        : sortedPrayers.filter((p) => p.category.toLowerCase() === activeFilter),
    [sortedPrayers, activeFilter]
  );

  const visiblePrayers = useMemo(
    () => filteredPrayers.slice(0, visibleCount),
    [filteredPrayers, visibleCount]
  );

  const totalPrayers = publicPrayers.reduce((sum, p) => sum + p.prayerCount, 0);

  const requestsThisMonth = useMemo(() => {
    const now = new Date();
    return publicPrayers.filter((p) => {
      const d = new Date(p.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [publicPrayers]);

  const activeCategories = useMemo(() => {
    const seen = new Set(publicPrayers.map((p) => p.category.toLowerCase()));
    return CATEGORIES.filter((c) => seen.has(c.id));
  }, [publicPrayers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) {
      gooeyToast.error('Please select a category');
      return;
    }
    setSubmitting(true);
    try {
      await prayerService.submitPrayerRequest({
        name: isAnonymous ? 'Anonymous' : memberName,
        email: isAnonymous ? undefined : user?.email,
        request,
        category: category || undefined,
        isAnonymous,
      });
      setIsSubmitted(true);
      // Refresh notification counts so the bell updates immediately
      refreshNotifications();
      await loadPrayers();
    } catch {
      gooeyToast.error('Failed to submit prayer request');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrayFor = async (id: string) => {
    if (prayingId === id) return; // prevent double-click
    setPrayingId(id);
    if (prayedFor.has(id)) {
      // Toggle off: unpray (optimistic)
      const next = new Set(prayedFor);
      next.delete(id);
      setPrayedFor(next);
      setPublicPrayers((prev) =>
        prev.map((p) => (p.id === id ? { ...p, prayerCount: Math.max(0, p.prayerCount - 1) } : p))
      );
      try {
        const updated = await prayerService.unprayForRequest(id);
        if (updated) {
          setPublicPrayers((prev) =>
            prev.map((p) => (p.id === id ? { ...updated, hasPrayed: false } : p))
          );
        }
      } catch {
        // revert optimistic update
        const reverted = new Set(next);
        reverted.add(id);
        setPrayedFor(reverted);
        setPublicPrayers((prev) =>
          prev.map((p) => (p.id === id ? { ...p, prayerCount: p.prayerCount + 1 } : p))
        );
      }
    } else {
      // Toggle on: pray (optimistic)
      const next = new Set(prayedFor);
      next.add(id);
      setPrayedFor(next);
      setPublicPrayers((prev) =>
        prev.map((p) => (p.id === id ? { ...p, prayerCount: p.prayerCount + 1 } : p))
      );
      try {
        const updated = await prayerService.prayForRequest(id);
        if (updated) {
          setPublicPrayers((prev) =>
            prev.map((p) => (p.id === id ? { ...updated, hasPrayed: true } : p))
          );
        }
      } catch {
        const reverted = new Set(next);
        reverted.delete(id);
        setPrayedFor(reverted);
        setPublicPrayers((prev) =>
          prev.map((p) => (p.id === id ? { ...p, prayerCount: p.prayerCount - 1 } : p))
        );
      }
    }
    setPrayingId(null);
  };

  if (loading) {
    return (
      <SidebarLayout breadcrumbs={[{ label: 'Prayer Wall' }]}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </SidebarLayout>
    );
  }

  // ─── Submit Form (shared between mobile tab and desktop column) ─────────────
  const submitForm = (
    <Card className="border border-border/60 shadow-sm">
      <CardContent className="p-6">
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Member identity chip */}
            <div className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3">
              <Avatar className="h-9 w-9 flex-shrink-0">
                <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                  {isAnonymous ? '?' : memberInitials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {isAnonymous ? 'Anonymous' : memberName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isAnonymous ? 'Your identity will be hidden' : 'Submitting as yourself'}
                </p>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label htmlFor="prayer-category">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="prayer-category" className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 flex-shrink-0 rounded-full ${CATEGORY_STYLES[cat.id]?.dot ?? 'bg-muted-foreground'}`}
                        />
                        {cat.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Request textarea */}
            <div className="space-y-1.5">
              <Label htmlFor="prayer-request">
                Your Prayer Request <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="prayer-request"
                value={request}
                onChange={(e) => setRequest(e.target.value)}
                required
                rows={5}
                maxLength={MAX_REQUEST_LENGTH}
                placeholder="Share what's on your heart..."
                className="resize-none"
              />
              <p
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className={`text-right text-xs ${
                  request.length >= MAX_REQUEST_LENGTH * 0.9
                    ? 'text-destructive'
                    : 'text-muted-foreground'
                }`}
              >
                {request.length}/{MAX_REQUEST_LENGTH}
              </p>
            </div>

            {/* Share on wall toggle */}
            <div className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/30 px-4 py-3">
              <div className="min-w-0 pr-4">
                <p className="text-sm font-medium text-foreground">Share on Prayer Wall</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {isPublic
                    ? 'Visible to church members — they can pray for you'
                    : 'Private — only the prayer team will see this'}
                </p>
              </div>
              <Switch
                id="isPublic"
                checked={isPublic}
                onCheckedChange={setIsPublic}
                aria-label="Share prayer request on the prayer wall"
              />
            </div>

            {/* Anonymous toggle */}
            <div className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/30 px-4 py-3">
              <div className="min-w-0 pr-4">
                <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                  Submit Anonymously
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {isAnonymous
                    ? 'Your name will not appear on the prayer wall'
                    : 'Your name will be shown on the prayer wall'}
                </p>
              </div>
              <Switch
                id="isAnonymous"
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
                aria-label="Submit prayer request anonymously"
              />
            </div>

            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Lock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
              <span>Your prayer request is kept confidential within the church community.</span>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={submitting || !category || !request.trim()}
            >
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Submit Prayer Request
            </Button>
          </form>
        ) : (
          <div className="py-8 text-center" role="status" aria-live="polite">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-9 w-9 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="mb-1 text-lg font-bold text-foreground">Prayer Request Submitted!</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Our prayer team will be interceding for you.
            </p>
            <blockquote className="mb-6 flex items-start gap-2 rounded-xl bg-muted/50 px-4 py-3 text-left">
              <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
              <p className="text-xs italic leading-relaxed text-muted-foreground">
                &ldquo;Do not be anxious about anything, but in every situation, by prayer and
                petition, with thanksgiving, present your requests to God.&rdquo;
                <span className="mt-1 block font-medium not-italic">— Philippians 4:6</span>
              </p>
            </blockquote>
            <Button
              onClick={() => {
                setIsSubmitted(false);
                setCategory('');
                setRequest('');
                setIsPublic(true);
                setIsAnonymous(false);
              }}
              variant="outline"
              className="w-full"
            >
              Submit Another Request
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // ─── Prayer Wall (shared between mobile tab and desktop column) ─────────────
  const prayerWall = (
    <div className="space-y-4">
      {/* Category filter chips + sort */}
      {activeCategories.length > 0 && (
        <div className="space-y-2">
          <div
            className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="group"
            aria-label="Filter prayer requests by category"
          >
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`min-h-[44px] flex-shrink-0 touch-manipulation rounded-full px-3 py-2 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                activeFilter === 'all'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'border border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
              aria-pressed={activeFilter === 'all'}
            >
              All ({publicPrayers.length})
            </button>
            {activeCategories.map((cat) => {
              const style = CATEGORY_STYLES[cat.id];
              const count = publicPrayers.filter((p) => p.category.toLowerCase() === cat.id).length;
              const isActive = activeFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveFilter(isActive ? 'all' : cat.id)}
                  className={`min-h-[44px] flex-shrink-0 touch-manipulation rounded-full px-3 py-2 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                    isActive
                      ? `${style.badge} ring-current/20 shadow-sm ring-1 ring-inset`
                      : 'border border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                  aria-pressed={isActive}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Sort control */}
          <div className="flex items-center justify-end gap-1.5">
            <ArrowUpDown className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'recent' | 'most_prayed')}>
              <SelectTrigger
                className="h-7 w-auto gap-1 border-0 bg-transparent px-0 text-xs text-muted-foreground shadow-none focus:ring-0"
                aria-label="Sort prayer requests"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="most_prayed">Most Prayed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Prayer cards */}
      {filteredPrayers.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <HeartHandshake className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm font-medium text-foreground">No prayer requests yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {activeFilter === 'all'
                ? 'Be the first to share a prayer request with the community.'
                : `No ${getCategoryName(activeFilter)} prayer requests yet.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {visiblePrayers.map((prayer) => {
            const style = getCategoryStyle(prayer.category);
            const hasPrayed = prayedFor.has(prayer.id);
            const authorInitials = prayer.isAnonymous ? '?' : getInitials(prayer.name);
            return (
              <article
                key={prayer.id}
                aria-label={`${getCategoryName(prayer.category)} prayer by ${prayer.isAnonymous ? 'Anonymous' : prayer.name}`}
                className={`flex flex-col rounded-xl border border-l-4 ${style.border} border-border/50 ${style.bg} p-4 transition-shadow duration-150 hover:shadow-md`}
              >
                {/* Header row */}
                <div className="mb-2.5 flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${style.badge}`}
                  >
                    {getCategoryName(prayer.category)}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(prayer.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                {/* Request text */}
                <p className="mb-3 line-clamp-4 flex-1 text-sm leading-relaxed text-foreground/85">
                  {prayer.request}
                </p>

                {/* Footer row */}
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-muted text-[10px] font-medium text-muted-foreground">
                        {authorInitials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      {prayer.isAnonymous ? 'Anonymous' : prayer.name}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant={hasPrayed ? 'default' : 'outline'}
                    disabled={prayingId === prayer.id}
                    className={
                      hasPrayed
                        ? 'h-11 touch-manipulation bg-rose-600 text-white hover:bg-rose-500 dark:bg-rose-700 dark:hover:bg-rose-600'
                        : 'h-11 touch-manipulation border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/30'
                    }
                    onClick={() => handlePrayFor(prayer.id)}
                    aria-label={
                      hasPrayed
                        ? `Undo prayer for this request (${prayer.prayerCount} prayers)`
                        : `Pray for this request (${prayer.prayerCount} prayers)`
                    }
                  >
                    {prayingId === prayer.id ? (
                      <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    ) : (
                      <Heart
                        className={`mr-1 h-3.5 w-3.5 ${hasPrayed ? 'fill-white' : ''}`}
                        aria-hidden="true"
                      />
                    )}
                    {hasPrayed ? 'Prayed ✓' : 'Pray'}
                    <span className="ml-1 text-[11px] opacity-75">({prayer.prayerCount})</span>
                  </Button>
                </div>
              </article>
            );
          })}

          {/* Load More / pagination */}
          {visibleCount < filteredPrayers.length && (
            <div className="col-span-full pt-2 text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                className="gap-1.5"
              >
                <ChevronDown className="h-3.5 w-3.5" />
                Show {Math.min(PAGE_SIZE, filteredPrayers.length - visibleCount)} more
                <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {filteredPrayers.length - visibleCount} remaining
                </span>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // ─── Page
  return (
    <SidebarLayout breadcrumbs={[{ label: 'Prayer Wall' }]}>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Page header */}
        <header className="mb-6 flex items-start gap-3">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-900/30">
            <HeartHandshake className="h-6 w-6 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Prayer Wall</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Lift each other up in prayer —{' '}
              <span className="font-medium text-foreground">{totalPrayers}</span> prayers offered by
              our community
            </p>
          </div>
        </header>

        {/* Community stats strip */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center justify-center rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 shadow-sm dark:border-blue-900/30 dark:bg-blue-950/20">
            <Users className="mb-1 h-4 w-4 text-blue-500" />
            <p className="text-base font-bold tabular-nums text-blue-700 dark:text-blue-300 sm:text-xl">
              {publicPrayers.length}
            </p>
            <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Requests</p>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 shadow-sm dark:border-amber-900/30 dark:bg-amber-950/20">
            <Calendar className="mb-1 h-4 w-4 text-amber-500" />
            <p className="text-base font-bold tabular-nums text-amber-700 dark:text-amber-300 sm:text-xl">
              {requestsThisMonth}
            </p>
            <p className="text-xs text-amber-600/70 dark:text-amber-400/70">This Month</p>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 shadow-sm dark:border-rose-900/30 dark:bg-rose-950/20">
            <Heart className="mb-1 h-4 w-4 fill-rose-500 text-rose-500" />
            <p className="text-base font-bold tabular-nums text-rose-600 dark:text-rose-400 sm:text-xl">
              {totalPrayers}
            </p>
            <p className="text-xs text-rose-600/70 dark:text-rose-400/70">Prayers Offered</p>
          </div>
        </div>

        {/* ── Mobile: tabs ─────────────────────────────────────────────────── */}
        <div className="block xl:hidden">
          <Tabs defaultValue="wall">
            <TabsList className="mb-5 grid w-full grid-cols-2">
              <TabsTrigger value="wall" className="gap-1.5">
                <Users className="h-4 w-4" />
                Prayer Wall
              </TabsTrigger>
              <TabsTrigger value="submit" className="gap-1.5">
                <Send className="h-4 w-4" />
                Submit Request
              </TabsTrigger>
            </TabsList>
            <TabsContent value="wall">{prayerWall}</TabsContent>
            <TabsContent value="submit">{submitForm}</TabsContent>
          </Tabs>
        </div>

        {/* ── Desktop: two columns ─────────────────────────────────────────── */}
        <div className="hidden xl:grid xl:grid-cols-[420px_1fr] xl:gap-8">
          {/* Left — submit form */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
              <Send className="h-4 w-4 text-muted-foreground" />
              Submit a Prayer Request
            </h2>
            {submitForm}
          </div>

          {/* Right — prayer wall */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
              <HeartHandshake className="h-4 w-4 text-rose-500" />
              Community Prayer Wall
            </h2>
            {prayerWall}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}

export default MemberPrayerPage;
