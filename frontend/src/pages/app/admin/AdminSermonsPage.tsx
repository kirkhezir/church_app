/**
 * AdminSermonsPage
 *
 * Admin page for managing sermons (CRUD)
 * - List all sermons with search/filter
 * - Create, edit, delete sermons
 * - Track views
 */

import { useState, useEffect, useMemo } from 'react';
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  Search,
  Loader2,
  Youtube,
  Eye,
  Music,
  BookOpen,
  Calendar,
  Clock,
  Link2,
  FileText,
  Mic,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SidebarLayout } from '@/components/layout';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { sermonService, type Sermon } from '@/services/endpoints/sermonService';
import { ConfirmDialog } from '@/components/features/shared/ConfirmDialog';
import { gooeyToast } from 'goey-toast';

export function AdminSermonsPage() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSermon, setEditingSermon] = useState<Sermon | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    titleThai: '',
    speaker: '',
    speakerThai: '',
    series: '',
    seriesThai: '',
    scripture: '',
    date: '',
    youtubeUrl: '',
    audioUrl: '',
    thumbnailUrl: '',
    duration: '',
    description: '',
    descriptionThai: '',
  });

  const fetchSermons = async () => {
    try {
      setLoading(true);
      const data = await sermonService.getSermons();
      setSermons(data);
    } catch {
      setError('Failed to load sermons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSermons();
  }, []);

  const filteredSermons = useMemo(
    () =>
      sermons.filter(
        (s) =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.speaker.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (s.series ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [sermons, searchQuery]
  );

  const resetForm = () => {
    setFormData({
      title: '',
      titleThai: '',
      speaker: '',
      speakerThai: '',
      series: '',
      seriesThai: '',
      scripture: '',
      date: '',
      youtubeUrl: '',
      audioUrl: '',
      thumbnailUrl: '',
      duration: '',
      description: '',
      descriptionThai: '',
    });
    setEditingSermon(null);
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (sermon: Sermon) => {
    setEditingSermon(sermon);
    setFormData({
      title: sermon.title,
      titleThai: sermon.titleThai ?? '',
      speaker: sermon.speaker,
      speakerThai: sermon.speakerThai ?? '',
      series: sermon.series ?? '',
      seriesThai: sermon.seriesThai ?? '',
      scripture: sermon.scripture ?? '',
      date: sermon.date ? sermon.date.split('T')[0] : '',
      youtubeUrl: sermon.youtubeUrl ?? '',
      audioUrl: sermon.audioUrl ?? '',
      thumbnailUrl: sermon.thumbnailUrl ?? '',
      duration: sermon.duration ?? '',
      description: sermon.description ?? '',
      descriptionThai: sermon.descriptionThai ?? '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: formData.title,
        titleThai: formData.titleThai || undefined,
        speaker: formData.speaker,
        speakerThai: formData.speakerThai || undefined,
        series: formData.series || undefined,
        seriesThai: formData.seriesThai || undefined,
        scripture: formData.scripture || undefined,
        date: formData.date,
        youtubeUrl: formData.youtubeUrl || undefined,
        audioUrl: formData.audioUrl || undefined,
        thumbnailUrl: formData.thumbnailUrl || undefined,
        duration: formData.duration || undefined,
        description: formData.description || undefined,
        descriptionThai: formData.descriptionThai || undefined,
      };

      if (editingSermon) {
        await sermonService.updateSermon(editingSermon.id, payload);
        gooeyToast.success('Sermon updated successfully');
      } else {
        await sermonService.createSermon(payload);
        gooeyToast.success('Sermon created successfully');
      }
      setShowForm(false);
      resetForm();
      await fetchSermons();
    } catch {
      setError('Failed to save sermon');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeleting(true);
      await sermonService.deleteSermon(id);
      gooeyToast.success('Sermon deleted');
      await fetchSermons();
    } catch {
      setError('Failed to delete sermon');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <SidebarLayout
      breadcrumbs={[
        { label: 'Administration', href: '/app/admin/members' },
        { label: 'Content' },
        { label: 'Sermons' },
      ]}
    >
      <div className="flex flex-1 flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Manage Sermons</h1>
            <p className="text-muted-foreground">{sermons.length} total sermons</p>
          </div>
          <Button onClick={openCreate}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Sermon
          </Button>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search sermons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          /* Sermons Table */
          <Card>
            <CardContent className="min-h-[480px] p-0">
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full table-fixed text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="w-[22%] px-4 py-3 text-left font-medium">Title</th>
                      <th className="w-[16%] px-4 py-3 text-left font-medium">Speaker</th>
                      <th className="w-[12%] px-4 py-3 text-left font-medium">Date</th>
                      <th className="w-[16%] px-4 py-3 text-left font-medium">Series</th>
                      <th className="w-[10%] px-4 py-3 text-center font-medium">Media</th>
                      <th className="w-[10%] px-4 py-3 text-center font-medium">Views</th>
                      <th className="w-[14%] px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredSermons.map((sermon) => (
                      <tr key={sermon.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium">{sermon.title}</td>
                        <td className="px-4 py-3 text-muted-foreground">{sermon.speaker}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {sermon.date ? new Date(sermon.date).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{sermon.series ?? '-'}</td>
                        <td className="flex items-center justify-center gap-1 px-4 py-3">
                          {sermon.youtubeUrl && <Youtube className="h-4 w-4 text-red-500" />}
                          {sermon.audioUrl && <Music className="h-4 w-4 text-blue-500" />}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="flex items-center justify-center gap-1">
                            <Eye className="h-3 w-3" /> {sermon.views}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEdit(sermon)}
                              aria-label={`Edit ${sermon.title}`}
                            >
                              <EditIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive"
                              onClick={() => setDeleteTarget(sermon.id)}
                              aria-label={`Delete ${sermon.title}`}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredSermons.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center">
                          <Music className="mx-auto mb-2 h-8 w-8 text-muted-foreground opacity-30" />
                          <p className="text-muted-foreground">No sermons found</p>
                          <p className="mt-1 text-xs text-muted-foreground/70">
                            Try adjusting your search or add a new sermon.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="divide-y md:hidden">
                {filteredSermons.map((sermon) => (
                  <div key={sermon.id} className="flex items-start justify-between gap-3 p-4">
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="font-medium leading-tight">{sermon.title}</p>
                      <p className="text-sm text-muted-foreground">{sermon.speaker}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          {sermon.date ? new Date(sermon.date).toLocaleDateString() : '-'}
                        </span>
                        {sermon.series && (
                          <>
                            <span>·</span>
                            <span>{sermon.series}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {sermon.youtubeUrl && <Youtube className="h-3.5 w-3.5 text-red-500" />}
                        {sermon.audioUrl && <Music className="h-3.5 w-3.5 text-blue-500" />}
                        <span className="flex items-center gap-0.5">
                          <Eye className="h-3 w-3" /> {sermon.views}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEdit(sermon)}
                        aria-label={`Edit ${sermon.title}`}
                      >
                        <EditIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => setDeleteTarget(sermon.id)}
                        aria-label={`Delete ${sermon.title}`}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredSermons.length === 0 && (
                  <div className="px-4 py-12 text-center">
                    <Music className="mx-auto mb-2 h-8 w-8 text-muted-foreground opacity-30" />
                    <p className="text-muted-foreground">No sermons found</p>
                    <p className="mt-1 text-xs text-muted-foreground/70">
                      Try adjusting your search or add a new sermon.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create/Edit Sheet */}
        <Sheet
          open={showForm}
          onOpenChange={(open) => {
            if (!saving) setShowForm(open);
          }}
        >
          <SheetContent
            side="right"
            className="flex w-full flex-col p-0 sm:max-w-2xl"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            {/* Accent strip */}
            <div className="h-1 shrink-0 bg-gradient-to-r from-violet-500 to-purple-700" />
            {/* Sheet header */}
            <div className="shrink-0 border-b bg-card px-6 pb-5 pt-4">
              <div className="flex items-start gap-4 pr-12">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 shadow-lg shadow-violet-300/50 dark:shadow-violet-900/40">
                  {editingSermon ? (
                    <EditIcon className="h-6 w-6 text-white" />
                  ) : (
                    <BookOpen className="h-6 w-6 text-white" />
                  )}
                </div>
                <div className="min-w-0 flex-1 pt-1">
                  <SheetTitle className="text-xl font-bold tracking-tight">
                    {editingSermon ? 'Edit Sermon' : 'Add Sermon'}
                  </SheetTitle>
                  <SheetDescription className="mt-1 text-sm">
                    {editingSermon
                      ? 'Update the sermon details below.'
                      : 'Fill in the details to add a new sermon to the archive.'}
                  </SheetDescription>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto bg-muted/20">
              <form id="sermon-form" onSubmit={handleSubmit} className="space-y-3 p-4">
                {/* Title & Speaker Card */}
                <div className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm">
                  <div className="flex items-center gap-3 border-b border-border/40 bg-muted/40 px-4 py-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <Mic className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-none">Title &amp; Speaker</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Sermon name and preacher
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-3 p-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="sermon-title-en"
                        className="text-xs font-medium text-muted-foreground"
                      >
                        Title (EN) <span className="text-destructive">*</span>
                      </label>
                      <Input
                        id="sermon-title-en"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="sermon-title-th"
                        className="text-xs font-medium text-muted-foreground"
                      >
                        Title (TH)
                      </label>
                      <Input
                        id="sermon-title-th"
                        value={formData.titleThai}
                        onChange={(e) => setFormData({ ...formData, titleThai: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="sermon-speaker-en"
                        className="text-xs font-medium text-muted-foreground"
                      >
                        Speaker (EN) <span className="text-destructive">*</span>
                      </label>
                      <Input
                        id="sermon-speaker-en"
                        required
                        value={formData.speaker}
                        onChange={(e) => setFormData({ ...formData, speaker: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="sermon-speaker-th"
                        className="text-xs font-medium text-muted-foreground"
                      >
                        Speaker (TH)
                      </label>
                      <Input
                        id="sermon-speaker-th"
                        value={formData.speakerThai}
                        onChange={(e) => setFormData({ ...formData, speakerThai: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Schedule & Series Card */}
                <div className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm">
                  <div className="flex items-center gap-3 border-b border-border/40 bg-muted/40 px-4 py-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                      <Calendar className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-none">Schedule &amp; Series</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Date, duration and topic series
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-3 p-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="sermon-date"
                        className="text-xs font-medium text-muted-foreground"
                      >
                        Date <span className="text-destructive">*</span>
                      </label>
                      <Input
                        id="sermon-date"
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="sermon-duration"
                        className="text-xs font-medium text-muted-foreground"
                      >
                        Duration
                      </label>
                      <Input
                        id="sermon-duration"
                        placeholder="e.g. 45:00"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="sermon-series-en"
                        className="text-xs font-medium text-muted-foreground"
                      >
                        Series (EN)
                      </label>
                      <Input
                        id="sermon-series-en"
                        value={formData.series}
                        onChange={(e) => setFormData({ ...formData, series: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="sermon-series-th"
                        className="text-xs font-medium text-muted-foreground"
                      >
                        Series (TH)
                      </label>
                      <Input
                        id="sermon-series-th"
                        value={formData.seriesThai}
                        onChange={(e) => setFormData({ ...formData, seriesThai: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <label
                        htmlFor="sermon-scripture"
                        className="text-xs font-medium text-muted-foreground"
                      >
                        Scripture
                      </label>
                      <Input
                        id="sermon-scripture"
                        placeholder="e.g. John 3:16"
                        value={formData.scripture}
                        onChange={(e) => setFormData({ ...formData, scripture: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Media Links Card */}
                <div className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm">
                  <div className="flex items-center gap-3 border-b border-border/40 bg-muted/40 px-4 py-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                      <Link2 className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-none">Media Links</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Video, audio and thumbnail URLs
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-3 p-4 sm:grid-cols-2">
                    <div className="space-y-1.5 sm:col-span-2">
                      <label
                        htmlFor="sermon-youtube-url"
                        className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
                      >
                        <Youtube className="h-3 w-3 text-red-500" /> YouTube URL
                      </label>
                      <Input
                        id="sermon-youtube-url"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={formData.youtubeUrl}
                        onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="sermon-audio-url"
                        className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
                      >
                        <Music className="h-3 w-3 text-purple-500" /> Audio URL
                      </label>
                      <Input
                        id="sermon-audio-url"
                        value={formData.audioUrl}
                        onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="sermon-thumbnail-url"
                        className="text-xs font-medium text-muted-foreground"
                      >
                        Thumbnail URL
                      </label>
                      <Input
                        id="sermon-thumbnail-url"
                        value={formData.thumbnailUrl}
                        onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Description Card */}
                <div className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm">
                  <div className="flex items-center gap-3 border-b border-border/40 bg-muted/40 px-4 py-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800/60">
                      <FileText className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-none">Description</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Summary or notes in both languages
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3 p-4">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="sermon-description-en"
                        className="text-xs font-medium text-muted-foreground"
                      >
                        Description (EN)
                      </label>
                      <Textarea
                        id="sermon-description-en"
                        rows={3}
                        className="resize-none"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="sermon-description-th"
                        className="text-xs font-medium text-muted-foreground"
                      >
                        Description (TH)
                      </label>
                      <Textarea
                        id="sermon-description-th"
                        rows={3}
                        className="resize-none"
                        value={formData.descriptionThai}
                        onChange={(e) =>
                          setFormData({ ...formData, descriptionThai: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <SheetFooter className="shrink-0 border-t bg-card px-4 py-3 shadow-[0_-1px_8px_rgba(0,0,0,0.06)]">
              <div className="flex w-full gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowForm(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="sermon-form"
                  className="flex-1 shadow-md shadow-primary/20"
                  disabled={saving}
                >
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingSermon ? 'Update Sermon' : 'Create Sermon'}
                </Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
      <ConfirmDialog
        open={!!deleteTarget}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        title="Delete Sermon"
        description="Are you sure you want to delete this sermon? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        loading={deleting}
      />
    </SidebarLayout>
  );
}

export default AdminSermonsPage;
