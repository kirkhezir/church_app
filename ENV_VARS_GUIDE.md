# Environment Variables Setup Guide

## ⚠️ Security Notice

**NEVER commit actual credentials to Git!** This file contains placeholder instructions only.

---

## Quick Setup

### For Vercel (Frontend)

1. Go to: https://vercel.com/dashboard
2. Select your project → Settings → Environment Variables
3. Add the following:

```bash
# Required Variables
VITE_API_URL=https://your-backend-url.onrender.com/api/v1
VITE_WS_URL=https://your-backend-url.onrender.com
VITE_APP_NAME=Sing Buri Adventist Center
```

### For Render (Backend)

1. Go to: https://dashboard.render.com
2. Select your service → Environment
3. Add all variables from `backend/.env.example`
4. Set the following required values:

```bash
# Database (from your Neon/PostgreSQL provider)
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# Generate strong secrets:
JWT_SECRET=<generate-64-char-random-string>
JWT_REFRESH_SECRET=<generate-64-char-random-string>

# Cloudinary (from cloudinary.com dashboard)
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>

# SMTP (email provider credentials)
SMTP_USER=<your-email>
SMTP_PASS=<your-password-or-app-password>

# VAPID (generate with: npx web-push generate-vapid-keys)
VAPID_PUBLIC_KEY=<public-key>
VAPID_PRIVATE_KEY=<private-key>
```

---

## Generating Secrets

### JWT Secrets

```bash
# In PowerShell (Windows)
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})

# In Bash/Linux/Mac
openssl rand -hex 64

# In Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### VAPID Keys (Push Notifications)

```bash
cd backend
npm install -g web-push
web-push generate-vapid-keys
```

This will output:
```
Public Key: BFY4dw...
Private Key: ZX_9zg...
```

---

## Environment Variable Reference

### Backend Variables

See `backend/.env.example` for complete list with descriptions.

**Critical Variables**:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Token signing secret (min 32 chars)
- `JWT_REFRESH_SECRET` - Refresh token secret (min 32 chars)
- `CLOUDINARY_*` - Image upload credentials
- `SMTP_*` - Email service credentials
- `VAPID_*` - Push notification keys

**Optional Variables**:
- `PORT` - Server port (default: 3000)
- `CORS_ORIGIN` - Allowed origins (default: localhost)
- `LOG_LEVEL` - Logging verbosity

### Frontend Variables

See `frontend/.env.example` for complete list.

**Required Variables**:
- `VITE_API_URL` - Backend API endpoint
- `VITE_WS_URL` - WebSocket endpoint
- `VITE_APP_NAME` - Application name

---

## Service-Specific Guides

### Cloudinary Setup

1. Sign up: https://cloudinary.com/users/register/free
2. Go to Dashboard → Account Details
3. Copy:
   - Cloud Name
   - API Key
   - API Secret

### Neon Database Setup

1. Sign up: https://neon.tech
2. Create New Project
3. Database name: `singburiadventistcenter`
4. Region: Choose closest to your backend
5. Copy connection string from dashboard

### SMTP Setup (Gmail Example)

1. Enable 2FA on your Google Account
2. Generate App Password:
   - Google Account → Security → 2-Step Verification → App passwords
3. Use:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=<16-char-app-password>
   ```

---

## Deployment Checklist

### Before First Deploy

- [ ] All environment variables set in Vercel
- [ ] All environment variables set in Render
- [ ] Database created and accessible
- [ ] Prisma migrations ready
- [ ] CORS origins configured correctly

### After Deploy

- [ ] Test health endpoint: `/health`
- [ ] Test API authentication
- [ ] Test image upload (Cloudinary)
- [ ] Test email sending (SMTP)
- [ ] Test push notifications (VAPID)

---

## Troubleshooting

### "Database connection failed"

- Verify `DATABASE_URL` format
- Check database is running and accessible
- Ensure SSL mode is correct (`sslmode=require` for Neon)

### "JWT token invalid"

- Verify `JWT_SECRET` is set
- Ensure frontend and backend use same API URL
- Check token expiry settings

### "CORS error"

- Verify `CORS_ORIGIN` includes frontend URL
- Check Vercel deployment URL matches
- Ensure no trailing slashes in URLs

### "Image upload failed"

- Verify all Cloudinary credentials are set
- Check Cloudinary account is active
- Ensure API key has upload permissions

---

## Security Best Practices

1. **Never commit**:
   - `.env` files
   - Actual credentials in any file
   - Database connection strings
   - API keys or secrets

2. **Always use**:
   - Environment variables
   - Strong random secrets (min 32 chars)
   - Different credentials for dev/staging/prod
   - App passwords (not main passwords)

3. **Rotate regularly**:
   - JWT secrets (monthly)
   - API keys (quarterly)
   - Database passwords (quarterly)

---

## Support

- Vercel Docs: https://vercel.com/docs/environment-variables
- Render Docs: https://render.com/docs/environment-variables
- Project Issues: https://github.com/kirkhezir/church_app/issues
