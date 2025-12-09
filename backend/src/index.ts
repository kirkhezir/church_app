import 'dotenv/config';
import { server } from './presentation/server';
import { logger } from './infrastructure/logging/logger';
import prisma from './infrastructure/database/prismaClient';
import { cacheService } from './infrastructure/cache/cacheService';

/**
 * Backend Application Entry Point
 */
const PORT = parseInt(process.env.PORT || '3000', 10);

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received, shutting down gracefully`);

  try {
    // Stop the server
    await server.stop();

    // Disconnect from Redis
    await cacheService.disconnect();

    // Disconnect from database
    await prisma.$disconnect();

    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', error);
    process.exit(1);
  }
};

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, _promise) => {
  logger.error('Unhandled Rejection', { reason: String(reason) });
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Start the server
try {
  server.start(PORT);
} catch (error) {
  logger.error('Failed to start server', error);
  process.exit(1);
}
