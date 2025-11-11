/**
 * Landing Page Component - Enhanced
 *
 * Public-facing landing page for Sing Buri Adventist Center
 * Modern design with improved UX and visual appeal
 */

import { Calendar, MapPin, Mail, Phone, Clock, Heart, BookOpen, Users } from 'lucide-react';
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
    </div>
  );
}

function TopContactBar() {
  return (
    <div className="bg-blue-700 px-4 py-2 text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-4 text-sm md:justify-between">
        <a
          href="mailto:contact@singburiadventist.org"
          className="flex items-center gap-2 transition-colors hover:text-blue-100"
        >
          <Mail className="h-4 w-4" />
          <span>contact@singburiadventist.org</span>
        </a>
        <a
          href="tel:+66123456789"
          className="flex items-center gap-2 transition-colors hover:text-blue-100"
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
            className="text-lg shadow-lg transition-shadow hover:shadow-xl"
            onClick={() =>
              document.getElementById('worship-times')?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            <Clock className="mr-2 h-5 w-5" />
            Service Times
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-white text-lg text-white shadow-lg transition-all hover:bg-white hover:text-blue-700"
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
          <p className="text-lg text-gray-600">A place where faith grows and love flourishes</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {infoCards.map((card, index) => (
            <Card
              key={index}
              className="group overflow-hidden border-none shadow-lg transition-all hover:-translate-y-2 hover:shadow-xl"
            >
              <div className={`bg-gradient-to-br ${card.color} p-6 text-white`}>
                <card.icon className="mb-4 h-12 w-12" />
                <h3 className="text-2xl font-bold">{card.title}</h3>
              </div>
              <CardContent className="p-6">
                <p className="leading-relaxed text-gray-700">{card.description}</p>
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
            variant="secondary"
            className="text-lg"
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
            className="border-2 border-white text-lg text-white hover:bg-white hover:text-blue-700"
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
    <footer className="bg-gray-900 px-4 py-12 text-gray-300">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* About */}
          <div>
            <h3 className="mb-4 text-xl font-bold text-white">Sing Buri Adventist Center</h3>
            <p className="mb-4 text-sm leading-relaxed">
              A community of faith dedicated to sharing the love of Christ through worship,
              fellowship, and service.
            </p>
            <p className="text-sm text-gray-400">ศูนย์แอ็ดเวนตีสท์สิงห์บุรี</p>
          </div>

          {/* Service Times */}
          <div>
            <h4 className="mb-4 text-lg font-semibold text-white">Service Times</h4>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="font-medium">Sabbath (Saturday)</span>
              </p>
              <p className="ml-6">9:00 AM - Sabbath School</p>
              <p className="ml-6">10:30 AM - Divine Service</p>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-lg font-semibold text-white">Contact Us</h4>
            <div className="space-y-3 text-sm">
              <p className="flex items-start gap-2">
                <MapPin className="mt-1 h-4 w-4 flex-shrink-0 text-blue-400" />
                <span>Sing Buri Province, Thailand</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-400" />
                <a href="tel:+66123456789" className="transition-colors hover:text-white">
                  +66 (0) 123-456-789
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-400" />
                <a
                  href="mailto:contact@singburiadventist.org"
                  className="transition-colors hover:text-white"
                >
                  contact@singburiadventist.org
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm">
          <p>© {new Date().getFullYear()} Sing Buri Adventist Center. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default LandingPage;
