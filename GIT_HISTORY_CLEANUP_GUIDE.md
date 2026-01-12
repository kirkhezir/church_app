# 🗑️ Git History Cleanup Guide

**Purpose:** Permanently remove exposed credentials from Git commit history

---

## ⚠️ CRITICAL WARNINGS

Before proceeding, understand:

1. **This rewrites Git history** - Cannot be undone easily
2. **Force push required** - Will overwrite remote repository
3. **Team impact** - All team members must re-clone the repository
4. **Breaking change** - Existing clones will have diverged history

**Only proceed if you understand these implications!**

---

## 🚀 Quick Cleanup (Automated)

### Option A: Run PowerShell Script (Easiest)

```powershell
# Make sure you're in project root
cd d:\VSCode_projects\church_app

# Run cleanup script
.\cleanup-git-history.ps1

# Follow prompts:
# 1. Type "yes" to confirm cleanup
# 2. Wait for process to complete
# 3. Type "yes" to force push (or do manually later)
```

**The script will:**

- ✅ Create backup tag
- ✅ Remove all sensitive files from history
- ✅ Clean up Git objects
- ✅ Optionally force push to GitHub

---

## 🔧 Manual Cleanup (If Script Fails)

### Step 1: Backup Current State

```bash
# Create backup tag
git tag backup-before-cleanup-$(date +%Y%m%d)

# Create backup branch
git branch backup-branch
```

### Step 2: Remove Files from History

**Method A: Using git filter-branch**

```bash
# Remove specific files from all commits
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch production-env-vars.txt \
   DEPLOY_NOW.md \
   DEPLOYMENT_IN_PROGRESS.md \
   SETUP_COMPLETE_FINAL.md \
   CLOUDINARY_SETUP_COMPLETE.md \
   prepare-deployment.ps1 \
   setup-neon-database.ps1 \
   token.txt \
   test-login.json" \
  --prune-empty --tag-name-filter cat -- --all
```

**Method B: Using BFG Repo Cleaner (Faster)**

```bash
# Install BFG (if not installed)
# Download from: https://rtyley.github.io/bfg-repo-cleaner/

# Create file list
echo "production-env-vars.txt" > files-to-delete.txt
echo "DEPLOY_NOW.md" >> files-to-delete.txt
echo "DEPLOYMENT_IN_PROGRESS.md" >> files-to-delete.txt
echo "SETUP_COMPLETE_FINAL.md" >> files-to-delete.txt
echo "CLOUDINARY_SETUP_COMPLETE.md" >> files-to-delete.txt
echo "prepare-deployment.ps1" >> files-to-delete.txt
echo "setup-neon-database.ps1" >> files-to-delete.txt
echo "token.txt" >> files-to-delete.txt
echo "test-login.json" >> files-to-delete.txt

# Run BFG
java -jar bfg.jar --delete-files files-to-delete.txt .git
```

### Step 3: Clean Up Git Objects

```bash
# Remove original refs
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin

# Expire reflog
git reflog expire --expire=now --all

# Garbage collect
git gc --prune=now --aggressive
```

### Step 4: Verify Cleanup

```bash
# Check if sensitive files are gone
git log --all --full-history -- production-env-vars.txt
# Should return nothing

# Check repository size
du -sh .git
```

### Step 5: Force Push to GitHub

```bash
# Push all branches
git push origin --force --all

# Push all tags
git push origin --force --tags
```

---

## 📋 Files Being Removed

These files will be permanently deleted from Git history:

- `production-env-vars.txt` - All production secrets
- `DEPLOY_NOW.md` - Database, API credentials
- `DEPLOYMENT_IN_PROGRESS.md` - Full credential set
- `SETUP_COMPLETE_FINAL.md` - Setup credentials
- `CLOUDINARY_SETUP_COMPLETE.md` - Cloudinary credentials
- `prepare-deployment.ps1` - Script with secrets
- `setup-neon-database.ps1` - Database script
- `token.txt` - Auth tokens
- `test-login.json` - Test credentials

---

## 👥 Team Communication Template

After cleanup, send this to your team:

```
Subject: 🚨 URGENT: Repository History Rewritten

The church_app repository history has been rewritten to remove
exposed credentials for security purposes.

ACTION REQUIRED:

1. Delete your local repository:
   • Windows: Delete d:\VSCode_projects\church_app
   • Mac/Linux: rm -rf ~/projects/church_app

2. Clone fresh from GitHub:
   git clone https://github.com/kirkhezir/church_app.git

3. DO NOT try to merge or pull - you MUST re-clone

Why: Git histories have diverged, and your old clone cannot
be updated safely.

Timeline: Complete this by [DATE]

Questions? Contact: [YOUR NAME]
```

---

## ✅ Verification Checklist

After cleanup:

- [ ] Backup tag created
- [ ] All sensitive files removed from history
- [ ] Git garbage collection completed
- [ ] Force pushed to GitHub successfully
- [ ] Team members notified
- [ ] Credentials rotated (see SECURITY_INCIDENT_REPORT.md)
- [ ] Local clone still works correctly
- [ ] CI/CD pipelines still work

---

## 🆘 Troubleshooting

### Error: "Cannot rewrite history"

```bash
# Remove refs/original
rm -rf .git/refs/original

# Try again
```

### Error: "Remote rejected (protected branch)"

```bash
# Temporarily disable branch protection in GitHub:
# Settings → Branches → Edit branch protection rule
# Uncheck "Do not allow force pushes"

# After push, re-enable protection
```

### Error: "Not a valid object name"

```bash
# File doesn't exist in history - skip it
# This is OK and expected for some files
```

### Restore from Backup

If something goes wrong:

```bash
# Reset to backup tag
git reset --hard backup-before-cleanup-YYYYMMDD

# Or restore from backup branch
git reset --hard backup-branch
```

---

## 🔒 After Cleanup

### Still Required:

1. **Rotate all credentials** - See SECURITY_INCIDENT_REPORT.md
2. **Monitor services** for 48 hours
3. **Update documentation** to reference new credential locations
4. **Add to .gitignore** - Already done ✅

### Why Rotation is Still Needed:

- Credentials were exposed publicly
- Git history may have been cloned by others
- GitHub/Git caches may still have old data
- Better safe than sorry!

---

## 📊 Expected Results

### Before Cleanup:

```bash
git log --all --full-history -- production-env-vars.txt
# Shows commits with the file
```

### After Cleanup:

```bash
git log --all --full-history -- production-env-vars.txt
# Shows nothing (file never existed)
```

### Repository Size:

- May reduce by 10-50% depending on file sizes
- More reduction if files were large or changed often

---

## 🔐 Security Best Practices

After cleanup:

1. ✅ Never commit credentials to Git
2. ✅ Always use `.env` files (gitignored)
3. ✅ Use secret scanning tools (e.g., git-secrets)
4. ✅ Enable GitHub secret scanning
5. ✅ Review commits before pushing
6. ✅ Use pre-commit hooks to check for secrets

---

## 📞 Need Help?

**If cleanup script fails:**

- Check error messages carefully
- Make sure you have no uncommitted changes
- Try manual cleanup steps above

**If force push is rejected:**

- Check GitHub branch protection settings
- Ensure you have write permissions
- Contact repository administrator

---

**Status:** Ready to clean history  
**Time Required:** 5-10 minutes  
**Risk Level:** Medium (reversible with backup)

**Run:** `.\cleanup-git-history.ps1`
