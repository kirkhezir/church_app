/**
 * Member Sermons Page
 *
 * Authenticated sermon archive with filtering, search, and pagination.
 * Uses SidebarLayout instead of PublicLayout.
 */

import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router';
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
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SidebarLayout } from '@/components/layout';
import { sermonService, type Sermon } from '@/services/endpoints/sermonService';
import { reportError } from '@/lib/errorReporting';

function extractYoutubeId(url?: string | null): string | undefined {
  if (!url) return undefined;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/);
  return match ? match[1] : url;
}

export function MemberSermonsPage() {
  const [allSermons, setAllSermons] = useState<Sermon[]>([]);
  const [speakerList, setSpeakerList] = useState<string[]>(['All Speakers']);
  const [seriesList, setSeriesList] = useState<string[]>(['All Series']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeries, setSelectedSeries] = useState('All Series');
  const [selectedSpeaker, setSelectedSpeaker] = useState('All Speakers');
  const [currentPage, setCurrentPage] = useState(1);
  const sermonsPerPage = 9;

  useEffect(() => {
    async function load() {
      try {
        const [sermonsData, speakers, series] = await Promise.all([
          sermonService.getSermons(),
          sermonService.getSpeakers(),
          sermonService.getSeries(),
        ]);
        setAllSermons(sermonsData);
        setSpeakerList(['All Speakers', ...speakers]);
        setSeriesList(['All Series', ...series]);
      } catch (err) {
        reportError('Failed to load sermons', err);
        setError('Failed to load sermons. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const sermons = useMemo(() => {
    let filtered = allSermons;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(term) ||
          (s.description ?? '').toLowerCase().includes(term) ||
          (s.scripture ?? '').toLowerCase().includes(term)
      );
    }

    if (selectedSeries !== 'All Series') {
      filtered = filtered.filter((s) => s.series === selectedSeries);
    }

    if (selectedSpeaker !== 'All Speakers') {
      filtered = filtered.filter((s) => s.speaker === selectedSpeaker);
    }

    return filtered;
  }, [searchTerm, selectedSeries, selectedSpeaker, allSermons]);

  const totalPages = Math.ceil(sermons.length / sermonsPerPage);
  const startIndex = (currentPage - 1) * sermonsPerPage;
  const displayedSermons = sermons.slice(startIndex, startIndex + sermonsPerPage);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  return (
    <SidebarLayout breadcrumbs={[{ label: 'Sermons' }]}>
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sermons</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Watch or listen to messages from our church family
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  name="sermon-search"
                  aria-label="Search sermons"
                  placeholder="Search sermons..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-4 text-sm text-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  name="sermon-series"
                  aria-label="Filter by series"
                  value={selectedSeries}
                  onChange={(e) => {
                    setSelectedSeries(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="rounded-lg border border-border bg-card py-2 pl-10 pr-8 text-sm text-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                >
                  {seriesList.map((series) => (
                    <option key={series} value={series}>
                      {series}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  name="sermon-speaker"
                  aria-label="Filter by speaker"
                  value={selectedSpeaker}
                  onChange={(e) => {
                    setSelectedSpeaker(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="rounded-lg border border-border bg-card py-2 pl-10 pr-8 text-sm text-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                >
                  {speakerList.map((speaker) => (
                    <option key={speaker} value={speaker}>
                      {speaker}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sermons Grid */}
            {displayedSermons.length === 0 ? (
              <div className="rounded-lg bg-card p-12 text-center">
                <p className="text-muted-foreground">No sermons found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {displayedSermons.map((sermon: Sermon) => (
                  <Link key={sermon.id} to={`/app/sermons/${sermon.id}`}>
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
                            <Play className="h-6 w-6 text-primary" />
                          </div>
                        </div>
                        {extractYoutubeId(sermon.youtubeUrl) && (
                          <div className="absolute bottom-2 right-2 rounded bg-red-600 px-2 py-0.5">
                            <Youtube className="h-4 w-4 text-white" />
                          </div>
                        )}
                        {!extractYoutubeId(sermon.youtubeUrl) && sermon.audioUrl && (
                          <div className="absolute bottom-2 right-2 rounded bg-primary px-2 py-0.5">
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
                        <h2 className="mb-1 line-clamp-2 text-balance font-semibold text-foreground group-hover:text-primary">
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-4 text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </SidebarLayout>
  );
}

export default MemberSermonsPage;
