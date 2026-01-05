# Production Deployment Checklist

## Pre-Deployment Checklist

### 1. Environment Configuration

- [ ] Create `.env` file in project root with production values
- [ ] Generate strong JWT_SECRET (64+ characters)
- [ ] Set secure DATABASE_URL with strong password
- [ ] Configure CORS_ORIGIN to production domain
- [ ] Set up SMTP credentials for email notifications
- [ ] Generate VAPID keys for push notifications

### 2. Security Review

- [ ] All default passwords changed
- [ ] JWT expiry times configured appropriately
- [ ] Rate limiting enabled
- [ ] HTTPS enforced (SSL certificate ready)
- [ ] Helmet security headers enabled
- [ ] CORS properly configured

### 3. Database Preparation

- [ ] Production database created
- [ ] Database user with limited privileges created
- [ ] Database backup script tested
- [ ] Connection pooling configured

### 4. Build Verification

```bash
# Frontend build
cd frontend
npm run build

# Backend build
cd ../backend
npm run build
```

- [ ] Frontend builds without errors
- [ ] Backend builds without errors
- [ ] All TypeScript type checks pass

---

## Deployment Steps

### Using Docker (Recommended)

```bash
# 1. Set environment variables
cp .env.example .env
# Edit .env with production values

# 2. Build and start services
docker compose up -d --build

# 3. Run database migrations
docker compose exec backend npx prisma migrate deploy

# 4. Create initial admin user (if not seeded)
docker compose exec backend npx prisma db seed
```

### Manual Deployment

```bash
# Backend
cd backend
npm ci --production
npm run build
npx prisma migrate deploy
npm start

# Frontend (serve with nginx)
cd frontend
npm ci --production
npm run build
# Copy dist/ to web server root
```

---

## Post-Deployment Checklist

### 1. Health Verification

- [ ] Health endpoint responding: `curl https://yourdomain.com/api/v1/health`
- [ ] Frontend loading correctly
- [ ] API endpoints accessible

### 2. Feature Verification

- [ ] Login working (test with admin account)
- [ ] MFA verification working
- [ ] Events page loading
- [ ] Member directory accessible
- [ ] Messages sending/receiving
- [ ] Announcements displaying
- [ ] Analytics dashboard showing data

### 3. Email Testing

- [ ] Password reset email sending
- [ ] Welcome email sending
- [ ] Event RSVP confirmation sending
- [ ] Announcement notification sending

### 4. Monitoring Setup

- [ ] Application logs being collected
- [ ] Error monitoring (Sentry) configured
- [ ] Uptime monitoring configured
- [ ] Database monitoring in place

### 5. Backup Verification

- [ ] Database backup script working
- [ ] Backup storage configured (S3 or local)
- [ ] Backup retention policy set
- [ ] Test restore procedure documented

---

## Environment Variables Reference

### Required Variables

| Variable       | Description                  | Example                               |
| -------------- | ---------------------------- | ------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET`   | Secret for JWT signing       | 64+ random characters                 |
| `CORS_ORIGIN`  | Allowed frontend domain      | `https://yourdomain.com`              |
| `NODE_ENV`     | Environment mode             | `production`                          |

### Email Configuration

| Variable          | Description          | Example                  |
| ----------------- | -------------------- | ------------------------ |
| `SMTP_HOST`       | SMTP server hostname | `smtp.gmail.com`         |
| `SMTP_PORT`       | SMTP server port     | `587`                    |
| `SMTP_USER`       | SMTP username        | `your-email@gmail.com`   |
| `SMTP_PASSWORD`   | SMTP password        | App-specific password    |
| `SMTP_FROM_EMAIL` | From email address   | `noreply@yourdomain.com` |

### Optional Variables

| Variable             | Description                     | Default |
| -------------------- | ------------------------------- | ------- |
| `PORT`               | Backend port                    | `3000`  |
| `JWT_ACCESS_EXPIRY`  | Access token expiry             | `15m`   |
| `JWT_REFRESH_EXPIRY` | Refresh token expiry            | `7d`    |
| `SENTRY_DSN`         | Sentry error tracking           | -       |
| `REDIS_URL`          | Redis connection (for sessions) | -       |

---

## Troubleshooting

### Common Issues

**Database connection failed:**

- Check DATABASE_URL format
- Verify database server is running
- Check firewall rules for port 5432

**Frontend not loading:**

- Verify nginx configuration
- Check CORS_ORIGIN matches frontend URL
- Inspect browser console for errors

**Email not sending:**

- Verify SMTP credentials
- Check if less secure apps allowed (Gmail)
- Use app-specific password

**MFA not working:**

- Verify server time is synchronized (NTP)
- Check TOTP secret is being saved correctly

---

## Rollback Procedure

If deployment fails:

```bash
# 1. Stop current containers
docker compose down

# 2. Restore previous image
docker compose up -d --build

# 3. Restore database backup if needed
./scripts/restore-backup.sh backup_file.sql.gz

# 4. Verify services are healthy
curl https://yourdomain.com/api/v1/health
```

---

## Contacts

- **Technical Support**: [Your IT Team]
- **Database Admin**: [DBA Contact]
- **Infrastructure**: [DevOps Contact]

---

_Last updated: January 2026_
