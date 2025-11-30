#!/bin/bash
# ============================================
# PostgreSQL Database Backup Script
# Church Management Application
# ============================================
# Creates a compressed backup of the PostgreSQL database
# Usage: ./backup-database.sh [options]
# Options:
#   -d, --directory <path>  Backup directory (default: ./backups)
#   -f, --format <format>   Output format: sql, custom (default: custom)
#   -h, --help              Show this help message
# ============================================

set -euo pipefail

# Default configuration
BACKUP_DIR="${BACKUP_PATH:-./backups}"
BACKUP_FORMAT="custom"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
HOSTNAME=$(hostname)

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--directory)
            BACKUP_DIR="$2"
            shift 2
            ;;
        -f|--format)
            BACKUP_FORMAT="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: ./backup-database.sh [options]"
            echo "Options:"
            echo "  -d, --directory <path>  Backup directory (default: ./backups)"
            echo "  -f, --format <format>   Output format: sql, custom (default: custom)"
            echo "  -h, --help              Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Load environment variables if .env exists
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Parse DATABASE_URL
if [ -z "${DATABASE_URL:-}" ]; then
    echo "ERROR: DATABASE_URL environment variable is not set"
    exit 1
fi

# Extract database connection details from DATABASE_URL
# Format: postgresql://user:password@host:port/database?schema=public
DB_USER=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASSWORD=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo "$DATABASE_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')

# Validate extracted values
if [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_HOST" ] || [ -z "$DB_PORT" ] || [ -z "$DB_NAME" ]; then
    echo "ERROR: Could not parse DATABASE_URL"
    exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Set backup filename based on format
if [ "$BACKUP_FORMAT" = "sql" ]; then
    BACKUP_FILE="${BACKUP_DIR}/church_app_${TIMESTAMP}_${HOSTNAME}.sql.gz"
else
    BACKUP_FILE="${BACKUP_DIR}/church_app_${TIMESTAMP}_${HOSTNAME}.dump"
fi

echo "============================================"
echo "Church App Database Backup"
echo "============================================"
echo "Timestamp: $TIMESTAMP"
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo "Backup file: $BACKUP_FILE"
echo "Format: $BACKUP_FORMAT"
echo "============================================"

# Export password for pg_dump
export PGPASSWORD="$DB_PASSWORD"

# Create backup
echo "Creating backup..."
if [ "$BACKUP_FORMAT" = "sql" ]; then
    # Plain SQL format (compressed with gzip)
    pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --no-owner \
        --no-acl \
        --clean \
        --if-exists \
        | gzip > "$BACKUP_FILE"
else
    # Custom format (most flexible for restore)
    pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --format=custom \
        --no-owner \
        --no-acl \
        --verbose \
        > "$BACKUP_FILE"
fi

# Unset password
unset PGPASSWORD

# Verify backup was created
if [ -f "$BACKUP_FILE" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "============================================"
    echo "Backup completed successfully!"
    echo "File: $BACKUP_FILE"
    echo "Size: $BACKUP_SIZE"
    echo "============================================"
    
    # Create a symlink to the latest backup
    LATEST_LINK="${BACKUP_DIR}/latest.dump"
    if [ "$BACKUP_FORMAT" = "sql" ]; then
        LATEST_LINK="${BACKUP_DIR}/latest.sql.gz"
    fi
    rm -f "$LATEST_LINK"
    ln -s "$(basename "$BACKUP_FILE")" "$LATEST_LINK"
    echo "Latest backup symlink: $LATEST_LINK"
else
    echo "ERROR: Backup file was not created"
    exit 1
fi

# Log backup metadata
METADATA_FILE="${BACKUP_DIR}/backup_metadata.log"
echo "${TIMESTAMP}|${BACKUP_FILE}|${BACKUP_SIZE}|SUCCESS" >> "$METADATA_FILE"

echo "Backup metadata logged to: $METADATA_FILE"
echo "Done!"
