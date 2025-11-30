import winston from 'winston';
import path from 'path';

/**
 * Security event types for audit logging
 */
export type SecurityEventType =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'LOGOUT'
  | 'ACCOUNT_LOCKED'
  | 'ACCOUNT_UNLOCKED'
  | 'PASSWORD_RESET_REQUEST'
  | 'PASSWORD_RESET_SUCCESS'
  | 'MFA_ENROLLED'
  | 'MFA_VERIFIED'
  | 'MFA_FAILED'
  | 'MFA_DISABLED'
  | 'SESSION_EXPIRED'
  | 'TOKEN_REFRESH'
  | 'UNAUTHORIZED_ACCESS'
  | 'PERMISSION_DENIED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'SUSPICIOUS_ACTIVITY'
  | 'DATA_EXPORT'
  | 'MEMBER_CREATED'
  | 'MEMBER_DELETED'
  | 'ADMIN_ACTION';

/**
 * Security event metadata
 */
interface SecurityEventMeta {
  userId?: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  action?: string;
  resource?: string;
  details?: Record<string, unknown>;
}

/**
 * Logger Service using Winston
 * Provides structured logging with different log levels
 * Includes specialized security event logging
 */
class Logger {
  private logger: winston.Logger;
  private securityLogger: winston.Logger;

  constructor() {
    const logDir = path.join(process.cwd(), 'logs');

    // Main application logger
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
      ),
      defaultMeta: { service: 'church-app-backend' },
      transports: [
        // Write all logs with level `error` and below to `error.log`
        new winston.transports.File({
          filename: path.join(logDir, 'error.log'),
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        // Write all logs to `combined.log`
        new winston.transports.File({
          filename: path.join(logDir, 'combined.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
      ],
    });

    // Dedicated security event logger
    this.securityLogger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.json()
      ),
      defaultMeta: { service: 'church-app-security' },
      transports: [
        // Security events log
        new winston.transports.File({
          filename: path.join(logDir, 'security.log'),
          maxsize: 10485760, // 10MB
          maxFiles: 10, // Keep more security logs
        }),
        // Also log to combined for correlation
        new winston.transports.File({
          filename: path.join(logDir, 'combined.log'),
          maxsize: 5242880,
          maxFiles: 5,
        }),
      ],
    });

    // If we're not in production, log to console with pretty formatting
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(
        new winston.transports.Console({
          format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
        })
      );

      this.securityLogger.add(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
              return `[SECURITY] ${timestamp} ${level}: ${message} ${JSON.stringify(meta)}`;
            })
          ),
        })
      );
    }
  }

  /**
   * Log info level message
   */
  info(message: string, meta?: Record<string, unknown>): void {
    this.logger.info(message, meta);
  }

  /**
   * Log error level message
   */
  error(message: string, error?: Error | unknown, meta?: Record<string, unknown>): void {
    if (error instanceof Error) {
      this.logger.error(message, { ...meta, error: error.message, stack: error.stack });
    } else {
      this.logger.error(message, { ...meta, error });
    }
  }

  /**
   * Log warn level message
   */
  warn(message: string, meta?: Record<string, unknown>): void {
    this.logger.warn(message, meta);
  }

  /**
   * Log debug level message
   */
  debug(message: string, meta?: Record<string, unknown>): void {
    this.logger.debug(message, meta);
  }

  /**
   * Log HTTP request
   */
  http(message: string, meta?: Record<string, unknown>): void {
    this.logger.http(message, meta);
  }

  /**
   * Log security event
   * Used for audit trail and security monitoring
   */
  security(eventType: SecurityEventType, meta: SecurityEventMeta): void {
    this.securityLogger.info(eventType, {
      eventType,
      ...meta,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log login success
   */
  loginSuccess(userId: string, email: string, ip?: string, userAgent?: string): void {
    this.security('LOGIN_SUCCESS', { userId, email, ip, userAgent });
  }

  /**
   * Log login failure
   */
  loginFailure(email: string, reason: string, ip?: string, userAgent?: string): void {
    this.security('LOGIN_FAILURE', {
      email,
      ip,
      userAgent,
      details: { reason },
    });
  }

  /**
   * Log account lockout
   */
  accountLocked(email: string, attempts: number, ip?: string): void {
    this.security('ACCOUNT_LOCKED', {
      email,
      ip,
      details: { attempts },
    });
  }

  /**
   * Log MFA event
   */
  mfaEvent(
    eventType: 'MFA_ENROLLED' | 'MFA_VERIFIED' | 'MFA_FAILED' | 'MFA_DISABLED',
    userId: string,
    email: string,
    ip?: string
  ): void {
    this.security(eventType, { userId, email, ip });
  }

  /**
   * Log unauthorized access attempt
   */
  unauthorizedAccess(resource: string, ip?: string, userAgent?: string, userId?: string): void {
    this.security('UNAUTHORIZED_ACCESS', {
      userId,
      ip,
      userAgent,
      resource,
    });
  }

  /**
   * Log suspicious activity
   */
  suspiciousActivity(description: string, meta: SecurityEventMeta): void {
    this.security('SUSPICIOUS_ACTIVITY', {
      ...meta,
      details: { description, ...meta.details },
    });
  }

  /**
   * Log admin action
   */
  adminAction(
    action: string,
    adminId: string,
    targetId: string,
    details?: Record<string, unknown>
  ): void {
    this.security('ADMIN_ACTION', {
      userId: adminId,
      action,
      resource: targetId,
      details,
    });
  }

  /**
   * Log data export
   */
  dataExport(userId: string, exportType: string, recordCount: number, ip?: string): void {
    this.security('DATA_EXPORT', {
      userId,
      ip,
      details: { exportType, recordCount },
    });
  }
}

// Export singleton instance
export const logger = new Logger();
export default logger;
