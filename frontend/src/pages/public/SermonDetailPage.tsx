/**
 * Sermon Detail Page
 *
 * Full sermon view with:
 * - YouTube video embed or audio player
 * - Scripture reference
 * - Description
 * - Share functionality
 * - More from this series
 */

import { useParams, Link, Navigate } from 'react-router';
import {
  ArrowLeft,
  Calendar,
  Clock,
  BookOpen,
  User,
  Share2,
  Youtube,
  Headphones,
  Play,
} from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PublicLayout } from '@/layouts';
import { useI18n } from '@/i18n';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { sermons as allSermons } from '@/data/sermons';

export function SermonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { language } = useI18n();
  const [shareMessage, setShareMessage] = useState('');

  const sermon = allSermons.find((s) => s.id === id);

  useDocumentTitle(sermon?.title ?? 'Sermon', sermon?.title ?? 'คำเทศนา', language);

  if (!sermon) {
    return <Navigate to="/sermons" replace />;
  }

  // More from this series
  const seriesSermons = sermon.series
    ? allSermons.filter((s) => s.series === sermon.series && s.id !== sermon.id)
    : [];

  // More from this speaker
  const speakerSermons = allSermons
    .filter((s) => s.speaker === sermon.speaker && s.id !== sermon.id)
    .slice(0, 3);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: sermon.title,
          text: sermon.description.split('\n')[0],
          url,
        });
      } catch {
        // Cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      setShareMessage(language === 'th' ? 'คัดลอกลิงก์แล้ว!' : 'Link copied!');
      setTimeout(() => setShareMessage(''), 2000);
    }
  };

  return (
    <PublicLayout>
      <div className="bg-white dark:bg-slate-950">
        {/* Video / Thumbnail Hero */}
        <div className="bg-slate-900">
          <div className="mx-auto max-w-5xl">
            {sermon.youtubeId ? (
              <div className="relative aspect-video w-full">
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={`https://www.youtube.com/embed/${sermon.youtubeId}?rel=0`}
                  title={sermon.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : sermon.thumbnailUrl ? (
              <div className="relative aspect-video w-full">
                <img
                  src={sermon.thumbnailUrl}
                  alt={sermon.title}
                  className="h-full w-full object-cover"
                />
                {sermon.audioUrl && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90">
                        <Play className="ml-1 h-8 w-8 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-white">
                        {language === 'th' ? 'เล่นเสียง' : 'Play Audio'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex aspect-video w-full items-center justify-center bg-gradient-to-br from-blue-900 to-slate-900">
                <Headphones className="h-20 w-20 text-white/30" />
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
          {/* Back Link */}
          <Link
            to="/sermons"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary dark:text-muted-foreground dark:hover:text-blue-400"
          >
            <ArrowLeft className="h-4 w-4" />
            {language === 'th' ? 'กลับไปคำเทศนา' : 'Back to Sermons'}
          </Link>

          {/* Main Content Grid */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left: Main Content */}
            <div className="lg:col-span-2">
              {/* Title & Meta */}
              <h1 className="mb-4 text-2xl font-bold text-foreground sm:text-3xl text-balance">
                {sermon.title}
              </h1>

              <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  {sermon.speaker}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {formatDate(sermon.date)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {sermon.duration}
                </span>
                <button
                  onClick={handleShare}
                  className="relative flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-slate-800"
                >
                  <Share2 className="h-4 w-4" />
                  {language === 'th' ? 'แชร์' : 'Share'}
                  {shareMessage && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white dark:bg-muted dark:text-slate-800">
                      {shareMessage}
                    </span>
                  )}
                </button>
              </div>

              {/* Scripture Reference */}
              <div className="mb-6 flex items-center gap-2 rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
                <BookOpen className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                <div>
                  <span className="text-xs font-medium uppercase tracking-wide text-amber-600 dark:text-amber-400">
                    {language === 'th' ? 'ข้อพระคัมภีร์' : 'Scripture'}
                  </span>
                  <p className="font-medium text-amber-900 dark:text-amber-200">
                    {sermon.scripture}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="prose-like space-y-4">
                {sermon.description.split('\n\n').map((paragraph, i) => {
                  // Handle key takeaways list
                  if (paragraph.includes('\n- ')) {
                    const lines = paragraph.split('\n');
                    const heading = lines[0];
                    const items = lines.filter((l) => l.startsWith('- '));
                    return (
                      <div key={i}>
                        {heading && !heading.startsWith('- ') && (
                          <p className="mb-2 font-semibold text-foreground">
                            {heading.replace(/^- /, '')}
                          </p>
                        )}
                        <ul className="space-y-2 pl-1">
                          {items.map((item, j) => (
                            <li
                              key={j}
                              className="flex items-start gap-2 text-muted-foreground"
                            >
                              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                              {item.slice(2)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  }
                  return (
                    <p key={i} className="leading-relaxed text-muted-foreground">
                      {paragraph}
                    </p>
                  );
                })}
              </div>

              {/* Audio Player */}
              {sermon.audioUrl && (
                <div className="mt-8 rounded-lg border border-border p-4 dark:border-border">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground/80">
                    <Headphones className="h-4 w-4" />
                    {language === 'th' ? 'ฟังเสียง' : 'Listen to Audio'}
                  </div>
                  <audio controls className="w-full" preload="metadata">
                    <source src={sermon.audioUrl} type="audio/mpeg" />
                    {language === 'th'
                      ? 'เบราว์เซอร์ของคุณไม่รองรับเสียง'
                      : 'Your browser does not support audio.'}
                  </audio>
                </div>
              )}

              {/* YouTube Link */}
              {sermon.youtubeId && (
                <a
                  href={`https://www.youtube.com/watch?v=${sermon.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 dark:border-red-800/30 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                >
                  <Youtube className="h-4 w-4" />
                  {language === 'th' ? 'ดูบน YouTube' : 'Watch on YouTube'}
                </a>
              )}
            </div>

            {/* Right: Sidebar */}
            <aside className="space-y-6">
              {/* Series Card */}
              {sermon.series && (
                <Card>
                  <CardContent className="p-5">
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground text-balance">
                      {language === 'th' ? 'ชุดเทศนา' : 'Sermon Series'}
                    </h2>
                    <p className="mb-4 text-lg font-bold text-foreground">
                      {sermon.series}
                    </p>
                    {seriesSermons.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-xs font-medium text-muted-foreground">
                          {language === 'th' ? 'เทศนาอื่นในชุดนี้' : 'More from this series'}
                        </p>
                        {seriesSermons.map((s) => (
                          <Link
                            key={s.id}
                            to={`/sermons/${s.id}`}
                            className="group block rounded-lg border border-border p-3 transition-colors hover:border-blue-200 hover:bg-blue-50/50 dark:hover:border-blue-800 dark:hover:bg-blue-900/10"
                          >
                            <p className="text-sm font-medium text-foreground group-hover:text-primary">
                              {s.title}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {s.speaker} &middot; {formatDate(s.date)}
                            </p>
                          </Link>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Speaker Card */}
              <Card>
                <CardContent className="p-5">
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground text-balance">
                    {language === 'th' ? 'ผู้เทศนา' : 'Speaker'}
                  </h2>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                      <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="font-semibold text-foreground">
                      {sermon.speaker}
                    </p>
                  </div>
                  {speakerSermons.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-xs font-medium text-muted-foreground">
                        {language === 'th' ? 'เทศนาอื่นโดยผู้นี้' : 'More from this speaker'}
                      </p>
                      {speakerSermons.map((s) => (
                        <Link
                          key={s.id}
                          to={`/sermons/${s.id}`}
                          className="group block rounded-lg border border-border p-3 transition-colors hover:border-blue-200 hover:bg-blue-50/50 dark:hover:border-blue-800 dark:hover:bg-blue-900/10"
                        >
                          <p className="text-sm font-medium text-foreground group-hover:text-primary">
                            {s.title}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatDate(s.date)} &middot; {s.duration}
                          </p>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardContent className="space-y-3 p-5">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground text-balance">
                    {language === 'th' ? 'ลิงก์ด่วน' : 'Quick Links'}
                  </h2>
                  <Link to="/sermons">
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      {language === 'th' ? 'คำเทศนาทั้งหมด' : 'All Sermons'}
                    </Button>
                  </Link>
                  <Link to="/events">
                    <Button variant="outline" size="sm" className="mt-2 w-full justify-start gap-2">
                      <Calendar className="h-4 w-4" />
                      {language === 'th' ? 'กิจกรรม' : 'Events'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

export default SermonDetailPage;
