/**
 * Event Detail Page
 *
 * Detailed view of a specific event with:
 * - Full description
 * - Location map
 * - RSVP functionality
 * - Add to calendar button
 */

import { useParams, Link, Navigate } from 'react-router';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Share2,
  CalendarPlus,
  Navigation,
  Phone,
  CheckCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PublicLayout } from '@/layouts';
import { useI18n } from '@/i18n';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

// Sample event data (in production, fetch from API based on ID)
const eventsData: Record<
  string,
  {
    id: string;
    title: string;
    titleThai: string;
    description: string;
    descriptionThai: string;
    fullDescription: string;
    fullDescriptionThai: string;
    date: string;
    endDate?: string;
    time: string;
    location: string;
    locationThai: string;
    address: string;
    coordinates?: { lat: number; lng: number };
    category: string;
    categoryThai: string;
    image: string;
    organizer: string;
    organizerThai: string;
    contactPhone?: string;
    rsvpRequired?: boolean;
    rsvpDeadline?: string;
    maxAttendees?: number;
    currentAttendees?: number;
    whatToBring?: string[];
    whatToBringThai?: string[];
    schedule?: { time: string; activity: string; activityThai: string }[];
  }
> = {
  '1': {
    id: '1',
    title: 'Sabbath Worship Service',
    titleThai: 'นมัสการวันสะบาโต',
    description:
      'Join us for our weekly worship service featuring praise, prayer, and a message from the Word.',
    descriptionThai: 'ร่วมนมัสการประจำสัปดาห์พร้อมการสรรเสริญ อธิษฐาน และข่าวสารจากพระวจนะ',
    fullDescription: `Our Sabbath Worship Service is the highlight of our week as we gather together as a church family to worship God.

The service begins with praise and worship led by our music ministry, followed by prayer time, Scripture reading, and a message from God's Word delivered by our pastor.

We welcome everyone regardless of background or faith journey. Come as you are and experience the warmth of our church community.

Children's programs are available during the service for all ages. Please visit our welcome desk when you arrive to learn more about children's ministries.`,
    fullDescriptionThai: `นมัสการวันสะบาโตของเราเป็นไฮไลท์ของสัปดาห์ที่เรามารวมตัวกันเป็นครอบครัวโบสถ์เพื่อนมัสการพระเจ้า

พิธีเริ่มต้นด้วยการสรรเสริญและนมัสการนำโดยแผนกดนตรี ตามด้วยเวลาอธิษฐาน การอ่านพระคัมภีร์ และข่าวสารจากพระวจนะของพระเจ้าโดยศิษยาภิบาล

เรายินดีต้อนรับทุกคนไม่ว่าจะมีภูมิหลังหรือเส้นทางความเชื่อใด มาตามที่คุณเป็นและสัมผัสความอบอุ่นของชุมชนโบสถ์ของเรา

โปรแกรมสำหรับเด็กพร้อมให้บริการระหว่างพิธีสำหรับทุกวัย กรุณาเยี่ยมชมโต๊ะต้อนรับเมื่อคุณมาถึงเพื่อเรียนรู้เพิ่มเติมเกี่ยวกับพันธกิจเด็ก`,
    date: '2026-02-07',
    time: '11:00 AM - 12:30 PM',
    location: 'Main Sanctuary',
    locationThai: 'ห้องนมัสการหลัก',
    address: 'Sing Buri Adventist Center, Bang Phutsa, Sing Buri 16000',
    coordinates: { lat: 14.8944, lng: 100.4046 },
    category: 'Worship',
    categoryThai: 'นมัสการ',
    image: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1200&q=80',
    organizer: 'Worship Ministry',
    organizerThai: 'แผนกนมัสการ',
    contactPhone: '+66 36 xxx xxx',
    schedule: [
      { time: '11:00 AM', activity: 'Welcome & Praise', activityThai: 'ต้อนรับและสรรเสริญ' },
      { time: '11:20 AM', activity: 'Prayer Time', activityThai: 'เวลาอธิษฐาน' },
      { time: '11:30 AM', activity: 'Scripture Reading', activityThai: 'อ่านพระคัมภีร์' },
      { time: '11:40 AM', activity: 'Sermon', activityThai: 'คำเทศนา' },
      { time: '12:15 PM', activity: 'Closing & Benediction', activityThai: 'ปิดและอวยพร' },
    ],
  },
  '3': {
    id: '3',
    title: 'Community Health Fair',
    titleThai: 'งานสุขภาพชุมชน',
    description:
      'Free health screenings, wellness education, and healthy cooking demonstrations for the community.',
    descriptionThai: 'การตรวจสุขภาพฟรี การศึกษาเพื่อสุขภาพ และการสาธิตการทำอาหารเพื่อสุขภาพ',
    fullDescription: `Join us for our annual Community Health Fair! This free event is open to everyone in the community and offers a variety of health services and education.

Services include:
• Blood pressure and blood sugar screening
• BMI measurement and health consultations
• Eye and dental checkups
• Healthy cooking demonstrations
• Wellness seminars on nutrition and lifestyle

Our team of health professionals and volunteers are ready to serve you. Bring your family and friends for a day of health and wellness!`,
    fullDescriptionThai: `ร่วมงานสุขภาพชุมชนประจำปีของเรา! กิจกรรมฟรีนี้เปิดให้ทุกคนในชุมชนและเสนอบริการสุขภาพและการศึกษาที่หลากหลาย

บริการรวมถึง:
• ตรวจความดันโลหิตและน้ำตาลในเลือด
• วัด BMI และปรึกษาสุขภาพ
• ตรวจตาและฟัน
• การสาธิตการทำอาหารเพื่อสุขภาพ
• สัมมนาสุขภาพเกี่ยวกับโภชนาการและวิถีชีวิต

ทีมผู้เชี่ยวชาญด้านสุขภาพและอาสาสมัครพร้อมที่จะให้บริการคุณ พาครอบครัวและเพื่อนมาสำหรับวันแห่งสุขภาพและความเป็นอยู่ที่ดี!`,
    date: '2026-02-14',
    time: '9:00 AM - 2:00 PM',
    location: 'Church Grounds',
    locationThai: 'บริเวณโบสถ์',
    address: 'Sing Buri Adventist Center, Bang Phutsa, Sing Buri 16000',
    coordinates: { lat: 14.8944, lng: 100.4046 },
    category: 'Community',
    categoryThai: 'ชุมชน',
    image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1200&q=80',
    organizer: 'Health Ministry',
    organizerThai: 'แผนกสุขภาพ',
    contactPhone: '+66 36 xxx xxx',
    rsvpRequired: true,
    rsvpDeadline: '2026-02-12',
    maxAttendees: 100,
    currentAttendees: 45,
    whatToBring: [
      'Your Thai ID card for registration',
      'Previous health records (if any)',
      'Comfortable clothing',
      'A friend or family member!',
    ],
    whatToBringThai: [
      'บัตรประชาชนสำหรับลงทะเบียน',
      'บันทึกสุขภาพก่อนหน้า (ถ้ามี)',
      'เสื้อผ้าสบาย',
      'เพื่อนหรือสมาชิกในครอบครัว!',
    ],
    schedule: [
      { time: '9:00 AM', activity: 'Registration Opens', activityThai: 'เปิดลงทะเบียน' },
      {
        time: '9:30 AM',
        activity: 'Health Screenings Begin',
        activityThai: 'เริ่มการตรวจสุขภาพ',
      },
      {
        time: '10:30 AM',
        activity: 'Cooking Demo: Healthy Thai Food',
        activityThai: 'สาธิตทำอาหาร: อาหารไทยเพื่อสุขภาพ',
      },
      {
        time: '11:30 AM',
        activity: 'Wellness Seminar',
        activityThai: 'สัมมนาสุขภาพ',
      },
      { time: '12:30 PM', activity: 'Healthy Lunch', activityThai: 'อาหารกลางวันเพื่อสุขภาพ' },
      { time: '2:00 PM', activity: 'Event Closes', activityThai: 'ปิดงาน' },
    ],
  },
  '5': {
    id: '5',
    title: 'Youth Camp 2026',
    titleThai: 'ค่ายเยาวชน 2026',
    description:
      'Annual youth retreat with spiritual activities, team building, and outdoor adventures.',
    descriptionThai: 'ค่ายเยาวชนประจำปีพร้อมกิจกรรมฝ่ายจิตวิญญาณ การสร้างทีม และการผจญภัยกลางแจ้ง',
    fullDescription: `Get ready for an unforgettable weekend at Youth Camp 2026! This annual retreat is designed for youth ages 13-25 who want to grow closer to God and build lasting friendships.

This year's theme is "Called to Serve" based on Mark 10:45. Through inspiring messages, small group discussions, and hands-on service projects, we'll explore what it means to follow Jesus' example of servant leadership.

Activities include:
• Morning devotionals and worship sessions
• Team building challenges and games
• Nature hikes and outdoor adventures
• Evening campfire programs
• Service project in the local community

Space is limited! Register early to secure your spot.`,
    fullDescriptionThai: `เตรียมพร้อมสำหรับสุดสัปดาห์ที่ไม่มีวันลืมที่ค่ายเยาวชน 2026! ค่ายประจำปีนี้ออกแบบมาสำหรับเยาวชนอายุ 13-25 ปีที่ต้องการเข้าใกล้พระเจ้ามากขึ้นและสร้างมิตรภาพที่ยั่งยืน

ธีมของปีนี้คือ "ถูกเรียกให้รับใช้" จากมาระโก 10:45 ผ่านข่าวสารที่สร้างแรงบันดาลใจ การอภิปรายกลุ่มเล็ก และโครงการบริการภาคปฏิบัติ เราจะสำรวจความหมายของการติดตามตัวอย่างของพระเยซูในการเป็นผู้นำผู้รับใช้

กิจกรรมรวมถึง:
• ภักดีเช้าและช่วงนมัสการ
• การท้าทายการสร้างทีมและเกม
• เดินป่าและการผจญภัยกลางแจ้ง
• โปรแกรมรอบกองไฟเย็น
• โครงการบริการในชุมชนท้องถิ่น

พื้นที่มีจำกัด! ลงทะเบียนเร็วเพื่อรับประกันที่นั่งของคุณ`,
    date: '2026-03-20',
    endDate: '2026-03-22',
    time: 'All Day (Fri-Sun)',
    location: 'Camp Taksin',
    locationThai: 'ค่ายตากสิน',
    address: 'Camp Taksin, Sing Buri Province',
    category: 'Youth',
    categoryThai: 'เยาวชน',
    image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1200&q=80',
    organizer: 'Youth Ministry',
    organizerThai: 'แผนกเยาวชน',
    contactPhone: '+66 89 xxx xxxx',
    rsvpRequired: true,
    rsvpDeadline: '2026-03-13',
    maxAttendees: 50,
    currentAttendees: 35,
    whatToBring: [
      'Sleeping bag and pillow',
      'Toiletries and towel',
      'Bible and notebook',
      'Comfortable clothes for outdoor activities',
      'Flashlight',
      'Snacks to share',
    ],
    whatToBringThai: [
      'ถุงนอนและหมอน',
      'ของใช้ส่วนตัวและผ้าเช็ดตัว',
      'พระคัมภีร์และสมุดบันทึก',
      'เสื้อผ้าสบายสำหรับกิจกรรมกลางแจ้ง',
      'ไฟฉาย',
      'ขนมเพื่อแบ่งปัน',
    ],
  },
};

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { language } = useI18n();
  useDocumentTitle('Event Details', 'รายละเอียดกิจกรรม', language);
  const [isRsvpSubmitted, setIsRsvpSubmitted] = useState(false);

  const event = id ? eventsData[id] : null;

  if (!event) {
    return <Navigate to="/events" replace />;
  }

  const handleRsvp = () => {
    // In production, this would submit to an API
    setIsRsvpSubmitted(true);
  };

  const handleAddToCalendar = () => {
    // Generate iCal format - parse AM/PM time properly
    const timeStr = event.time.split(' - ')[0].trim();
    const [timePart, ampm] = timeStr.split(/\s+/);
    const [hours, minutes] = timePart.split(':').map(Number);
    let hour24 = hours;
    if (ampm?.toUpperCase() === 'PM' && hours !== 12) hour24 += 12;
    if (ampm?.toUpperCase() === 'AM' && hours === 12) hour24 = 0;
    const startDate = new Date(
      `${event.date}T${String(hour24).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`
    );
    const title = encodeURIComponent(language === 'th' ? event.titleThai : event.title);
    const location = encodeURIComponent(event.address);
    const details = encodeURIComponent(
      language === 'th' ? event.descriptionThai : event.description
    );

    // Google Calendar URL
    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '')}&details=${details}&location=${location}`;
    window.open(googleUrl, '_blank');
  };

  const spotsRemaining = event.maxAttendees
    ? event.maxAttendees - (event.currentAttendees || 0)
    : null;

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative h-[45vh] min-h-[350px] overflow-hidden">
        <img
          src={event.image}
          alt={language === 'th' ? event.titleThai : event.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-6xl px-4 pb-8 sm:px-6">
            <Link
              to="/events"
              className="mb-4 inline-flex items-center text-sm text-white/80 hover:text-white"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              {language === 'th' ? 'กลับไปกิจกรรม' : 'Back to Events'}
            </Link>
            <span className="mb-3 inline-block rounded-full bg-emerald-500 px-3 py-1 text-sm text-white">
              {language === 'th' ? event.categoryThai : event.category}
            </span>
            <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              {language === 'th' ? event.titleThai : event.title}
            </h1>
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
                  {language === 'th' ? 'รายละเอียดกิจกรรม' : 'Event Details'}
                </h2>
                <div className="prose max-w-none text-slate-600">
                  {(language === 'th' ? event.fullDescriptionThai : event.fullDescription)
                    .split('\n\n')
                    .map((para, i) => (
                      <p key={i} className="mb-4 whitespace-pre-line">
                        {para}
                      </p>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Schedule */}
            {event.schedule && event.schedule.length > 0 && (
              <Card className="mb-8">
                <CardContent className="p-6">
                  <h2 className="mb-4 text-xl font-bold text-slate-900">
                    {language === 'th' ? 'กำหนดการ' : 'Schedule'}
                  </h2>
                  <div className="space-y-3">
                    {event.schedule.map((item, i) => (
                      <div key={i} className="flex gap-4 border-l-2 border-emerald-500 pl-4">
                        <span className="w-24 shrink-0 font-medium text-emerald-600">
                          {item.time}
                        </span>
                        <span className="text-slate-600">
                          {language === 'th' ? item.activityThai : item.activity}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* What to Bring */}
            {event.whatToBring && event.whatToBring.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-4 text-xl font-bold text-slate-900">
                    {language === 'th' ? 'สิ่งที่ควรนำมา' : 'What to Bring'}
                  </h2>
                  <ul className="space-y-2">
                    {(language === 'th' ? event.whatToBringThai : event.whatToBring)?.map(
                      (item, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-600">
                          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                          <span>{item}</span>
                        </li>
                      )
                    )}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Info */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 h-5 w-5 text-emerald-500" />
                    <div>
                      <p className="font-medium text-slate-900">
                        {language === 'th' ? 'วันที่' : 'Date'}
                      </p>
                      <p className="text-slate-600">
                        {new Date(event.date).toLocaleDateString(
                          language === 'th' ? 'th-TH' : 'en-US',
                          { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
                        )}
                        {event.endDate && (
                          <>
                            {' - '}
                            {new Date(event.endDate).toLocaleDateString(
                              language === 'th' ? 'th-TH' : 'en-US',
                              { weekday: 'long', month: 'long', day: 'numeric' }
                            )}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-5 w-5 text-emerald-500" />
                    <div>
                      <p className="font-medium text-slate-900">
                        {language === 'th' ? 'เวลา' : 'Time'}
                      </p>
                      <p className="text-slate-600">{event.time}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 text-emerald-500" />
                    <div>
                      <p className="font-medium text-slate-900">
                        {language === 'th' ? 'สถานที่' : 'Location'}
                      </p>
                      <p className="text-slate-600">
                        {language === 'th' ? event.locationThai : event.location}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">{event.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="mt-0.5 h-5 w-5 text-emerald-500" />
                    <div>
                      <p className="font-medium text-slate-900">
                        {language === 'th' ? 'ผู้จัด' : 'Organizer'}
                      </p>
                      <p className="text-slate-600">
                        {language === 'th' ? event.organizerThai : event.organizer}
                      </p>
                    </div>
                  </div>
                  {event.contactPhone && (
                    <div className="flex items-start gap-3">
                      <Phone className="mt-0.5 h-5 w-5 text-emerald-500" />
                      <div>
                        <p className="font-medium text-slate-900">
                          {language === 'th' ? 'ติดต่อ' : 'Contact'}
                        </p>
                        <a
                          href={`tel:${event.contactPhone}`}
                          className="text-emerald-600 hover:underline"
                        >
                          {event.contactPhone}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 space-y-3">
                  <Button onClick={handleAddToCalendar} className="w-full" variant="outline">
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    {language === 'th' ? 'เพิ่มลงปฏิทิน' : 'Add to Calendar'}
                  </Button>
                  {event.coordinates && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        window.open(
                          `https://www.google.com/maps/dir/?api=1&destination=${event.coordinates?.lat},${event.coordinates?.lng}`,
                          '_blank'
                        )
                      }
                    >
                      <Navigation className="mr-2 h-4 w-4" />
                      {language === 'th' ? 'ดูเส้นทาง' : 'Get Directions'}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      const url = window.location.href;
                      const title = language === 'th' ? event.titleThai : event.title;
                      if (navigator.share) {
                        navigator.share({ title, url }).catch(() => {});
                      } else {
                        navigator.clipboard.writeText(url).then(() => {
                          alert(
                            language === 'th' ? 'คัดลอกลิงก์แล้ว!' : 'Link copied to clipboard!'
                          );
                        });
                      }
                    }}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    {language === 'th' ? 'แชร์กิจกรรม' : 'Share Event'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* RSVP Card */}
            {event.rsvpRequired && (
              <Card className="border-emerald-200 bg-emerald-50">
                <CardContent className="p-6">
                  <h3 className="mb-3 font-bold text-slate-900">
                    {language === 'th' ? 'ลงทะเบียน' : 'RSVP'}
                  </h3>
                  {!isRsvpSubmitted ? (
                    <>
                      {spotsRemaining !== null && (
                        <p className="mb-3 text-sm text-slate-600">
                          <Users className="mr-1 inline h-4 w-4" />
                          {spotsRemaining} {language === 'th' ? 'ที่นั่งว่าง' : 'spots remaining'}
                        </p>
                      )}
                      {event.rsvpDeadline && (
                        <p className="mb-4 text-sm text-slate-600">
                          {language === 'th' ? 'ลงทะเบียนภายใน: ' : 'Register by: '}
                          {new Date(event.rsvpDeadline).toLocaleDateString(
                            language === 'th' ? 'th-TH' : 'en-US'
                          )}
                        </p>
                      )}
                      <Button
                        onClick={handleRsvp}
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                      >
                        {language === 'th' ? 'ลงทะเบียนเลย' : 'Register Now'}
                      </Button>
                    </>
                  ) : (
                    <div className="text-center">
                      <CheckCircle className="mx-auto mb-2 h-10 w-10 text-emerald-600" />
                      <p className="font-medium text-emerald-700">
                        {language === 'th' ? 'ลงทะเบียนสำเร็จ!' : 'Successfully Registered!'}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {language === 'th'
                          ? 'เราจะส่งรายละเอียดทางอีเมล'
                          : "We'll send you details via email"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Map */}
            {event.coordinates && (
              <Card>
                <CardContent className="p-0">
                  <div className="aspect-video overflow-hidden rounded-lg">
                    <iframe
                      title="Event Location"
                      src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${event.coordinates.lng}!3d${event.coordinates.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTTCsDUzJzM5LjgiTiAxMDDCsDI0JzE2LjUiRQ!5e0!3m2!1sen!2sth!4v1234567890`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

export default EventDetailPage;
