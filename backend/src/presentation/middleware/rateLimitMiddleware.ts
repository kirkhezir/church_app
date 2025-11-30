import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { logger } from '../../infrastructure/logging/logger';

/**
 * Rate Limiting Middleware Configuration
 * Protects API endpoints from abuse and brute-force attacks
 */

/**
 * General API rate limiter
 * Applies to all API endpoints
 */
export const generalRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10), // 1 minute window
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10), // 100 requests per window
  message: {
    error: 'TooManyRequests',
    message: 'Too many requests, please try again later.',
    retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10) / 1000),
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  validate: { xForwardedForHeader: false }, // Disable IPv6 validation warning
  handler: (req: Request, res: Response) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      method: req.method,
      userAgent: req.get('user-agent'),
    });
    res.status(429).json({
      error: 'TooManyRequests',
      message: 'Too many requests, please try again later.',
      retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10) / 1000),
    });
  },
});

/**
 * Strict rate limiter for authentication endpoints
 * Protects against brute-force login attempts
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login attempts per 15 minutes
  message: {
    error: 'TooManyLoginAttempts',
    message: 'Too many login attempts. Please try again in 15 minutes.',
    retryAfter: 900, // 15 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  handler: (req: Request, res: Response) => {
    logger.warn('Auth rate limit exceeded - potential brute force attack', {
      ip: req.ip,
      path: req.path,
      email: req.body?.email, // Log attempted email (not password)
      userAgent: req.get('user-agent'),
    });
    res.status(429).json({
      error: 'TooManyLoginAttempts',
      message: 'Too many login attempts. Please try again in 15 minutes.',
      retryAfter: 900,
    });
  },
  skipSuccessfulRequests: true, // Don't count successful logins
});

/**
 * Strict rate limiter for password reset endpoints
 * Prevents password reset abuse
 */
export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset requests per hour
  message: {
    error: 'TooManyPasswordResetRequests',
    message: 'Too many password reset requests. Please try again later.',
    retryAfter: 3600, // 1 hour in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  handler: (req: Request, res: Response) => {
    logger.warn('Password reset rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      email: req.body?.email,
      userAgent: req.get('user-agent'),
    });
    res.status(429).json({
      error: 'TooManyPasswordResetRequests',
      message: 'Too many password reset requests. Please try again later.',
      retryAfter: 3600,
    });
  },
});

/**
 * Rate limiter for MFA verification
 * Prevents MFA brute-force attacks
 */
export const mfaRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // 5 MFA attempts per 5 minutes
  message: {
    error: 'TooManyMFAAttempts',
    message: 'Too many MFA verification attempts. Please try again in 5 minutes.',
    retryAfter: 300, // 5 minutes in seconds
  },
  validate: { xForwardedForHeader: false },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn('MFA rate limit exceeded - potential attack', {
      ip: req.ip,
      path: req.path,
      userAgent: req.get('user-agent'),
    });
    res.status(429).json({
      error: 'TooManyMFAAttempts',
      message: 'Too many MFA verification attempts. Please try again in 5 minutes.',
      retryAfter: 300,
    });
  },
});

/**
 * Rate limiter for contact form submissions
 * Prevents spam
 */
export const contactFormRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 contact form submissions per hour
  message: {
    error: 'TooManyContactRequests',
    message: 'Too many contact form submissions. Please try again later.',
    retryAfter: 3600,
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  handler: (req: Request, res: Response) => {
    logger.warn('Contact form rate limit exceeded', {
      ip: req.ip,
      email: req.body?.email,
      userAgent: req.get('user-agent'),
    });
    res.status(429).json({
      error: 'TooManyContactRequests',
      message: 'Too many contact form submissions. Please try again later.',
      retryAfter: 3600,
    });
  },
});

/**
 * Stricter rate limiter for admin endpoints
 * Additional protection for sensitive operations
 */
export const adminRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute for admin endpoints
  message: {
    error: 'TooManyAdminRequests',
    message: 'Too many requests. Please slow down.',
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
});

/**
 * Rate limiter for messaging endpoints
 * Prevents spam messaging
 */
export const messagingRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 messages per minute
  message: {
    error: 'TooManyMessages',
    message: 'You are sending messages too quickly. Please wait a moment.',
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  handler: (req: Request, res: Response) => {
    logger.warn('Messaging rate limit exceeded', {
      ip: req.ip,
      userId: (req as any).user?.userId,
      userAgent: req.get('user-agent'),
    });
    res.status(429).json({
      error: 'TooManyMessages',
      message: 'You are sending messages too quickly. Please wait a moment.',
      retryAfter: 60,
    });
  },
});
