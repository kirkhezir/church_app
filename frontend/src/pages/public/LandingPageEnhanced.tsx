/**
 * Enhanced Landing Page Component
 *
 * Complete replication of https://www.sdawebguy.com/hopeful/
 * Modern church website design for Sing Buri Adventist Center
 */

import {
  MapPin,
  Mail,
  Phone,
  BookOpen,
  Users,
  ChevronRight,
  Menu,
  ChevronDown,
  Facebook,
  Twitter,
  Shield,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { Input } from '../../components/ui/input';

export function LandingPageEnhanced() {
  return (
    <div className="min-h-screen">
      {/* Top Announcement Bar */}
      <AnnouncementBar />

      {/* Navigation */}
      <Navigation />

      {/* Hero Section with Background Image */}
      <HeroSection />

      {/* Tagline Section */}
      <TaglineSection />

      {/* Feature Cards Section */}
      <FeatureCardsSection />

      {/* Upcoming Events Section */}
      <UpcomingEventsSection />

      {/* Quote Section */}
      <QuoteSection />

      {/* Latest Sermons Section */}
      <LatestSermonsSection />

      {/* Welcome / Pastor Section */}
      <WelcomeSection />

      {/* Newsletter Section */}
      <NewsletterSection />

      {/* Footer Section */}
      <FooterSection />
    </div>
  );
}

function AnnouncementBar() {
  return (
    <div className="bg-gray-700 px-4 py-2 text-center text-sm text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-2 md:gap-4">
        <a
          href="mailto:contact@singburiadventist.org"
          className="flex items-center gap-1 hover:text-gray-200"
        >
          <Mail className="h-4 w-4" />
          contact@singburiadventist.org
        </a>
        <span className="hidden md:inline">|</span>
        <a href="tel:+66123456789" className="flex items-center gap-1 hover:text-gray-200">
          <Phone className="h-4 w-4" />
          +66 (0) 123-456-789
        </a>
      </div>
    </div>
  );
}

function Navigation() {
  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Shield className="h-10 w-10 text-blue-600" />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900">Sing Buri</span>
              <span className="text-xs text-gray-600">Adventist Center</span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden items-center gap-6 md:flex">
            <a href="/" className="font-medium text-gray-900 hover:text-blue-600">
              Home
            </a>
            <div className="group relative">
              <button className="flex items-center gap-1 font-medium text-gray-700 hover:text-blue-600">
                About <ChevronDown className="h-4 w-4" />
              </button>
              <div className="absolute left-0 top-full hidden w-48 bg-white py-2 shadow-lg group-hover:block">
                <a href="#about-us" className="block px-4 py-2 hover:bg-gray-100">
                  About Us
                </a>
                <a href="#what-to-expect" className="block px-4 py-2 hover:bg-gray-100">
                  What To Expect
                </a>
                <a href="#beliefs" className="block px-4 py-2 hover:bg-gray-100">
                  Our Beliefs
                </a>
                <a href="#pastor" className="block px-4 py-2 hover:bg-gray-100">
                  Our Pastor
                </a>
              </div>
            </div>
            <div className="group relative">
              <button className="flex items-center gap-1 font-medium text-gray-700 hover:text-blue-600">
                Members <ChevronDown className="h-4 w-4" />
              </button>
              <div className="absolute left-0 top-full hidden w-48 bg-white py-2 shadow-lg group-hover:block">
                <a href="#children" className="block px-4 py-2 hover:bg-gray-100">
                  Children
                </a>
                <a href="#ministries" className="block px-4 py-2 hover:bg-gray-100">
                  Ministries
                </a>
                <a href="#resources" className="block px-4 py-2 hover:bg-gray-100">
                  Resources
                </a>
              </div>
            </div>
            <div className="group relative">
              <button className="flex items-center gap-1 font-medium text-gray-700 hover:text-blue-600">
                Community <ChevronDown className="h-4 w-4" />
              </button>
              <div className="absolute left-0 top-full hidden w-48 bg-white py-2 shadow-lg group-hover:block">
                <a href="#garden-of-prayer" className="block px-4 py-2 hover:bg-gray-100">
                  Garden of Prayer
                </a>
                <a href="#community-programs" className="block px-4 py-2 hover:bg-gray-100">
                  Community Programs
                </a>
              </div>
            </div>
            <a href="#events" className="font-medium text-gray-700 hover:text-blue-600">
              Events
            </a>
            <a href="#giving" className="font-medium text-gray-700 hover:text-blue-600">
              Giving
            </a>
            <a href="#contact" className="font-medium text-gray-700 hover:text-blue-600">
              Contact
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section
      className="relative px-4 py-32 text-white md:py-48"
      style={{
        backgroundImage:
          'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMzMzM3NWEiLz48L3N2Zz4=)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
          Sing Buri Adventist Center
        </h1>
        <p className="mb-3 text-2xl font-light md:text-3xl">ศูนย์แอ็ดเวนตีสท์สิงห์บุรี</p>
        <p className="text-lg leading-relaxed md:text-xl">
          Your vision / mission statement or slogan here
        </p>
      </div>
    </section>
  );
}

function TaglineSection() {
  return (
    <section className="bg-white px-4 py-16 md:py-20">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-3xl font-bold text-gray-900 md:text-4xl lg:text-5xl">
          Because <span className="text-blue-600">Google</span>{' '}
          <span className="text-purple-600">Yahoo</span>{' '}
          <span className="text-orange-600">Bing</span> <span className="text-red-600">Baidu</span>{' '}
          <span className="text-red-500">YouTube</span> doesn't have all the answers…
        </h2>
      </div>
    </section>
  );
}

function FeatureCardsSection() {
  const features = [
    {
      icon: Users,
      title: "I'm New",
      description:
        'We want to make you feel right at home from the minute you walk through our doors. You can expect to be warmly welcomed and to be a part of a worship service that is comfortable. And above all else, you can expect to hear the Word of God.',
      link: '#what-to-expect',
      bgColor: 'bg-amber-900',
      iconBg: 'bg-white/20',
    },
    {
      icon: Shield,
      title: 'Mission / Vision',
      description:
        'Church Mission and or Vision here: Libero id faucibus nisl. Rhoncus mattis rhoncus urna neque viverra justo nec. Orci porta non pulvinar neque. Donec et odio pellentesque diam volutpat commodo sed egestas egestas.',
      link: '#mission',
      bgColor: 'bg-orange-600',
      iconBg: 'bg-white/20',
    },
    {
      icon: BookOpen,
      title: 'Fundamental Beliefs',
      description:
        'Seventh-day Adventists accept the Bible as the only source of our beliefs. We consider our movement to be the result of the Protestant conviction Sola Scriptura—the Bible as the only standard of faith and practice for Christians.',
      link: '#beliefs',
      bgColor: 'bg-gray-500',
      iconBg: 'bg-white/20',
    },
    {
      icon: Users,
      title: 'Ministries',
      description:
        '{Church Name} Seventh-day Adventist Church has several departments, better known as Ministries. From Cradle role to Seniors Ministries, all are geared to nurture and grow our church and be of service to our community.',
      link: '#ministries',
      bgColor: 'bg-yellow-600',
      iconBg: 'bg-white/20',
    },
  ];

  return (
    <section className="bg-gray-50 px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <a
              key={index}
              href={feature.link}
              className={`${feature.bgColor} group block overflow-hidden rounded-lg p-8 text-white transition-transform hover:-translate-y-1 hover:shadow-xl`}
            >
              <div
                className={`mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full ${feature.iconBg}`}
              >
                <feature.icon className="h-8 w-8" />
              </div>
              <h3 className="mb-4 text-2xl font-bold">{feature.title}</h3>
              <p className="leading-relaxed opacity-90">{feature.description}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function UpcomingEventsSection() {
  return (
    <section className="bg-white px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900">Upcoming Events</h2>
        </div>

        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg bg-gray-100 p-8 text-center">
            <p className="text-lg text-gray-600">No Events</p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button size="lg" className="bg-amber-900 hover:bg-amber-800">
            Events Calendar
          </Button>
        </div>
      </div>
    </section>
  );
}

function QuoteSection() {
  return (
    <section className="bg-gray-700 px-4 py-12 text-white">
      <div className="mx-auto max-w-4xl text-center">
        <a
          href="https://www.biblegateway.com/passage/?search=Amos+5:24"
          target="_blank"
          rel="noopener noreferrer"
          className="text-2xl font-light hover:text-gray-200 md:text-3xl"
        >
          Amos 5:24
        </a>
      </div>
    </section>
  );
}

function LatestSermonsSection() {
  const sermons = [
    {
      title: 'Plagues, Pestilence & Prophecy',
      speaker: 'Pastor Doug Batchelor',
      date: 'March 19, 2020',
      scripture: '2 Chronicles 7:12-14',
      category: 'Sign of the Times',
    },
    {
      title: 'How to Live in the Last Days',
      speaker: 'Pastor Doug Batchelor',
      date: 'December 12, 2018',
      scripture: 'Acts 2:16-21',
      category: '',
    },
  ];

  return (
    <section className="bg-gray-50 px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900">Latest Sermons</h2>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {sermons.map((sermon, index) => (
            <Card key={index} className="overflow-hidden transition-shadow hover:shadow-xl">
              <div className="aspect-video bg-gradient-to-br from-gray-400 to-gray-600">
                {/* Placeholder for sermon image */}
              </div>
              <CardHeader>
                {sermon.category && (
                  <Badge variant="secondary" className="mb-2 w-fit">
                    {sermon.category}
                  </Badge>
                )}
                <CardTitle className="text-2xl">{sermon.title}</CardTitle>
                <CardDescription className="text-base">{sermon.date}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-700">
                    <span className="font-medium">Speaker:</span> {sermon.speaker}
                  </p>
                  <p className="flex items-center gap-2 text-gray-700">
                    <BookOpen className="h-4 w-4" />
                    <span className="font-medium">Scripture Reading:</span> {sermon.scripture}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button
            size="lg"
            variant="outline"
            className="border-amber-900 text-amber-900 hover:bg-amber-900 hover:text-white"
          >
            More Sermons
          </Button>
        </div>
      </div>
    </section>
  );
}

function WelcomeSection() {
  return (
    <section className="bg-gray-100 px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <h2 className="mb-6 text-4xl font-bold text-gray-900">Come Join Us!</h2>
            <p className="mb-4 text-lg leading-relaxed text-gray-700">
              {'{Church Name}'} Adventist Church is a church with a vision to reach and lead our
              community to Jesus Christ. We know that the love of Jesus is the greatest gift we
              could possibly share with anyone.
            </p>
            <p className="mb-6 text-lg leading-relaxed text-gray-700">
              We share God's love in various ways in our homes, local community, and throughout the
              world. We look forward to meeting you!
            </p>
            <p className="text-xl font-semibold text-gray-900">Pastor Ross Marlow</p>
          </div>
          <div className="order-1 md:order-2">
            <div className="aspect-square overflow-hidden rounded-lg bg-gradient-to-br from-gray-300 to-gray-400 shadow-xl">
              {/* Placeholder for pastor/family photo */}
              <div className="flex h-full items-center justify-center">
                <Users className="h-32 w-32 text-white opacity-50" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function NewsletterSection() {
  return (
    <section className="bg-amber-900 px-4 py-16 text-white">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="mb-4 text-3xl font-bold">Newsletter Subscription</h2>
        <p className="mb-8 text-lg">Find out what's happening at your local community church.</p>
        <form className="mx-auto flex max-w-md gap-2">
          <Input
            type="email"
            placeholder="Enter Email Address"
            className="bg-white text-gray-900"
          />
          <Button
            type="submit"
            variant="secondary"
            size="lg"
            className="bg-gray-700 hover:bg-gray-600"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </section>
  );
}

function FooterSection() {
  return (
    <footer className="bg-gray-900 px-4 py-12 text-gray-300">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Logo and Address */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Shield className="h-12 w-12 text-white" />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white">Sing Buri</span>
                <span className="text-sm">Seventh-day Adventist</span>
              </div>
            </div>
            <div className="mb-4 space-y-2 text-sm">
              <p className="flex items-start gap-2">
                <MapPin className="mt-1 h-4 w-4 flex-shrink-0" />
                <span>
                  7 Heavenly Street
                  <br />
                  Sing Buri Province
                  <br />
                  Thailand
                </span>
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 hover:bg-blue-600"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 hover:bg-blue-400"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Service Times */}
          <div>
            <h4 className="mb-4 text-lg font-semibold text-white">Regular Service Times</h4>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-white">Saturdays (Sabbaths)</p>
              <p>9:15 am – Sabbath School</p>
              <p>11:00 am – Divine Worship Service</p>
              <p>12:30 pm – Fellowship Lunch (3rd Saturday)</p>
              <p className="mt-3 font-medium text-white">Wednesdays</p>
              <p>7:00 pm – Prayer Meeting</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-lg font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#giving" className="transition-colors hover:text-white">
                  Online Giving
                </a>
              </li>
              <li>
                <a href="#prayer" className="transition-colors hover:text-white">
                  Prayer Requests
                </a>
              </li>
              <li>
                <a href="#bulletin" className="transition-colors hover:text-white">
                  Weekly Bulletin
                </a>
              </li>
            </ul>
            <div className="mt-4 space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <a href="tel:+66123456789" className="transition-colors hover:text-white">
                  +66 (0) 123-456-789
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a
                  href="mailto:contact@singburiadventist.org"
                  className="transition-colors hover:text-white"
                >
                  contact@singburiadventist.org
                </a>
              </p>
              <p>
                <a
                  href="https://singburiadventist.org"
                  className="transition-colors hover:text-white"
                >
                  www.singburiadventist.org
                </a>
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-gray-700" />

        <div className="text-center text-sm">
          <p className="mb-2">
            <a
              href="https://www.sdawebguy.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
            >
              Get a beautiful Adventist Church website from the SDA Web Guy.
            </a>
          </p>
          <p>
            © {new Date().getFullYear()} {'{Church Name}'} Seventh-day Adventist Church.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default LandingPageEnhanced;
