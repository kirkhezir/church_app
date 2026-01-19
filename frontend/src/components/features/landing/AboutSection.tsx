/**
 * About Section Component
 *
 * Consolidated section that combines:
 * - Church introduction
 * - Core values (simplified)
 * - What makes us unique
 *
 * Replaces: TaglineSection, QuickInfoSection, parts of MissionStatement
 */

import { Church, Users, Sparkles, HeartHandshake } from 'lucide-react';
import { Card, CardContent } from '../../ui/card';

const coreValues = [
  {
    icon: Church,
    title: 'Bible-Centered Worship',
    description: 'Grounded in Scripture with inspiring music, prayer, and meaningful sermons.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Users,
    title: 'Welcoming Community',
    description: 'A warm family where everyone belongs, no matter your background.',
    color: 'from-green-500 to-emerald-600',
  },
  {
    icon: HeartHandshake,
    title: 'Service to Others',
    description: 'Reaching out to our community with love, compassion, and practical help.',
    color: 'from-purple-500 to-pink-600',
  },
];

export function AboutSection() {
  return (
    <section id="about" className="bg-white px-4 py-20">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
            Welcome to Our Church Family
          </h2>
          <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-600">
            The Sing Buri Adventist Center is a community of faith dedicated to sharing the love of
            Christ. We gather every Sabbath (Saturday) to worship, learn, and grow together.
          </p>
        </div>

        {/* Mission Statement - Single Card */}
        <div className="mb-16">
          <Card className="overflow-hidden border-none shadow-2xl">
            <CardContent className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-8 text-white md:p-12">
              <div className="mx-auto max-w-3xl text-center">
                <Sparkles className="mx-auto mb-6 h-12 w-12 text-yellow-300" />
                <blockquote className="text-xl leading-relaxed md:text-2xl">
                  "Our mission is to share God's love through worship, fellowship, and service —
                  building a community where faith grows and hope flourishes."
                </blockquote>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Core Values - 3 Cards Only */}
        <div className="grid gap-8 md:grid-cols-3">
          {coreValues.map((value, index) => (
            <Card
              key={index}
              className="group overflow-hidden border-none shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <CardContent className="p-8">
                <div
                  className={`mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${value.color} text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}
                >
                  <value.icon className="h-8 w-8" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-gray-900">{value.title}</h3>
                <p className="leading-relaxed text-gray-600">{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Simple CTA */}
        <div className="mt-16 text-center">
          <p className="mb-4 text-lg text-gray-600">
            Whether you're seeking spiritual growth or simply a place to belong —
          </p>
          <p className="text-2xl font-bold text-blue-600">You're welcome here.</p>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
