# Neon Database Configuration Script
# Run this after getting your Neon connection string
# Database name: singburiadventistcenter

param(
    [string]$ConnectionString
)

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "  Neon Database Setup" -ForegroundColor Cyan
Write-Host "  Database: singburiadventistcenter" -ForegroundColor Gray
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Get connection string from parameter or prompt
if ([string]::IsNullOrWhiteSpace($ConnectionString)) {
    Write-Host "Please enter your Neon connection string:" -ForegroundColor Yellow
    Write-Host "(Format: postgresql://user:pass@ep-xxx.neon.tech/singburiadventistcenter?sslmode=require)" -ForegroundColor Gray
    Write-Host ""
    $connectionString = Read-Host "Connection String"
}
else {
    $connectionString = $ConnectionString
}

if ([string]::IsNullOrWhiteSpace($connectionString)) {
    Write-Host "❌ Error: Connection string cannot be empty" -ForegroundColor Red
    exit 1
}

# Validate connection string format
if (-not $connectionString.StartsWith("postgresql://")) {
    Write-Host "❌ Error: Invalid connection string format" -ForegroundColor Red
    Write-Host "Should start with: postgresql://" -ForegroundColor Yellow
    exit 1
}

if (-not $connectionString.Contains("neon.tech")) {
    Write-Host "⚠️ Warning: This doesn't look like a Neon connection string" -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 0
    }
}

Write-Host ""
Write-Host "🔄 Updating backend/.env file..." -ForegroundColor Cyan

try {
    # Read current .env file
    $envPath = "backend\.env"
    $envContent = Get-Content $envPath -Raw

    # Replace DATABASE_URL
    $newContent = $envContent -replace 'DATABASE_URL="postgresql://[^"]*"', "DATABASE_URL=`"$connectionString`""

    # Save updated .env
    Set-Content -Path $envPath -Value $newContent -NoNewline

    Write-Host "✅ Database URL updated successfully!" -ForegroundColor Green
    Write-Host ""

    # Verify the change
    Write-Host "📋 Verifying connection string..." -ForegroundColor Cyan
    $updatedEnv = Get-Content $envPath -Raw
    if ($updatedEnv -match 'DATABASE_URL="([^"]+)"') {
        $savedUrl = $matches[1]
        if ($savedUrl.Contains("neon.tech")) {
            Write-Host "✅ Neon connection string saved correctly!" -ForegroundColor Green
        }
        else {
            Write-Host "⚠️ Warning: Saved URL doesn't contain 'neon.tech'" -ForegroundColor Yellow
        }
    }

    Write-Host ""
    Write-Host "=================================" -ForegroundColor Cyan
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "=================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Generate Prisma Client:" -ForegroundColor White
    Write-Host "   cd backend" -ForegroundColor Gray
    Write-Host "   npm run prisma:generate" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Run Database Migrations:" -ForegroundColor White
    Write-Host "   npm run prisma:migrate" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Seed Database (optional):" -ForegroundColor White
    Write-Host "   npm run prisma:seed" -ForegroundColor Gray
    Write-Host ""
    Write-Host "4. Start Development Server:" -ForegroundColor White
    Write-Host "   npm run dev" -ForegroundColor Gray
    Write-Host ""

    # Ask if user wants to run migrations now
    Write-Host "Would you like to run migrations now? (y/n)" -ForegroundColor Yellow
    $runMigrations = Read-Host

    if ($runMigrations -eq "y") {
        Write-Host ""
        Write-Host "🔄 Running Prisma migrations..." -ForegroundColor Cyan
        
        Set-Location backend
        
        # Generate Prisma Client
        Write-Host ""
        Write-Host "📦 Generating Prisma Client..." -ForegroundColor Cyan
        npm run prisma:generate
        
        # Run migrations
        Write-Host ""
        Write-Host "🚀 Deploying migrations..." -ForegroundColor Cyan
        npm run prisma:migrate
        
        Write-Host ""
        Write-Host "✅ Migrations completed!" -ForegroundColor Green
        
        # Ask about seeding
        Write-Host ""
        Write-Host "Would you like to seed the database with test data? (y/n)" -ForegroundColor Yellow
        $runSeed = Read-Host
        
        if ($runSeed -eq "y") {
            Write-Host ""
            Write-Host "🌱 Seeding database..." -ForegroundColor Cyan
            npm run prisma:seed
            Write-Host ""
            Write-Host "✅ Database seeded successfully!" -ForegroundColor Green
        }
        
        Set-Location ..
        
        Write-Host ""
        Write-Host "🎉 Database setup complete!" -ForegroundColor Green
        Write-Host "You can now run: npm run dev" -ForegroundColor White
    }

}
catch {
    Write-Host "❌ Error updating .env file: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
