/**
 * Photo Gallery Section Component
 *
 * Displays church photos with lightbox functionality
 * Visual storytelling for community activities
 */

import { useState } from 'react';
import { Dialog, DialogContent } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { ChevronLeft, ChevronRight, X, Camera, ZoomIn } from 'lucide-react';

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
    <section className="bg-white px-4 py-20">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-sm font-medium text-purple-700">
            <Camera className="h-4 w-4" />
            <span>Photo Gallery</span>
          </div>
          <h2 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">Our Church Family</h2>
          <p className="text-xl text-gray-600">Moments of faith, fellowship, and community</p>
        </div>

        {/* Photo Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {galleryImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => openLightbox(image, index)}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/50"
            >
              <img
                src={image.src}
                alt={image.alt}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wider text-blue-300">
                    {image.category}
                  </p>
                  <p className="text-lg font-semibold">{image.caption}</p>
                </div>

                {/* Zoom Icon */}
                <div className="absolute right-4 top-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                    <ZoomIn className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Lightbox Dialog */}
        <Dialog open={!!selectedImage} onOpenChange={closeLightbox}>
          <DialogContent
            className="max-w-5xl border-none bg-black/95 p-0"
            onKeyDown={handleKeyDown}
          >
            <div className="relative">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={closeLightbox}
                className="absolute right-4 top-4 z-10 h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <X className="h-6 w-6" />
              </Button>

              {/* Navigation Buttons */}
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 z-10 h-12 w-12 -translate-y-1/2 rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNext}
                className="absolute right-4 top-1/2 z-10 h-12 w-12 -translate-y-1/2 rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <ChevronRight className="h-8 w-8" />
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
                    <p className="text-sm uppercase tracking-wider text-blue-400">
                      {selectedImage.category}
                    </p>
                    <p className="mt-1 text-xl font-semibold">{selectedImage.caption}</p>
                    <p className="mt-2 text-sm text-gray-400">
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
