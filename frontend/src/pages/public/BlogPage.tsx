/**
 * Blog/News Page
 *
 * Church blog with announcements, mission stories, and member testimonies
 */

import { useState, useMemo } from 'react';
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
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { blogPosts } from '@/data/blog';

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
  useDocumentTitle('Blog & News', 'บล็อกและข่าวสาร', language);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  const filteredPosts = useMemo(
    () =>
      blogPosts.filter((post) => {
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
      }),
    [selectedCategory, searchQuery, language]
  );

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
          <p className="mx-auto max-w-2xl text-lg text-blue-200">
            {language === 'th'
              ? 'อัปเดตล่าสุด ประกาศ และเรื่องราวที่สร้างแรงบันดาลใจจากชุมชนของเรา'
              : 'Latest updates, announcements, and inspiring stories from our community'}
          </p>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <div className="bg-muted py-8">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="mb-6 text-lg font-semibold text-foreground">
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
                      <h3 className="mt-2 font-bold text-foreground group-hover:text-primary">
                        {language === 'th' ? post.titleThai : post.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {language === 'th' ? post.excerptThai : post.excerpt}
                      </p>
                      <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
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
      <div className="sticky top-16 z-40 border-b bg-background/95 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder={language === 'th' ? 'ค้นหาบทความ...' : 'Search articles...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border py-2 pl-9 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-blue-200"
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
                    className={`flex cursor-pointer items-center gap-1 rounded-full px-3 py-1 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 ${
                      selectedCategory === cat.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-muted text-muted-foreground hover:bg-muted'
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
            {filteredPosts.slice(0, visibleCount).map((post) => (
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
                      <span className="rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-foreground/80">
                        <Tag className="mr-1 inline h-3 w-3" />
                        {language === 'th' ? post.categoryThai : post.category}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="mb-2 line-clamp-2 font-bold text-foreground group-hover:text-primary">
                      {language === 'th' ? post.titleThai : post.title}
                    </h3>
                    <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                      {language === 'th' ? post.excerptThai : post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
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
            <Newspaper className="mx-auto mb-4 h-12 w-12 text-blue-200" />
            <h3 className="mb-2 text-lg font-medium text-foreground">
              {language === 'th' ? 'ไม่พบบทความ' : 'No articles found'}
            </h3>
            <p className="text-muted-foreground">
              {language === 'th'
                ? 'ลองเปลี่ยนคำค้นหาหรือหมวดหมู่'
                : 'Try adjusting your search or category filter'}
            </p>
          </div>
        )}

        {/* Load More */}
        {filteredPosts.length > visibleCount && (
          <div className="mt-8 text-center">
            <Button variant="outline" onClick={() => setVisibleCount((prev) => prev + 6)}>
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
            {!newsletterSubmitted ? (
              <>
                <input
                  type="email"
                  name="email"
                  placeholder={language === 'th' ? 'อีเมลของคุณ' : 'Your email'}
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <Button
                  className="bg-white text-blue-600 hover:bg-blue-50"
                  onClick={() => {
                    if (newsletterEmail && newsletterEmail.includes('@')) {
                      setNewsletterSubmitted(true);
                    }
                  }}
                >
                  {language === 'th' ? 'สมัครรับข่าว' : 'Subscribe'}
                </Button>
              </>
            ) : (
              <p className="py-3 text-center text-blue-100" role="status" aria-live="polite">
                {language === 'th' ? 'ขอบคุณที่สมัคร!' : 'Thanks for subscribing!'}
              </p>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

export default BlogPage;
