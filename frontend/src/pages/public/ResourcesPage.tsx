/**
 * Resources Page
 *
 * Digital resources including Bible study guides, sermon notes, and Sabbath School lessons
 */

import { useState } from 'react';
import {
  BookOpen,
  FileText,
  Video,
  Download,
  ExternalLink,
  Search,
  Bookmark,
  PlayCircle,
  Clock,
  Calendar,
  Users,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PublicLayout } from '@/layouts';
import { useI18n } from '@/i18n';

interface Resource {
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

const resources: Resource[] = [
  // Sabbath School
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

  // Bible Study Guides
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

  // Sermon Notes
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

  // Devotionals
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

  // Youth Resources
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

  // Health
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

const categories = [
  { id: 'all', name: 'All Resources', nameThai: 'ทรัพยากรทั้งหมด' },
  { id: 'Sabbath School', name: 'Sabbath School', nameThai: 'โรงเรียนสะบาโต' },
  { id: 'Bible Study', name: 'Bible Study', nameThai: 'การศึกษาพระคัมภีร์' },
  { id: 'Sermon Notes', name: 'Sermon Notes', nameThai: 'บันทึกเทศนา' },
  { id: 'Devotional', name: 'Devotional', nameThai: 'ภักดี' },
  { id: 'Youth', name: 'Youth', nameThai: 'เยาวชน' },
  { id: 'Health', name: 'Health', nameThai: 'สุขภาพ' },
];

const externalLinks = [
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

export function ResourcesPage() {
  const { language } = useI18n();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredResources = resources.filter((resource) => {
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      (language === 'th' ? resource.titleThai : resource.title)
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return FileText;
      case 'video':
        return Video;
      case 'audio':
        return PlayCircle;
      default:
        return ExternalLink;
    }
  };

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-900 via-cyan-900 to-blue-900 pb-12 pt-24">
        <div className="mx-auto max-w-6xl px-4 text-center text-white sm:px-6">
          <BookOpen className="mx-auto mb-4 h-12 w-12 text-teal-300" />
          <h1 className="mb-4 text-4xl font-bold sm:text-5xl">
            {language === 'th' ? 'ทรัพยากร' : 'Resources'}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-teal-100">
            {language === 'th'
              ? 'ค้นหาเครื่องมือและสื่อเพื่อการเติบโตฝ่ายจิตวิญญาณ'
              : 'Find tools and materials for your spiritual growth'}
          </p>
        </div>
      </section>

      {/* Search and Filter */}
      <div className="sticky top-16 z-40 border-b bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={language === 'th' ? 'ค้นหาทรัพยากร...' : 'Search resources...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-4 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`whitespace-nowrap rounded-full px-3 py-1 text-sm transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {language === 'th' ? cat.nameThai : cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Resources */}
          <div className="lg:col-span-2">
            <h2 className="mb-6 text-lg font-semibold text-slate-900">
              {selectedCategory === 'all'
                ? language === 'th'
                  ? 'ทรัพยากรทั้งหมด'
                  : 'All Resources'
                : categories.find((c) => c.id === selectedCategory)?.[
                    language === 'th' ? 'nameThai' : 'name'
                  ]}
              <span className="ml-2 text-sm font-normal text-slate-500">
                ({filteredResources.length})
              </span>
            </h2>

            {filteredResources.length > 0 ? (
              <div className="space-y-4">
                {filteredResources.map((resource) => {
                  const Icon = getIcon(resource.type);
                  return (
                    <Card key={resource.id} className="transition-shadow hover:shadow-md">
                      <CardContent className="p-5">
                        <div className="flex gap-4">
                          {resource.thumbnail ? (
                            <img
                              src={resource.thumbnail}
                              alt=""
                              className="h-20 w-20 shrink-0 rounded-lg object-cover"
                            />
                          ) : (
                            <div
                              className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-lg ${
                                resource.type === 'pdf'
                                  ? 'bg-red-100'
                                  : resource.type === 'video'
                                    ? 'bg-purple-100'
                                    : 'bg-blue-100'
                              }`}
                            >
                              <Icon
                                className={`h-8 w-8 ${
                                  resource.type === 'pdf'
                                    ? 'text-red-600'
                                    : resource.type === 'video'
                                      ? 'text-purple-600'
                                      : 'text-blue-600'
                                }`}
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                                {language === 'th' ? resource.categoryThai : resource.category}
                              </span>
                              {resource.type === 'video' && resource.duration && (
                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                  <Clock className="h-3 w-3" />
                                  {resource.duration}
                                </span>
                              )}
                            </div>
                            <h3 className="font-semibold text-slate-900">
                              {language === 'th' ? resource.titleThai : resource.title}
                            </h3>
                            <p className="mt-1 text-sm text-slate-600">
                              {language === 'th' ? resource.descriptionThai : resource.description}
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              {resource.author && (
                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                  <Users className="h-3 w-3" />
                                  {resource.author}
                                </span>
                              )}
                              {resource.date && (
                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(resource.date).toLocaleDateString(
                                    language === 'th' ? 'th-TH' : 'en-US',
                                    { month: 'short', day: 'numeric', year: 'numeric' }
                                  )}
                                </span>
                              )}
                              <div className="flex-1" />
                              {resource.downloadUrl && (
                                <Button size="sm" variant="outline" className="h-8">
                                  <Download className="mr-1 h-3 w-3" />
                                  {language === 'th' ? 'ดาวน์โหลด' : 'Download'}
                                </Button>
                              )}
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex"
                              >
                                <Button size="sm" className="h-8 bg-teal-600 hover:bg-teal-700">
                                  {resource.type === 'video'
                                    ? language === 'th'
                                      ? 'ดู'
                                      : 'Watch'
                                    : resource.type === 'pdf'
                                      ? language === 'th'
                                        ? 'เปิด'
                                        : 'Open'
                                      : language === 'th'
                                        ? 'เยี่ยมชม'
                                        : 'Visit'}
                                  <ChevronRight className="ml-1 h-3 w-3" />
                                </Button>
                              </a>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center">
                <BookOpen className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                <h3 className="mb-2 text-lg font-medium text-slate-900">
                  {language === 'th' ? 'ไม่พบทรัพยากร' : 'No resources found'}
                </h3>
                <p className="text-slate-500">
                  {language === 'th'
                    ? 'ลองเปลี่ยนคำค้นหาหรือหมวดหมู่'
                    : 'Try adjusting your search or category filter'}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Access */}
            <Card>
              <CardContent className="p-5">
                <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-900">
                  <Bookmark className="h-5 w-5 text-teal-600" />
                  {language === 'th' ? 'เข้าถึงด่วน' : 'Quick Access'}
                </h3>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="https://ssnet.org/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg p-2 text-sm text-slate-600 transition-colors hover:bg-slate-100"
                    >
                      <BookOpen className="h-4 w-4 text-teal-600" />
                      {language === 'th' ? 'บทเรียนสะบาโตสัปดาห์นี้' : "This Week's SS Lesson"}
                      <ExternalLink className="ml-auto h-3 w-3" />
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="flex items-center gap-2 rounded-lg p-2 text-sm text-slate-600 transition-colors hover:bg-slate-100"
                    >
                      <FileText className="h-4 w-4 text-teal-600" />
                      {language === 'th' ? 'บันทึกเทศนาล่าสุด' : 'Latest Sermon Notes'}
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.youtube.com/@singburiadventist"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg p-2 text-sm text-slate-600 transition-colors hover:bg-slate-100"
                    >
                      <Video className="h-4 w-4 text-teal-600" />
                      {language === 'th' ? 'วิดีโอเทศนา' : 'Sermon Videos'}
                      <ExternalLink className="ml-auto h-3 w-3" />
                    </a>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* External Links */}
            <Card>
              <CardContent className="p-5">
                <h3 className="mb-4 font-bold text-slate-900">
                  {language === 'th' ? 'ลิงก์ที่มีประโยชน์' : 'Helpful Links'}
                </h3>
                <ul className="space-y-3">
                  {externalLinks.map((link, i) => (
                    <li key={i}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block rounded-lg p-2 transition-colors hover:bg-slate-50"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-900 group-hover:text-teal-600">
                            {language === 'th' ? link.nameThai : link.name}
                          </span>
                          <ExternalLink className="h-4 w-4 text-slate-400" />
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {language === 'th' ? link.descriptionThai : link.description}
                        </p>
                      </a>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Request Resource */}
            <Card className="border-teal-200 bg-teal-50">
              <CardContent className="p-5 text-center">
                <h3 className="mb-2 font-bold text-teal-900">
                  {language === 'th' ? 'ต้องการทรัพยากร?' : 'Need a Resource?'}
                </h3>
                <p className="mb-4 text-sm text-teal-700">
                  {language === 'th'
                    ? 'แจ้งให้เราทราบถ้าคุณกำลังมองหาสิ่งที่เฉพาะเจาะจง'
                    : "Let us know if you're looking for something specific"}
                </p>
                <Button
                  variant="outline"
                  className="border-teal-600 text-teal-600 hover:bg-teal-100"
                >
                  {language === 'th' ? 'ขอทรัพยากร' : 'Request Resource'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-slate-50 py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-slate-600 sm:px-6">
          <p>© 2026 Sing Buri Adventist Center. All rights reserved.</p>
        </div>
      </footer>
    </PublicLayout>
  );
}

export default ResourcesPage;
