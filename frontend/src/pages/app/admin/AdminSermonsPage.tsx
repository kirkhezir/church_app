/**
 * AdminSermonsPage
 *
 * Admin page for managing sermons (CRUD)
 * - List all sermons with search/filter
 * - Create, edit, delete sermons
 * - Track views
 */

import { useState, useEffect, useMemo } from 'react';
import { PlusIcon, EditIcon, TrashIcon, Search, Loader2, Youtube, Eye, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SidebarLayout } from '@/components/layout';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { sermonService, type Sermon } from '@/services/endpoints/sermonService';

export function AdminSermonsPage() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSermon, setEditingSermon] = useState<Sermon | null>(null);
  const [saving, setSaving] = useState(false);
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
        setSuccess('Sermon updated successfully');
      } else {
        await sermonService.createSermon(payload);
        setSuccess('Sermon created successfully');
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
    if (!confirm('Are you sure you want to delete this sermon?')) return;
    try {
      await sermonService.deleteSermon(id);
      setSuccess('Sermon deleted');
      await fetchSermons();
    } catch {
      setError('Failed to delete sermon');
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
      <div className="mx-auto max-w-6xl space-y-6 p-6">
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
        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
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
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          /* Sermons Table */
          <Card>
            <CardContent className="min-h-[400px] p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Title</th>
                      <th className="px-4 py-3 text-left font-medium">Speaker</th>
                      <th className="px-4 py-3 text-left font-medium">Date</th>
                      <th className="px-4 py-3 text-left font-medium">Series</th>
                      <th className="px-4 py-3 text-center font-medium">Media</th>
                      <th className="px-4 py-3 text-center font-medium">Views</th>
                      <th className="px-4 py-3 text-right font-medium">Actions</th>
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
                            <Button size="sm" variant="ghost" onClick={() => openEdit(sermon)}>
                              <EditIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive"
                              onClick={() => handleDelete(sermon.id)}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredSermons.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                          No sermons found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingSermon ? 'Edit Sermon' : 'Add Sermon'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="sermon-title-en" className="mb-1 block text-sm font-medium">Title (EN) *</label>
                  <input
                    id="sermon-title-en"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="sermon-title-th" className="mb-1 block text-sm font-medium">Title (TH)</label>
                  <input
                    id="sermon-title-th"
                    value={formData.titleThai}
                    onChange={(e) => setFormData({ ...formData, titleThai: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="sermon-speaker-en" className="mb-1 block text-sm font-medium">Speaker (EN) *</label>
                  <input
                    id="sermon-speaker-en"
                    required
                    value={formData.speaker}
                    onChange={(e) => setFormData({ ...formData, speaker: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="sermon-speaker-th" className="mb-1 block text-sm font-medium">Speaker (TH)</label>
                  <input
                    id="sermon-speaker-th"
                    value={formData.speakerThai}
                    onChange={(e) => setFormData({ ...formData, speakerThai: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="sermon-date" className="mb-1 block text-sm font-medium">Date *</label>
                  <input
                    id="sermon-date"
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="sermon-duration" className="mb-1 block text-sm font-medium">Duration</label>
                  <input
                    id="sermon-duration"
                    placeholder="e.g. 45:00"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="sermon-series-en" className="mb-1 block text-sm font-medium">Series (EN)</label>
                  <input
                    id="sermon-series-en"
                    value={formData.series}
                    onChange={(e) => setFormData({ ...formData, series: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="sermon-series-th" className="mb-1 block text-sm font-medium">Series (TH)</label>
                  <input
                    id="sermon-series-th"
                    value={formData.seriesThai}
                    onChange={(e) => setFormData({ ...formData, seriesThai: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="sermon-scripture" className="mb-1 block text-sm font-medium">Scripture</label>
                  <input
                    id="sermon-scripture"
                    placeholder="e.g. John 3:16"
                    value={formData.scripture}
                    onChange={(e) => setFormData({ ...formData, scripture: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="sermon-youtube-url" className="mb-1 block text-sm font-medium">YouTube URL</label>
                  <input
                    id="sermon-youtube-url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={formData.youtubeUrl}
                    onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="sermon-audio-url" className="mb-1 block text-sm font-medium">Audio URL</label>
                  <input
                    id="sermon-audio-url"
                    value={formData.audioUrl}
                    onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="sermon-thumbnail-url" className="mb-1 block text-sm font-medium">Thumbnail URL</label>
                  <input
                    id="sermon-thumbnail-url"
                    value={formData.thumbnailUrl}
                    onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="sermon-description-en" className="mb-1 block text-sm font-medium">Description (EN)</label>
                <textarea
                  id="sermon-description-en"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="sermon-description-th" className="mb-1 block text-sm font-medium">Description (TH)</label>
                <textarea
                  id="sermon-description-th"
                  rows={3}
                  value={formData.descriptionThai}
                  onChange={(e) => setFormData({ ...formData, descriptionThai: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingSermon ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarLayout>
  );
}

export default AdminSermonsPage;
