# Operations Runbook

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Daily Operations](#daily-operations)
3. [Incident Response](#incident-response)
4. [Backup & Recovery](#backup--recovery)
5. [Scaling](#scaling)
6. [Troubleshooting](#troubleshooting)

---

## Quick Reference

### Service URLs

| Environment | Frontend               | Backend API                   | Grafana | Prometheus |
| ----------- | ---------------------- | ----------------------------- | ------- | ---------- |
| Production  | https://yourdomain.com | https://yourdomain.com/api/v1 | :3002   | :9090      |
| Staging     | http://staging:8080    | http://staging:3001           | -       | -          |

### Important Commands

```bash
# View all containers
docker compose ps

# View logs
docker compose logs -f backend
docker compose logs -f --tail=100 frontend

# Restart services
docker compose restart backend
docker compose up -d --force-recreate backend

# Enter container shell
docker compose exec backend sh
docker compose exec postgres psql -U church_app -d church_app

# Health check
curl http://localhost:3000/health
curl http://localhost:3000/health/detailed
```

### Key Files

| File                            | Purpose                   |
| ------------------------------- | ------------------------- |
| `.env`                          | Environment configuration |
| `docker-compose.yml`            | Production services       |
| `docker-compose.staging.yml`    | Staging services          |
| `docker-compose.monitoring.yml` | Monitoring stack          |
| `nginx/nginx.prod.conf`         | Nginx configuration       |

---

## Daily Operations

### Morning Checklist

1. **Check Service Health**

   ```bash
   curl -s http://localhost:3000/health | jq
   ```

2. **Review Error Logs**

   ```bash
   docker compose logs --since=24h backend | grep -i error
   ```

3. **Check Disk Space**

   ```bash
   df -h
   docker system df
   ```

4. **Verify Backups**
   ```bash
   ls -la backups/ | tail -5
   ```

### Weekly Checklist

1. **Review Monitoring Dashboards**

   - Check Grafana for trends
   - Review Prometheus alerts

2. **Test Backup Restore**

   ```bash
   ./scripts/verify-backup.sh backups/latest.sql.gz
   ```

3. **Check for Updates**

   ```bash
   docker compose pull
   npm audit --prefix backend
   npm audit --prefix frontend
   ```

4. **Clean Up**
   ```bash
   docker system prune -f
   ./scripts/cleanup-old-backups.sh
   ```

---

## Incident Response

### Severity Levels

| Level | Description | Response Time | Examples             |
| ----- | ----------- | ------------- | -------------------- |
| P1    | Critical    | 15 minutes    | Site down, data loss |
| P2    | High        | 1 hour        | Major feature broken |
| P3    | Medium      | 4 hours       | Minor feature issues |
| P4    | Low         | 24 hours      | Cosmetic issues      |

### P1 - Site Down

1. **Check container status**

   ```bash
   docker compose ps
   docker compose logs --tail=50 backend
   ```

2. **Restart services**

   ```bash
   docker compose restart
   # or force recreate
   docker compose up -d --force-recreate
   ```

3. **Check database**

   ```bash
   docker compose exec postgres pg_isready
   docker compose logs postgres
   ```

4. **Check resources**

   ```bash
   free -h
   df -h
   docker stats --no-stream
   ```

5. **Rollback if needed**
   ```bash
   # Rollback to previous version
   docker compose down
   git checkout HEAD~1
   docker compose up -d
   ```

### P1 - Database Issues

1. **Check connection**

   ```bash
   docker compose exec postgres pg_isready -U church_app
   ```

2. **Check active connections**

   ```bash
   docker compose exec postgres psql -U church_app -c "SELECT count(*) FROM pg_stat_activity;"
   ```

3. **Kill stuck queries**

   ```bash
   docker compose exec postgres psql -U church_app -c "
     SELECT pg_terminate_backend(pid)
     FROM pg_stat_activity
     WHERE duration > interval '5 minutes';"
   ```

4. **Restore from backup**
   ```bash
   ./scripts/restore-database.sh backups/latest.sql.gz
   ```

### P2 - High Memory Usage

1. **Check memory**

   ```bash
   docker stats --no-stream
   ```

2. **Restart high-memory container**

   ```bash
   docker compose restart backend
   ```

3. **Clear Redis cache**
   ```bash
   docker compose exec redis redis-cli -a $REDIS_PASSWORD FLUSHALL
   ```

---

## Backup & Recovery

### Manual Backup

```bash
# Database backup
./scripts/backup-database.sh

# Full system backup
tar -czvf backup-$(date +%Y%m%d).tar.gz \
  backups/ \
  .env \
  docker-compose.yml
```

### Automated Backups

Backups run automatically via GitHub Actions:

- Daily at 2:00 AM UTC
- Uploaded to S3 (if configured)
- Retained for 30 days

### Recovery Procedures

#### Database Recovery

```bash
# List available backups
ls -la backups/

# Restore from backup
./scripts/restore-database.sh backups/church_app_daily_20231215_020000.sql.gz

# Run migrations
docker compose exec backend npx prisma migrate deploy
```

#### Full System Recovery

```bash
# 1. Clone repository
git clone https://github.com/your-org/church_app.git
cd church_app

# 2. Restore configuration
cp /path/to/backup/.env .

# 3. Start services
docker compose up -d

# 4. Restore database
./scripts/restore-database.sh /path/to/backup/database.sql.gz

# 5. Verify
curl http://localhost:3000/health
```

---

## Scaling

### Vertical Scaling

Increase container resources in `docker-compose.yml`:

```yaml
backend:
  deploy:
    resources:
      limits:
        cpus: "2"
        memory: 2G
      reservations:
        cpus: "1"
        memory: 1G
```

### Horizontal Scaling

For high-traffic scenarios, use multiple backend replicas:

```yaml
backend:
  deploy:
    replicas: 3
```

Update nginx for load balancing:

```nginx
upstream backend {
    least_conn;
    server backend_1:3000;
    server backend_2:3000;
    server backend_3:3000;
}
```

### Database Scaling

1. **Read Replicas**: Add PostgreSQL replicas for read-heavy workloads
2. **Connection Pooling**: Use PgBouncer for connection management
3. **Caching**: Increase Redis cache size

---

## Troubleshooting

### Common Issues

#### Container Won't Start

```bash
# Check logs
docker compose logs backend

# Common causes:
# - Missing environment variables
# - Database not ready
# - Port conflicts

# Fix: Check .env file and restart
docker compose down
docker compose up -d
```

#### Database Connection Refused

```bash
# Check if PostgreSQL is running
docker compose ps postgres

# Check logs
docker compose logs postgres

# Restart PostgreSQL
docker compose restart postgres

# Wait and retry
sleep 10
docker compose restart backend
```

#### High Response Times

```bash
# Check database queries
docker compose exec postgres psql -U church_app -c "
  SELECT query, calls, mean_time, total_time
  FROM pg_stat_statements
  ORDER BY mean_time DESC
  LIMIT 10;"

# Check Redis
docker compose exec redis redis-cli -a $REDIS_PASSWORD INFO stats

# Clear cache
docker compose exec redis redis-cli -a $REDIS_PASSWORD FLUSHALL
```

#### SSL Certificate Issues

```bash
# Check certificate expiry
openssl x509 -enddate -noout -in nginx/ssl/fullchain.pem

# Renew Let's Encrypt
certbot renew

# Copy new certs
cp /etc/letsencrypt/live/yourdomain.com/* nginx/ssl/

# Restart nginx
docker compose restart frontend
```

### Log Analysis

```bash
# Backend errors
docker compose logs backend 2>&1 | grep -E "error|Error|ERROR"

# Authentication failures
docker compose logs backend 2>&1 | grep -i "auth"

# Database slow queries
docker compose logs backend 2>&1 | grep -i "slow"

# Export logs for analysis
docker compose logs --since=24h > logs-$(date +%Y%m%d).txt
```

### Performance Profiling

```bash
# Container resource usage
docker stats

# System resources
htop
iotop

# Database performance
docker compose exec postgres psql -U church_app -c "
  SELECT * FROM pg_stat_user_tables ORDER BY n_live_tup DESC;"
```

---

## Contact & Escalation

| Role             | Contact                   | When to Contact    |
| ---------------- | ------------------------- | ------------------ |
| On-Call Engineer | oncall@church-app.local   | P1/P2 incidents    |
| Database Admin   | dba@church-app.local      | Database issues    |
| Security Team    | security@church-app.local | Security incidents |

---

## Appendix

### Environment Variables Reference

| Variable       | Required | Description                   |
| -------------- | -------- | ----------------------------- |
| `DATABASE_URL` | Yes      | PostgreSQL connection string  |
| `JWT_SECRET`   | Yes      | JWT signing secret (64 chars) |
| `REDIS_URL`    | Yes      | Redis connection string       |
| `CORS_ORIGIN`  | Yes      | Allowed CORS origins          |
| `SMTP_HOST`    | No       | Email server hostname         |
| `SENTRY_DSN`   | No       | Sentry error tracking         |

### Health Check Endpoints

| Endpoint           | Purpose              |
| ------------------ | -------------------- |
| `/health`          | Basic liveness check |
| `/health/detailed` | Full system health   |
| `/metrics`         | Prometheus metrics   |

### Useful Queries

```sql
-- Active users in last 24h
SELECT COUNT(DISTINCT "userId") FROM "AuditLog"
WHERE "createdAt" > NOW() - INTERVAL '24 hours';

-- Events this month
SELECT COUNT(*) FROM "Event"
WHERE "startDate" >= DATE_TRUNC('month', CURRENT_DATE);

-- Database size
SELECT pg_size_pretty(pg_database_size('church_app'));
```
