/**
 * Enhanced Landing Page Component
 *
 * Modern, comprehensive landing page for Sing Buri Adventist Center
 * Inspired by modern church website design with multiple sections
 */

import {
  Calendar,
  MapPin,
  Clock,
  Mail,
  Phone,
  BookOpen,
  Users,
  Heart,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { Input } from '../../components/ui/input';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../../components/ui/carousel';

export function LandingPageEnhanced() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Tagline Section */}
      <TaglineSection />

      {/* Feature Cards Section */}
      <FeatureCardsSection />

      {/* Upcoming Events Section */}
      <UpcomingEventsSection />

      {/* Latest Sermons Section */}
      <LatestSermonsSection />

      {/* Welcome / Pastor Section */}
      <WelcomeSection />

      {/* Newsletter Section */}
      <NewsletterSection />

      {/* Footer Section */}
      <FooterSection />
    </main>
  );
}

function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 px-4 py-24 text-white md:py-32">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative z-10 mx-auto max-w-5xl text-center">
        <h1 className="mb-4 text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
          Sing Buri Adventist Center
        </h1>
        <p className="mb-6 text-2xl font-light md:text-3xl">ศูนย์แอ็ดเวนตีสท์สิงห์บุรี</p>
        <p className="mb-8 text-xl leading-relaxed md:text-2xl">
          Welcome to our community of faith, hope, and love
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg" variant="secondary" className="text-lg">
            <Calendar className="mr-2 h-5 w-5" />
            View Events
          </Button>
          <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
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
    <section className="bg-gray-100 px-4 py-12">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-2xl font-semibold text-gray-800 md:text-3xl">
          Because Google, Yahoo, Bing, YouTube don't have all the answers…
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
        'We want to make you feel right at home from the minute you walk through our doors. You can expect to be warmly welcomed and to be a part of a worship service that is comfortable.',
      link: '#what-to-expect',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: Heart,
      title: 'Mission / Vision',
      description:
        'The Sing Buri Adventist Center is a community of faith dedicated to sharing the love of Christ and serving our local community through worship, fellowship, and spiritual growth.',
      link: '#mission',
      color: 'bg-green-50 text-green-600',
    },
    {
      icon: BookOpen,
      title: 'Fundamental Beliefs',
      description:
        'Seventh-day Adventists accept the Bible as the only source of our beliefs. We consider our movement to be the result of the Protestant conviction Sola Scriptura.',
      link: '#beliefs',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      icon: Users,
      title: 'Ministries',
      description:
        'Sing Buri Adventist Center has several ministries, all geared to nurture and grow our church and be of service to our community.',
      link: '#ministries',
      color: 'bg-orange-50 text-orange-600',
    },
  ];

  return (
    <section className="bg-white px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card key={index} className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <div
                  className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg ${feature.color}`}
                >
                  <feature.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
              <CardFooter>
                <Button variant="link" className="p-0">
                  Learn More <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function UpcomingEventsSection() {
  const events = [
    {
      title: 'Sabbath Worship Service',
      date: 'Every Saturday',
      time: '9:00 AM - 12:00 PM',
      description: 'Join us for Sabbath School and Divine Worship Service',
      category: 'Worship',
    },
    {
      title: 'Prayer Meeting',
      date: 'Every Wednesday',
      time: '7:00 PM',
      description: 'Mid-week prayer and Bible study',
      category: 'Prayer',
    },
    {
      title: 'Community Outreach',
      date: 'Last Saturday',
      time: '2:00 PM',
      description: 'Serving our community with love and compassion',
      category: 'Service',
    },
  ];

  return (
    <section className="bg-gray-50 px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900">Upcoming Events</h2>
          <p className="text-lg text-gray-600">Join us in worship, fellowship, and service</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event, index) => (
            <Card key={index} className="overflow-hidden transition-all hover:shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <Badge variant="secondary" className="mb-2 w-fit">
                  {event.category}
                </Badge>
                <CardTitle className="text-2xl">{event.title}</CardTitle>
                <CardDescription className="text-blue-100">
                  <div className="mt-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {event.date}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {event.time}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-600">{event.description}</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  More Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button size="lg">
            <Calendar className="mr-2 h-5 w-5" />
            View Full Calendar
          </Button>
        </div>
      </div>
    </section>
  );
}

function LatestSermonsSection() {
  const sermons = [
    {
      title: 'Walking in Faith',
      speaker: 'Pastor Johnson',
      date: 'November 9, 2025',
      scripture: 'Hebrews 11:1-6',
      duration: '42 min',
    },
    {
      title: 'The Power of Prayer',
      speaker: 'Pastor Johnson',
      date: 'November 2, 2025',
      scripture: 'James 5:16',
      duration: '38 min',
    },
    {
      title: 'Living with Purpose',
      speaker: 'Pastor Johnson',
      date: 'October 26, 2025',
      scripture: 'Jeremiah 29:11',
      duration: '45 min',
    },
    {
      title: "God's Amazing Grace",
      speaker: 'Pastor Johnson',
      date: 'October 19, 2025',
      scripture: 'Ephesians 2:8-9',
      duration: '40 min',
    },
  ];

  return (
    <section className="bg-white px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900">Latest Sermons</h2>
          <p className="text-lg text-gray-600">
            Listen to recent messages from our worship services
          </p>
        </div>

        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          className="mx-auto w-full max-w-6xl"
        >
          <CarouselContent>
            {sermons.map((sermon, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card className="h-full transition-shadow hover:shadow-lg">
                    <CardHeader className="bg-gradient-to-br from-purple-600 to-purple-700 text-white">
                      <Badge variant="secondary" className="mb-2 w-fit">
                        {sermon.duration}
                      </Badge>
                      <CardTitle className="text-xl">{sermon.title}</CardTitle>
                      <CardDescription className="text-purple-100">{sermon.date}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <p className="mb-2 text-sm font-medium text-gray-700">
                        Speaker: {sermon.speaker}
                      </p>
                      <p className="flex items-center gap-2 text-sm text-gray-600">
                        <BookOpen className="h-4 w-4" />
                        {sermon.scripture}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        Listen Now
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>

        <div className="mt-8 text-center">
          <Button size="lg" variant="outline">
            More Sermons
          </Button>
        </div>
      </div>
    </section>
  );
}

function WelcomeSection() {
  return (
    <section className="bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <h2 className="mb-6 text-4xl font-bold text-gray-900">Come Join Us!</h2>
            <p className="mb-4 text-lg leading-relaxed text-gray-700">
              Sing Buri Adventist Center is a church with a vision to reach and lead our community
              to Jesus Christ. We know that the love of Jesus is the greatest gift we could possibly
              share with anyone.
            </p>
            <p className="mb-6 text-lg leading-relaxed text-gray-700">
              We share God's love in various ways in our homes, local community, and throughout the
              world. We look forward to meeting you!
            </p>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-gray-900">Pastor Johnson</p>
              <p className="text-gray-600">Senior Pastor</p>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-200 shadow-xl">
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                <div className="text-center">
                  <Users className="mx-auto mb-4 h-24 w-24" />
                  <p className="text-xl font-semibold">Pastor's Photo</p>
                </div>
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
    <section className="bg-blue-700 px-4 py-16 text-white">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="mb-4 text-3xl font-bold">Newsletter Subscription</h2>
        <p className="mb-8 text-lg">Find out what's happening at your local community church</p>
        <form className="mx-auto flex max-w-md gap-2">
          <Input type="email" placeholder="Enter your email" className="bg-white text-gray-900" />
          <Button type="submit" variant="secondary" size="lg">
            Subscribe
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
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo and Address */}
          <div>
            <h3 className="mb-4 text-xl font-bold text-white">Sing Buri Adventist Center</h3>
            <p className="mb-4 text-sm">
              A community of faith dedicated to sharing the love of Christ
            </p>
            <div className="space-y-2 text-sm">
              <p className="flex items-start gap-2">
                <MapPin className="mt-1 h-4 w-4 flex-shrink-0" />
                <span>
                  Sing Buri Province
                  <br />
                  Thailand
                </span>
              </p>
            </div>
          </div>

          {/* Service Times */}
          <div>
            <h4 className="mb-4 text-lg font-semibold text-white">Regular Service Times</h4>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-white">Saturdays (Sabbaths)</p>
              <p>9:00 AM – Sabbath School</p>
              <p>10:30 AM – Divine Worship Service</p>
              <p className="mt-3 font-medium text-white">Wednesdays</p>
              <p>7:00 PM – Prayer Meeting</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-lg font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#about" className="transition-colors hover:text-white">
                  About Us
                </a>
              </li>
              <li>
                <a href="#beliefs" className="transition-colors hover:text-white">
                  Our Beliefs
                </a>
              </li>
              <li>
                <a href="#events" className="transition-colors hover:text-white">
                  Events Calendar
                </a>
              </li>
              <li>
                <a href="#sermons" className="transition-colors hover:text-white">
                  Sermons
                </a>
              </li>
              <li>
                <a href="#contact" className="transition-colors hover:text-white">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="mb-4 text-lg font-semibold text-white">Get In Touch</h4>
            <div className="space-y-3 text-sm">
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
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-gray-700" />

        <div className="text-center text-sm">
          <p>© {new Date().getFullYear()} Sing Buri Adventist Center. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default LandingPageEnhanced;
