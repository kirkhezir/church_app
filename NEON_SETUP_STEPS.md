# 🚀 Neon Database Setup - Step by Step

**Current Status:** Setting up Neon PostgreSQL for production

---

## ✅ Step 1: Create Neon Account (2 minutes)

The browser should open to https://neon.tech

**Do this:**

1. Click **"Sign Up"** button
2. Choose sign-up method:
   - GitHub (recommended - fastest)
   - Google
   - Email
3. ✅ No credit card required!

---

## ✅ Step 2: Create Your Project (1 minute)

After logging in:

1. Click **"Create a project"** or **"New Project"**
2. Fill in details:
   ```
   Project Name: singburiadventistcenter
   Region: US East (Ohio) - recommended
   PostgreSQL Version: 16 (latest)
   Compute Size: 0.25 vCPU (FREE tier)
   ```
3. Click **"Create Project"**

---

## ✅ Step 3: Get Connection String (30 seconds)

After project is created:

1. You'll see **"Connection Details"** panel
2. Look for **"Connection string"**
3. Make sure it's set to: **"Pooled connection"**
4. Click **"Copy"** button

**It should look like:**

```
postgresql://neondb_owner:AbCd1234XyZ@ep-cool-name-123456.us-east-2.aws.neon.tech/singburiadventistcenter?sslmode=require
```

---

## ✅ Step 4: Configure Your App (Automated)

Once you have the connection string copied:

### **Option A: Use Setup Script (Recommended)**

```powershell
# Run this in your PowerShell terminal:
cd d:\VSCode_projects\church_app
.\setup-neon-database.ps1
```

When prompted:

1. Paste your connection string
2. Press Enter
3. Type `y` when asked to run migrations
4. Type `y` when asked to seed database

**Done!** Script handles everything automatically.

### **Option B: Manual Setup**

If you prefer manual setup:

```powershell
# 1. Edit backend/.env
# Replace the DATABASE_URL line with your Neon connection string

# 2. Generate Prisma Client
cd backend
npm run prisma:generate

# 3. Run migrations
npm run prisma:migrate

# 4. Seed database
npm run prisma:seed
```

---

## ✅ Step 5: Test Connection (30 seconds)

```powershell
cd backend
npm run prisma:studio
```

If Prisma Studio opens in your browser, **you're connected!** 🎉

---

## 📊 What You Just Got (FREE Forever)

```yaml
✅ 0.5 GB PostgreSQL database
✅ Serverless architecture
✅ Automatic backups
✅ SSL connections
✅ Branch support
✅ 99.95% uptime SLA

Cost: $0/month forever
Perfect for: Church app with 1000+ members
```

---

## 🎯 Quick Reference

### **Your Neon Dashboard:**

https://console.neon.tech

### **Connection String Format:**

```
postgresql://[user]:[password]@[endpoint]/singburiadventistcenter?sslmode=require
```

### **Important:**

- ⚠️ Keep connection string secret (contains password)
- ⚠️ Must include `?sslmode=require` at the end
- ⚠️ Never commit to Git (already in .gitignore)

---

## 🔄 Next Steps After Setup

1. ✅ Start backend: `cd backend && npm run dev`
2. ✅ Start frontend: `cd frontend && npm run dev`
3. ✅ Test image upload (Cloudinary already configured)
4. ✅ Deploy to production (see DEPLOYMENT_GUIDE.md)

---

## 🆘 Having Issues?

### Can't create account?

- Try different sign-up method (GitHub, Google, Email)
- Check email for verification

### Can't find connection string?

- Dashboard → Your Project → Connection Details
- Make sure "Pooled connection" is selected

### Connection fails?

- Verify `?sslmode=require` is at the end
- Check for typos in connection string
- Ensure database name is `singburiadventistcenter`

### Still stuck?

- See: NEON_DATABASE_SETUP.md (detailed troubleshooting)
- Neon Docs: https://neon.tech/docs

---

**Ready?** Follow the steps above and you'll be connected in 5 minutes! ⚡
