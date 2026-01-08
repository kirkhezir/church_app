# Neon Database Setup Guide

Your database name: **singburiadventistcenter**

---

## 🎯 Option 1: Manual Neon Setup (5 minutes)

### **Step 1: Get Your Neon Connection String**

Since you mentioned the database is managed by Vercel:

#### **Via Vercel Dashboard:**

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Storage** tab
4. Click on your Neon database
5. Copy the connection string

**Format:**

```
postgresql://username:password@ep-xxxxx.us-east-2.aws.neon.tech/singburiadventistcenter?sslmode=require
```

#### **Via Neon Dashboard Directly:**

1. Go to https://console.neon.tech
2. Select your project
3. Go to **Dashboard**
4. Find **Connection Details**
5. Copy **Connection string**

---

### **Step 2: Update Your .env File**

Replace the current DATABASE_URL in `backend/.env`:

**Current (Local):**

```bash
DATABASE_URL="postgresql://postgres:admin123@localhost:5432/church_app?schema=public"
```

**Change to (Neon):**

```bash
DATABASE_URL="postgresql://username:password@ep-xxxxx.us-east-2.aws.neon.tech/singburiadventistcenter?sslmode=require"
```

⚠️ **Important:**

- Make sure to include `?sslmode=require` at the end
- Use the actual connection string from Neon/Vercel

---

### **Step 3: Run Database Migrations**

```bash
cd backend

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed the database (optional)
npm run prisma:seed
```

---

## 🎯 Option 2: Create New Neon Database (if needed)

If you don't have the database yet:

### **Step 1: Create Neon Account**

1. Go to https://neon.tech
2. Sign up (free, no credit card required)
3. Click **Create Project**

### **Step 2: Configure Project**

```
Project Name: singburiadventistcenter
Region: US East (Ohio) - closest to your users
Compute Size: 0.25 vCPU (free tier)
```

### **Step 3: Create Database**

1. After project creation, you'll see the connection details
2. Database name: **singburiadventistcenter** (or create it)
3. Copy the connection string

### **Step 4: Configure Prisma**

The connection string format:

```bash
postgresql://[user]:[password]@[endpoint]/[database]?sslmode=require

# Example:
postgresql://neondb_owner:AbCd1234@ep-cool-darkness-123456.us-east-2.aws.neon.tech/singburiadventistcenter?sslmode=require
```

---

## 🔧 Quick Setup Script

Run this after getting your connection string:

```powershell
# 1. Update .env with your Neon connection string
# (Replace YOUR_NEON_CONNECTION_STRING with actual string)

$connectionString = "YOUR_NEON_CONNECTION_STRING"
(Get-Content backend\.env) -replace 'DATABASE_URL="postgresql://.*"', "DATABASE_URL=`"$connectionString`"" | Set-Content backend\.env

# 2. Generate Prisma Client
cd backend
npm run prisma:generate

# 3. Push schema to database
npm run prisma:migrate

# 4. Seed database
npm run prisma:seed
```

---

## ✅ Verify Connection

Test your connection:

```bash
cd backend
npm run prisma:studio
```

If Prisma Studio opens, your connection is working! 🎉

---

## 🔒 Security Notes

- ✅ Never commit `.env` file (already in `.gitignore`)
- ✅ Use environment variables in production
- ✅ Connection string contains password (keep secret)
- ✅ Enable SSL mode for Neon (included in connection string)

---

## 🚀 For Production Deployment

When deploying to Render.com, add this environment variable:

```bash
DATABASE_URL=postgresql://[user]:[password]@[neon-endpoint]/singburiadventistcenter?sslmode=require
```

**Get it from:**

- Vercel Dashboard → Storage → Neon → Connection String
- OR Neon Dashboard → Connection Details

---

## 📊 Neon Free Tier Limits

```yaml
Storage: 0.5 GB
Compute: Shared vCPU
Branches: Unlimited
Projects: Unlimited
Cost: $0/month forever

Perfect for church app! ✅
```

---

## 🐛 Troubleshooting

### Error: "role does not exist"

```bash
# Make sure database name is correct
# Check connection string format
```

### Error: "SSL required"

```bash
# Add to connection string: ?sslmode=require
```

### Error: "Connection timeout"

```bash
# Check firewall/network
# Verify endpoint URL is correct
```

---

## 📞 Need Help?

1. **Check Neon Status:** https://neon.tech/docs/connect/connect-from-any-app
2. **Vercel Integration:** https://vercel.com/docs/storage/vercel-postgres
3. **Contact Support:** https://neon.tech/docs/introduction/support

---

## ⏭️ Next Steps

After database is configured:

1. ✅ Run migrations: `npm run prisma:migrate`
2. ✅ Seed data: `npm run prisma:seed`
3. ✅ Test locally: `npm run dev`
4. ✅ Deploy to Render: Follow [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

---

**Current Status:**

- [x] Cloudinary configured ✅
- [ ] Neon database connection string needed ⏳
- [ ] Migrations to run after connection ⏳
