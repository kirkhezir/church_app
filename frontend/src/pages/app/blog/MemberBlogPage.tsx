/**
 * Member Blog Page
 *
 * Blog listing with category filters, search, and load-more.
 * Uses SidebarLayout instead of PublicLayout.
 */

import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router';
import {
  Newspaper,
  Calendar,
  User,
  Tag,
  ChevronDown,
  Search,
  BookOpen,
  Heart,
  Globe,
  Bell,
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SidebarLayout } from '@/components/layout';
import { blogService, type BlogPost } from '@/services/endpoints/blogService';

const categories = [
  { id: 'all', name: 'All', icon: Newspaper },
  { id: 'Announcement', name: 'Announcements', icon: Bell },
  { id: 'Testimony', name: 'Testimonies', icon: Heart },
  { id: 'Missions', name: 'Missions', icon: Globe },
  { id: 'News', name: 'News', icon: Newspaper },
  { id: 'Education', name: 'Education', icon: BookOpen },
];

export function MemberBlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(9);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const posts = await blogService.getBlogPosts();
        setAllPosts(posts);
      } catch {
        setError('Failed to load blog posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredPosts = useMemo(
    () =>
      allPosts.filter((post) => {
        const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
        const matchesSearch =
          searchQuery === '' ||
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      }),
    [allPosts, selectedCategory, searchQuery]
  );

  return (
    <SidebarLayout breadcrumbs={[{ label: 'Blog' }]}>
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">News & Blog</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Latest updates, announcements, and inspiring stories from our community
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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  name="blog-search"
                  aria-label="Search articles"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-border py-2 pl-9 pr-4 text-sm focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      aria-pressed={selectedCategory === cat.id}
                      className={`flex cursor-pointer items-center gap-1 rounded-full px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
                        selectedCategory === cat.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Blog Posts Grid */}
            {filteredPosts.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPosts.slice(0, visibleCount).map((post) => (
                  <Link key={post.id} to={`/app/blog/${post.slug}`}>
                    <Card className="group h-full overflow-hidden transition-shadow hover:shadow-xl">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={post.thumbnailUrl ?? '/placeholder.jpg'}
                          alt={post.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute left-3 top-3">
                          <span className="rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-foreground/80 dark:bg-slate-800/90">
                            <Tag className="mr-1 inline h-3 w-3" />
                            {post.category}
                          </span>
                        </div>
                      </div>
                      <CardContent className="p-5">
                        <h3 className="mb-2 line-clamp-2 font-bold text-foreground group-hover:text-primary">
                          {post.title}
                        </h3>
                        <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3" />
                            <span>{post.author}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {new Date(post.publishedAt ?? post.createdAt).toLocaleDateString(
                                'en-US',
                                { month: 'short', day: 'numeric' }
                              )}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Newspaper className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
                <h3 className="mb-2 text-lg font-medium text-foreground">No articles found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or category filter
                </p>
              </div>
            )}

            {/* Load More */}
            {filteredPosts.length > visibleCount && (
              <div className="text-center">
                <Button variant="outline" onClick={() => setVisibleCount((prev) => prev + 6)}>
                  Load More
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </SidebarLayout>
  );
}

export default MemberBlogPage;
