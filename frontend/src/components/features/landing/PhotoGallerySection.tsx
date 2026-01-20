/**
 * Photo Gallery Section Component
 *
 * Displays church photos with lightbox functionality
 * Visual storytelling for community activities
 */

import { useState } from 'react';
import { Dialog, DialogContent } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  category?: string;
}

// Placeholder images - replace with actual church photos
const galleryImages: GalleryImage[] = [
  {
    id: '1',
    src: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&h=600&fit=crop',
    alt: 'Church worship service',
    caption: 'Sabbath Divine Service',
    category: 'Worship',
  },
  {
    id: '2',
    src: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&h=600&fit=crop',
    alt: 'Youth group activity',
    caption: 'Youth Fellowship Program',
    category: 'Youth',
  },
  {
    id: '3',
    src: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=800&h=600&fit=crop',
    alt: 'Community outreach',
    caption: 'Community Service Day',
    category: 'Outreach',
  },
  {
    id: '4',
    src: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&h=600&fit=crop',
    alt: 'Bible study group',
    caption: 'Wednesday Bible Study',
    category: 'Education',
  },
  {
    id: '5',
    src: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=800&h=600&fit=crop',
    alt: 'Church choir performance',
    caption: 'Choir Special Music',
    category: 'Worship',
  },
  {
    id: '6',
    src: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=600&fit=crop',
    alt: 'Church fellowship meal',
    caption: 'Potluck Fellowship',
    category: 'Fellowship',
  },
];

export function PhotoGallerySection() {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const openLightbox = (image: GalleryImage, index: number) => {
    setSelectedImage(image);
    setSelectedIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const goToPrevious = () => {
    const newIndex = selectedIndex === 0 ? galleryImages.length - 1 : selectedIndex - 1;
    setSelectedIndex(newIndex);
    setSelectedImage(galleryImages[newIndex]);
  };

  const goToNext = () => {
    const newIndex = selectedIndex === galleryImages.length - 1 ? 0 : selectedIndex + 1;
    setSelectedIndex(newIndex);
    setSelectedImage(galleryImages[newIndex]);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
    if (e.key === 'Escape') closeLightbox();
  };

  return (
    <section className="bg-slate-50 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="mb-10 text-center sm:mb-12">
          <h2 className="mb-3 text-3xl font-bold text-slate-900 sm:text-4xl">Our Church Family</h2>
          <p className="text-lg text-slate-600">Moments of faith, fellowship, and community</p>
        </div>

        {/* Photo Grid - Masonry-style */}
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {galleryImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => openLightbox(image, index)}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-slate-200 transition-shadow hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <img
                src={image.src}
                alt={image.alt}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />

              {/* Overlay */}
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="text-xs font-medium uppercase tracking-wide text-white/80">
                  {image.category}
                </p>
                <p className="text-sm font-semibold text-white">{image.caption}</p>
              </div>

              {/* Zoom Icon */}
              <div className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
                  <ZoomIn className="h-4 w-4 text-white" />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Lightbox Dialog */}
        <Dialog open={!!selectedImage} onOpenChange={closeLightbox}>
          <DialogContent
            className="max-w-4xl border-none bg-black/95 p-0"
            onKeyDown={handleKeyDown}
          >
            <div className="relative">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={closeLightbox}
                className="absolute right-3 top-3 z-10 h-9 w-9 rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>

              {/* Navigation Buttons */}
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrevious}
                className="absolute left-3 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNext}
                className="absolute right-3 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>

              {/* Image */}
              {selectedImage && (
                <div className="flex flex-col items-center justify-center p-4">
                  <img
                    src={selectedImage.src}
                    alt={selectedImage.alt}
                    className="max-h-[70vh] w-auto rounded-lg object-contain"
                  />
                  <div className="mt-4 text-center text-white">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      {selectedImage.category}
                    </p>
                    <p className="mt-1 text-lg font-medium">{selectedImage.caption}</p>
                    <p className="mt-2 text-sm text-slate-500">
                      {selectedIndex + 1} / {galleryImages.length}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}

export default PhotoGallerySection;
