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

  // Auto-slide every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-bold text-slate-900 sm:text-4xl">
            What Our Members Say
          </h2>
          <p className="text-lg text-slate-600">Stories from our church family</p>
        </div>

        {/* Testimonial */}
        <div className="relative">
          <Card className="bg-slate-50 shadow-none">
            <CardContent className="p-6 sm:p-10">
              {/* Quote */}
              <Quote className="mx-auto mb-4 h-8 w-8 text-blue-400" />

              <blockquote className="mb-6 text-center text-lg text-slate-700 sm:text-xl">
                "{currentTestimonial.quote}"
              </blockquote>

              {/* Rating */}
              {currentTestimonial.rating && (
                <div className="mb-4 flex justify-center gap-0.5">
                  {Array.from({ length: currentTestimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              )}

              {/* Author */}
              <div className="text-center">
                <p className="font-semibold text-slate-900">{currentTestimonial.name}</p>
                {currentTestimonial.role && (
                  <p className="text-sm text-slate-500">{currentTestimonial.role}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrev}
              className="h-10 w-10 rounded-full"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            {/* Dots */}
            <div className="flex gap-1.5">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentIndex ? 'w-6 bg-blue-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`Go to testimonial ${idx + 1}`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              className="h-10 w-10 rounded-full"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
