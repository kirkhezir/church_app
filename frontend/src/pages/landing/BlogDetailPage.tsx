/**
 * Blog Post Detail Page
 *
 * Full article view for a single blog post with:
 * - Hero image
 * - Full article content
 * - Author & date info
 * - Related posts from same category
 * - Newsletter CTA
 */

import { useParams, Link, Navigate } from 'react-router';
import { ArrowLeft, Calendar, Clock, User, Tag, Share2 } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PublicLayout } from '@/layouts';
import { useI18n } from '@/i18n';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { blogPosts } from '@/data/blog';

export function BlogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { language } = useI18n();
  const [shareMessage, setShareMessage] = useState('');
  const revealRef = useScrollReveal<HTMLDivElement>();

  const post = blogPosts.find((p) => p.id === id);

  useDocumentTitle(post?.title ?? 'Blog Post', post?.titleThai ?? 'บทความ', language);

  // Redirect to blog list if post not found
  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const title = language === 'th' ? post.titleThai : post.title;
  const content = language === 'th' ? post.contentThai : post.content;
  const excerpt = language === 'th' ? post.excerptThai : post.excerpt;
  const category = language === 'th' ? post.categoryThai : post.category;

  // Related posts: same category, different id
  const relatedPosts = blogPosts
    .filter((p) => p.category === post.category && p.id !== post.id)
    .slice(0, 3);

  // If not enough related, fill with recent posts
  const displayRelated =
    relatedPosts.length >= 2 ? relatedPosts : blogPosts.filter((p) => p.id !== post.id).slice(0, 3);

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
        await navigator.share({ title, text: excerpt, url });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      setShareMessage(language === 'th' ? 'คัดลอกลิงก์แล้ว!' : 'Link copied!');
      setTimeout(() => setShareMessage(''), 2000);
    }
  };

  // Render markdown-like content (bold, lists, paragraphs)
  const renderContent = (text: string) => {
    return text.split('\n\n').map((block, i) => {
      // Bold headers
      if (block.startsWith('**') && block.endsWith('**')) {
        return (
          <h2 key={i} className="mb-3 mt-6 text-balance text-lg font-bold text-foreground">
            {block.replace(/\*\*/g, '')}
          </h2>
        );
      }
      // Bold header with content after
      if (block.startsWith('**')) {
        const parts = block.split('**');
        return (
          <div key={i} className="mb-4">
            <h2 className="mb-2 text-balance text-lg font-bold text-foreground">{parts[1]}</h2>
            {parts[2] && <p className="text-muted-foreground">{parts[2]}</p>}
          </div>
        );
      }
      // List items
      if (block.includes('\n- ')) {
        const lines = block.split('\n');
        const heading = lines[0];
        const items = lines.filter((l) => l.startsWith('- '));
        return (
          <div key={i} className="mb-4">
            {heading && !heading.startsWith('- ') && (
              <h2 className="mb-2 text-balance text-lg font-bold text-foreground">
                {heading.replace(/\*\*/g, '')}
              </h2>
            )}
            <ul className="space-y-1 pl-4">
              {items.map((item, j) => (
                <li key={j} className="flex items-start gap-2 text-muted-foreground">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                  {item.slice(2)}
                </li>
              ))}
            </ul>
          </div>
        );
      }
      // Numbered list
      if (/^\d+\.\s/.test(block.split('\n')[0])) {
        const lines = block.split('\n').filter((l) => /^\d+\.\s/.test(l));
        return (
          <ol key={i} className="mb-4 list-decimal space-y-1 pl-6 text-muted-foreground">
            {lines.map((line, j) => (
              <li key={j}>{line.replace(/^\d+\.\s/, '')}</li>
            ))}
          </ol>
        );
      }
      // Regular paragraph
      return (
        <p key={i} className="mb-4 leading-relaxed text-muted-foreground">
          {block}
        </p>
      );
    });
  };

  return (
    <PublicLayout>
      {/* Hero Image */}
      <div className="relative h-64 sm:h-80 md:h-96">
        <img src={post.image} alt={title} className="h-full w-full object-cover" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <div className="mx-auto max-w-4xl">
            <span className="inline-block rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white">
              {category}
            </span>
          </div>
        </div>
      </div>

      {/* Article */}
      <div ref={revealRef}>
        <article className="reveal mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
          {/* Back Link */}
          <Link
            to="/blog"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary dark:text-muted-foreground dark:hover:text-blue-400"
          >
            <ArrowLeft className="h-4 w-4" />
            {language === 'th' ? 'กลับไปบล็อก' : 'Back to Blog'}
          </Link>

          {/* Title */}
          <h1 className="mb-4 text-balance text-3xl font-bold text-foreground sm:text-4xl">
            {title}
          </h1>

          {/* Meta */}
          <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {post.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatDate(post.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {post.readTime} {language === 'th' ? 'นาที' : 'min read'}
            </span>
            <button
              onClick={handleShare}
              className="relative ml-auto flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-slate-800"
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

          {/* Content */}
          <div className="prose-like max-w-none">{renderContent(content)}</div>

          {/* Tags / Category */}
          <div className="mt-8 flex items-center gap-2 border-t border-border pt-6 dark:border-border">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground dark:text-blue-200">
              {category}
            </span>
          </div>
        </article>

        {/* Related Posts */}
        {displayRelated.length > 0 && (
          <section className="reveal border-t border-border bg-muted py-12">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <h2 className="mb-6 text-balance text-xl font-bold text-foreground">
                {language === 'th' ? 'บทความที่เกี่ยวข้อง' : 'Related Articles'}
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {displayRelated.map((related) => (
                  <Link key={related.id} to={`/blog/${related.id}`}>
                    <Card className="group h-full cursor-pointer overflow-hidden transition-shadow hover:shadow-xl">
                      <div className="relative h-40 overflow-hidden">
                        <img
                          src={related.image}
                          alt={language === 'th' ? related.titleThai : related.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      <CardContent className="p-4">
                        <span className="text-xs font-medium text-blue-600">
                          {language === 'th' ? related.categoryThai : related.category}
                        </span>
                        <h3 className="mt-1 line-clamp-2 font-semibold text-foreground group-hover:text-primary">
                          {language === 'th' ? related.titleThai : related.title}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDate(related.date)} &middot; {related.readTime}{' '}
                          {language === 'th' ? 'นาที' : 'min'}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </PublicLayout>
  );
}

export default BlogDetailPage;
