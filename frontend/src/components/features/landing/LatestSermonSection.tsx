/**
 * Latest Sermon Section Component
 *
 * Displays the most recent sermon with video/audio player
 * Links to full sermon archive
 *
 * UI/UX Best Practices:
 * - Prominent video display
 * - Easy access to past sermons
 * - Mobile-responsive embed
 * - Fallback for no video
 */

import { useState, useEffect } from 'react';
import {
  Play,
  Calendar,
  User,
  Clock,
  BookOpen,
  ExternalLink,
  Youtube,
  ChevronRight,
  Headphones,
} from 'lucide-react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';

interface Sermon {
  id: string;
  title: string;
  speaker: string;
  date: string;
  duration: string;
  description: string;
  scripture: string;
  videoUrl?: string;
  audioUrl?: string;
  youtubeId?: string;
  thumbnailUrl?: string;
  series?: string;
}

// Sample sermons data (will be replaced by CMS/API)
const sampleSermons: Sermon[] = [
  {
    id: '1',
    title: 'The Power of Faith in Uncertain Times',
    speaker: 'Pastor Somchai',
    date: '2026-01-25',
    duration: '45 min',
    description:
      "Exploring how faith sustains us through life's challenges and uncertainties, drawing from the story of Daniel.",
    scripture: 'Daniel 3:17-18',
    youtubeId: 'dQw4w9WgXcQ', // Placeholder - replace with actual sermon
    thumbnailUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=640&h=360&fit=crop&q=80',
    series: 'Faith Foundations',
  },
  {
    id: '2',
    title: 'Walking in the Light',
    speaker: 'Elder Prasert',
    date: '2026-01-18',
    duration: '38 min',
    description:
      "Understanding what it means to walk in God's light and be a light to others in our community.",
    scripture: '1 John 1:5-7',
    youtubeId: undefined,
    series: 'The Epistle of John',
  },
  {
    id: '3',
    title: 'The Sabbath Rest',
    speaker: 'Pastor Somchai',
    date: '2026-01-11',
    duration: '42 min',
    description:
      'Discovering the blessing and meaning of the Sabbath rest in our busy modern lives.',
    scripture: 'Hebrews 4:9-11',
    youtubeId: undefined,
    series: 'Foundations of Faith',
  },
];

export function LatestSermonSection() {
  const [latestSermon, setLatestSermon] = useState<Sermon | null>(null);
  const [recentSermons, setRecentSermons] = useState<Sermon[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production, this would fetch from the backend API
    // For now, use sample data
    const fetchSermons = async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Use sample data
        setLatestSermon(sampleSermons[0]);
        setRecentSermons(sampleSermons.slice(1, 4));
      } catch (error) {
        console.error('Error fetching sermons:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSermons();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <section className="bg-slate-900 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="animate-pulse">
            <div className="mx-auto mb-8 h-8 w-48 rounded bg-slate-700" />
            <div className="aspect-video rounded-xl bg-slate-800" />
          </div>
        </div>
      </section>
    );
  }

  if (!latestSermon) {
    return null;
  }

  return (
    <section
      id="sermons"
      className="bg-gradient-to-b from-slate-900 to-slate-800 py-16 sm:py-24"
      aria-labelledby="sermons-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="mb-10 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-center sm:text-left">
            <h2 id="sermons-heading" className="mb-2 text-3xl font-bold text-white sm:text-4xl">
              Latest Message
            </h2>
            <p className="text-slate-400">Missed a Sabbath? Catch up on our recent sermons.</p>
          </div>
          <Button
            variant="outline"
            className="border-slate-600 bg-transparent text-white hover:bg-slate-700"
          >
            <Youtube className="mr-2 h-4 w-4 text-red-500" />
            View All Sermons
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Featured Sermon Video */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden bg-slate-800/50 backdrop-blur">
              {/* Video Player */}
              <div className="relative aspect-video bg-slate-900">
                {latestSermon.youtubeId && isPlaying ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${latestSermon.youtubeId}?autoplay=1`}
                    title={latestSermon.title}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="relative h-full w-full">
                    {latestSermon.thumbnailUrl ? (
                      <img
                        src={latestSermon.thumbnailUrl}
                        alt={latestSermon.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900">
                        <BookOpen className="h-20 w-20 text-slate-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40" />
                    <button
                      onClick={() => setIsPlaying(true)}
                      className="absolute inset-0 flex items-center justify-center"
                      aria-label={`Play ${latestSermon.title}`}
                    >
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-lg transition-transform hover:scale-110">
                        <Play className="ml-1 h-8 w-8" />
                      </div>
                    </button>
                    {latestSermon.series && (
                      <span className="absolute left-4 top-4 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white">
                        {latestSermon.series}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Sermon Info */}
              <CardContent className="p-6">
                <h3 className="mb-3 text-xl font-bold text-white sm:text-2xl">
                  {latestSermon.title}
                </h3>

                <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <User className="h-4 w-4" />
                    {latestSermon.speaker}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {formatDate(latestSermon.date)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {latestSermon.duration}
                  </span>
                  {latestSermon.scripture && (
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <BookOpen className="h-4 w-4" />
                      {latestSermon.scripture}
                    </span>
                  )}
                </div>

                <p className="text-slate-300">{latestSermon.description}</p>

                {/* Audio option */}
                {latestSermon.audioUrl && (
                  <div className="mt-4">
                    <Button variant="outline" size="sm" className="text-white">
                      <Headphones className="mr-2 h-4 w-4" />
                      Listen to Audio
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Sermons List */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Recent Messages</h3>

            {recentSermons.map((sermon) => (
              <Card
                key={sermon.id}
                className="cursor-pointer bg-slate-800/50 transition-colors hover:bg-slate-700/50"
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-slate-700">
                      {sermon.thumbnailUrl ? (
                        <img
                          src={sermon.thumbnailUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <BookOpen className="h-6 w-6 text-slate-500" />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Play className="h-6 w-6 text-white" />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <h4 className="mb-1 line-clamp-2 text-sm font-medium text-white">
                        {sermon.title}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {sermon.speaker} • {formatDate(sermon.date)}
                      </p>
                      {sermon.scripture && (
                        <p className="mt-1 text-xs text-amber-400">{sermon.scripture}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* View All Link */}
            <button className="group flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 py-3 text-sm font-medium text-slate-400 transition-colors hover:border-slate-600 hover:text-white">
              View All Messages
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LatestSermonSection;
