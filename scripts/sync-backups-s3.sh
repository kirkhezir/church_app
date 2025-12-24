#!/bin/bash
# ============================================
# S3 Backup Sync Script
# ============================================
# Syncs local backups to S3 and manages retention
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
S3_BUCKET="${BACKUP_S3_BUCKET:-}"
S3_PREFIX="${S3_PREFIX:-database-backups}"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   S3 Backup Sync${NC}"
echo -e "${BLUE}============================================${NC}"

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed${NC}"
    exit 1
fi

# Check S3 bucket
if [[ -z "$S3_BUCKET" ]]; then
    echo -e "${RED}Error: BACKUP_S3_BUCKET not set${NC}"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}Error: AWS credentials not configured${NC}"
    exit 1
fi

echo -e "\nLocal directory: ${BACKUP_DIR}"
echo -e "S3 bucket: s3://${S3_BUCKET}/${S3_PREFIX}/"
echo -e "Retention: ${RETENTION_DAYS} days"
echo -e ""

# Sync local backups to S3
echo -e "${BLUE}Syncing backups to S3...${NC}"
aws s3 sync "$BACKUP_DIR" "s3://${S3_BUCKET}/${S3_PREFIX}/" \
    --exclude "*" \
    --include "*.sql.gz" \
    --include "*.dump" \
    --include "*.sha256"

SYNC_COUNT=$(aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" | wc -l)
echo -e "${GREEN}✓ Synced ${SYNC_COUNT} files to S3${NC}"

# Clean up old backups
echo -e "\n${BLUE}Cleaning up old backups...${NC}"
CUTOFF_DATE=$(date -d "-${RETENTION_DAYS} days" +%Y-%m-%d 2>/dev/null || date -v-${RETENTION_DAYS}d +%Y-%m-%d)

DELETED=0
while IFS= read -r line; do
    FILE_DATE=$(echo "$line" | awk '{print $1}')
    FILE_NAME=$(echo "$line" | awk '{print $4}')
    
    if [[ -n "$FILE_NAME" && "$FILE_DATE" < "$CUTOFF_DATE" ]]; then
        echo -e "  Deleting: $FILE_NAME (from $FILE_DATE)"
        aws s3 rm "s3://${S3_BUCKET}/${S3_PREFIX}/${FILE_NAME}"
        ((DELETED++))
    fi
done < <(aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/")

if [[ $DELETED -gt 0 ]]; then
    echo -e "${GREEN}✓ Deleted ${DELETED} old backups${NC}"
else
    echo -e "${GREEN}✓ No old backups to delete${NC}"
fi

# List current backups
echo -e "\n${BLUE}Current S3 backups:${NC}"
aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" --human-readable | tail -10

# Calculate total size
TOTAL_SIZE=$(aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" --recursive --summarize | grep "Total Size" | awk '{print $3, $4}')
echo -e "\nTotal backup size: ${TOTAL_SIZE}"

# Summary
echo -e "\n${GREEN}============================================${NC}"
echo -e "${GREEN}   S3 Sync Complete!${NC}"
echo -e "${GREEN}============================================${NC}"
