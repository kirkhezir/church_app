# 🎯 Quick Neon Database Setup

**Database Name:** singburiadventistcenter

---

## 📋 Two Ways to Get Your Connection String

### **Option A: From Vercel (if database is there)**

1. Go to https://vercel.com/dashboard
2. Click your project
3. Click **Storage** tab
4. Click on your Neon database
5. Copy the **Connection String**

### **Option B: From Neon Directly**

1. Go to https://console.neon.tech
2. Login to your account
3. Select your project
4. Click **Connection Details**
5. Copy **Connection String**

---

## ⚡ Quick Setup (Just Run This)

Once you have your connection string:

```powershell
# Run this script and paste your connection string when prompted
.\setup-neon-database.ps1
```

The script will:

- ✅ Update your `.env` file
- ✅ Ask if you want to run migrations
- ✅ Ask if you want to seed test data
- ✅ Verify everything is configured

---

## 🔗 Connection String Format

Your connection string should look like:

```
postgresql://username:password@ep-cool-name-123456.us-east-2.aws.neon.tech/singburiadventistcenter?sslmode=require
```

**Important:**

- ⚠️ Must include `?sslmode=require` at the end
- ⚠️ Contains your password (keep it secret!)
- ⚠️ Username is usually `neondb_owner` or similar

---

## 🚀 After Setup

Once configured, your app will use Neon (cloud) instead of local PostgreSQL:

```bash
# Start backend
cd backend
npm run dev

# Start frontend (in another terminal)
cd frontend
npm run dev
```

---

## 📊 What You Get

```yaml
Free Forever: ✅ 0.5GB storage
  ✅ Serverless PostgreSQL
  ✅ Automatic backups
  ✅ Branching support
  ✅ SSL connections
  ✅ Global availability

Cost: $0/month
```

---

## ❓ Don't Have Neon Yet?

**Create Free Account:**

1. Go to https://neon.tech
2. Click **Sign Up** (no credit card needed)
3. Create a project named `singburiadventistcenter`
4. Copy the connection string
5. Run `.\setup-neon-database.ps1`

Takes 2 minutes! ⚡

---

## 📞 Need Help?

See detailed guide: [NEON_DATABASE_SETUP.md](NEON_DATABASE_SETUP.md)
