/**
 * Member Blog Post Detail Page
 *
 * Full article view for authenticated members. Uses SidebarLayout.
 */

import { useParams, Link, Navigate } from 'react-router';
import { ArrowLeft, Calendar, Clock, User, Tag, Share2, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { SidebarLayout } from '@/components/layout';
import { blogService, type BlogPost } from '@/services/endpoints/blogService';

function BlogContent({ text }: { text: string }) {
  return (
    <>
      {text.split('\n\n').map((block) => {
        const key = block.slice(0, 60);
        if (block.startsWith('**') && block.endsWith('**')) {
          return (
            <h2 key={key} className="mb-3 mt-6 text-lg font-bold text-foreground">
              {block.replace(/\*\*/g, '')}
            </h2>
          );
        }
        if (block.startsWith('**')) {
          const parts = block.split('**');
          return (
            <div key={key} className="mb-4">
              <h2 className="mb-2 text-lg font-bold text-foreground">{parts[1]}</h2>
              {parts[2] && <p className="text-muted-foreground">{parts[2]}</p>}
            </div>
          );
        }
        if (block.includes('\n- ')) {
          const lines = block.split('\n');
          const heading = lines[0];
          const items = lines.filter((l) => l.startsWith('- '));
          return (
            <div key={key} className="mb-4">
              {heading && !heading.startsWith('- ') && (
                <h2 className="mb-2 text-lg font-bold text-foreground">
                  {heading.replace(/\*\*/g, '')}
                </h2>
              )}
              <ul className="space-y-1 pl-4">
                {items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-muted-foreground">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                    {item.slice(2)}
                  </li>
                ))}
              </ul>
            </div>
          );
        }
        if (/^\d+\.\s/.test(block.split('\n')[0])) {
          const lines = block.split('\n').filter((l) => /^\d+\.\s/.test(l));
          return (
            <ol key={key} className="mb-4 list-decimal space-y-1 pl-6 text-muted-foreground">
              {lines.map((line) => (
                <li key={line}>{line.replace(/^\d+\.\s/, '')}</li>
              ))}
            </ol>
          );
        }
        return (
          <p key={key} className="mb-4 leading-relaxed text-muted-foreground">
            {block}
          </p>
        );
      })}
    </>
  );
}

export function MemberBlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [shareMessage, setShareMessage] = useState('');
  const [post, setPost] = useState<BlogPost | null>(null);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [postData, postsData] = await Promise.all([
          blogService.getBlogPostBySlug(slug!),
          blogService.getBlogPosts(),
        ]);
        setPost(postData);
        setAllPosts(postsData);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    if (slug) load();
  }, [slug]);

  if (loading) {
    return (
      <SidebarLayout breadcrumbs={[{ label: 'Blog', href: '/app/blog' }, { label: 'Loading...' }]}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </SidebarLayout>
    );
  }

  if (notFound || !post) {
    return <Navigate to="/app/blog" replace />;
  }

  const relatedPosts = allPosts
    .filter((p) => p.category === post.category && p.id !== post.id)
    .slice(0, 3);

  const displayRelated =
    relatedPosts.length >= 2 ? relatedPosts : allPosts.filter((p) => p.id !== post.id).slice(0, 3);

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
        await navigator.share({ title: post.title, text: post.excerpt, url });
      } catch {
        // cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      setShareMessage('Link copied!');
      setTimeout(() => setShareMessage(''), 2000);
    }
  };

  return (
    <SidebarLayout breadcrumbs={[{ label: 'Blog', href: '/app/blog' }, { label: post.title }]}>
      <article className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        {/* Hero Image */}
        {post.thumbnailUrl && (
          <div className="relative mb-6 h-48 overflow-hidden rounded-xl sm:h-64 md:h-80">
            <img src={post.thumbnailUrl} alt={post.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <span className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                {post.category}
              </span>
            </div>
          </div>
        )}

        {/* Back Link */}
        <Link
          to="/app/blog"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>

        {/* Title */}
        <h1 className="mb-4 text-balance text-2xl font-bold text-foreground sm:text-3xl">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <User className="h-4 w-4" />
            {post.author}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {formatDate(post.publishedAt ?? post.createdAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {post.readTime} min read
          </span>
          <button
            onClick={handleShare}
            className="relative ml-auto flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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

        {/* Content */}
        <div className="max-w-none">
          <BlogContent text={post.content} />
        </div>

        {/* Tags */}
        <div className="mt-8 flex items-center gap-2 border-t border-border pt-6">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            {post.category}
          </span>
        </div>

        {/* Related Posts */}
        {displayRelated.length > 0 && (
          <div className="mt-8 border-t border-border pt-8">
            <h2 className="mb-4 text-xl font-bold text-foreground">Related Articles</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {displayRelated.map((rp) => (
                <Link key={rp.id} to={`/app/blog/${rp.slug}`}>
                  <Card className="group h-full overflow-hidden transition-shadow hover:shadow-lg">
                    <div className="relative h-32 overflow-hidden">
                      <img
                        src={rp.thumbnailUrl ?? '/placeholder.jpg'}
                        alt={rp.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <CardContent className="p-3">
                      <h3 className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary">
                        {rp.title}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(rp.publishedAt ?? rp.createdAt)}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </SidebarLayout>
  );
}

export default MemberBlogPostPage;
