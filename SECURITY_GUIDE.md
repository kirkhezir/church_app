# 🔐 Security Best Practices Guide

**IMPORTANT: This document outlines security practices for the church app.**

---

## ⚠️ CRITICAL: Exposed Credentials Found

The following files contain sensitive information and **MUST NOT** be committed to Git:

### Files with Credentials (Now in .gitignore):
- `production-env-vars.txt` - Contains all production secrets
- `DEPLOY_NOW.md` - Contains database/API credentials  
- `DEPLOYMENT_IN_PROGRESS.md` - Contains credentials
- `SETUP_COMPLETE_FINAL.md` - Contains credentials
- `prepare-deployment.ps1` - Contains credentials
- `setup-neon-database.ps1` - Contains database credentials
- `token.txt` - Contains authentication tokens
- `test-login.json` - Contains test credentials
- `backend/.env` - Contains all backend secrets

---

## ✅ What's Protected

### Files in .gitignore:
```gitignore
# Environment files
.env
.env.local
.env.*.local

# Sensitive deployment files
production-env-vars.txt
*.secrets
*.credentials
token.txt
test-login.json
prepare-deployment.ps1
setup-neon-database.ps1
DEPLOY_NOW.md
DEPLOYMENT_IN_PROGRESS.md
SETUP_COMPLETE_FINAL.md
```

---

## 🔑 Credential Categories

### 1. Database Credentials (CRITICAL)
**Location:** Neon Dashboard → Connection Details
```
DATABASE_URL=postgresql://user:PASSWORD@host/database?sslmode=require
```
⚠️ **NEVER** share or commit database passwords

### 2. Cloudinary API Keys (HIGH)
**Location:** Cloudinary Dashboard → Account Details
```
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
```
⚠️ API Secret allows full account access

### 3. JWT Secrets (CRITICAL)
**Generate new for each environment:**
```powershell
# PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})

# Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
⚠️ Use DIFFERENT secrets for dev/staging/production

### 4. SMTP Credentials (MEDIUM)
**Location:** Your email provider dashboard
```
SMTP_USER=<email-user>
SMTP_PASS=<email-password>
```

### 5. VAPID Keys (MEDIUM)
**Generate with:**
```bash
npx web-push generate-vapid-keys
```

---

## 🛡️ Security Checklist

### Before Committing:
- [ ] Run `git status` to check for sensitive files
- [ ] Ensure `.env` files are NOT staged
- [ ] Check no hardcoded credentials in code
- [ ] Verify `.gitignore` includes all sensitive patterns

### For Production:
- [ ] Generate NEW JWT secrets (don't reuse dev secrets)
- [ ] Use strong, unique passwords (12+ characters)
- [ ] Enable MFA on all service dashboards
- [ ] Set up secret rotation schedule
- [ ] Use environment variables, not config files

### Regular Audits:
- [ ] Review committed history for secrets
- [ ] Rotate credentials every 90 days
- [ ] Audit access to production systems
- [ ] Monitor for unauthorized access

---

## 🚨 If Credentials Are Exposed

### Immediate Actions:
1. **Rotate ALL affected credentials immediately**
2. **Revoke old credentials** in provider dashboards
3. **Check for unauthorized usage** in logs
4. **Update all environments** with new credentials

### Credential Rotation:

#### Neon Database:
1. Neon Console → Project → Settings
2. Reset password or create new role
3. Update DATABASE_URL everywhere

#### Cloudinary:
1. Cloudinary Console → Settings → Security
2. Regenerate API Secret
3. Update all environments

#### JWT Secrets:
1. Generate new secrets
2. Update all environments
3. Note: Users will need to re-login

---

## 📁 Safe File Structure

```
church_app/
├── .gitignore              # ✅ Excludes sensitive files
├── .env.example            # ✅ Template (no real values)
├── backend/
│   ├── .env                # ❌ NEVER COMMIT (in .gitignore)
│   ├── .env.example        # ✅ Template only
│   └── ...
├── frontend/
│   ├── .env                # ❌ NEVER COMMIT (in .gitignore)
│   ├── .env.example        # ✅ Template only
│   └── ...
├── DEPLOYMENT_GUIDE_TEMPLATE.md  # ✅ No credentials
└── SECURITY_GUIDE.md       # ✅ This file
```

---

## 🔒 Environment Variable Best Practices

### DO:
- ✅ Use environment variables for ALL secrets
- ✅ Keep `.env` in `.gitignore`
- ✅ Use `.env.example` for documentation
- ✅ Use secret management services for production
- ✅ Encrypt secrets at rest

### DON'T:
- ❌ Hardcode credentials in source code
- ❌ Commit `.env` files
- ❌ Share credentials via chat/email
- ❌ Use same secrets across environments
- ❌ Log sensitive information

---

## 🌐 Production Deployment Security

### Vercel (Frontend):
- Use Vercel's Environment Variables UI
- Set variables as "Production Only" where appropriate
- Don't expose secrets in client-side code

### Render.com (Backend):
- Use Render's Environment Variables
- Enable "Secret" flag for sensitive values
- Use Environment Groups for shared secrets

### Neon (Database):
- Use connection pooling
- Restrict IP access if possible
- Enable SSL (always use `?sslmode=require`)

---

## 📞 Security Contacts

If you discover a security vulnerability:
1. Do NOT disclose publicly
2. Document the issue
3. Notify the development team
4. Follow responsible disclosure

---

## ✅ Current Status

After this security audit:
- [x] Sensitive files added to `.gitignore`
- [x] Deployment guide template created (no credentials)
- [x] Security documentation created
- [x] `.env.example` files use placeholders only
- [ ] **ACTION REQUIRED**: Rotate credentials if previously exposed

---

**Last Updated:** January 12, 2026  
**Reviewed By:** Security Audit
