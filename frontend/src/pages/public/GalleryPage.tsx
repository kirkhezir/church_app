/**
 * Gallery Page
 *
 * Full-screen photo gallery with album organization
 * Features lightbox view, filtering by category, and lazy loading
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
  Camera,
  Heart,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PublicLayout } from '@/layouts';
import { useI18n } from '@/i18n';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { type Photo, albums, photos } from '@/data/gallery';

type ViewMode = 'albums' | 'photos';

export function GalleryPage() {
  const { language } = useI18n();
  useDocumentTitle('Photo Gallery', 'แกลเลอรี่', language);
  const [viewMode, setViewMode] = useState<ViewMode>('albums');
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const filteredPhotos = useMemo(
    () => (selectedAlbum ? photos.filter((p) => p.albumId === selectedAlbum) : photos),
    [selectedAlbum]
  );

  const openLightbox = useCallback((photo: Photo, index: number) => {
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

  // Add keyboard listener for lightbox navigation
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Cleanup: restore body overflow on unmount (e.g. if user navigates away while lightbox is open)
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 pb-12 pt-24">
        <div className="mx-auto max-w-6xl px-4 text-center text-white sm:px-6">
          <Camera className="mx-auto mb-4 h-12 w-12 text-purple-300" />
          <h1 className="mb-4 text-4xl font-bold sm:text-5xl">
            {language === 'th' ? 'แกลเลอรี่' : 'Photo Gallery'}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-purple-100">
            {language === 'th'
              ? 'ภาพความทรงจำจากชุมชนโบสถ์ของเรา'
              : 'Capturing memories from our church community'}
          </p>
        </div>
      </section>

      {/* Controls */}
      <div className="sticky top-16 z-40 border-b bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            {selectedAlbum && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedAlbum(null)}
                className="mr-2"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                {language === 'th' ? 'อัลบั้มทั้งหมด' : 'All Albums'}
              </Button>
            )}
            <span className="text-sm text-muted-foreground">
              {selectedAlbum
                ? `${filteredPhotos.length} ${language === 'th' ? 'รูป' : 'photos'}`
                : `${albums.length} ${language === 'th' ? 'อัลบั้ม' : 'albums'}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'albums' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setViewMode('albums');
                setSelectedAlbum(null);
              }}
            >
              <LayoutGrid className="mr-1 h-4 w-4" />
              {language === 'th' ? 'อัลบั้ม' : 'Albums'}
            </Button>
            <Button
              variant={viewMode === 'photos' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('photos')}
            >
              <Grid className="mr-1 h-4 w-4" />
              {language === 'th' ? 'รูปทั้งหมด' : 'All Photos'}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {viewMode === 'albums' && !selectedAlbum ? (
          /* Albums Grid */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((album) => (
              <Card
                key={album.id}
                className="group cursor-pointer overflow-hidden transition-all hover:shadow-xl"
                onClick={() => {
                  setSelectedAlbum(album.id);
                  setViewMode('photos');
                }}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={album.coverImage}
                    alt={language === 'th' ? album.titleThai : album.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h2 className="text-lg font-bold">
                      {language === 'th' ? album.titleThai : album.title}
                    </h2>
                    <p className="text-sm text-white/80">
                      {language === 'th' ? album.descriptionThai : album.description}
                    </p>
                  </div>
                  <div className="absolute right-3 top-3 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
                    {album.photoCount} {language === 'th' ? 'รูป' : 'photos'}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          /* Photos Grid */
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredPhotos.map((photo, index) => (
              <div
                key={photo.id}
                className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg"
                onClick={() => openLightbox(photo, index)}
              >
                <img
                  src={photo.thumbnail}
                  alt={language === 'th' ? photo.titleThai : photo.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/40">
                  <ZoomIn className="h-8 w-8 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 translate-y-full bg-gradient-to-t from-black/80 to-transparent p-3 transition-transform group-hover:translate-y-0">
                  <p className="text-sm font-medium text-white">
                    {language === 'th' ? photo.titleThai : photo.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label={language === 'th' ? 'ดูรูปภาพขนาดใหญ่' : 'Photo lightbox viewer'}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label={language === 'th' ? 'ปิด' : 'Close lightbox'}
          >
            <X className="h-6 w-6" />
          </button>

          {/* Navigation */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateLightbox('prev');
            }}
            className="absolute left-4 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label={language === 'th' ? 'รูปก่อนหน้า' : 'Previous photo'}
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateLightbox('next');
            }}
            className="absolute right-4 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label={language === 'th' ? 'รูปถัดไป' : 'Next photo'}
          >
            <ChevronRight className="h-8 w-8" />
          </button>

          {/* Image */}
          <div className="max-h-[85vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxPhoto.src}
              alt={language === 'th' ? lightboxPhoto.titleThai : lightboxPhoto.title}
              className="max-h-[85vh] max-w-full object-contain"
            />
          </div>

          {/* Info Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
            <div className="mx-auto flex max-w-4xl items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {language === 'th' ? lightboxPhoto.titleThai : lightboxPhoto.title}
                </h2>
                <p className="flex items-center gap-2 text-sm text-white/70">
                  <Calendar className="h-4 w-4" />
                  {new Date(lightboxPhoto.date).toLocaleDateString(
                    language === 'th' ? 'th-TH' : 'en-US'
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
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                  <Heart className="mr-1 h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                  <Share2 className="mr-1 h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
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
    </PublicLayout>
  );
}

export default GalleryPage;
