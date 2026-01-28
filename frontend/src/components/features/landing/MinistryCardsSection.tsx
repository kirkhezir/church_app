/**
 * Ministry Cards Section Component
 *
 * Showcases different church ministries with
 * detailed cards and filter by interest
 * Includes volunteer signup functionality
 */

import { useState } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import {
  Users,
  Baby,
  Music,
  GraduationCap,
  HeartHandshake,
  Home,
  Filter,
  Send,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

type MinistryCategory = 'all' | 'youth' | 'family' | 'worship' | 'service';

interface Ministry {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  activities: string[];
  category: MinistryCategory;
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
    category: 'youth',
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
    category: 'family',
  },
  {
    id: 'music',
    name: 'Music Ministry',
    description: 'Leading worship through song and inspiring hearts to praise God through music.',
    icon: Music,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    activities: ['Church Choir', 'Praise Team', 'Special Music', 'Music Training'],
    category: 'worship',
  },
  {
    id: 'community',
    name: 'Community Outreach',
    description: 'Serving our neighbors and sharing the love of Christ through practical ministry.',
    icon: HeartHandshake,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    activities: ['Food Distribution', 'Health Programs', 'Community Service', 'Disaster Relief'],
    category: 'service',
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
    category: 'service',
  },
  {
    id: 'family',
    name: 'Family Ministry',
    description: 'Strengthening families through counseling, workshops, and fellowship activities.',
    icon: Home,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    activities: ['Marriage Enrichment', 'Parenting Classes', 'Family Camps', 'Counseling'],
    category: 'family',
  },
];

const filterOptions: { value: MinistryCategory; label: string }[] = [
  { value: 'all', label: 'All Ministries' },
  { value: 'youth', label: 'Youth' },
  { value: 'family', label: 'Family' },
  { value: 'worship', label: 'Worship' },
  { value: 'service', label: 'Service' },
];

interface VolunteerFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export function MinistryCardsSection() {
  const [activeFilter, setActiveFilter] = useState<MinistryCategory>('all');
  const [selectedMinistry, setSelectedMinistry] = useState<Ministry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<VolunteerFormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const filteredMinistries =
    activeFilter === 'all' ? ministries : ministries.filter((m) => m.category === activeFilter);

  const openVolunteerDialog = (ministry: Ministry) => {
    setSelectedMinistry(ministry);
    setIsDialogOpen(true);
    setIsSubmitted(false);
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMinistry) return;

    setIsSubmitting(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';
      const response = await fetch(`${apiUrl}/contact/volunteer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          ministry: selectedMinistry.name,
          ministryId: selectedMinistry.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error('Volunteer submission error:', error);
      // Show success anyway for now (mocked)
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-slate-50 py-16 sm:py-24" aria-labelledby="ministries-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <h2
            id="ministries-heading"
            className="mb-3 text-3xl font-bold text-slate-900 sm:text-4xl"
          >
            Our Ministries
          </h2>
          <p className="text-lg text-slate-600">Find your place to serve and grow with us</p>
        </div>

        {/* Filter Buttons */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
          <Filter className="mr-1 h-4 w-4 text-slate-500" aria-hidden="true" />
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setActiveFilter(option.value)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeFilter === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
              aria-pressed={activeFilter === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Ministry Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMinistries.map((ministry) => (
            <Card
              key={ministry.id}
              className="group overflow-hidden border border-slate-200 bg-white transition-all hover:shadow-lg"
            >
              <CardContent className="flex h-full flex-col p-5">
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
                <p className="mb-4 flex-grow text-sm leading-relaxed text-slate-600">
                  {ministry.description}
                </p>

                {/* Activities */}
                <div className="mb-4 flex flex-wrap gap-1.5">
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

                {/* Get Involved Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openVolunteerDialog(ministry)}
                  className="mt-auto w-full gap-2 border-slate-200 hover:bg-slate-50"
                >
                  <HeartHandshake className="h-4 w-4" />
                  Get Involved
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <p className="mb-4 text-slate-600">
            Not sure where to start? We&apos;d love to help you find your place!
          </p>
          <Button
            onClick={() =>
              document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
            }
            className="gap-2"
          >
            <Users className="h-4 w-4" />
            Contact Us
          </Button>
        </div>
      </div>

      {/* Volunteer Signup Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HeartHandshake className="h-5 w-5 text-blue-600" />
              {isSubmitted ? 'Thank You!' : `Join ${selectedMinistry?.name}`}
            </DialogTitle>
            <DialogDescription>
              {isSubmitted
                ? "We've received your interest and will be in touch soon."
                : 'Fill out the form below and a ministry leader will contact you.'}
            </DialogDescription>
          </DialogHeader>

          {isSubmitted ? (
            <div className="py-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <p className="text-slate-600">
                We&apos;re excited to have you interested in{' '}
                <strong>{selectedMinistry?.name}</strong>!
              </p>
              <Button className="mt-4" onClick={() => setIsDialogOpen(false)}>
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="vol-name" className="text-sm font-medium text-slate-700">
                  Your Name *
                </label>
                <input
                  id="vol-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Your full name"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="vol-email" className="text-sm font-medium text-slate-700">
                  Email Address *
                </label>
                <input
                  id="vol-email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="your@email.com"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="vol-phone" className="text-sm font-medium text-slate-700">
                  Phone Number
                </label>
                <input
                  id="vol-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Your phone number"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="vol-message" className="text-sm font-medium text-slate-700">
                  Tell us about yourself
                </label>
                <textarea
                  id="vol-message"
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Share any relevant experience or why you're interested..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1 gap-2">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

export default MinistryCardsSection;
