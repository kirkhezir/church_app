#!/bin/bash
# ============================================
# Old Backup Cleanup Script
# Church Management Application
# ============================================
# Removes backup files older than the retention period
# Usage: ./cleanup-old-backups.sh [options]
# Options:
#   -d, --directory <path>  Backup directory (default: ./backups)
#   -r, --retention <days>  Retention period in days (default: 30)
#   -n, --dry-run           Show what would be deleted without deleting
#   -h, --help              Show this help message
# ============================================

set -euo pipefail

# Default configuration
BACKUP_DIR="${BACKUP_PATH:-./backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
DRY_RUN=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--directory)
            BACKUP_DIR="$2"
            shift 2
            ;;
        -r|--retention)
            RETENTION_DAYS="$2"
            shift 2
            ;;
        -n|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -h|--help)
            echo "Usage: ./cleanup-old-backups.sh [options]"
            echo "Options:"
            echo "  -d, --directory <path>  Backup directory (default: ./backups)"
            echo "  -r, --retention <days>  Retention period in days (default: 30)"
            echo "  -n, --dry-run           Show what would be deleted without deleting"
            echo "  -h, --help              Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

echo "============================================"
echo "Church App Backup Cleanup"
echo "============================================"
echo "Backup directory: $BACKUP_DIR"
echo "Retention period: $RETENTION_DAYS days"
if [ "$DRY_RUN" = true ]; then
    echo "Mode: DRY RUN (no files will be deleted)"
fi
echo "============================================"

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo "Backup directory does not exist: $BACKUP_DIR"
    exit 0
fi

# Find and delete old backup files
echo ""
echo "Searching for backups older than $RETENTION_DAYS days..."

# Count files to be deleted
OLD_FILES=$(find "$BACKUP_DIR" -type f \( -name "*.dump" -o -name "*.sql.gz" \) -mtime +"$RETENTION_DAYS" 2>/dev/null || true)
OLD_COUNT=$(echo "$OLD_FILES" | grep -c . || echo 0)

if [ "$OLD_COUNT" -eq 0 ]; then
    echo "No old backups found to clean up."
else
    echo "Found $OLD_COUNT backup file(s) to remove:"
    echo "$OLD_FILES" | while read -r file; do
        if [ -n "$file" ]; then
            FILE_DATE=$(date -r "$file" "+%Y-%m-%d %H:%M:%S" 2>/dev/null || echo "unknown")
            FILE_SIZE=$(du -h "$file" 2>/dev/null | cut -f1 || echo "unknown")
            echo "  - $(basename "$file") (${FILE_SIZE}, created: ${FILE_DATE})"
        fi
    done
    
    if [ "$DRY_RUN" = false ]; then
        echo ""
        echo "Deleting old backups..."
        
        DELETED_COUNT=0
        FREED_SPACE=0
        
        echo "$OLD_FILES" | while read -r file; do
            if [ -n "$file" ] && [ -f "$file" ]; then
                FILE_SIZE_BYTES=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)
                rm -f "$file"
                echo "Deleted: $(basename "$file")"
                DELETED_COUNT=$((DELETED_COUNT + 1))
                FREED_SPACE=$((FREED_SPACE + FILE_SIZE_BYTES))
            fi
        done
        
        echo ""
        echo "Cleanup complete!"
    else
        echo ""
        echo "Dry run complete. No files were deleted."
        echo "Run without -n/--dry-run to actually delete files."
    fi
fi

# Show remaining backups
echo ""
echo "============================================"
echo "Remaining backups:"
REMAINING=$(find "$BACKUP_DIR" -type f \( -name "*.dump" -o -name "*.sql.gz" \) 2>/dev/null | wc -l || echo 0)
echo "Total backup files: $REMAINING"

# Show total size of backups
if [ "$REMAINING" -gt 0 ]; then
    TOTAL_SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1 || echo "unknown")
    echo "Total backup size: $TOTAL_SIZE"
fi

echo "============================================"
echo "Done!"
