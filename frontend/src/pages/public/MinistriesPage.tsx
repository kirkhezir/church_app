/**
 * Ministries Page
 *
 * Overview of all church ministries with links to individual ministry pages
 */

import { Link } from 'react-router';
import {
  Users,
  Baby,
  Heart,
  Music,
  BookOpen,
  Globe,
  Utensils,
  Compass,
  HeartHandshake,
  GraduationCap,
  Church,
  Mic2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PublicLayout } from '@/layouts';
import { useI18n } from '@/i18n';

interface Ministry {
  id: string;
  name: string;
  nameThai: string;
  description: string;
  descriptionThai: string;
  icon: React.ElementType;
  color: string;
  image: string;
  leader?: string;
  meetingTime?: string;
}

const ministries: Ministry[] = [
  {
    id: 'youth',
    name: 'Youth Ministry (AY)',
    nameThai: 'แผนกเยาวชน (AY)',
    description:
      'Empowering young people to grow in faith through fellowship, service, and spiritual development.',
    descriptionThai:
      'เสริมพลังให้เยาวชนเติบโตในความเชื่อผ่านการสามัคคีธรรม การรับใช้ และการพัฒนาฝ่ายจิตวิญญาณ',
    icon: Users,
    color: 'bg-blue-500',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80',
    leader: 'Brother Prasert',
    meetingTime: 'Saturday 2:30 PM',
  },
  {
    id: 'children',
    name: "Children's Ministry",
    nameThai: 'แผนกเด็ก',
    description:
      'Teaching children about Jesus through fun, engaging activities and Bible stories.',
    descriptionThai: 'สอนเด็กๆ เกี่ยวกับพระเยซูผ่านกิจกรรมสนุกสนานและเรื่องราวในพระคัมภีร์',
    icon: Baby,
    color: 'bg-pink-500',
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=80',
    leader: 'Sister Malee',
    meetingTime: 'Sabbath School 9:00 AM',
  },
  {
    id: 'women',
    name: "Women's Ministry",
    nameThai: 'แผนกสตรี',
    description:
      'Supporting women in spiritual growth, fellowship, and community service opportunities.',
    descriptionThai: 'สนับสนุนสตรีในการเติบโตฝ่ายจิตวิญญาณ สามัคคีธรรม และโอกาสในการรับใช้ชุมชน',
    icon: Heart,
    color: 'bg-rose-500',
    image: 'https://images.unsplash.com/photo-1475503572774-15a45e5d60b9?w=600&q=80',
    leader: 'Sister Nittaya',
    meetingTime: 'Monthly meetings',
  },
  {
    id: 'music',
    name: 'Music Ministry',
    nameThai: 'แผนกดนตรี',
    description: 'Leading worship through music, choir, and instrumental performances.',
    descriptionThai: 'นำนมัสการผ่านดนตรี คณะนักร้องประสานเสียง และการแสดงดนตรี',
    icon: Music,
    color: 'bg-purple-500',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80',
    leader: 'Brother Somchai',
    meetingTime: 'Practice: Friday 6:00 PM',
  },
  {
    id: 'sabbath-school',
    name: 'Sabbath School',
    nameThai: 'โรงเรียนสะบาโต',
    description: 'Bible study classes for all ages, diving deep into Scripture each week.',
    descriptionThai: 'ชั้นเรียนพระคัมภีร์สำหรับทุกวัย ศึกษาพระคัมภีร์อย่างลึกซึ้งทุกสัปดาห์',
    icon: BookOpen,
    color: 'bg-emerald-500',
    image: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=600&q=80',
    leader: 'Elder Wichai',
    meetingTime: 'Saturday 9:00 AM',
  },
  {
    id: 'pathfinders',
    name: 'Pathfinders',
    nameThai: 'พาธไฟน์เดอร์',
    description:
      'Character building program for youth ages 10-15 with camping, honors, and community service.',
    descriptionThai:
      'โปรแกรมสร้างอุปนิสัยสำหรับเยาวชนอายุ 10-15 ปี พร้อมการตั้งแคมป์ เกียรติบัตร และการบริการชุมชน',
    icon: Compass,
    color: 'bg-amber-500',
    image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600&q=80',
    leader: 'Brother Prasit',
    meetingTime: 'Sunday 9:00 AM',
  },
  {
    id: 'community-service',
    name: 'Community Services',
    nameThai: 'บริการชุมชน',
    description: 'Reaching out to help those in need through food distribution and assistance.',
    descriptionThai: 'ช่วยเหลือผู้ขัดสนผ่านการแจกอาหารและความช่วยเหลือ',
    icon: HeartHandshake,
    color: 'bg-teal-500',
    image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&q=80',
    leader: 'Deacon Somphong',
    meetingTime: 'As scheduled',
  },
  {
    id: 'health',
    name: 'Health Ministry',
    nameThai: 'แผนกสุขภาพ',
    description:
      'Promoting wholistic health through education, cooking classes, and wellness programs.',
    descriptionThai: 'ส่งเสริมสุขภาพองค์รวมผ่านการศึกษา ชั้นเรียนทำอาหาร และโปรแกรมสุขภาพ',
    icon: Utensils,
    color: 'bg-green-500',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80',
    leader: 'Sister Pornpan',
    meetingTime: 'Quarterly programs',
  },
  {
    id: 'missions',
    name: 'Mission & Outreach',
    nameThai: 'มิชชั่นและการเผยแพร่',
    description: 'Sharing the gospel locally and supporting global mission initiatives.',
    descriptionThai: 'แบ่งปันข่าวประเสริฐในท้องถิ่นและสนับสนุนโครงการมิชชั่นทั่วโลก',
    icon: Globe,
    color: 'bg-cyan-500',
    image: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600&q=80',
    leader: 'Pastor Somchai',
    meetingTime: 'Monthly planning',
  },
  {
    id: 'education',
    name: 'Education Ministry',
    nameThai: 'แผนกการศึกษา',
    description: 'Supporting Christian education and scholarship opportunities for church members.',
    descriptionThai: 'สนับสนุนการศึกษาคริสเตียนและโอกาสทุนการศึกษาสำหรับสมาชิกโบสถ์',
    icon: GraduationCap,
    color: 'bg-indigo-500',
    image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&q=80',
    leader: 'Elder Wichai',
    meetingTime: 'As needed',
  },
  {
    id: 'deacons',
    name: 'Deacon Ministry',
    nameThai: 'แผนกมัคนายก',
    description: 'Serving the practical needs of the church and maintaining facilities.',
    descriptionThai: 'รับใช้ความต้องการเชิงปฏิบัติของโบสถ์และดูแลสถานที่',
    icon: Church,
    color: 'bg-slate-500',
    image: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=600&q=80',
    leader: 'Head Deacon Prasong',
    meetingTime: 'As needed',
  },
  {
    id: 'media',
    name: 'Media Ministry',
    nameThai: 'แผนกสื่อ',
    description: 'Managing church communications, livestreaming, and digital presence.',
    descriptionThai: 'จัดการการสื่อสารของโบสถ์ การถ่ายทอดสด และการมีตัวตนทางดิจิทัล',
    icon: Mic2,
    color: 'bg-red-500',
    image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&q=80',
    leader: 'Brother Apichart',
    meetingTime: 'Weekly coordination',
  },
];

export function MinistriesPage() {
  const { language } = useI18n();

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 pb-16 pt-24">
        <div className="mx-auto max-w-6xl px-4 text-center text-white sm:px-6">
          <Users className="mx-auto mb-4 h-12 w-12 text-blue-300" />
          <h1 className="mb-4 text-4xl font-bold sm:text-5xl">
            {language === 'th' ? 'แผนกพันธกิจ' : 'Our Ministries'}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-blue-100">
            {language === 'th'
              ? 'ค้นพบวิธีที่คุณสามารถมีส่วนร่วมและเติบโตในความเชื่อของคุณ'
              : 'Discover ways you can get involved and grow in your faith'}
          </p>
        </div>
      </section>

      {/* Ministries Grid */}
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ministries.map((ministry) => {
            const Icon = ministry.icon;
            return (
              <Link key={ministry.id} to={`/ministries/${ministry.id}`}>
                <Card className="group h-full overflow-hidden transition-all hover:shadow-xl">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={ministry.image}
                      alt={language === 'th' ? ministry.nameThai : ministry.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className={`absolute left-4 top-4 rounded-full ${ministry.color} p-2`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="mb-2 text-lg font-bold text-slate-900 group-hover:text-blue-600">
                      {language === 'th' ? ministry.nameThai : ministry.name}
                    </h3>
                    <p className="mb-3 text-sm text-slate-600">
                      {language === 'th' ? ministry.descriptionThai : ministry.description}
                    </p>
                    {ministry.meetingTime && (
                      <p className="text-xs text-slate-500">
                        <span className="font-medium">
                          {language === 'th' ? 'เวลาประชุม:' : 'Meeting:'}{' '}
                        </span>
                        {ministry.meetingTime}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-16 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center text-white">
          <h2 className="mb-2 text-2xl font-bold">
            {language === 'th' ? 'พร้อมที่จะมีส่วนร่วม?' : 'Ready to Get Involved?'}
          </h2>
          <p className="mb-6 text-blue-100">
            {language === 'th'
              ? 'ติดต่อเราเพื่อเรียนรู้เพิ่มเติมเกี่ยวกับการเข้าร่วมแผนกพันธกิจใดๆ'
              : 'Contact us to learn more about joining any of our ministries'}
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link to="/#contact">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                {language === 'th' ? 'ติดต่อเรา' : 'Contact Us'}
              </Button>
            </Link>
            <Link to="/visit">
              <Button
                size="lg"
                variant="outline"
                className="border-white/60 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                {language === 'th' ? 'มาเยี่ยมชม' : 'Plan Your Visit'}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-slate-50 py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-slate-600 sm:px-6">
          <p>© 2026 Sing Buri Adventist Center. All rights reserved.</p>
          <div className="mt-2 flex justify-center gap-4">
            <Link to="/" className="transition-colors hover:text-blue-600">
              {language === 'th' ? 'หน้าแรก' : 'Home'}
            </Link>
            <Link to="/privacy" className="transition-colors hover:text-blue-600">
              {language === 'th' ? 'นโยบายความเป็นส่วนตัว' : 'Privacy Policy'}
            </Link>
          </div>
        </div>
      </footer>
    </PublicLayout>
  );
}

export default MinistriesPage;
