/**
 * Visit Page
 *
 * Dedicated page for first-time visitors with comprehensive information
 * about what to expect when visiting the church.
 */

import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  MapPin,
  Users,
  Baby,
  Shirt,
  Car,
  Heart,
  HeartHandshake,
  Calendar,
  Phone,
  Mail,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

// Calculate next Saturday date
function getNextSaturday(): string {
  const today = new Date();
  const daysUntilSaturday = (6 - today.getDay() + 7) % 7 || 7;
  const nextSaturday = new Date(today);

  if (today.getDay() === 6 && today.getHours() < 17) {
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }

  nextSaturday.setDate(today.getDate() + daysUntilSaturday);
  return nextSaturday.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

const services = [
  {
    name: 'Sabbath School',
    time: '9:00 - 10:30 AM',
    description:
      'Interactive Bible study classes for all ages. Adults, youth, and children have separate classes with age-appropriate discussions.',
  },
  {
    name: 'Divine Service',
    time: '11:00 AM - 12:30 PM',
    description:
      'Our main worship service featuring praise music, prayer, special music, and a Bible-based sermon.',
  },
  {
    name: 'AY Program',
    time: '2:30 - 4:00 PM',
    description:
      'Adventist Youth program with activities, discussions, and fellowship for young people and families.',
  },
];

const visitInfoSections = [
  {
    icon: Heart,
    title: 'What to Expect',
    items: [
      'Friendly greeters will welcome you at the door',
      'Contemporary and traditional worship music',
      'Relevant Bible teaching for daily life',
      'Service typically lasts about 90 minutes',
      'Communion celebrated on certain Sabbaths',
    ],
  },
  {
    icon: Baby,
    title: "Children's Programs",
    items: [
      'Sabbath School classes for ages 0-17',
      'Safe, supervised environments',
      'Age-appropriate Bible lessons and activities',
      'Dedicated nursery available',
      'All volunteers are background-checked',
    ],
  },
  {
    icon: Shirt,
    title: 'What to Wear',
    items: [
      'No dress code — come comfortable',
      'Many wear smart casual or traditional attire',
      'Thai traditional dress is always welcome',
      'Focus is on worship, not appearance',
    ],
  },
  {
    icon: Car,
    title: 'Parking & Accessibility',
    items: [
      'Ample free parking on church grounds',
      'Accessible parking spaces available',
      'Motorcycle parking area provided',
      'Easy to find from main road',
    ],
  },
  {
    icon: HeartHandshake,
    title: 'Connect With Us',
    items: [
      'Welcome desk with visitor information',
      'Meet our pastor and church family',
      'Receive a visitor welcome packet',
      'Learn about fellowship meals and small groups',
    ],
  },
];

export function VisitPage() {
  const nextSaturday = getNextSaturday();

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
          <Link
            to="/"
            className="mb-4 inline-flex items-center gap-2 text-blue-100 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold sm:text-4xl">Plan Your Visit</h1>
              <p className="mt-2 text-lg text-blue-100">
                Everything you need to know for a comfortable first visit
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3">
              <Calendar className="h-6 w-6" />
              <div>
                <p className="text-sm text-blue-100">Next Sabbath</p>
                <p className="font-semibold">{nextSaturday}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {/* Service Times */}
        <section className="mb-12">
          <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-slate-900">
            <Clock className="h-6 w-6 text-blue-600" />
            Service Times
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {services.map((service, index) => (
              <Card key={index} className="border-l-4 border-l-blue-600">
                <CardContent className="p-5">
                  <h3 className="text-lg font-semibold text-slate-900">{service.name}</h3>
                  <p className="mb-2 text-xl font-bold text-blue-600">{service.time}</p>
                  <p className="text-sm text-slate-600">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* What to Know */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">What to Know Before You Come</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visitInfoSections.map((section, index) => (
              <Card key={index} className="h-full">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                      <section.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900">{section.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {section.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Location & Contact */}
        <section className="mb-12">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Map Card */}
            <Card className="overflow-hidden">
              <div className="aspect-video bg-slate-200">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3869.1!2d100.4!3d15.1!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTXCsDA2JzAwLjAiTiAxMDDCsDI0JzAwLjAiRQ!5e0!3m2!1sen!2sth!4v1640000000000!5m2!1sen!2sth"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Church Location Map"
                />
              </div>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-slate-900">Sing Buri Adventist Center</p>
                    <p className="text-sm text-slate-600">Bang Phutsa, Sing Buri 16000, Thailand</p>
                  </div>
                </div>
                <Button
                  className="mt-4 w-full"
                  onClick={() =>
                    window.open('https://maps.google.com/?q=Sing+Buri+Adventist+Center', '_blank')
                  }
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Open in Google Maps
                </Button>
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 text-xl font-semibold text-slate-900">Questions?</h3>
                <p className="mb-6 text-slate-600">
                  We&apos;d love to hear from you! Feel free to reach out with any questions about
                  your visit.
                </p>

                <div className="space-y-4">
                  <a
                    href="tel:+6636123456"
                    className="flex items-center gap-4 rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                      <Phone className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Call Us</p>
                      <p className="text-sm text-slate-600">+66 36 123 456</p>
                    </div>
                  </a>

                  <a
                    href="mailto:info@singburi-adventist.org"
                    className="flex items-center gap-4 rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Email Us</p>
                      <p className="text-sm text-slate-600">info@singburi-adventist.org</p>
                    </div>
                  </a>

                  <Link
                    to="/#contact"
                    className="flex items-center gap-4 rounded-lg border border-slate-200 p-4 transition-colors hover:bg-slate-50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Contact Form</p>
                      <p className="text-sm text-slate-600">Send us a message online</p>
                    </div>
                    <ChevronRight className="ml-auto h-5 w-5 text-slate-400" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
            <CardContent className="p-8">
              <h2 className="mb-2 text-2xl font-bold">Ready to Visit?</h2>
              <p className="mb-6 text-blue-100">
                We can&apos;t wait to meet you! See you this Sabbath.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link to="/">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="bg-white text-blue-600 hover:bg-blue-50"
                  >
                    Back to Home
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 bg-transparent text-white hover:bg-white/10"
                  onClick={() =>
                    window.open('https://maps.google.com/?q=Sing+Buri+Adventist+Center', '_blank')
                  }
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Get Directions
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

export default VisitPage;
