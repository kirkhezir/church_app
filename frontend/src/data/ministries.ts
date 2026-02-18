/**
 * Ministries static data
 *
 * Centralized ministry data for the Ministries and MinistryDetail pages.
 * TODO: Replace with API call to ministryService.getAll() when backend is ready.
 */
import type React from 'react';
import { Users, Baby } from 'lucide-react';

export interface Ministry {
  id: string;
  name: string;
  nameThai: string;
  description: string;
  descriptionThai: string;
  color: string;
  image: string;
  leader?: string;
  meetingTime?: string;
}

export const ministries: Ministry[] = [
  {
    id: 'youth',
    name: 'Youth Ministry (AY)',
    nameThai: 'แผนกเยาวชน (AY)',
    description:
      'Empowering young people to grow in faith through fellowship, service, and spiritual development.',
    descriptionThai:
      'เสริมพลังให้เยาวชนเติบโตในความเชื่อผ่านการสามัคคีธรรม การรับใช้ และการพัฒนาฝ่ายจิตวิญญาณ',
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
    color: 'bg-red-500',
    image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&q=80',
    leader: 'Brother Apichart',
    meetingTime: 'Weekly coordination',
  },
];

// --- Ministry Detail Data (for MinistryDetailPage) ---


export interface MinistryDetail {
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

/**
 * Detailed ministry data keyed by slug.
 * TODO: Replace with API call to ministryService.getBySlug() when backend is ready.
 */
export const ministriesData: Record<string, MinistryDetail> = {
  youth: {
    name: 'Youth Ministry (AY)',
    nameThai: 'แผนกเยาวชน (AY)',
    description:
      'Empowering young people to grow in faith through fellowship, service, and spiritual development.',
    descriptionThai:
      'เสริมพลังให้เยาวชนเติบโตในความเชื่อผ่านการสามัคคีธรรม การรับใช้ และการพัฒนาฝ่ายจิตวิญญาณ',
    fullDescription:
      'Our Youth Ministry (Adventist Youth) is dedicated to nurturing the next generation of believers. We create a welcoming environment where young people can explore their faith, build lasting friendships, and discover their God-given potential.\n\nThrough weekly AY programs, Bible studies, outreach activities, and special events, we help youth develop a personal relationship with Jesus while learning to serve others.',
    fullDescriptionThai:
      'แผนกเยาวชน (AY) ของเราอุทิศตนเพื่อดูแลเยาวชนรุ่นใหม่ เราสร้างสภาพแวดล้อมที่อบอุ่นเพื่อให้เยาวชนสำรวจความเชื่อ สร้างมิตรภาพยืนยาว และค้นหาศักยภาพที่พระเจ้าประทานให้\n\nผ่านโปรแกรม AY คืนดนตรี กีฬา โครงการบริการชุมชน และค่ายเยาวชนประจำปี',
    icon: Users,
    color: 'bg-blue-500',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80',
    leader: {
      name: 'Brother Somchai Prasert',
      role: 'Youth Director',
      roleThai: 'ผู้อำนวยการเยาวชน',
      phone: '081-234-5678',
      email: 'youth@singburiadventist.org',
    },
    team: [
      { name: 'Sister Napat', role: 'Music Coordinator', roleThai: 'ผู้ประสานงานดนตรี' },
      { name: 'Brother Krit', role: 'Sports Coordinator', roleThai: 'ผู้ประสานงานกีฬา' },
      { name: 'Sister Ploy', role: 'Outreach Leader', roleThai: 'หัวหน้าฝ่ายประกาศ' },
    ],
    meetingTime: 'Every Saturday, 3:00 PM - 5:00 PM',
    meetingTimeThai: 'ทุกวันเสาร์ เวลา 15:00 - 17:00 น.',
    location: 'Youth Hall, 2nd Floor',
    locationThai: 'ห้องเยาวชน ชั้น 2',
    gallery: [
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80',
      'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&q=80',
      'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&q=80',
      'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&q=80',
    ],
    events: [
      {
        title: 'Youth Camp 2025',
        titleThai: 'ค่ายเยาวชน 2025',
        date: '2025-03-15',
        time: '8:00 AM',
      },
      {
        title: 'Music Night',
        titleThai: 'คืนดนตรี',
        date: '2025-02-01',
        time: '6:00 PM',
      },
      {
        title: 'Community Service Day',
        titleThai: 'วันบริการชุมชน',
        date: '2025-02-15',
        time: '9:00 AM',
      },
    ],
    howToJoin: [
      'Attend any of our Saturday afternoon AY programs — everyone is welcome!',
      'Talk to Brother Somchai or any youth team member after the service.',
      'Join our LINE group for updates and event notifications.',
      'Volunteer for upcoming community service projects.',
    ],
    howToJoinThai: [
      'เข้าร่วมโปรแกรม AY ในบ่ายวันเสาร์ — ยินดีต้อนรับทุกคน!',
      'พูดคุยกับพี่สมชายหรือทีมเยาวชนหลังพิธีนมัสการ',
      'เข้าร่วมกลุ่ม LINE เพื่อรับข่าวสารและการแจ้งเตือนกิจกรรม',
      'อาสาสมัครในโครงการบริการชุมชนที่จะมาถึง',
    ],
  },
  children: {
    name: "Children's Ministry",
    nameThai: 'แผนกเด็ก',
    description: "Teaching children about God's love through creative storytelling, crafts, and activities.",
    descriptionThai:
      'สอนเด็กๆ เกี่ยวกับความรักของพระเจ้าผ่านการเล่าเรื่องอย่างสร้างสรรค์ งานฝีมือ และกิจกรรม',
    fullDescription:
      "Our Children's Ministry creates a safe, fun, and nurturing environment where children can learn about God's love. Through interactive Bible lessons, creative crafts, music, and drama, we help children build a strong foundation of faith.\n\nWe offer age-appropriate classes during worship service, Vacation Bible School during summer, and special programs throughout the year.",
    fullDescriptionThai:
      'แผนกเด็กของเราสร้างสภาพแวดล้อมที่ปลอดภัย สนุก และเอาใจใส่ เพื่อให้เด็กๆ ได้เรียนรู้เกี่ยวกับความรักของพระเจ้า ผ่านบทเรียนพระคัมภีร์แบบโต้ตอบ งานฝีมือสร้างสรรค์ ดนตรี และละคร\n\nเรามีชั้นเรียนตามวัยระหว่างพิธีนมัสการ โรงเรียนพระคัมภีร์ภาคฤดูร้อน และโปรแกรมพิเศษตลอดทั้งปี',
    icon: Baby,
    color: 'bg-pink-500',
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200&q=80',
    leader: {
      name: 'Sister Malee Sriphan',
      role: "Children's Director",
      roleThai: 'ผู้อำนวยการแผนกเด็ก',
      phone: '089-876-5432',
      email: 'children@singburiadventist.org',
    },
    team: [
      { name: 'Sister Jiraporn', role: 'Craft Leader', roleThai: 'หัวหน้าฝ่ายงานฝีมือ' },
      { name: 'Brother Thanawat', role: 'Music Teacher', roleThai: 'ครูดนตรี' },
    ],
    meetingTime: 'Every Saturday, 9:30 AM - 11:30 AM',
    meetingTimeThai: 'ทุกวันเสาร์ เวลา 9:30 - 11:30 น.',
    location: "Children's Room, 1st Floor",
    locationThai: 'ห้องเด็ก ชั้น 1',
    gallery: [
      'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&q=80',
      'https://images.unsplash.com/photo-1588075592405-d3d4f0846961?w=400&q=80',
      'https://images.unsplash.com/photo-1560541919-eb5c2da6a5a3?w=400&q=80',
      'https://images.unsplash.com/photo-1587654780291-39c9404d7dd0?w=400&q=80',
    ],
    events: [
      {
        title: 'VBS Summer Camp',
        titleThai: 'ค่ายภาคฤดูร้อน VBS',
        date: '2025-04-01',
        time: '9:00 AM',
      },
      {
        title: 'Bible Story Week',
        titleThai: 'สัปดาห์เรื่องราวพระคัมภีร์',
        date: '2025-03-01',
        time: '10:00 AM',
      },
    ],
    howToJoin: [
      "Bring your children to our Saturday morning program — all ages welcome!",
      'Speak with Sister Malee to learn about volunteer opportunities.',
      'Register for Vacation Bible School when enrollment opens.',
      'Join our parent communication group for updates.',
    ],
    howToJoinThai: [
      'พาบุตรหลานมาร่วมโปรแกรมเช้าวันเสาร์ — ยินดีต้อนรับทุกวัย!',
      'พูดคุยกับพี่มาลีเพื่อเรียนรู้เกี่ยวกับโอกาสอาสาสมัคร',
      'ลงทะเบียน VBS เมื่อเปิดรับสมัคร',
      'เข้าร่วมกลุ่มสื่อสารผู้ปกครองเพื่อรับข่าวสาร',
    ],
  },
};
