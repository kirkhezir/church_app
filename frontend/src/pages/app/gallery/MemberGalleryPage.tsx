/**
 * Member Gallery Page
 *
 * Photo gallery with album organization, lightbox, and filtering.
 * Uses SidebarLayout instead of PublicLayout.
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Grid,
  LayoutGrid,
  ZoomIn,
  Download,
  Share2,
  Calendar,
  Heart,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SidebarLayout } from '@/components/layout';
import { galleryService, type GalleryItem, type Album } from '@/services/endpoints/galleryService';

type ViewMode = 'albums' | 'photos';

export function MemberGalleryPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('albums');
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<GalleryItem | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [photos, setPhotos] = useState<GalleryItem[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await galleryService.getGallery();
        setPhotos(data.items);
        setAlbums(data.albums);
      } catch {
        setError('Failed to load gallery. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredPhotos = useMemo(
    () => (selectedAlbum ? photos.filter((p) => p.albumId === selectedAlbum) : photos),
    [selectedAlbum, photos]
  );

  const openLightbox = useCallback((photo: GalleryItem, index: number) => {
    setLightboxPhoto(photo);
    setLightboxIndex(index);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxPhoto(null);
    document.body.style.overflow = '';
  }, []);

  const navigateLightbox = useCallback(
    (direction: 'prev' | 'next') => {
      const newIndex =
        direction === 'prev'
          ? (lightboxIndex - 1 + filteredPhotos.length) % filteredPhotos.length
          : (lightboxIndex + 1) % filteredPhotos.length;
      setLightboxIndex(newIndex);
      setLightboxPhoto(filteredPhotos[newIndex]);
    },
    [lightboxIndex, filteredPhotos]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!lightboxPhoto) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateLightbox('prev');
      if (e.key === 'ArrowRight') navigateLightbox('next');
    },
    [lightboxPhoto, closeLightbox, navigateLightbox]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (loading) {
    return (
      <SidebarLayout breadcrumbs={[{ label: 'Gallery' }]}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </SidebarLayout>
    );
  }

  if (error) {
    return (
      <SidebarLayout breadcrumbs={[{ label: 'Gallery' }]}>
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout breadcrumbs={[{ label: 'Gallery' }]}>
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Photo Gallery</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {selectedAlbum ? `${filteredPhotos.length} photos` : `${albums.length} albums`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selectedAlbum && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedAlbum(null)}
                className="mr-2"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                All Albums
              </Button>
            )}
            <Button
              variant={viewMode === 'albums' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setViewMode('albums');
                setSelectedAlbum(null);
              }}
            >
              <LayoutGrid className="mr-1 h-4 w-4" />
              Albums
            </Button>
            <Button
              variant={viewMode === 'photos' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('photos')}
            >
              <Grid className="mr-1 h-4 w-4" />
              All Photos
            </Button>
          </div>
        </div>

        {viewMode === 'albums' && !selectedAlbum ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((album) => (
              <button
                key={album.id}
                type="button"
                className="group w-full cursor-pointer overflow-hidden rounded-lg border bg-card text-left shadow-sm transition-shadow duration-200 hover:shadow-xl"
                aria-label={`View album ${album.title}`}
                onClick={() => {
                  setSelectedAlbum(album.id);
                  setViewMode('photos');
                }}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={album.coverImage}
                    alt={album.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h2 className="text-lg font-bold">{album.title}</h2>
                    <p className="text-sm text-white/80">{album.photoCount} photos</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredPhotos.map((photo, index) => (
              <button
                key={photo.id}
                type="button"
                className="group relative aspect-square w-full cursor-pointer overflow-hidden rounded-lg"
                aria-label={`View photo ${photo.title}`}
                onClick={() => openLightbox(photo, index)}
              >
                <img
                  src={photo.thumbnailUrl ?? photo.imageUrl}
                  alt={photo.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-[background-color] duration-200 group-hover:bg-black/40">
                  <ZoomIn className="h-8 w-8 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 translate-y-full bg-gradient-to-t from-black/80 to-transparent p-3 transition-transform group-hover:translate-y-0">
                  <p className="text-sm font-medium text-white">{photo.title}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          onClick={closeLightbox}
          onKeyDown={(e) => {
            if (e.key === 'Escape') closeLightbox();
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Photo lightbox viewer"
        >
          <button
            onClick={closeLightbox}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            aria-label="Close lightbox"
          >
            <X className="h-6 w-6" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateLightbox('prev');
            }}
            className="absolute left-4 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            aria-label="Previous photo"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateLightbox('next');
            }}
            className="absolute right-4 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            aria-label="Next photo"
          >
            <ChevronRight className="h-8 w-8" />
          </button>

          <div
            role="presentation"
            className="max-h-[85vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxPhoto.imageUrl}
              alt={lightboxPhoto.title}
              className="max-h-[85vh] max-w-full object-contain"
            />
          </div>

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
            <div className="mx-auto flex max-w-4xl items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">{lightboxPhoto.title}</h2>
                <p className="flex items-center gap-2 text-sm text-white/70">
                  <Calendar className="h-4 w-4" />
                  {new Date(lightboxPhoto.eventDate ?? lightboxPhoto.createdAt).toLocaleDateString(
                    'en-US'
                  )}
                  {lightboxPhoto.photographer && (
                    <>
                      <span>•</span>
                      <span>{lightboxPhoto.photographer}</span>
                    </>
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  aria-label="Like photo"
                >
                  <Heart className="mr-1 h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  aria-label="Share photo"
                >
                  <Share2 className="mr-1 h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  aria-label="Download photo"
                >
                  <Download className="mr-1 h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mt-2 text-center text-sm text-white/50">
              {lightboxIndex + 1} / {filteredPhotos.length}
            </div>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}

export default MemberGalleryPage;
