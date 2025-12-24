#!/bin/bash
# ============================================
# Database Restore Script
# ============================================
# Restores database from a backup file
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
BACKUP_FILE="${1:-}"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   Database Restore Script${NC}"
echo -e "${BLUE}============================================${NC}"

# Check for backup file argument
if [[ -z "$BACKUP_FILE" ]]; then
    echo -e "${RED}Error: No backup file specified${NC}"
    echo -e "Usage: $0 <backup_file>"
    echo -e ""
    echo -e "Available backups:"
    ls -la ./backups/*.sql.gz ./backups/*.dump 2>/dev/null || echo "No backups found in ./backups/"
    exit 1
fi

# Check if file exists
if [[ ! -f "$BACKUP_FILE" ]]; then
    echo -e "${RED}Error: Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

# Load environment variables
if [[ -f ".env" ]]; then
    export $(grep -v '^#' .env | xargs)
elif [[ -f ".env.production" ]]; then
    export $(grep -v '^#' .env.production | xargs)
fi

# Check DATABASE_URL
if [[ -z "${DATABASE_URL:-}" ]]; then
    echo -e "${RED}Error: DATABASE_URL not set${NC}"
    exit 1
fi

# Parse DATABASE_URL
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')

export PGPASSWORD="$DB_PASS"

echo -e "\nBackup file: ${BACKUP_FILE}"
echo -e "Database: ${DB_NAME}"
echo -e "Host: ${DB_HOST}:${DB_PORT}"
echo -e ""

# Confirmation
echo -e "${YELLOW}WARNING: This will overwrite the current database!${NC}"
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [[ "$CONFIRM" != "yes" ]]; then
    echo -e "Restore cancelled."
    exit 0
fi

# Create pre-restore backup
echo -e "\n${BLUE}Creating pre-restore backup...${NC}"
PRE_RESTORE_BACKUP="./backups/pre_restore_${DB_NAME}_$(date +%Y%m%d_%H%M%S).sql.gz"
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" | gzip > "$PRE_RESTORE_BACKUP"
echo -e "${GREEN}✓ Pre-restore backup created: $PRE_RESTORE_BACKUP${NC}"

# Terminate existing connections
echo -e "\n${BLUE}Terminating existing connections...${NC}"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c \
    "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${DB_NAME}' AND pid <> pg_backend_pid();" \
    >/dev/null 2>&1 || true

# Drop and recreate database
echo -e "${BLUE}Recreating database...${NC}"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS ${DB_NAME};"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE ${DB_NAME};"

# Restore based on file type
echo -e "\n${BLUE}Restoring database...${NC}"

if [[ "$BACKUP_FILE" == *.gz ]]; then
    # Compressed SQL file
    gunzip -c "$BACKUP_FILE" | psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME"
elif [[ "$BACKUP_FILE" == *.dump ]]; then
    # Custom format
    pg_restore -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" --no-owner --no-acl "$BACKUP_FILE"
else
    # Plain SQL
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" < "$BACKUP_FILE"
fi

echo -e "${GREEN}✓ Database restored successfully${NC}"

# Verify restore
echo -e "\n${BLUE}Verifying restore...${NC}"
TABLE_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
    "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';")
echo -e "Tables restored: ${TABLE_COUNT}"

# Summary
echo -e "\n${GREEN}============================================${NC}"
echo -e "${GREEN}   Restore Complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo -e ""
echo -e "Restored from: ${BACKUP_FILE}"
echo -e "Pre-restore backup: ${PRE_RESTORE_BACKUP}"
echo -e ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Verify application is working"
echo -e "  2. Run any pending migrations: npx prisma migrate deploy"
echo -e "  3. Delete pre-restore backup if not needed"
