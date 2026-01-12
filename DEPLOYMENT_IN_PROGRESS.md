# 🚀 Production Deployment - In Progress

**Status:** Deploying to production (FREE hosting)  
**Date:** January 12, 2026

---

## ✅ Completed Steps

### 1. Frontend Build
- ✅ TypeScript compiled
- ✅ Vite build successful
- ✅ Main bundle: 104.93 kB (optimized)
- ✅ Total assets: 84.60 kB CSS + JS chunks

### 2. Configuration Files Created
- ✅ `render.yaml` - Backend deployment config
- ✅ Environment variables documented

---

## 🔄 In Progress

### Frontend Deployment (Vercel)
- Installing Vercel CLI...
- Will deploy to: `https://your-app.vercel.app`

### Backend Deployment (Render.com)
- Next: Manual deployment via dashboard
- Configuration ready in `render.yaml`

---

## 📋 Deployment Steps

### Frontend to Vercel (Automated)

**After Vercel CLI installs:**
```bash
cd frontend
vercel --prod
```

**Follow prompts:**
- Login with GitHub/Email
- Link to existing project or create new
- Project name: `church-app`
- Settings will be detected automatically

**Environment Variables Needed:**
```env
VITE_API_URL=https://church-app-backend.onrender.com/api/v1
VITE_WS_URL=https://church-app-backend.onrender.com
```

---

### Backend to Render.com (Manual)

**Step 1: Create Render Account**
1. Go to https://render.com
2. Sign up with GitHub
3. Authorize access to repository

**Step 2: Create Web Service**
1. Dashboard → **New** → **Web Service**
2. Connect repository: `church_app`
3. Configure service:
   ```
   Name: church-app-backend
   Region: Singapore
   Branch: main
   Root Directory: (leave empty)
   Runtime: Node
   Build Command: cd backend && npm install && npm run build
   Start Command: cd backend && npm start
   Instance Type: Free
   ```

**Step 3: Add Environment Variables**

Click **Environment** → **Add Environment Variable**

**Required Variables:**
```bash
# Database (from Neon)
DATABASE_URL=postgresql://neondb_owner:npg_0uVXjU2lSORx@ep-lively-smoke-a1fxbfp5-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require

# JWT Secrets (generate new for production)
JWT_SECRET=<generate-new-64-char-secret>
JWT_REFRESH_SECRET=<generate-new-64-char-secret>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=dw47h2yyd
CLOUDINARY_API_KEY=688569912156569
CLOUDINARY_API_SECRET=x2_9z0J8h6pP5tCoqUDMsI7L03Y

# Email (Ethereal for testing, replace with real SMTP)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tmqew2hn5rge7xpx@ethereal.email
SMTP_PASS=5Rvz6cHD5m4eQHR8dV
SMTP_FROM_NAME=Sing Buri Adventist Center
SMTP_FROM_EMAIL=noreply@singburi-adventist.org

# Application
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://your-app.vercel.app

# Security
SESSION_TIMEOUT_HOURS=24
ACCOUNT_LOCKOUT_DURATION_MINUTES=15
MAX_FAILED_LOGIN_ATTEMPTS=5

# Push Notifications (VAPID)
VAPID_PUBLIC_KEY=BITPV9QKSSIVt46q_-xnfF9NcsFP5q-81siqEXGZO-MN90HBO1SxQzLYt0uF_kHtfEhM337B7bV9tXgeDUGOZ14
VAPID_PRIVATE_KEY=xtIW0ZQJM_0WBVL3lvuJQFZOB-qil8dWlAH_MjFktlY
VAPID_SUBJECT=mailto:admin@singburi-adventist.org
```

**Generate New JWT Secrets:**
```powershell
# Run in PowerShell:
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

**Step 4: Deploy**
- Click **Create Web Service**
- Wait for build (2-3 minutes)
- Check logs for errors

---

## 🔧 Post-Deployment Configuration

### Update Frontend Environment

After backend deploys, update Vercel environment variables:

1. Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add/Update:
   ```
   VITE_API_URL=https://church-app-backend.onrender.com/api/v1
   VITE_WS_URL=https://church-app-backend.onrender.com
   ```
3. Redeploy frontend: `vercel --prod`

### Update Backend CORS

After frontend deploys, update Render environment:

1. Render Dashboard → Your Service → **Environment**
2. Update `CORS_ORIGIN` with your Vercel URL:
   ```
   CORS_ORIGIN=https://your-app.vercel.app
   ```
3. Service will auto-redeploy

---

## ✅ Verification Checklist

### Frontend (Vercel)
- [ ] Deployment successful
- [ ] No build errors
- [ ] Site loads at production URL
- [ ] Environment variables set

### Backend (Render.com)
- [ ] Deployment successful
- [ ] No build errors
- [ ] Health check passes: `/health`
- [ ] All environment variables set
- [ ] Database connected

### Integration
- [ ] Frontend can reach backend API
- [ ] CORS configured correctly
- [ ] WebSocket connection works
- [ ] Image uploads to Cloudinary work
- [ ] Login/authentication works

---

## 🐛 Common Issues & Fixes

### Issue 1: Frontend can't reach backend
**Cause:** Wrong API URL or CORS misconfigured

**Fix:**
```bash
# Check VITE_API_URL in Vercel env vars
# Check CORS_ORIGIN in Render env vars
# Make sure they match (no trailing slashes)
```

### Issue 2: Backend won't start
**Cause:** Missing environment variables

**Fix:**
```bash
# Check Render logs for specific error
# Verify all required env vars are set
# Especially: DATABASE_URL, JWT_SECRET, CLOUDINARY vars
```

### Issue 3: Database connection fails
**Cause:** Connection string format

**Fix:**
```bash
# Ensure DATABASE_URL has ?sslmode=require
# Check Neon database is active
# Verify credentials haven't expired
```

### Issue 4: Image upload fails
**Cause:** Cloudinary credentials

**Fix:**
```bash
# Verify CLOUDINARY_CLOUD_NAME is correct
# Check API_KEY and API_SECRET match
# Test credentials at cloudinary.com dashboard
```

---

## 📊 Expected Resources

```yaml
Frontend (Vercel):
├── Build time: ~50 seconds
├── Deploy time: ~30 seconds
├── Bandwidth: Unlimited
└── Cost: $0/month

Backend (Render.com):
├── Build time: ~2-3 minutes
├── Cold start: ~50 seconds (after sleep)
├── Memory: 512MB
└── Cost: $0/month

Database (Neon):
├── Current size: ~5MB
├── Max size: 0.5GB
├── Region: Singapore
└── Cost: $0/month

Storage (Cloudinary):
├── Used: 0GB
├── Available: 25GB
├── Bandwidth: 25GB/month
└── Cost: $0/month

Total Monthly Cost: $0.00
```

---

## 🎯 Next Steps

1. ⏳ Wait for Vercel CLI installation to complete
2. 🚀 Deploy frontend with `vercel --prod`
3. 🌐 Deploy backend on Render.com (manual)
4. 🔗 Link frontend and backend URLs
5. ✅ Test production deployment
6. 📧 Update email SMTP (optional - use real email service)

---

**Status:** In progress...  
**ETA:** 15-20 minutes total
