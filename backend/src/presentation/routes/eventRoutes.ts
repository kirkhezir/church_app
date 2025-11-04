import { Router } from 'express';
import { EventController } from '../controllers/eventController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';

/**
 * Event Routes
 *
 * Defines all event management and RSVP endpoints.
 * Applies authentication and role-based authorization as needed.
 */

const router = Router();
const eventController = new EventController();

/**
 * Public routes (no authentication required)
 */

// GET /api/v1/events - List all events
router.get('/', (req, res, next) => eventController.getEvents(req, res, next));

// GET /api/v1/events/:id - Get event details
router.get('/:id', (req, res, next) => eventController.getEventById(req, res, next));

/**
 * Admin/Staff routes (requires authentication + role check)
 */

// POST /api/v1/events - Create event
router.post('/', authMiddleware, requireRole('ADMIN', 'STAFF'), (req, res, next) =>
  eventController.createEvent(req, res, next)
);

// PATCH /api/v1/events/:id - Update event
router.patch('/:id', authMiddleware, requireRole('ADMIN', 'STAFF'), (req, res, next) =>
  eventController.updateEvent(req, res, next)
);

// DELETE /api/v1/events/:id - Cancel event
router.delete('/:id', authMiddleware, requireRole('ADMIN', 'STAFF'), (req, res, next) =>
  eventController.cancelEvent(req, res, next)
);

// GET /api/v1/events/:id/rsvps - Get event RSVPs
router.get('/:id/rsvps', authMiddleware, requireRole('ADMIN', 'STAFF'), (req, res, next) =>
  eventController.getEventRSVPs(req, res, next)
);

/**
 * Member routes (requires authentication)
 */

// POST /api/v1/events/:id/rsvp - RSVP to event
router.post('/:id/rsvp', authMiddleware, (req, res, next) =>
  eventController.rsvpToEvent(req, res, next)
);

// DELETE /api/v1/events/:id/rsvp - Cancel RSVP
router.delete('/:id/rsvp', authMiddleware, (req, res, next) =>
  eventController.cancelRSVP(req, res, next)
);

export default router;
