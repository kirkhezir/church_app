/**
 * Latest Content Widget
 *
 * Shows latest sermon and blog post in a compact two-row card.
 */

import { Link } from 'react-router';
import { memo } from 'react';
import { Video, BookOpen, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';

interface Sermon {
  id: string;
  title: string;
  speaker: string;
  date: string;
  thumbnailUrl?: string;
  youtubeUrl?: string;
}

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  publishedAt: string;
  thumbnailUrl?: string;
}

interface LatestContentWidgetProps {
  sermon: Sermon | null;
  blogPost: BlogPost | null;
}

export const LatestContentWidget = memo(function LatestContentWidget({
  sermon,
  blogPost,
}: LatestContentWidgetProps) {
  if (!sermon && !blogPost) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            Latest Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-6 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <BookOpen className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No content yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          Latest Content
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sermon && (
          <div className="group flex items-start gap-3 rounded-lg border border-border/50 p-3 transition-all duration-200 hover:-translate-y-px hover:border-primary/20 hover:bg-accent/50 hover:shadow-sm">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-red-500/10 dark:bg-red-400/10">
              <Video className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 font-medium text-foreground">{sermon.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {sermon.speaker} &middot;{' '}
                {new Date(sermon.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
            <Link to={`/app/sermons/${sermon.id}`}>
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                Watch
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        )}

        {blogPost && (
          <div className="group flex items-start gap-3 rounded-lg border border-border/50 p-3 transition-all duration-200 hover:-translate-y-px hover:border-primary/20 hover:bg-accent/50 hover:shadow-sm">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 dark:bg-emerald-400/10">
              <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 font-medium text-foreground">{blogPost.title}</p>
              <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                {blogPost.excerpt}
              </p>
            </div>
            <Link to={`/app/blog/${blogPost.slug}`}>
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                Read
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
