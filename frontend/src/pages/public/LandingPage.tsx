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

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Mail,
  Phone,
  Clock,
  ArrowUp,
  Menu,
  X,
  LogIn,
  Heart,
  Facebook,
  Youtube,
  ChevronDown,
  Users,
  BookOpen,
} from 'lucide-react';
import { Button } from '../../components/ui/button';

// Feature Components
import WorshipTimesSection from '../../components/features/WorshipTimesSection';
import LocationMapSection from '../../components/features/LocationMapSection';
import ContactForm from '../../components/features/ContactForm';
import { PWAInstallPrompt } from '../../components/features/pwa/PWAInstallPrompt';
import { OfflineIndicator } from '../../components/features/pwa/OfflineIndicator';

// Landing Page Components
import {
  AnnouncementBanner,
  TestimonialsSection,
  FAQSection,
  UpcomingEventsSection,
  MinistryCardsSection,
  PhotoGallerySection,
  NewsletterPopup,
} from '../../components/features/landing';

// =============================================================================
// CONSTANTS
// =============================================================================
const CHURCH_LOGO = '/church-logo.png';
const CHURCH_NAME = 'Sing Buri Adventist Center';

const CHURCH_STATS = {
  sabbaths: '500+',
  families: '15+',
  years: '10+',
} as const;

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#worship-times' },
  { label: 'Events', href: '#events' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Ministries', href: '#ministries' },
  { label: 'Contact', href: '#contact' },
] as const;

// =============================================================================
// MAIN LANDING PAGE
// =============================================================================
export function LandingPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-900">
      {/* Skip to Content - Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white focus:outline-none"
      >
        Skip to main content
      </a>
      <OfflineIndicator />
      {/* Fixed container for announcement + navigation */}
      <div className="fixed inset-x-0 top-0 z-50">
        <AnnouncementBanner />
        <NavigationHeaderContent />
      </div>
      <HeroSection />
      <AboutSection />
      <WorshipTimesSection />

      {/* Social proof before asking for action */}
      <TestimonialsSection />

      <section id="events" className="relative">
        <UpcomingEventsSection />
      </section>

      <section id="ministries">
        <MinistryCardsSection />
      </section>

      <section id="gallery">
        <PhotoGallerySection />
      </section>

      <FAQSection />

      {/* First-Time Visitor CTA - strategic placement before contact */}
      <FirstTimeVisitorSection />

      <section id="contact" className="bg-white">
        <LocationMapSection />
        <ContactForm />
      </section>

      <FooterSection />
      <BackToTopButton />
      <PWAInstallPrompt />
      <NewsletterPopup delay={60000} scrollTrigger={80} />
    </main>
  );
}

// =============================================================================
// NAVIGATION HEADER - Clean, Professional Design
// =============================================================================
function NavigationHeaderContent() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = useCallback((href: string) => {
    const element = document.querySelector(href);
    if (element) {
      const offset = 80; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  }, []);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <header
      className={`transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 shadow-md backdrop-blur-lg'
          : 'bg-gradient-to-b from-black/50 to-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
          aria-label="Go to top"
        >
          <img
            src={CHURCH_LOGO}
            alt="Church Logo"
            className="h-9 w-9 rounded-full object-contain shadow-sm sm:h-10 sm:w-10"
          />
          <div className="hidden min-[420px]:block">
            <p
              className={`text-sm font-bold leading-tight sm:text-base ${
                isScrolled ? 'text-slate-900' : 'text-white'
              }`}
            >
              {CHURCH_NAME}
            </p>
          </div>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollToSection(link.href)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors lg:px-4 ${
                isScrolled
                  ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  : 'text-white/90 hover:bg-white/10 hover:text-white'
              }`}
            >
              {link.label}
            </button>
          ))}
          <Link to="/login" className="ml-2">
            <Button
              size="sm"
              className={`font-medium ${
                isScrolled
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-white text-blue-600 hover:bg-white/90'
              }`}
            >
              <LogIn className="mr-1.5 h-4 w-4" />
              Login
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`rounded-lg p-2 md:hidden ${
            isScrolled ? 'text-slate-700 hover:bg-slate-100' : 'text-white hover:bg-white/10'
          }`}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="bg-white px-4 pb-4 pt-2 shadow-lg">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollToSection(link.href)}
              className="block w-full rounded-lg px-4 py-3 text-left text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              {link.label}
            </button>
          ))}
          <Link
            to="/login"
            onClick={() => setIsMobileMenuOpen(false)}
            className="mt-3 block w-full rounded-lg bg-blue-600 py-3 text-center font-medium text-white"
          >
            Member Login
          </Link>
        </div>
      </div>
    </header>
  );
}

// =============================================================================
// HERO SECTION - Clean, Impactful Design with Live Countdown
// =============================================================================
function HeroSection() {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0 });

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
    document.getElementById('worship-times')?.scrollIntoView({ behavior: 'smooth' });
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
          className="h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/60 to-slate-900/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
        {/* Logo */}
        <div className="mb-6 sm:mb-8">
          <img
            src={CHURCH_LOGO}
            alt={CHURCH_NAME}
            className="mx-auto h-24 w-24 rounded-full border-4 border-white/20 object-contain shadow-2xl sm:h-32 sm:w-32"
          />
        </div>

        {/* Heading */}
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
          {CHURCH_NAME}
        </h1>

        {/* Tagline */}
        <p className="mx-auto mb-6 max-w-2xl text-lg text-slate-200 sm:text-xl md:text-2xl">
          A community of <span className="text-amber-300">faith</span>,{' '}
          <span className="text-emerald-300">hope</span>, and{' '}
          <span className="text-rose-300">love</span> — where everyone belongs.
        </p>

        {/* Live Countdown */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur-sm">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          <span className="text-white/90">
            Next service in{' '}
            <span className="font-semibold text-amber-300">
              {countdown.days}d {countdown.hours}h {countdown.minutes}m
            </span>
          </span>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
          <Button
            size="lg"
            onClick={scrollToServices}
            className="bg-amber-500 px-6 py-3 text-base font-semibold text-slate-900 hover:bg-amber-400 sm:px-8"
          >
            <Clock className="mr-2 h-5 w-5" />
            Service Times
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() =>
              document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
            }
            className="border-2 border-white/30 bg-white/10 px-6 py-3 text-base font-semibold text-white backdrop-blur-sm hover:bg-white hover:text-slate-900 sm:px-8"
          >
            <MapPin className="mr-2 h-5 w-5" />
            Visit Us
          </Button>
        </div>

        {/* Improved Stats */}
        <div className="mt-12 flex justify-center gap-6 sm:mt-16 sm:gap-12">
          {[
            { value: CHURCH_STATS.sabbaths, label: 'Sabbaths Celebrated' },
            { value: CHURCH_STATS.families, label: 'Families' },
            { value: CHURCH_STATS.years, label: 'Years of Ministry' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-white sm:text-3xl">{stat.value}</p>
              <p className="text-xs text-slate-300 sm:text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <button
        onClick={scrollToServices}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 transition-colors hover:text-white"
        aria-label="Scroll to content"
      >
        <ChevronDown className="h-8 w-8 animate-bounce" />
      </button>
    </section>
  );
}

// =============================================================================
// ABOUT SECTION - Clean, Focused Design with Pastor Welcome
// =============================================================================
function AboutSection() {
  const values = [
    {
      icon: BookOpen,
      title: 'Bible-Centered',
      description: 'Grounded in Scripture with meaningful teachings.',
      color: 'bg-blue-500',
    },
    {
      icon: Users,
      title: 'Welcoming',
      description: 'A warm family where everyone belongs.',
      color: 'bg-emerald-500',
    },
    {
      icon: Heart,
      title: 'Caring',
      description: 'Serving our community with love.',
      color: 'bg-rose-500',
    },
  ];

  return (
    <section id="about" className="bg-white py-16 sm:py-24" aria-labelledby="about-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="about-heading" className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">
            Welcome to Our Church Family
          </h2>
          <p className="text-lg text-slate-600">
            We are a Seventh-day Adventist community dedicated to sharing God's love. Join us every
            Sabbath (Saturday) to worship, learn, and grow together.
          </p>
        </div>

        {/* Pastor Welcome Card */}
        <div className="mx-auto mt-10 max-w-3xl">
          <div className="flex flex-col items-center gap-6 rounded-2xl bg-slate-50 p-6 sm:flex-row sm:p-8">
            {/* Pastor Avatar */}
            <div className="flex-shrink-0">
              <div className="h-24 w-24 overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-1">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-100 text-3xl font-bold text-slate-400">
                  P
                </div>
              </div>
            </div>
            {/* Welcome Message */}
            <div className="text-center sm:text-left">
              <p className="mb-2 italic text-slate-700">
                "We believe God has brought you here for a reason. Whether you're exploring faith or
                seeking a deeper relationship with Christ, our doors and hearts are open to you."
              </p>
              <p className="font-semibold text-slate-900">Pastor's Welcome</p>
              <p className="text-sm text-slate-500">Sing Buri Adventist Center</p>
            </div>
          </div>
        </div>

        {/* Mission Quote */}
        <div className="mx-auto mt-10 max-w-3xl rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-center text-white shadow-xl sm:p-8">
          <blockquote className="text-lg italic sm:text-xl">
            "Our mission is to share God's love through worship, fellowship, and service — building
            a community where faith grows and hope flourishes."
          </blockquote>
        </div>

        {/* Values */}
        <div className="mt-12 grid gap-6 sm:mt-16 sm:grid-cols-3 sm:gap-8">
          {values.map((value) => (
            <div
              key={value.title}
              className="rounded-xl bg-slate-50 p-6 text-center transition-shadow hover:shadow-lg"
            >
              <div
                className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${value.color} text-white`}
              >
                <value.icon className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">{value.title}</h3>
              <p className="text-slate-600">{value.description}</p>
            </div>
          ))}
        </div>

        {/* Closing with Beliefs Link */}
        <div className="mt-12 text-center">
          <p className="text-lg text-slate-600">
            Whether you're seeking spiritual growth or simply a place to belong —{' '}
            <span className="font-semibold text-blue-600">you're welcome here.</span>
          </p>
          <a
            href="https://www.adventist.org/beliefs/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            <BookOpen className="h-4 w-4" />
            Learn about our 28 Fundamental Beliefs
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// FIRST-TIME VISITOR SECTION - Targeted, Actionable
// =============================================================================
function FirstTimeVisitorSection() {
  return (
    <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Content */}
          <div className="text-center lg:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-blue-100">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              First Time? Welcome!
            </div>
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              Planning Your First Visit?
            </h2>
            <p className="mb-6 text-lg text-blue-100">
              We'd love to welcome you! Here's what to expect when you join us for Sabbath worship.
            </p>
            <ul className="mb-8 space-y-3 text-left">
              {[
                'Arrive 10-15 minutes early for parking',
                'Greeters will help you find your way',
                "Children's programs available during service",
                'Stay for fellowship lunch after service',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-blue-50">
                  <svg
                    className="mt-1 h-5 w-5 flex-shrink-0 text-emerald-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Button
                size="lg"
                onClick={() =>
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
                }
                className="bg-white px-6 font-semibold text-blue-700 shadow-lg hover:bg-blue-50"
              >
                <Mail className="mr-2 h-5 w-5" />
                Let Us Know You're Coming
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() =>
                  window.open(
                    'https://www.google.com/maps/dir/?api=1&destination=Singburi+Seventh+Day+Adventist+Center',
                    '_blank'
                  )
                }
                className="border-2 border-white/30 bg-white/10 font-semibold text-white backdrop-blur-sm hover:bg-white hover:text-blue-700"
              >
                <MapPin className="mr-2 h-5 w-5" />
                Get Directions
              </Button>
            </div>
          </div>

          {/* Visual - Service Schedule Card */}
          <div className="hidden lg:block">
            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                <Clock className="h-5 w-5 text-amber-300" />
                This Sabbath's Schedule
              </h3>
              <div className="space-y-4">
                {[
                  { time: '9:00 AM', event: 'Sabbath School', desc: 'Bible study for all ages' },
                  { time: '11:00 AM', event: 'Divine Service', desc: 'Main worship service' },
                  { time: '12:30 PM', event: 'Fellowship Lunch', desc: 'Join us for a meal' },
                  { time: '2:30 PM', event: 'AY Program', desc: 'Youth activities' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 rounded-lg bg-white/5 p-3">
                    <div className="text-sm font-bold text-amber-300">{item.time}</div>
                    <div>
                      <div className="font-medium text-white">{item.event}</div>
                      <div className="text-sm text-blue-200">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// FOOTER - Clean, Organized with Newsletter and SDA Badge
// =============================================================================
function FooterSection() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // In production, this would call an API
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300" role="contentinfo">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        {/* Newsletter Section */}
        <div className="mb-10 rounded-xl bg-slate-800/50 p-6 sm:p-8">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <div className="flex-1">
              <h3 className="mb-1 text-lg font-semibold text-white">Stay Connected</h3>
              <p className="text-sm text-slate-400">
                Subscribe for weekly updates, announcements, and spiritual encouragement.
              </p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="flex w-full max-w-sm gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                aria-label="Email address for newsletter"
              />
              <button
                type="submit"
                disabled={subscribed}
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-emerald-600"
              >
                {subscribed ? '✓ Subscribed!' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand with SDA Badge */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-4 flex items-center gap-3">
              <img src={CHURCH_LOGO} alt="" className="h-12 w-12 rounded-full object-contain" />
              <div>
                <p className="font-bold text-white">{CHURCH_NAME}</p>
              </div>
            </div>
            <p className="mb-3 text-sm text-slate-400">
              A community of faith sharing God's love in Sing Buri, Thailand.
            </p>
            {/* SDA Affiliation Badge */}
            <a
              href="https://www.adventist.org"
              target="_blank"
              rel="noopener noreferrer"
              className="mb-4 inline-flex items-center gap-2 rounded-md bg-slate-800 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:bg-slate-700"
            >
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Seventh-day Adventist Church
            </a>
            <div className="mt-3 flex gap-3">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-400 transition-colors hover:bg-blue-600 hover:text-white"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-400 transition-colors hover:bg-red-600 hover:text-white"
                aria-label="YouTube"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Service Times */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
              <Clock className="h-4 w-4 text-amber-400" />
              Sabbath Services
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span>Sabbath School</span>
                <span className="text-slate-400">9:00 AM</span>
              </li>
              <li className="flex justify-between">
                <span>Divine Service</span>
                <span className="text-slate-400">11:00 AM</span>
              </li>
              <li className="flex justify-between">
                <span>AY Program</span>
                <span className="text-slate-400">2:30 PM</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {NAV_LINKS.slice(0, 4).map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() =>
                      document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' })
                    }
                    className="text-slate-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
              <li>
                <a
                  href="https://www.adventist.org/beliefs/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  Our Beliefs
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 font-semibold text-white">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="tel:+66876106926"
                  className="flex items-center gap-2 text-slate-400 transition-colors hover:text-white"
                >
                  <Phone className="h-4 w-4 text-emerald-400" />
                  +66 876-106-926
                </a>
              </li>
              <li>
                <a
                  href="mailto:singburiadventistcenter@gmail.com"
                  className="flex items-start gap-2 text-slate-400 transition-colors hover:text-white"
                >
                  <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-400" />
                  <span className="break-all">singburiadventistcenter@gmail.com</span>
                </a>
              </li>
              <li className="flex items-start gap-2 text-slate-400">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-400" />
                <span>Bang Phutsa, Sing Buri 16000, Thailand</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 text-sm sm:flex-row">
          <p className="text-slate-500">
            © {currentYear} {CHURCH_NAME}. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5 text-slate-400">
            Built with <Heart className="h-4 w-4 fill-rose-500 text-rose-500" /> for our community
          </p>
        </div>
      </div>
    </footer>
  );
}

// =============================================================================
// BACK TO TOP BUTTON
// =============================================================================
function BackToTopButton() {
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
      className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      aria-label="Back to top"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}

export default LandingPage;
