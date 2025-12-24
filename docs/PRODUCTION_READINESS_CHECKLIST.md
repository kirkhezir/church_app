# Production Readiness Checklist

Use this checklist before deploying to production.

## Pre-Deployment

### ✅ Security

- [ ] **JWT_SECRET** is randomly generated (64+ chars)
- [ ] **Database password** is strong and unique
- [ ] **Redis password** is set
- [ ] **MFA enabled** for admin accounts
- [ ] Default credentials changed
- [ ] HTTPS/SSL configured
- [ ] Security headers configured (CSP, HSTS, etc.)
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (Prisma ORM)
- [ ] XSS prevention (React escaping)
- [ ] CSRF protection enabled
- [ ] Sensitive data encrypted at rest
- [ ] Audit logging enabled

### ✅ Environment

- [ ] `NODE_ENV=production`
- [ ] Debug mode disabled
- [ ] Error details hidden from clients
- [ ] Logging level set to `info` or `warn`
- [ ] All required env vars set
- [ ] No `.env` files committed to git

### ✅ Database

- [ ] Production database created
- [ ] Migrations applied
- [ ] Backups configured
- [ ] Connection pooling configured
- [ ] Indexes verified
- [ ] Test data removed/replaced

### ✅ Infrastructure

- [ ] Server meets minimum requirements
- [ ] Firewall configured
- [ ] SSL certificates valid (not expiring soon)
- [ ] DNS configured correctly
- [ ] Load balancer configured (if applicable)
- [ ] Health checks configured

### ✅ Monitoring

- [ ] Error tracking (Sentry) configured
- [ ] Metrics collection (Prometheus)
- [ ] Dashboards set up (Grafana)
- [ ] Alerts configured
- [ ] Log aggregation set up

### ✅ Backup & Recovery

- [ ] Automated backups scheduled
- [ ] Backup retention policy defined
- [ ] Backup restore tested
- [ ] Disaster recovery plan documented

### ✅ Performance

- [ ] Caching enabled (Redis)
- [ ] Gzip compression enabled
- [ ] Static assets optimized
- [ ] Database queries optimized
- [ ] CDN configured (if applicable)

### ✅ Documentation

- [ ] README updated
- [ ] API documentation current
- [ ] Deployment guide complete
- [ ] Runbook available
- [ ] Contact information updated

---

## Security Configuration Verification

### SSL/TLS

```bash
# Check certificate validity
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com < /dev/null 2>/dev/null | openssl x509 -noout -dates

# Check SSL configuration
curl -I https://yourdomain.com

# Test SSL grade
# Visit: https://www.ssllabs.com/ssltest/
```

### Security Headers

```bash
# Check security headers
curl -I https://yourdomain.com | grep -i -E "(strict-transport|x-frame|x-content|x-xss|referrer|content-security)"
```

Expected headers:

- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy: ...`

### Authentication

```bash
# Test rate limiting
for i in {1..10}; do curl -s -o /dev/null -w "%{http_code}\n" -X POST https://yourdomain.com/api/v1/auth/login -d '{"email":"test","password":"test"}'; done
# Should see 429 after several attempts

# Test token validation
curl -H "Authorization: Bearer invalid-token" https://yourdomain.com/api/v1/members
# Should return 401
```

### Database Security

```sql
-- Check for default passwords
SELECT usename FROM pg_user WHERE passwd IS NULL;

-- Check connection limits
SHOW max_connections;

-- Check SSL mode
SHOW ssl;
```

---

## Disaster Recovery Testing

### Backup Restore Test

```bash
# 1. Create test backup
./scripts/backup-database.sh -f test-backup

# 2. Create test database
createdb church_app_restore_test

# 3. Restore backup
./scripts/restore-database.sh backups/test-backup.sql.gz

# 4. Verify data
psql -d church_app_restore_test -c "SELECT COUNT(*) FROM \"User\";"

# 5. Cleanup
dropdb church_app_restore_test
```

### Failover Test

```bash
# 1. Stop primary service
docker compose stop backend

# 2. Verify health check fails
curl http://localhost:3000/health
# Should fail

# 3. Restart service
docker compose start backend

# 4. Verify recovery
curl http://localhost:3000/health
# Should succeed
```

---

## Performance Baseline

Record these metrics before go-live:

| Metric                  | Target  | Actual   |
| ----------------------- | ------- | -------- |
| Health check response   | < 100ms | \_\_\_ms |
| Login response          | < 500ms | \_\_\_ms |
| Member list (100 items) | < 1s    | \_\_\_ms |
| Event list response     | < 500ms | \_\_\_ms |
| File upload (1MB)       | < 2s    | \_\_\_ms |
| Concurrent users        | 200+    | \_\_\_   |

### Load Test

```bash
# Using k6
k6 run --vus 50 --duration 5m load-test.js
```

---

## Final Sign-Off

| Item                 | Verified By  | Date       |
| -------------------- | ------------ | ---------- |
| Security review      | ****\_\_**** | **/**/\_\_ |
| Performance test     | ****\_\_**** | **/**/\_\_ |
| Backup test          | ****\_\_**** | **/**/\_\_ |
| Documentation        | ****\_\_**** | **/**/\_\_ |
| Stakeholder approval | ****\_\_**** | **/**/\_\_ |

---

## Post-Deployment

### Immediate (First Hour)

- [ ] Verify application accessible
- [ ] Test login functionality
- [ ] Test critical user flows
- [ ] Check error logs
- [ ] Verify monitoring active

### First Day

- [ ] Review error rates
- [ ] Check performance metrics
- [ ] Verify emails sending
- [ ] Test push notifications
- [ ] Backup completed successfully

### First Week

- [ ] Review user feedback
- [ ] Check resource utilization
- [ ] Verify backup retention
- [ ] Review security logs
- [ ] Plan any necessary fixes

---

_Last updated: December 2025_
