# Database Backup and Restore Procedures

This document describes the backup and restore procedures for the Church Management Application database.

## Overview

The application uses PostgreSQL as its primary database. Backups are essential for:

- Disaster recovery
- Data protection
- Point-in-time recovery
- Migration to new servers

## Backup Strategy

### Schedule

| Type           | Frequency              | Retention | Purpose                    |
| -------------- | ---------------------- | --------- | -------------------------- |
| Full Backup    | Daily at 2:00 AM       | 30 days   | Complete database snapshot |
| Weekly Backup  | Sunday at 2:00 AM      | 90 days   | Long-term retention        |
| Pre-deployment | Before each deployment | 7 days    | Rollback capability        |

### Backup Storage

- **Primary**: Local server storage (`./backups/`)
- **Secondary**: Cloud storage (S3, Azure Blob, etc.)
- **Offsite**: Monthly archives to offsite storage

## Backup Scripts

### 1. Creating a Backup

```bash
# Navigate to project root
cd /path/to/church_app

# Create a backup using default settings
./scripts/backup-database.sh

# Create backup with custom directory
./scripts/backup-database.sh -d /path/to/custom/backups

# Create SQL format backup (for portability)
./scripts/backup-database.sh -f sql
```

### 2. Cleanup Old Backups

```bash
# Remove backups older than 30 days (default)
./scripts/cleanup-old-backups.sh

# Custom retention period (e.g., 7 days)
./scripts/cleanup-old-backups.sh -r 7

# Dry run to see what would be deleted
./scripts/cleanup-old-backups.sh -n
```

### 3. Verify Backup Integrity

```bash
# Verify the latest backup
./scripts/verify-backup.sh

# Verify a specific backup file
./scripts/verify-backup.sh -f ./backups/church_app_20231201_020000.dump
```

## Setting Up Automated Backups

### Linux/macOS (cron)

Edit the crontab:

```bash
crontab -e
```

Add these entries:

```cron
# Daily backup at 2:00 AM
0 2 * * * cd /path/to/church_app && ./scripts/backup-database.sh >> /var/log/church_app_backup.log 2>&1

# Cleanup old backups daily at 3:00 AM
0 3 * * * cd /path/to/church_app && ./scripts/cleanup-old-backups.sh >> /var/log/church_app_cleanup.log 2>&1

# Weekly backup verification on Mondays at 4:00 AM
0 4 * * 1 cd /path/to/church_app && ./scripts/verify-backup.sh >> /var/log/church_app_verify.log 2>&1
```

### Windows (Task Scheduler)

1. Open Task Scheduler
2. Create a new Basic Task
3. Set trigger: Daily at 2:00 AM
4. Set action: Start a program
5. Program: `powershell.exe`
6. Arguments: `-ExecutionPolicy Bypass -File "C:\path\to\church_app\scripts\backup-database.ps1"`

## Restore Procedures

### Restoring from Custom Format (.dump)

```bash
# Restore to a new database
pg_restore -h localhost -p 5432 -U postgres -d church_app_restore \
    --clean --if-exists --verbose \
    ./backups/church_app_20231201_020000.dump

# Restore specific tables only
pg_restore -h localhost -p 5432 -U postgres -d church_app_restore \
    --table=Member --table=Event \
    ./backups/church_app_20231201_020000.dump
```

### Restoring from SQL Format (.sql.gz)

```bash
# Create new database
createdb -h localhost -p 5432 -U postgres church_app_restore

# Restore from compressed SQL
zcat ./backups/church_app_20231201_020000.sql.gz | \
    psql -h localhost -p 5432 -U postgres -d church_app_restore
```

### Point-in-Time Recovery

For point-in-time recovery, you need:

1. A full backup before the target time
2. WAL (Write-Ahead Log) archives

This requires additional PostgreSQL configuration. See [PostgreSQL PITR Documentation](https://www.postgresql.org/docs/current/continuous-archiving.html).

## Disaster Recovery Procedures

### Complete Database Loss

1. **Assess the situation**

   - Determine cause of failure
   - Identify the most recent valid backup

2. **Prepare recovery environment**

   ```bash
   # Create new database
   createdb -h localhost -U postgres church_app
   ```

3. **Restore from backup**

   ```bash
   pg_restore -h localhost -p 5432 -U postgres -d church_app \
       --clean --if-exists \
       ./backups/latest.dump
   ```

4. **Verify restoration**

   ```bash
   # Run Prisma to verify schema
   cd backend
   npx prisma validate
   npx prisma db push --accept-data-loss
   ```

5. **Test application**
   - Start the backend server
   - Verify login works
   - Check critical data

### Partial Data Recovery

To recover specific records:

1. Restore backup to a temporary database
2. Export specific data
3. Import into production

```bash
# Create temp database
createdb -h localhost -U postgres church_app_temp

# Restore backup
pg_restore -h localhost -p 5432 -U postgres -d church_app_temp ./backups/backup.dump

# Export specific table data
psql -h localhost -U postgres -d church_app_temp \
    -c "COPY (SELECT * FROM \"Event\" WHERE id = 'xyz') TO STDOUT WITH CSV" \
    > recovered_event.csv

# Import to production
psql -h localhost -U postgres -d church_app \
    -c "COPY \"Event\" FROM STDIN WITH CSV" < recovered_event.csv

# Clean up
dropdb -h localhost -U postgres church_app_temp
```

## Backup Monitoring

### Verifying Backup Success

Check the backup metadata log:

```bash
cat ./backups/backup_metadata.log
```

Output format:

```
TIMESTAMP|FILENAME|SIZE|STATUS
20231201_020000|church_app_20231201_020000.dump|15M|SUCCESS
```

### Setting Up Alerts

Create a monitoring script that sends alerts on backup failure:

```bash
#!/bin/bash
# check-backup.sh

BACKUP_DIR="./backups"
MAX_AGE_HOURS=26  # Alert if no backup in last 26 hours

# Find latest backup
LATEST=$(find "$BACKUP_DIR" -type f -name "*.dump" -mmin -$((MAX_AGE_HOURS * 60)) | head -1)

if [ -z "$LATEST" ]; then
    echo "ALERT: No recent backup found!" | mail -s "Backup Alert" admin@church.org
fi
```

## Best Practices

1. **Always test restores**: Periodically restore backups to verify they work
2. **Monitor backup size**: Sudden changes may indicate issues
3. **Encrypt offsite backups**: Use GPG or similar for security
4. **Document changes**: Log any modifications to backup procedures
5. **Multiple locations**: Store backups in at least 2 different locations
6. **Automate verification**: Run integrity checks automatically

## Troubleshooting

### Common Issues

**Problem**: `pg_dump: error: connection to database failed`

- **Solution**: Check DATABASE_URL environment variable and database connectivity

**Problem**: Backup file is 0 bytes

- **Solution**: Check disk space and PostgreSQL permissions

**Problem**: Restore fails with "relation already exists"

- **Solution**: Use `--clean --if-exists` flags or drop database first

**Problem**: Permission denied on backup script

- **Solution**: `chmod +x scripts/backup-database.sh`

### Getting Help

- Check PostgreSQL logs: `/var/log/postgresql/`
- Review application logs: `./backend/logs/`
- Consult PostgreSQL documentation
- Contact system administrator

---

_Last updated: November 2025_
