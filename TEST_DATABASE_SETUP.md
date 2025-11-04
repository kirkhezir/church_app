# PostgreSQL Test Database Setup

## Problem

Tests are failing with "Authentication failed against database server" because the test database doesn't exist or has incorrect credentials.

## Solution

### 1. Create Test Database and User

Open PowerShell as Administrator and run:

```powershell
# Connect to PostgreSQL as postgres superuser
psql -U postgres

# Then run these SQL commands:
```

```sql
-- Create test user
CREATE USER test WITH PASSWORD 'test';

-- Create test database
CREATE DATABASE church_app_test OWNER test;

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE church_app_test TO test;

-- Connect to test database
\c church_app_test

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO test;

-- Exit psql
\q
```

### 2. Run Prisma Migrations on Test Database

```powershell
cd backend

# Set test database URL temporarily
$env:DATABASE_URL="postgresql://test:test@localhost:5432/church_app_test"

# Run migrations
npx prisma migrate deploy

# OR reset the database (this will drop all data)
npx prisma migrate reset --force

# Verify
npx prisma db pull
```

### 3. Verify Test Database

```powershell
# Run the test database check script
npx tsx check-test-members.ts
```

Expected output: "Total members in database: 0" (or whatever members exist)

### 4. Run Tests

```powershell
npm test -- tests/contract/eventEndpoints.test.ts --no-coverage
```

## Alternative: Use Same Credentials as Dev Database

If you want to use the same database credentials:

1. Check your development database credentials (likely in `.env` or from previous setup)
2. Update `backend/tests/setup.ts` line 7 to match your dev credentials:
   ```typescript
   process.env.DATABASE_URL =
     "postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/church_app_test";
   ```
3. Create the test database with those credentials

## Troubleshooting

**Error: "role 'test' does not exist"**

- Run the `CREATE USER test WITH PASSWORD 'test';` command

**Error: "database 'church_app_test' does not exist"**

- Run the `CREATE DATABASE church_app_test OWNER test;` command

**Error: "permission denied for schema public"**

- Connect to the test database and run `GRANT ALL ON SCHEMA public TO test;`

**Error: "relation does not exist"**

- Run Prisma migrations: `npx prisma migrate deploy`
