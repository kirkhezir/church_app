/**
 * Prayer Request Page
 *
 * Private prayer request form with prayer wall and prayer updates
 */

import { useState, useEffect, useMemo } from 'react';
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
  Loader2,
  ChevronDown,
  ArrowUpDown,
  Pencil,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  const [expandedPrayers, setExpandedPrayers] = useState<Set<string>>(new Set());
  const revealRef = useScrollReveal<HTMLDivElement>();
  const [publicPrayers, setPublicPrayers] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'most_prayed'>('recent');
  const [visibleCount, setVisibleCount] = useState(6);

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

  const visiblePrayers = useMemo(
    () => sortedPrayers.slice(0, visibleCount),
    [sortedPrayers, visibleCount]
  );

  // Reset visible count when sort changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [sortBy]);

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

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 pb-12 pt-24">
        <div className="mx-auto max-w-6xl px-4 text-center text-white sm:px-6">
          <Heart className="mx-auto mb-4 h-12 w-12 text-pink-300" />
          <h1 className="mb-4 text-balance text-4xl font-bold sm:text-5xl">
            {language === 'th' ? 'คำอธิษฐาน' : 'Prayer Requests'}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-purple-100">
            {language === 'th'
              ? 'แบ่งปันคำอธิษฐานของคุณและอธิษฐานเผื่อผู้อื่น'
              : 'Share your prayer needs and pray for others'}
          </p>
          <p className="mt-4 text-sm italic text-purple-200">
            &quot;
            {language === 'th'
              ? 'พระเจ้าทรงอยู่ใกล้คนที่ใจแตกสลาย และทรงช่วยคนที่จิตใจสำนึกผิด'
              : 'The Lord is close to the brokenhearted and saves those who are crushed in spirit.'}
            &quot; - {language === 'th' ? 'สดุดี 34:18' : 'Psalm 34:18'}
          </p>
        </div>
      </section>

      <div ref={revealRef} className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Prayer Request Form */}
          <div>
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
                            onChange={(e) =>
                              setFormData({ ...formData, isPublic: e.target.checked })
                            }
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
                                  categories.find((c) => c.id === editCategory)?.nameThai ||
                                  undefined,
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
          </div>

          {/* Prayer Wall */}
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-balance text-xl font-bold text-foreground">
                <Users className="h-5 w-5 text-purple-600" />
                {language === 'th' ? 'กำแพงอธิษฐาน' : 'Prayer Wall'}
              </h2>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <ArrowUpDown className="h-3.5 w-3.5" />
                <button
                  onClick={() => setSortBy('recent')}
                  className={`rounded px-2 py-0.5 text-xs transition-colors ${
                    sortBy === 'recent'
                      ? 'bg-purple-100 font-medium text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                      : 'hover:text-foreground'
                  }`}
                >
                  {language === 'th' ? 'ล่าสุด' : 'Recent'}
                </button>
                <span className="text-border">|</span>
                <button
                  onClick={() => setSortBy('most_prayed')}
                  className={`rounded px-2 py-0.5 text-xs transition-colors ${
                    sortBy === 'most_prayed'
                      ? 'bg-purple-100 font-medium text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                      : 'hover:text-foreground'
                  }`}
                >
                  {language === 'th' ? 'อธิษฐานมากที่สุด' : 'Most Prayed'}
                </button>
              </div>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              {language === 'th'
                ? 'อธิษฐานเผื่อพี่น้องในชุมชนของเรา คลิก "ฉันอธิษฐานแล้ว" เพื่อแสดงการสนับสนุน'
                : 'Pray for our community members. Click "I Prayed" to show your support.'}
            </p>
            <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1 lg:max-h-[80vh]">
              {visiblePrayers.map((prayer) => (
                <Card key={prayer.id} className="transition-shadow hover:shadow-md">
                  <CardContent className="p-5">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                        {language === 'th'
                          ? (prayer.categoryThai ?? getCategoryDisplay(prayer.category, 'th'))
                          : getCategoryDisplay(prayer.category, 'en')}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(prayer.createdAt).toLocaleDateString(
                          language === 'th' ? 'th-TH' : 'en-US',
                          { month: 'short', day: 'numeric' }
                        )}
                      </span>
                    </div>
                    <p
                      className={`mb-1 text-foreground/80 ${!expandedPrayers.has(prayer.id) ? 'line-clamp-3' : ''}`}
                    >
                      {prayer.request}
                    </p>
                    {prayer.request.length > 120 && (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedPrayers((prev) => {
                            const next = new Set(prev);
                            if (next.has(prayer.id)) next.delete(prayer.id);
                            else next.add(prayer.id);
                            return next;
                          })
                        }
                        className="mb-2 cursor-pointer text-xs font-medium text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                      >
                        {expandedPrayers.has(prayer.id)
                          ? language === 'th'
                            ? 'แสดงน้อยลง'
                            : 'Show less'
                          : language === 'th'
                            ? 'อ่านเพิ่มเติม'
                            : 'Read more'}
                      </button>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">— {prayer.name}</span>
                      <Button
                        size="sm"
                        variant={prayedFor.includes(prayer.id) ? 'default' : 'outline'}
                        className={
                          prayedFor.includes(prayer.id)
                            ? 'bg-purple-600 hover:bg-purple-500'
                            : 'border-purple-300 text-purple-600 dark:border-purple-700 dark:text-purple-400'
                        }
                        onClick={() => handlePrayFor(prayer.id)}
                      >
                        <Heart
                          className={`mr-1 h-4 w-4 ${prayedFor.includes(prayer.id) ? 'fill-white' : ''}`}
                        />
                        {prayedFor.includes(prayer.id)
                          ? language === 'th'
                            ? 'อธิษฐานแล้ว ✓'
                            : 'Prayed ✓'
                          : language === 'th'
                            ? 'อธิษฐาน'
                            : 'Pray'}
                        <span className="ml-1">({prayer.prayerCount})</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Load More */}
              {visibleCount < sortedPrayers.length && (
                <div className="pt-2 text-center">
                  <p className="mb-2 text-xs text-muted-foreground">
                    {language === 'th'
                      ? `แสดง ${visiblePrayers.length} จาก ${sortedPrayers.length} คำอธิษฐาน`
                      : `Showing ${visiblePrayers.length} of ${sortedPrayers.length} prayers`}
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
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-center text-white">
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
            <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50">
              {language === 'th' ? 'ติดต่อศิษยาภิบาล' : 'Contact the Pastor'}
            </Button>
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}

export default PrayerPage;
