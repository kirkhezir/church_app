/**
 * Ministry Cards Section Component
 *
 * Showcases different church ministries with
 * detailed cards and call-to-action buttons
 */

import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Users, Baby, Music, Heart, GraduationCap, HeartHandshake } from 'lucide-react';

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
    <section className="bg-gradient-to-br from-gray-50 to-white px-4 py-20">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
            <Heart className="h-4 w-4" />
            <span>Get Involved</span>
          </div>
          <h2 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">Our Ministries</h2>
          <p className="mx-auto max-w-2xl text-xl text-gray-600">
            Find your place to serve and grow with us
          </p>
        </div>

        {/* Ministry Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ministries.map((ministry) => (
            <Card
              key={ministry.id}
              className="group overflow-hidden border-none shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <CardContent className="p-0">
                {/* Header with Icon */}
                <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-white">
                  <div
                    className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl ${ministry.bgColor} transition-transform duration-300 group-hover:scale-110`}
                  >
                    <ministry.icon className={`h-7 w-7 ${ministry.color}`} />
                  </div>
                  <h3 className="text-2xl font-bold">{ministry.name}</h3>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="mb-4 text-gray-600">{ministry.description}</p>

                  {/* Activities List */}
                  <div className="mb-6">
                    <p className="mb-2 text-sm font-semibold text-gray-900">What We Do:</p>
                    <div className="flex flex-wrap gap-2">
                      {ministry.activities.map((activity, idx) => (
                        <span
                          key={idx}
                          className={`rounded-full ${ministry.bgColor} px-3 py-1 text-xs font-medium ${ministry.color}`}
                        >
                          {activity}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button
                    variant="outline"
                    className="w-full border-2 transition-all hover:bg-gray-900 hover:text-white"
                    onClick={() =>
                      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
                    }
                  >
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="mb-4 text-lg text-gray-600">
            Interested in joining a ministry or have questions?
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={() =>
              document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            Contact Us Today
          </Button>
        </div>
      </div>
    </section>
  );
}

export default MinistryCardsSection;
