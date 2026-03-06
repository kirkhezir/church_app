/**
 * Member Sermon Detail Page
 *
 * Full sermon view with YouTube embed, audio player, description,
 * share button, and related sermons. Uses SidebarLayout.
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
  Loader2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { SidebarLayout } from '@/components/layout';
import { sermonService, type Sermon } from '@/services/endpoints/sermonService';

function extractYoutubeId(url?: string | null): string | undefined {
  if (!url) return undefined;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/);
  return match ? match[1] : url;
}

export function MemberSermonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [shareMessage, setShareMessage] = useState('');
  const [sermon, setSermon] = useState<Sermon | null>(null);
  const [allSermons, setAllSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [sermonData, sermonsData] = await Promise.all([
          sermonService.getSermonById(id!),
          sermonService.getSermons(),
        ]);
        setSermon(sermonData);
        setAllSermons(sermonsData);
        sermonService.incrementViews(id!).catch(() => {});
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  if (loading) {
    return (
      <SidebarLayout
        breadcrumbs={[{ label: 'Sermons', href: '/app/sermons' }, { label: 'Loading...' }]}
      >
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </SidebarLayout>
    );
  }

  if (notFound || !sermon) {
    return <Navigate to="/app/sermons" replace />;
  }

  const youtubeId = extractYoutubeId(sermon.youtubeUrl);

  const seriesSermons = sermon.series
    ? allSermons.filter((s) => s.series === sermon.series && s.id !== sermon.id)
    : [];

  const speakerSermons = allSermons
    .filter((s) => s.speaker === sermon.speaker && s.id !== sermon.id)
    .slice(0, 3);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
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
          text: (sermon.description ?? '').split('\n')[0],
          url,
        });
      } catch {
        // Cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      setShareMessage('Link copied!');
      setTimeout(() => setShareMessage(''), 2000);
    }
  };

  return (
    <SidebarLayout
      breadcrumbs={[{ label: 'Sermons', href: '/app/sermons' }, { label: sermon.title }]}
    >
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        {/* Video / Thumbnail */}
        <div className="mb-6 overflow-hidden rounded-xl bg-slate-900">
          {youtubeId ? (
            <div className="relative aspect-video w-full">
              <iframe
                className="absolute inset-0 h-full w-full"
                src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
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
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90">
                    <Play className="ml-1 h-8 w-8 text-primary" />
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

        {/* Back Link */}
        <Link
          to="/app/sermons"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sermons
        </Link>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h1 className="mb-4 text-balance text-2xl font-bold text-foreground sm:text-3xl">
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
                className="relative flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Share2 className="h-4 w-4" />
                Share
                {shareMessage && (
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white">
                    {shareMessage}
                  </span>
                )}
              </button>
            </div>

            {/* Scripture */}
            {sermon.scripture && (
              <div className="mb-6 flex items-center gap-2 rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
                <BookOpen className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                <div>
                  <span className="text-xs font-medium uppercase tracking-wide text-amber-600 dark:text-amber-400">
                    Scripture
                  </span>
                  <p className="font-medium text-amber-900 dark:text-amber-200">
                    {sermon.scripture}
                  </p>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-4">
              {(sermon.description ?? '').split('\n\n').map((paragraph) => {
                const key = paragraph.slice(0, 60);
                if (paragraph.includes('\n- ')) {
                  const lines = paragraph.split('\n');
                  const heading = lines[0];
                  const items = lines.filter((l) => l.startsWith('- '));
                  return (
                    <div key={key}>
                      {heading && !heading.startsWith('- ') && (
                        <p className="mb-2 font-semibold text-foreground">
                          {heading.replace(/^- /, '')}
                        </p>
                      )}
                      <ul className="space-y-2 pl-1">
                        {items.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-muted-foreground">
                            <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                            {item.slice(2)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                }
                return (
                  <p key={key} className="leading-relaxed text-muted-foreground">
                    {paragraph}
                  </p>
                );
              })}
            </div>

            {/* Audio Player */}
            {sermon.audioUrl && (
              <div className="mt-8 rounded-lg border border-border p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground/80">
                  <Headphones className="h-4 w-4" />
                  Listen to Audio
                </div>
                <audio controls className="w-full" preload="metadata">
                  <source src={sermon.audioUrl} type="audio/mpeg" />
                  Your browser does not support audio.
                </audio>
              </div>
            )}

            {/* YouTube Link */}
            {youtubeId && (
              <a
                href={`https://www.youtube.com/watch?v=${youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 dark:border-red-800/30 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
              >
                <Youtube className="h-4 w-4" />
                Watch on YouTube
              </a>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {sermon.series && (
              <Card>
                <CardContent className="p-5">
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Sermon Series
                  </h2>
                  <p className="mb-4 text-lg font-bold text-foreground">{sermon.series}</p>
                  {seriesSermons.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-xs font-medium text-muted-foreground">
                        More from this series
                      </p>
                      {seriesSermons.map((s) => (
                        <Link
                          key={s.id}
                          to={`/app/sermons/${s.id}`}
                          className="group block rounded-lg border border-border p-3 transition-colors hover:border-primary/20 hover:bg-accent/50"
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

            <Card>
              <CardContent className="p-5">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Speaker
                </h2>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <p className="font-semibold text-foreground">{sermon.speaker}</p>
                </div>
                {speakerSermons.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-muted-foreground">
                      More from this speaker
                    </p>
                    {speakerSermons.map((s) => (
                      <Link
                        key={s.id}
                        to={`/app/sermons/${s.id}`}
                        className="group block rounded-lg border border-border p-3 transition-colors hover:border-primary/20 hover:bg-accent/50"
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
          </aside>
        </div>
      </div>
    </SidebarLayout>
  );
}

export default MemberSermonDetailPage;
