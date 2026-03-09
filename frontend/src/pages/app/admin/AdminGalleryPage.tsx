/**
 * AdminGalleryPage
 *
 * Admin page for managing gallery photos
 * - View all photos in a grid
 * - Upload new photos (by URL)
 * - Delete photos
 * - Organize by album
 */

import { useState, useEffect } from 'react';
import {
  PlusIcon,
  TrashIcon,
  Loader2,
  ImageIcon,
  FolderOpen,
  Camera,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { galleryService, type GalleryItem, type Album } from '@/services/endpoints/galleryService';
import { ConfirmDialog } from '@/components/features/shared/ConfirmDialog';
import { gooeyToast } from 'goey-toast';

export function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<string>('all');
  const [formData, setFormData] = useState({
    imageUrl: '',
    title: '',
    titleThai: '',
    description: '',
    albumId: '',
    albumTitle: '',
    albumTitleThai: '',
    category: '',
    eventDate: '',
    photographer: '',
  });

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const data = await galleryService.getGallery();
      setItems(data.items);
      setAlbums(data.albums);
    } catch {
      setError('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const filteredItems =
    selectedAlbum === 'all' ? items : items.filter((i) => i.albumId === selectedAlbum);

  const resetForm = () => {
    setFormData({
      imageUrl: '',
      title: '',
      titleThai: '',
      description: '',
      albumId: '',
      albumTitle: '',
      albumTitleThai: '',
      category: '',
      eventDate: '',
      photographer: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await galleryService.createGalleryItem({
        imageUrl: formData.imageUrl,
        title: formData.title || undefined,
        titleThai: formData.titleThai || undefined,
        description: formData.description || undefined,
        albumId: formData.albumId,
        albumTitle: formData.albumTitle,
        albumTitleThai: formData.albumTitleThai || undefined,
        photographer: formData.photographer || undefined,
        eventDate: formData.eventDate || undefined,
      });
      gooeyToast.success('Photo added');
      setShowForm(false);
      resetForm();
      await fetchGallery();
    } catch {
      setError('Failed to add photo');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeleting(true);
      await galleryService.deleteGalleryItem(id);
      gooeyToast.success('Photo deleted');
      await fetchGallery();
    } catch {
      setError('Failed to delete photo');
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
        { label: 'Gallery' },
      ]}
    >
      <div className="flex flex-1 flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Manage Gallery</h1>
            <p className="text-muted-foreground">
              {items.length} photos in {albums.length} albums
            </p>
          </div>
          <Button
            className="w-full sm:w-auto"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Photo
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {/* Album Filter */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedAlbum === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedAlbum('all')}
          >
            <ImageIcon className="mr-1 h-4 w-4" />
            All ({items.length})
          </Button>
          {albums.map((album) => (
            <Button
              key={album.id}
              variant={selectedAlbum === album.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedAlbum(album.id)}
            >
              <FolderOpen className="mr-1 h-4 w-4" />
              {album.title} ({album.photoCount})
            </Button>
          ))}
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid flex-1 content-start gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredItems.map((item) => (
              <Card key={item.id} className="group relative overflow-hidden">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={item.thumbnailUrl ?? item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <CardContent className="p-3">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.albumTitle}</p>
                </CardContent>
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => setDeleteTarget(item.id)}
                  aria-label={`Delete ${item.title}`}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </Card>
            ))}
            {filteredItems.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                <ImageIcon className="mx-auto mb-2 h-8 w-8 opacity-30" />
                <p>No photos found</p>
                <p className="mt-1 text-xs opacity-70">Upload photos to populate your gallery.</p>
              </div>
            )}
          </div>
        )}

        {/* Add Photo Sheet */}
        <Sheet
          open={showForm}
          onOpenChange={(open) => {
            if (!saving) setShowForm(open);
          }}
        >
          <SheetContent
            side="right"
            className="flex w-full flex-col p-0 sm:max-w-lg"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            {/* Accent strip */}
            <div className="h-1 shrink-0 bg-gradient-to-r from-rose-500 to-pink-600" />
            {/* Sheet header */}
            <div className="shrink-0 border-b bg-card px-6 pb-5 pt-4">
              <div className="flex items-start gap-4 pr-12">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-300/50 dark:shadow-rose-900/40">
                  <Camera className="h-6 w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1 pt-1">
                  <SheetTitle className="text-xl font-bold tracking-tight">Add Photo</SheetTitle>
                  <SheetDescription className="mt-1 text-sm">
                    Enter the photo details and URL to add it to the gallery.
                  </SheetDescription>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto bg-muted/20">
              <form id="gallery-form" onSubmit={handleSubmit} className="space-y-3 p-4">
                {/* Image Card */}
                <div className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm">
                  <div className="flex items-center gap-3 border-b border-border/40 bg-muted/40 px-4 py-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <Camera className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-none">Image</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Photo URL and caption
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3 p-4">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="gallery-image-url"
                        className="text-xs font-medium text-muted-foreground"
                      >
                        Image URL <span className="text-destructive">*</span>
                      </label>
                      <Input
                        id="gallery-image-url"
                        required
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label
                          htmlFor="gallery-title-en"
                          className="text-xs font-medium text-muted-foreground"
                        >
                          Title (EN)
                        </label>
                        <Input
                          id="gallery-title-en"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label
                          htmlFor="gallery-title-th"
                          className="text-xs font-medium text-muted-foreground"
                        >
                          Title (TH)
                        </label>
                        <Input
                          id="gallery-title-th"
                          value={formData.titleThai}
                          onChange={(e) => setFormData({ ...formData, titleThai: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Album Card */}
                <div className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm">
                  <div className="flex items-center gap-3 border-b border-border/40 bg-muted/40 px-4 py-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                      <FolderOpen className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-none">Album</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Collection this photo belongs to
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-3 p-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="gallery-album-id"
                        className="text-xs font-medium text-muted-foreground"
                      >
                        Album ID <span className="text-destructive">*</span>
                      </label>
                      <Input
                        id="gallery-album-id"
                        required
                        value={formData.albumId}
                        onChange={(e) => setFormData({ ...formData, albumId: e.target.value })}
                        placeholder="sabbath-worship"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="gallery-album-title"
                        className="text-xs font-medium text-muted-foreground"
                      >
                        Album Title <span className="text-destructive">*</span>
                      </label>
                      <Input
                        id="gallery-album-title"
                        required
                        value={formData.albumTitle}
                        onChange={(e) => setFormData({ ...formData, albumTitle: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* When & Who Card */}
                <div className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm">
                  <div className="flex items-center gap-3 border-b border-border/40 bg-muted/40 px-4 py-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                      <Calendar className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-none">When &amp; Who</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Event date and photographer
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-3 p-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="gallery-event-date"
                        className="text-xs font-medium text-muted-foreground"
                      >
                        Event Date
                      </label>
                      <Input
                        id="gallery-event-date"
                        type="date"
                        value={formData.eventDate}
                        onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="gallery-photographer"
                        className="text-xs font-medium text-muted-foreground"
                      >
                        Photographer
                      </label>
                      <Input
                        id="gallery-photographer"
                        value={formData.photographer}
                        onChange={(e) => setFormData({ ...formData, photographer: e.target.value })}
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
                  form="gallery-form"
                  className="flex-1 shadow-md shadow-primary/20"
                  disabled={saving}
                >
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Photo
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
        title="Delete Photo"
        description="Are you sure you want to delete this photo? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        loading={deleting}
      />
    </SidebarLayout>
  );
}

export default AdminGalleryPage;
