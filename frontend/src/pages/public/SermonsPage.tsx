/**
 * Sermons Page
 *
 * Archive of all church sermons with filtering and search
 * Links to YouTube or audio files
 */

import { useState, useMemo } from 'react';
import {
  Play,
  Search,
  Calendar,
  Clock,
  BookOpen,
  Filter,
  Headphones,
  Youtube,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react';
import { Link } from 'react-router';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { PublicLayout } from '../../layouts';
import { useI18n } from '../../i18n';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { sermons as allSermons, seriesList, speakerList } from '@/data/sermons';

export function SermonsPage() {
  const { language } = useI18n();
  useDocumentTitle('Sermons', 'คำเทศนา', language);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeries, setSelectedSeries] = useState('All Series');
  const [selectedSpeaker, setSelectedSpeaker] = useState('All Speakers');
  const [currentPage, setCurrentPage] = useState(1);
  // selectedSermon state removed — sermon cards now navigate to /sermons/:id
  const sermonsPerPage = 6;

  // Filter sermons (memoized to avoid extra re-renders)
  const sermons = useMemo(() => {
    let filtered = allSermons;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(term) ||
          s.description.toLowerCase().includes(term) ||
          s.scripture.toLowerCase().includes(term)
      );
    }

    if (selectedSeries !== 'All Series') {
      filtered = filtered.filter((s) => s.series === selectedSeries);
    }

    if (selectedSpeaker !== 'All Speakers') {
      filtered = filtered.filter((s) => s.speaker === selectedSpeaker);
    }

    return filtered;
  }, [searchTerm, selectedSeries, selectedSpeaker]);

  // Pagination
  const totalPages = Math.ceil(sermons.length / sermonsPerPage);
  const startIndex = (currentPage - 1) * sermonsPerPage;
  const displayedSermons = sermons.slice(startIndex, startIndex + sermonsPerPage);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <PublicLayout>
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 pb-12 pt-20 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h1 className="text-3xl font-bold sm:text-4xl">
            {language === 'th' ? 'คำเทศนา' : 'Sermons'}
          </h1>
          <p className="mt-2 text-lg text-blue-100">
            {language === 'th'
              ? 'รับชมหรือรับฟังข้อความจากครอบครัวโบสถ์ของเรา'
              : 'Watch or listen to messages from our church family'}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Filters */}
        <section className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder={language === 'th' ? 'ค้นหาคำเทศนา...' : 'Search sermons...'}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            {/* Series Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <select
                value={selectedSeries}
                onChange={(e) => {
                  setSelectedSeries(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-border bg-card py-2 pl-10 pr-8 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {seriesList.map((series) => (
                  <option key={series} value={series}>
                    {series}
                  </option>
                ))}
              </select>
            </div>
            {/* Speaker Filter */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <select
                value={selectedSpeaker}
                onChange={(e) => {
                  setSelectedSpeaker(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-border bg-card py-2 pl-10 pr-8 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {speakerList.map((speaker) => (
                  <option key={speaker} value={speaker}>
                    {speaker}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Sermons Grid */}
        <section className="mb-8">
          {displayedSermons.length === 0 ? (
            <div className="rounded-lg bg-card p-12 text-center">
              <p className="text-muted-foreground">
                {language === 'th'
                  ? 'ไม่พบคำเทศนาที่ตรงกับเกณฑ์ของคุณ'
                  : 'No sermons found matching your criteria.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {displayedSermons.map((sermon) => (
                <Link key={sermon.id} to={`/sermons/${sermon.id}`}>
                  <Card className="group cursor-pointer overflow-hidden transition-shadow hover:shadow-lg">
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      {sermon.thumbnailUrl ? (
                        <img
                          src={sermon.thumbnailUrl}
                          alt={sermon.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-muted">
                          <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white">
                          <Play className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      {sermon.youtubeId && (
                        <div className="absolute bottom-2 right-2 rounded bg-red-600 px-2 py-0.5">
                          <Youtube className="h-4 w-4 text-white" />
                        </div>
                      )}
                      {!sermon.youtubeId && sermon.audioUrl && (
                        <div className="absolute bottom-2 right-2 rounded bg-blue-600 px-2 py-0.5">
                          <Headphones className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(sermon.date)}
                        <span className="text-border">•</span>
                        <Clock className="h-3 w-3" />
                        {sermon.duration}
                      </div>
                      <h2 className="mb-1 line-clamp-2 font-semibold text-foreground group-hover:text-primary">
                        {sermon.title}
                      </h2>
                      <p className="mb-2 text-sm text-muted-foreground">{sermon.speaker}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <BookOpen className="h-3 w-3" />
                        {sermon.scripture}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-4 text-sm text-muted-foreground">
              {language === 'th' ? 'หน้า' : 'Page'} {currentPage} {language === 'th' ? 'จาก' : 'of'}{' '}
              {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}

export default SermonsPage;
