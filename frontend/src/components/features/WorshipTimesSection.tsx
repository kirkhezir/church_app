/**
 * Worship Times Section Component - Enhanced
 *
 * Displays Sabbath worship service times for Sing Buri Adventist Center
 * with improved visual design and UX
 */

import { Clock, Users } from 'lucide-react';

const services = [
  {
    name: 'Sabbath School',
    time: '9:00 AM',
    timeValue: '09:00',
    description: 'Bible study and fellowship for all ages.',
    color: 'bg-blue-600',
  },
  {
    name: 'Divine Service',
    time: '11:00 AM',
    timeValue: '11:00',
    description: 'Worship with music, prayer, and biblical messages.',
    color: 'bg-indigo-600',
  },
  {
    name: 'AY Program',
    time: '2:30 PM',
    timeValue: '14:30',
    description: 'Youth activities and spiritual programs.',
    color: 'bg-purple-600',
  },
];

export function WorshipTimesSection() {
  return (
    <section
      id="worship-times"
      className="bg-slate-50 py-16 sm:py-24"
      aria-labelledby="worship-times-heading"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-10 text-center sm:mb-12">
          <h2
            id="worship-times-heading"
            className="mb-3 text-3xl font-bold text-slate-900 sm:text-4xl"
          >
            Worship Times
          </h2>
          <p className="text-lg text-slate-600">
            Join us every Sabbath (Saturday) for worship and fellowship
          </p>
        </div>

        {/* Service Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.name}
              className="rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6"
            >
              <div
                className={`mb-4 inline-flex items-center gap-2 rounded-lg ${service.color} px-3 py-1.5 text-sm font-medium text-white`}
              >
                <Clock className="h-4 w-4" />
                <time dateTime={service.timeValue}>{service.time}</time>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">{service.name}</h3>
              <p className="text-sm leading-relaxed text-slate-600">{service.description}</p>
            </div>
          ))}
        </div>

        {/* Welcome Message */}
        <div className="mt-8 flex items-center justify-center gap-3 rounded-lg bg-white p-5 text-center shadow-sm sm:mt-10">
          <Users className="h-6 w-6 flex-shrink-0 text-blue-600" />
          <p className="text-slate-700">
            <span className="font-medium">All are welcome!</span>
            <span className="hidden sm:inline"> First-time visitors, we'd love to meet you.</span>
          </p>
        </div>
      </div>
    </section>
  );
}

export default WorshipTimesSection;
