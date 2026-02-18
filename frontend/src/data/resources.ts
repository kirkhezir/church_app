/**
 * Resources static data
 *
 * Centralized resource data for the Resources page.
 * TODO: Replace with API call to resourceService.getAll() when backend is ready.
 */

export interface Resource {
  id: string;
  title: string;
  titleThai: string;
  description: string;
  descriptionThai: string;
  type: 'pdf' | 'video' | 'link' | 'audio';
  category: string;
  categoryThai: string;
  url: string;
  downloadUrl?: string;
  date?: string;
  duration?: string;
  author?: string;
  thumbnail?: string;
}

export const resources: Resource[] = [
  {
    id: 'ss-q1-2026',
    title: 'Sabbath School Lesson Q1 2026',
    titleThai: 'บทเรียนโรงเรียนสะบาโต ไตรมาส 1/2026',
    description: 'Adult Sabbath School quarterly study guide',
    descriptionThai: 'คู่มือศึกษาโรงเรียนสะบาโตผู้ใหญ่รายไตรมาส',
    type: 'link',
    category: 'Sabbath School',
    categoryThai: 'โรงเรียนสะบาโต',
    url: 'https://ssnet.org/',
    date: '2026-01-01',
  },
  {
    id: 'ss-video-week4',
    title: 'Week 4 Discussion Video',
    titleThai: 'วิดีโออภิปรายสัปดาห์ที่ 4',
    description: "Video discussion of this week's Sabbath School lesson",
    descriptionThai: 'วิดีโออภิปรายบทเรียนโรงเรียนสะบาโตสัปดาห์นี้',
    type: 'video',
    category: 'Sabbath School',
    categoryThai: 'โรงเรียนสะบาโต',
    url: 'https://youtube.com/',
    duration: '45:00',
    date: '2026-01-25',
    thumbnail: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=400&q=80',
  },
  {
    id: 'bible-study-basics',
    title: 'Bible Study Basics',
    titleThai: 'พื้นฐานการศึกษาพระคัมภีร์',
    description: "A beginner's guide to studying the Bible effectively",
    descriptionThai: 'คู่มือสำหรับผู้เริ่มต้นในการศึกษาพระคัมภีร์อย่างมีประสิทธิภาพ',
    type: 'pdf',
    category: 'Bible Study',
    categoryThai: 'การศึกษาพระคัมภีร์',
    url: '#',
    downloadUrl: '#',
    author: 'Pastor Somchai',
  },
  {
    id: 'prophecy-study',
    title: 'Understanding Bible Prophecy',
    titleThai: 'เข้าใจคำพยากรณ์ในพระคัมภีร์',
    description: 'A study guide on Daniel and Revelation prophecies',
    descriptionThai: 'คู่มือศึกษาคำพยากรณ์ในหนังสือดาเนียลและวิวรณ์',
    type: 'pdf',
    category: 'Bible Study',
    categoryThai: 'การศึกษาพระคัมภีร์',
    url: '#',
    downloadUrl: '#',
    author: 'Elder Wichai',
  },
  {
    id: 'sermon-jan25',
    title: 'Living by Faith - Sermon Notes',
    titleThai: 'ดำเนินชีวิตโดยความเชื่อ - บันทึกเทศนา',
    description: "Notes from Pastor Somchai's sermon on January 25, 2026",
    descriptionThai: 'บันทึกจากเทศนาของศิษยาภิบาลสมชายเมื่อวันที่ 25 มกราคม 2026',
    type: 'pdf',
    category: 'Sermon Notes',
    categoryThai: 'บันทึกเทศนา',
    url: '#',
    downloadUrl: '#',
    date: '2026-01-25',
    author: 'Pastor Somchai',
  },
  {
    id: 'sermon-jan18',
    title: 'The Power of Prayer - Sermon Notes',
    titleThai: 'พลังแห่งการอธิษฐาน - บันทึกเทศนา',
    description: "Notes from Pastor Somchai's sermon on January 18, 2026",
    descriptionThai: 'บันทึกจากเทศนาของศิษยาภิบาลสมชายเมื่อวันที่ 18 มกราคม 2026',
    type: 'pdf',
    category: 'Sermon Notes',
    categoryThai: 'บันทึกเทศนา',
    url: '#',
    downloadUrl: '#',
    date: '2026-01-18',
    author: 'Pastor Somchai',
  },
  {
    id: 'morning-watch-2026',
    title: 'Morning Watch 2026',
    titleThai: 'ยามเฝ้าเช้า 2026',
    description: 'Daily devotional readings for the year',
    descriptionThai: 'ภักดีประจำวันสำหรับปี',
    type: 'link',
    category: 'Devotional',
    categoryThai: 'ภักดี',
    url: 'https://www.adventist.org/',
  },
  {
    id: 'ay-program-guide',
    title: 'AY Program Planning Guide',
    titleThai: 'คู่มือวางแผนโปรแกรม AY',
    description: 'Resources for planning effective AY programs',
    descriptionThai: 'ทรัพยากรสำหรับการวางแผนโปรแกรม AY ที่มีประสิทธิภาพ',
    type: 'pdf',
    category: 'Youth',
    categoryThai: 'เยาวชน',
    url: '#',
    downloadUrl: '#',
  },
  {
    id: 'health-vegan-recipes',
    title: 'Healthy Vegan Recipes',
    titleThai: 'สูตรอาหารมังสวิรัติเพื่อสุขภาพ',
    description: 'Collection of delicious plant-based recipes',
    descriptionThai: 'รวมสูตรอาหารจากพืชที่อร่อย',
    type: 'pdf',
    category: 'Health',
    categoryThai: 'สุขภาพ',
    url: '#',
    downloadUrl: '#',
    thumbnail: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80',
  },
];

export const resourceCategories = [
  { id: 'all', name: 'All Resources', nameThai: 'ทรัพยากรทั้งหมด' },
  { id: 'Sabbath School', name: 'Sabbath School', nameThai: 'โรงเรียนสะบาโต' },
  { id: 'Bible Study', name: 'Bible Study', nameThai: 'การศึกษาพระคัมภีร์' },
  { id: 'Sermon Notes', name: 'Sermon Notes', nameThai: 'บันทึกเทศนา' },
  { id: 'Devotional', name: 'Devotional', nameThai: 'ภักดี' },
  { id: 'Youth', name: 'Youth', nameThai: 'เยาวชน' },
  { id: 'Health', name: 'Health', nameThai: 'สุขภาพ' },
];

export const externalLinks = [
  {
    name: 'Adventist.org',
    nameThai: 'Adventist.org',
    description: 'Official Seventh-day Adventist Church website',
    descriptionThai: 'เว็บไซต์ทางการของคริสตจักรเซเว่นเดย์แอดเวนติสต์',
    url: 'https://www.adventist.org/',
  },
  {
    name: 'Ellen G. White Estate',
    nameThai: 'Ellen G. White Estate',
    description: 'Writings of Ellen G. White',
    descriptionThai: 'งานเขียนของเอลเลน จี. ไวท์',
    url: 'https://whiteestate.org/',
  },
  {
    name: 'Sabbath School Net',
    nameThai: 'Sabbath School Net',
    description: 'Sabbath School lessons and resources',
    descriptionThai: 'บทเรียนและทรัพยากรโรงเรียนสะบาโต',
    url: 'https://ssnet.org/',
  },
  {
    name: 'Amazing Facts',
    nameThai: 'Amazing Facts',
    description: 'Bible study resources and media',
    descriptionThai: 'ทรัพยากรศึกษาพระคัมภีร์และสื่อ',
    url: 'https://www.amazingfacts.org/',
  },
  {
    name: 'It Is Written',
    nameThai: 'It Is Written',
    description: 'Bible teaching ministry',
    descriptionThai: 'พันธกิจสอนพระคัมภีร์',
    url: 'https://www.itiswritten.com/',
  },
];
