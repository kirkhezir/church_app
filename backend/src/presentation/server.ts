import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { Server as HTTPServer, createServer } from 'http';
import path from 'path';
import fs from 'fs';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { logger } from '../infrastructure/logging/logger';
import { errorMiddleware, notFoundMiddleware } from './middleware/errorMiddleware';
import { generalRateLimiter } from './middleware/rateLimitMiddleware';
import {
  sanitizationMiddleware,
  sqlInjectionDetectionMiddleware,
} from './middleware/sanitizationMiddleware';
import { websocketServer } from '../infrastructure/websocket/websocketServer';
import { initSentry, setupSentryErrorHandler } from '../infrastructure/monitoring/sentry';
import healthRoutes from './routes/healthRoutes';
import apiRouter from './routes/index';

// Initialize Sentry early (before Express)
initSentry();

/**
 * Express Server Configuration
 * Sets up Express application with middleware and routes
 */
export class Server {
  public app: Application;
  private httpServer?: HTTPServer;

  constructor() {
    this.app = express();
    this.configureMiddleware();
    this.configureRoutes();
    this.configureErrorHandling();
  }

  /**
   * Configure Express middleware
   */
  private configureMiddleware(): void {
    // Compression middleware for response compression
    this.app.use(
      compression({
        filter: (req, res) => {
          // Don't compress responses with this header
          if (req.headers['x-no-compression']) {
            return false;
          }
          // Use compression filter
          return compression.filter(req, res);
        },
        level: 6, // Compression level (1-9)
        threshold: 1024, // Only compress responses > 1KB
      })
    );

    // Security middleware with CSP configured for Swagger UI
    this.app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'validator.swagger.io'],
          },
        },
      })
    );

    // CORS configuration
    const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
    this.app.use(
      cors({
        origin: corsOrigin.split(','), // Support multiple origins
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      })
    );

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Input sanitization (XSS protection)
    this.app.use(sanitizationMiddleware);
    this.app.use(sqlInjectionDetectionMiddleware);

    // General rate limiting for all API endpoints
    this.app.use('/api/', generalRateLimiter);

    // Request logging middleware
    this.app.use((req, _res, next) => {
      logger.http(`${req.method} ${req.path}`, {
        method: req.method,
        path: req.path,
        query: req.query,
        ip: req.ip,
        userAgent: req.get('user-agent'),
      });
      next();
    });
  }

  /**
   * Configure routes
   */
  private configureRoutes(): void {
    // Health check endpoints
    this.app.use('/health', healthRoutes);

    // Swagger API Documentation
    this.configureSwagger();

    // API routes
    this.app.use('/api/v1', apiRouter);
  }

  /**
   * Configure Swagger API documentation
   * Serves OpenAPI documentation at /api-docs endpoint
   */
  private configureSwagger(): void {
    try {
      // Try to load OpenAPI spec from specs folder
      const openApiPath = path.resolve(
        __dirname,
        '../../../../specs/001-full-stack-web/contracts/openapi.yaml'
      );

      if (fs.existsSync(openApiPath)) {
        const swaggerDocument = YAML.load(openApiPath);

        // Configure Swagger UI options
        const swaggerOptions = {
          customCss: '.swagger-ui .topbar { display: none }',
          customSiteTitle: 'Church Management API - Documentation',
          customfavIcon: '/favicon.ico',
          explorer: true,
        };

        // Serve Swagger UI at /api-docs
        this.app.use(
          '/api-docs',
          swaggerUi.serve,
          swaggerUi.setup(swaggerDocument, swaggerOptions)
        );

        // Serve raw OpenAPI spec at /api-docs/spec
        this.app.get('/api-docs/spec', (_req, res) => {
          res.json(swaggerDocument);
        });

        logger.info('📚 API documentation available at /api-docs');
      } else {
        logger.warn('OpenAPI spec not found, API documentation disabled');
      }
    } catch (error) {
      logger.error('Failed to load OpenAPI spec for Swagger UI', error);
    }
  }

  /**
   * Configure error handling
   */
  private configureErrorHandling(): void {
    // 404 handler (must be after all routes)
    this.app.use(notFoundMiddleware);

    // Sentry error handler (captures errors before our handler)
    setupSentryErrorHandler(this.app as unknown as import('express').Express);

    // Global error handler (must be last)
    this.app.use(errorMiddleware);
  }

  /**
   * Start the server
   */
  public start(port: number = 3000): void {
    // Create HTTP server
    this.httpServer = createServer(this.app);

    // Initialize WebSocket server
    websocketServer.initialize(this.httpServer);

    // Start listening
    this.httpServer.listen(port, () => {
      logger.info(`🚀 Server started on port ${port}`);
      logger.info(`🏥 Health check: http://localhost:${port}/health`);
      logger.info(`📡 API endpoint: http://localhost:${port}/api/v1`);
      logger.info(`📚 API docs: http://localhost:${port}/api-docs`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  }

  /**
   * Stop the server gracefully
   */
  public async stop(): Promise<void> {
    if (this.httpServer) {
      return new Promise((resolve, reject) => {
        this.httpServer?.close((error) => {
          if (error) {
            logger.error('Error stopping server', error);
            reject(error);
          } else {
            logger.info('Server stopped gracefully');
            resolve();
          }
        });
      });
    }
  }

  /**
   * Get HTTP server instance (for Socket.io integration)
   */
  public getHttpServer(): HTTPServer | undefined {
    return this.httpServer;
  }
}

// Export singleton instance
export const server = new Server();
