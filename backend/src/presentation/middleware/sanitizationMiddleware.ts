import { Request, Response, NextFunction } from 'express';
import xss from 'xss';
import validator from 'validator';
import { logger } from '../../infrastructure/logging/logger';

function isSafeUrlValue(value: string): boolean {
  const normalized = value.trim();
  if (!normalized) return false;

  // Decode repeatedly to catch encoded protocol obfuscation (e.g. javascript%3A)
  let decoded = normalized;
  for (let i = 0; i < 3; i++) {
    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    } catch {
      break;
    }
  }

  const compact = decoded.replace(/[\u0000-\u001F\u007F\s]+/g, '');
  const lower = compact.toLowerCase();

  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('data:')
  ) {
    return false;
  }

  // Allow root-relative or fragment links for markdown anchors
  if (compact.startsWith('/') || compact.startsWith('#')) {
    return true;
  }

  try {
    const parsed = new URL(compact);
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Input Sanitization Middleware
 * Protects against XSS and injection attacks
 */

/**
 * Sanitize a string value to prevent XSS attacks
 */
export function sanitizeString(value: string): string {
  if (typeof value !== 'string') return value;

  // Use xss library to sanitize HTML/script content
  return xss(value, {
    whiteList: {}, // Don't allow any HTML tags
    stripIgnoreTag: true, // Strip all HTML tags
    stripIgnoreTagBody: ['script', 'style'], // Remove script and style content
  }).trim();
}

/**
 * Sanitize an object recursively
 */
export function sanitizeObject(obj: Record<string, any>): Record<string, any> {
  if (obj === null || typeof obj !== 'object') return obj;

  const sanitized: Record<string, any> = Array.isArray(obj) ? [] : {};

  for (const key of Object.keys(obj)) {
    const value = obj[key];

    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Sanitization middleware for request body
 * Applies XSS protection to all string fields
 */
export const sanitizationMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query as Record<string, any>) as typeof req.query;
    }

    // Sanitize URL parameters
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params);
    }

    next();
  } catch (error) {
    logger.error('Sanitization middleware error', error);
    next(); // Continue even if sanitization fails to prevent blocking requests
  }
};

/**
 * Validate and sanitize email address
 */
export function sanitizeEmail(email: string): string | null {
  if (typeof email !== 'string') return null;

  const trimmed = email.trim().toLowerCase();

  if (!validator.isEmail(trimmed)) {
    return null;
  }

  return validator.normalizeEmail(trimmed) || null;
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(url: string): string | null {
  if (typeof url !== 'string') return null;

  const trimmed = url.trim();

  if (!isSafeUrlValue(trimmed)) {
    return null;
  }

  return trimmed;
}

/**
 * Validate and sanitize UUID
 */
export function sanitizeUUID(uuid: string): string | null {
  if (typeof uuid !== 'string') return null;

  const trimmed = uuid.trim();

  if (!validator.isUUID(trimmed)) {
    return null;
  }

  return trimmed;
}

/**
 * Validate and sanitize phone number
 */
export function sanitizePhone(phone: string): string | null {
  if (typeof phone !== 'string') return null;

  // Remove common phone number formatting characters
  const cleaned = phone.replace(/[\s\-().]/g, '');

  // Check if it looks like a phone number (digits with optional + prefix)
  if (!/^\+?[0-9]{6,15}$/.test(cleaned)) {
    return null;
  }

  return cleaned;
}

/**
 * Sanitize integer value with range validation
 */
export function sanitizeInt(
  value: string | number,
  options: { min?: number; max?: number } = {}
): number | null {
  const num = typeof value === 'string' ? parseInt(value, 10) : value;

  if (isNaN(num) || !Number.isInteger(num)) {
    return null;
  }

  if (options.min !== undefined && num < options.min) {
    return null;
  }

  if (options.max !== undefined && num > options.max) {
    return null;
  }

  return num;
}

/**
 * Detect potential SQL injection patterns
 */
export function detectSQLInjection(value: string): boolean {
  if (typeof value !== 'string') return false;

  const sqlPatterns = [
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute|xp_)\b)/i,
    /(--|#|\/\*)/,
    /(\bor\b\s+\d+\s*=\s*\d+)/i,
    /(\band\b\s+\d+\s*=\s*\d+)/i,
    /(';\s*(drop|delete|update|insert))/i,
  ];

  return sqlPatterns.some((pattern) => pattern.test(value));
}

/**
 * Middleware to detect and log potential SQL injection attempts
 * Note: Prisma uses parameterized queries which prevent SQL injection,
 * but this adds defense-in-depth
 */
export const sqlInjectionDetectionMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const checkForInjection = (obj: Record<string, any>, path: string = ''): boolean => {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;

      if (typeof value === 'string' && detectSQLInjection(value)) {
        logger.warn('Potential SQL injection attempt detected', {
          path: currentPath,
          value: value.substring(0, 100), // Log first 100 chars only
          ip: req.ip,
          method: req.method,
          url: req.originalUrl,
          userAgent: req.get('user-agent'),
        });
        return true;
      }

      if (typeof value === 'object' && value !== null) {
        if (checkForInjection(value, currentPath)) {
          return true;
        }
      }
    }
    return false;
  };

  // Check all input sources
  const sources = [
    { name: 'body', data: req.body },
    { name: 'query', data: req.query },
    { name: 'params', data: req.params },
  ];

  for (const source of sources) {
    if (source.data && typeof source.data === 'object') {
      if (checkForInjection(source.data, source.name)) {
        // Log but don't block - Prisma handles SQL injection prevention
        // This is just for monitoring suspicious activity
        break;
      }
    }
  }

  next();
};

/**
 * Sanitize Markdown content (allow safe Markdown but strip dangerous HTML)
 */
export function sanitizeMarkdown(content: string): string {
  if (typeof content !== 'string') return '';

  // Allow basic Markdown but strip any HTML
  return xss(content, {
    whiteList: {
      // Allow very limited HTML that might be in Markdown
      a: ['href', 'title', 'target'],
      b: [],
      strong: [],
      i: [],
      em: [],
      u: [],
      p: [],
      br: [],
      ul: [],
      ol: [],
      li: [],
      h1: [],
      h2: [],
      h3: [],
      h4: [],
      h5: [],
      h6: [],
      blockquote: [],
      code: [],
      pre: [],
    },
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style', 'iframe', 'object', 'embed'],
    onTagAttr: (tag, name, value) => {
      // Enforce strict protocol allowlist on href values
      if (tag === 'a' && name === 'href') {
        if (!isSafeUrlValue(value)) {
          return '';
        }
      }

      if (tag === 'a' && name === 'target') {
        if (value !== '_blank' && value !== '_self') {
          return '';
        }
      }

      return undefined; // Keep the attribute as-is
    },
  });
}
