# HelioHost PostgreSQL Setup Guide

Complete guide to use HelioHost PostgreSQL database with your church app.

---

## 🎯 Quick Setup (Automated)

### Option A: Run Setup Script

```powershell
# Run this in project root
.\setup-heliohost-database.ps1
```

The script will:

- ✅ Prompt for your HelioHost database details
- ✅ Test the connection
- ✅ Update `backend/.env` securely
- ✅ Optionally run migrations and seed data

---

## 📋 Prerequisites

### 1. Create HelioHost Database

1. Login to HelioHost: https://heliohost.org/login/
2. Go to **cPanel → Databases → PostgreSQL Databases**
3. Create a new database:
   - Database name: `church_app` (or your preferred name)
4. Create database user:
   - Username: Choose a username
   - Password: Generate strong password
5. Add user to database with **ALL PRIVILEGES**

### 2. Get Connection Details

From HelioHost cPanel:

```
Host: tommy.heliohost.org (or your server)
Port: 5432
Database: username_dbname
Username: username_user
Password: [your password]
```

**Format:** `username_dbname` where `username` is your HelioHost username

---

## 🔧 Manual Setup

### Step 1: Update `.env` File

Edit `backend/.env`:

```env
# Replace with your HelioHost connection string
DATABASE_URL="postgresql://username:password@tommy.heliohost.org:5432/username_church_app?sslmode=disable"
```

**Connection String Format:**

```
postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]?sslmode=[MODE]
```

**SSL Mode:**

- Use `sslmode=disable` for HelioHost (typically no SSL)
- Use `sslmode=require` if HelioHost supports SSL

### Step 2: Test Connection

```bash
cd backend
npx prisma db pull
```

If successful, your connection works! ✅

### Step 3: Run Migrations

```bash
# Generate Prisma Client
npm run prisma:generate

# Deploy schema to database
npx prisma migrate deploy
```

### Step 4: Seed Database (Optional)

```bash
npm run prisma:seed
```

This creates test users:

- Admin: `admin@singburi-adventist.org` / `Admin123!`
- Staff: `staff@singburi-adventist.org` / `Staff123!`

---

## 🔍 Troubleshooting

### Error: "Connection refused"

**Cause:** Firewall or wrong host  
**Fix:**

```bash
# Verify host from HelioHost cPanel
# Common hosts:
# - tommy.heliohost.org
# - johnny.heliohost.org
# - ricky.heliohost.org
```

### Error: "SSL connection required"

**Cause:** Wrong SSL mode  
**Fix:** Change `sslmode=disable` to `sslmode=require` in connection string

### Error: "Database does not exist"

**Cause:** Database not created yet  
**Fix:**

1. Go to HelioHost cPanel
2. Create database: `username_church_app`
3. Verify name includes your username prefix

### Error: "Authentication failed"

**Cause:** Wrong credentials  
**Fix:**

1. Verify username format: `username_user`
2. Reset password in HelioHost cPanel
3. Check for special characters in password (may need URL encoding)

### Connection String URL Encoding

If password has special characters:

```
@ → %40
# → %23
$ → %24
& → %26
= → %3D
+ → %2B
```

Example:

```
Password: my@pass#123
Encoded: my%40pass%23123
```

---

## ⚖️ HelioHost vs Neon Comparison

| Feature                | HelioHost    | Neon        |
| ---------------------- | ------------ | ----------- |
| **Free tier**          | ✅ Yes       | ✅ 0.5GB    |
| **Cost**               | Free (ads)   | Free        |
| **Uptime**             | ~99%         | ~99.9%      |
| **SSL**                | Limited      | ✅ Required |
| **Serverless**         | ❌ No        | ✅ Yes      |
| **Auto-scaling**       | ❌ No        | ✅ Yes      |
| **Branching**          | ❌ No        | ✅ Yes      |
| **Connection pooling** | Manual       | ✅ Built-in |
| **Best for**           | Free hosting | Production  |

---

## 🎯 Recommended Configuration

### For Development:

```env
DATABASE_URL="postgresql://user:pass@tommy.heliohost.org:5432/church_app?sslmode=disable"
```

### For Production (if upgrading):

```env
DATABASE_URL="postgresql://user:pass@tommy.heliohost.org:5432/church_app?sslmode=require&connect_timeout=30"
```

---

## 🔄 Switching Between Databases

You can easily switch between HelioHost and Neon:

### Switch to HelioHost:

```powershell
.\setup-heliohost-database.ps1
```

### Switch back to Neon:

```env
# Edit backend/.env
DATABASE_URL="postgresql://neondb_owner:password@ep-xxx.neon.tech/neondb?sslmode=require"
```

Then run:

```bash
cd backend
npx prisma generate
npx prisma migrate deploy
```

---

## 📊 Performance Tips

### 1. Connection Pooling

HelioHost has connection limits. Use connection pooling:

```env
# Add to connection string
DATABASE_URL="postgresql://...?connection_limit=5"
```

### 2. Query Optimization

Monitor slow queries in development:

```bash
npm run prisma:studio
```

### 3. Backup Strategy

HelioHost doesn't auto-backup. Use:

```bash
# Export database
pg_dump -h tommy.heliohost.org -U username -d dbname > backup.sql

# Restore database
psql -h tommy.heliohost.org -U username -d dbname < backup.sql
```

---

## 🔒 Security Checklist

- [ ] Strong database password (16+ characters)
- [ ] Password stored in `.env` only (gitignored)
- [ ] Different credentials for dev/production
- [ ] Regular backups scheduled
- [ ] Monitor HelioHost for suspicious activity

---

## 📞 Support Resources

**HelioHost:**

- Forum: https://heliohost.org/forum/
- Wiki: https://wiki.heliohost.org/
- Support: https://heliohost.org/support/

**Your Project:**

- See: `SECURITY_GUIDE.md`
- See: `DEPLOYMENT_GUIDE.md`

---

## ✅ Quick Reference

**Setup Script:**

```powershell
.\setup-heliohost-database.ps1
```

**Test Connection:**

```bash
cd backend && npx prisma db pull
```

**Run Migrations:**

```bash
npm run prisma:migrate
```

**Start App:**

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

---

**Status:** Ready to use HelioHost PostgreSQL! 🎉
