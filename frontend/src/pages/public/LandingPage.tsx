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
    <div className="min-h-screen">
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
    </div>
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
          <span>contact@singburiadventist.org</span>
        </a>
        <a
          href="tel:+66123456789"
          className="flex items-center gap-2 font-medium transition-all hover:scale-105 hover:text-blue-100"
        >
          <Phone className="h-4 w-4" />
          <span>+66 (0) 123-456-789</span>
        </a>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 px-4 py-24 text-white md:py-32">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.05),transparent)]"></div>

      <div className="relative z-10 mx-auto max-w-5xl text-center">
        <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
          Sing Buri Adventist Center
        </h1>
        <p className="mb-6 text-3xl font-light md:text-4xl">ศูนย์แอ็ดเวนตีสท์สิงห์บุรี</p>
        <p className="mb-10 text-xl leading-relaxed md:text-2xl">
          Welcome to our community of faith, hope, and love
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Button
            size="lg"
            variant="secondary"
            className="bg-white text-lg font-semibold text-blue-700 shadow-lg transition-all hover:bg-blue-50 hover:shadow-xl"
            onClick={() =>
              document.getElementById('worship-times')?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            <Clock className="mr-2 h-5 w-5" />
            Service Times
          </Button>
          <Button
            size="lg"
            className="border-2 border-white bg-transparent text-lg font-semibold text-white shadow-lg transition-all hover:bg-white hover:text-blue-700"
            onClick={() =>
              document.getElementById('location')?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            <MapPin className="mr-2 h-5 w-5" />
            Visit Us
          </Button>
        </div>
      </div>
    </section>
  );
}

function TaglineSection() {
  return (
    <section className="border-b-2 border-gray-100 bg-white px-4 py-12">
      <div className="mx-auto max-w-5xl text-center">
        <p className="text-2xl font-light text-gray-700 md:text-3xl">
          "Where <span className="font-semibold text-blue-600">faith</span>,{' '}
          <span className="font-semibold text-green-600">hope</span>, and{' '}
          <span className="font-semibold text-purple-600">love</span> come together"
        </p>
        <p className="mt-4 text-lg italic text-gray-500">
          Experience genuine community and spiritual growth in the heart of Sing Buri
        </p>
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
    <section className="bg-gray-50 px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900">Discover Our Community</h2>
          <p className="text-xl text-gray-600">A place where faith grows and love flourishes</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {infoCards.map((card, index) => (
            <Card
              key={index}
              className="group overflow-hidden border-none shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className={`bg-gradient-to-br ${card.color} p-6 text-white`}>
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                  <card.icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold">{card.title}</h3>
              </div>
              <CardContent className="p-6">
                <p className="text-base leading-relaxed text-gray-700">{card.description}</p>
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
          Whether you're seeking spiritual growth, community, or simply a place to belong, our doors
          are open. Join us this Sabbath and experience the warmth of our fellowship.
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
            <p className="text-lg text-gray-400">ศูนย์แอ็ดเวนตีสท์สิงห์บุรี</p>
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
                <p className="text-sm text-gray-400">10:30 AM - Divine Service</p>
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
                <span className="text-sm">Sing Buri Province, Thailand</span>
              </a>
              <a
                href="tel:+66123456789"
                className="flex items-center gap-2 rounded-lg bg-gray-800/50 p-3 transition-all hover:bg-gray-800"
              >
                <Phone className="h-4 w-4 text-blue-400" />
                <span className="text-sm">+66 (0) 123-456-789</span>
              </a>
              <a
                href="mailto:contact@singburiadventist.org"
                className="flex items-center gap-2 rounded-lg bg-gray-800/50 p-3 transition-all hover:bg-gray-800"
              >
                <Mail className="h-4 w-4 text-blue-400" />
                <span className="break-all text-sm">contact@singburiadventist.org</span>
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
