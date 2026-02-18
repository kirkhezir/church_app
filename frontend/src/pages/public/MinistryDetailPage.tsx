/**
 * Individual Ministry Detail Page
 *
 * Detailed view of a specific ministry with:
 * - Ministry description
 * - Leadership team
 * - Upcoming events
 * - Photo gallery
 * - How to get involved
 */

import { useParams, Link } from 'react-router';
import { ArrowLeft, Users, Calendar, MapPin, Clock, Phone, Mail, ChevronRight } from 'lucide-react';
import { ministryIconMap } from '@/constants/ministryIcons';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PublicLayout } from '@/layouts';
import { useI18n } from '@/i18n';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ministriesData } from '@/data/ministries';

export function MinistryDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useI18n();
  useDocumentTitle('Ministry Details', 'รายละเอียดแผนก', language);

  const ministry = slug ? ministriesData[slug] : null;

  if (!ministry) {
    return (
      <PublicLayout>
        <section className="pb-16 pt-24">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
            <Users className="mx-auto mb-6 h-16 w-16 text-slate-300" />
            <h1 className="mb-4 text-3xl font-bold text-slate-900">
              {language === 'th' ? 'เร็วๆ นี้!' : 'Coming Soon!'}
            </h1>
            <p className="mb-8 text-lg text-slate-600">
              {language === 'th'
                ? 'ข้อมูลของแผนกนี้กำลังอัปเดต กรุณากลับมาเยี่ยมชมใหม่อีกครั้ง'
                : 'Details for this ministry are being updated. Please check back soon!'}
            </p>
            <Link to="/ministries">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {language === 'th' ? 'กลับไปหน้าแผนกทั้งหมด' : 'Back to All Ministries'}
              </Button>
            </Link>
          </div>
        </section>
      </PublicLayout>
    );
  }

  const Icon = ministry.icon || ministryIconMap[slug || ''] || Users;

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative h-[40vh] min-h-[300px] overflow-hidden">
        <img
          src={ministry.image}
          alt={language === 'th' ? ministry.nameThai : ministry.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-6xl px-4 pb-8 sm:px-6">
            <Link
              to="/ministries"
              className="mb-4 inline-flex items-center text-sm text-white/80 hover:text-white"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              {language === 'th' ? 'กลับไปแผนกพันธกิจ' : 'Back to Ministries'}
            </Link>
            <div className="flex items-center gap-3">
              <div className={`rounded-full ${ministry.color} p-3`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white sm:text-4xl">
                {language === 'th' ? ministry.nameThai : ministry.name}
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Description */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <h2 className="mb-4 text-xl font-bold text-slate-900">
                  {language === 'th' ? 'เกี่ยวกับแผนกนี้' : 'About This Ministry'}
                </h2>
                <div className="prose max-w-none text-slate-600">
                  {(language === 'th' ? ministry.fullDescriptionThai : ministry.fullDescription)
                    .split('\n\n')
                    .map((para, i) => (
                      <p key={i} className="mb-4">
                        {para}
                      </p>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Gallery */}
            {ministry.gallery && ministry.gallery.length > 0 && (
              <Card className="mb-8">
                <CardContent className="p-6">
                  <h2 className="mb-4 text-xl font-bold text-slate-900">
                    {language === 'th' ? 'แกลเลอรี่' : 'Gallery'}
                  </h2>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {ministry.gallery.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt=""
                        className="aspect-square rounded-lg object-cover"
                        loading="lazy"
                      />
                    ))}
                  </div>
                  <Link
                    to="/gallery"
                    className="mt-4 inline-flex items-center text-sm text-blue-600 hover:underline"
                  >
                    {language === 'th' ? 'ดูแกลเลอรี่ทั้งหมด' : 'View Full Gallery'}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* How to Join */}
            <Card>
              <CardContent className="p-6">
                <h2 className="mb-4 text-xl font-bold text-slate-900">
                  {language === 'th' ? 'วิธีเข้าร่วม' : 'How to Get Involved'}
                </h2>
                <ul className="space-y-3">
                  {(language === 'th' ? ministry.howToJoinThai : ministry.howToJoin).map(
                    (item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600">
                          {i + 1}
                        </span>
                        <span className="text-slate-600">{item}</span>
                      </li>
                    )
                  )}
                </ul>
                <div className="mt-6">
                  <Link to="/#contact">
                    <Button className={ministry.color + ' text-white'}>
                      {language === 'th' ? 'ติดต่อเรา' : 'Contact Us'}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Meeting Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 font-bold text-slate-900">
                  {language === 'th' ? 'ข้อมูลการประชุม' : 'Meeting Info'}
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-4 w-4 text-slate-400" />
                    <div>
                      <p className="font-medium text-slate-900">
                        {language === 'th' ? 'เวลา' : 'Time'}
                      </p>
                      <p className="text-slate-600">
                        {language === 'th' ? ministry.meetingTimeThai : ministry.meetingTime}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
                    <div>
                      <p className="font-medium text-slate-900">
                        {language === 'th' ? 'สถานที่' : 'Location'}
                      </p>
                      <p className="text-slate-600">
                        {language === 'th' ? ministry.locationThai : ministry.location}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leadership */}
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 font-bold text-slate-900">
                  {language === 'th' ? 'ผู้นำ' : 'Leadership'}
                </h3>
                <div className="mb-4 flex items-center gap-3">
                  {ministry.leader.image ? (
                    <img
                      src={ministry.leader.image}
                      alt={ministry.leader.name}
                      loading="lazy"
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200">
                      <Users className="h-6 w-6 text-slate-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-slate-900">{ministry.leader.name}</p>
                    <p className="text-sm text-slate-500">
                      {language === 'th' ? ministry.leader.roleThai : ministry.leader.role}
                    </p>
                  </div>
                </div>
                {ministry.leader.phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="h-4 w-4" />
                    <span>{ministry.leader.phone}</span>
                  </div>
                )}
                {ministry.leader.email && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${ministry.leader.email}`} className="hover:text-blue-600">
                      {ministry.leader.email}
                    </a>
                  </div>
                )}

                {ministry.team && ministry.team.length > 0 && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="mb-3 text-sm font-medium text-slate-900">
                      {language === 'th' ? 'ทีม' : 'Team'}
                    </h4>
                    <ul className="space-y-2 text-sm">
                      {ministry.team.map((member, i) => (
                        <li key={i} className="text-slate-600">
                          <span className="font-medium">{member.name}</span>
                          <span className="text-slate-400"> - </span>
                          {language === 'th' ? member.roleThai : member.role}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            {ministry.events && ministry.events.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-4 font-bold text-slate-900">
                    {language === 'th' ? 'กิจกรรมที่จะมาถึง' : 'Upcoming Events'}
                  </h3>
                  <ul className="space-y-3">
                    {ministry.events.map((event, i) => (
                      <li key={i} className="border-l-2 border-blue-500 pl-3">
                        <p className="font-medium text-slate-900">
                          {language === 'th' ? event.titleThai : event.title}
                        </p>
                        <p className="text-sm text-slate-500">
                          <Calendar className="mr-1 inline h-3 w-3" />
                          {new Date(event.date).toLocaleDateString(
                            language === 'th' ? 'th-TH' : 'en-US',
                            { weekday: 'short', month: 'short', day: 'numeric' }
                          )}{' '}
                          • {event.time}
                        </p>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/events"
                    className="mt-4 inline-flex items-center text-sm text-blue-600 hover:underline"
                  >
                    {language === 'th' ? 'ดูกิจกรรมทั้งหมด' : 'View All Events'}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

export default MinistryDetailPage;
