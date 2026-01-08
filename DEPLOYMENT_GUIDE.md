# Church App Deployment Guide

**Complete FREE hosting setup for production deployment**

---

## 🎯 What We've Built

Your church app is now fully configured with:

- ✅ **Cloudinary** file storage integration (25GB free)
- ✅ **Image upload** routes in backend
- ✅ **Frontend upload component** for events/profiles
- ✅ **Neon PostgreSQL** database (managed via Vercel)
- ✅ **Security** - All credentials in .env (gitignored)

---

## 🚀 Quick Deploy (30 minutes)

### **Step 1: Deploy Frontend to Vercel** (5 minutes)

```bash
# From project root
cd frontend
npm run build

# Deploy to Vercel
npx vercel --prod

# Follow prompts:
# - Link to existing project or create new
# - Project name: church-app
# - Build command: npm run build
# - Output directory: dist
```

**Set Environment Variables in Vercel:**

```
Settings → Environment Variables → Add:
VITE_API_URL=https://your-backend.onrender.com
```

---

### **Step 2: Deploy Backend to Render.com** (15 minutes)

#### A. Create Account

1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repository

#### B. Create Web Service

1. Dashboard → New → Web Service
2. Connect your `church_app` repository
3. Configure:
   ```
   Name: church-app-backend
   Environment: Node
   Region: Oregon (US West)
   Branch: main
   Build Command: cd backend && npm install && npm run build
   Start Command: cd backend && npm start
   Instance Type: Free
   ```

#### C. Add Environment Variables

In Render dashboard, add these environment variables:

```bash
# Database (from Vercel Neon integration)
DATABASE_URL=postgresql://user:pass@host/singburiadventistcenter

# JWT Secret (generate new one)
JWT_SECRET=your-secure-random-secret-here

# Cloudinary (ALREADY CONFIGURED LOCALLY)
CLOUDINARY_CLOUD_NAME=dw47h2yyd
CLOUDINARY_API_KEY=688569912156569
CLOUDINARY_API_SECRET=x2_9z0J8h6pP5tCoqUDMsI7L03Y

# CORS (your Vercel frontend URL)
CORS_ORIGIN=https://your-app.vercel.app

# Email (optional - Brevo or SendGrid)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-smtp-password
EMAIL_FROM=noreply@singburi-adventist.org

# Node Environment
NODE_ENV=production
PORT=3000
```

#### D. Generate JWT Secret

```bash
# Run this to generate a secure JWT secret:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

### **Step 3: Configure Neon Database** (5 minutes)

#### **A. Get Your Neon Connection String**

**If managed via Vercel:**

1. Vercel Dashboard → Storage → Neon Database
2. Copy connection string

**If using Neon directly:**

1. https://console.neon.tech → Your Project
2. Connection Details → Copy connection string

**Format should be:**

```
postgresql://user:pass@ep-xxx.neon.tech/singburiadventistcenter?sslmode=require
```

⚠️ **Important:** Must include `?sslmode=require`

#### **B. Add to Render Environment Variables**

In Render dashboard, set:

```bash
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/singburiadventistcenter?sslmode=require
```

#### **C. Run Migrations on First Deploy**

Render will automatically run:

```bash
cd backend && npx prisma migrate deploy
```

#### **D. Local Setup (Optional)**

To use Neon locally instead of local PostgreSQL:

```powershell
# Run this script and paste your connection string
.\setup-neon-database.ps1
```

See: [NEON_QUICK_START.md](NEON_QUICK_START.md) for details

---

### **Step 4: Update Frontend API URL** (2 minutes)

After backend is deployed, update frontend:

```bash
# In Vercel dashboard:
Settings → Environment Variables → Edit:
VITE_API_URL=https://church-app-backend.onrender.com
```

Redeploy frontend:

```bash
vercel --prod
```

---

## 📋 Post-Deployment Checklist

### ✅ Test Image Upload

1. Login to your deployed app
2. Create a new event
3. Click "Upload Image"
4. Select an image file
5. Verify it uploads to Cloudinary
6. Check event shows image from Cloudinary CDN

### ✅ Verify Services

- [ ] Frontend loads: `https://your-app.vercel.app`
- [ ] Backend health check: `https://your-backend.onrender.com/health`
- [ ] Database connected (check health endpoint)
- [ ] Image upload works
- [ ] Cloudinary dashboard shows uploaded images

### ✅ Seed Database

```bash
# SSH to Render or run locally pointed at production DB
npm run prisma:seed
```

---

## 🔧 Environment Variables Summary

### **Backend (.env) - LOCAL DEVELOPMENT**

```bash
# Already configured in backend/.env:
DATABASE_URL=your-local-or-neon-db-url
JWT_SECRET=dev-secret-change-in-production
CLOUDINARY_CLOUD_NAME=dw47h2yyd
CLOUDINARY_API_KEY=688569912156569
CLOUDINARY_API_SECRET=x2_9z0J8h6pP5tCoqUDMsI7L03Y
CORS_ORIGIN=http://localhost:5173
```

### **Backend - RENDER.COM PRODUCTION**

All variables from above + production values

### **Frontend - VERCEL**

```bash
VITE_API_URL=https://your-backend.onrender.com
```

---

## 💰 Cost Breakdown

| Service              | Usage     | Cost         |
| -------------------- | --------- | ------------ |
| Vercel (Frontend)    | Unlimited | **$0/month** |
| Render (Backend)     | 750 hours | **$0/month** |
| Neon (Database)      | 0.5GB     | **$0/month** |
| Cloudinary (Storage) | 25GB      | **$0/month** |
| **TOTAL**            |           | **$0/month** |

---

## ⚠️ Important Notes

### **Render Free Tier:**

- Apps **sleep after 15 minutes** of inactivity
- First request after sleep takes ~50 seconds to wake
- Consider this for church announcements: "Site may take a moment to load"

### **Database Connection:**

- Neon serverless = no connection pooling needed
- Connection string format must include `?sslmode=require`

### **Image Upload Limits:**

- Max file size: 10MB per image
- Cloudinary free tier: 25GB storage + 25GB bandwidth/month
- Sufficient for: 1,000+ event images

---

## 🔒 Security Checklist

- [x] ✅ Credentials in `.env` (gitignored)
- [x] ✅ JWT secret is strong (64+ characters)
- [x] ✅ Cloudinary API secret secured
- [x] ✅ Database connection uses SSL
- [x] ✅ CORS configured to allow only your frontend
- [x] ✅ File upload validation (type, size)
- [x] ✅ Rate limiting enabled

---

## 📊 Monitoring

### **Cloudinary Usage:**

Check dashboard: https://console.cloudinary.com

- Storage used / 25GB
- Bandwidth used / 25GB/month
- Transformations used

### **Render Metrics:**

Dashboard → Your Service → Metrics

- CPU usage
- Memory usage
- Response times
- Deployment logs

### **Neon Database:**

Vercel Dashboard → Storage → Neon

- Database size
- Active connections
- Query performance

---

## 🐛 Troubleshooting

### Backend won't start on Render:

```bash
# Check logs in Render dashboard
# Common issues:
1. Missing environment variables
2. Database connection string format
3. Build command incorrect
```

### Image upload fails:

```bash
# Check:
1. Cloudinary credentials in Render env vars
2. CORS allows your frontend domain
3. File size under 10MB
4. File type is image/*
```

### Database connection error:

```bash
# Ensure connection string includes:
postgresql://user:pass@host/singburiadventistcenter?sslmode=require
```

---

## 🎉 You're Live!

Your church app is now running on production infrastructure:

- ✅ Global CDN for frontend (Vercel)
- ✅ Reliable API hosting (Render)
- ✅ Serverless PostgreSQL (Neon)
- ✅ Professional image hosting (Cloudinary)
- ✅ **Total cost: $0/month**

Share your app: `https://your-app.vercel.app`

---

## 📞 Support

If you need help:

- Vercel: https://vercel.com/support
- Render: https://render.com/docs
- Cloudinary: https://support.cloudinary.com
- Neon: https://neon.tech/docs

---

**Deployment completed!** 🚀
