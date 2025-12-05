/**
 * Landing Page Component - Enhanced
 *
 * Public-facing landing page for Sing Buri Adventist Center
 * Modern design with improved UX and visual appeal
 */

import {
  Calendar,
  MapPin,
  Mail,
  Phone,
  Clock,
  Heart,
  BookOpen,
  Users,
  ArrowUp,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import WorshipTimesSection from '../../components/features/WorshipTimesSection';
import LocationMapSection from '../../components/features/LocationMapSection';
import MissionStatementSection from '../../components/features/MissionStatementSection';
import ContactForm from '../../components/features/ContactForm';

export function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Top Contact Bar */}
      <TopContactBar />

      {/* Hero Section */}
      <HeroSection />

      {/* Tagline Section */}
      <TaglineSection />

      {/* Quick Info Cards */}
      <QuickInfoSection />

      {/* Worship Times */}
      <WorshipTimesSection />

      {/* Mission Statement */}
      <MissionStatementSection />

      {/* Location Map */}
      <LocationMapSection />

      {/* Call to Action */}
      <CallToActionSection />

      {/* Contact Form */}
      <ContactForm />

      {/* Footer */}
      <FooterSection />

      {/* Back to Top Button */}
      <BackToTopButton />
    </main>
  );
}

function BackToTopButton() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
      aria-label="Back to top"
    >
      <ArrowUp className="h-6 w-6" />
    </button>
  );
}

function TopContactBar() {
  return (
    <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 px-4 py-3 text-white shadow-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-4 text-sm md:justify-between">
        <a
          href="mailto:contact@singburiadventist.org"
          className="flex items-center gap-2 font-medium transition-all hover:scale-105 hover:text-blue-100"
        >
          <Mail className="h-4 w-4" />
          <span>singburiadventistcenter@gmail.com</span>
        </a>
        <a
          href="tel:+66876106926"
          className="flex items-center gap-2 font-medium transition-all hover:scale-105 hover:text-blue-100"
        >
          <Phone className="h-4 w-4" />
          <span>+66 (0) 876-106-926</span>
        </a>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 px-4 py-32 text-white md:py-44">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.15),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 animate-pulse bg-[linear-gradient(to_right,transparent_0%,rgba(255,255,255,0.05)_50%,transparent_100%)]"></div>
      </div>

      {/* Floating Shapes */}
      <div
        className="absolute left-10 top-20 h-20 w-20 animate-bounce rounded-full bg-white/10 blur-xl"
        style={{ animationDelay: '0s' }}
      ></div>
      <div
        className="absolute right-20 top-40 h-32 w-32 animate-pulse rounded-full bg-purple-400/20 blur-2xl"
        style={{ animationDelay: '1s' }}
      ></div>
      <div
        className="absolute bottom-20 left-1/4 h-24 w-24 animate-bounce rounded-full bg-blue-300/10 blur-xl"
        style={{ animationDelay: '0.5s' }}
      ></div>

      <div className="relative z-10 mx-auto max-w-6xl text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-400"></span>
          <span>Welcoming all seekers of faith</span>
        </div>

        {/* Main Heading with Gradient Text */}
        <h1 className="mb-6 text-5xl font-extrabold tracking-tight md:text-6xl lg:text-7xl xl:text-8xl">
          <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
            Sing Buri
          </span>
          <br />
          <span className="mt-2 inline-block">Adventist Center</span>
        </h1>

        {/* Tagline with Better Typography */}
        <p className="mx-auto mb-12 max-w-3xl text-xl font-light leading-relaxed md:text-2xl lg:text-3xl">
          Welcome to our community of <span className="font-semibold text-yellow-300">faith</span>,{' '}
          <span className="font-semibold text-green-300">hope</span>, and{' '}
          <span className="font-semibold text-pink-300">love</span>
        </p>

        {/* Enhanced CTA Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <Button
            size="lg"
            className="group relative overflow-hidden bg-white px-8 py-6 text-lg font-bold text-blue-700 shadow-2xl transition-all hover:scale-105 hover:shadow-white/25"
            onClick={() =>
              document.getElementById('worship-times')?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            <span className="relative z-10 flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Service Times
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 transition-opacity group-hover:opacity-100"></div>
          </Button>
          <Button
            size="lg"
            className="group border-2 border-white bg-transparent px-8 py-6 text-lg font-bold text-white shadow-2xl transition-all hover:scale-105 hover:bg-white hover:text-blue-700"
            onClick={() =>
              document.getElementById('location')?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            <MapPin className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
            Visit Us
          </Button>
        </div>

        {/* Stats Bar */}
        <div className="mt-16 grid grid-cols-3 gap-4 md:gap-8">
          <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-3xl font-bold md:text-4xl">15+</p>
            <p className="text-sm text-blue-100 md:text-base">Members</p>
          </div>
          <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-3xl font-bold md:text-4xl">Every Sabbath</p>
            <p className="text-sm text-blue-100 md:text-base">Worship Services</p>
          </div>
          <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-3xl font-bold md:text-4xl">10+</p>
            <p className="text-sm text-blue-100 md:text-base">Years Serving</p>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
        >
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}

function TaglineSection() {
  return (
    <section className="relative bg-gradient-to-b from-white to-gray-50 px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl lg:text-5xl">
            Where{' '}
            <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              faith
            </span>
            ,{' '}
            <span className="bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
              hope
            </span>
            , and{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              love
            </span>{' '}
            come together
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-xl text-gray-600">
            Experience genuine community and spiritual growth in the heart of Sing Buri
          </p>
        </div>

        {/* Value Proposition Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="group rounded-xl border-2 border-blue-100 bg-white p-6 text-center transition-all hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg transition-transform group-hover:scale-110">
              <Heart className="h-8 w-8" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-gray-900">All Are Welcome</h3>
            <p className="text-gray-600">No matter where you are in your faith journey</p>
          </div>

          <div className="group rounded-xl border-2 border-green-100 bg-white p-6 text-center transition-all hover:-translate-y-1 hover:border-green-300 hover:shadow-xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg transition-transform group-hover:scale-110">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-gray-900">Genuine Fellowship</h3>
            <p className="text-gray-600">Build lasting friendships and support</p>
          </div>

          <div className="group rounded-xl border-2 border-purple-100 bg-white p-6 text-center transition-all hover:-translate-y-1 hover:border-purple-300 hover:shadow-xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg transition-transform group-hover:scale-110">
              <BookOpen className="h-8 w-8" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-gray-900">Bible-Centered</h3>
            <p className="text-gray-600">Growing together in God&apos;s Word</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function QuickInfoSection() {
  const infoCards = [
    {
      icon: Users,
      title: 'New Here?',
      description:
        "You're warmly welcomed! Join us for worship this Sabbath and experience our friendly community.",
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Heart,
      title: 'Our Mission',
      description:
        "Sharing God's love through worship, fellowship, and service to our community in Sing Buri.",
      color: 'from-green-500 to-green-600',
    },
    {
      icon: BookOpen,
      title: 'Bible-Based',
      description:
        'We believe in Scripture as our foundation, following the teachings of Jesus Christ.',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: Calendar,
      title: 'Join Us Weekly',
      description:
        'Sabbath services every Saturday at 9:00 AM. All are welcome to worship with us!',
      color: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <section className="relative overflow-hidden bg-gray-50 px-4 py-20">
      {/* Background Pattern */}
      <div className="bg-grid-pattern absolute inset-0 opacity-5"></div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
            Discover Our Community
          </h2>
          <div className="mx-auto mb-4 h-1 w-24 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"></div>
          <p className="text-xl text-gray-600">A place where faith grows and love flourishes</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {infoCards.map((card, index) => (
            <Card
              key={index}
              className="group relative overflow-hidden border-none shadow-xl transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl"
            >
              {/* Gradient Background with Animation */}
              <div
                className={`relative bg-gradient-to-br ${card.color} p-8 text-white transition-all duration-300 group-hover:scale-105`}
              >
                <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/10"></div>
                <div className="relative z-10">
                  <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 shadow-lg backdrop-blur-sm transition-all duration-300 group-hover:rotate-6 group-hover:scale-110">
                    <card.icon className="h-10 w-10 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <h3 className="mb-2 text-2xl font-bold">{card.title}</h3>
                  <div className="h-1 w-12 rounded-full bg-white/50 transition-all duration-300 group-hover:w-20"></div>
                </div>
              </div>
              <CardContent className="bg-white p-6">
                <p className="text-base leading-relaxed text-gray-700">{card.description}</p>
                <div className="mt-4 flex items-center text-sm font-medium text-gray-400 transition-all group-hover:text-blue-600">
                  <span>Learn more</span>
                  <ArrowUp className="ml-1 h-4 w-4 rotate-90 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function CallToActionSection() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-blue-800 px-4 py-16 text-white">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="mb-6 text-4xl font-bold">Come Worship With Us</h2>
        <p className="mb-8 text-xl leading-relaxed">
          Whether you&apos;re seeking spiritual growth, community, or simply a place to belong, our
          doors are open. Join us this Sabbath and experience the warmth of our fellowship.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button
            size="lg"
            className="bg-white text-lg font-semibold text-blue-700 shadow-lg transition-all hover:bg-blue-50 hover:shadow-xl"
            onClick={() =>
              document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            <Mail className="mr-2 h-5 w-5" />
            Get in Touch
          </Button>
          <Button
            size="lg"
            className="border-2 border-white bg-transparent text-lg font-semibold text-white shadow-lg transition-all hover:bg-white hover:text-blue-700"
            onClick={() =>
              document.getElementById('location')?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            <MapPin className="mr-2 h-5 w-5" />
            Find Directions
          </Button>
        </div>
      </div>
    </section>
  );
}

function FooterSection() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4 py-12 text-gray-300">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* About */}
          <div>
            <h3 className="mb-4 text-2xl font-bold text-white">Sing Buri Adventist Center</h3>
            <p className="mb-4 leading-relaxed text-gray-400">
              A community of faith dedicated to sharing the love of Christ through worship,
              fellowship, and service.
            </p>
          </div>

          {/* Service Times */}
          <div>
            <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <Clock className="h-5 w-5 text-blue-400" />
              Service Times
            </h4>
            <div className="space-y-3">
              <div className="rounded-lg bg-gray-800/50 p-3">
                <p className="mb-1 font-medium text-white">Sabbath (Saturday)</p>
                <p className="text-sm text-gray-400">9:00 AM - Sabbath School</p>
                <p className="text-sm text-gray-400">11:00 AM - Divine Service</p>
                <p className="text-sm text-gray-400">2:30 PM - AY Service</p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-lg font-semibold text-white">Contact Us</h4>
            <div className="space-y-3">
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 rounded-lg bg-gray-800/50 p-3 transition-all hover:bg-gray-800"
              >
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-400" />
                <span className="text-sm">
                  Bang Phutsa, Mueang Sing Buri District, Sing Buri 16000
                </span>
              </a>
              <a
                href="tel:+66123456789"
                className="flex items-center gap-2 rounded-lg bg-gray-800/50 p-3 transition-all hover:bg-gray-800"
              >
                <Phone className="h-4 w-4 text-blue-400" />
                <span className="text-sm">+66 (0) 876-106-926</span>
              </a>
              <a
                href="mailto:contact@singburiadventist.org"
                className="flex items-center gap-2 rounded-lg bg-gray-800/50 p-3 transition-all hover:bg-gray-800"
              >
                <Mail className="h-4 w-4 text-blue-400" />
                <span className="break-all text-sm">singburiadventistcenter@gmail.com</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-700 pt-8">
          <div className="text-center">
            <p className="text-gray-400">
              © {new Date().getFullYear()} Sing Buri Adventist Center. All rights reserved.
            </p>
            <p className="mt-2 text-sm text-gray-500">Built with ❤️ for our community</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default LandingPage;
