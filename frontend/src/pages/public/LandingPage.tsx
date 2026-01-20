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
  Calendar,
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
  members: '30+',
  years: '10+',
  services: 'Weekly',
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
    <main className="min-h-screen bg-white">
      <OfflineIndicator />
      {/* Fixed container for announcement + navigation */}
      <div className="fixed inset-x-0 top-0 z-50">
        <AnnouncementBanner />
        <NavigationHeaderContent />
      </div>
      <HeroSection />
      <AboutSection />
      <WorshipTimesSection />

      <section id="events" className="relative">
        <UpcomingEventsSection />
      </section>

      <section id="gallery">
        <PhotoGallerySection />
      </section>

      <TestimonialsSection />

      <section id="ministries">
        <MinistryCardsSection />
      </section>

      <FAQSection />

      <section id="contact" className="bg-slate-50">
        <LocationMapSection />
        <ContactForm />
      </section>

      <CallToActionBanner />
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
// HERO SECTION - Clean, Impactful Design
// =============================================================================
function HeroSection() {
  const scrollToServices = () => {
    document.getElementById('worship-times')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-slate-900">
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
        <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-200 sm:text-xl md:text-2xl">
          A community of <span className="text-amber-300">faith</span>,{' '}
          <span className="text-emerald-300">hope</span>, and{' '}
          <span className="text-rose-300">love</span> — where everyone belongs.
        </p>

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

        {/* Stats */}
        <div className="mt-12 flex justify-center gap-8 sm:mt-16 sm:gap-16">
          {[
            { value: CHURCH_STATS.members, label: 'Members' },
            { value: CHURCH_STATS.services, label: 'Sabbath' },
            { value: CHURCH_STATS.years, label: 'Years' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-white sm:text-3xl">{stat.value}</p>
              <p className="text-sm text-slate-300">{stat.label}</p>
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
// ABOUT SECTION - Clean, Focused Design
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
    <section id="about" className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">
            Welcome to Our Church Family
          </h2>
          <p className="text-lg text-slate-600">
            We are a Seventh-day Adventist community dedicated to sharing God's love. Join us every
            Sabbath (Saturday) to worship, learn, and grow together.
          </p>
        </div>

        {/* Mission Quote */}
        <div className="mx-auto mt-12 max-w-3xl rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-center text-white shadow-xl sm:p-8">
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

        {/* Closing */}
        <p className="mt-12 text-center text-lg text-slate-600">
          Whether you're seeking spiritual growth or simply a place to belong —{' '}
          <span className="font-semibold text-blue-600">you're welcome here.</span>
        </p>
      </div>
    </section>
  );
}

// =============================================================================
// CALL TO ACTION BANNER - Simple, Effective
// =============================================================================
function CallToActionBanner() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-12 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <Calendar className="mx-auto mb-4 h-10 w-10 text-blue-200" />
        <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">Join Us This Sabbath</h2>
        <p className="mx-auto mb-6 max-w-xl text-blue-100">
          Experience the warmth of our fellowship. Our doors are open to everyone seeking spiritual
          growth, community, or a place to belong.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
          <Button
            size="lg"
            onClick={() =>
              document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
            }
            className="bg-white px-6 font-semibold text-blue-600 hover:bg-slate-100"
          >
            <Mail className="mr-2 h-5 w-5" />
            Get in Touch
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() =>
              document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
            }
            className="border-2 border-white/30 bg-transparent font-semibold text-white hover:bg-white hover:text-blue-600"
          >
            <MapPin className="mr-2 h-5 w-5" />
            Get Directions
          </Button>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// FOOTER - Clean, Organized
// =============================================================================
function FooterSection() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-4 flex items-center gap-3">
              <img src={CHURCH_LOGO} alt="" className="h-12 w-12 rounded-full object-contain" />
              <div>
                <p className="font-bold text-white">{CHURCH_NAME}</p>
              </div>
            </div>
            <p className="mb-4 text-sm text-slate-400">
              A community of faith sharing God's love in Sing Buri, Thailand.
            </p>
            <div className="flex gap-3">
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
