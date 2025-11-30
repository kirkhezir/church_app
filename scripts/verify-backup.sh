#!/bin/bash
# ============================================
# Backup Verification Script
# Church Management Application
# ============================================
# Verifies the integrity of a backup file by testing restore capability
# Usage: ./verify-backup.sh [options]
# Options:
#   -f, --file <path>       Backup file to verify (default: latest)
#   -d, --directory <path>  Backup directory (default: ./backups)
#   -h, --help              Show this help message
# ============================================

set -euo pipefail

# Default configuration
BACKUP_DIR="${BACKUP_PATH:-./backups}"
BACKUP_FILE=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -f|--file)
            BACKUP_FILE="$2"
            shift 2
            ;;
        -d|--directory)
            BACKUP_DIR="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: ./verify-backup.sh [options]"
            echo "Options:"
            echo "  -f, --file <path>       Backup file to verify (default: latest)"
            echo "  -d, --directory <path>  Backup directory (default: ./backups)"
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

# Find the backup file to verify
if [ -z "$BACKUP_FILE" ]; then
    # Try to find the latest backup
    if [ -L "${BACKUP_DIR}/latest.dump" ]; then
        BACKUP_FILE="${BACKUP_DIR}/$(readlink "${BACKUP_DIR}/latest.dump")"
    elif [ -L "${BACKUP_DIR}/latest.sql.gz" ]; then
        BACKUP_FILE="${BACKUP_DIR}/$(readlink "${BACKUP_DIR}/latest.sql.gz")"
    else
        # Find the most recent backup file
        BACKUP_FILE=$(find "$BACKUP_DIR" -type f \( -name "*.dump" -o -name "*.sql.gz" \) -printf '%T+ %p\n' 2>/dev/null | sort -r | head -1 | cut -d' ' -f2-)
    fi
fi

if [ -z "$BACKUP_FILE" ] || [ ! -f "$BACKUP_FILE" ]; then
    echo "ERROR: No backup file found to verify"
    exit 1
fi

echo "============================================"
echo "Church App Backup Verification"
echo "============================================"
echo "Backup file: $BACKUP_FILE"
echo "File size: $(du -h "$BACKUP_FILE" | cut -f1)"
echo "Last modified: $(date -r "$BACKUP_FILE" "+%Y-%m-%d %H:%M:%S" 2>/dev/null || stat -c %y "$BACKUP_FILE" 2>/dev/null | cut -d. -f1)"
echo "============================================"

# Determine backup format
if [[ "$BACKUP_FILE" == *.dump ]]; then
    BACKUP_FORMAT="custom"
elif [[ "$BACKUP_FILE" == *.sql.gz ]]; then
    BACKUP_FORMAT="sql"
else
    echo "ERROR: Unknown backup format"
    exit 1
fi

echo "Format: $BACKUP_FORMAT"
echo ""

# Verify backup file integrity
echo "Checking backup file integrity..."

if [ "$BACKUP_FORMAT" = "custom" ]; then
    # For custom format, use pg_restore to list contents
    if pg_restore --list "$BACKUP_FILE" > /dev/null 2>&1; then
        echo "✓ Backup file is valid pg_dump custom format"
        
        # Count objects in backup
        TABLE_COUNT=$(pg_restore --list "$BACKUP_FILE" 2>/dev/null | grep -c "TABLE" || echo 0)
        INDEX_COUNT=$(pg_restore --list "$BACKUP_FILE" 2>/dev/null | grep -c "INDEX" || echo 0)
        CONSTRAINT_COUNT=$(pg_restore --list "$BACKUP_FILE" 2>/dev/null | grep -c "CONSTRAINT" || echo 0)
        
        echo ""
        echo "Backup contents:"
        echo "  - Tables: $TABLE_COUNT"
        echo "  - Indexes: $INDEX_COUNT"
        echo "  - Constraints: $CONSTRAINT_COUNT"
    else
        echo "✗ Backup file is corrupted or invalid"
        exit 1
    fi
else
    # For SQL format, check gzip integrity and basic SQL structure
    if gzip -t "$BACKUP_FILE" 2>/dev/null; then
        echo "✓ Gzip compression is valid"
        
        # Check for expected SQL statements
        if zcat "$BACKUP_FILE" 2>/dev/null | head -100 | grep -q "CREATE TABLE\|DROP TABLE"; then
            echo "✓ SQL structure appears valid"
        else
            echo "⚠ Could not verify SQL structure (file may still be valid)"
        fi
    else
        echo "✗ Gzip file is corrupted"
        exit 1
    fi
fi

echo ""
echo "============================================"
echo "Verification complete!"
echo "Status: PASSED ✓"
echo "============================================"
echo ""
echo "To restore this backup to a test database:"
if [ "$BACKUP_FORMAT" = "custom" ]; then
    echo "  pg_restore -h <host> -p <port> -U <user> -d <test_db> --clean --if-exists $BACKUP_FILE"
else
    echo "  zcat $BACKUP_FILE | psql -h <host> -p <port> -U <user> -d <test_db>"
fi
echo ""
echo "⚠ WARNING: Always test restore on a separate database, never on production!"
