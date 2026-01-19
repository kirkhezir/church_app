/**
 * Landing Page Component - Enhanced Church Design
 *
 * Public-facing landing page for Sing Buri Adventist Center
 *
 * DESIGN FEATURES:
 * - Church logo integration
 * - Warm, inviting color palette (golden accents for hope/faith)
 * - Photo gallery showcasing community
 * - Proper z-index management
 * - Mobile-first responsive design
 * - Accessibility focused
 */

import { useState, useEffect } from 'react';
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
  Sparkles,
  Heart,
  Facebook,
  Youtube,
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
  AboutSection,
} from '../../components/features/landing';

// =============================================================================
// CHURCH BRANDING - Logo path
// =============================================================================
const CHURCH_LOGO = '/church-logo.png';

// =============================================================================
// CONSISTENT CHURCH STATS - Update these in ONE place
// =============================================================================
const CHURCH_STATS = {
  members: '30+',
  years: '10+',
  services: 'Every Sabbath',
} as const;

// =============================================================================
// MAIN LANDING PAGE
// =============================================================================
export function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Utilities */}
      <OfflineIndicator />

      {/* Announcement Banner - only for important updates */}
      <AnnouncementBanner />

      {/* Sticky Navigation - z-index 100 */}
      <NavigationHeader />

      {/* Hero - First Impression */}
      <HeroSection />

      {/* About - Who We Are */}
      <AboutSection />

      {/* Service Times - When to Visit */}
      <WorshipTimesSection />

      {/* Events - What's Happening - z-index managed */}
      <section id="events" className="relative z-10">
        <UpcomingEventsSection />
      </section>

      {/* Photo Gallery - Community Life */}
      <section id="gallery">
        <PhotoGallerySection />
      </section>

      {/* Testimonials - Social Proof */}
      <TestimonialsSection />

      {/* Ministries - Get Involved */}
      <section id="ministries">
        <MinistryCardsSection />
      </section>

      {/* FAQ - Common Questions */}
      <FAQSection />

      {/* Location & Contact */}
      <LocationContactSection />

      {/* Call to Action Banner */}
      <CallToActionBanner />

      {/* Footer */}
      <FooterSection />

      {/* Floating Elements - highest z-index */}
      <BackToTopButton />
      <PWAInstallPrompt />

      {/* Newsletter - Only for returning visitors */}
      <NewsletterPopup delay={60000} scrollTrigger={80} />
    </main>
  );
}

// =============================================================================
// NAVIGATION HEADER - With Church Logo
// =============================================================================
const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Service Times', href: '#worship-times' },
  { label: 'Events', href: '#events' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Ministries', href: '#ministries' },
  { label: 'Contact', href: '#contact' },
];

function NavigationHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    element?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-[100] transition-all duration-300 ${
        isScrolled
          ? 'bg-white/98 shadow-lg backdrop-blur-md'
          : 'bg-gradient-to-b from-black/30 to-transparent'
      }`}
    >
      <nav className="mx-auto max-w-7xl px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Logo + Church Name */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 transition-transform hover:scale-105"
          >
            <img
              src={CHURCH_LOGO}
              alt="Sing Buri Adventist Center Logo"
              className={`h-12 w-12 rounded-full object-contain shadow-md transition-all ${
                isScrolled ? 'ring-2 ring-blue-100' : 'ring-2 ring-white/30'
              }`}
            />
            <div className="hidden flex-col sm:flex">
              <span
                className={`text-lg font-bold leading-tight ${
                  isScrolled ? 'text-gray-900' : 'text-white drop-shadow-md'
                }`}
              >
                Sing Buri Adventist
              </span>
              <span
                className={`text-xs font-medium ${
                  isScrolled ? 'text-blue-600' : 'text-yellow-300 drop-shadow-md'
                }`}
              >
                Center
              </span>
            </div>
          </button>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollToSection(link.href)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  isScrolled
                    ? 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                    : 'text-white/95 drop-shadow-sm hover:bg-white/15 hover:text-white'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden sm:block">
              <Button
                size="sm"
                className={`font-semibold shadow-lg transition-all hover:scale-105 ${
                  isScrolled
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                    : 'bg-white/95 text-blue-700 hover:bg-white'
                }`}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Member Login
              </Button>
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`rounded-lg p-2 lg:hidden ${
                isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/15'
              }`}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-4 shadow-xl lg:hidden">
          <div className="mb-4 flex items-center gap-3 border-b border-gray-100 pb-4">
            <img src={CHURCH_LOGO} alt="Logo" className="h-10 w-10 rounded-full object-contain" />
            <span className="font-bold text-gray-900">Sing Buri Adventist Center</span>
          </div>
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollToSection(link.href)}
              className="block w-full rounded-lg px-4 py-3 text-left font-medium text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600"
            >
              {link.label}
            </button>
          ))}
          <Link
            to="/login"
            className="mt-4 block w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-center font-semibold text-white shadow-lg"
          >
            Member Login
          </Link>
        </div>
      )}
    </header>
  );
}

// =============================================================================
// HERO SECTION - With Church Logo and Warm Design
// =============================================================================
function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1920&h=1080&fit=crop"
          alt="Church worship"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/85 via-indigo-900/80 to-purple-900/85" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_50%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 pt-20 text-center text-white">
        {/* Church Logo */}
        <div className="mb-8 animate-pulse">
          <img
            src={CHURCH_LOGO}
            alt="Sing Buri Adventist Center"
            className="mx-auto h-28 w-28 rounded-full border-4 border-white/30 object-contain shadow-2xl backdrop-blur-sm md:h-36 md:w-36"
          />
        </div>

        {/* Welcome Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2 backdrop-blur-sm">
          <Sparkles className="h-4 w-4 text-yellow-400" />
          <span className="text-sm font-medium">Welcome to our Church Family</span>
        </div>

        {/* Main Heading */}
        <h1 className="mb-6 text-4xl font-extrabold leading-tight md:text-5xl lg:text-6xl xl:text-7xl">
          Sing Buri
          <br />
          <span className="bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
            Adventist Center
          </span>
        </h1>

        {/* Tagline */}
        <p className="mb-10 max-w-2xl text-lg leading-relaxed text-blue-100 md:text-xl lg:text-2xl">
          A community of <span className="font-semibold text-yellow-300">faith</span>,{' '}
          <span className="font-semibold text-green-300">hope</span>, and{' '}
          <span className="font-semibold text-pink-300">love</span>
          <br className="hidden sm:block" />
          where everyone is welcome.
        </p>

        {/* Scripture */}
        <div className="mb-10 flex items-center gap-2 text-sm text-blue-200 md:text-base">
          <BookOpen className="h-4 w-4" />
          <em>"For where two or three gather in my name, there am I with them."</em>
          <span className="font-semibold">— Matthew 18:20</span>
        </div>

        {/* Primary CTAs */}
        <div className="flex flex-wrap justify-center gap-4">
          <Button
            size="lg"
            className="group bg-gradient-to-r from-yellow-400 to-amber-500 px-8 py-6 text-lg font-bold text-gray-900 shadow-xl transition-all hover:scale-105 hover:from-yellow-300 hover:to-amber-400 hover:shadow-2xl"
            onClick={() =>
              document.getElementById('worship-times')?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            <Clock className="mr-2 h-5 w-5 transition-transform group-hover:rotate-12" />
            Service Times
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-white/80 bg-white/10 px-8 py-6 text-lg font-bold text-white backdrop-blur-sm transition-all hover:scale-105 hover:bg-white hover:text-blue-900"
            onClick={() =>
              document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            <MapPin className="mr-2 h-5 w-5" />
            Visit Us
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-6 md:gap-12">
          <div className="text-center">
            <p className="text-3xl font-bold text-white md:text-4xl">{CHURCH_STATS.members}</p>
            <p className="text-sm text-blue-200">Members</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-white md:text-4xl">{CHURCH_STATS.services}</p>
            <p className="text-sm text-blue-200">Worship</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-white md:text-4xl">{CHURCH_STATS.years}</p>
            <p className="text-sm text-blue-200">Years</p>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="flex flex-col items-center text-white/70">
            <span className="mb-2 text-xs">Scroll to explore</span>
            <div className="h-8 w-5 rounded-full border-2 border-white/50">
              <div className="mx-auto mt-1 h-2 w-1 animate-pulse rounded-full bg-white/70" />
            </div>
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg viewBox="0 0 1440 120" fill="none" className="w-full">
          <path
            d="M0 120L48 108C96 96 192 72 288 60C384 48 480 48 576 54C672 60 768 72 864 78C960 84 1056 84 1152 78C1248 72 1344 60 1392 54L1440 48V120H0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}

// =============================================================================
// CALL TO ACTION BANNER
// =============================================================================
function CallToActionBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 px-4 py-16">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center text-white">
        <Heart className="mx-auto mb-6 h-12 w-12 text-pink-300" />
        <h2 className="mb-4 text-3xl font-bold md:text-4xl">Come Worship With Us This Sabbath</h2>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-blue-100">
          Whether you're seeking spiritual growth, community, or simply a place to belong, our doors
          are open. Experience the warmth of our fellowship.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button
            size="lg"
            className="bg-white px-8 py-6 text-lg font-bold text-blue-700 shadow-xl transition-all hover:scale-105 hover:bg-blue-50"
            onClick={() =>
              document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            <Mail className="mr-2 h-5 w-5" />
            Get in Touch
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-white bg-transparent px-8 py-6 text-lg font-bold text-white transition-all hover:scale-105 hover:bg-white hover:text-blue-700"
            onClick={() =>
              document.getElementById('location')?.scrollIntoView({ behavior: 'smooth' })
            }
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
// LOCATION + CONTACT
// =============================================================================
function LocationContactSection() {
  return (
    <section id="contact" className="bg-gray-50">
      <LocationMapSection />
      <ContactForm />
    </section>
  );
}

// =============================================================================
// FOOTER - With Logo and "Built with Love"
// =============================================================================
function FooterSection() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4 py-16 text-gray-300">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Logo & About */}
          <div className="md:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              <img
                src={CHURCH_LOGO}
                alt="Sing Buri Adventist Center"
                className="h-14 w-14 rounded-full border-2 border-blue-500/30 object-contain"
              />
              <div>
                <h3 className="text-xl font-bold text-white">Sing Buri Adventist Center</h3>
                <p className="text-sm text-blue-400">Seventh-day Adventist Church</p>
              </div>
            </div>
            <p className="mb-4 max-w-md text-sm leading-relaxed text-gray-400">
              A community of faith dedicated to sharing God's love through worship, fellowship, and
              service in Sing Buri, Thailand. All are welcome to join our family.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-gray-400 transition-all hover:bg-blue-600 hover:text-white"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-gray-400 transition-all hover:bg-red-600 hover:text-white"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Service Times */}
          <div>
            <h4 className="mb-4 flex items-center gap-2 font-semibold text-white">
              <Clock className="h-5 w-5 text-yellow-400" />
              Sabbath Services
            </h4>
            <div className="space-y-2 text-sm">
              <div className="rounded-lg bg-gray-800/50 px-3 py-2">
                <p className="font-medium text-white">9:00 AM</p>
                <p className="text-gray-400">Sabbath School</p>
              </div>
              <div className="rounded-lg bg-gray-800/50 px-3 py-2">
                <p className="font-medium text-white">11:00 AM</p>
                <p className="text-gray-400">Divine Service</p>
              </div>
              <div className="rounded-lg bg-gray-800/50 px-3 py-2">
                <p className="font-medium text-white">2:30 PM</p>
                <p className="text-gray-400">AY Program</p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Contact Us</h4>
            <div className="space-y-3 text-sm">
              <a
                href="tel:+66876106926"
                className="flex items-center gap-2 text-gray-400 transition-colors hover:text-white"
              >
                <Phone className="h-4 w-4 text-green-400" />
                +66 (0) 876-106-926
              </a>
              <a
                href="mailto:singburiadventistcenter@gmail.com"
                className="flex items-center gap-2 text-gray-400 transition-colors hover:text-white"
              >
                <Mail className="h-4 w-4 text-blue-400" />
                <span className="break-all text-xs">singburiadventistcenter@gmail.com</span>
              </a>
              <div className="flex items-start gap-2 text-gray-400">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
                <span>Bang Phutsa, Mueang Sing Buri, Sing Buri 16000, Thailand</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-gray-700 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-center text-sm md:flex-row">
            <p className="text-gray-500">
              © {new Date().getFullYear()} Sing Buri Adventist Center. All rights reserved.
            </p>
            <p className="flex items-center gap-1 text-gray-400">
              Built with <Heart className="h-4 w-4 fill-red-500 text-red-500" /> for our community
            </p>
          </div>
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
    const handleScroll = () => setIsVisible(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-[90] flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
      aria-label="Back to top"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}

export default LandingPage;
