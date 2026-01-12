# 🚀 READY TO DEPLOY - Manual Steps

**Your app is fully configured and ready for production!**

I've prepared everything - you just need to complete these final manual steps.

---

## ✅ What's Already Done

- ✅ Frontend built successfully (104.93 kB optimized)
- ✅ Backend ready for deployment
- ✅ Database connected (Neon PostgreSQL)
- ✅ File storage configured (Cloudinary)
- ✅ All environment variables documented
- ✅ Deployment configs created
- ✅ Vercel CLI installed

---

## 📋 DEPLOYMENT STEPS (15 minutes)

### STEP 1: Deploy Frontend to Vercel (5 minutes)

#### **Option A: GitHub Integration (Easiest)**

1. **Commit your code** (if not already):

   ```powershell
   git add .
   git commit -m "Ready for production deployment"
   git push origin main
   ```

2. **Go to Vercel:**

   - Open: https://vercel.com/new
   - Sign in with GitHub
   - Click **Import Project**
   - Select your `church_app` repository

3. **Configure Project:**

   - Framework Preset: **Vite** (auto-detected)
   - Root Directory: `frontend`
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `dist` (auto-detected)

4. **Add Environment Variables:**

   ```
   VITE_API_URL=https://church-app-backend.onrender.com/api/v1
   VITE_WS_URL=https://church-app-backend.onrender.com
   ```

   _(Note: Use temporary URL for now, update after backend deploys)_

5. **Click Deploy!**
   - Wait 1-2 minutes
   - Your site will be live at: `https://your-app.vercel.app`

#### **Option B: Vercel CLI**

```powershell
cd frontend
vercel login  # Follow prompts to login
vercel --prod # Deploy to production
```

---

### STEP 2: Deploy Backend to Render.com (10 minutes)

1. **Go to Render:**

   - Open: https://render.com (already opened in browser)
   - Sign up with GitHub
   - Authorize access to your repository

2. **Create Web Service:**

   - Click **New** → **Web Service**
   - Connect your `church_app` repository
   - Click **Connect**

3. **Configure Service:**

   ```
   Name: church-app-backend
   Region: Singapore (or closest to you)
   Branch: main
   Root Directory: (leave empty)
   Runtime: Node
   Build Command: cd backend && npm install && npm run build
   Start Command: cd backend && npm start
   Instance Type: Free
   ```

4. **Add Environment Variables:**

   Click **Add Environment Variable** for each:

   ```bash
   # Database
   DATABASE_URL=postgresql://neondb_owner:npg_0uVXjU2lSORx@ep-lively-smoke-a1fxbfp5-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require

   # JWT - Generate NEW secrets for production!
   JWT_SECRET=your-new-64-char-secret
   JWT_REFRESH_SECRET=your-new-64-char-secret
   JWT_ACCESS_EXPIRY=15m
   JWT_REFRESH_EXPIRY=7d

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=dw47h2yyd
   CLOUDINARY_API_KEY=688569912156569
   CLOUDINARY_API_SECRET=x2_9z0J8h6pP5tCoqUDMsI7L03Y

   # Email
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
   CORS_ORIGIN=https://your-vercel-app-url.vercel.app

   # Security
   SESSION_TIMEOUT_HOURS=24
   ACCOUNT_LOCKOUT_DURATION_MINUTES=15
   MAX_FAILED_LOGIN_ATTEMPTS=5

   # Push Notifications
   VAPID_PUBLIC_KEY=BITPV9QKSSIVt46q_-xnfF9NcsFP5q-81siqEXGZO-MN90HBO1SxQzLYt0uF_kHtfEhM337B7bV9tXgeDUGOZ14
   VAPID_PRIVATE_KEY=xtIW0ZQJM_0WBVL3lvuJQFZOB-qil8dWlAH_MjFktlY
   VAPID_SUBJECT=mailto:admin@singburi-adventist.org
   ```

   **Generate NEW JWT Secrets:**

   ```powershell
   # Run this twice in PowerShell:
   -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
   ```

5. **Create Service:**
   - Click **Create Web Service**
   - Wait 2-3 minutes for build
   - Your backend will be at: `https://church-app-backend.onrender.com`

---

### STEP 3: Link Frontend & Backend (2 minutes)

#### **A. Update Frontend Environment**

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Update:
   ```
   VITE_API_URL=https://church-app-backend.onrender.com/api/v1
   VITE_WS_URL=https://church-app-backend.onrender.com
   ```
3. Go to **Deployments** → Click **...** → **Redeploy**

#### **B. Update Backend CORS**

1. Go to Render Dashboard → Your Service → **Environment**
2. Edit `CORS_ORIGIN`:
   ```
   CORS_ORIGIN=https://your-actual-app.vercel.app
   ```
3. Service will auto-redeploy (30 seconds)

---

## ✅ VERIFICATION

### Test Your Production App

1. **Open your Vercel URL:** `https://your-app.vercel.app`

2. **Login:**

   - Email: `admin@singburi-adventist.org`
   - Password: `Admin123!`

3. **Test Features:**

   - ✅ Dashboard loads
   - ✅ Create event with image upload
   - ✅ View member directory
   - ✅ Create announcement
   - ✅ Test real-time notifications

4. **Check Backend Health:**

   - Visit: `https://church-app-backend.onrender.com/health`
   - Should show: `{"status":"healthy","timestamp":"..."}`

5. **Check Cloudinary:**
   - Upload an image in event creation
   - Verify it appears in Cloudinary dashboard
   - URL should be: `https://res.cloudinary.com/dw47h2yyd/...`

---

## 🐛 Troubleshooting

### Frontend can't reach backend

**Check:**

1. VITE_API_URL is correct (no trailing slash)
2. Backend is running (visit /health endpoint)
3. CORS_ORIGIN matches frontend URL

**Fix:**

```
Vercel: Update VITE_API_URL
Render: Update CORS_ORIGIN
Redeploy both services
```

### Backend won't start

**Check Render logs:**

1. Dashboard → Your Service → **Logs**
2. Look for errors

**Common issues:**

- Missing environment variables
- DATABASE_URL format wrong
- JWT_SECRET not set

### Database connection fails

**Fix:**

```
Make sure DATABASE_URL has ?sslmode=require
Check Neon database is active at console.neon.tech
```

### Image upload fails

**Check:**

1. Cloudinary credentials in Render
2. Frontend can reach /upload endpoints
3. Check browser console for errors

---

## 📊 Your Production Stack

```yaml
Frontend:
  Platform: Vercel
  URL: https://your-app.vercel.app
  Build: Automatic on git push
  Cost: $0/month

Backend:
  Platform: Render.com
  URL: https://church-app-backend.onrender.com
  Build: Automatic on git push
  Cost: $0/month
  Note: Sleeps after 15 min inactivity
    First request takes ~50s to wake

Database:
  Platform: Neon PostgreSQL
  Region: Singapore
  Size: 0.5GB
  Cost: $0/month

Storage:
  Platform: Cloudinary
  Capacity: 25GB
  Bandwidth: 25GB/month
  Cost: $0/month

Total: $0/month forever!
```

---

## 🎯 After Deployment

### Optional Improvements

1. **Custom Domain** (Vercel):

   - Add your domain: `app.singburi-adventist.org`
   - Free SSL included

2. **Real Email Service** (Replace Ethereal):

   - Options: Brevo (300/day free), SendGrid (100/day free)
   - Update SMTP settings in Render

3. **Monitoring**:

   - Render provides basic metrics
   - Vercel shows analytics
   - Cloudinary has usage dashboard

4. **Continuous Deployment**:
   - Already enabled!
   - Just push to GitHub → auto-deploys

---

## 📞 Need Help?

**Vercel Support:**

- Docs: https://vercel.com/docs
- Support: https://vercel.com/support

**Render Support:**

- Docs: https://render.com/docs
- Community: https://render.com/community

**Your Current Credentials:**

- Admin: admin@singburi-adventist.org / Admin123!
- Staff: staff@singburi-adventist.org / Staff123!

---

## ✨ You're Almost There!

Just follow the steps above and your church app will be live in ~15 minutes!

**Summary:**

1. ✅ Push to GitHub (if needed)
2. 🚀 Deploy frontend on Vercel (5 min)
3. 🌐 Deploy backend on Render (10 min)
4. 🔗 Link URLs together (2 min)
5. ✅ Test & Celebrate! 🎉

**Total Time:** 15-20 minutes  
**Total Cost:** $0/month  
**Capacity:** 500+ members, 1000+ events

---

**Ready? Let's deploy!** 🚀
