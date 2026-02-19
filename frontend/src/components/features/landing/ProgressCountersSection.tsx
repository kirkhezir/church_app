/**
 * Progress Counters Section Component
 *
 * Animated statistics showing church impact
 * Numbers animate when scrolled into view
 *
 * NOTE: Stats should be consistent with Hero section
 * Current values: 30+ members, 10+ years, 15+ baptisms, weekly services
 */

import { useEffect, useState, useRef } from 'react';
import { Users, Heart, Calendar, Clock } from 'lucide-react';

interface Stat {
  id: string;
  label: string;
  value: number;
  suffix?: string;
  displayValue?: string; // For non-numeric displays
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

// IMPORTANT: Keep these stats consistent with HeroSection
const stats: Stat[] = [
  {
    id: 'members',
    label: 'Church Family Members',
    value: 30,
    suffix: '+',
    icon: Users,
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'years',
    label: 'Years Serving Sing Buri',
    value: 10,
    suffix: '+',
    icon: Calendar,
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: 'baptisms',
    label: 'Lives Transformed',
    value: 15,
    suffix: '+',
    icon: Heart,
    color: 'from-pink-500 to-pink-600',
  },
  {
    id: 'services',
    label: 'Weekly Services',
    value: 3,
    suffix: '',
    icon: Clock,
    color: 'from-green-500 to-green-600',
  },
];

function useCountUp(target: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) {
      setCount(0);
      return;
    }

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [target, duration, start]);

  return count;
}

function AnimatedCounter({ stat, isVisible }: { stat: Stat; isVisible: boolean }) {
  const count = useCountUp(stat.value, 2000, isVisible);

  return (
    <div className="group text-center">
      <div
        className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}
      >
        <stat.icon className="h-10 w-10" />
      </div>
      <div className="mb-2 text-5xl font-bold text-foreground md:text-6xl">
        {count}
        {stat.suffix}
      </div>
      <div className="text-lg text-muted-foreground">{stat.label}</div>
    </div>
  );
}

export function ProgressCountersSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Only animate once
        }
      },
      {
        threshold: 0.3, // Trigger when 30% of section is visible
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 px-4 py-20 text-white"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.08),transparent_50%)]"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">Our Impact</h2>
          <p className="text-xl text-blue-100">Growing together in faith and service</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="rounded-2xl bg-white/10 p-8 backdrop-blur-sm transition-all duration-300 hover:bg-white/20"
            >
              <AnimatedCounter stat={stat} isVisible={isVisible} />
            </div>
          ))}
        </div>

        {/* Tagline */}
        <div className="mt-16 text-center">
          <p className="text-lg text-blue-100">
            "To the glory of God, we continue to grow in faith and numbers"
          </p>
        </div>
      </div>
    </section>
  );
}

export default ProgressCountersSection;
