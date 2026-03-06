/**
 * Member Prayer Page
 *
 * Prayer request form + prayer wall for authenticated members.
 * Uses SidebarLayout instead of PublicLayout.
 */

import { useState, useEffect } from 'react';
import {
  Heart,
  Send,
  Lock,
  Users,
  CheckCircle,
  Eye,
  EyeOff,
  Calendar,
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SidebarLayout } from '@/components/layout';
import { useAuth } from '@/hooks/useAuth';
import { prayerService, type PrayerRequest } from '@/services/endpoints/prayerService';
import { gooeyToast } from 'goey-toast';

const categories = [
  { id: 'health', name: 'Health' },
  { id: 'family', name: 'Family' },
  { id: 'guidance', name: 'Guidance' },
  { id: 'financial', name: 'Financial' },
  { id: 'spiritual', name: 'Spiritual Growth' },
  { id: 'relationships', name: 'Relationships' },
  { id: 'thanksgiving', name: 'Thanksgiving' },
  { id: 'other', name: 'Other' },
];

function getCategoryDisplay(category: string): string {
  const match = categories.find(
    (c) => c.id === category.toLowerCase() || c.name.toLowerCase() === category.toLowerCase()
  );
  if (match) return match.name;
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export function MemberPrayerPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    category: '',
    request: '',
    isPublic: false,
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [prayedFor, setPrayedFor] = useState<Set<string>>(new Set());
  const [publicPrayers, setPublicPrayers] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
      await prayerService.submitPrayerRequest({
        name: user ? `${user.firstName} ${user.lastName}` : 'Anonymous',
        email: user?.email,
        request: formData.request,
        category: formData.category || undefined,
        isAnonymous: false,
      });
      setIsSubmitted(true);
      const prayers = await prayerService.getPrayerRequests();
      setPublicPrayers(prayers);
    } catch {
      gooeyToast.error('Failed to submit prayer request');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrayFor = async (id: string) => {
    if (prayedFor.has(id)) return;
    setPrayedFor((prev) => new Set(prev).add(id));
    setPublicPrayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, prayerCount: p.prayerCount + 1 } : p))
    );
    try {
      const updated = await prayerService.prayForRequest(id);
      if (updated) {
        setPublicPrayers((prev) => prev.map((p) => (p.id === id ? updated : p)));
      }
    } catch {
      setPrayedFor((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setPublicPrayers((prev) =>
        prev.map((p) => (p.id === id ? { ...p, prayerCount: p.prayerCount - 1 } : p))
      );
    }
  };

  if (loading) {
    return (
      <SidebarLayout breadcrumbs={[{ label: 'Prayer Requests' }]}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout breadcrumbs={[{ label: 'Prayer Requests' }]}>
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Prayer Requests</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Share your prayer needs and pray for others
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Prayer Request Form */}
          <div>
            <Card>
              <CardContent className="p-6">
                {!isSubmitted ? (
                  <>
                    <h2 className="mb-6 text-xl font-bold text-foreground">
                      Submit a Prayer Request
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label
                          htmlFor="prayer-category"
                          className="mb-1 block text-sm font-medium text-foreground/80"
                        >
                          Category *
                        </label>
                        <select
                          id="prayer-category"
                          name="category"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          required
                          className="w-full rounded-lg border border-border px-4 py-2 focus-visible:border-purple-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-200 dark:focus-visible:ring-purple-800"
                        >
                          <option value="">Select a category</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor="prayer-request"
                          className="mb-1 block text-sm font-medium text-foreground/80"
                        >
                          Your Prayer Request *
                        </label>
                        <textarea
                          id="prayer-request"
                          name="prayer-request"
                          value={formData.request}
                          onChange={(e) => setFormData({ ...formData, request: e.target.value })}
                          required
                          rows={5}
                          placeholder="Share your prayer request..."
                          className="w-full rounded-lg border border-border px-4 py-2 focus-visible:border-purple-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-200 dark:focus-visible:ring-purple-800"
                        />
                      </div>

                      <div className="rounded-lg bg-muted p-4">
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
                              Share on Prayer Wall
                            </span>
                            <span className="text-muted-foreground">
                              Allow others to pray for you
                            </span>
                          </label>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Lock className="h-4 w-4" />
                        Your prayer request is kept confidential
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
                        Submit Prayer Request
                      </Button>
                    </form>
                  </>
                ) : (
                  <div className="py-12 text-center" role="status" aria-live="polite">
                    <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
                    <h3 className="mb-2 text-xl font-bold text-foreground">
                      Prayer Request Submitted!
                    </h3>
                    <p className="mb-6 text-muted-foreground">
                      Our prayer team will be praying for you. God hears your prayers.
                    </p>
                    <Button onClick={() => setIsSubmitted(false)} variant="outline">
                      Submit Another Request
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Prayer Wall */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
              <Users className="h-5 w-5 text-purple-600" />
              Prayer Wall
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Pray for our community members. Click &quot;I Prayed&quot; to show your support.
            </p>
            <div className="space-y-4">
              {publicPrayers.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Heart className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">
                      No public prayer requests yet. Be the first to share!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                publicPrayers.map((prayer) => (
                  <Card key={prayer.id} className="transition-shadow hover:shadow-md">
                    <CardContent className="p-5">
                      <div className="mb-2 flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {getCategoryDisplay(prayer.category)}
                        </Badge>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(prayer.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="mb-3 text-foreground/80">{prayer.request}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          — {prayer.isAnonymous ? 'Anonymous' : prayer.name}
                        </span>
                        <Button
                          size="sm"
                          variant={prayedFor.has(prayer.id) ? 'default' : 'outline'}
                          className={
                            prayedFor.has(prayer.id)
                              ? 'bg-purple-600'
                              : 'border-purple-300 text-purple-600 dark:border-purple-700 dark:text-purple-400'
                          }
                          onClick={() => handlePrayFor(prayer.id)}
                          disabled={prayedFor.has(prayer.id)}
                        >
                          <Heart
                            className={`mr-1 h-4 w-4 ${prayedFor.has(prayer.id) ? 'fill-white' : ''}`}
                          />
                          {prayedFor.has(prayer.id) ? 'Prayed' : 'I Prayed'}
                          <span className="ml-1">({prayer.prayerCount})</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}

export default MemberPrayerPage;
