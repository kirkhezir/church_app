import { Request, Response, NextFunction } from 'express';
import { CreateEvent } from '../../application/useCases/createEvent';
import { GetEvents } from '../../application/useCases/getEvents';
import { GetEventById } from '../../application/useCases/getEventById';
import { UpdateEvent } from '../../application/useCases/updateEvent';
import { CancelEvent } from '../../application/useCases/cancelEvent';
import { RSVPToEvent } from '../../application/useCases/rsvpToEvent';
import { CancelRSVP } from '../../application/useCases/cancelRSVP';
import { GetEventRSVPs } from '../../application/useCases/getEventRSVPs';
import { EventRepository } from '../../infrastructure/database/repositories/eventRepository';
import { EventRSVPRepository } from '../../infrastructure/database/repositories/eventRSVPRepository';
import { MemberRepository } from '../../infrastructure/database/repositories/memberRepository';
import { eventNotificationService } from '../../application/services/eventNotificationService';

/**
 * EventController
 *
 * Handles HTTP requests for event management and RSVP operations.
 * Wires use cases to Express route handlers with notification support.
 */
export class EventController {
  private eventRepository: EventRepository;
  private rsvpRepository: EventRSVPRepository;
  private memberRepository: MemberRepository;

  constructor() {
    this.eventRepository = new EventRepository();
    this.rsvpRepository = new EventRSVPRepository();
    this.memberRepository = new MemberRepository();
  }

  /**
   * POST /api/v1/events
   * Create a new event (ADMIN, STAFF)
   */
  async createEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const createEventUseCase = new CreateEvent(this.eventRepository);

      const result = await createEventUseCase.execute({
        title: req.body.title,
        description: req.body.description,
        startDateTime: new Date(req.body.startDateTime),
        endDateTime: new Date(req.body.endDateTime),
        location: req.body.location,
        category: req.body.category,
        maxCapacity: req.body.maxCapacity,
        imageUrl: req.body.imageUrl,
        createdById: (req as any).user.userId, // Set by auth middleware
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/events
   * Get list of events with optional filters (PUBLIC)
   */
  async getEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const getEventsUseCase = new GetEvents(this.eventRepository);

      const result = await getEventsUseCase.execute({
        category: req.query.category as any, // Category validation happens in use case
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/events/:id
   * Get event details by ID (PUBLIC)
   */
  async getEventById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const getEventByIdUseCase = new GetEventById(this.eventRepository, this.rsvpRepository);

      const result = await getEventByIdUseCase.execute({
        eventId: req.params.id,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/events/:id
   * Update event details (ADMIN, STAFF)
   */
  async updateEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updateEventUseCase = new UpdateEvent(this.eventRepository);

      const result = await updateEventUseCase.execute({
        eventId: req.params.id,
        title: req.body.title,
        description: req.body.description,
        startDateTime: req.body.startDateTime ? new Date(req.body.startDateTime) : undefined,
        endDateTime: req.body.endDateTime ? new Date(req.body.endDateTime) : undefined,
        location: req.body.location,
        category: req.body.category,
        maxCapacity: req.body.maxCapacity,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/events/:id
   * Cancel an event (ADMIN, STAFF)
   */
  async cancelEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cancelEventUseCase = new CancelEvent(
        this.eventRepository,
        this.rsvpRepository,
        this.memberRepository,
        eventNotificationService
      );

      const result = await cancelEventUseCase.execute({
        eventId: req.params.id,
        cancelledById: (req as any).user.userId,
        reason: req.body.reason,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/events/:id/rsvp
   * RSVP to an event (MEMBER, STAFF, ADMIN)
   */
  async rsvpToEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rsvpToEventUseCase = new RSVPToEvent(
        this.eventRepository,
        this.rsvpRepository,
        this.memberRepository,
        eventNotificationService
      );

      const result = await rsvpToEventUseCase.execute({
        eventId: req.params.id,
        memberId: (req as any).user.userId, // Authenticated user
        notes: req.body.notes,
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/events/:id/rsvp
   * Cancel RSVP to an event (MEMBER, STAFF, ADMIN)
   */
  async cancelRSVP(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cancelRSVPUseCase = new CancelRSVP(
        this.eventRepository,
        this.rsvpRepository,
        this.memberRepository,
        eventNotificationService
      );

      const result = await cancelRSVPUseCase.execute({
        eventId: req.params.id,
        memberId: (req as any).user.userId, // Authenticated user
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/events/:id/rsvps
   * Get RSVPs for an event (ADMIN, STAFF)
   */
  async getEventRSVPs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const getEventRSVPsUseCase = new GetEventRSVPs(this.eventRepository, this.rsvpRepository);

      const result = await getEventRSVPsUseCase.execute({
        eventId: req.params.id,
        status: req.query.status as 'CONFIRMED' | 'WAITLISTED' | 'CANCELLED' | undefined,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
