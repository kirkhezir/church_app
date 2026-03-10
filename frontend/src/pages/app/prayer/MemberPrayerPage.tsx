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

import { useState, useEffect, useMemo } from 'react';
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
import { gooeyToast } from 'goey-toast';

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_REQUEST_LENGTH = 500;

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

  const prayedStorageKey = user?.id ? `prayer_prayed:${user.id}` : null;

  const [category, setCategory] = useState('');
  const [request, setRequest] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [prayedFor, setPrayedFor] = useState<Set<string>>(new Set());
  const [publicPrayers, setPublicPrayers] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Load persisted "prayed for" IDs from localStorage once user is known
  useEffect(() => {
    if (!prayedStorageKey) return;
    try {
      const stored = localStorage.getItem(prayedStorageKey);
      if (stored) setPrayedFor(new Set(JSON.parse(stored) as string[]));
    } catch {
      // ignore malformed storage
    }
  }, [prayedStorageKey]);

  useEffect(() => {
    async function load() {
      try {
        const prayers = await prayerService.getPrayerRequests();
        setPublicPrayers(prayers);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredPrayers = useMemo(
    () =>
      activeFilter === 'all'
        ? publicPrayers
        : publicPrayers.filter((p) => p.category.toLowerCase() === activeFilter),
    [publicPrayers, activeFilter]
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
      const prayers = await prayerService.getPrayerRequests();
      setPublicPrayers(prayers);
    } catch {
      gooeyToast.error('Failed to submit prayer request');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrayFor = async (id: string) => {
    if (prayedFor.has(id)) {
      // Toggle off: unpray
      const next = new Set(prayedFor);
      next.delete(id);
      setPrayedFor(next);
      if (prayedStorageKey) {
        try {
          localStorage.setItem(prayedStorageKey, JSON.stringify([...next]));
        } catch {
          /* quota */
        }
      }
      setPublicPrayers((prev) =>
        prev.map((p) => (p.id === id ? { ...p, prayerCount: Math.max(0, p.prayerCount - 1) } : p))
      );
      try {
        const updated = await prayerService.unprayForRequest(id);
        if (updated) {
          setPublicPrayers((prev) => prev.map((p) => (p.id === id ? updated : p)));
        }
      } catch {
        // revert optimistic update
        const reverted = new Set(next);
        reverted.add(id);
        setPrayedFor(reverted);
        if (prayedStorageKey) {
          try {
            localStorage.setItem(prayedStorageKey, JSON.stringify([...reverted]));
          } catch {
            /* quota */
          }
        }
        setPublicPrayers((prev) =>
          prev.map((p) => (p.id === id ? { ...p, prayerCount: p.prayerCount + 1 } : p))
        );
      }
    } else {
      // Toggle on: pray
      const next = new Set(prayedFor);
      next.add(id);
      setPrayedFor(next);
      if (prayedStorageKey) {
        try {
          localStorage.setItem(prayedStorageKey, JSON.stringify([...next]));
        } catch {
          /* quota */
        }
      }
      setPublicPrayers((prev) =>
        prev.map((p) => (p.id === id ? { ...p, prayerCount: p.prayerCount + 1 } : p))
      );
      try {
        const updated = await prayerService.prayForRequest(id);
        if (updated) {
          setPublicPrayers((prev) => prev.map((p) => (p.id === id ? updated : p)));
        }
      } catch {
        const reverted = new Set(next);
        reverted.delete(id);
        setPrayedFor(reverted);
        if (prayedStorageKey) {
          try {
            localStorage.setItem(prayedStorageKey, JSON.stringify([...reverted]));
          } catch {
            /* quota */
          }
        }
        setPublicPrayers((prev) =>
          prev.map((p) => (p.id === id ? { ...p, prayerCount: p.prayerCount - 1 } : p))
        );
      }
    }
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
      {/* Category filter chips */}
      {activeCategories.length > 0 && (
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter prayer requests by category"
        >
          <button
            onClick={() => setActiveFilter('all')}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
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
                onClick={() => setActiveFilter(isActive ? 'all' : cat.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
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
        <div className="space-y-3">
          {filteredPrayers.map((prayer) => {
            const style = getCategoryStyle(prayer.category);
            const hasPrayed = prayedFor.has(prayer.id);
            const authorInitials = prayer.isAnonymous ? '?' : getInitials(prayer.name);
            return (
              <article
                key={prayer.id}
                className={`rounded-xl border border-l-4 ${style.border} border-border/50 ${style.bg} p-4 transition-shadow duration-150 hover:shadow-md`}
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
                <p className="mb-3 text-sm leading-relaxed text-foreground/85">{prayer.request}</p>

                {/* Footer row */}
                <div className="flex items-center justify-between">
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
                    className={
                      hasPrayed
                        ? 'h-8 bg-rose-600 text-white hover:bg-rose-500 dark:bg-rose-700 dark:hover:bg-rose-600'
                        : 'h-8 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950/30'
                    }
                    onClick={() => handlePrayFor(prayer.id)}
                    aria-label={
                      hasPrayed
                        ? `Undo prayer for this request (${prayer.prayerCount} prayers)`
                        : `Pray for this request (${prayer.prayerCount} prayers)`
                    }
                  >
                    <Heart
                      className={`mr-1 h-3.5 w-3.5 ${hasPrayed ? 'fill-white' : ''}`}
                      aria-hidden="true"
                    />
                    {hasPrayed ? 'Prayed ✓' : 'Pray'}
                    <span className="ml-1 text-[11px] opacity-75">({prayer.prayerCount})</span>
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );

  // ─── Page
  return (
    <SidebarLayout breadcrumbs={[{ label: 'Prayer Wall' }]}>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Page header */}
        <div className="mb-6 flex items-start gap-3">
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
        </div>

        {/* Community stats strip */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border/50 bg-card px-4 py-3 text-center shadow-sm">
            <p className="text-xl font-bold tabular-nums text-foreground">{publicPrayers.length}</p>
            <p className="text-xs text-muted-foreground">Active Requests</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-card px-4 py-3 text-center shadow-sm">
            <p className="text-xl font-bold tabular-nums text-foreground">{requestsThisMonth}</p>
            <p className="text-xs text-muted-foreground">This Month</p>
          </div>
          <div className="rounded-xl border border-border/50 bg-card px-4 py-3 text-center shadow-sm">
            <p className="text-xl font-bold tabular-nums text-rose-600 dark:text-rose-400">
              {totalPrayers}
            </p>
            <p className="text-xs text-muted-foreground">Total Prayers</p>
          </div>
        </div>

        {/* ── Mobile: tabs ─────────────────────────────────────────────────── */}
        <div className="block lg:hidden">
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
        <div className="hidden lg:grid lg:grid-cols-[400px_1fr] lg:gap-8">
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
