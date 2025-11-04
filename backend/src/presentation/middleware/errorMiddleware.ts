import { Request, Response, NextFunction } from 'express';
import { logger } from '../../infrastructure/logging/logger';

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handling middleware
 * Catches all errors and returns consistent error responses
 */
export const errorMiddleware = (
  error: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error
  logger.error('Error occurred', error, {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Handle AppError (known errors)
  if (error instanceof AppError) {
    const response: Record<string, unknown> = {
      error: error.code || 'Error',
      message: error.message,
    };
    if (error.details) {
      response.details = error.details;
    }
    res.status(error.statusCode).json(response);
    return;
  }

  // Handle validation errors (from Zod or other validators)
  if (error.name === 'ZodError') {
    res.status(400).json({
      error: 'ValidationError',
      message: 'Invalid request data',
      details: error,
    });
    return;
  }

  // Handle Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    res.status(400).json({
      error: 'DatabaseError',
      message: 'Database operation failed',
    });
    return;
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token',
    });
    return;
  }

  if (error.name === 'TokenExpiredError') {
    res.status(401).json({
      error: 'TokenExpired',
      message: 'Token has expired',
    });
    return;
  }

  // Map common error messages to appropriate status codes
  const message = error.message.toLowerCase();

  // 404 Not Found errors
  if (message.includes('not found') || message.includes('does not exist')) {
    res.status(404).json({
      error: 'NotFound',
      message: error.message,
    });
    return;
  }

  // 409 Conflict errors
  if (message.includes('already') || message.includes('duplicate')) {
    res.status(409).json({
      error: 'Conflict',
      message: error.message,
    });
    return;
  }

  // 400 Bad Request errors (validation)
  if (
    message.includes('required') ||
    message.includes('invalid') ||
    message.includes('must be') ||
    message.includes('cannot be') ||
    message.includes('too') ||
    message.includes('minimum') ||
    message.includes('maximum')
  ) {
    res.status(400).json({
      error: 'BadRequest',
      message: error.message,
    });
    return;
  }

  // Handle unknown errors (500 Internal Server Error)
  res.status(500).json({
    error: 'InternalServerError',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : error.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
  });
};

/**
 * 404 Not Found handler
 * Should be registered after all routes
 */
export const notFoundMiddleware = (req: Request, res: Response): void => {
  res.status(404).json({
    error: 'NotFound',
    message: `Route ${req.method} ${req.path} not found`,
  });
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors and pass to error middleware
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
