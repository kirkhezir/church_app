/**
 * Testimonials Section Component
 *
 * Displays member testimonials with carousel/slider
 * Builds trust and shows real community impact
 */

import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Button } from '../../ui/button';

interface Testimonial {
  id: string;
  name: string;
  role?: string;
  quote: string;
  image?: string;
  rating?: number;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'สมชาย วงศ์สุข',
    role: 'Church Member since 2018',
    quote:
      'Finding this church was a blessing. The warm fellowship and Bible-centered teachings have transformed my spiritual life. I found a second family here.',
    rating: 5,
  },
  {
    id: '2',
    name: 'มาลี ศรีสุข',
    role: 'Youth Member',
    quote:
      "The youth programs here are amazing! I've grown so much in my faith and made lifelong friends. Every Sabbath feels like coming home.",
    rating: 5,
  },
  {
    id: '3',
    name: 'วิชัย ธรรมดี',
    role: 'New Member',
    quote:
      'As a newcomer, I was nervous about attending. But the welcoming atmosphere made me feel at home from day one. The community here truly lives their faith.',
    rating: 5,
  },
  {
    id: '4',
    name: 'สุดา รักสันติ',
    role: 'Church Member since 2015',
    quote:
      'The teachings here have helped me understand the Bible in a deeper way. Our pastor and church family support each other through every season of life.',
    rating: 5,
  },
];

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Auto-slide every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 6000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-20">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
            What Our Members Say
          </h2>
          <div className="mx-auto mb-4 h-1 w-24 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"></div>
          <p className="text-xl text-gray-600">Real stories from our church family</p>
        </div>

        {/* Testimonial Card */}
        <div className="relative">
          <Card
            className={`mx-auto max-w-4xl border-none bg-white shadow-2xl transition-all duration-500 ${
              isAnimating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
            }`}
          >
            <CardContent className="p-8 md:p-12">
              {/* Quote Icon */}
              <div className="mb-6 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                  <Quote className="h-8 w-8 text-white" />
                </div>
              </div>

              {/* Quote Text */}
              <blockquote className="mb-8 text-center text-xl leading-relaxed text-gray-700 md:text-2xl">
                "{currentTestimonial.quote}"
              </blockquote>

              {/* Rating Stars */}
              {currentTestimonial.rating && (
                <div className="mb-6 flex justify-center gap-1">
                  {Array.from({ length: currentTestimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              )}

              {/* Author Info */}
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100 text-2xl font-bold text-blue-600">
                  {currentTestimonial.name.charAt(0)}
                </div>
                <p className="text-lg font-semibold text-gray-900">{currentTestimonial.name}</p>
                {currentTestimonial.role && (
                  <p className="text-sm text-gray-500">{currentTestimonial.role}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="absolute left-0 right-0 top-1/2 flex -translate-y-1/2 justify-between px-4">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrev}
              className="h-12 w-12 rounded-full border-2 bg-white shadow-lg hover:bg-blue-50"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              className="h-12 w-12 rounded-full border-2 bg-white shadow-lg hover:bg-blue-50"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="mt-8 flex justify-center gap-2">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-3 w-3 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? 'w-8 bg-gradient-to-r from-blue-600 to-purple-600'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to testimonial ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
