import { Router } from 'express';
import { BlogController } from '../controllers/blogController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';

/**
 * Blog Routes
 *
 * Defines all blog post management endpoints.
 */

const router = Router();
const blogController = new BlogController();

/**
 * Public routes (no authentication required)
 */

// GET /api/v1/blog - List published blog posts
router.get('/', (req, res, next) => blogController.getBlogPosts(req, res, next));

// GET /api/v1/blog/categories - List unique categories
router.get('/categories', (req, res, next) => blogController.getCategories(req, res, next));

// GET /api/v1/blog/:slug - Get blog post by slug
router.get('/:slug', (req, res, next) => blogController.getBlogPostBySlug(req, res, next));

/**
 * Admin/Staff routes (requires authentication + role check)
 */

// POST /api/v1/blog - Create blog post
router.post('/', authMiddleware, requireRole('ADMIN', 'STAFF'), (req, res, next) =>
  blogController.createBlogPost(req, res, next)
);

// PATCH /api/v1/blog/:id - Update blog post
router.patch('/:id', authMiddleware, requireRole('ADMIN', 'STAFF'), (req, res, next) =>
  blogController.updateBlogPost(req, res, next)
);

// DELETE /api/v1/blog/:id - Delete blog post
router.delete('/:id', authMiddleware, requireRole('ADMIN', 'STAFF'), (req, res, next) =>
  blogController.deleteBlogPost(req, res, next)
);

export default router;
