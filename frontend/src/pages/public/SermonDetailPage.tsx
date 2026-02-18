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

interface Sermon {
  id: string;
  title: string;
  speaker: string;
  date: string;
  duration: string;
  description: string;
  scripture: string;
  youtubeId?: string;
  audioUrl?: string;
  thumbnailUrl?: string;
  series?: string;
}

// Static sermon data — matches SermonsPage data
const allSermons: Sermon[] = [
  {
    id: '1',
    title: 'The Power of Faith in Uncertain Times',
    speaker: 'Pastor Somchai',
    date: '2026-01-25',
    duration: '45 min',
    description:
      "Exploring how faith sustains us through life's challenges, drawing from Daniel's story. In this powerful message, Pastor Somchai takes us through the book of Daniel, showing how three young men stood firm in their faith even when facing a fiery furnace.\n\nKey takeaways:\n- Faith is not the absence of fear, but trusting God in spite of it\n- God doesn't always remove the fire, but He walks with us through it\n- Our faithfulness in small things prepares us for bigger tests\n- Community strengthens our individual faith\n\nThis sermon is part of the Faith Foundations series, designed to help believers build a strong spiritual foundation for everyday life.",
    scripture: 'Daniel 3:17-18',
    youtubeId: 'JG82QxIgb3Y',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=640&h=360&fit=crop&q=80',
    series: 'Faith Foundations',
  },
  {
    id: '2',
    title: 'Walking in the Light',
    speaker: 'Elder Prasert',
    date: '2026-01-18',
    duration: '38 min',
    description:
      "Understanding what it means to walk in God's light and be a light to others. Elder Prasert unpacks the practical implications of John's teaching about light and darkness.\n\nKey takeaways:\n- Walking in the light means living transparently before God\n- Fellowship with one another is a natural result of walking in light\n- The blood of Jesus continually cleanses us as we walk in the light\n- Being a light means letting Christ shine through our daily actions",
    scripture: '1 John 1:5-7',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=640&h=360&fit=crop&q=80',
    series: 'The Epistle of John',
  },
  {
    id: '3',
    title: 'The Sabbath Rest',
    speaker: 'Pastor Somchai',
    date: '2026-01-11',
    duration: '42 min',
    description:
      'Discovering the blessing and meaning of Sabbath rest in our busy modern lives. Pastor Somchai explores the Hebrew concept of rest and how the Sabbath is a gift from God for our physical, mental, and spiritual renewal.\n\nKey takeaways:\n- The Sabbath was made for humanity, not humanity for the Sabbath\n- True Sabbath rest involves ceasing from our own works and resting in God\n- The Sabbath points forward to the eternal rest we will experience in heaven\n- Keeping the Sabbath is an act of trust in God as our Provider',
    scripture: 'Hebrews 4:9-11',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=640&h=360&fit=crop&q=80',
    series: 'Foundations of Faith',
  },
  {
    id: '4',
    title: 'Grace That Transforms',
    speaker: 'Pastor Somchai',
    date: '2026-01-04',
    duration: '40 min',
    description:
      "Understanding God's transforming grace and how it changes our daily lives. In this message, we explore how grace is not just a one-time event at salvation, but a daily transforming power.\n\nKey takeaways:\n- Grace is unmerited favor — we cannot earn it\n- Grace doesn't just save us; it transforms us\n- Living in grace means extending grace to others\n- Grace empowers us to live differently",
    scripture: 'Ephesians 2:8-9',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1445633883498-7f9922d37a3f?w=640&h=360&fit=crop&q=80',
    series: 'Foundations of Faith',
  },
  {
    id: '5',
    title: 'The Joy of Service',
    speaker: 'Elder Prasert',
    date: '2025-12-28',
    duration: '35 min',
    description:
      "Discovering joy in serving others as Jesus served us. Elder Prasert shares practical ways to serve in our community and explains why service brings such deep fulfillment.\n\nKey takeaways:\n- Jesus modeled servant leadership for us\n- True greatness in God's kingdom is measured by service\n- Service opportunities are all around us\n- Joy in service comes from losing ourselves for others",
    scripture: 'Mark 10:45',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=640&h=360&fit=crop&q=80',
    series: 'Living Like Jesus',
  },
  {
    id: '6',
    title: 'Hope for Tomorrow',
    speaker: 'Pastor Somchai',
    date: '2025-12-21',
    duration: '50 min',
    description:
      'The blessed hope of Christ\'s return and what it means for us today. This Advent-season message explores the promise of Jesus\' second coming and how this hope shapes our daily lives.\n\nKey takeaways:\n- The second coming is the "blessed hope" of every believer\n- This hope motivates holy living\n- We should live in readiness, not fear\n- The return of Christ will end all suffering and restore all things',
    scripture: 'Titus 2:13',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1489549132488-d00b7eee80f1?w=640&h=360&fit=crop&q=80',
    series: 'Advent Hope',
  },
];

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
            className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
          >
            <ArrowLeft className="h-4 w-4" />
            {language === 'th' ? 'กลับไปคำเทศนา' : 'Back to Sermons'}
          </Link>

          {/* Main Content Grid */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left: Main Content */}
            <div className="lg:col-span-2">
              {/* Title & Meta */}
              <h1 className="mb-4 text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">
                {sermon.title}
              </h1>

              <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
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
                  className="relative flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Share2 className="h-4 w-4" />
                  {language === 'th' ? 'แชร์' : 'Share'}
                  {shareMessage && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white dark:bg-slate-200 dark:text-slate-800">
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
                          <p className="mb-2 font-semibold text-slate-900 dark:text-slate-100">
                            {heading.replace(/^- /, '')}
                          </p>
                        )}
                        <ul className="space-y-2 pl-1">
                          {items.map((item, j) => (
                            <li
                              key={j}
                              className="flex items-start gap-2 text-slate-600 dark:text-slate-400"
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
                    <p key={i} className="leading-relaxed text-slate-600 dark:text-slate-400">
                      {paragraph}
                    </p>
                  );
                })}
              </div>

              {/* Audio Player */}
              {sermon.audioUrl && (
                <div className="mt-8 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
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
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {language === 'th' ? 'ชุดเทศนา' : 'Sermon Series'}
                    </h3>
                    <p className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100">
                      {sermon.series}
                    </p>
                    {seriesSermons.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {language === 'th' ? 'เทศนาอื่นในชุดนี้' : 'More from this series'}
                        </p>
                        {seriesSermons.map((s) => (
                          <Link
                            key={s.id}
                            to={`/sermons/${s.id}`}
                            className="group block rounded-lg border border-slate-100 p-3 transition-colors hover:border-blue-200 hover:bg-blue-50/50 dark:border-slate-800 dark:hover:border-blue-800 dark:hover:bg-blue-900/10"
                          >
                            <p className="text-sm font-medium text-slate-900 group-hover:text-blue-600 dark:text-slate-100">
                              {s.title}
                            </p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
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
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {language === 'th' ? 'ผู้เทศนา' : 'Speaker'}
                  </h3>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                      <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {sermon.speaker}
                    </p>
                  </div>
                  {speakerSermons.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {language === 'th' ? 'เทศนาอื่นโดยผู้นี้' : 'More from this speaker'}
                      </p>
                      {speakerSermons.map((s) => (
                        <Link
                          key={s.id}
                          to={`/sermons/${s.id}`}
                          className="group block rounded-lg border border-slate-100 p-3 transition-colors hover:border-blue-200 hover:bg-blue-50/50 dark:border-slate-800 dark:hover:border-blue-800 dark:hover:bg-blue-900/10"
                        >
                          <p className="text-sm font-medium text-slate-900 group-hover:text-blue-600 dark:text-slate-100">
                            {s.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
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
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {language === 'th' ? 'ลิงก์ด่วน' : 'Quick Links'}
                  </h3>
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
