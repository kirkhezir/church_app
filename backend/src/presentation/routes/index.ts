import { Router } from 'express';
import { logger } from '../../infrastructure/logging/logger';
import contactRoutes from './contactRoutes';
import authRoutes from './authRoutes';

/**
 * Main API Router
 * Aggregates all API routes under /api/v1
 */
const router = Router();

// API info endpoint
router.get('/', (_req, res) => {
  res.json({
    name: 'Church Management API',
    version: '1.0.0',
    description: 'RESTful API for Sing Buri Adventist Center',
    endpoints: {
      contact: '/api/v1/contact',
      auth: '/api/v1/auth',
      members: '/api/v1/members',
      events: '/api/v1/events',
      announcements: '/api/v1/announcements',
      messages: '/api/v1/messages',
    },
  });
});

// Mount route modules
router.use('/contact', contactRoutes);
router.use('/auth', authRoutes);

// TODO: Import and mount remaining route modules as they are implemented
// Example:
// import authRoutes from './authRoutes';
// import memberRoutes from './memberRoutes';
// import eventRoutes from './eventRoutes';
// import announcementRoutes from './announcementRoutes';
// import messageRoutes from './messageRoutes';
//
// router.use('/auth', authRoutes);
// router.use('/members', memberRoutes);
// router.use('/events', eventRoutes);
// router.use('/announcements', announcementRoutes);
// router.use('/messages', messageRoutes);

logger.info('API routes initialized');

export default router;
