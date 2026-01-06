# Production Deployment Checklist

## Pre-Deployment Checklist

### 1. Infrastructure Setup

#### Domain & DNS

- [ ] Domain name registered and configured
- [ ] DNS A record pointing to server IP
- [ ] DNS CNAME for www subdomain (optional)
- [ ] DNS MX records for email (if needed)

#### SSL/TLS Certificate

- [ ] SSL certificate obtained (Let's Encrypt recommended)
- [ ] Certificate auto-renewal configured
- [ ] HTTPS redirect enabled
- [ ] HSTS header configured

#### Server

- [ ] Production server provisioned (DigitalOcean/AWS/GCP)
- [ ] Firewall configured (ports 22, 80, 443 only)
- [ ] SSH key authentication enabled
- [ ] Root login disabled
- [ ] Fail2ban installed

### 2. Environment Configuration

#### Backend (.env.production)

```bash
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@host:5432/church_app_prod

# JWT (Generate new secrets!)
JWT_SECRET=<generate-256-bit-secret>
JWT_REFRESH_SECRET=<generate-256-bit-secret>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email (Production SMTP)
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@singburi-adventist.org

# VAPID Keys for Push Notifications
VAPID_PUBLIC_KEY=<your-vapid-public-key>
VAPID_PRIVATE_KEY=<your-vapid-private-key>
VAPID_EMAIL=mailto:admin@singburi-adventist.org

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Sentry Error Tracking
SENTRY_ENABLED=true
SENTRY_DSN=https://your-sentry-dsn

# Redis (optional, for caching)
REDIS_URL=redis://localhost:6379

# CORS
ALLOWED_ORIGINS=https://your-domain.com
```

#### Frontend (.env.production)

```bash
VITE_API_URL=https://api.your-domain.com
VITE_VAPID_PUBLIC_KEY=<your-vapid-public-key>
VITE_SENTRY_DSN=https://your-frontend-sentry-dsn
```

### 3. Security Review

- [ ] All npm packages updated
- [ ] npm audit shows no high/critical vulnerabilities
- [ ] Secrets are NOT in code
- [ ] Different secrets for production
- [ ] Database user has minimal required permissions
- [ ] Rate limiting configured
- [ ] CORS whitelist configured
- [ ] Security headers verified

### 4. Database

- [ ] Production database created
- [ ] Migrations applied
- [ ] Initial admin user created
- [ ] Backup strategy configured
- [ ] Backup tested
- [ ] Connection pooling configured

### 5. Monitoring & Logging

- [ ] Sentry configured and tested
- [ ] Log aggregation setup (if needed)
- [ ] Uptime monitoring configured
- [ ] Alert notifications configured
- [ ] Health check endpoint verified

### 6. Performance

- [ ] Frontend build optimized
- [ ] Images optimized
- [ ] CDN configured (optional)
- [ ] Database indexes verified
- [ ] Load testing completed

---

## Deployment Steps

### Step 1: Prepare Production Database

```bash
# Create production database
createdb church_app_prod

# Run migrations
DATABASE_URL=<production-url> npx prisma migrate deploy

# Create initial admin (update seed for production)
DATABASE_URL=<production-url> npx prisma db seed
```

### Step 2: Build Applications

```bash
# Backend
cd backend
npm ci --production
npm run build

# Frontend
cd frontend
npm ci
npm run build
```

### Step 3: Deploy with Docker (Recommended)

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Step 4: Configure Nginx

```nginx
# /etc/nginx/sites-available/church-app
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Frontend
    location / {
        root /var/www/church-app/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3000;
    }
}
```

### Step 5: SSL Certificate

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Verify auto-renewal
sudo certbot renew --dry-run
```

### Step 6: Start Backend Service

```bash
# Using PM2
pm2 start dist/index.js --name "church-app-backend"
pm2 save
pm2 startup

# Or using systemd
sudo systemctl enable church-app
sudo systemctl start church-app
```

---

## Post-Deployment Verification

### Functional Tests

- [ ] Homepage loads
- [ ] Login works
- [ ] Dashboard displays data
- [ ] Events page loads
- [ ] Member directory works
- [ ] Messages can be sent
- [ ] Push notifications work
- [ ] Email notifications work

### Security Tests

- [ ] HTTPS working
- [ ] HTTP redirects to HTTPS
- [ ] Security headers present
- [ ] API rate limiting works
- [ ] Invalid login locked out

### Performance Tests

- [ ] Page load < 3 seconds
- [ ] API response < 500ms
- [ ] Mobile performance acceptable

### Monitoring Tests

- [ ] Sentry captures errors
- [ ] Health check returns 200
- [ ] Uptime monitor working

---

## Rollback Plan

If issues occur:

1. **Stop new deployment**

   ```bash
   docker-compose -f docker-compose.prod.yml down
   ```

2. **Restore database**

   ```bash
   pg_restore -h localhost -U postgres -d church_app_prod backup.dump
   ```

3. **Deploy previous version**

   ```bash
   git checkout <previous-tag>
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. **Notify stakeholders**
   - Send rollback notification
   - Document issue
   - Plan fix

---

## Emergency Contacts

| Role            | Name | Contact |
| --------------- | ---- | ------- |
| Technical Lead  |      |         |
| DevOps          |      |         |
| Church Admin    |      |         |
| Hosting Support |      |         |

---

## Sign-off

| Item             | Verified By | Date |
| ---------------- | ----------- | ---- |
| Security Review  |             |      |
| Performance Test |             |      |
| Functional Test  |             |      |
| Backup Test      |             |      |
| Final Approval   |             |      |

---

_Last updated: January 2026_
