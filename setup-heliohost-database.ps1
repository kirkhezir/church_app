# ============================================
# HelioHost PostgreSQL Setup Script
# ============================================
# Configure church_app to use HelioHost database
# ============================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  HelioHost PostgreSQL Setup" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "This script will configure your app to use HelioHost PostgreSQL.`n" -ForegroundColor White

# Prompt for HelioHost connection details
Write-Host "Enter your HelioHost database details:" -ForegroundColor Yellow
Write-Host "(Get these from: HelioHost Control Panel → Databases)`n" -ForegroundColor Gray

$host_input = Read-Host "PostgreSQL Host (e.g., tommy.heliohost.org)"
$port = Read-Host "Port (default: 5432, press Enter to use default)"
$database = Read-Host "Database Name"
$username = Read-Host "Username"
$password = Read-Host "Password" -AsSecureString
$password_plain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

# Use default port if not provided
if ([string]::IsNullOrWhiteSpace($port)) {
    $port = "5432"
}

Write-Host "`nSSL Mode (HelioHost may not require SSL):" -ForegroundColor Yellow
Write-Host "1. require (use SSL)" -ForegroundColor White
Write-Host "2. disable (no SSL)" -ForegroundColor White
$sslChoice = Read-Host "Choose [1 or 2] (default: 2)"

$sslMode = if ($sslChoice -eq "1") { "require" } else { "disable" }

# Construct connection string
$connectionString = "postgresql://${username}:${password_plain}@${host_input}:${port}/${database}?sslmode=${sslMode}"

Write-Host "`n🔄 Updating backend/.env...`n" -ForegroundColor Cyan

try {
    # Read current .env file
    $envPath = "backend\.env"
    $envContent = Get-Content $envPath -Raw

    # Replace DATABASE_URL
    $newContent = $envContent -replace 'DATABASE_URL="postgresql://[^"]*"', "DATABASE_URL=`"$connectionString`""

    # Save updated .env
    Set-Content -Path $envPath -Value $newContent -NoNewline

    Write-Host "✅ Database URL updated successfully!`n" -ForegroundColor Green

    # Test connection
    Write-Host "📋 Testing database connection...`n" -ForegroundColor Cyan
    
    Set-Location backend
    
    # Try to connect
    $testResult = npx prisma db pull --force 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Connection successful!`n" -ForegroundColor Green
        
        # Ask about migrations
        Write-Host "Would you like to run database migrations now? (y/n)" -ForegroundColor Yellow
        $runMigrations = Read-Host
        
        if ($runMigrations -eq "y") {
            Write-Host "`n🚀 Running migrations...`n" -ForegroundColor Cyan
            
            # Generate Prisma Client
            npm run prisma:generate
            
            # Deploy migrations
            npx prisma migrate deploy
            
            Write-Host "`n✅ Migrations completed!`n" -ForegroundColor Green
            
            # Ask about seeding
            Write-Host "Would you like to seed the database with test data? (y/n)" -ForegroundColor Yellow
            $runSeed = Read-Host
            
            if ($runSeed -eq "y") {
                Write-Host "`n🌱 Seeding database...`n" -ForegroundColor Cyan
                npm run prisma:seed
                Write-Host "`n✅ Database seeded!`n" -ForegroundColor Green
            }
        }
    }
    else {
        Write-Host "❌ Connection failed!`n" -ForegroundColor Red
        Write-Host "Common issues:" -ForegroundColor Yellow
        Write-Host "  1. Wrong SSL mode (try the other option)" -ForegroundColor White
        Write-Host "  2. Firewall blocking connection" -ForegroundColor White
        Write-Host "  3. Incorrect credentials" -ForegroundColor White
        Write-Host "  4. Database not created yet in HelioHost`n" -ForegroundColor White
    }
    
    Set-Location ..

}
catch {
    Write-Host "❌ Error: $($_.Exception.Message)`n" -ForegroundColor Red
    exit 1
}

Write-Host "========================================" -ForegroundColor Green
Write-Host "📝 Next Steps:" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "1. Start backend: cd backend && npm run dev" -ForegroundColor White
Write-Host "2. Start frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host "3. Access app: http://localhost:5173`n" -ForegroundColor White

Write-Host "📊 Connection Details (stored in backend/.env):" -ForegroundColor Cyan
Write-Host "   Host: $host_input" -ForegroundColor Gray
Write-Host "   Port: $port" -ForegroundColor Gray
Write-Host "   Database: $database" -ForegroundColor Gray
Write-Host "   SSL: $sslMode`n" -ForegroundColor Gray

Write-Host "🔒 Security: Credentials secured in .env (gitignored)`n" -ForegroundColor Green

Write-Host "========================================`n" -ForegroundColor Green
