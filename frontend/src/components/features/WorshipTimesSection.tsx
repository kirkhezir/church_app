/**
 * Worship Times Section Component - Enhanced
 *
 * Displays Sabbath worship service times for Sing Buri Adventist Center
 * with improved visual design, next date display, and Add to Calendar
 */

import { Clock, Users, CalendarPlus } from 'lucide-react';

// Calculate next Saturday date
function getNextSaturday(): string {
  const today = new Date();
  const daysUntilSaturday = (6 - today.getDay() + 7) % 7 || 7;
  const nextSaturday = new Date(today);

  // If it's Saturday and before 5 PM, use today
  if (today.getDay() === 6 && today.getHours() < 17) {
    return today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  nextSaturday.setDate(today.getDate() + daysUntilSaturday);
  return nextSaturday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Generate Google Calendar URL
function generateCalendarUrl(service: (typeof services)[0]): string {
  const today = new Date();
  const daysUntilSaturday = (6 - today.getDay() + 7) % 7;
  const nextSaturday = new Date(today);

  if (!(today.getDay() === 6 && today.getHours() < 17)) {
    nextSaturday.setDate(today.getDate() + (daysUntilSaturday || 7));
  }

  const [hours, minutes] = service.timeValue.split(':').map(Number);
  const startDate = new Date(nextSaturday);
  startDate.setHours(hours, minutes, 0, 0);

  const endDate = new Date(startDate);
  endDate.setHours(startDate.getHours() + service.duration);

  const formatForCalendar = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, '');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${service.name} - Sing Buri Adventist Center`,
    dates: `${formatForCalendar(startDate)}/${formatForCalendar(endDate)}`,
    details: service.description,
    location: 'Sing Buri Adventist Center, Bang Phutsa, Sing Buri 16000, Thailand',
    recur: 'RRULE:FREQ=WEEKLY;BYDAY=SA',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

const services = [
  {
    name: 'Sabbath School',
    time: '9:00 AM',
    timeValue: '09:00',
    description: 'Bible study and fellowship for all ages.',
    color: 'bg-blue-600',
    duration: 2,
  },
  {
    name: 'Divine Service',
    time: '11:00 AM',
    timeValue: '11:00',
    description: 'Worship with music, prayer, and biblical messages.',
    color: 'bg-indigo-600',
    duration: 1.5,
  },
  {
    name: 'AY Program',
    time: '2:30 PM',
    timeValue: '14:30',
    description: 'Youth activities and spiritual programs.',
    color: 'bg-purple-600',
    duration: 2,
  },
];

export function WorshipTimesSection() {
  const nextSaturday = getNextSaturday();

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
          {/* Next Service Date Badge */}
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
            <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
            Next: This Saturday, {nextSaturday}
          </div>
        </div>

        {/* Service Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.name}
              className="group rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6"
            >
              <div
                className={`mb-4 inline-flex items-center gap-2 rounded-lg ${service.color} px-3 py-1.5 text-sm font-medium text-white`}
              >
                <Clock className="h-4 w-4" />
                <time dateTime={service.timeValue}>{service.time}</time>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">{service.name}</h3>
              <p className="mb-4 text-sm leading-relaxed text-slate-600">{service.description}</p>

              {/* Add to Calendar */}
              <a
                href={generateCalendarUrl(service)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 opacity-0 transition-all hover:bg-blue-100 hover:text-blue-700 group-hover:opacity-100"
                aria-label={`Add ${service.name} to your calendar`}
              >
                <CalendarPlus className="h-3.5 w-3.5" />
                Add to Calendar
              </a>
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
