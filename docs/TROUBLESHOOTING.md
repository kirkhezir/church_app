# Troubleshooting Guide

Quick solutions for common issues in the Church Management Application.

## Table of Contents

1. [Development Issues](#development-issues)
2. [Authentication Problems](#authentication-problems)
3. [Database Issues](#database-issues)
4. [Email Problems](#email-problems)
5. [Frontend Issues](#frontend-issues)
6. [Production Issues](#production-issues)
7. [Performance Problems](#performance-problems)

---

## Development Issues

### "Cannot find module" errors

**Problem:** TypeScript/Node.js cannot find imported modules.

**Solutions:**

```bash
# Reinstall dependencies
rm -rf node_modules
npm install

# Regenerate Prisma client
cd backend
npx prisma generate
```

### "Port already in use"

**Problem:** Server fails to start because port is occupied.

**Solutions:**

```bash
# Find process using port (PowerShell)
Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess
taskkill /PID <process_id> /F

# Find process using port (Linux/Mac)
lsof -i :3000
kill -9 <PID>
```

### Prisma migration issues

**Problem:** Database schema out of sync.

**Solutions:**

```bash
cd backend

# Reset database (development only!)
npx prisma migrate reset

# Apply pending migrations
npx prisma migrate deploy

# Regenerate client
npx prisma generate
```

### Hot reload not working

**Problem:** Changes not reflected without restart.

**Solutions:**

```bash
# Backend: Use tsx watch
npm run dev

# Frontend: Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

---

## Authentication Problems

### "Invalid credentials"

**Checklist:**

- [ ] Email spelled correctly
- [ ] Password is correct
- [ ] Account is active (not deactivated)
- [ ] Account is not locked (check failed attempts)

**Admin fix:**

```sql
-- Reset failed login attempts
UPDATE "User" SET "failedLoginAttempts" = 0, "lockedUntil" = NULL
WHERE email = 'user@example.com';
```

### "Account locked"

**Problem:** Too many failed login attempts.

**Solution:**

- Wait 15 minutes (default lockout)
- Or admin can unlock:

```sql
UPDATE "User" SET "failedLoginAttempts" = 0, "lockedUntil" = NULL
WHERE email = 'user@example.com';
```

### MFA not working

**Checklist:**

- [ ] Device time is synchronized (NTP)
- [ ] Using correct authenticator app
- [ ] Code entered within 30-second window

**Admin fix:**

```sql
-- Disable MFA for user
UPDATE "User" SET "mfaEnabled" = false, "mfaSecret" = NULL
WHERE email = 'user@example.com';
```

### JWT token expired

**Problem:** "Token expired" or "Invalid token" errors.

**Solutions:**

- Clear browser cookies/localStorage
- Log out and log in again
- Check server time synchronization

### Session issues

**Problem:** Randomly logged out.

**Checklist:**

- [ ] Check `JWT_ACCESS_EXPIRY` setting
- [ ] Browser not blocking cookies
- [ ] No multiple tabs with different users

---

## Database Issues

### Connection refused

**Problem:** Cannot connect to PostgreSQL.

**Checklist:**

- [ ] PostgreSQL is running
- [ ] Connection string is correct
- [ ] Firewall allows connections
- [ ] User has correct permissions

**Verify connection:**

```bash
# Test connection
psql -h localhost -U postgres -d church_app

# Check PostgreSQL status
sudo systemctl status postgresql
```

### "Relation does not exist"

**Problem:** Tables not created.

**Solution:**

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

### Slow queries

**Problem:** Database operations are slow.

**Solutions:**

```sql
-- Find slow queries
SELECT query, calls, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check missing indexes
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public';
```

### Out of connections

**Problem:** "Too many connections" error.

**Solutions:**

```sql
-- Check current connections
SELECT count(*) FROM pg_stat_activity;

-- Kill idle connections
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle' AND query_start < NOW() - INTERVAL '5 minutes';
```

**Prevent:**

```env
DATABASE_POOL_MAX=20
```

---

## Email Problems

### Emails not sending

**Checklist:**

- [ ] `EMAIL_ENABLED=true`
- [ ] SMTP credentials correct
- [ ] App password (not regular password) for Gmail
- [ ] Less secure apps enabled (if required)

**Test email:**

```bash
# Check SMTP connection
telnet smtp.gmail.com 587
```

### Gmail "Sign in attempt blocked"

**Solution:**

1. Enable 2-factor authentication on Gmail
2. Generate App Password: Google Account → Security → App Passwords
3. Use app password in `SMTP_PASSWORD`

### Emails going to spam

**Solutions:**

- Configure SPF record
- Configure DKIM
- Configure DMARC
- Use consistent "From" address
- Avoid spam trigger words

### "Connection timeout"

**Checklist:**

- [ ] SMTP host is correct
- [ ] Port is correct (587 for TLS, 465 for SSL)
- [ ] Firewall allows outbound SMTP

---

## Frontend Issues

### Blank page / White screen

**Solutions:**

```bash
# Clear cache and rebuild
cd frontend
rm -rf node_modules/.vite dist
npm run build

# Check browser console for errors
# Press F12 → Console tab
```

### API calls failing

**Checklist:**

- [ ] Backend is running
- [ ] `VITE_API_URL` is correct
- [ ] CORS is configured properly
- [ ] No ad-blocker interfering

**Check CORS:**

```env
# Backend
CORS_ORIGIN=http://localhost:5173
```

### Assets not loading

**Problem:** Images, fonts, or scripts not loading.

**Solutions:**

```bash
# Rebuild
cd frontend
npm run build

# Check paths in browser network tab
```

### Form not submitting

**Checklist:**

- [ ] No validation errors (check UI)
- [ ] Button not disabled
- [ ] Check network tab for failed requests
- [ ] Check console for JavaScript errors

### Push notifications not working

**Checklist:**

- [ ] HTTPS enabled (required for push)
- [ ] VAPID keys configured
- [ ] Browser permissions granted
- [ ] Service worker registered

---

## Production Issues

### Container not starting

**Debug steps:**

```bash
# Check logs
docker compose logs backend

# Check container status
docker compose ps

# Check environment
docker compose config
```

### 502 Bad Gateway

**Problem:** Nginx cannot reach backend.

**Solutions:**

```bash
# Check if backend is running
docker compose ps

# Check backend logs
docker compose logs backend

# Restart services
docker compose restart
```

### SSL certificate errors

**Solutions:**

```bash
# Check certificate
openssl x509 -enddate -noout -in /path/to/cert.pem

# Renew Let's Encrypt
certbot renew

# Restart nginx
docker compose restart frontend
```

### High memory usage

**Solutions:**

```bash
# Check memory
docker stats

# Restart container
docker compose restart backend

# Check for memory leaks
# Look for increasing memory in logs
```

### Disk space full

**Solutions:**

```bash
# Check disk usage
df -h

# Clean Docker
docker system prune -a

# Clean old logs
find ./logs -mtime +7 -delete

# Clean old backups
./scripts/cleanup-old-backups.sh
```

---

## Performance Problems

### Slow API responses

**Diagnosis:**

```bash
# Check response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000/api/v1/members
```

**Solutions:**

- Enable Redis caching
- Add database indexes
- Optimize queries
- Enable compression

### High CPU usage

**Solutions:**

```bash
# Check what's using CPU
docker stats

# Profile Node.js
node --prof src/index.js
```

### Memory leaks

**Signs:**

- Memory usage constantly increasing
- Eventually crashes with OOM

**Solutions:**

- Enable heap snapshots
- Check for unclosed connections
- Review event listeners

### Slow page loads

**Solutions:**

- Enable gzip compression
- Use CDN for static assets
- Enable browser caching
- Optimize images
- Code splitting

---

## Quick Diagnostic Commands

```bash
# System health
curl http://localhost:3000/health/detailed | jq

# Database status
docker compose exec postgres pg_isready

# Redis status
docker compose exec redis redis-cli ping

# View logs
docker compose logs --tail=100 -f

# Check disk space
docker system df

# Check memory
free -h

# Test email
curl -X POST http://localhost:3000/api/v1/test-email
```

---

## Getting Help

If you can't resolve an issue:

1. **Check logs** for error messages
2. **Search** existing GitHub issues
3. **Create** a new issue with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Error messages/logs
   - Environment info

---

_Last updated: December 2025_
