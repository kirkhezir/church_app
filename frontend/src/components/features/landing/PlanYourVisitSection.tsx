/**
 * Plan Your Visit Section Component
 *
 * Dedicated section for first-time visitors with practical information
 * about what to expect when visiting the church
 *
 * UI/UX Best Practices:
 * - Reduces anxiety for first-time visitors
 * - Clear, actionable information
 * - Welcoming tone
 * - Mobile responsive
 */

import { useState } from 'react';
import {
  MapPin,
  Clock,
  Users,
  Baby,
  Shirt,
  Car,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Heart,
  HeartHandshake,
} from 'lucide-react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';

interface VisitInfo {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  details?: string[];
}

const visitInfoItems: VisitInfo[] = [
  {
    id: 'expect',
    icon: Heart,
    title: 'What to Expect',
    description:
      'A warm welcome awaits you! Our services include worship music, prayer, and a Bible-based message.',
    details: [
      'Friendly greeters will welcome you at the door',
      'Contemporary and traditional worship music',
      'Relevant Bible teaching for daily life',
      'Service typically lasts about 2 hours',
      'Communion celebrated on certain Sabbaths',
    ],
  },
  {
    id: 'children',
    icon: Baby,
    title: "Children's Programs",
    description: 'We have dedicated programs for children of all ages during our Sabbath services.',
    details: [
      'Sabbath School classes for ages 0-17',
      'Safe, supervised environments',
      'Age-appropriate Bible lessons and activities',
      'Dedicated nursery available',
      'All volunteers are background-checked',
    ],
  },
  {
    id: 'dress',
    icon: Shirt,
    title: 'What to Wear',
    description: 'Come as you are! We have a mix of casual and semi-formal attire.',
    details: [
      'No dress code - come comfortable',
      'Many wear smart casual or traditional attire',
      'Thai traditional dress is always welcome',
      'Focus is on worship, not appearance',
    ],
  },
  {
    id: 'parking',
    icon: Car,
    title: 'Parking & Location',
    description: 'Free parking available on-site. We are located in Bang Phutsa, Sing Buri.',
    details: [
      'Ample free parking on church grounds',
      'Accessible parking spaces available',
      'Motorcyle parking area provided',
      'Easy to find from main road',
    ],
  },
  {
    id: 'connect',
    icon: HeartHandshake,
    title: 'Connect With Us',
    description: "We'd love to meet you! Stop by our welcome desk after service.",
    details: [
      'Welcome desk with visitor information',
      'Meet our pastor and church family',
      'Receive a visitor welcome packet',
      'Learn about fellowship meals and groups',
    ],
  },
];

const serviceTimes = [
  { name: 'Sabbath School', time: '9:00 AM', description: 'Bible study classes for all ages' },
  { name: 'Divine Service', time: '11:00 AM', description: 'Main worship service' },
  { name: 'AY Program', time: '2:30 PM', description: 'Adventist Youth program' },
];

export function PlanYourVisitSection() {
  const [expandedId, setExpandedId] = useState<string | null>('expect');

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="plan-visit"
      className="bg-gradient-to-b from-blue-50 to-white py-16 sm:py-24"
      aria-labelledby="plan-visit-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="mb-3 inline-block rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-primary">
            First Time? Welcome!
          </span>
          <h2
            id="plan-visit-heading"
            className="mb-4 text-balance text-3xl font-bold text-foreground sm:text-4xl"
          >
            Plan Your Visit
          </h2>
          <p className="text-lg text-muted-foreground">
            We&apos;re excited to meet you! Here&apos;s everything you need to know for a
            comfortable first visit.
          </p>
        </div>

        {/* Service Times Quick Reference */}
        <div className="mb-12 grid gap-4 sm:grid-cols-3">
          {serviceTimes.map((service) => (
            <Card key={service.name} className="border-2 border-blue-100 bg-white">
              <CardContent className="p-4 text-center">
                <div className="mb-2 flex items-center justify-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-lg font-bold text-primary">{service.time}</span>
                </div>
                <h3 className="font-semibold text-foreground">{service.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Visit Information Accordion */}
        <div className="mx-auto max-w-3xl space-y-3">
          {visitInfoItems.map((item) => (
            <Card
              key={item.id}
              className={`overflow-hidden transition-shadow duration-200 ${
                expandedId === item.id ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <button
                onClick={() => toggleExpand(item.id)}
                className="flex w-full items-center justify-between p-4 text-left hover:bg-muted"
                aria-expanded={expandedId === item.id}
                aria-controls={`content-${item.id}`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                {expandedId === item.id ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </button>

              {/* Expanded Content */}
              <div
                id={`content-${item.id}`}
                className={`overflow-hidden transition-[max-height] duration-300 ${
                  expandedId === item.id ? 'max-h-96' : 'max-h-0'
                }`}
              >
                {item.details && (
                  <div className="border-t border-border bg-muted p-4">
                    <ul className="space-y-2">
                      {item.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
                          <span className="text-foreground/80">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Location Quick Info & CTA */}
        <div className="mx-auto mt-12 max-w-3xl">
          <Card className="overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20">
                    <MapPin className="h-7 w-7 text-white" />
                  </div>
                  <div className="text-white">
                    <h3 className="text-lg font-semibold">We&apos;ll Save You a Seat!</h3>
                    <p className="text-blue-100">Bang Phutsa, Sing Buri 16000, Thailand</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    onClick={scrollToContact}
                    variant="secondary"
                    size="lg"
                    className="bg-white text-primary hover:bg-accent"
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    Get Directions
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white/30 bg-transparent text-white hover:bg-white/10"
                    onClick={() => {
                      const contactSection = document.getElementById('contact');
                      if (contactSection) {
                        contactSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Contact Us
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

export default PlanYourVisitSection;
