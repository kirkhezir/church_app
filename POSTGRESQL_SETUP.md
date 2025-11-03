# PostgreSQL Setup Guide for Windows

## Option 1: Download Installer (Recommended)

1. **Download PostgreSQL 16**:

   - Visit: https://www.postgresql.org/download/windows/
   - Click "Download the installer" (by EDB)
   - Download PostgreSQL 16.x for Windows x86-64
   - Run the installer

2. **Installation Steps**:

   - Choose installation directory (default: C:\Program Files\PostgreSQL\16)
   - Select components: PostgreSQL Server, pgAdmin 4, Command Line Tools
   - Set password for postgres superuser (remember this!)
   - Port: 5432 (default)
   - Locale: Default locale
   - Complete installation

3. **Verify Installation**:

   ```powershell
   # Add PostgreSQL to PATH (if not already added)
   $env:Path += ";C:\Program Files\PostgreSQL\16\bin"

   # Check version
   psql --version
   ```

## Option 2: Using Chocolatey

```powershell
# Install Chocolatey if not already installed
# Then run:
choco install postgresql16 --params '/Password:YourPassword123'
```

## Option 3: Using Winget

```powershell
winget install PostgreSQL.PostgreSQL
```

## Creating the Database

After PostgreSQL is installed:

```powershell
# Connect to PostgreSQL
psql -U postgres

# In psql prompt:
CREATE DATABASE church_app;
\q
```

OR use one command:

```powershell
createdb -U postgres church_app
```

## Configure Environment Variables

```powershell
cd backend
cp .env.example .env
```

Edit `.env` file and update:

```
DATABASE_URL="postgresql://postgres:YourPassword@localhost:5432/church_app?schema=public"
```

Replace `YourPassword` with your PostgreSQL password.

## Run Prisma Migrations

```powershell
cd backend
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

## Alternative: Use Docker (If you prefer)

```powershell
docker run --name church-postgres -e POSTGRES_PASSWORD=yourpassword -e POSTGRES_DB=church_app -p 5432:5432 -d postgres:16

# Then use this DATABASE_URL:
# postgresql://postgres:yourpassword@localhost:5432/church_app?schema=public
```

## Troubleshooting

**Issue**: psql command not found
**Solution**: Add PostgreSQL bin folder to PATH:

```powershell
$env:Path += ";C:\Program Files\PostgreSQL\16\bin"
```

**Issue**: Connection refused
**Solution**: Check if PostgreSQL service is running:

```powershell
Get-Service -Name postgresql*
# Start if stopped:
Start-Service postgresql-x64-16
```
