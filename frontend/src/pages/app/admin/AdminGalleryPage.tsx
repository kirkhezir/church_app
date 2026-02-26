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
import { PlusIcon, TrashIcon, Loader2, ImageIcon, FolderOpen } from 'lucide-react';
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
import { galleryService, type GalleryItem, type Album } from '@/services/endpoints/galleryService';
import { ConfirmDialog } from '@/components/features/shared/ConfirmDialog';
import { useToast } from '@/hooks/use-toast';

export function AdminGalleryPage() {
  const { toast } = useToast();
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
    descriptionThai: '',
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
      descriptionThai: '',
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
        descriptionThai: formData.descriptionThai || undefined,
        albumId: formData.albumId,
        albumTitle: formData.albumTitle,
        albumTitleThai: formData.albumTitleThai || undefined,
        photographer: formData.photographer || undefined,
        eventDate: formData.eventDate || undefined,
      });
      toast({ title: 'Photo added' });
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
      toast({ title: 'Photo deleted' });
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Manage Gallery</h1>
            <p className="text-muted-foreground">
              {items.length} photos in {albums.length} albums
            </p>
          </div>
          <Button
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

        {/* Add Photo Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Photo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="gallery-image-url" className="mb-1 block text-sm font-medium">
                  Image URL *
                </label>
                <Input
                  id="gallery-image-url"
                  required
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="gallery-title-en" className="mb-1 block text-sm font-medium">
                    Title (EN)
                  </label>
                  <Input
                    id="gallery-title-en"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="gallery-title-th" className="mb-1 block text-sm font-medium">
                    Title (TH)
                  </label>
                  <Input
                    id="gallery-title-th"
                    value={formData.titleThai}
                    onChange={(e) => setFormData({ ...formData, titleThai: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="gallery-album-id" className="mb-1 block text-sm font-medium">
                    Album ID *
                  </label>
                  <Input
                    id="gallery-album-id"
                    required
                    value={formData.albumId}
                    onChange={(e) => setFormData({ ...formData, albumId: e.target.value })}
                    placeholder="sabbath-worship"
                  />
                </div>
                <div>
                  <label htmlFor="gallery-album-title" className="mb-1 block text-sm font-medium">
                    Album Title *
                  </label>
                  <Input
                    id="gallery-album-title"
                    required
                    value={formData.albumTitle}
                    onChange={(e) => setFormData({ ...formData, albumTitle: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="gallery-event-date" className="mb-1 block text-sm font-medium">
                    Event Date
                  </label>
                  <Input
                    id="gallery-event-date"
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="gallery-photographer" className="mb-1 block text-sm font-medium">
                    Photographer
                  </label>
                  <Input
                    id="gallery-photographer"
                    value={formData.photographer}
                    onChange={(e) => setFormData({ ...formData, photographer: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Photo
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
