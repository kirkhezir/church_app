/**
 * Health Check Service
 *
 * Provides comprehensive system health monitoring
 */

import * as fs from 'fs';
import * as os from 'os';
import * as v8 from 'v8';
import prisma from '../database/prismaClient';
import { cacheService } from '../cache/cacheService';
import { getSentryStatus } from '../monitoring/sentry';
import { logger } from '../logging/logger';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: ComponentHealth;
    cache: ComponentHealth;
    memory: ComponentHealth;
    disk: ComponentHealth;
    monitoring: ComponentHealth;
  };
  metrics: {
    memoryUsage: MemoryMetrics;
    processInfo: ProcessInfo;
    systemMemory: SystemMemory;
  };
}

interface ComponentHealth {
  status: 'up' | 'down' | 'degraded';
  latency?: number;
  message?: string;
}

interface MemoryMetrics {
  heapUsed: number;
  heapTotal: number;
  heapLimit: number;
  heapUsedPercentage: number;
  rss: number;
  external: number;
}

interface ProcessInfo {
  pid: number;
  nodeVersion: string;
  platform: string;
  cpuUsage: NodeJS.CpuUsage;
  cpuCount: number;
}

interface SystemMemory {
  total: number;
  free: number;
  usedPercent: number;
}

class HealthCheckService {
  private startTime = Date.now();
  private version = process.env.npm_package_version || '1.0.0';

  /**
   * Get comprehensive health status
   */
  async getHealthStatus(): Promise<HealthStatus> {
    const [database, cache, memory, monitoring] = await Promise.all([
      this.checkDatabase(),
      this.checkCache(),
      this.checkMemory(),
      this.checkMonitoring(),
    ]);

    // Determine overall status
    const checks = { database, cache, memory, disk: this.checkDisk(), monitoring };
    const statuses = Object.values(checks).map((c) => c.status);

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (statuses.some((s) => s === 'down')) {
      overallStatus = 'unhealthy';
    } else if (statuses.some((s) => s === 'degraded')) {
      overallStatus = 'degraded';
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: (Date.now() - this.startTime) / 1000,
      version: this.version,
      environment: process.env.NODE_ENV || 'development',
      checks,
      metrics: {
        memoryUsage: this.getMemoryMetrics(),
        processInfo: this.getProcessInfo(),
        systemMemory: this.getSystemMemory(),
      },
    };
  }

  /**
   * Get simple health status (for load balancers)
   */
  async getSimpleHealth(): Promise<{ status: 'ok' | 'error'; timestamp: string }> {
    try {
      // Quick database ping
      await prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Check database connectivity
   */
  private async checkDatabase(): Promise<ComponentHealth> {
    const start = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      return {
        status: 'up',
        latency: Date.now() - start,
        message: 'Database connection healthy',
      };
    } catch (error) {
      logger.error('Database health check failed', { error });
      return {
        status: 'down',
        latency: Date.now() - start,
        message: error instanceof Error ? error.message : 'Database connection failed',
      };
    }
  }

  /**
   * Check Redis cache connectivity
   */
  private async checkCache(): Promise<ComponentHealth> {
    const status = cacheService.getStatus();

    if (!status.enabled) {
      return {
        status: 'degraded',
        message: 'Redis caching is disabled',
      };
    }

    if (!status.connected) {
      return {
        status: 'down',
        message: 'Redis connection lost',
      };
    }

    return {
      status: 'up',
      message: 'Redis cache healthy',
    };
  }

  /**
   * Check memory usage
   */
  private async checkMemory(): Promise<ComponentHealth> {
    const metrics = this.getMemoryMetrics();

    // Check critical threshold first (must come before degraded check)
    if (metrics.heapUsedPercentage > 95) {
      return {
        status: 'down',
        message: `Critical memory usage: ${metrics.heapUsedPercentage.toFixed(1)}%`,
      };
    }

    if (metrics.heapUsedPercentage > 90) {
      return {
        status: 'degraded',
        message: `High memory usage: ${metrics.heapUsedPercentage.toFixed(1)}%`,
      };
    }

    return {
      status: 'up',
      message: `Memory usage: ${metrics.heapUsedPercentage.toFixed(1)}%`,
    };
  }

  /**
   * Check disk space using fs.statfsSync (Node 19+)
   */
  private checkDisk(): ComponentHealth {
    try {
      const stats = fs.statfsSync(process.cwd());
      const totalBytes = stats.blocks * stats.bsize;
      const availableBytes = stats.bavail * stats.bsize;
      if (totalBytes === 0) {
        return { status: 'up', message: 'Disk check passed' };
      }
      const usedPercent = ((totalBytes - availableBytes) / totalBytes) * 100;
      const totalGB = (totalBytes / 1024 ** 3).toFixed(1);
      const freeGB = (availableBytes / 1024 ** 3).toFixed(1);

      if (usedPercent > 95) {
        return {
          status: 'down',
          message: `Critical disk usage: ${usedPercent.toFixed(1)}% used (${freeGB} GB free of ${totalGB} GB)`,
        };
      }
      if (usedPercent > 80) {
        return {
          status: 'degraded',
          message: `High disk usage: ${usedPercent.toFixed(1)}% used (${freeGB} GB free of ${totalGB} GB)`,
        };
      }
      return {
        status: 'up',
        message: `Disk usage: ${usedPercent.toFixed(1)}% used — ${freeGB} GB free of ${totalGB} GB`,
      };
    } catch {
      return { status: 'up', message: 'Disk check passed' };
    }
  }

  /**
   * Check monitoring status
   */
  private async checkMonitoring(): Promise<ComponentHealth> {
    const sentryStatus = getSentryStatus();

    if (!sentryStatus.enabled) {
      return {
        status: 'degraded',
        message: 'Error monitoring (Sentry) is disabled',
      };
    }

    return {
      status: 'up',
      message: `Sentry enabled (${sentryStatus.environment})`,
    };
  }

  /**
   * Get detailed memory metrics
   * Uses v8.getHeapStatistics() for the true heap limit instead of heapTotal
   * (heapTotal is just the currently-allocated heap, not the maximum)
   */
  private getMemoryMetrics(): MemoryMetrics {
    const usage = process.memoryUsage();
    const heapStats = v8.getHeapStatistics();
    const heapLimit = heapStats.heap_size_limit;
    return {
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      heapLimit,
      heapUsedPercentage: (usage.heapUsed / heapLimit) * 100,
      rss: usage.rss,
      external: usage.external,
    };
  }

  /**
   * Get process information
   */
  private getProcessInfo(): ProcessInfo {
    return {
      pid: process.pid,
      nodeVersion: process.version,
      platform: process.platform,
      cpuUsage: process.cpuUsage(),
      cpuCount: os.cpus().length,
    };
  }

  /**
   * Get system memory (OS-level, not just heap)
   */
  private getSystemMemory(): SystemMemory {
    const total = os.totalmem();
    const free = os.freemem();
    return {
      total,
      free,
      usedPercent: ((total - free) / total) * 100,
    };
  }

  /**
   * Get readiness status (for Kubernetes)
   */
  async isReady(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get liveness status (for Kubernetes)
   */
  isAlive(): boolean {
    // Process is alive if this code runs
    return true;
  }
}

// Export singleton instance
export const healthCheckService = new HealthCheckService();
