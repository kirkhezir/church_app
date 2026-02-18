/**
 * Events Page
 *
 * Calendar view of church events with filtering, past events archive, and registration
 */

import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
  Filter,
  Grid,
  List,
  CalendarDays,
  Tag,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PublicLayout } from '@/layouts';
import { useI18n } from '@/i18n';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { eventsData, eventCategories as categories } from '@/data/events';

type ViewMode = 'grid' | 'list' | 'calendar';

export function EventsPage() {
  const { language } = useI18n();
  useDocumentTitle('Events', 'กิจกรรม', language);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const filteredEvents = useMemo(() => {
    return eventsData
      .filter((event) => selectedCategory === 'all' || event.category === selectedCategory)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [selectedCategory]);

  const featuredEvents = useMemo(() => {
    return eventsData.filter((e) => e.featured);
  }, []);

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const getEventsForDate = (date: string) => {
    return eventsData.filter((e) => e.date === date);
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentMonth);

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 pb-12 pt-24">
        <div className="mx-auto max-w-6xl px-4 text-center text-white sm:px-6">
          <Calendar className="mx-auto mb-4 h-12 w-12 text-emerald-300" />
          <h1 className="mb-4 text-4xl font-bold sm:text-5xl">
            {language === 'th' ? 'กิจกรรมและปฏิทิน' : 'Events & Calendar'}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-emerald-100">
            {language === 'th'
              ? 'ดูกิจกรรมและโปรแกรมที่กำลังจะมาถึงของเรา'
              : 'View our upcoming events and programs'}
          </p>
        </div>
      </section>

      {/* Featured Events Carousel */}
      {featuredEvents.length > 0 && (
        <div className="bg-slate-50 py-8">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              {language === 'th' ? 'กิจกรรมเด่น' : 'Featured Events'}
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {featuredEvents.map((event) => (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="group min-w-[300px] overflow-hidden rounded-xl bg-white shadow-md transition-shadow hover:shadow-xl"
                >
                  <div className="relative h-40">
                    <img
                      src={event.image}
                      alt={language === 'th' ? event.titleThai : event.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute left-3 top-3 rounded-full bg-amber-500 px-3 py-1 text-xs font-medium text-white">
                      {language === 'th' ? 'เด่น' : 'Featured'}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900 group-hover:text-emerald-600">
                      {language === 'th' ? event.titleThai : event.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      <Calendar className="mr-1 inline h-3 w-3" />
                      {new Date(event.date).toLocaleDateString(
                        language === 'th' ? 'th-TH' : 'en-US',
                        { weekday: 'short', month: 'short', day: 'numeric' }
                      )}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="sticky top-16 z-40 border-b bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Category Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`cursor-pointer rounded-full px-3 py-1 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1 ${
                    selectedCategory === cat.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {language === 'th' ? cat.nameThai : cat.name}
                </button>
              ))}
            </div>

            {/* View Toggle */}
            <div
              className="flex items-center gap-1 rounded-lg bg-slate-100 p-1"
              role="tablist"
              aria-label={language === 'th' ? 'เปลี่ยนมุมมอง' : 'Change view'}
            >
              <button
                onClick={() => setViewMode('grid')}
                className={`cursor-pointer rounded p-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
                aria-label={language === 'th' ? 'มุมมองกริด' : 'Grid View'}
                role="tab"
                aria-selected={viewMode === 'grid'}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`cursor-pointer rounded p-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
                aria-label={language === 'th' ? 'มุมมองรายการ' : 'List View'}
                role="tab"
                aria-selected={viewMode === 'list'}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`cursor-pointer rounded p-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 ${viewMode === 'calendar' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
                aria-label={language === 'th' ? 'มุมมองปฏิทิน' : 'Calendar View'}
                role="tab"
                aria-selected={viewMode === 'calendar'}
              >
                <CalendarDays className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {viewMode === 'grid' && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <Link key={event.id} to={`/events/${event.id}`}>
                <Card className="group h-full overflow-hidden transition-shadow hover:shadow-xl">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={event.image}
                      alt={language === 'th' ? event.titleThai : event.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute left-3 top-3">
                      <span className="rounded-full bg-slate-900/70 px-2 py-1 text-xs text-white">
                        <Tag className="mr-1 inline h-3 w-3" />
                        {language === 'th' ? event.categoryThai : event.category}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(event.date).toLocaleDateString(
                          language === 'th' ? 'th-TH' : 'en-US',
                          { weekday: 'short', month: 'short', day: 'numeric' }
                        )}
                      </span>
                      <span>•</span>
                      <Clock className="h-4 w-4" />
                      <span>{event.time}</span>
                    </div>
                    <h3 className="mb-2 font-bold text-slate-900 group-hover:text-emerald-600">
                      {language === 'th' ? event.titleThai : event.title}
                    </h3>
                    <p className="mb-3 line-clamp-2 text-sm text-slate-600">
                      {language === 'th' ? event.descriptionThai : event.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <MapPin className="h-4 w-4" />
                      <span>{language === 'th' ? event.locationThai : event.location}</span>
                    </div>
                    {event.rsvpRequired && (
                      <div className="mt-3 flex items-center justify-between">
                        <span className="flex items-center gap-1 text-sm text-emerald-600">
                          <Users className="h-4 w-4" />
                          {event.rsvpCount} {language === 'th' ? 'ลงทะเบียน' : 'registered'}
                        </span>
                        <Button size="sm" variant="outline">
                          {language === 'th' ? 'ลงทะเบียน' : 'RSVP'}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {viewMode === 'list' && (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <Link key={event.id} to={`/events/${event.id}`}>
                <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative h-48 sm:h-auto sm:w-48">
                      <img
                        src={event.image}
                        alt={language === 'th' ? event.titleThai : event.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <CardContent className="flex-1 p-5">
                      <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">
                          {language === 'th' ? event.categoryThai : event.category}
                        </span>
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(event.date).toLocaleDateString(
                            language === 'th' ? 'th-TH' : 'en-US',
                            { weekday: 'long', month: 'long', day: 'numeric' }
                          )}
                        </span>
                      </div>
                      <h3 className="mb-2 text-lg font-bold text-slate-900 group-hover:text-emerald-600">
                        {language === 'th' ? event.titleThai : event.title}
                      </h3>
                      <p className="mb-3 text-sm text-slate-600">
                        {language === 'th' ? event.descriptionThai : event.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {event.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {language === 'th' ? event.locationThai : event.location}
                        </span>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {viewMode === 'calendar' && (
          <Card>
            <CardContent className="p-6">
              {/* Calendar Header */}
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  {currentMonth.toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentMonth(
                        new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
                      )
                    }
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentMonth(
                        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
                      )
                    }
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Day Headers */}
                {(language === 'th'
                  ? ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
                  : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                ).map((day) => (
                  <div key={day} className="py-2 text-center text-sm font-medium text-slate-500">
                    {day}
                  </div>
                ))}

                {/* Empty cells for days before month starts */}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-16 rounded bg-slate-50 p-1 sm:h-24" />
                ))}

                {/* Calendar Days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const dayEvents = getEventsForDate(dateStr);
                  const isToday = (() => {
                    const now = new Date();
                    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                    return dateStr === todayStr;
                  })();

                  return (
                    <div
                      key={day}
                      className={`h-16 overflow-hidden rounded border p-1 sm:h-24 ${
                        isToday ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 bg-white'
                      } ${dayEvents.length > 0 ? 'cursor-pointer hover:border-emerald-300' : ''}`}
                      title={
                        dayEvents.length > 0
                          ? dayEvents
                              .map((e) => (language === 'th' ? e.titleThai : e.title))
                              .join(', ')
                          : undefined
                      }
                    >
                      <div
                        className={`mb-1 text-sm font-medium ${isToday ? 'text-emerald-600' : 'text-slate-700'}`}
                      >
                        {day}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <Link
                            key={event.id}
                            to={`/events/${event.id}`}
                            className="block truncate rounded bg-emerald-100 px-1 text-xs text-emerald-700 hover:bg-emerald-200"
                          >
                            <span className="hidden sm:inline">
                              {language === 'th' ? event.titleThai : event.title}
                            </span>
                            <span className="inline sm:hidden">•</span>
                          </Link>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-slate-500">
                            +{dayEvents.length - 2} {language === 'th' ? 'เพิ่มเติม' : 'more'}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mobile hint */}
              <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400 sm:hidden">
                {language === 'th'
                  ? 'เปลี่ยนเป็นมุมมองรายการเพื่อดูรายละเอียดเพิ่มเติม'
                  : 'Switch to list view for more details on mobile'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Add to Calendar CTA */}
        <div className="mt-12 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-center text-white">
          <h2 className="mb-2 text-2xl font-bold">
            {language === 'th' ? 'ไม่พลาดกิจกรรมใดๆ!' : "Don't Miss Any Events!"}
          </h2>
          <p className="mb-6 text-emerald-100">
            {language === 'th'
              ? 'สมัครรับปฏิทินของเราเพื่อรับการอัปเดตกิจกรรมโดยอัตโนมัติ'
              : 'Subscribe to our calendar to get automatic event updates'}
          </p>
          <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50">
            <Calendar className="mr-2 h-5 w-5" />
            {language === 'th' ? 'เพิ่มลงปฏิทิน' : 'Add to Calendar'}
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
}

export default EventsPage;
