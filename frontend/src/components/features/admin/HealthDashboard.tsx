/**
 * System Health Dashboard Component
 *
 * Displays system health status and metrics
 */

import * as React from 'react';
import {
  Activity,
  Database,
  Server,
  Cpu,
  HardDrive,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  getDetailedHealth,
  formatUptime,
  formatBytes,
  type DetailedHealth,
  type ComponentHealth,
} from '@/services/endpoints/healthService';

function StatusIcon({ status }: { status: 'healthy' | 'unhealthy' | 'degraded' }) {
  switch (status) {
    case 'healthy':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case 'degraded':
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    case 'unhealthy':
      return <XCircle className="h-5 w-5 text-red-500" />;
  }
}

function StatusBadge({ status }: { status: 'healthy' | 'unhealthy' | 'degraded' }) {
  const variants: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
    healthy: 'default',
    degraded: 'secondary',
    unhealthy: 'destructive',
  };

  return (
    <Badge variant={variants[status]} className="capitalize">
      {status}
    </Badge>
  );
}

interface ComponentCardProps {
  name: string;
  icon: React.ElementType;
  health: ComponentHealth & { details?: Record<string, unknown> };
}

function ComponentCard({ name, icon: Icon, health }: ComponentCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon className="h-4 w-4 text-muted-foreground" />
            {name}
          </CardTitle>
          <StatusIcon status={health.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <StatusBadge status={health.status} />
          {health.message && <p className="text-sm text-muted-foreground">{health.message}</p>}
          {health.latency !== undefined && (
            <p className="text-sm text-muted-foreground">Latency: {health.latency}ms</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function MemoryCard({
  health,
}: {
  health: ComponentHealth & {
    details?: {
      heapUsed: number;
      heapTotal: number;
      rss: number;
      external: number;
    };
  };
}) {
  const heapPercentage = health.details
    ? Math.round((health.details.heapUsed / health.details.heapTotal) * 100)
    : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Cpu className="h-4 w-4 text-muted-foreground" />
            Memory
          </CardTitle>
          <StatusIcon status={health.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <StatusBadge status={health.status} />
          {health.details && (
            <>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Heap Usage</span>
                  <span>{heapPercentage}%</span>
                </div>
                <Progress value={heapPercentage} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Heap Used</p>
                  <p className="font-medium">{formatBytes(health.details.heapUsed)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Heap Total</p>
                  <p className="font-medium">{formatBytes(health.details.heapTotal)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">RSS</p>
                  <p className="font-medium">{formatBytes(health.details.rss)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">External</p>
                  <p className="font-medium">{formatBytes(health.details.external)}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function HealthDashboard() {
  const [health, setHealth] = React.useState<DetailedHealth | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null);

  const fetchHealth = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDetailedHealth();
      setHealth(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to fetch health status');
      console.error('Health check failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchHealth();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  if (loading && !health) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !health) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" />
            Connection Error
          </CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchHealth} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Health</h2>
          <p className="text-muted-foreground">Monitor system status and performance metrics</p>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-sm text-muted-foreground">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button onClick={fetchHealth} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {health && (
        <>
          {/* Overall Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity className="h-6 w-6" />
                  <div>
                    <CardTitle>Overall Status</CardTitle>
                    <CardDescription>v{health.version}</CardDescription>
                  </div>
                </div>
                <StatusBadge status={health.status} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Uptime</p>
                    <p className="font-medium">{formatUptime(health.uptime)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Server className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Environment</p>
                    <p className="font-medium capitalize">{health.environment}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <HardDrive className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Node.js</p>
                    <p className="font-medium">{health.process.nodeVersion}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Cpu className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Platform</p>
                    <p className="font-medium">
                      {health.process.platform} ({health.process.arch})
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Components */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ComponentCard name="Database" icon={Database} health={health.components.database} />
            {health.components.redis && (
              <ComponentCard name="Redis Cache" icon={Server} health={health.components.redis} />
            )}
            <MemoryCard health={health.components.memory} />
            {health.components.sentry && (
              <ComponentCard
                name="Error Monitoring"
                icon={Activity}
                health={health.components.sentry}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
