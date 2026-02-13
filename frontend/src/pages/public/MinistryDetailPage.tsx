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

// Ministry data (in production, this would come from an API)
const ministriesData: Record<
  string,
  {
    name: string;
    nameThai: string;
    description: string;
    descriptionThai: string;
    fullDescription: string;
    fullDescriptionThai: string;
    icon: React.ElementType;
    color: string;
    image: string;
    leader: {
      name: string;
      role: string;
      roleThai: string;
      phone?: string;
      email?: string;
      image?: string;
    };
    team?: { name: string; role: string; roleThai: string }[];
    meetingTime: string;
    meetingTimeThai: string;
    location: string;
    locationThai: string;
    gallery: string[];
    events: {
      title: string;
      titleThai: string;
      date: string;
      time: string;
    }[];
    howToJoin: string[];
    howToJoinThai: string[];
  }
> = {
  youth: {
    name: 'Youth Ministry (AY)',
    nameThai: 'แผนกเยาวชน (AY)',
    description:
      'Empowering young people to grow in faith through fellowship, service, and spiritual development.',
    descriptionThai:
      'เสริมพลังให้เยาวชนเติบโตในความเชื่อผ่านการสามัคคีธรรม การรับใช้ และการพัฒนาฝ่ายจิตวิญญาณ',
    fullDescription: `Our Youth Ministry (Adventist Youth) is dedicated to nurturing the next generation of believers. 
    We create a welcoming environment where young people can explore their faith, build lasting friendships, 
    and discover their God-given potential.
    
    Through weekly AY programs, Bible studies, outreach activities, and special events, we help youth develop 
    a personal relationship with Jesus while learning to serve others. Our activities include music nights, 
    sports events, community service projects, and annual youth camps.`,
    fullDescriptionThai: `แผนกเยาวชน (Adventist Youth) ของเราอุทิศตนเพื่อเลี้ยงดูผู้เชื่อรุ่นต่อไป 
    เราสร้างสภาพแวดล้อมที่อบอุ่นซึ่งเยาวชนสามารถสำรวจความเชื่อของพวกเขา สร้างมิตรภาพที่ยั่งยืน 
    และค้นพบศักยภาพที่พระเจ้าประทานให้
    
    ผ่านโปรแกรม AY รายสัปดาห์ การศึกษาพระคัมภีร์ กิจกรรมเผยแพร่ และกิจกรรมพิเศษ เราช่วยเยาวชนพัฒนา
    ความสัมพันธ์ส่วนตัวกับพระเยซูในขณะที่เรียนรู้ที่จะรับใช้ผู้อื่น กิจกรรมของเรารวมถึงคืนดนตรี 
    กิจกรรมกีฬา โครงการบริการชุมชน และค่ายเยาวชนประจำปี`,
    icon: Users,
    color: 'bg-blue-500',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80',
    leader: {
      name: 'Brother Prasert Chaiwat',
      role: 'AY Leader',
      roleThai: 'ผู้นำ AY',
      phone: '+66 89 xxx xxxx',
      email: 'youth@singburiadventist.org',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    },
    team: [
      { name: 'Sister Nong', role: 'AY Secretary', roleThai: 'เลขานุการ AY' },
      { name: 'Brother Som', role: 'Music Coordinator', roleThai: 'ผู้ประสานงานดนตรี' },
      { name: 'Sister Mai', role: 'Outreach Coordinator', roleThai: 'ผู้ประสานงานเผยแพร่' },
    ],
    meetingTime: 'Every Saturday at 2:30 PM',
    meetingTimeThai: 'ทุกวันเสาร์ เวลา 14:30 น.',
    location: 'Church Youth Hall',
    locationThai: 'ห้องประชุมเยาวชนโบสถ์',
    gallery: [
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80',
      'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&q=80',
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&q=80',
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&q=80',
    ],
    events: [
      { title: 'Youth Sabbath', titleThai: 'สะบาโตเยาวชน', date: '2026-02-14', time: '9:00 AM' },
      {
        title: 'Youth Camp 2026',
        titleThai: 'ค่ายเยาวชน 2026',
        date: '2026-03-20',
        time: 'All Day',
      },
      {
        title: 'Community Outreach',
        titleThai: 'การเข้าถึงชุมชน',
        date: '2026-02-07',
        time: '3:00 PM',
      },
    ],
    howToJoin: [
      'Attend our weekly AY program on Sabbath afternoons',
      'Connect with our youth leader or any team member',
      'Join our LINE group for updates and fellowship',
      'Participate in our service projects and events',
    ],
    howToJoinThai: [
      'เข้าร่วมโปรแกรม AY รายสัปดาห์ในบ่ายวันสะบาโต',
      'ติดต่อผู้นำเยาวชนหรือสมาชิกในทีม',
      'เข้าร่วมกลุ่ม LINE เพื่ออัปเดตและสามัคคีธรรม',
      'มีส่วนร่วมในโครงการบริการและกิจกรรมของเรา',
    ],
  },
  children: {
    name: "Children's Ministry",
    nameThai: 'แผนกเด็ก',
    description:
      'Teaching children about Jesus through fun, engaging activities and Bible stories.',
    descriptionThai: 'สอนเด็กๆ เกี่ยวกับพระเยซูผ่านกิจกรรมสนุกสนานและเรื่องราวในพระคัมภีร์',
    fullDescription: `Our Children's Ministry provides a safe, nurturing environment where children can learn about 
    God's love through age-appropriate Bible lessons, songs, crafts, and activities. We believe every child 
    is precious in God's sight and deserves to know His love.
    
    Our dedicated team of volunteers creates engaging programs that help children develop a foundation of faith 
    that will last a lifetime. From Sabbath School classes to Vacation Bible School, we offer numerous 
    opportunities for children to grow spiritually.`,
    fullDescriptionThai: `แผนกเด็กของเราจัดหาสภาพแวดล้อมที่ปลอดภัยและเอาใจใส่ซึ่งเด็กๆ สามารถเรียนรู้เกี่ยวกับ
    ความรักของพระเจ้าผ่านบทเรียนพระคัมภีร์ เพลง งานฝีมือ และกิจกรรมที่เหมาะสมกับวัย เราเชื่อว่าเด็กทุกคน
    มีค่าในสายพระเนตรของพระเจ้าและสมควรได้รู้จักความรักของพระองค์
    
    ทีมอาสาสมัครที่ทุ่มเทของเราสร้างโปรแกรมที่น่าสนใจซึ่งช่วยให้เด็กๆ พัฒนารากฐานแห่งความเชื่อ
    ที่จะคงอยู่ตลอดชีวิต ตั้งแต่ชั้นเรียนโรงเรียนสะบาโตไปจนถึงโรงเรียนพระคัมภีร์ภาคฤดูร้อน 
    เรามีโอกาสมากมายให้เด็กๆ เติบโตทางจิตวิญญาณ`,
    icon: Baby,
    color: 'bg-pink-500',
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200&q=80',
    leader: {
      name: 'Sister Malee Suksawat',
      role: "Children's Ministry Director",
      roleThai: 'ผู้อำนวยการแผนกเด็ก',
      phone: '+66 88 xxx xxxx',
      email: 'children@singburiadventist.org',
    },
    team: [
      { name: 'Sister Noi', role: 'Beginner Class', roleThai: 'ชั้นเด็กเล็ก' },
      { name: 'Sister Fon', role: 'Primary Class', roleThai: 'ชั้นประถม' },
    ],
    meetingTime: 'Sabbath School at 9:00 AM',
    meetingTimeThai: 'โรงเรียนสะบาโต เวลา 9:00 น.',
    location: "Children's Room",
    locationThai: 'ห้องเด็ก',
    gallery: [
      'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&q=80',
      'https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=400&q=80',
    ],
    events: [
      {
        title: "Children's Day Special",
        titleThai: 'วันเด็กพิเศษ',
        date: '2026-01-10',
        time: '9:00 AM',
      },
    ],
    howToJoin: [
      'Bring your children to Sabbath School at 9:00 AM',
      'Volunteer as a teacher or helper',
      'Contact Sister Malee for more information',
    ],
    howToJoinThai: [
      'พาลูกๆ มาโรงเรียนสะบาโตเวลา 9:00 น.',
      'อาสาเป็นครูหรือผู้ช่วย',
      'ติดต่อซิสเตอร์มาลีเพื่อข้อมูลเพิ่มเติม',
    ],
  },
};

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
