# 🚀 Production Deployment Guide

**Your church app deployment guide - NO CREDENTIALS IN THIS FILE**

> ⚠️ **IMPORTANT**: Never commit real credentials to Git. Use environment variables only.

---

## ✅ Pre-Deployment Checklist

- [ ] All credentials stored in `.env` files (gitignored)
- [ ] Production secrets generated (not copied from development)
- [ ] Database connection string from Neon dashboard
- [ ] Cloudinary credentials from Cloudinary dashboard
- [ ] SMTP credentials from your email provider

---

## 📋 Deployment Steps

### STEP 1: Deploy Frontend to Vercel (5 minutes)

1. **Go to Vercel:**

   - Open: https://vercel.com/new
   - Sign in with GitHub
   - Import your `church_app` repository

2. **Configure Project:**

   ```
   Framework Preset: Vite (auto-detected)
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   ```

3. **Add Environment Variables:**

   ```
   VITE_API_URL=<your-render-backend-url>/api/v1
   VITE_WS_URL=<your-render-backend-url>
   ```

4. **Click Deploy!**

---

### STEP 2: Deploy Backend to Render.com (10 minutes)

1. **Go to Render:**

   - Open: https://render.com
   - Sign up with GitHub
   - New → Web Service

2. **Configure Service:**

   ```
   Name: church-app-backend
   Region: Singapore (or closest)
   Branch: main
   Runtime: Node
   Build Command: cd backend && npm install && npm run build
   Start Command: cd backend && npm start
   Instance Type: Free
   ```

3. **Add Environment Variables (from your secure storage):**

   **Required Variables:**

   ```bash
   # Database - Get from Neon Dashboard
   DATABASE_URL=<your-neon-connection-string>

   # JWT - Generate NEW secrets for production
   JWT_SECRET=<generate-64-char-secret>
   JWT_REFRESH_SECRET=<generate-64-char-secret>
   JWT_ACCESS_EXPIRY=15m
   JWT_REFRESH_EXPIRY=7d

   # Cloudinary - Get from Cloudinary Dashboard
   CLOUDINARY_CLOUD_NAME=<your-cloud-name>
   CLOUDINARY_API_KEY=<your-api-key>
   CLOUDINARY_API_SECRET=<your-api-secret>

   # Email - Get from your SMTP provider
   SMTP_HOST=<your-smtp-host>
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=<your-smtp-user>
   SMTP_PASS=<your-smtp-password>
   SMTP_FROM_NAME=Sing Buri Adventist Center
   SMTP_FROM_EMAIL=<your-from-email>

   # Application
   NODE_ENV=production
   PORT=3000
   CORS_ORIGIN=<your-vercel-frontend-url>

   # Security
   SESSION_TIMEOUT_HOURS=24
   ACCOUNT_LOCKOUT_DURATION_MINUTES=15
   MAX_FAILED_LOGIN_ATTEMPTS=5

   # Push Notifications - Generate from web-push
   VAPID_PUBLIC_KEY=<your-vapid-public-key>
   VAPID_PRIVATE_KEY=<your-vapid-private-key>
   VAPID_SUBJECT=mailto:<your-admin-email>
   ```

4. **Click Create Web Service**

---

### STEP 3: Link Frontend & Backend

1. **Update Vercel Environment:**

   - Vercel Dashboard → Settings → Environment Variables
   - Set `VITE_API_URL` to your Render backend URL

2. **Update Render CORS:**
   - Render Dashboard → Environment
   - Set `CORS_ORIGIN` to your Vercel frontend URL

---

## 🔐 How to Get Your Credentials

### Neon Database:

1. Go to https://console.neon.tech
2. Select your project
3. Connection Details → Copy connection string

### Cloudinary:

1. Go to https://console.cloudinary.com
2. Dashboard → Account Details
3. Copy: Cloud Name, API Key, API Secret

### Generate JWT Secrets:

```powershell
# Run in PowerShell (do this twice for both secrets):
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

### Generate VAPID Keys:

```bash
npx web-push generate-vapid-keys
```

---

## ✅ Verification

1. **Frontend:** Visit your Vercel URL
2. **Backend Health:** `<your-render-url>/health`
3. **Login:** Use your seeded admin credentials
4. **Test:** Create event, upload image, etc.

---

## 📊 Production Stack (All FREE)

```yaml
Frontend: Vercel - $0/month
Backend: Render.com - $0/month
Database: Neon - $0/month
Storage: Cloudinary - $0/month
Total: $0/month
```

---

## 🔒 Security Best Practices

1. ✅ **Never commit credentials** to Git
2. ✅ **Use environment variables** for all secrets
3. ✅ **Generate NEW secrets** for production
4. ✅ **Rotate secrets** periodically
5. ✅ **Use strong passwords** (12+ characters)
6. ✅ **Enable MFA** where possible
7. ✅ **Keep `.env` files** in `.gitignore`

---

## 🆘 Troubleshooting

### Frontend can't reach backend:

- Check CORS_ORIGIN matches your Vercel URL
- Check VITE_API_URL is correct

### Database connection fails:

- Verify connection string has `?sslmode=require`
- Check Neon project is active

### Image upload fails:

- Verify Cloudinary credentials
- Check browser console for errors

---

**Need the actual credentials?** Check your local `.env` files or your provider dashboards.
