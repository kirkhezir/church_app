# Deployment Configuration Guide

## Overview

This project is configured for automatic deployment to:
- **Vercel** - Frontend hosting
- **Render** - Backend API hosting

## Branch Configuration

- **Main branch**: `001-full-stack-web`
- **Auto-deploy**: Enabled on push to main branch

---

## Vercel Deployment (Frontend)

### Configuration Files

- **Project root**: `vercel.json`
- **Frontend specific**: `frontend/vercel.json`

### Required Environment Variables

Set these in Vercel Dashboard → Project Settings → Environment Variables:

```bash
# API Configuration
VITE_API_URL=<your-render-backend-url>/api/v1
VITE_WS_URL=<your-render-backend-url>
VITE_APP_NAME=Sing Buri Adventist Center

# Example:
# VITE_API_URL=https://church-app-backend.onrender.com/api/v1
# VITE_WS_URL=https://church-app-backend.onrender.com
```

### Deployment Setup

1. **Connect GitHub Repository**
   ```bash
   # Via Vercel Dashboard
   - Import Git Repository
   - Select: kirkhezir/church_app
   - Framework Preset: Vite
   - Root Directory: frontend/
   ```

2. **Configure Build Settings**
   ```bash
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

3. **Enable Auto-Deployment**
   - Production Branch: `001-full-stack-web`
   - Deploy on push: ✅ Enabled

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

---

## Render Deployment (Backend)

### Configuration File

- **Project root**: `render.yaml`

### Required Environment Variables

Set these in Render Dashboard → Service → Environment:

```bash
# Database
DATABASE_URL=<postgres-connection-string>

# JWT Secrets (auto-generated or manual)
JWT_SECRET=<strong-random-secret>
JWT_REFRESH_SECRET=<strong-random-secret>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>

# SMTP (Email Notifications)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<smtp-username>
SMTP_PASS=<smtp-password>
SMTP_FROM_NAME=Sing Buri Adventist Center
SMTP_FROM_EMAIL=noreply@singburi-adventist.org

# VAPID (Push Notifications)
VAPID_PUBLIC_KEY=<public-key>
VAPID_PRIVATE_KEY=<private-key>
VAPID_SUBJECT=mailto:admin@singburi-adventist.org

# Security Settings
NODE_ENV=production
PORT=3000
SESSION_TIMEOUT_HOURS=24
MAX_FAILED_LOGIN_ATTEMPTS=5
ACCOUNT_LOCKOUT_DURATION_MINUTES=15
```

### Deployment Setup

1. **Connect GitHub Repository**
   ```bash
   # Via Render Dashboard
   - New Web Service
   - Connect Repository: kirkhezir/church_app
   - Branch: 001-full-stack-web
   ```

2. **Configure Service**
   ```yaml
   Name: church-app-backend
   Region: Singapore
   Branch: 001-full-stack-web
   Runtime: Node
   Build Command: cd backend && npm install && npm run build
   Start Command: cd backend && npm start
   Plan: Free (or upgrade as needed)
   ```

3. **Set Environment Variables**
   - Copy from template above
   - Never commit real values to Git
   - Use Render's secret management

### Database Setup

1. **Create PostgreSQL Database**
   ```bash
   # Via Render Dashboard
   - New PostgreSQL Database
   - Name: church-app-db
   - Region: Singapore (same as backend)
   - Plan: Free
   ```

2. **Run Migrations**
   ```bash
   # Connect via Internal Database URL
   # Migrations run automatically on deploy via build command
   ```

---

## CI/CD Workflows

### GitHub Actions

Located in `.github/workflows/`:

1. **ci-cd.yml** - Main CI/CD pipeline
   - Runs on push to `001-full-stack-web` branch
   - Executes tests, builds Docker images
   - Triggers deployments

2. **deploy-staging.yml** - Staging deployments
   - Runs on push to `develop` branch (if exists)

### Automatic Deployment Triggers

✅ **Enabled for**:
- Push to `001-full-stack-web` branch
- Pull request merge to main branch

❌ **Not triggered by**:
- Draft pull requests
- Feature branch pushes
- Tag creation

---

## Security Best Practices

### ⚠️ NEVER Commit These:

```bash
# Environment files
.env
.env.local
.env.production

# Credentials
*-secrets.json
*.credentials
token.txt
production-env-vars.txt
render-env-vars.txt

# Deployment scripts with credentials
setup-*-database.ps1
prepare-deployment.ps1
```

### ✅ Always Use:

1. **Environment Variables**
   - Store in Vercel/Render dashboard
   - Reference in code as `process.env.VAR_NAME`

2. **Placeholder Documentation**
   - Use `<your-value-here>` syntax
   - Never show real credentials

3. **Separate Environments**
   - Development: Local `.env` files
   - Staging: Staging environment variables
   - Production: Production environment variables

---

## Troubleshooting

### Vercel Issues

**Build Fails**:
```bash
# Check build logs in Vercel Dashboard
# Common fixes:
- Verify environment variables are set
- Check Node version (20.x required)
- Ensure all dependencies in package.json
```

**Runtime Errors**:
```bash
# Check function logs
# Common issues:
- API URL mismatch (VITE_API_URL)
- CORS configuration on backend
- Missing environment variables
```

### Render Issues

**Build Fails**:
```bash
# Check build logs in Render Dashboard
# Common fixes:
- Verify DATABASE_URL is set
- Check Prisma migrations
- Ensure build command is correct
```

**Service Crashes**:
```bash
# Check service logs
# Common issues:
- Database connection failure
- Missing environment variables
- Port conflicts (use PORT env var)
```

### Database Issues

**Migration Failures**:
```bash
# Manual migration (via Render Shell)
cd backend
npx prisma migrate deploy
```

**Connection Errors**:
```bash
# Verify DATABASE_URL format:
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
```

---

## Monitoring

### Health Checks

**Backend**:
```bash
curl https://church-app-backend.onrender.com/health
# Response: {"status":"ok","timestamp":"..."}
```

**Frontend**:
```bash
curl https://church-app.vercel.app
# Response: 200 OK
```

### Logs

**Vercel**:
- Dashboard → Project → Deployments → [Select Deployment] → Logs

**Render**:
- Dashboard → Service → Logs (Real-time)

---

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **Project Issues**: https://github.com/kirkhezir/church_app/issues

---

## Quick Commands

```bash
# Deploy to Vercel (manual)
cd frontend && vercel --prod

# Trigger Render deployment
git push origin 001-full-stack-web

# Check deployment status
gh workflow view ci-cd
```
