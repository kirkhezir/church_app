#!/bin/bash
# ============================================
# Generate Secure Secrets Script
# ============================================
# Generates all required secrets for production
# ============================================

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   Generate Production Secrets${NC}"
echo -e "${BLUE}============================================${NC}"

# Output file
OUTPUT_FILE="${1:-.env.production.secrets}"

echo -e "\nGenerating secrets to: ${OUTPUT_FILE}\n"

# Generate secure random strings
generate_secret() {
    openssl rand -hex 32
}

generate_password() {
    openssl rand -base64 24 | tr -d '/+=' | head -c 32
}

# Generate VAPID keys (requires web-push package)
generate_vapid() {
    if command -v npx &> /dev/null; then
        npx web-push generate-vapid-keys --json 2>/dev/null
    else
        echo '{"publicKey":"GENERATE_MANUALLY","privateKey":"GENERATE_MANUALLY"}'
    fi
}

# Generate secrets
JWT_SECRET=$(generate_secret)
DB_PASSWORD=$(generate_password)
REDIS_PASSWORD=$(generate_password)
GRAFANA_PASSWORD=$(generate_password)

# Generate VAPID keys
echo -e "${BLUE}Generating VAPID keys...${NC}"
VAPID_KEYS=$(generate_vapid)
VAPID_PUBLIC=$(echo $VAPID_KEYS | grep -oP '"publicKey":\s*"\K[^"]+' || echo "GENERATE_MANUALLY")
VAPID_PRIVATE=$(echo $VAPID_KEYS | grep -oP '"privateKey":\s*"\K[^"]+' || echo "GENERATE_MANUALLY")

# Create secrets file
cat > "$OUTPUT_FILE" << EOF
# =====================================================
# Production Secrets
# Generated: $(date -Iseconds)
# =====================================================
# KEEP THIS FILE SECURE - DO NOT COMMIT TO GIT!
# =====================================================

# JWT Secret (64 character hex string)
JWT_SECRET=${JWT_SECRET}

# Database Password
DB_PASSWORD=${DB_PASSWORD}

# Redis Password
REDIS_PASSWORD=${REDIS_PASSWORD}

# Grafana Admin Password
GRAFANA_PASSWORD=${GRAFANA_PASSWORD}

# VAPID Keys for Push Notifications
VAPID_PUBLIC_KEY=${VAPID_PUBLIC}
VAPID_PRIVATE_KEY=${VAPID_PRIVATE}

# =====================================================
# Manual Configuration Required
# =====================================================

# SMTP Configuration (for email)
# SMTP_USER=your-email@gmail.com
# SMTP_PASSWORD=your-app-specific-password

# Sentry DSN (for error tracking)
# SENTRY_DSN=https://your-key@sentry.io/project-id

# Slack Webhook (for alerts)
# SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

# AWS S3 (for backups)
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
# AWS_REGION=us-east-1
# BACKUP_S3_BUCKET=church-app-backups
EOF

# Set permissions
chmod 600 "$OUTPUT_FILE"

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}   Secrets Generated Successfully!${NC}"
echo -e "${GREEN}============================================${NC}"
echo -e ""
echo -e "Secrets saved to: ${OUTPUT_FILE}"
echo -e ""
echo -e "Next steps:"
echo -e "  1. Review and customize the secrets file"
echo -e "  2. Add SMTP credentials for email"
echo -e "  3. Add Sentry DSN for error tracking"
echo -e "  4. Copy secrets to .env.production"
echo -e ""
echo -e "${BLUE}Generated values:${NC}"
echo -e "  JWT_SECRET: ${JWT_SECRET:0:16}..."
echo -e "  DB_PASSWORD: ${DB_PASSWORD:0:8}..."
echo -e "  REDIS_PASSWORD: ${REDIS_PASSWORD:0:8}..."
echo -e "  GRAFANA_PASSWORD: ${GRAFANA_PASSWORD:0:8}..."
echo -e "  VAPID_PUBLIC_KEY: ${VAPID_PUBLIC:0:20}..."
