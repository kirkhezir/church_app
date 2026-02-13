/**
 * About Page
 *
 * Comprehensive page about the church, beliefs, history, and leadership
 * Includes Pastor, Elders, Deacons, Deaconesses, and all church officers
 */

import { Link } from 'react-router';
import {
  Church,
  Heart,
  BookOpen,
  Award,
  Calendar,
  Mail,
  Phone,
  ChevronRight,
  Quote,
  Star,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  HeartHandshake,
  Music,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { PublicLayout } from '../../layouts';
import { useI18n } from '../../i18n';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

// Church leadership data
const PASTOR = {
  name: 'Pastor Reben Huilar',
  nameThai: 'ศจ. สมชาย ประเสริฐ',
  title: 'District Pastor',
  titleThai: 'ศิษยาภิบาล',
  photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&q=80',
  bio: 'Pastor Reben has served our congregation faithfully for over 5 years. He is passionate about sharing the gospel and helping families grow in their faith journey.',
  email: 'pastor@singburi-adventist.org',
  phone: '+66 81 234 5678',
};

const ELDERS = [
  {
    name: 'Elder Nealbeart Jumawid',
    nameThai: 'ผอ. ประเสริฐ ศรีพันธ์',
    title: 'Elder',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&q=80',
  },
  {
    name: 'Elder Carl Max Siano',
    nameThai: 'ผอ. วิชัย ทองดี',
    title: 'Elder',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&q=80',
  },
];

/**
 * Generate a DiceBear avatar URL from a person's name.
 * Uses the "initials" style for a clean, professional look with consistent colors.
 */
function getAvatarUrl(name: string, size = 80): string {
  const seed = encodeURIComponent(name);
  return `https://api.dicebear.com/9.x/initials/svg?seed=${seed}&size=${size}&backgroundColor=1e40af,1d4ed8,2563eb,3b82f6,60a5fa&backgroundType=gradientLinear&fontFamily=Arial&fontWeight=600&textColor=ffffff`;
}

/** Church officers organized by department with unique icons and accent colors. */
const CHURCH_OFFICERS_BY_DEPT: {
  department: string;
  departmentThai: string;
  icon: LucideIcon;
  accent: string;
  iconBg: string;
  members: { name: string; nameThai: string; role: string; roleThai: string }[];
}[] = [
  {
    department: 'Church Administration',
    departmentThai: 'ฝ่ายบริหารโบสถ์',
    icon: ShieldCheck,
    accent: 'text-blue-600',
    iconBg: 'bg-blue-100',
    members: [
      {
        name: 'Gladys Jane Santos',
        nameThai: 'สมหญิง แก้วใส',
        role: 'Church Clerk',
        roleThai: 'เสมียน',
      },
      {
        name: 'Lavonne Jumawid',
        nameThai: 'ประสิทธิ์ วงศ์สวัสดิ์',
        role: 'Treasurer',
        roleThai: 'เหรัญญิก',
      },
    ],
  },
  {
    department: 'Sabbath School',
    departmentThai: 'แผนกโรงเรียนวันสะบาโต',
    icon: GraduationCap,
    accent: 'text-emerald-600',
    iconBg: 'bg-emerald-100',
    members: [
      {
        name: 'Mary June Cabunoc',
        nameThai: 'สมศักดิ์ เพชรรัตน์',
        role: 'Superintendent',
        roleThai: 'ผู้ดูแล',
      },
      {
        name: 'Kenneth Joy Santos',
        nameThai: 'นิตยา ศรีสุข',
        role: 'Asst. Superintendent',
        roleThai: 'ผู้ช่วยผู้ดูแล',
      },
    ],
  },

  {
    department: 'Deacon / Deaconess',
    departmentThai: 'มัคนายก / มัคนายิกา',
    icon: HeartHandshake,
    accent: 'text-violet-600',
    iconBg: 'bg-violet-100',
    members: [
      {
        name: 'Kirk Hezir Cabunoc',
        nameThai: 'สมชาย วงศ์ประเสริฐ',
        role: 'Deacon',
        roleThai: 'มัคนายก',
      },
      {
        name: 'Nilda Sojor',
        nameThai: 'สมพร แก้วมณี',
        role: 'Deaconess',
        roleThai: 'มัคนายิกา',
      },
      {
        name: 'Lorrie Hope Yosorez',
        nameThai: 'ลอรี โฮป โยซอเรซ',
        role: 'Deaconess',
        roleThai: 'มัคนายิกา',
      },
    ],
  },
  {
    department: 'Youth Department (AY)',
    departmentThai: 'แผนกเยาวชน',
    icon: Sparkles,
    accent: 'text-amber-600',
    iconBg: 'bg-amber-100',
    members: [
      {
        name: 'Ronela Mifranum',
        nameThai: 'โรเนลา มิฟรานุม',
        role: 'AY Leader',
        roleThai: 'ผู้นำเยาวชน',
      },
      {
        name: 'Siriporn Malee',
        nameThai: 'ศิริพร มาลี',
        role: 'AY Secretary',
        roleThai: 'เลขานุการเยาวชน',
      },
    ],
  },
  {
    department: 'Music & Worship',
    departmentThai: 'แผนกดนตรีและนมัสการ',
    icon: Music,
    accent: 'text-rose-600',
    iconBg: 'bg-rose-100',
    members: [
      {
        name: 'Supachai Musikphan',
        nameThai: 'ศุภชัย มูสิกพันธ์',
        role: 'Music Director',
        roleThai: 'ผู้อำนวยการดนตรี',
      },
      {
        name: 'Ratchanee Singsai',
        nameThai: 'รัชนี สิงห์ใส',
        role: 'Choir Director',
        roleThai: 'ผู้นำขับร้อง',
      },
      {
        name: 'Natthapong Saelee',
        nameThai: 'ณัฐพงศ์ แซ่ลี',
        role: 'Organist',
        roleThai: 'นักเล่นออร์แกน',
      },
    ],
  },
];

// Core beliefs summary
const CORE_BELIEFS = [
  {
    icon: BookOpen,
    title: 'Scripture',
    description: 'The Bible is our only rule of faith and practice, the infallible Word of God.',
  },
  {
    icon: Heart,
    title: 'Salvation',
    description: 'Salvation is by grace through faith in Jesus Christ alone.',
  },
  {
    icon: Calendar,
    title: 'Sabbath',
    description: 'The seventh-day Sabbath (Saturday) is a gift of rest and worship.',
  },
  {
    icon: Star,
    title: 'Second Coming',
    description: 'Jesus will return soon to take His faithful children home.',
  },
];

export function AboutPage() {
  const { language } = useI18n();
  useDocumentTitle('About Us', 'เกี่ยวกับเรา', language);

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 pb-16 pt-24">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1920&q=80')] bg-cover bg-center opacity-10" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center text-white">
            <div className="mb-4 inline-flex items-center rounded-full bg-white/10 px-4 py-2">
              <Church className="mr-2 h-5 w-5" />
              <span className="text-sm font-medium">Seventh-day Adventist Church</span>
            </div>
            <h1 className="mb-4 text-4xl font-bold sm:text-5xl">
              {language === 'th' ? 'เกี่ยวกับเรา' : 'About Us'}
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-blue-100">
              {language === 'th'
                ? 'ศูนย์แอ๊ดเวนตีสสิงห์บุรี - ชุมชนแห่งความเชื่อ ความรัก และการรับใช้'
                : 'Sing Buri Adventist Center - A community of faith, love, and service'}
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-slate-900">
                {language === 'th' ? 'เรื่องราวของเรา' : 'Our Story'}
              </h2>
              <div className="space-y-4 text-slate-600">
                <p>
                  Sing Buri Adventist Center was established in 2015 with a small group of believers
                  committed to sharing the everlasting gospel in central Thailand.
                </p>
                <p>
                  Over the years, God has blessed our congregation with growth in both numbers and
                  spiritual depth. Today, we are a vibrant community of families, young people, and
                  individuals from diverse backgrounds united by our love for Christ.
                </p>
                <p>
                  Our mission is to make disciples of all nations, baptizing them and teaching them
                  to observe all that Jesus has commanded. We are part of the worldwide Seventh-day
                  Adventist Church with over 21 million members globally.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/visit">
                  <Button size="lg">
                    {language === 'th' ? 'วางแผนเยี่ยมชม' : 'Plan Your Visit'}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <a
                  href="https://www.adventist.org/beliefs/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="lg">
                    {language === 'th' ? '28 หลักความเชื่อ' : '28 Fundamental Beliefs'}
                  </Button>
                </a>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=600&h=400&fit=crop&q=80"
                alt="Church community"
                className="rounded-2xl shadow-xl"
              />
              <div className="absolute -bottom-6 -left-6 rounded-xl bg-blue-600 p-6 text-white shadow-lg">
                <div className="text-4xl font-bold">10+</div>
                <div className="text-blue-100">Years of Ministry</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Beliefs */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900">
              {language === 'th' ? 'หลักความเชื่อหลัก' : 'What We Believe'}
            </h2>
            <p className="mx-auto max-w-2xl text-slate-600">
              As Seventh-day Adventists, our beliefs are centered on Jesus Christ and His Word.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {CORE_BELIEFS.map((belief, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                    <belief.icon className="h-7 w-7 text-blue-600" />
                  </div>
                  <h3 className="mb-2 font-semibold text-slate-900">{belief.title}</h3>
                  <p className="text-sm text-slate-600">{belief.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pastor Section */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900">
              {language === 'th' ? 'ศิษยาภิบาลของเรา' : 'Our Pastor'}
            </h2>
          </div>
          <Card className="mx-auto max-w-4xl overflow-hidden">
            <div className="grid md:grid-cols-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-center text-white">
                <img
                  src={PASTOR.photo}
                  alt={PASTOR.name}
                  className="mx-auto mb-4 h-40 w-40 rounded-full border-4 border-white/30 object-cover"
                />
                <h3 className="text-xl font-bold">{PASTOR.name}</h3>
                <p className="text-blue-100">{PASTOR.nameThai}</p>
                <p className="mt-2 text-sm font-medium text-blue-200">{PASTOR.title}</p>
              </div>
              <CardContent className="p-8 md:col-span-2">
                <Quote className="mb-4 h-8 w-8 text-blue-200" />
                <p className="mb-6 text-lg italic text-slate-600">{PASTOR.bio}</p>
                <div className="space-y-3">
                  <a
                    href={`mailto:${PASTOR.email}`}
                    className="flex items-center gap-3 text-slate-600 hover:text-blue-600"
                  >
                    <Mail className="h-5 w-5" />
                    {PASTOR.email}
                  </a>
                  <a
                    href={`tel:${PASTOR.phone}`}
                    className="flex items-center gap-3 text-slate-600 hover:text-blue-600"
                  >
                    <Phone className="h-5 w-5" />
                    {PASTOR.phone}
                  </a>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>
      </section>

      {/* Elders */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900">
              {language === 'th' ? 'ผู้ปกครอง' : 'Church Elders'}
            </h2>
            <p className="text-slate-600">
              Our elders provide spiritual leadership and guidance to the congregation.
            </p>
          </div>
          <div className="mx-auto grid max-w-2xl gap-6 sm:grid-cols-2">
            {ELDERS.map((elder, index) => (
              <Card key={index} className="group text-center transition-shadow hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="relative mx-auto mb-4 h-24 w-24">
                    <img
                      src={elder.photo}
                      alt={elder.name}
                      className="h-24 w-24 rounded-full object-cover ring-2 ring-blue-100 transition-all group-hover:ring-4 group-hover:ring-blue-200"
                    />
                    <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white ring-2 ring-white">
                      <Award className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-slate-900">{elder.name}</h3>
                  <p className="text-sm text-slate-500">{elder.nameThai}</p>
                  <p className="mt-1 text-sm font-medium text-blue-600">{elder.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Church Officers */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900">
              {language === 'th' ? 'เจ้าหน้าที่โบสถ์' : 'Church Officers'}
            </h2>
            <p className="text-slate-600">
              Our dedicated officers serve the church in various capacities.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {CHURCH_OFFICERS_BY_DEPT.map((dept, deptIndex) => {
              const DeptIcon = dept.icon;
              return (
                <Card
                  key={deptIndex}
                  className="group overflow-hidden transition-shadow hover:shadow-lg"
                >
                  {/* Department header bar */}
                  <div className={`${dept.iconBg} px-6 py-4`}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 shadow-sm">
                        <DeptIcon className={`h-4.5 w-4.5 ${dept.accent}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {language === 'th' ? dept.departmentThai : dept.department}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {dept.members.length} {dept.members.length === 1 ? 'member' : 'members'}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Members list */}
                  <CardContent className="divide-y divide-slate-100 p-0">
                    {dept.members.map((officer, idx) => (
                      <div key={idx} className="flex items-center gap-4 px-6 py-4">
                        <img
                          src={getAvatarUrl(officer.name)}
                          alt={officer.name}
                          className="h-12 w-12 shrink-0 rounded-full ring-2 ring-slate-100"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-slate-900">{officer.name}</p>
                          <p className="truncate text-xs text-slate-400">{officer.nameThai}</p>
                          <p className={`text-sm font-medium ${dept.accent}`}>{officer.role}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="bg-gradient-to-br from-blue-900 to-indigo-900 py-16 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <Award className="mx-auto mb-6 h-12 w-12 text-blue-300" />
          <h2 className="mb-4 text-3xl font-bold">
            {language === 'th' ? 'พันธกิจของเรา' : 'Our Mission'}
          </h2>
          <p className="mb-8 text-xl text-blue-100">
            &ldquo;Go therefore and make disciples of all nations, baptizing them in the name of the
            Father and of the Son and of the Holy Spirit, teaching them to observe all that I have
            commanded you.&rdquo;
          </p>
          <p className="text-lg font-medium">— Matthew 28:19-20</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="mb-4 text-3xl font-bold text-slate-900">
            {language === 'th' ? 'มาร่วมเป็นส่วนหนึ่งกับเรา' : 'Join Our Family'}
          </h2>
          <p className="mb-8 text-lg text-slate-600">
            {language === 'th'
              ? 'ไม่ว่าคุณจะอยู่ที่ไหนในการเดินทางแห่งศรัทธา เรายินดีต้อนรับคุณ'
              : "Wherever you are on your faith journey, there's a place for you here."}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/visit">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                {language === 'th' ? 'วางแผนเยี่ยมชม' : 'Plan Your Visit'}
              </Button>
            </Link>
            <Link to="/#contact">
              <Button variant="outline" size="lg">
                {language === 'th' ? 'ติดต่อเรา' : 'Contact Us'}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

export default AboutPage;
