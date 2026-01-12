# Quick Production Deployment Helper
# Run this to prepare for deployment

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PRODUCTION DEPLOYMENT HELPER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (Test-Path .git) {
    Write-Host "✅ Git repository detected" -ForegroundColor Green
} else {
    Write-Host "⚠️ No git repository found" -ForegroundColor Yellow
    $initGit = Read-Host "Initialize git? (y/n)"
    if ($initGit -eq "y") {
        git init
        Write-Host "✅ Git initialized" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "📦 Checking build..." -ForegroundColor Cyan
Write-Host ""

# Check if frontend is built
if (Test-Path "frontend/dist") {
    Write-Host "✅ Frontend build exists" -ForegroundColor Green
} else {
    Write-Host "⚠️ Frontend not built" -ForegroundColor Yellow
    Write-Host "Building now..." -ForegroundColor Cyan
    Set-Location frontend
    npm run build
    Set-Location ..
    Write-Host "✅ Frontend built" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔐 Generating JWT Secrets for Production..." -ForegroundColor Cyan
Write-Host ""

$jwtSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
$jwtRefreshSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})

Write-Host "JWT_SECRET:" -ForegroundColor Yellow
Write-Host $jwtSecret -ForegroundColor White
Write-Host ""
Write-Host "JWT_REFRESH_SECRET:" -ForegroundColor Yellow
Write-Host $jwtRefreshSecret -ForegroundColor White
Write-Host ""
Write-Host "⚠️ SAVE THESE! You'll need them for Render.com" -ForegroundColor Yellow
Write-Host ""

# Create env vars summary
$envVarsSummary = @"

========================================
ENVIRONMENT VARIABLES FOR RENDER.COM
========================================

Copy these to Render.com when deploying:

DATABASE_URL=postgresql://neondb_owner:npg_0uVXjU2lSORx@ep-lively-smoke-a1fxbfp5-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require

JWT_SECRET=$jwtSecret
JWT_REFRESH_SECRET=$jwtRefreshSecret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

CLOUDINARY_CLOUD_NAME=dw47h2yyd
CLOUDINARY_API_KEY=688569912156569
CLOUDINARY_API_SECRET=x2_9z0J8h6pP5tCoqUDMsI7L03Y

SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tmqew2hn5rge7xpx@ethereal.email
SMTP_PASS=5Rvz6cHD5m4eQHR8dV
SMTP_FROM_NAME=Sing Buri Adventist Center
SMTP_FROM_EMAIL=noreply@singburi-adventist.org

NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://your-vercel-app.vercel.app

SESSION_TIMEOUT_HOURS=24
ACCOUNT_LOCKOUT_DURATION_MINUTES=15
MAX_FAILED_LOGIN_ATTEMPTS=5

VAPID_PUBLIC_KEY=BITPV9QKSSIVt46q_-xnfF9NcsFP5q-81siqEXGZO-MN90HBO1SxQzLYt0uF_kHtfEhM337B7bV9tXgeDUGOZ14
VAPID_PRIVATE_KEY=xtIW0ZQJM_0WBVL3lvuJQFZOB-qil8dWlAH_MjFktlY
VAPID_SUBJECT=mailto:admin@singburi-adventist.org

========================================

"@

# Save to file
$envVarsSummary | Out-File -FilePath "production-env-vars.txt" -Encoding UTF8

Write-Host "✅ Environment variables saved to: production-env-vars.txt" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NEXT STEPS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. FRONTEND (Vercel):" -ForegroundColor Yellow
Write-Host "   • Go to: https://vercel.com/new" -ForegroundColor Cyan
Write-Host "   • Import your GitHub repository" -ForegroundColor White
Write-Host "   • Root: frontend" -ForegroundColor White
Write-Host "   • Click Deploy!" -ForegroundColor White
Write-Host ""
Write-Host "2. BACKEND (Render.com):" -ForegroundColor Yellow
Write-Host "   • Go to: https://render.com (already open)" -ForegroundColor Cyan
Write-Host "   • New Web Service" -ForegroundColor White
Write-Host "   • Copy env vars from: production-env-vars.txt" -ForegroundColor White
Write-Host "   • Deploy!" -ForegroundColor White
Write-Host ""
Write-Host "3. COMPLETE GUIDE:" -ForegroundColor Yellow
Write-Host "   • See: DEPLOY_NOW.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Open deployment guide
$openGuide = Read-Host "Open deployment guide? (y/n)"
if ($openGuide -eq "y") {
    code DEPLOY_NOW.md
}

Write-Host ""
Write-Host "🚀 Ready to deploy! Follow the steps above." -ForegroundColor Green
Write-Host ""
