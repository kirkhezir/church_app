import winston from 'winston';
import path from 'path';

/**
 * Logger Service using Winston
 * Provides structured logging with different log levels
 */
class Logger {
  private logger: winston.Logger;

  constructor() {
    const logDir = path.join(process.cwd(), 'logs');

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

    // If we're not in production, log to console with pretty formatting
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(
        new winston.transports.Console({
          format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
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
}

// Export singleton instance
export const logger = new Logger();
export default logger;
