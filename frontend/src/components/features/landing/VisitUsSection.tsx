/**
 * Visit Us Section Component
 *
 * Merged section combining:
 * - Worship Times
 * - Plan Your Visit essentials (tabbed cards)
 * - Location info
 *
 * With full i18n support for Thai/English
 */

import { useState } from 'react';
import { Link } from 'react-router';
import {
  Clock,
  MapPin,
  Calendar,
  ChevronRight,
  Users,
  Heart,
  Baby,
  Shirt,
  Car,
  HeartHandshake,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { useI18n } from '../../../i18n';

// Calculate next Saturday date
function getNextSaturday(lang: string): string {
  const today = new Date();
  const daysUntilSaturday = (6 - today.getDay() + 7) % 7 || 7;
  const nextSaturday = new Date(today);

  if (today.getDay() === 6 && today.getHours() < 17) {
    return today.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }

  nextSaturday.setDate(today.getDate() + daysUntilSaturday);
  return nextSaturday.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

interface Service {
  name: string;
  nameThai: string;
  time: string;
  description: string;
  descriptionThai: string;
  icon: React.ElementType;
}

const services: Service[] = [
  {
    name: 'Sabbath School',
    nameThai: 'โรงเรียนวันสะบาโต',
    time: '9:00 AM',
    description: 'Bible study for all ages',
    descriptionThai: 'ศึกษาพระคัมภีร์สำหรับทุกวัย',
    icon: Users,
  },
  {
    name: 'Divine Service',
    nameThai: 'นมัสการ',
    time: '11:00 AM',
    description: 'Main worship service',
    descriptionThai: 'นมัสการหลัก',
    icon: Heart,
  },
  {
    name: 'AY Program',
    nameThai: 'โปรแกรมเยาวชน',
    time: '2:30 PM',
    description: 'Adventist Youth',
    descriptionThai: 'เยาวชนแอ๊ดเวนตีส',
    icon: Users,
  },
];

interface VisitInfo {
  id: string;
  icon: React.ElementType;
  title: string;
  titleThai: string;
  description: string;
  descriptionThai: string;
  details: string[];
  detailsThai: string[];
}

const visitInfoItems: VisitInfo[] = [
  {
    id: 'expect',
    icon: Heart,
    title: 'What to Expect',
    titleThai: 'สิ่งที่คาดหวัง',
    description: 'A warm welcome awaits! Worship music, prayer, and Bible teaching.',
    descriptionThai: 'การต้อนรับอบอุ่น! เพลงนมัสการ คำอธิษฐาน และคำสอนจากพระคัมภีร์',
    details: ['Friendly greeters', 'About 2 hours', 'Communion on certain Sabbaths'],
    detailsThai: ['เจ้าหน้าที่ต้อนรับ', 'ประมาณ 2 ชั่วโมง', 'มหาสนิทบางวันสะบาโต'],
  },
  {
    id: 'children',
    icon: Baby,
    title: "Children's Programs",
    titleThai: 'โปรแกรมเด็ก',
    description: 'Dedicated programs for all ages.',
    descriptionThai: 'โปรแกรมสำหรับทุกวัย',
    details: ['Classes for ages 0-17', 'Safe environments', 'Nursery available'],
    detailsThai: ['ชั้นเรียนอายุ 0-17 ปี', 'สภาพแวดล้อมปลอดภัย', 'มีห้องเลี้ยงเด็ก'],
  },
  {
    id: 'dress',
    icon: Shirt,
    title: 'What to Wear',
    titleThai: 'การแต่งกาย',
    description: 'Come as you are!',
    descriptionThai: 'มาตามสบาย!',
    details: ['No dress code', 'Thai dress welcome', 'Focus on worship'],
    detailsThai: ['ไม่มีข้อกำหนด', 'ชุดไทยยินดี', 'เน้นการนมัสการ'],
  },
  {
    id: 'parking',
    icon: Car,
    title: 'Parking',
    titleThai: 'ที่จอดรถ',
    description: 'Free parking on-site.',
    descriptionThai: 'จอดรถฟรี',
    details: ['Ample parking', 'Motorcycle area', 'Easy access'],
    detailsThai: ['ที่จอดกว้างขวาง', 'ที่จอดมอเตอร์ไซค์', 'เข้าถึงง่าย'],
  },
  {
    id: 'connect',
    icon: HeartHandshake,
    title: 'Connect',
    titleThai: 'เชื่อมต่อ',
    description: 'Meet our church family!',
    descriptionThai: 'พบครอบครัวโบสถ์!',
    details: ['Welcome desk', 'Meet the pastor', 'Visitor packet'],
    detailsThai: ['โต๊ะต้อนรับ', 'พบศิษยาภิบาล', 'ของขวัญผู้มาเยือน'],
  },
];

export function VisitUsSection() {
  const { language } = useI18n();
  const [activeTab, setActiveTab] = useState('expect');
  const nextSaturday = getNextSaturday(language);

  // Get active item
  const activeItem = visitInfoItems.find((item) => item.id === activeTab);

  return (
    <section
      id="visit"
      className="bg-gradient-to-b from-blue-50 to-white py-16 sm:py-24"
      aria-labelledby="visit-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="mb-3 inline-flex items-center rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700">
            <Calendar className="mr-2 h-4 w-4" />
            {language === 'th' ? 'ร่วมนมัสการกับเรา' : 'Join us this Sabbath'}
          </span>
          <h2 id="visit-heading" className="mb-3 text-3xl font-bold text-foreground sm:text-4xl text-balance">
            {language === 'th' ? 'วางแผนการมาเยี่ยมชม' : 'Plan Your Visit'}
          </h2>
          <p className="text-lg text-muted-foreground">
            {language === 'th'
              ? 'ทุกคนยินดีต้อนรับ! มาร่วมนมัสการวันสะบาโตกับเรา'
              : 'Everyone is welcome! Join our warm community for Sabbath worship.'}
          </p>
        </div>

        {/* Service Times */}
        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          {services.map((service) => (
            <Card
              key={service.name}
              className="border-2 border-blue-100 bg-white text-center transition-shadow hover:shadow-lg"
            >
              <CardContent className="p-5">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <service.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-foreground">
                  {language === 'th' ? service.nameThai : service.name}
                </h3>
                <p className="my-1 text-2xl font-bold text-blue-600">{service.time}</p>
                <p className="text-sm text-muted-foreground">
                  {language === 'th' ? service.descriptionThai : service.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Next Sabbath Badge */}
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">
            <Clock className="h-4 w-4" />
            {language === 'th' ? 'วันสะบาโตถัดไป:' : 'Next Sabbath:'} {nextSaturday}
          </span>
        </div>

        {/* Visit Info - Tabbed Design (Better UX) */}
        <Card className="mb-10 overflow-hidden">
          {/* Tab Navigation - Horizontal scroll on mobile with visible labels */}
          <div className="scrollbar-hide flex overflow-x-auto border-b border-border bg-muted">
            {visitInfoItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex min-w-max flex-1 items-center justify-center gap-2 whitespace-nowrap px-3 py-3 text-sm font-medium transition-colors sm:px-4 ${
                  activeTab === item.id
                    ? 'border-b-2 border-blue-600 bg-white text-blue-600'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm">
                  {language === 'th' ? item.titleThai : item.title}
                </span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeItem && (
            <CardContent className="p-4 sm:p-6 md:p-8">
              <div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-start">
                {/* Icon and Title */}
                <div className="flex items-center gap-3 sm:gap-4 md:w-1/3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100 sm:h-14 sm:w-14">
                    <activeItem.icon className="h-6 w-6 text-blue-600 sm:h-7 sm:w-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground sm:text-xl">
                      {language === 'th' ? activeItem.titleThai : activeItem.title}
                    </h3>
                    <p className="text-xs text-muted-foreground sm:text-sm">
                      {language === 'th' ? activeItem.descriptionThai : activeItem.description}
                    </p>
                  </div>
                </div>

                {/* Details List */}
                <div className="flex-1 md:border-l md:border-border md:pl-6">
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {(language === 'th' ? activeItem.detailsThai : activeItem.details).map(
                      (detail, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
                          <span className="text-foreground/80">{detail}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Location CTA */}
        <Card className="overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700">
          <CardContent className="p-5 sm:p-6 md:p-8">
            <div className="flex flex-col items-center gap-4 text-center sm:gap-6 md:flex-row md:justify-between md:text-left">
              {/* Location Info */}
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4 md:items-start">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 sm:h-14 sm:w-14">
                  <MapPin className="h-6 w-6 text-white sm:h-7 sm:w-7" />
                </div>
                <div className="text-white">
                  <h3 className="text-base font-semibold sm:text-lg">
                    {language === 'th' ? 'ศูนย์แอ๊ดเวนตีสสิงห์บุรี' : 'Sing Buri Adventist Center'}
                  </h3>
                  <p className="text-sm text-blue-100">
                    {language === 'th'
                      ? 'ต.บางพุทรา อ.เมือง จ.สิงห์บุรี 16000'
                      : 'Bang Phutsa, Sing Buri 16000, Thailand'}
                  </p>
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:gap-3">
                <Button
                  onClick={() =>
                    window.open('https://maps.google.com/?q=Sing+Buri+Adventist+Center', '_blank')
                  }
                  variant="secondary"
                  size="default"
                  className="w-full bg-white text-blue-600 hover:bg-blue-50 sm:w-auto sm:px-6"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  {language === 'th' ? 'เส้นทาง' : 'Get Directions'}
                </Button>
                <Link to="/visit" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="default"
                    className="w-full border-white/30 bg-transparent text-white hover:bg-white/10"
                  >
                    {language === 'th' ? 'รายละเอียดเพิ่มเติม' : 'More Details'}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export default VisitUsSection;
