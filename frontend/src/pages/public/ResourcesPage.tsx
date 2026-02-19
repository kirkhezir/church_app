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
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { resources, resourceCategories as categories, externalLinks } from '@/data/resources';

export function ResourcesPage() {
  const { language } = useI18n();
  useDocumentTitle('Resources', 'ทรัพยากร', language);
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
          <h1 className="mb-4 text-balance text-4xl font-bold sm:text-5xl">
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
      <div className="sticky top-16 z-40 border-b bg-background/95 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder={language === 'th' ? 'ค้นหาทรัพยากร...' : 'Search resources...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border py-2 pl-9 pr-4 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`cursor-pointer whitespace-nowrap rounded-full px-3 py-1 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-1 ${
                    selectedCategory === cat.id
                      ? 'bg-teal-600 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted'
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
            <h2 className="mb-6 text-balance text-lg font-semibold text-foreground">
              {selectedCategory === 'all'
                ? language === 'th'
                  ? 'ทรัพยากรทั้งหมด'
                  : 'All Resources'
                : categories.find((c) => c.id === selectedCategory)?.[
                    language === 'th' ? 'nameThai' : 'name'
                  ]}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
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
                              alt={language === 'th' ? resource.titleThai : resource.title}
                              loading="lazy"
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
                              <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                {language === 'th' ? resource.categoryThai : resource.category}
                              </span>
                              {resource.type === 'video' && resource.duration && (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {resource.duration}
                                </span>
                              )}
                            </div>
                            <h3 className="font-semibold text-foreground">
                              {language === 'th' ? resource.titleThai : resource.title}
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {language === 'th' ? resource.descriptionThai : resource.description}
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              {resource.author && (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Users className="h-3 w-3" />
                                  {resource.author}
                                </span>
                              )}
                              {resource.date && (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
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
                <BookOpen className="mx-auto mb-4 h-12 w-12 text-blue-200" />
                <h3 className="mb-2 text-lg font-medium text-foreground">
                  {language === 'th' ? 'ไม่พบทรัพยากร' : 'No resources found'}
                </h3>
                <p className="text-muted-foreground">
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
                <h3 className="mb-4 flex items-center gap-2 font-bold text-foreground">
                  <Bookmark className="h-5 w-5 text-teal-600" />
                  {language === 'th' ? 'เข้าถึงด่วน' : 'Quick Access'}
                </h3>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="https://ssnet.org/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg p-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
                    >
                      <BookOpen className="h-4 w-4 text-teal-600" />
                      {language === 'th' ? 'บทเรียนสะบาโตสัปดาห์นี้' : "This Week's SS Lesson"}
                      <ExternalLink className="ml-auto h-3 w-3" />
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="flex items-center gap-2 rounded-lg p-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
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
                      className="flex items-center gap-2 rounded-lg p-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
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
                <h3 className="mb-4 font-bold text-foreground">
                  {language === 'th' ? 'ลิงก์ที่มีประโยชน์' : 'Helpful Links'}
                </h3>
                <ul className="space-y-3">
                  {externalLinks.map((link, i) => (
                    <li key={i}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block rounded-lg p-2 transition-colors hover:bg-muted"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground group-hover:text-teal-600">
                            {language === 'th' ? link.nameThai : link.name}
                          </span>
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
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
                  onClick={() => {
                    window.location.href =
                      'mailto:info@singburiadventist.org?subject=' +
                      encodeURIComponent(language === 'th' ? 'ขอทรัพยากร' : 'Resource Request');
                  }}
                >
                  {language === 'th' ? 'ขอทรัพยากร' : 'Request Resource'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

export default ResourcesPage;
