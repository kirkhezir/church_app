# Monitoring & Alerting Setup Guide

## Overview

This guide covers setting up comprehensive monitoring for the Church Management App to ensure reliability, performance, and quick issue detection.

---

## 1. Sentry Error Tracking

### Setup

1. **Create Sentry Account**

   - Go to [sentry.io](https://sentry.io)
   - Create a free account (sufficient for our needs)

2. **Create Projects**

   - Create "church-app-backend" (Node.js)
   - Create "church-app-frontend" (React)

3. **Configure Backend**

   Add to `.env.production`:

   ```bash
   SENTRY_ENABLED=true
   SENTRY_DSN=https://your-key@sentry.io/your-project-id
   ```

4. **Configure Frontend**

   Add to `.env.production`:

   ```bash
   VITE_SENTRY_DSN=https://your-key@sentry.io/your-frontend-project-id
   ```

### Alert Rules

Configure these alerts in Sentry:

| Alert           | Condition           | Notify          |
| --------------- | ------------------- | --------------- |
| High Error Rate | > 10 errors/hour    | Email + Slack   |
| Critical Error  | New unhandled error | Immediate email |
| Weekly Report   | Every Monday        | Email summary   |

---

## 2. Uptime Monitoring

### Recommended: UptimeRobot (Free Tier)

1. **Create Account**

   - Go to [uptimerobot.com](https://uptimerobot.com)
   - Sign up for free account

2. **Add Monitors**

   | Name         | URL                                       | Interval | Alert |
   | ------------ | ----------------------------------------- | -------- | ----- |
   | Health Check | https://api.your-domain.com/health        | 5 min    | Email |
   | Frontend     | https://your-domain.com                   | 5 min    | Email |
   | API Response | https://api.your-domain.com/api/v1/health | 5 min    | Email |

3. **Status Page**
   - Create public status page
   - Share URL with stakeholders
   - Embed on your help page

### Alternative: Pingdom or Better Uptime

Similar setup process, more features in paid plans.

---

## 3. Database Monitoring

### PostgreSQL Health Checks

Add this SQL query as a scheduled check:

```sql
-- Check database health
SELECT
    pg_database_size(current_database()) as db_size,
    (SELECT count(*) FROM pg_stat_activity) as active_connections,
    (SELECT count(*) FROM member WHERE "deletedAt" IS NULL) as active_members;
```

### Automated Alerts

Set up alerts for:

- Database size > 80% of limit
- Active connections > 80% of max
- Query response time > 5 seconds

### Backup Verification

Weekly automated check:

```bash
#!/bin/bash
# verify-backup.sh
BACKUP_FILE=$(ls -t /backups/*.dump | head -1)
pg_restore --list "$BACKUP_FILE" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "Backup valid: $BACKUP_FILE"
else
    echo "ERROR: Invalid backup!" | mail -s "Backup Alert" admin@church.com
fi
```

---

## 4. Application Performance Monitoring (APM)

### Simple Custom Metrics

Add to backend for custom metrics logging:

```typescript
// src/utils/metrics.ts
interface Metrics {
  apiRequestCount: number;
  apiErrorCount: number;
  avgResponseTime: number;
  activeUsers: number;
}

class MetricsCollector {
  private metrics: Metrics = {
    apiRequestCount: 0,
    apiErrorCount: 0,
    avgResponseTime: 0,
    activeUsers: 0,
  };

  recordRequest(responseTime: number, isError: boolean) {
    this.metrics.apiRequestCount++;
    if (isError) this.metrics.apiErrorCount++;
    // Update rolling average
    this.metrics.avgResponseTime =
      (this.metrics.avgResponseTime + responseTime) / 2;
  }

  getMetrics(): Metrics {
    return { ...this.metrics };
  }

  reset() {
    this.metrics = {
      apiRequestCount: 0,
      apiErrorCount: 0,
      avgResponseTime: 0,
      activeUsers: 0,
    };
  }
}

export const metricsCollector = new MetricsCollector();
```

### Metrics Endpoint

```typescript
// Add to routes
router.get("/metrics", adminAuth, (req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    metrics: metricsCollector.getMetrics(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});
```

---

## 5. Log Aggregation

### Winston Logger Configuration

Already configured in the app. Key log levels:

| Level | Use For                    |
| ----- | -------------------------- |
| error | Errors requiring attention |
| warn  | Potential issues           |
| info  | Normal operations          |
| debug | Detailed debugging         |

### Log Rotation

Configure with `winston-daily-rotate-file`:

```typescript
import DailyRotateFile from "winston-daily-rotate-file";

const fileRotateTransport = new DailyRotateFile({
  filename: "logs/app-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxFiles: "14d", // Keep 14 days
  maxSize: "20m", // Max 20MB per file
});
```

### Log Analysis

Weekly review checklist:

- [ ] Check for recurring errors
- [ ] Review error rate trends
- [ ] Identify slow operations
- [ ] Check for security warnings

---

## 6. Health Check Endpoint

The app includes a comprehensive health endpoint:

**URL**: `GET /health`

**Response**:

```json
{
  "status": "healthy",
  "timestamp": "2026-01-06T12:00:00Z",
  "version": "1.0.0",
  "uptime": 86400,
  "checks": {
    "database": "ok",
    "email": "ok",
    "memory": "ok"
  }
}
```

### Health Check Script

```bash
#!/bin/bash
# health-check.sh
HEALTH_URL="https://api.your-domain.com/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $RESPONSE -eq 200 ]; then
    echo "Health check passed"
    exit 0
else
    echo "Health check FAILED (HTTP $RESPONSE)"
    # Send alert
    curl -X POST "https://api.slack.com/webhook/..." \
         -d '{"text":"⚠️ Church App health check failed!"}'
    exit 1
fi
```

---

## 7. Alert Configuration

### Alert Channels

| Channel | Use For       | Setup    |
| ------- | ------------- | -------- |
| Email   | All alerts    | Primary  |
| Slack   | Urgent alerts | Optional |
| SMS     | Critical only | Optional |

### Alert Levels

| Level       | Response Time     | Examples             |
| ----------- | ----------------- | -------------------- |
| P1 Critical | 15 minutes        | App down, data loss  |
| P2 High     | 1 hour            | Major feature broken |
| P3 Medium   | 8 hours           | Minor issues         |
| P4 Low      | Next business day | Cosmetic issues      |

### Sample Alert Rules

```yaml
# alert-rules.yaml (conceptual)
alerts:
  - name: "App Down"
    condition: "health_check_failed for 5 minutes"
    severity: "critical"
    notify: ["email", "sms"]

  - name: "High Error Rate"
    condition: "error_rate > 5% for 15 minutes"
    severity: "high"
    notify: ["email", "slack"]

  - name: "Slow Response"
    condition: "avg_response_time > 3s for 10 minutes"
    severity: "medium"
    notify: ["email"]

  - name: "Database Connection Issues"
    condition: "db_connection_errors > 0"
    severity: "high"
    notify: ["email", "slack"]
```

---

## 8. Dashboard Setup

### Grafana (Optional - Advanced)

If you want visual dashboards:

1. Deploy Grafana container
2. Add Prometheus data source
3. Import dashboard templates
4. Configure alerts

### Simple Monitoring Dashboard

Create a simple admin dashboard page showing:

- System health status
- Active users (last hour)
- Error count (today)
- Response time graph
- Recent error logs

---

## 9. On-Call Rotation

### For Small Teams

| Day     | Primary  | Backup   |
| ------- | -------- | -------- |
| Mon-Thu | Person A | Person B |
| Fri-Sun | Person B | Person A |

### Escalation

1. Alert to primary (5 min)
2. Escalate to backup (15 min)
3. Escalate to all (30 min)

---

## 10. Monitoring Checklist

### Daily

- [ ] Check health endpoint
- [ ] Review error logs
- [ ] Verify backups ran

### Weekly

- [ ] Review Sentry issues
- [ ] Check performance metrics
- [ ] Review uptime report
- [ ] Verify backup restore works

### Monthly

- [ ] Review and update alerts
- [ ] Test incident response
- [ ] Update documentation
- [ ] Security log review

---

## Quick Setup Commands

```bash
# Install monitoring dependencies
npm install @sentry/node @sentry/tracing

# Test health endpoint
curl http://localhost:3000/health | jq

# Check logs
tail -f logs/app-$(date +%Y-%m-%d).log

# Database health
psql $DATABASE_URL -c "SELECT pg_database_size(current_database());"
```

---

_Monitoring Setup Guide v1.0 - January 2026_
