/**
 * AdminBlogPage
 *
 * Admin page for managing blog posts (CRUD)
 * - List all blog posts with search/filter
 * - Create, edit, delete blog posts
 * - Toggle featured status
 */

import { useState, useEffect, useMemo } from 'react';
import { PlusIcon, EditIcon, TrashIcon, Search, Loader2, Star, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SidebarLayout } from '@/components/layout';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { blogService, type BlogPost } from '@/services/endpoints/blogService';
import { ConfirmDialog } from '@/components/features/shared/ConfirmDialog';
import { gooeyToast } from 'goey-toast';

export function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    titleThai: '',
    content: '',
    contentThai: '',
    excerpt: '',
    excerptThai: '',
    category: '',
    categoryThai: '',
    tags: '',
    thumbnailUrl: '',
    author: '',
    featured: false,
  });

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await blogService.getBlogPosts();
      setPosts(data);
    } catch {
      setError('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const filteredPosts = useMemo(
    () =>
      posts.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [posts, searchQuery]
  );

  const resetForm = () => {
    setFormData({
      title: '',
      titleThai: '',
      content: '',
      contentThai: '',
      excerpt: '',
      excerptThai: '',
      category: '',
      categoryThai: '',
      tags: '',
      thumbnailUrl: '',
      author: '',
      featured: false,
    });
    setEditingPost(null);
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      titleThai: post.titleThai ?? '',
      content: post.content,
      contentThai: post.contentThai ?? '',
      excerpt: post.excerpt,
      excerptThai: post.excerptThai ?? '',
      category: post.category,
      categoryThai: post.categoryThai ?? '',
      tags: (post.tags ?? []).join(', '),
      thumbnailUrl: post.thumbnailUrl ?? '',
      author: post.author,
      featured: post.featured,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: formData.title,
        titleThai: formData.titleThai || undefined,
        content: formData.content,
        contentThai: formData.contentThai || undefined,
        excerpt: formData.excerpt,
        excerptThai: formData.excerptThai || undefined,
        category: formData.category,
        categoryThai: formData.categoryThai || undefined,
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : undefined,
        thumbnailUrl: formData.thumbnailUrl || undefined,
        author: formData.author,
        featured: formData.featured,
      };

      if (editingPost) {
        await blogService.updateBlogPost(editingPost.id, payload);
        gooeyToast.success('Blog post updated');
      } else {
        await blogService.createBlogPost(payload);
        gooeyToast.success('Blog post created');
      }
      setShowForm(false);
      resetForm();
      await fetchPosts();
    } catch {
      setError('Failed to save blog post');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeleting(true);
      await blogService.deleteBlogPost(id);
      gooeyToast.success('Blog post deleted');
      await fetchPosts();
    } catch {
      setError('Failed to delete blog post');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <SidebarLayout
      breadcrumbs={[
        { label: 'Administration', href: '/app/admin/members' },
        { label: 'Content' },
        { label: 'Blog' },
      ]}
    >
      <div className="flex flex-1 flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Manage Blog Posts</h1>
            <p className="text-muted-foreground">{posts.length} total posts</p>
          </div>
          <Button onClick={openCreate}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Blog Post
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search blog posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Card>
            <CardContent className="min-h-[480px] p-0">
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full table-fixed text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="w-[28%] px-4 py-3 text-left font-medium">Title</th>
                      <th className="w-[16%] px-4 py-3 text-left font-medium">Author</th>
                      <th className="w-[14%] px-4 py-3 text-left font-medium">Category</th>
                      <th className="w-[14%] px-4 py-3 text-left font-medium">Date</th>
                      <th className="w-[12%] px-4 py-3 text-center font-medium">Featured</th>
                      <th className="w-[16%] px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{post.title}</span>
                            <a
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-primary"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                          <span className="text-xs text-muted-foreground">/{post.slug}</span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{post.author}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                            {post.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(post.publishedAt ?? post.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {post.featured && (
                            <Star className="mx-auto h-4 w-4 fill-yellow-400 text-yellow-400" />
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEdit(post)}
                              aria-label={`Edit ${post.title}`}
                            >
                              <EditIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive"
                              onClick={() => setDeleteTarget(post.id)}
                              aria-label={`Delete ${post.title}`}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredPosts.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center">
                          <ExternalLink className="mx-auto mb-2 h-8 w-8 text-muted-foreground opacity-30" />
                          <p className="text-muted-foreground">No blog posts found</p>
                          <p className="mt-1 text-xs text-muted-foreground/70">
                            Try adjusting your search or create a new post.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="divide-y md:hidden">
                {filteredPosts.map((post) => (
                  <div key={post.id} className="flex items-start justify-between gap-3 p-4">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium leading-tight">{post.title}</p>
                        {post.featured && (
                          <Star className="h-3.5 w-3.5 shrink-0 fill-yellow-400 text-yellow-400" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{post.author}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="rounded-full bg-muted px-2 py-0.5">{post.category}</span>
                        <span>
                          {new Date(post.publishedAt ?? post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEdit(post)}
                        aria-label={`Edit ${post.title}`}
                      >
                        <EditIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => setDeleteTarget(post.id)}
                        aria-label={`Delete ${post.title}`}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredPosts.length === 0 && (
                  <div className="px-4 py-12 text-center">
                    <ExternalLink className="mx-auto mb-2 h-8 w-8 text-muted-foreground opacity-30" />
                    <p className="text-muted-foreground">No blog posts found</p>
                    <p className="mt-1 text-xs text-muted-foreground/70">
                      Try adjusting your search or create a new post.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>{editingPost ? 'Edit Blog Post' : 'New Blog Post'}</DialogTitle>
              <DialogDescription>
                {editingPost
                  ? 'Update the blog post details below.'
                  : 'Fill in the details to create a new blog post.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="blog-title-en" className="mb-1 block text-sm font-medium">
                    Title (EN) *
                  </label>
                  <Input
                    id="blog-title-en"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="blog-title-th" className="mb-1 block text-sm font-medium">
                    Title (TH)
                  </label>
                  <Input
                    id="blog-title-th"
                    value={formData.titleThai}
                    onChange={(e) => setFormData({ ...formData, titleThai: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="blog-author" className="mb-1 block text-sm font-medium">
                    Author *
                  </label>
                  <Input
                    id="blog-author"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="blog-category" className="mb-1 block text-sm font-medium">
                    Category *
                  </label>
                  <Input
                    id="blog-category"
                    required
                    placeholder="e.g. Announcement, Testimony"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="blog-category-th" className="mb-1 block text-sm font-medium">
                    Category (TH)
                  </label>
                  <Input
                    id="blog-category-th"
                    value={formData.categoryThai}
                    onChange={(e) => setFormData({ ...formData, categoryThai: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="blog-tags" className="mb-1 block text-sm font-medium">
                    Tags (comma-separated)
                  </label>
                  <Input
                    id="blog-tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="faith, worship, community"
                  />
                </div>
                <div>
                  <label htmlFor="blog-thumbnail" className="mb-1 block text-sm font-medium">
                    Thumbnail URL
                  </label>
                  <Input
                    id="blog-thumbnail"
                    value={formData.thumbnailUrl}
                    onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                  />
                </div>
                <div className="flex items-end gap-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Checkbox
                      checked={formData.featured}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, featured: checked === true })
                      }
                    />
                    Featured Post
                  </label>
                </div>
              </div>
              <div>
                <label htmlFor="blog-excerpt-en" className="mb-1 block text-sm font-medium">
                  Excerpt (EN) *
                </label>
                <Textarea
                  id="blog-excerpt-en"
                  required
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="blog-excerpt-th" className="mb-1 block text-sm font-medium">
                  Excerpt (TH)
                </label>
                <Textarea
                  id="blog-excerpt-th"
                  rows={2}
                  value={formData.excerptThai}
                  onChange={(e) => setFormData({ ...formData, excerptThai: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="blog-content-en" className="mb-1 block text-sm font-medium">
                  Content (EN) *
                </label>
                <Textarea
                  id="blog-content-en"
                  required
                  rows={8}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="blog-content-th" className="mb-1 block text-sm font-medium">
                  Content (TH)
                </label>
                <Textarea
                  id="blog-content-th"
                  rows={8}
                  value={formData.contentThai}
                  onChange={(e) => setFormData({ ...formData, contentThai: e.target.value })}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingPost ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <ConfirmDialog
        open={!!deleteTarget}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        title="Delete Blog Post"
        description="Are you sure you want to delete this blog post? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        loading={deleting}
      />
    </SidebarLayout>
  );
}

export default AdminBlogPage;
