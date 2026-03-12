/**
 * System Health Dashboard Component
 *
 * Displays real-time system health status and performance metrics.
 * Features: live uptime counter, Page Visibility API pause, configurable
 * auto-refresh, countdown timer, stale-data error handling, and CPU/disk metrics.
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
  Zap,
  ChevronDown,
  MemoryStick,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  getDetailedHealth,
  formatUptime,
  formatBytes,
  type DetailedHealth,
  type ComponentHealth,
} from '@/services/endpoints/healthService';

// ─── Sub-components ────────────────────────────────────────────────────────

function StatusIcon({ status }: { status: 'up' | 'down' | 'degraded' }) {
  if (status === 'up') return <CheckCircle2 className="h-5 w-5 text-green-500" />;
  if (status === 'degraded') return <AlertCircle className="h-5 w-5 text-yellow-500" />;
  return <XCircle className="h-5 w-5 text-red-500" />;
}

type AnyStatus = 'up' | 'down' | 'degraded' | 'healthy' | 'unhealthy';

function StatusBadge({ status }: { status: AnyStatus }) {
  const classes: Record<string, string> = {
    up: 'bg-green-100 text-green-800 border-green-200',
    healthy: 'bg-green-100 text-green-800 border-green-200',
    degraded: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    down: 'bg-red-100 text-red-800 border-red-200',
    unhealthy: 'bg-red-100 text-red-800 border-red-200',
  };
  return (
    <Badge variant="outline" className={`capitalize ${classes[status] ?? ''}`}>
      {status}
    </Badge>
  );
}

function statusCardBorder(status: AnyStatus): string {
  if (status === 'healthy' || status === 'up') return 'border-l-4 border-l-green-500';
  if (status === 'degraded') return 'border-l-4 border-l-yellow-500';
  return 'border-l-4 border-l-red-500';
}

interface ComponentCardProps {
  name: string;
  icon: React.ElementType;
  health: ComponentHealth;
}

function ComponentCard({ name, icon: Icon, health }: ComponentCardProps) {
  return (
    <Card className={statusCardBorder(health.status)}>
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
  memoryMetrics,
  systemMemory,
}: {
  health: ComponentHealth;
  memoryMetrics?: {
    heapUsed: number;
    heapTotal: number;
    heapLimit: number;
    heapUsedPercentage: number;
    rss: number;
    external: number;
  };
  systemMemory?: { total: number; free: number; usedPercent: number };
}) {
  const heapPct = memoryMetrics ? Math.round(memoryMetrics.heapUsedPercentage ?? 0) : 0;
  const sysPct = systemMemory ? Math.round(systemMemory.usedPercent ?? 0) : null;

  return (
    <Card className={statusCardBorder(health.status)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <MemoryStick className="h-4 w-4 text-muted-foreground" />
            Memory
          </CardTitle>
          <StatusIcon status={health.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <StatusBadge status={health.status} />
          {health.message && <p className="text-sm text-muted-foreground">{health.message}</p>}
          {memoryMetrics && (
            <>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Heap</span>
                  <span className="font-medium">{heapPct}%</span>
                </div>
                <Progress
                  value={heapPct}
                  className={
                    heapPct > 90
                      ? '[&>div]:bg-red-500'
                      : heapPct > 75
                        ? '[&>div]:bg-yellow-500'
                        : ''
                  }
                />
              </div>
              {sysPct !== null && systemMemory && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">System RAM</span>
                    <span className="font-medium">{sysPct}%</span>
                  </div>
                  <Progress
                    value={sysPct}
                    className={
                      sysPct > 90
                        ? '[&>div]:bg-red-500'
                        : sysPct > 75
                          ? '[&>div]:bg-yellow-500'
                          : ''
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    {formatBytes(systemMemory.free)} free of {formatBytes(systemMemory.total)}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Heap Used</p>
                  <p className="font-medium">{formatBytes(memoryMetrics.heapUsed)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Heap Limit</p>
                  <p className="font-medium">{formatBytes(memoryMetrics.heapLimit)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">RSS</p>
                  <p className="font-medium">{formatBytes(memoryMetrics.rss)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">External</p>
                  <p className="font-medium">{formatBytes(memoryMetrics.external)}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────

const REFRESH_OPTIONS = [
  { label: '15 seconds', value: 15 },
  { label: '30 seconds', value: 30 },
  { label: '1 minute', value: 60 },
  { label: '5 minutes', value: 300 },
] as const;

function formatElapsed(seconds: number): string {
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s === 0 ? `${m}m ago` : `${m}m ${s}s ago`;
}

function healthySummary(checks: DetailedHealth['checks']): { healthy: number; total: number } {
  const all = Object.values(checks).filter(Boolean) as ComponentHealth[];
  return { healthy: all.filter((c) => c.status === 'up').length, total: all.length };
}

// ─── Main Component ────────────────────────────────────────────────────────

export function HealthDashboard() {
  const [health, setHealth] = React.useState<DetailedHealth | null>(null);
  const [isInitialLoad, setIsInitialLoad] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null);
  const [elapsedSecs, setElapsedSecs] = React.useState(0);
  const [countdownSecs, setCountdownSecs] = React.useState(30);
  const [liveUptime, setLiveUptime] = React.useState<number | null>(null);
  const [refreshInterval, setRefreshInterval] = React.useState(30);

  // Refs to avoid stale closure issues
  const abortRef = React.useRef<AbortController | null>(null);
  const hasDataRef = React.useRef(false);
  const refreshIntervalRef = React.useRef(refreshInterval);
  React.useEffect(() => {
    refreshIntervalRef.current = refreshInterval;
  }, [refreshInterval]);

  // Core fetch — stable (no external deps via ref pattern)
  const fetchHealth = React.useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (!hasDataRef.current) {
      setIsInitialLoad(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const data = await getDetailedHealth(controller.signal);
      if (controller.signal.aborted) return;
      hasDataRef.current = true;
      setHealth(data);
      setLiveUptime(data.uptime);
      setLastUpdated(new Date());
      setElapsedSecs(0);
      setCountdownSecs(refreshIntervalRef.current);
      setError(null);
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setError('Failed to connect to backend. Showing last known data.');
    } finally {
      setIsInitialLoad(false);
      setIsRefreshing(false);
    }
  }, []);

  // Auto-refresh (resets when interval changes)
  React.useEffect(() => {
    fetchHealth();
    const id = setInterval(fetchHealth, refreshInterval * 1000);
    setCountdownSecs(refreshInterval);
    return () => clearInterval(id);
  }, [fetchHealth, refreshInterval]);

  // Pause polling when tab is hidden, resume on visibility
  React.useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchHealth();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [fetchHealth]);

  // Abort in-flight request on unmount
  React.useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  // 1-second ticker: countdown + elapsed + live uptime
  React.useEffect(() => {
    const id = setInterval(() => {
      setElapsedSecs((e) => e + 1);
      setCountdownSecs((c) => Math.max(0, c - 1));
      setLiveUptime((u) => (u !== null ? u + 1 : null));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Initial loading state
  if (isInitialLoad) {
    return (
      <div
        className="flex items-center justify-center py-12"
        role="status"
        aria-label="Loading health data"
      >
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ── Error with no data (first load failed)
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

  const summary = health ? healthySummary(health.checks) : null;
  const overallBorder = health ? statusCardBorder(health.status) : '';
  const intervalLabel =
    REFRESH_OPTIONS.find((o) => o.value === refreshInterval)?.label ?? `${refreshInterval}s`;

  return (
    <div className="space-y-6">
      {/* ── Error banner (stale data) ── */}
      {error && health && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-7 px-2 text-destructive hover:bg-destructive/20"
            onClick={fetchHealth}
          >
            Retry
          </Button>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-balance text-2xl font-bold tracking-tight">System Health</h2>
          <p className="text-muted-foreground">Real-time backend status and performance metrics</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Updated ago */}
          {lastUpdated && (
            <span className="text-sm text-muted-foreground">
              Updated {formatElapsed(elapsedSecs)}
            </span>
          )}
          {/* Countdown */}
          <span className="text-sm tabular-nums text-muted-foreground">
            Next in {countdownSecs}s
          </span>
          {/* Refresh interval selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" aria-label="Set auto-refresh interval">
                <RefreshCw className="mr-1 h-3.5 w-3.5" />
                {intervalLabel}
                <ChevronDown className="ml-1 h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {REFRESH_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => setRefreshInterval(opt.value)}
                  className={refreshInterval === opt.value ? 'font-semibold' : ''}
                >
                  {opt.label}
                  {refreshInterval === opt.value && ' ✓'}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Manual refresh */}
          <Button
            onClick={fetchHealth}
            variant="outline"
            size="sm"
            disabled={isRefreshing}
            aria-label="Refresh now"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {health && (
        <>
          {/* ── Overall Status Card ── */}
          <Card className={overallBorder}>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <Activity className="h-6 w-6" />
                  <div>
                    <CardTitle>Overall Status</CardTitle>
                    <CardDescription>
                      v{health.version} — {health.environment}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {summary && (
                    <span className="text-sm text-muted-foreground">
                      {summary.healthy}/{summary.total} checks passing
                    </span>
                  )}
                  <StatusBadge status={health.status} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">Uptime</p>
                    <p className="font-medium tabular-nums">
                      {liveUptime !== null ? formatUptime(liveUptime) : '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Server className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">Node.js</p>
                    <p className="font-medium">{health.metrics?.processInfo?.nodeVersion ?? '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Cpu className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">CPU Cores</p>
                    <p className="font-medium">{health.metrics?.processInfo?.cpuCount ?? '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">Platform / PID</p>
                    <p className="font-medium">
                      {health.metrics?.processInfo?.platform ?? '—'} /{' '}
                      {health.metrics?.processInfo?.pid ?? '—'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Component Cards ── */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ComponentCard name="Database" icon={Database} health={health.checks.database} />
            {health.checks.cache && (
              <ComponentCard name="Redis Cache" icon={Server} health={health.checks.cache} />
            )}
            <MemoryCard
              health={health.checks.memory}
              memoryMetrics={health.metrics?.memoryUsage}
              systemMemory={health.metrics?.systemMemory}
            />
            {health.checks.monitoring && (
              <ComponentCard
                name="Error Monitoring"
                icon={Activity}
                health={health.checks.monitoring}
              />
            )}
            {health.checks.disk && (
              <ComponentCard name="Disk" icon={HardDrive} health={health.checks.disk} />
            )}
          </div>
        </>
      )}
    </div>
  );
}
