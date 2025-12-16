/**
 * Health Check Service
 *
 * Monitors system health and status
 */

interface SimpleHealth {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
}

interface ComponentHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  message?: string;
  latency?: number;
}

interface DetailedHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  components: {
    database: ComponentHealth;
    redis?: ComponentHealth;
    memory: ComponentHealth & {
      details?: {
        heapUsed: number;
        heapTotal: number;
        rss: number;
        external: number;
      };
    };
    sentry?: ComponentHealth;
  };
  process: {
    pid: number;
    nodeVersion: string;
    platform: string;
    arch: string;
  };
}

interface HealthMetrics {
  uptime_seconds: number;
  memory_heap_used_bytes: number;
  memory_heap_total_bytes: number;
  memory_rss_bytes: number;
  http_requests_total: number;
  database_status: number;
  redis_status: number;
}

// Use base URL without /api/v1 for health endpoints
const healthBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1').replace(
  '/api/v1',
  ''
);

/**
 * Get simple health status
 */
export async function getHealth(): Promise<SimpleHealth> {
  const response = await fetch(`${healthBaseUrl}/health`);
  if (!response.ok) {
    throw new Error('Health check failed');
  }
  return response.json();
}

/**
 * Get detailed health status
 */
export async function getDetailedHealth(): Promise<DetailedHealth> {
  const response = await fetch(`${healthBaseUrl}/health/detailed`);
  if (!response.ok) {
    throw new Error('Detailed health check failed');
  }
  return response.json();
}

/**
 * Check if service is ready (Kubernetes readiness probe)
 */
export async function isReady(): Promise<boolean> {
  try {
    const response = await fetch(`${healthBaseUrl}/health/ready`);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Check if service is alive (Kubernetes liveness probe)
 */
export async function isLive(): Promise<boolean> {
  try {
    const response = await fetch(`${healthBaseUrl}/health/live`);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get Prometheus-compatible metrics
 */
export async function getMetrics(): Promise<HealthMetrics> {
  const response = await fetch(`${healthBaseUrl}/health/metrics`);
  if (!response.ok) {
    throw new Error('Failed to fetch metrics');
  }
  return response.json();
}

/**
 * Format uptime to human-readable string
 */
export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let unitIndex = 0;
  let value = bytes;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  return `${value.toFixed(2)} ${units[unitIndex]}`;
}

export type { SimpleHealth, DetailedHealth, ComponentHealth, HealthMetrics };
