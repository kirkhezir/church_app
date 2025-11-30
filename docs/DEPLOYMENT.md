# Deployment Guide

This document provides comprehensive instructions for deploying the Church Management Application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Docker Deployment](#docker-deployment)
4. [Manual Deployment](#manual-deployment)
5. [SSL/TLS Configuration](#ssltls-configuration)
6. [Production Checklist](#production-checklist)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- **Server**: Linux (Ubuntu 22.04+ recommended), 2+ CPU cores, 4GB+ RAM
- **Docker**: Version 24.0+ with Docker Compose v2
- **Node.js**: Version 20.x LTS (for manual deployment)
- **PostgreSQL**: Version 15+ (if not using Docker)
- **Nginx**: Version 1.24+ (for reverse proxy)

### Domain and SSL

- A domain name pointing to your server
- SSL certificate (Let's Encrypt recommended)

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/church_app.git
cd church_app
```

### 2. Create Environment Files

#### Backend (.env)

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with production values:

```env
# CRITICAL: Change these in production!
DATABASE_URL="postgresql://church_app:SECURE_PASSWORD@postgres:5432/church_app?schema=public"
JWT_SECRET="generate-a-64-character-random-string-here"

# Email configuration (required for notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-specific-password"
SMTP_FROM_NAME="Sing Buri Adventist Center"
SMTP_FROM_EMAIL="noreply@singburi-adventist.org"

# CORS (update with your domain)
CORS_ORIGIN="https://yourdomain.com"

# Security
NODE_ENV="production"
```

#### Docker Environment (.env)

Create `.env` in the project root:

```env
# Database
DB_USER=church_app
DB_PASSWORD=CHANGE_THIS_SECURE_PASSWORD
DB_NAME=church_app

# Security
JWT_SECRET=GENERATE_64_CHAR_SECRET

# Domain
CORS_ORIGIN=https://yourdomain.com
VITE_API_URL=/api/v1
VITE_APP_NAME="Sing Buri Adventist Center"

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=app-password

# Redis (optional)
REDIS_PASSWORD=CHANGE_THIS_TOO
```

Generate secure secrets:

```bash
# Generate JWT secret
openssl rand -hex 64

# Generate database password
openssl rand -hex 32
```

## Docker Deployment

### Quick Start

```bash
# Pull images and start services
docker compose up -d

# Check logs
docker compose logs -f

# Check service health
docker compose ps
```

### Step-by-Step Deployment

#### 1. Build Images

```bash
# Build production images
docker compose build --no-cache
```

#### 2. Initialize Database

```bash
# Run database migrations
docker compose exec backend npx prisma migrate deploy

# Seed initial data (optional)
docker compose exec backend npm run prisma:seed
```

#### 3. Start Services

```bash
docker compose up -d
```

#### 4. Verify Deployment

```bash
# Check all services are running
docker compose ps

# Test backend health
curl http://localhost:3000/health

# Test frontend
curl http://localhost
```

### With Redis (Optional)

For session caching and improved performance:

```bash
docker compose --profile with-redis up -d
```

## Manual Deployment

If you prefer not to use Docker:

### 1. Install Dependencies

```bash
# Backend
cd backend
npm ci --only=production
npx prisma generate

# Frontend
cd ../frontend
npm ci
npm run build
```

### 2. Build Applications

```bash
# Backend
cd backend
npm run build

# Frontend is already built
```

### 3. Set Up Nginx

```nginx
# /etc/nginx/sites-available/church-app
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend static files
    root /var/www/church-app/frontend/dist;
    index index.html;

    # API proxy
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /ws/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 4. Set Up Process Manager

```bash
# Install PM2
npm install -g pm2

# Start backend
cd backend
pm2 start dist/index.js --name church-app-backend

# Save PM2 configuration
pm2 save
pm2 startup
```

## SSL/TLS Configuration

### Using Let's Encrypt

```bash
# Install Certbot
apt install certbot python3-certbot-nginx

# Obtain certificate
certbot --nginx -d yourdomain.com

# Auto-renewal
certbot renew --dry-run
```

### SSL Best Practices

Add to nginx configuration:

```nginx
# Strong SSL configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
ssl_prefer_server_ciphers off;
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:50m;
ssl_stapling on;
ssl_stapling_verify on;

# HSTS
add_header Strict-Transport-Security "max-age=31536000" always;
```

## Production Checklist

### Before Deployment

- [ ] **Environment Variables**: All production values set
- [ ] **JWT Secret**: Strong, unique 64+ character secret
- [ ] **Database Password**: Strong, unique password
- [ ] **CORS Origin**: Set to production domain only
- [ ] **Email Configuration**: SMTP settings tested
- [ ] **SSL Certificate**: Valid certificate installed

### After Deployment

- [ ] **Health Check**: All services responding
- [ ] **Login Test**: Admin login working
- [ ] **Email Test**: Password reset emails sending
- [ ] **Database Backup**: Initial backup created
- [ ] **Monitoring**: Log monitoring configured
- [ ] **Firewall**: Unnecessary ports closed

### Security Hardening

- [ ] Disable root SSH login
- [ ] Configure fail2ban
- [ ] Enable automatic security updates
- [ ] Set up log rotation
- [ ] Configure backup automation

## Monitoring & Maintenance

### View Logs

```bash
# Docker logs
docker compose logs -f backend
docker compose logs -f frontend

# PM2 logs (manual deployment)
pm2 logs church-app-backend
```

### Database Backup

```bash
# Create backup
./scripts/backup-database.sh

# Verify backup
./scripts/verify-backup.sh

# Clean old backups
./scripts/cleanup-old-backups.sh
```

### Update Application

```bash
# Pull latest changes
git pull

# Docker update
docker compose pull
docker compose up -d

# Run migrations if needed
docker compose exec backend npx prisma migrate deploy
```

### Health Monitoring

Set up health check monitoring:

```bash
# Using curl in cron
*/5 * * * * curl -sf http://localhost:3000/health || echo "Backend down" | mail admin@church.org
```

## Troubleshooting

### Common Issues

#### Container Won't Start

```bash
# Check logs
docker compose logs backend

# Check disk space
df -h

# Check memory
free -m
```

#### Database Connection Failed

```bash
# Test connection
docker compose exec postgres psql -U church_app -d church_app -c "SELECT 1"

# Check environment
docker compose exec backend printenv | grep DATABASE
```

#### 502 Bad Gateway

- Check if backend is running: `docker compose ps`
- Check backend logs: `docker compose logs backend`
- Verify nginx configuration
- Check CORS settings

#### Email Not Sending

- Verify SMTP credentials
- Check if outbound port 587 is open
- Test with simple SMTP client
- Check application logs for errors

### Getting Help

1. Check application logs
2. Review documentation
3. Search existing issues on GitHub
4. Create new issue with details

---

## Quick Reference

### Common Commands

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f

# Restart service
docker compose restart backend

# Run database migration
docker compose exec backend npx prisma migrate deploy

# Create backup
./scripts/backup-database.sh

# SSH into container
docker compose exec backend sh
```

### Important Ports

| Service    | Port | Description        |
| ---------- | ---- | ------------------ |
| Frontend   | 80   | HTTP               |
| Frontend   | 443  | HTTPS              |
| Backend    | 3000 | API Server         |
| PostgreSQL | 5432 | Database           |
| Redis      | 6379 | Cache (if enabled) |

---

_Last updated: November 2025_
