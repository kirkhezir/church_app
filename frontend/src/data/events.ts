/**
 * Events static data
 *
 * Centralized event data for the Events page.
 * TODO: Replace with API call to eventService.getAll() when backend is ready.
 */

export interface ChurchEvent {
  id: string;
  title: string;
  titleThai: string;
  description: string;
  descriptionThai: string;
  date: string;
  endDate?: string;
  time: string;
  location: string;
  locationThai: string;
  category: string;
  categoryThai: string;
  image: string;
  featured?: boolean;
  rsvpRequired?: boolean;
  rsvpCount?: number;
}

export const eventsData: ChurchEvent[] = [
  {
    id: '1',
    title: 'Sabbath Worship Service',
    titleThai: 'นมัสการวันสะบาโต',
    description:
      'Join us for our weekly worship service featuring praise, prayer, and a message from the Word.',
    descriptionThai: 'ร่วมนมัสการประจำสัปดาห์พร้อมการสรรเสริญ อธิษฐาน และข่าวสารจากพระวจนะ',
    date: '2026-02-07',
    time: '11:00 AM - 12:30 PM',
    location: 'Main Sanctuary',
    locationThai: 'ห้องนมัสการหลัก',
    category: 'Worship',
    categoryThai: 'นมัสการ',
    image: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=600&q=80',
    featured: true,
  },
  {
    id: '2',
    title: 'Youth Vespers',
    titleThai: 'นมัสการเย็นเยาวชน',
    description:
      'A special evening worship program led by our youth with music, testimonies, and fellowship.',
    descriptionThai: 'โปรแกรมนมัสการเย็นพิเศษนำโดยเยาวชน พร้อมดนตรี คำพยาน และสามัคคีธรรม',
    date: '2026-02-07',
    time: '5:00 PM - 6:30 PM',
    location: 'Youth Hall',
    locationThai: 'ห้องเยาวชน',
    category: 'Youth',
    categoryThai: 'เยาวชน',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80',
    rsvpRequired: true,
    rsvpCount: 25,
  },
  {
    id: '3',
    title: 'Community Health Fair',
    titleThai: 'งานสุขภาพชุมชน',
    description:
      'Free health screenings, wellness education, and healthy cooking demonstrations for the community.',
    descriptionThai: 'การตรวจสุขภาพฟรี การศึกษาเพื่อสุขภาพ และการสาธิตการทำอาหารเพื่อสุขภาพ',
    date: '2026-02-14',
    time: '9:00 AM - 2:00 PM',
    location: 'Church Grounds',
    locationThai: 'บริเวณโบสถ์',
    category: 'Community',
    categoryThai: 'ชุมชน',
    image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&q=80',
    featured: true,
    rsvpRequired: true,
    rsvpCount: 45,
  },
  {
    id: '4',
    title: 'Prayer Meeting',
    titleThai: 'การประชุมอธิษฐาน',
    description: 'Mid-week prayer gathering for spiritual renewal and intercession.',
    descriptionThai: 'การรวมตัวอธิษฐานกลางสัปดาห์เพื่อการฟื้นฟูจิตวิญญาณและการวิงวอน',
    date: '2026-02-11',
    time: '7:00 PM - 8:00 PM',
    location: 'Prayer Room',
    locationThai: 'ห้องอธิษฐาน',
    category: 'Prayer',
    categoryThai: 'อธิษฐาน',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
  },
  {
    id: '5',
    title: 'Youth Camp 2026',
    titleThai: 'ค่ายเยาวชน 2026',
    description:
      'Annual youth retreat with spiritual activities, team building, and outdoor adventures.',
    descriptionThai: 'ค่ายเยาวชนประจำปีพร้อมกิจกรรมฝ่ายจิตวิญญาณ การสร้างทีม และการผจญภัยกลางแจ้ง',
    date: '2026-03-20',
    endDate: '2026-03-22',
    time: 'All Day',
    location: 'Camp Taksin',
    locationThai: 'ค่ายตากสิน',
    category: 'Youth',
    categoryThai: 'เยาวชน',
    image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600&q=80',
    featured: true,
    rsvpRequired: true,
    rsvpCount: 35,
  },
  {
    id: '6',
    title: "Women's Fellowship Breakfast",
    titleThai: 'อาหารเช้าสามัคคีธรรมสตรี',
    description: 'Monthly gathering for women to connect, share, and encourage one another.',
    descriptionThai: 'การรวมตัวประจำเดือนสำหรับสตรีเพื่อเชื่อมต่อ แบ่งปัน และให้กำลังใจกัน',
    date: '2026-02-21',
    time: '8:00 AM - 10:00 AM',
    location: 'Fellowship Hall',
    locationThai: 'ห้องสามัคคีธรรม',
    category: 'Women',
    categoryThai: 'สตรี',
    image: 'https://images.unsplash.com/photo-1475503572774-15a45e5d60b9?w=600&q=80',
    rsvpRequired: true,
    rsvpCount: 20,
  },
  {
    id: '7',
    title: 'Baptism Sabbath',
    titleThai: 'สะบาโตบัพติศมา',
    description: 'Celebrating new members joining our church family through baptism.',
    descriptionThai: 'ฉลองสมาชิกใหม่เข้าร่วมครอบครัวโบสถ์ผ่านบัพติศมา',
    date: '2026-02-28',
    time: '11:00 AM',
    location: 'Main Sanctuary',
    locationThai: 'ห้องนมัสการหลัก',
    category: 'Worship',
    categoryThai: 'นมัสการ',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80',
    featured: true,
  },
  {
    id: '8',
    title: 'Pathfinder Investiture',
    titleThai: 'พิธีสถาปนาพาธไฟน์เดอร์',
    description:
      'Annual ceremony honoring Pathfinders who have completed their class requirements.',
    descriptionThai: 'พิธีประจำปีเพื่อเชิดชูพาธไฟน์เดอร์ที่สำเร็จความต้องการของชั้นเรียน',
    date: '2026-03-07',
    time: '3:00 PM',
    location: 'Main Sanctuary',
    locationThai: 'ห้องนมัสการหลัก',
    category: 'Youth',
    categoryThai: 'เยาวชน',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80',
  },
];

export const eventCategories = [
  { id: 'all', name: 'All Events', nameThai: 'กิจกรรมทั้งหมด' },
  { id: 'Worship', name: 'Worship', nameThai: 'นมัสการ' },
  { id: 'Youth', name: 'Youth', nameThai: 'เยาวชน' },
  { id: 'Community', name: 'Community', nameThai: 'ชุมชน' },
  { id: 'Prayer', name: 'Prayer', nameThai: 'อธิษฐาน' },
  { id: 'Women', name: 'Women', nameThai: 'สตรี' },
];
