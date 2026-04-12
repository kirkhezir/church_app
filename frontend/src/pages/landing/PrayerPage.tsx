/**
 * Prayer Request Page
 *
 * Private prayer request form with prayer wall and prayer updates
 */

import { useState, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router';
import {
  Heart,
  Send,
  Lock,
  Users,
  CheckCircle,
  Eye,
  EyeOff,
  MessageCircle,
  Calendar,
  Clock,
  Loader2,
  ChevronDown,
  ArrowUpDown,
  Pencil,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PublicLayout } from '@/layouts';
import { useI18n } from '@/i18n';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { prayerService, type PrayerRequest } from '@/services/endpoints/prayerService';
import { gooeyToast } from 'goey-toast';

const categories = [
  { id: 'health', name: 'Health', nameThai: 'สุขภาพ' },
  { id: 'family', name: 'Family', nameThai: 'ครอบครัว' },
  { id: 'guidance', name: 'Guidance', nameThai: 'การนำทาง' },
  { id: 'financial', name: 'Financial', nameThai: 'การเงิน' },
  { id: 'spiritual', name: 'Spiritual Growth', nameThai: 'การเติบโตฝ่ายจิตวิญญาณ' },
  { id: 'relationships', name: 'Relationships', nameThai: 'ความสัมพันธ์' },
  { id: 'thanksgiving', name: 'Thanksgiving', nameThai: 'ขอบพระคุณ' },
  { id: 'other', name: 'Other', nameThai: 'อื่นๆ' },
];

/** Resolve a category value to its display name (handles lowercase IDs from DB). */
function getCategoryDisplay(category: string, lang: 'en' | 'th'): string {
  const match = categories.find(
    (c) => c.id === category.toLowerCase() || c.name.toLowerCase() === category.toLowerCase()
  );
  if (match) return lang === 'th' ? match.nameThai : match.name;
  // Fallback: capitalize first letter
  return category.charAt(0).toUpperCase() + category.slice(1);
}

// ─── Category colors for prayer cards ────────────────────────────────────────

const CATEGORY_CARD_STYLES: Record<string, { border: string; badge: string; bg: string }> = {
  health: {
    border: 'border-l-rose-400',
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    bg: 'bg-rose-50/30 dark:bg-rose-950/10',
  },
  family: {
    border: 'border-l-blue-400',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    bg: 'bg-blue-50/30 dark:bg-blue-950/10',
  },
  guidance: {
    border: 'border-l-amber-400',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    bg: 'bg-amber-50/30 dark:bg-amber-950/10',
  },
  financial: {
    border: 'border-l-emerald-400',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    bg: 'bg-emerald-50/30 dark:bg-emerald-950/10',
  },
  spiritual: {
    border: 'border-l-purple-400',
    badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    bg: 'bg-purple-50/30 dark:bg-purple-950/10',
  },
  relationships: {
    border: 'border-l-pink-400',
    badge: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
    bg: 'bg-pink-50/30 dark:bg-pink-950/10',
  },
  thanksgiving: {
    border: 'border-l-orange-400',
    badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    bg: 'bg-orange-50/30 dark:bg-orange-950/10',
  },
  other: {
    border: 'border-l-slate-400',
    badge: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    bg: 'bg-slate-50/30 dark:bg-slate-950/10',
  },
};
const FALLBACK_CARD_STYLE = {
  border: 'border-l-purple-400',
  badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  bg: 'bg-purple-50/30 dark:bg-purple-950/10',
};

function getCategoryCardStyle(category: string) {
  return CATEGORY_CARD_STYLES[category.toLowerCase()] ?? FALLBACK_CARD_STYLE;
}

// ─── Time filter ────────────────────────────────────────────────────────────

type TimeFilter = 'week' | 'month' | 'all';
const TIME_FILTERS: { id: TimeFilter; label: string; labelTh: string }[] = [
  { id: 'week', label: 'This Week', labelTh: 'สัปดาห์นี้' },
  { id: 'month', label: 'This Month', labelTh: 'เดือนนี้' },
  { id: 'all', label: 'All Time', labelTh: 'ทั้งหมด' },
];

function getTimeFilterStart(filter: TimeFilter): Date | null {
  if (filter === 'all') return null;
  const now = new Date();
  if (filter === 'week') {
    // Adventist week: Sunday (0) to Saturday (6)
    const day = now.getDay(); // 0 = Sun
    const start = new Date(now);
    start.setDate(now.getDate() - day);
    start.setHours(0, 0, 0, 0);
    return start;
  }
  // "This Month" — first day of the current calendar month
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

// ─── Expandable prayer text (overflow-aware) ────────────────────────────────

function PrayerCardText({ text, language }: { text: string; language: 'en' | 'th' }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const el = textRef.current;
    if (el && !isExpanded) {
      setIsClamped(el.scrollHeight > el.clientHeight + 1);
    }
  }, [text, isExpanded]);

  return (
    <>
      <p
        ref={textRef}
        className={`mb-1 text-sm leading-relaxed text-foreground/80 ${!isExpanded ? 'line-clamp-3' : ''}`}
      >
        {text}
      </p>
      {(isClamped || isExpanded) && (
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="mb-2 cursor-pointer text-xs font-medium text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
        >
          {isExpanded
            ? language === 'th'
              ? 'แสดงน้อยลง'
              : 'Show less'
            : language === 'th'
              ? 'อ่านเพิ่มเติม'
              : 'Read more'}
        </button>
      )}
    </>
  );
}

export function PrayerPage() {
  const { language } = useI18n();
  useDocumentTitle('Prayer Requests', 'คำขออธิษฐาน', language);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    request: '',
    isPublic: false,
    wantsPastorContact: false,
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [lastSubmittedId, setLastSubmittedId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editRequest, setEditRequest] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [prayedFor, setPrayedFor] = useState<string[]>([]);
  const revealRef = useScrollReveal<HTMLDivElement>();
  const [publicPrayers, setPublicPrayers] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'most_prayed'>('recent');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('week');
  const [visibleCount, setVisibleCount] = useState(6);
  const [justPrayed, setJustPrayed] = useState<string | null>(null);

  const PAGE_SIZE = 6;

  const sortedPrayers = useMemo(() => {
    const copy = [...publicPrayers];
    if (sortBy === 'most_prayed') {
      copy.sort((a, b) => b.prayerCount - a.prayerCount);
    } else {
      copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return copy;
  }, [publicPrayers, sortBy]);

  const timeFilteredPrayers = useMemo(() => {
    const start = getTimeFilterStart(timeFilter);
    if (!start) return sortedPrayers;
    return sortedPrayers.filter((p) => new Date(p.createdAt) >= start);
  }, [sortedPrayers, timeFilter]);

  const visiblePrayers = useMemo(
    () => timeFilteredPrayers.slice(0, visibleCount),
    [timeFilteredPrayers, visibleCount]
  );

  // Reset visible count when sort or time filter changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [sortBy, timeFilter]);

  // Load persisted anonymous prayed-for IDs from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('prayer_prayed:anon');
      if (stored) setPrayedFor(JSON.parse(stored) as string[]);
    } catch {
      // ignore malformed storage
    }
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await prayerService.submitPrayerRequest({
        name: formData.name || 'Anonymous',
        email: formData.email || undefined,
        request: formData.request,
        category: formData.category || undefined,
        categoryThai: categories.find((c) => c.id === formData.category)?.nameThai || undefined,
        isAnonymous: !formData.name,
      });
      setIsSubmitted(true);
      setLastSubmittedId(result.id);
      setEditRequest(formData.request);
      setEditCategory(formData.category);
      // Refresh prayer wall
      const prayers = await prayerService.getPrayerRequests();
      setPublicPrayers(prayers);
    } catch {
      gooeyToast.error('Failed to submit prayer request');
    } finally {
      setSubmitting(false);
    }
  };

  const saveAnonPrayed = (list: string[]) => {
    try {
      localStorage.setItem('prayer_prayed:anon', JSON.stringify(list));
    } catch {
      /* quota */
    }
  };

  const handlePrayFor = async (id: string) => {
    if (prayedFor.includes(id)) {
      // Toggle off: unpray
      const next = prayedFor.filter((pId) => pId !== id);
      setPrayedFor(next);
      saveAnonPrayed(next);
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
        const reverted = [...next, id];
        setPrayedFor(reverted);
        saveAnonPrayed(reverted);
        setPublicPrayers((prev) =>
          prev.map((p) => (p.id === id ? { ...p, prayerCount: p.prayerCount + 1 } : p))
        );
      }
    } else {
      // Toggle on: pray
      const next = [...prayedFor, id];
      setPrayedFor(next);
      saveAnonPrayed(next);
      // Trigger heart-pulse animation
      setJustPrayed(id);
      setTimeout(() => setJustPrayed(null), 500);
      // Optimistically increment local count
      setPublicPrayers((prev) =>
        prev.map((p) => (p.id === id ? { ...p, prayerCount: p.prayerCount + 1 } : p))
      );
      try {
        const updated = await prayerService.prayForRequest(id);
        if (updated) {
          setPublicPrayers((prev) => prev.map((p) => (p.id === id ? updated : p)));
        }
      } catch {
        // revert optimistic update
        const reverted = next.filter((pId) => pId !== id);
        setPrayedFor(reverted);
        saveAnonPrayed(reverted);
        setPublicPrayers((prev) =>
          prev.map((p) => (p.id === id ? { ...p, prayerCount: p.prayerCount - 1 } : p))
        );
      }
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PublicLayout>
    );
  }

  // ─── Submit Form (shared between mobile tab and desktop column) ─────────────
  const submitForm = (
    <>
      <Card>
        <CardContent className="p-6">
          {!isSubmitted ? (
            <>
              <h2 className="mb-6 text-balance text-xl font-bold text-foreground">
                {language === 'th' ? 'ส่งคำอธิษฐาน' : 'Submit a Prayer Request'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="prayer-name"
                    className="mb-1 block text-sm font-medium text-foreground/80"
                  >
                    {language === 'th' ? 'ชื่อของคุณ (ไม่จำเป็น)' : 'Your Name (optional)'}
                  </label>
                  <input
                    type="text"
                    id="prayer-name"
                    name="name"
                    autoComplete="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={language === 'th' ? 'ไม่ระบุตัวตน' : 'Anonymous'}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus-visible:border-purple-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-200 dark:focus-visible:ring-purple-800"
                  />
                </div>
                <div>
                  <label
                    htmlFor="prayer-email"
                    className="mb-1 block text-sm font-medium text-foreground/80"
                  >
                    {language === 'th' ? 'อีเมล (ไม่จำเป็น)' : 'Email (optional)'}
                  </label>
                  <input
                    type="email"
                    id="prayer-email"
                    name="email"
                    autoComplete="email"
                    spellCheck={false}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus-visible:border-purple-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-200 dark:focus-visible:ring-purple-800"
                  />
                </div>
                <div>
                  <label
                    htmlFor="prayer-category"
                    className="mb-1 block text-sm font-medium text-foreground/80"
                  >
                    {language === 'th' ? 'หมวดหมู่' : 'Category'} *
                  </label>
                  <select
                    id="prayer-category"
                    name="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus-visible:border-purple-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-200 dark:focus-visible:ring-purple-800"
                  >
                    <option value="">
                      {language === 'th' ? 'เลือกหมวดหมู่' : 'Select a category'}
                    </option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {language === 'th' ? cat.nameThai : cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="prayer-request"
                    className="mb-1 block text-sm font-medium text-foreground/80"
                  >
                    {language === 'th' ? 'คำอธิษฐานของคุณ' : 'Your Prayer Request'} *
                  </label>
                  <textarea
                    id="prayer-request"
                    name="prayer-request"
                    value={formData.request}
                    onChange={(e) => setFormData({ ...formData, request: e.target.value })}
                    required
                    rows={5}
                    placeholder={
                      language === 'th'
                        ? 'แบ่งปันคำอธิษฐานของคุณ...'
                        : 'Share your prayer request...'
                    }
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus-visible:border-purple-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-200 dark:focus-visible:ring-purple-800"
                  />
                </div>

                <div className="space-y-3 rounded-lg bg-muted p-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                      className="mt-1 h-4 w-4 rounded border-border text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="isPublic" className="text-sm text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium">
                        {formData.isPublic ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                        {language === 'th'
                          ? 'แชร์บนกำแพงอธิษฐาน (ไม่ระบุตัวตน)'
                          : 'Share on Prayer Wall (anonymous)'}
                      </span>
                      <span className="text-muted-foreground">
                        {language === 'th'
                          ? 'ให้ผู้อื่นอธิษฐานเผื่อคุณ'
                          : 'Allow others to pray for you'}
                      </span>
                    </label>
                  </div>
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="pastorContact"
                      checked={formData.wantsPastorContact}
                      onChange={(e) =>
                        setFormData({ ...formData, wantsPastorContact: e.target.checked })
                      }
                      className="mt-1 h-4 w-4 rounded border-border text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="pastorContact" className="text-sm text-muted-foreground">
                      <span className="font-medium">
                        {language === 'th'
                          ? 'ต้องการให้ศิษยาภิบาลติดต่อ'
                          : 'Request pastor contact'}
                      </span>
                      <span className="block text-muted-foreground">
                        {language === 'th'
                          ? 'ศิษยาภิบาลจะติดต่อคุณเป็นการส่วนตัว'
                          : 'The pastor will reach out to you personally'}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  {language === 'th'
                    ? 'คำอธิษฐานของคุณจะถูกเก็บเป็นความลับ'
                    : 'Your prayer request is kept confidential'}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  {language === 'th' ? 'ส่งคำอธิษฐาน' : 'Submit Prayer Request'}
                </Button>
              </form>
            </>
          ) : isEditing && lastSubmittedId ? (
            <div className="py-6" role="form" aria-label="Edit prayer request">
              <h3 className="mb-4 text-lg font-bold text-foreground">
                {language === 'th' ? 'แก้ไขคำอธิษฐาน' : 'Edit Your Prayer Request'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="edit-category"
                    className="mb-1 block text-sm font-medium text-foreground/80"
                  >
                    {language === 'th' ? 'หมวดหมู่' : 'Category'}
                  </label>
                  <select
                    id="edit-category"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus-visible:border-purple-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-200 dark:focus-visible:ring-purple-800"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {language === 'th' ? cat.nameThai : cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="edit-request"
                    className="mb-1 block text-sm font-medium text-foreground/80"
                  >
                    {language === 'th' ? 'คำอธิษฐาน' : 'Prayer Request'}
                  </label>
                  <textarea
                    id="edit-request"
                    value={editRequest}
                    onChange={(e) => setEditRequest(e.target.value)}
                    rows={5}
                    maxLength={500}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus-visible:border-purple-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-200 dark:focus-visible:ring-purple-800"
                  />
                  <p className="mt-1 text-right text-xs text-muted-foreground">
                    {editRequest.length}/500
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    disabled={submitting || editRequest.trim().length < 10}
                    onClick={async () => {
                      setSubmitting(true);
                      try {
                        await prayerService.updatePrayerRequest(lastSubmittedId, {
                          request: editRequest,
                          category: editCategory || undefined,
                          categoryThai:
                            categories.find((c) => c.id === editCategory)?.nameThai || undefined,
                          email: formData.email || undefined,
                        });
                        gooeyToast.success(
                          language === 'th'
                            ? 'แก้ไขคำอธิษฐานเรียบร้อยแล้ว'
                            : 'Prayer request updated successfully'
                        );
                        setIsEditing(false);
                        const prayers = await prayerService.getPrayerRequests();
                        setPublicPrayers(prayers);
                      } catch {
                        gooeyToast.error(
                          language === 'th'
                            ? 'ไม่สามารถแก้ไขคำอธิษฐานได้'
                            : 'Failed to update prayer request'
                        );
                      } finally {
                        setSubmitting(false);
                      }
                    }}
                  >
                    {submitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    {language === 'th' ? 'บันทึกการแก้ไข' : 'Save Changes'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    {language === 'th' ? 'ยกเลิก' : 'Cancel'}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center" role="status" aria-live="polite">
              <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
              <h3 className="mb-2 text-xl font-bold text-foreground">
                {language === 'th' ? 'ส่งคำอธิษฐานสำเร็จ!' : 'Prayer Request Submitted!'}
              </h3>
              <p className="mb-6 text-muted-foreground">
                {language === 'th'
                  ? 'ทีมอธิษฐานของเราจะอธิษฐานเผื่อคุณ พระเจ้าทรงได้ยินคำอธิษฐานของคุณ'
                  : 'Our prayer team will be praying for you. God hears your prayers.'}
              </p>
              <div className="flex flex-col items-center gap-3">
                {lastSubmittedId && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="w-full max-w-xs gap-2 border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400"
                  >
                    <Pencil className="h-4 w-4" />
                    {language === 'th' ? 'แก้ไขคำอธิษฐาน' : 'Edit Prayer Request'}
                  </Button>
                )}
                <Button
                  onClick={() => {
                    setIsSubmitted(false);
                    setLastSubmittedId(null);
                    setIsEditing(false);
                  }}
                  variant="outline"
                  className="w-full max-w-xs"
                >
                  {language === 'th' ? 'ส่งคำอธิษฐานอื่น' : 'Submit Another Request'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prayer Promise */}
      <Card className="mt-6 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 dark:border-purple-800 dark:from-purple-950/50 dark:to-pink-950/50">
        <CardContent className="p-6 text-center">
          <h3 className="mb-3 font-bold text-purple-900 dark:text-purple-200">
            {language === 'th' ? 'พันธสัญญาการอธิษฐาน' : 'Our Prayer Promise'}
          </h3>
          <p className="text-sm text-purple-700 dark:text-purple-300">
            {language === 'th'
              ? 'ศิษยาภิบาลและทีมอธิษฐานของเราอธิษฐานเผื่อทุกคำอธิษฐานที่ได้รับ เราเชื่อในพลังแห่งการอธิษฐานและยืนเคียงข้างคุณในความเชื่อ'
              : 'Our pastor and prayer team pray over every request received. We believe in the power of prayer and stand with you in faith.'}
          </p>
        </CardContent>
      </Card>
    </>
  );

  // ─── Prayer Wall (shared between mobile tab and desktop column) ─────────────
  const prayerWall = (
    <div className="space-y-4">
      {/* Header with stats */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-balance text-xl font-bold text-foreground">
          <Users className="h-5 w-5 text-purple-600" />
          {language === 'th' ? 'กำแพงอธิษฐาน' : 'Prayer Wall'}
        </h2>
        {publicPrayers.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
              <Users className="h-3 w-3" />
              {timeFilteredPrayers.length} {language === 'th' ? 'คำอธิษฐาน' : 'requests'}
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-medium text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
              <Heart className="h-3 w-3 fill-current" />
              {timeFilteredPrayers.reduce((sum, p) => sum + p.prayerCount, 0)}{' '}
              {language === 'th' ? 'อธิษฐานแล้ว' : 'prayers'}
            </span>
          </div>
        )}
      </div>

      {/* Toolbar: sort + time filter */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
        <div className="flex items-center gap-2" role="group" aria-label="Filter by time period">
          <Clock className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" aria-hidden="true" />
          {TIME_FILTERS.map((tf) => (
            <button
              key={tf.id}
              type="button"
              onClick={() => setTimeFilter(tf.id)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                timeFilter === tf.id
                  ? 'bg-purple-600 text-white shadow-sm dark:bg-purple-700'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
              aria-pressed={timeFilter === tf.id}
            >
              {language === 'th' ? tf.labelTh : tf.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <ArrowUpDown className="h-3 w-3" />
          <button
            onClick={() => setSortBy('recent')}
            className={`rounded-md px-2 py-1 transition-colors ${
              sortBy === 'recent'
                ? 'bg-background font-medium text-foreground shadow-sm'
                : 'hover:text-foreground'
            }`}
          >
            {language === 'th' ? 'ล่าสุด' : 'Recent'}
          </button>
          <button
            onClick={() => setSortBy('most_prayed')}
            className={`rounded-md px-2 py-1 transition-colors ${
              sortBy === 'most_prayed'
                ? 'bg-background font-medium text-foreground shadow-sm'
                : 'hover:text-foreground'
            }`}
          >
            {language === 'th' ? 'อธิษฐานมากที่สุด' : 'Most Prayed'}
          </button>
        </div>
      </div>

      {/* Prayer cards */}
      {timeFilteredPrayers.length === 0 && publicPrayers.length > 0 ? (
        <div className="py-10 text-center">
          <Heart className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm font-medium text-foreground">
            {language === 'th'
              ? 'ไม่มีคำอธิษฐานในช่วงเวลานี้'
              : 'No prayer requests in this time period'}
          </p>
          {timeFilter !== 'all' && (
            <button
              type="button"
              className="mt-2 text-xs text-purple-600 hover:underline dark:text-purple-400"
              onClick={() => setTimeFilter(timeFilter === 'week' ? 'month' : 'all')}
            >
              {language === 'th'
                ? `ลอง${timeFilter === 'week' ? 'เดือนนี้' : 'ทั้งหมด'}แทน`
                : `Try ${timeFilter === 'week' ? 'This Month' : 'All Time'} instead`}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {visiblePrayers.map((prayer, index) => {
            const catStyle = getCategoryCardStyle(prayer.category);
            return (
              <article
                key={prayer.id}
                aria-label={`${getCategoryDisplay(prayer.category, 'en')} prayer by ${prayer.name}`}
                className={`card-hover-lift flex animate-fade-in-up flex-col rounded-xl border border-l-4 ${catStyle.border} border-border/50 ${catStyle.bg} p-5`}
                style={{ animationDelay: `${Math.min(index, 5) * 80}ms` }}
              >
                <div className="mb-2.5 flex items-center justify-between">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${catStyle.badge}`}
                  >
                    {language === 'th'
                      ? (prayer.categoryThai ?? getCategoryDisplay(prayer.category, 'th'))
                      : getCategoryDisplay(prayer.category, 'en')}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(prayer.createdAt).toLocaleDateString(
                      language === 'th' ? 'th-TH' : 'en-US',
                      { month: 'short', day: 'numeric' }
                    )}
                  </span>
                </div>
                <PrayerCardText text={prayer.request} language={language} />
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">— {prayer.name}</span>
                  <Button
                    size="sm"
                    variant={prayedFor.includes(prayer.id) ? 'default' : 'outline'}
                    className={`inline-flex min-h-[44px] touch-manipulation items-center gap-1.5 transition-all duration-200 active:scale-95 ${
                      prayedFor.includes(prayer.id)
                        ? 'bg-purple-600 shadow-md shadow-purple-500/25 hover:bg-purple-500 hover:shadow-lg hover:shadow-purple-500/30'
                        : 'border-purple-200 text-purple-600 hover:border-purple-300 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-950/30'
                    }`}
                    onClick={() => handlePrayFor(prayer.id)}
                  >
                    <Heart
                      className={`h-3.5 w-3.5 transition-transform duration-200 ${prayedFor.includes(prayer.id) ? 'scale-110 fill-white' : ''} ${justPrayed === prayer.id ? 'animate-heart-pulse' : ''}`}
                    />
                    {prayedFor.includes(prayer.id)
                      ? language === 'th'
                        ? 'อธิษฐานแล้ว'
                        : 'Prayed'
                      : language === 'th'
                        ? 'อธิษฐาน'
                        : 'Pray'}
                    <span className="text-[11px] opacity-75">({prayer.prayerCount})</span>
                  </Button>
                </div>
              </article>
            );
          })}

          {/* Load More */}
          {visibleCount < timeFilteredPrayers.length && (
            <div className="pt-2 text-center">
              <p className="mb-2 text-xs text-muted-foreground">
                {language === 'th'
                  ? `แสดง ${visiblePrayers.length} จาก ${timeFilteredPrayers.length} คำอธิษฐาน`
                  : `Showing ${visiblePrayers.length} of ${timeFilteredPrayers.length} prayers`}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                className="gap-1.5 border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-950/30"
              >
                <ChevronDown className="h-3.5 w-3.5" />
                {language === 'th' ? 'โหลดเพิ่มเติม' : 'Load More'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 pb-14 pt-24">
        {/* Decorative background elements */}
        <div className="absolute inset-0 motion-safe:animate-shimmer" />
        <div className="dot-pattern absolute inset-0 text-white opacity-[0.04]" />
        <div className="absolute -right-10 top-0 h-48 w-48 rounded-full bg-white/[0.05] motion-safe:animate-float" />
        <div className="absolute -left-6 bottom-0 h-32 w-32 rounded-full bg-white/[0.03] [animation-delay:1.5s] motion-safe:animate-float" />
        <div className="absolute left-1/3 top-1/4 h-20 w-20 rounded-full bg-pink-400/[0.06] [animation-delay:0.7s] motion-safe:animate-float" />

        <div className="relative z-10 mx-auto max-w-6xl px-4 text-center text-white sm:px-6">
          <div className="mx-auto mb-5 flex h-16 w-16 animate-fade-in-up items-center justify-center rounded-2xl bg-white/10 shadow-lg shadow-purple-900/20 backdrop-blur-sm">
            <Heart className="h-8 w-8 text-pink-300" />
          </div>
          <h1 className="mb-4 text-balance text-4xl font-bold sm:text-5xl">
            {language === 'th' ? 'คำอธิษฐาน' : 'Prayer Requests'}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-purple-100">
            {language === 'th'
              ? 'แบ่งปันคำอธิษฐานของคุณและอธิษฐานเผื่อผู้อื่น'
              : 'Share your prayer needs and pray for others'}
          </p>
          <p className="mt-4 animate-fade-in-up text-sm italic text-purple-200/90 [animation-delay:0.3s]">
            &quot;
            {language === 'th'
              ? 'พระเจ้าทรงอยู่ใกล้คนที่ใจแตกสลาย และทรงช่วยคนที่จิตใจสำนึกผิด'
              : 'The Lord is close to the brokenhearted and saves those who are crushed in spirit.'}
            &quot; - {language === 'th' ? 'สดุดี 34:18' : 'Psalm 34:18'}
          </p>
        </div>
      </section>

      <div ref={revealRef} className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <Tabs defaultValue="wall">
          <TabsList className="mb-6 grid w-full grid-cols-2">
            <TabsTrigger value="wall" className="gap-1.5">
              <Users className="h-4 w-4" />
              {language === 'th' ? 'กำแพงอธิษฐาน' : 'Prayer Wall'}
            </TabsTrigger>
            <TabsTrigger value="submit" className="gap-1.5">
              <Send className="h-4 w-4" />
              {language === 'th' ? 'ส่งคำอธิษฐาน' : 'Submit Request'}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="wall">{prayerWall}</TabsContent>
          <TabsContent value="submit">{submitForm}</TabsContent>
        </Tabs>

        {/* Contact CTA */}
        <div className="relative mt-12 animate-fade-in-up overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 p-8 text-center text-white shadow-xl sm:p-10">
          <div className="absolute inset-0 motion-safe:animate-shimmer" />
          <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/[0.06] motion-safe:animate-float" />
          <div className="absolute -bottom-4 left-1/4 h-20 w-20 rounded-full bg-white/[0.04] [animation-delay:1s] motion-safe:animate-float" />
          <div className="relative z-10">
            <MessageCircle className="mx-auto mb-4 h-10 w-10" />
            <h2 className="mb-2 text-balance text-2xl font-bold">
              {language === 'th' ? 'ต้องการพูดคุยกับใครสักคน?' : 'Need to Talk to Someone?'}
            </h2>
            <p className="mb-6 text-purple-100">
              {language === 'th'
                ? 'ศิษยาภิบาลของเราพร้อมรับฟังและอธิษฐานร่วมกับคุณ'
                : 'Our pastor is available to listen and pray with you'}
            </p>
            <Link to="/#contact">
              <Button
                size="lg"
                className="bg-white text-purple-600 shadow-lg shadow-purple-900/20 transition-all duration-200 hover:bg-purple-50 hover:shadow-xl active:scale-95"
              >
                {language === 'th' ? 'ติดต่อศิษยาภิบาล' : 'Contact the Pastor'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

export default PrayerPage;
