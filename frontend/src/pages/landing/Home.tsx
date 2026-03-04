/**
 * Landing Page Component - Professional Church Design
 *
 * Public-facing landing page for Sing Buri Adventist Center
 *
 * DESIGN PRINCIPLES (Senior UI/UX Best Practices):
 * 1. Visual Hierarchy - Clear F-pattern reading flow
 * 2. Consistent Spacing - 8px grid system (py-16, py-24)
 * 3. Color Harmony - Limited palette with warm accents
 * 4. Mobile-First - Progressive enhancement
 * 5. Accessibility - WCAG 2.1 AA compliant
 * 6. Performance - Optimized images and lazy loading
 * 7. Clean Typography - System fonts with proper scale
 */

import { useState, useEffect, memo } from 'react';
import { MapPin, Clock, ArrowUp, ChevronDown, Heart, Users, BookOpen } from 'lucide-react';
import { Button } from '../../components/ui/button';

// Feature Components
import LocationMapSection from '../../components/features/LocationMapSection';
import { PWAInstallPrompt } from '../../components/features/pwa/PWAInstallPrompt';
import { OfflineIndicator } from '../../components/features/pwa/OfflineIndicator';

// Shared Navigation Header
import { PublicNavigationHeader } from '../../components/layout/PublicNavigationHeader';
import { PublicFooter } from '../../components/layout/PublicFooter';

// Landing Page Components — direct imports avoid barrel-import bundling overhead
import { AnnouncementBanner } from '../../components/features/landing/AnnouncementBanner';
import { TestimonialsSection } from '../../components/features/landing/TestimonialsSection';
import { FAQSection } from '../../components/features/landing/FAQSection';
import { UpcomingEventsSection } from '../../components/features/landing/UpcomingEventsSection';
import { MinistryCardsSection } from '../../components/features/landing/MinistryCardsSection';
import { PhotoGallerySection } from '../../components/features/landing/PhotoGallerySection';
import { NewsletterPopup } from '../../components/features/landing/NewsletterPopup';
import { PrayerGiveCTASection } from '../../components/features/landing/PrayerGiveCTASection';
import { LatestSermonSection } from '../../components/features/landing/LatestSermonSection';
import { VisitUsSection } from '../../components/features/landing/VisitUsSection';
import { useI18n } from '../../i18n';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { SEO, DEFAULT_SEO } from '../../components/common/SEO';
import { useScrollReveal } from '@/hooks/useScrollReveal';

// =============================================================================
// CONSTANTS
// =============================================================================
const CHURCH_LOGO = '/church-logo.png';

const CHURCH_STATS = {
  sabbaths: '500+',
  families: '15+',
  years: '10+',
} as const;

// =============================================================================
// MAIN LANDING PAGE
// =============================================================================
export function HomePage() {
  const { language } = useI18n();
  useDocumentTitle('Home', 'หน้าแรก', language);
  const revealRef = useScrollReveal<HTMLDivElement>();

  return (
    <main className="min-h-screen bg-background">
      {/* SEO Meta Tags */}
      <SEO {...DEFAULT_SEO.home} />

      {/* Skip to Content - Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none"
      >
        Skip to main content
      </a>
      <OfflineIndicator />
      {/* Shared Navigation Header (transparent mode for hero) */}
      <PublicNavigationHeader transparentHeader isHomePage topContent={<AnnouncementBanner />} />
      <HeroSection />

      {/* Scroll-reveal container for below-the-fold sections */}
      <div ref={revealRef}>
        <div className="reveal">
          <AboutSection />
        </div>

        {/* Visit Us - Consolidated worship times + location (replaces separate sections) */}
        <div className="reveal">
          <VisitUsSection />
        </div>

        {/* Social proof */}
        <div className="reveal">
          <TestimonialsSection />
        </div>

        <section id="events" className="reveal content-auto relative">
          <UpcomingEventsSection />
        </section>

        {/* Latest Sermon - Keep visitors engaged */}
        <div className="reveal">
          <LatestSermonSection />
        </div>

        <section id="ministries" className="reveal content-auto">
          <MinistryCardsSection />
        </section>

        <section id="gallery" className="reveal content-auto">
          <PhotoGallerySection />
        </section>

        {/* Prayer & Give - Lightweight CTAs linking to dedicated pages */}
        <div className="reveal">
          <PrayerGiveCTASection />
        </div>

        <div className="reveal">
          <FAQSection />
        </div>

        {/* Contact Section */}
        <section id="contact" className="reveal content-auto bg-muted">
          <LocationMapSection />
        </section>
      </div>

      <PublicFooter showNewsletter />
      <BackToTopButton />
      <PWAInstallPrompt />
      <NewsletterPopup delay={60000} scrollTrigger={80} />
    </main>
  );
}

// =============================================================================
// HERO SECTION - Clean, Impactful Design with Live Countdown
// =============================================================================
function HeroSection() {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0 });
  const { t } = useI18n();

  // Calculate next Sabbath (Saturday)
  useEffect(() => {
    const getNextSabbath = () => {
      const now = new Date();
      const daysUntilSaturday = (6 - now.getDay() + 7) % 7 || 7;
      const nextSabbath = new Date(now);
      nextSabbath.setDate(
        now.getDate() + (now.getDay() === 6 && now.getHours() < 17 ? 0 : daysUntilSaturday)
      );
      nextSabbath.setHours(9, 0, 0, 0); // 9 AM service
      return nextSabbath;
    };

    const updateCountdown = () => {
      const now = new Date();
      const target = getNextSabbath();
      const diff = target.getTime() - now.getTime();

      if (diff > 0) {
        setCountdown({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  const scrollToServices = () => {
    document.getElementById('visit')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="main-content"
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-slate-900"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1920&h=1080&fit=crop&q=80"
          alt=""
          role="presentation"
          className="h-full w-full object-cover"
          width={1920}
          height={1080}
          fetchPriority="high"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/75 via-blue-900/50 to-slate-900/85" />
      </div>

      {/* Decorative floating orbs */}
      <div className="absolute left-[10%] top-[20%] h-64 w-64 animate-float rounded-full bg-blue-500/10 blur-3xl" />
      <div
        className="absolute bottom-[15%] right-[10%] h-48 w-48 animate-float rounded-full bg-amber-500/10 blur-3xl"
        style={{ animationDelay: '2s' }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
        {/* Logo — refined with soft glow */}
        <div className="mb-6 sm:mb-8">
          <div className="mx-auto inline-block rounded-full bg-white/10 p-1 shadow-2xl backdrop-blur-sm">
            <img
              src={CHURCH_LOGO}
              alt={t('common.churchName')}
              width={128}
              height={128}
              className="h-24 w-24 rounded-full object-contain sm:h-28 sm:w-28"
            />
          </div>
        </div>

        {/* Heading — with gradient accent */}
        <h1 className="mb-4 text-balance text-3xl font-bold tracking-tight text-white drop-shadow-lg sm:text-4xl md:text-5xl lg:text-6xl">
          {t('common.churchName')}
        </h1>

        {/* Tagline */}
        <p className="mx-auto mb-6 max-w-2xl text-lg font-light text-slate-200/90 sm:text-xl md:text-2xl">
          {t('hero.tagline')
            .replace(/<faith>(.*?)<\/faith>/, '|||faith:$1|||')
            .replace(/<hope>(.*?)<\/hope>/, '|||hope:$1|||')
            .replace(/<love>(.*?)<\/love>/, '|||love:$1|||')
            .split('|||')
            .map((segment, i) => {
              if (segment.startsWith('faith:'))
                return (
                  <span key={i} className="font-semibold text-amber-300">
                    {segment.slice(6)}
                  </span>
                );
              if (segment.startsWith('hope:'))
                return (
                  <span key={i} className="font-semibold text-emerald-300">
                    {segment.slice(5)}
                  </span>
                );
              if (segment.startsWith('love:'))
                return (
                  <span key={i} className="font-semibold text-rose-300">
                    {segment.slice(5)}
                  </span>
                );
              return <span key={i}>{segment}</span>;
            })}
        </p>

        {/* Live Countdown — pill badge with glass effect */}
        <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.08] px-5 py-2.5 backdrop-blur-md">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </span>
          <span className="text-sm text-white/80">{t('hero.nextService')} </span>
          <div className="flex gap-1.5">
            {[
              { value: countdown.days, unit: 'd' },
              { value: countdown.hours, unit: 'h' },
              { value: countdown.minutes, unit: 'm' },
            ].map(({ value, unit }) => (
              <span
                key={unit}
                className="rounded-md bg-white/10 px-2 py-0.5 text-sm font-semibold tabular-nums text-amber-300"
              >
                {value}
                {unit}
              </span>
            ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
          <Button
            size="lg"
            onClick={scrollToServices}
            className="motion-safe:animate-glow bg-amber-500 px-6 py-3 text-base font-semibold text-slate-900 shadow-lg shadow-amber-500/20 [--glow-color:rgba(245,158,11,0.4)] hover:bg-amber-400 sm:px-8"
          >
            <Clock className="mr-2 h-5 w-5" />
            {t('hero.serviceTimes')}
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() =>
              document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
            }
            className="border-2 border-white/20 bg-white/[0.08] px-6 py-3 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white hover:text-slate-900 sm:px-8"
          >
            <MapPin className="mr-2 h-5 w-5" />
            {t('hero.visitUs')}
          </Button>
        </div>

        {/* Stats — larger with dividers */}
        <div className="mt-12 inline-flex items-center gap-0 divide-x divide-white/20 rounded-2xl border border-white/10 bg-white/[0.06] px-2 py-4 backdrop-blur-sm sm:mt-16 sm:px-4">
          {[
            { value: CHURCH_STATS.sabbaths, label: t('hero.stats.sabbaths') },
            { value: CHURCH_STATS.families, label: t('hero.stats.families') },
            { value: CHURCH_STATS.years, label: t('hero.stats.years') },
          ].map((stat) => (
            <div key={stat.label} className="px-5 text-center sm:px-8">
              <p className="text-2xl font-bold tabular-nums text-white sm:text-3xl md:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-300/80 sm:text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <button
        onClick={scrollToServices}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full p-2 text-white/50 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        aria-label="Scroll to content"
      >
        <ChevronDown className="h-8 w-8 motion-safe:animate-bounce" />
      </button>
    </section>
  );
}

// =============================================================================
// ABOUT SECTION - Clean, Focused Design with Pastor Welcome
// =============================================================================
const AboutSection = memo(function AboutSection() {
  const { t } = useI18n();
  const values = [
    {
      icon: BookOpen,
      title: t('about.values.bibleCentered.title'),
      description: t('about.values.bibleCentered.description'),
      gradient: 'from-blue-500 to-indigo-600',
      lightBg: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      icon: Users,
      title: t('about.values.welcoming.title'),
      description: t('about.values.welcoming.description'),
      gradient: 'from-emerald-500 to-teal-600',
      lightBg: 'bg-emerald-50 dark:bg-emerald-900/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      icon: Heart,
      title: t('about.values.caring.title'),
      description: t('about.values.caring.description'),
      gradient: 'from-rose-500 to-pink-600',
      lightBg: 'bg-rose-50 dark:bg-rose-900/20',
      iconColor: 'text-rose-600 dark:text-rose-400',
    },
  ];

  return (
    <section id="about" className="bg-background py-16 sm:py-24" aria-labelledby="about-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
            Our Community
          </p>
          <h2
            id="about-heading"
            className="mb-4 text-balance text-3xl font-bold text-foreground sm:text-4xl"
          >
            {t('about.title')}
          </h2>
          <p className="text-lg text-muted-foreground">{t('about.description')}</p>
        </div>

        {/* Pastor Welcome Card — elevated with warm treatment */}
        <div className="mx-auto mt-10 max-w-3xl">
          <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 shadow-md transition-shadow hover:shadow-lg sm:p-8">
            {/* Subtle gradient accent at top */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              {/* Pastor Avatar — gradient ring */}
              <div className="flex-shrink-0">
                <div className="rounded-full bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-500 p-[3px] shadow-lg">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-card text-2xl font-bold text-muted-foreground sm:h-24 sm:w-24 sm:text-3xl">
                    P
                  </div>
                </div>
              </div>
              <div className="text-center sm:text-left">
                <svg
                  className="mb-1 h-6 w-6 text-primary/30"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="italic leading-relaxed text-foreground/80">
                  {t('about.pastorWelcome')}
                </p>
                <div className="mt-3">
                  <p className="font-semibold text-foreground">{t('about.pastorTitle')}</p>
                  <p className="text-sm text-muted-foreground">Sing Buri Adventist Center</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mission Statement — distinctive gradient card */}
        <div className="mx-auto mt-10 max-w-3xl">
          <div className="animate-gradient relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-6 text-center text-white shadow-xl sm:p-8">
            {/* Decorative elements */}
            <div className="dot-pattern absolute inset-0 text-white opacity-[0.04]" />
            <div className="absolute -right-4 -top-4 h-24 w-24 animate-float rounded-full bg-white/[0.06]" />
            <div
              className="absolute -bottom-4 -left-4 h-16 w-16 animate-float rounded-full bg-white/[0.04]"
              style={{ animationDelay: '1.5s' }}
            />
            <blockquote className="relative text-lg italic leading-relaxed sm:text-xl">
              &ldquo;{t('about.mission')}&rdquo;
            </blockquote>
          </div>
        </div>

        {/* Values — cards with hover gradient effect */}
        <div className="mt-12 grid gap-6 sm:mt-16 sm:grid-cols-3 sm:gap-8">
          {values.map((value) => (
            <div
              key={value.title}
              className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Hover gradient overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${value.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-[0.04]`}
              />
              <div
                className={`relative mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${value.lightBg} ${value.iconColor} transition-transform duration-300 group-hover:scale-110`}
              >
                <value.icon className="h-7 w-7" />
              </div>
              <h3 className="relative mb-2 text-lg font-semibold text-foreground">{value.title}</h3>
              <p className="relative text-muted-foreground">{value.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-lg text-muted-foreground">{t('about.welcomeMessage')}</p>
          <a
            href="https://www.adventist.org/beliefs/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80 hover:underline"
          >
            <BookOpen className="h-4 w-4" />
            {t('about.learnBeliefs')}
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
});

// =============================================================================
// BACK TO TOP BUTTON
// =============================================================================
const BackToTopButton = memo(function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label="Back to top"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
});

export default HomePage;
