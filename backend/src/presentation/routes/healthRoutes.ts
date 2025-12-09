/**
 * Health Check Routes
 *
 * Provides endpoints for system health monitoring
 */

import { Router, Request, Response } from 'express';
import { healthCheckService } from '../../infrastructure/health/healthCheckService';

const router = Router();

/**
 * GET /health
 * Simple health check for load balancers
 */
router.get('/', async (_req: Request, res: Response) => {
  const health = await healthCheckService.getSimpleHealth();

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

/**
 * GET /health/detailed
 * Comprehensive health check with all component statuses
 */
router.get('/detailed', async (_req: Request, res: Response) => {
  const health = await healthCheckService.getHealthStatus();

  let statusCode = 200;
  if (health.status === 'unhealthy') {
    statusCode = 503;
  } else if (health.status === 'degraded') {
    statusCode = 200; // Still return 200 for degraded (service is operational)
  }

  res.status(statusCode).json(health);
});

/**
 * GET /health/ready
 * Kubernetes readiness probe
 * Returns 200 if the application is ready to accept traffic
 */
router.get('/ready', async (_req: Request, res: Response) => {
  const isReady = await healthCheckService.isReady();

  if (isReady) {
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
    });
  } else {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /health/live
 * Kubernetes liveness probe
 * Returns 200 if the application process is running
 */
router.get('/live', (_req: Request, res: Response) => {
  const isAlive = healthCheckService.isAlive();

  if (isAlive) {
    res.status(200).json({
      status: 'alive',
      timestamp: new Date().toISOString(),
    });
  } else {
    res.status(503).json({
      status: 'dead',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /health/metrics
 * Returns system metrics in a simple format
 */
router.get('/metrics', async (_req: Request, res: Response) => {
  const health = await healthCheckService.getHealthStatus();

  // Format metrics in a Prometheus-compatible text format
  const memoryUsage = health.metrics.memoryUsage;

  const metrics = [
    `# HELP node_heap_used_bytes Node.js heap used bytes`,
    `# TYPE node_heap_used_bytes gauge`,
    `node_heap_used_bytes ${memoryUsage.heapUsed}`,
    ``,
    `# HELP node_heap_total_bytes Node.js heap total bytes`,
    `# TYPE node_heap_total_bytes gauge`,
    `node_heap_total_bytes ${memoryUsage.heapTotal}`,
    ``,
    `# HELP node_rss_bytes Node.js resident set size bytes`,
    `# TYPE node_rss_bytes gauge`,
    `node_rss_bytes ${memoryUsage.rss}`,
    ``,
    `# HELP app_uptime_seconds Application uptime in seconds`,
    `# TYPE app_uptime_seconds counter`,
    `app_uptime_seconds ${health.uptime}`,
    ``,
    `# HELP app_status Application health status (1=healthy, 0.5=degraded, 0=unhealthy)`,
    `# TYPE app_status gauge`,
    `app_status ${health.status === 'healthy' ? 1 : health.status === 'degraded' ? 0.5 : 0}`,
  ].join('\n');

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(metrics);
});

export default router;
