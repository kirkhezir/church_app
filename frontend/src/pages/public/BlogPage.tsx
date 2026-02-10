/**
 * Blog/News Page
 *
 * Church blog with announcements, mission stories, and member testimonies
 */

import { useState } from 'react';
import { Link } from 'react-router';
import {
  Newspaper,
  Calendar,
  User,
  Tag,
  ChevronRight,
  Search,
  BookOpen,
  Heart,
  Globe,
  Bell,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PublicLayout } from '@/layouts';
import { useI18n } from '@/i18n';

interface BlogPost {
  id: string;
  title: string;
  titleThai: string;
  excerpt: string;
  excerptThai: string;
  content?: string;
  contentThai?: string;
  author: string;
  date: string;
  category: string;
  categoryThai: string;
  image: string;
  featured?: boolean;
  readTime: number;
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Youth Camp 2026 Registration Now Open!',
    titleThai: 'เปิดลงทะเบียนค่ายเยาวชน 2026 แล้ว!',
    excerpt:
      'Join us for an unforgettable weekend of spiritual growth, fellowship, and adventure. Early bird registration is available until March 1st.',
    excerptThai:
      'ร่วมสุดสัปดาห์ที่ไม่มีวันลืมของการเติบโตฝ่ายจิตวิญญาณ สามัคคีธรรม และการผจญภัย ลงทะเบียนล่วงหน้าถึงวันที่ 1 มีนาคม',
    author: 'Youth Ministry',
    date: '2026-01-28',
    category: 'Announcement',
    categoryThai: 'ประกาศ',
    image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&q=80',
    featured: true,
    readTime: 3,
  },
  {
    id: '2',
    title: 'Testimony: How God Changed My Life',
    titleThai: 'คำพยาน: พระเจ้าเปลี่ยนแปลงชีวิตฉันอย่างไร',
    excerpt:
      'Sister Nok shares her powerful testimony of how she found Jesus and experienced transformation through His love and grace.',
    excerptThai:
      'ซิสเตอร์นกแบ่งปันคำพยานอันทรงพลังของเธอว่าเธอพบพระเยซูและประสบการเปลี่ยนแปลงผ่านความรักและพระคุณของพระองค์อย่างไร',
    author: 'Sister Nok',
    date: '2026-01-25',
    category: 'Testimony',
    categoryThai: 'คำพยาน',
    image: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&q=80',
    featured: true,
    readTime: 5,
  },
  {
    id: '3',
    title: 'Mission Report: Thailand Mission Field Update',
    titleThai: 'รายงานมิชชั่น: อัปเดตสนามมิชชั่นประเทศไทย',
    excerpt:
      'Read about the progress of our mission work in northern Thailand and how your prayers and offerings are making a difference.',
    excerptThai:
      'อ่านเกี่ยวกับความก้าวหน้าของงานมิชชั่นในภาคเหนือของประเทศไทยและคำอธิษฐานและเงินถวายของคุณสร้างความแตกต่างอย่างไร',
    author: 'Mission Department',
    date: '2026-01-22',
    category: 'Missions',
    categoryThai: 'มิชชั่น',
    image: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&q=80',
    readTime: 7,
  },
  {
    id: '4',
    title: 'Health Tips: Starting Your Plant-Based Journey',
    titleThai: 'เคล็ดลับสุขภาพ: เริ่มต้นการกินอาหารจากพืช',
    excerpt:
      'Discover the benefits of a plant-based diet and get practical tips for transitioning to healthier eating habits.',
    excerptThai:
      'ค้นพบประโยชน์ของอาหารจากพืชและรับเคล็ดลับปฏิบัติสำหรับการเปลี่ยนไปสู่นิสัยการกินที่ดีต่อสุขภาพ',
    author: 'Health Ministry',
    date: '2026-01-20',
    category: 'Health',
    categoryThai: 'สุขภาพ',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80',
    readTime: 6,
  },
  {
    id: '5',
    title: 'Baptism Sabbath: Celebrating New Members',
    titleThai: 'สะบาโตบัพติศมา: ฉลองสมาชิกใหม่',
    excerpt:
      'We rejoice with three new members who publicly declared their faith through baptism last Sabbath.',
    excerptThai:
      'เราชื่นชมยินดีกับสมาชิกใหม่สามคนที่ประกาศความเชื่อต่อสาธารณะผ่านบัพติศมาเมื่อวันสะบาโตที่แล้ว',
    author: 'Church Clerk',
    date: '2026-01-18',
    category: 'News',
    categoryThai: 'ข่าว',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80',
    readTime: 4,
  },
  {
    id: '6',
    title: "Sabbath School: This Week's Lesson Overview",
    titleThai: 'โรงเรียนสะบาโต: ภาพรวมบทเรียนสัปดาห์นี้',
    excerpt:
      "A summary of this week's Adult Sabbath School lesson with discussion questions and key takeaways.",
    excerptThai: 'สรุปบทเรียนโรงเรียนสะบาโตผู้ใหญ่สัปดาห์นี้พร้อมคำถามอภิปรายและประเด็นสำคัญ',
    author: 'Sabbath School',
    date: '2026-01-15',
    category: 'Education',
    categoryThai: 'การศึกษา',
    image: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&q=80',
    readTime: 8,
  },
];

const categories = [
  { id: 'all', name: 'All', nameThai: 'ทั้งหมด', icon: Newspaper },
  { id: 'Announcement', name: 'Announcements', nameThai: 'ประกาศ', icon: Bell },
  { id: 'Testimony', name: 'Testimonies', nameThai: 'คำพยาน', icon: Heart },
  { id: 'Missions', name: 'Missions', nameThai: 'มิชชั่น', icon: Globe },
  { id: 'News', name: 'News', nameThai: 'ข่าว', icon: Newspaper },
  { id: 'Education', name: 'Education', nameThai: 'การศึกษา', icon: BookOpen },
];

export function BlogPage() {
  const { language } = useI18n();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      (language === 'th' ? post.titleThai : post.title)
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (language === 'th' ? post.excerptThai : post.excerpt)
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPosts = blogPosts.filter((post) => post.featured);

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-12 pt-24">
        <div className="mx-auto max-w-6xl px-4 text-center text-white sm:px-6">
          <Newspaper className="mx-auto mb-4 h-12 w-12 text-blue-400" />
          <h1 className="mb-4 text-4xl font-bold sm:text-5xl">
            {language === 'th' ? 'ข่าวสารและบทความ' : 'News & Blog'}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-300">
            {language === 'th'
              ? 'อัปเดตล่าสุด ประกาศ และเรื่องราวที่สร้างแรงบันดาลใจจากชุมชนของเรา'
              : 'Latest updates, announcements, and inspiring stories from our community'}
          </p>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <div className="bg-slate-50 py-8">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="mb-6 text-lg font-semibold text-slate-900">
              {language === 'th' ? 'บทความเด่น' : 'Featured Stories'}
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {featuredPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.id}`}
                  className="group overflow-hidden rounded-xl bg-white shadow-md transition-shadow hover:shadow-xl"
                >
                  <div className="grid sm:grid-cols-2">
                    <div className="relative h-48 sm:h-full">
                      <img
                        src={post.image}
                        alt={language === 'th' ? post.titleThai : post.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute left-3 top-3 rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white">
                        {language === 'th' ? 'เด่น' : 'Featured'}
                      </div>
                    </div>
                    <div className="p-5">
                      <span className="text-xs font-medium text-blue-600">
                        {language === 'th' ? post.categoryThai : post.category}
                      </span>
                      <h3 className="mt-2 font-bold text-slate-900 group-hover:text-blue-600">
                        {language === 'th' ? post.titleThai : post.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                        {language === 'th' ? post.excerptThai : post.excerpt}
                      </p>
                      <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(post.date).toLocaleDateString(
                            language === 'th' ? 'th-TH' : 'en-US',
                            { month: 'short', day: 'numeric' }
                          )}
                        </span>
                        <span>•</span>
                        <span>
                          {post.readTime} {language === 'th' ? 'นาที' : 'min read'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="sticky top-16 z-40 border-b bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={language === 'th' ? 'ค้นหาบทความ...' : 'Search articles...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    {language === 'th' ? cat.nameThai : cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {filteredPosts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => (
              <Link key={post.id} to={`/blog/${post.id}`}>
                <Card className="group h-full overflow-hidden transition-shadow hover:shadow-xl">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={post.image}
                      alt={language === 'th' ? post.titleThai : post.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute left-3 top-3">
                      <span className="rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-slate-700">
                        <Tag className="mr-1 inline h-3 w-3" />
                        {language === 'th' ? post.categoryThai : post.category}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="mb-2 line-clamp-2 font-bold text-slate-900 group-hover:text-blue-600">
                      {language === 'th' ? post.titleThai : post.title}
                    </h3>
                    <p className="mb-4 line-clamp-2 text-sm text-slate-600">
                      {language === 'th' ? post.excerptThai : post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(post.date).toLocaleDateString(
                            language === 'th' ? 'th-TH' : 'en-US',
                            { month: 'short', day: 'numeric' }
                          )}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <Newspaper className="mx-auto mb-4 h-12 w-12 text-slate-300" />
            <h3 className="mb-2 text-lg font-medium text-slate-900">
              {language === 'th' ? 'ไม่พบบทความ' : 'No articles found'}
            </h3>
            <p className="text-slate-500">
              {language === 'th'
                ? 'ลองเปลี่ยนคำค้นหาหรือหมวดหมู่'
                : 'Try adjusting your search or category filter'}
            </p>
          </div>
        )}

        {/* Load More */}
        {filteredPosts.length > 0 && (
          <div className="mt-8 text-center">
            <Button variant="outline">
              {language === 'th' ? 'โหลดเพิ่มเติม' : 'Load More'}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Newsletter CTA */}
        <div className="mt-16 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center text-white">
          <h2 className="mb-2 text-2xl font-bold">
            {language === 'th' ? 'ไม่พลาดการอัปเดต!' : 'Stay Updated!'}
          </h2>
          <p className="mb-6 text-blue-100">
            {language === 'th'
              ? 'สมัครรับจดหมายข่าวเพื่อรับข่าวสารและบทความล่าสุด'
              : 'Subscribe to our newsletter for the latest news and articles'}
          </p>
          <div className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder={language === 'th' ? 'อีเมลของคุณ' : 'Your email'}
              className="flex-1 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <Button className="bg-white text-blue-600 hover:bg-blue-50">
              {language === 'th' ? 'สมัครรับข่าว' : 'Subscribe'}
            </Button>
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

export default BlogPage;
