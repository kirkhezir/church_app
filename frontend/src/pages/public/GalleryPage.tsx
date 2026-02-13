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

// Photo album categories
interface Album {
  id: string;
  title: string;
  titleThai: string;
  description: string;
  descriptionThai: string;
  coverImage: string;
  photoCount: number;
  date: string;
}

interface Photo {
  id: string;
  src: string;
  thumbnail: string;
  title: string;
  titleThai: string;
  albumId: string;
  date: string;
  photographer?: string;
}

// Sample albums data
const albums: Album[] = [
  {
    id: 'sabbath-services',
    title: 'Sabbath Services',
    titleThai: 'นมัสการวันสะบาโต',
    description: 'Weekly worship services and special programs',
    descriptionThai: 'นมัสการประจำสัปดาห์และโปรแกรมพิเศษ',
    coverImage: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=600&q=80',
    photoCount: 24,
    date: '2026-01',
  },
  {
    id: 'youth-activities',
    title: 'Youth Activities',
    titleThai: 'กิจกรรมเยาวชน',
    description: 'AY meetings, camps, and youth outreach',
    descriptionThai: 'การประชุม AY ค่าย และการเผยแพร่เยาวชน',
    coverImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80',
    photoCount: 18,
    date: '2025-12',
  },
  {
    id: 'community-service',
    title: 'Community Service',
    titleThai: 'บริการชุมชน',
    description: 'Outreach programs and helping our neighbors',
    descriptionThai: 'โปรแกรมช่วยเหลือและการดูแลเพื่อนบ้าน',
    coverImage: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&q=80',
    photoCount: 15,
    date: '2025-11',
  },
  {
    id: 'baptism',
    title: 'Baptism Celebrations',
    titleThai: 'พิธีบัพติศมา',
    description: 'Celebrating new members joining our family',
    descriptionThai: 'ฉลองสมาชิกใหม่เข้าร่วมครอบครัว',
    coverImage: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80',
    photoCount: 12,
    date: '2025-10',
  },
  {
    id: 'special-events',
    title: 'Special Events',
    titleThai: 'กิจกรรมพิเศษ',
    description: 'Evangelistic meetings and celebrations',
    descriptionThai: 'การประชุมประกาศและงานเฉลิมฉลอง',
    coverImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80',
    photoCount: 30,
    date: '2025-09',
  },
  {
    id: 'church-family',
    title: 'Church Family',
    titleThai: 'ครอบครัวโบสถ์',
    description: 'Fellowship meals and gatherings',
    descriptionThai: 'อาหารสามัคคีธรรมและการชุมนุม',
    coverImage: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=600&q=80',
    photoCount: 20,
    date: '2025-08',
  },
];

// Sample photos data
const photos: Photo[] = [
  {
    id: '1',
    src: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=400&q=80',
    title: 'Sabbath Morning Worship',
    titleThai: 'นมัสการเช้าวันสะบาโต',
    albumId: 'sabbath-services',
    date: '2026-01-25',
    photographer: 'Church Media Team',
  },
  {
    id: '2',
    src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    title: 'Pastor Preaching',
    titleThai: 'ศิษยาภิบาลเทศนา',
    albumId: 'sabbath-services',
    date: '2026-01-25',
  },
  {
    id: '3',
    src: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80',
    title: 'Youth Group Meeting',
    titleThai: 'การประชุมกลุ่มเยาวชน',
    albumId: 'youth-activities',
    date: '2025-12-20',
  },
  {
    id: '4',
    src: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&q=80',
    title: 'Community Outreach',
    titleThai: 'การเข้าถึงชุมชน',
    albumId: 'community-service',
    date: '2025-11-15',
  },
  {
    id: '5',
    src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80',
    title: 'Baptism Day',
    titleThai: 'วันบัพติศมา',
    albumId: 'baptism',
    date: '2025-10-10',
  },
  {
    id: '6',
    src: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=80',
    title: 'Special Sabbath Program',
    titleThai: 'โปรแกรมสะบาโตพิเศษ',
    albumId: 'special-events',
    date: '2025-09-20',
  },
  {
    id: '7',
    src: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=400&q=80',
    title: 'Fellowship Lunch',
    titleThai: 'อาหารกลางวันสามัคคีธรรม',
    albumId: 'church-family',
    date: '2025-08-15',
  },
  {
    id: '8',
    src: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&q=80',
    title: 'Choir Performance',
    titleThai: 'การแสดงคณะนักร้องประสานเสียง',
    albumId: 'sabbath-services',
    date: '2026-01-18',
  },
];

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
      <div className="sticky top-16 z-40 border-b bg-white/95 backdrop-blur-sm">
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
            <span className="text-sm text-slate-600">
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
                    <h3 className="text-lg font-bold">
                      {language === 'th' ? album.titleThai : album.title}
                    </h3>
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
                <h3 className="text-lg font-semibold text-white">
                  {language === 'th' ? lightboxPhoto.titleThai : lightboxPhoto.title}
                </h3>
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
