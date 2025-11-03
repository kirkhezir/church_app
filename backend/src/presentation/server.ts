import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Server as HTTPServer, createServer } from 'http';
import { logger } from '../infrastructure/logging/logger';
import { errorMiddleware, notFoundMiddleware } from './middleware/errorMiddleware';
import { websocketServer } from '../infrastructure/websocket/websocketServer';
import apiRouter from './routes/index';

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
    // Security middleware
    this.app.use(helmet());

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
   * Configure API routes
   */
  private configureRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (_req, res) => {
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
      });
    });

    // API routes
    this.app.use('/api/v1', apiRouter);
  }

  /**
   * Configure error handling
   */
  private configureErrorHandling(): void {
    // 404 handler (must be after all routes)
    this.app.use(notFoundMiddleware);

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
