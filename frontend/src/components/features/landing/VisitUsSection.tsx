/**
 * Visit Us Section Component
 *
 * Merged section combining:
 * - Worship Times
 * - Plan Your Visit essentials (expandable cards)
 * - Location info
 *
 * With full i18n support for Thai/English
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
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
  ChevronDown,
  ChevronUp,
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
  const [expandedId, setExpandedId] = useState<string | null>('expect');
  const nextSaturday = getNextSaturday(language);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

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
          <h2 id="visit-heading" className="mb-3 text-3xl font-bold text-slate-900 sm:text-4xl">
            {language === 'th' ? 'วางแผนการมาเยี่ยมชม' : 'Plan Your Visit'}
          </h2>
          <p className="text-lg text-slate-600">
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
                <h3 className="font-semibold text-slate-900">
                  {language === 'th' ? service.nameThai : service.name}
                </h3>
                <p className="my-1 text-2xl font-bold text-blue-600">{service.time}</p>
                <p className="text-sm text-slate-500">
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

        {/* Visit Info Cards */}
        <div className="mb-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {visitInfoItems.map((item) => (
            <Card
              key={item.id}
              className={`overflow-hidden transition-all ${
                expandedId === item.id ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <button
                onClick={() => toggleExpand(item.id)}
                className="flex w-full items-center justify-between p-4 text-left hover:bg-slate-50"
                aria-expanded={expandedId === item.id}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <item.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="font-semibold text-slate-900">
                    {language === 'th' ? item.titleThai : item.title}
                  </span>
                </div>
                {expandedId === item.id ? (
                  <ChevronUp className="h-5 w-5 text-slate-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                )}
              </button>
              {expandedId === item.id && (
                <div className="border-t border-slate-100 bg-slate-50 p-4">
                  <p className="mb-3 text-sm text-slate-600">
                    {language === 'th' ? item.descriptionThai : item.description}
                  </p>
                  <ul className="space-y-1">
                    {(language === 'th' ? item.detailsThai : item.details).map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                        <span className="text-slate-700">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Location CTA */}
        <Card className="overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20">
                  <MapPin className="h-7 w-7 text-white" />
                </div>
                <div className="text-white">
                  <h3 className="text-lg font-semibold">
                    {language === 'th' ? 'ศูนย์แอ๊ดเวนตีสสิงห์บุรี' : 'Sing Buri Adventist Center'}
                  </h3>
                  <p className="text-blue-100">
                    {language === 'th'
                      ? 'ต.บางพุทรา อ.เมือง จ.สิงห์บุรี 16000'
                      : 'Bang Phutsa, Sing Buri 16000, Thailand'}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={() =>
                    window.open('https://maps.google.com/?q=Sing+Buri+Adventist+Center', '_blank')
                  }
                  variant="secondary"
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  {language === 'th' ? 'เส้นทาง' : 'Get Directions'}
                </Button>
                <Link to="/visit">
                  <Button
                    variant="outline"
                    size="lg"
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
