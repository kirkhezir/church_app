/**
 * Visit Us Section Component (Consolidated)
 *
 * Combines worship times and essential visitor info into one clean section.
 * Detailed visitor information moved to dedicated /visit page.
 *
 * Design Principles:
 * - Concise: Only essential info on landing page
 * - Action-oriented: Clear CTAs to next steps
 * - Mobile-first: Works great on all devices
 */

import { Link } from 'react-router-dom';
import { Clock, MapPin, Calendar, ChevronRight, Users, Heart } from 'lucide-react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';

// Calculate next Saturday date
function getNextSaturday(): string {
  const today = new Date();
  const daysUntilSaturday = (6 - today.getDay() + 7) % 7 || 7;
  const nextSaturday = new Date(today);

  // If it's Saturday and before 5 PM, use today
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
    time: '9:00 AM',
    description: 'Bible study for all ages',
    icon: Users,
  },
  {
    name: 'Divine Service',
    time: '11:00 AM',
    description: 'Main worship service',
    icon: Heart,
  },
  {
    name: 'AY Program',
    time: '2:30 PM',
    description: 'Adventist Youth',
    icon: Users,
  },
];

export function VisitUsSection() {
  const nextSaturday = getNextSaturday();

  return (
    <section
      id="visit"
      className="bg-gradient-to-b from-slate-50 to-white py-16 sm:py-20"
      aria-labelledby="visit-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="mb-3 inline-flex items-center rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700">
            <Calendar className="mr-2 h-4 w-4" />
            Join us this Sabbath
          </span>
          <h2 id="visit-heading" className="mb-3 text-3xl font-bold text-slate-900 sm:text-4xl">
            Visit Us
          </h2>
          <p className="text-lg text-slate-600">
            Everyone is welcome! Join our warm, friendly community for Sabbath worship.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Service Times Card */}
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <div className="flex items-center gap-3 text-white">
                <Clock className="h-5 w-5" />
                <div>
                  <h3 className="font-semibold">Sabbath Services</h3>
                  <p className="text-sm text-blue-100">{nextSaturday}</p>
                </div>
              </div>
            </div>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {services.map((service, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                        <service.icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{service.name}</p>
                        <p className="text-sm text-slate-500">{service.description}</p>
                      </div>
                    </div>
                    <span className="text-lg font-semibold text-blue-600">{service.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Location & First Visit Card */}
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
              <div className="flex items-center gap-3 text-white">
                <MapPin className="h-5 w-5" />
                <div>
                  <h3 className="font-semibold">Location</h3>
                  <p className="text-sm text-emerald-100">Bang Phutsa, Sing Buri</p>
                </div>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="mb-6 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
                    <span className="text-xs font-bold text-emerald-600">✓</span>
                  </div>
                  <p className="text-slate-600">Free parking available on-site</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
                    <span className="text-xs font-bold text-emerald-600">✓</span>
                  </div>
                  <p className="text-slate-600">Children&apos;s programs during service</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
                    <span className="text-xs font-bold text-emerald-600">✓</span>
                  </div>
                  <p className="text-slate-600">Come as you are — no dress code</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={() =>
                    window.open('https://maps.google.com/?q=Sing+Buri+Adventist+Center', '_blank')
                  }
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Get Directions
                </Button>
                <Link to="/visit" className="flex-1">
                  <Button variant="outline" className="w-full">
                    First Time?
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

export default VisitUsSection;
