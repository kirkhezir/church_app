/**
 * Ministry Cards Section Component
 *
 * Showcases different church ministries with
 * detailed cards and call-to-action buttons
 */

import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Users, Baby, Music, GraduationCap, HeartHandshake } from 'lucide-react';

interface Ministry {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  activities: string[];
}

const ministries: Ministry[] = [
  {
    id: 'youth',
    name: 'Youth Ministry',
    description:
      'Empowering young people to grow in faith and become leaders in the church and community.',
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    activities: ['AY Programs', 'Youth Sabbath', 'Outreach Activities', 'Bible Quizzes'],
  },
  {
    id: 'children',
    name: "Children's Ministry",
    description:
      'Nurturing the faith of our youngest members through age-appropriate Bible lessons and activities.',
    icon: Baby,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    activities: ['Sabbath School', 'Vacation Bible School', 'Kids Choir', 'Story Time'],
  },
  {
    id: 'music',
    name: 'Music Ministry',
    description: 'Leading worship through song and inspiring hearts to praise God through music.',
    icon: Music,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    activities: ['Church Choir', 'Praise Team', 'Special Music', 'Music Training'],
  },
  {
    id: 'community',
    name: 'Community Outreach',
    description: 'Serving our neighbors and sharing the love of Christ through practical ministry.',
    icon: HeartHandshake,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    activities: ['Food Distribution', 'Health Programs', 'Community Service', 'Disaster Relief'],
  },
  {
    id: 'education',
    name: 'Education Ministry',
    description:
      'Deepening understanding of Scripture through structured Bible study and training.',
    icon: GraduationCap,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    activities: ['Bible Classes', 'Leadership Training', 'Seminars', 'Book Clubs'],
  },
  {
    id: 'family',
    name: 'Family Ministry',
    description: 'Strengthening families through counseling, workshops, and fellowship activities.',
    icon: HeartHandshake,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    activities: ['Marriage Enrichment', 'Parenting Classes', 'Family Camps', 'Counseling'],
  },
];

export function MinistryCardsSection() {
  return (
    <section className="bg-slate-50 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-3 text-3xl font-bold text-slate-900 sm:text-4xl">Our Ministries</h2>
          <p className="text-lg text-slate-600">Find your place to serve and grow with us</p>
        </div>

        {/* Ministry Cards Grid - 2 columns on tablet, 3 on desktop */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ministries.map((ministry) => (
            <Card
              key={ministry.id}
              className="group overflow-hidden border border-slate-200 bg-white transition-shadow hover:shadow-lg"
            >
              <CardContent className="p-5">
                {/* Icon + Title */}
                <div className="mb-3 flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-lg ${ministry.bgColor}`}
                  >
                    <ministry.icon className={`h-5 w-5 ${ministry.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{ministry.name}</h3>
                </div>

                {/* Description */}
                <p className="mb-4 text-sm leading-relaxed text-slate-600">
                  {ministry.description}
                </p>

                {/* Activities */}
                <div className="flex flex-wrap gap-1.5">
                  {ministry.activities.slice(0, 3).map((activity, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                    >
                      {activity}
                    </span>
                  ))}
                  {ministry.activities.length > 3 && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                      +{ministry.activities.length - 3}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 text-center">
          <p className="mb-4 text-slate-600">Interested in joining a ministry?</p>
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() =>
              document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            Contact Us
          </Button>
        </div>
      </div>
    </section>
  );
}

export default MinistryCardsSection;
